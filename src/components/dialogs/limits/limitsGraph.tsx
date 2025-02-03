/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { useMemo } from 'react';
import { StackableSeriesType } from '@mui/x-charts/models/seriesType/common';
import { useWatch } from 'react-hook-form';
import { PERMANENT_LIMIT, TEMPORARY_LIMITS } from '../../utils/field-constants';
import { TemporaryLimit } from '../../../services/network-modification-types';

export interface LimitsGraphProps {
    limitsGroupFormName: string;
}

export default function LimitsGraph({ limitsGroupFormName }: Readonly<LimitsGraphProps>) {
    const currentPermanentLimit = useWatch({ name: `${limitsGroupFormName}.${PERMANENT_LIMIT}` });
    const currentTemporaryLimits: TemporaryLimit[] = useWatch({ name: `${limitsGroupFormName}.${TEMPORARY_LIMITS}` });

    const { series, ticks } = useMemo(() => {
        const data = [];

        if (currentPermanentLimit) {
            data.push({ label: 'IST', value: currentPermanentLimit }); //TODO : use traduction
        }

        if (currentTemporaryLimits) {
            console.log('---------currentTemporaryLimits : ', currentTemporaryLimits);
            currentTemporaryLimits
                .filter((field) => {
                    return field.value !== undefined;
                })
                .map((field) =>
                    data.push({
                        label: field.name,
                        value: field.value,
                    })
                );
        }

        const sortedData = [...data].sort((a, b) => a.value - b.value);

        return sortedData.reduce<{ series: StackableSeriesType[]; ticks: number[] }>(
            (acc, item, index) => {
                const previousSum = acc.ticks.length > 0 ? acc.ticks[acc.ticks.length - 1] : 0; // Sum of previous values
                const difference = item.value - previousSum; // Calculate the difference

                let updatedSeries = [
                    ...acc.series,
                    {
                        label: item.label,
                        data: [difference],
                        color: item.label === 'IST' ? 'green' : '#ffe599',
                        stack: 'total',
                    },
                ];
                let updatedTicks = [...acc.ticks, item.value];

                if (index === sortedData.length - 1) {
                    updatedSeries.push({
                        label: 'forbidden',
                        data: [item.value * 0.25],
                        color: 'red',
                        stack: 'total',
                    });
                }
                return {
                    series: updatedSeries,
                    ticks: updatedTicks,
                };
            },
            { series: [], ticks: [] }
        );
    }, [currentPermanentLimit, currentTemporaryLimits]);

    return (
        <BarChart
            margin={{ left: 0, right: 0 }}
            height={140}
            series={series}
            layout="horizontal"
            leftAxis={null}
            bottomAxis={{
                tickInterval: ticks,
                disableLine: true, // Use tickInterval for explicit tick placement
            }}
            sx={{ pointerEvents: 'none' }}
        />
    );
}
