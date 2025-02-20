/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { BarChart } from '@mui/x-charts/BarChart';
import { useCallback, useMemo } from 'react';
import { StackableSeriesType } from '@mui/x-charts/models/seriesType/common';
import { useWatch } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { CurrentLimits } from '../../../services/network-modification-types';

export interface LimitsGraphProps {
    limitsGroupFormName: string;
}
const colorIST = '#58d058';
const colors: string[] = ['#ffc019', '#e47400', '#cc5500', '#ff5757', '#ff0000'];
const colorForbidden: string = '#b10303';

export default function LimitsChart({ limitsGroupFormName }: Readonly<LimitsGraphProps>) {
    const currentLimits: CurrentLimits = useWatch({ name: `${limitsGroupFormName}` });
    const intl = useIntl();

    const formatTempo = useCallback((tempo: number) => {
        const min = Math.floor(tempo / 60);
        const sec = tempo % 60;

        if (min > 0 && sec > 0) {
            return `${min}min${sec}s`;
        }
        if (min > 0 && sec === 0) {
            return `${min}min`;
        }
        if (min === 0 && sec > 0) {
            return `${sec}s`;
        }
    }, []);

    const { series, ticks } = useMemo(() => {
        const data = [];
        let istPresent = false;

        if (currentLimits?.permanentLimit) {
            data.push({ label: intl.formatMessage({ id: 'IST' }), value: currentLimits.permanentLimit });
            istPresent = true;
        }

        if (currentLimits?.temporaryLimits) {
            currentLimits.temporaryLimits
                .filter((field) => field.name && field.acceptableDuration)
                .forEach((field) =>
                    data.push({
                        label: field.name,
                        value: field.value,
                        tempo: field.acceptableDuration,
                    })
                );
        }

        data.sort((a, b) => {
            if (a.value && !b.value) {
                return -1;
            }
            if (!a.value && !b.value) {
                return a.tempo - b.tempo;
            }
            if (!a.value && b.value) {
                return 1;
            }
            return a.value - b.value;
        });

        return data.reduce<{ series: StackableSeriesType[]; ticks: number[] }>(
            (acc, item, index) => {
                const previousSum = acc.ticks.length > 0 ? acc.ticks[acc.ticks.length - 1] : 0; // Sum of previous values
                const difference = item.value ? item.value - previousSum : undefined; // Calculate the difference
                const colorIndex = istPresent && index > 0 ? index - 1 : index;
                const isIst = item.label === intl.formatMessage({ id: 'IST' });
                const color = isIst ? colorIST : colors?.[colorIndex];

                const updatedSeries = [
                    ...acc.series,
                    {
                        label: isIst ? intl.formatMessage({ id: 'unlimited' }) : formatTempo(item.tempo),
                        data: [difference],
                        color: !difference ? colorForbidden : color ?? colors[colors.length - 1],
                        stack: 'total',
                    },
                ];
                const updatedTicks = item.value ? [...acc.ticks, item.value] : [...acc.ticks];

                if (index === data.length - 1) {
                    updatedSeries.push({
                        label: intl.formatMessage({ id: 'forbidden' }),
                        data: [updatedTicks[updatedTicks.length - 1] * 0.15],
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
    }, [currentLimits?.permanentLimit, currentLimits?.temporaryLimits, intl, formatTempo]);

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
