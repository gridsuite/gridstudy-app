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
const colorIST = '#58d058';
const colors: string[] = ['#ffc019', '#e47400', '#cc5500', '#ff5757', '#ff0000'];
const colorForbidden: string = '#b10303';

export default function LimitsChart({ limitsGroupFormName }: Readonly<LimitsGraphProps>) {
    const currentPermanentLimit = useWatch({ name: `${limitsGroupFormName}.${PERMANENT_LIMIT}` });
    const currentTemporaryLimits: TemporaryLimit[] = useWatch({ name: `${limitsGroupFormName}.${TEMPORARY_LIMITS}` });
    const intl = useIntl();

    const { series, ticks } = useMemo(() => {
        const data = [];
        let istPresent = false;

        if (currentPermanentLimit) {
            data.push({ label: intl.formatMessage({ id: 'IST' }), value: currentPermanentLimit });
            istPresent = true;
        }

        if (currentTemporaryLimits) {
            currentTemporaryLimits
                .filter((field) => field.value && field.name)
                .forEach((field) =>
                    data.push({
                        label: field.name,
                        value: field.value,
                    })
                );
        }

        data.sort((a, b) => a.value - b.value);

        return data.reduce<{ series: StackableSeriesType[]; ticks: number[] }>(
            (acc, item, index) => {
                const previousSum = acc.ticks.length > 0 ? acc.ticks[acc.ticks.length - 1] : 0; // Sum of previous values
                const difference = item.value - previousSum; // Calculate the difference
                const colorIndex = istPresent && index > 0 ? index - 1 : index;
                const color = item.label === intl.formatMessage({ id: 'IST' }) ? colorIST : colors?.[colorIndex];

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

                if (index === data.length - 1) {
                    updatedSeries.push({
                        label: intl.formatMessage({ id: 'forbidden' }),
                        data: [item.value * 0.15],
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
