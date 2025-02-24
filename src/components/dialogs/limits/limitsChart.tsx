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

interface Ticks {
    label: string;
    position: number;
    incoherent: boolean;
}

interface ThresholdData {
    label: string;
    tempo: number | undefined;
    value: number | undefined;
}

export default function LimitsChart({ limitsGroupFormName }: Readonly<LimitsGraphProps>) {
    const currentLimits: CurrentLimits = useWatch({ name: `${limitsGroupFormName}` });
    const intl = useIntl();

    const formatTempo = useCallback((tempo: number) => {
        if (!tempo) {
            return '';
        }
        const min = Math.floor(tempo / 60);
        const sec = tempo % 60;
        if (min > 0 && sec === 0) {
            return `${min}min`;
        }
        if (min === 0 && sec > 0) {
            return `${sec}s`;
        }
        return `${min}min${sec}s`;
    }, []);

    const isIncoherent = useCallback(
        (item: ThresholdData, previousItem?: ThresholdData) => {
            // Incoherent cases :
            //  threshold without tempo that is not ist
            //  threshold with biggest tempo and biggest value
            //  more than one threshold without value
            const isIst =
                (item.label === intl.formatMessage({ id: 'IST' }) && currentLimits.permanentLimit) ||
                (!currentLimits.permanentLimit && !item.tempo);

            return (
                ((!item.tempo && currentLimits.permanentLimit && !isIst) ||
                    (!isIst && item.value < currentLimits.permanentLimit) ||
                    (previousItem && item.tempo > previousItem.tempo) ||
                    (previousItem && !item.tempo && !previousItem.tempo)) ??
                false
            );
        },
        [currentLimits, intl]
    );

    const { series, ticks } = useMemo(() => {
        const data = [];
        let noValueThresholdFound = false;
        let maxValueIst = 0;

        if (currentLimits?.permanentLimit) {
            data.push({ label: intl.formatMessage({ id: 'IST' }), value: currentLimits.permanentLimit });
            maxValueIst = currentLimits.permanentLimit;
        }

        if (currentLimits?.temporaryLimits) {
            currentLimits.temporaryLimits
                .filter((field) => field.name && (field.acceptableDuration || field.value))
                .forEach((field) => {
                    if (!field.value) {
                        noValueThresholdFound = true;
                    }
                    if (!field.acceptableDuration && field.value) {
                        maxValueIst = Math.max(maxValueIst, field.value);
                    }
                    data.push({
                        label: field.name,
                        value: field.value,
                        tempo: field.acceptableDuration,
                    });
                });
        }

        // Sort by value, if no value put at the end
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

        const maxValue = Math.max(...data.map((item) => item.value));
        let colorIndex = 0;
        let previousSum = 0;

        return data.reduce<{ series: StackableSeriesType[]; ticks: Ticks[] }>(
            (acc, item, index) => {
                const itemValue = parseFloat(item.value);
                const isIst =
                    (item.label === intl.formatMessage({ id: 'IST' }) && currentLimits.permanentLimit) ||
                    (!currentLimits.permanentLimit && !item.tempo && itemValue === maxValueIst);
                let difference = item.value ? item.value - previousSum : undefined;

                const color =
                    isIst || !item.tempo || (item.tempo && currentLimits.permanentLimit > itemValue)
                        ? colorIST
                        : colors?.[colorIndex] ?? colors[colors.length - 1];

                const incoherent: boolean = isIncoherent(item, index > 0 ? data[index - 1] : undefined);

                if (itemValue >= maxValueIst) {
                    previousSum = itemValue;
                }
                if (itemValue > maxValueIst) {
                    colorIndex++;
                }

                console.log('isIST : ', isIst);
                console.log('maxValueISt : ', maxValueIst);
                console.log('itemValue : ', itemValue);

                const updatedSeries =
                    (item.tempo && !itemValue) || parseFloat(item.value) >= maxValueIst
                        ? [
                              ...acc.series,
                              {
                                  label:
                                      isIst || itemValue === maxValueIst
                                          ? intl.formatMessage({ id: 'unlimited' })
                                          : formatTempo(item.tempo),
                                  data: [difference ?? maxValue * 0.15],
                                  color: item.value ? color : colorForbidden,
                                  stack: 'total',
                              },
                          ]
                        : [...acc.series];
                const updatedTicks = [
                    ...acc.ticks,
                    { position: item.value, label: item.label, incoherent: incoherent },
                ];

                if (index === data.length - 1 && !noValueThresholdFound) {
                    updatedSeries.push({
                        label: intl.formatMessage({ id: 'forbidden' }),
                        data: [updatedTicks[updatedTicks.length - 1].position * 0.15],
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
    }, [currentLimits, intl, formatTempo, isIncoherent]);

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
                tickInterval: [...ticks.map((item) => item.position)],
                disableLine: true,
                tickLabelStyle: { fontSize: 10 },
            }}
            topAxis={{
                tickInterval: [...ticks.map((item) => item.position)],
                tickLabelStyle: { fontSize: 10 },
                disableLine: true,
                valueFormatter: (value) => ticks.find((item) => item.position === value)?.label,
            }}
            sx={{ pointerEvents: 'none' }}
        />
    );
}
