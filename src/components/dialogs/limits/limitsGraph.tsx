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
import { useIntl } from 'react-intl';

export interface LimitsGraphProps {
    limitsGroupFormName: string;
}
const colorIST = '#8fce00';
const colors: string[] = ['#ffe599', '#ffd966', '#f1c232', '#e69138', '#cc0000'];
const colorForbidden: string = '#a00722';

export default function LimitsGraph({ limitsGroupFormName }: Readonly<LimitsGraphProps>) {
    const currentPermanentLimit = useWatch({ name: `${limitsGroupFormName}.${PERMANENT_LIMIT}` });
    const currentTemporaryLimits: TemporaryLimit[] = useWatch({ name: `${limitsGroupFormName}.${TEMPORARY_LIMITS}` });
    const intl = useIntl();

    const { series, ticks } = useMemo(() => {
        const data = [];

        if (currentPermanentLimit) {
            data.push({ label: intl.formatMessage({ id: 'IST' }), value: currentPermanentLimit });
        }

        if (currentTemporaryLimits) {
            currentTemporaryLimits
                .filter((field) => field.value && field.name)
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
                const color = item.label === intl.formatMessage({ id: 'IST' }) ? colorIST : colors?.[index];

                const updatedSeries = [
                    ...acc.series,
                    {
                        label: item.label,
                        data: [difference],
                        color: color ?? colors[colors.length - 1],
                        stack: 'total',
                    },
                ];
                const updatedTicks = [...acc.ticks, item.value];

                if (index === sortedData.length - 1) {
                    updatedSeries.push({
                        label: intl.formatMessage({ id: 'forbidden' }),
                        data: [item.value * 0.25],
                        color: colorForbidden,
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
    }, [currentPermanentLimit, currentTemporaryLimits, intl]);

    return (
        <BarChart
            margin={{ left: 0, right: 0 }}
            height={140}
            slotProps={{
                legend: {
                    direction: 'row',
                    position: { vertical: 'bottom', horizontal: 'middle' },
                    padding: 0,
                    itemMarkWidth: 10,
                    itemMarkHeight: 10,
                    labelStyle: {
                        fontSize: 12,
                    },
                },
            }}
            series={
                series.length > 0
                    ? series
                    : [{ label: intl.formatMessage({ id: 'unlimited' }), data: [100], color: colorIST }]
            }
            layout="horizontal"
            leftAxis={null}
            bottomAxis={{
                tickInterval: ticks,
                disableLine: true,
                tickLabelStyle: { fontSize: 10 },
            }}
            sx={{ pointerEvents: 'none' }}
        />
    );
}
