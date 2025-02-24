/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { BarChart } from '@mui/x-charts/BarChart';
import { useCallback, useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { CurrentLimits } from '../../../services/network-modification-types';
import { BarSeriesType } from '@mui/x-charts/models/seriesType/bar';

export interface LimitsGraphProps {
    limitsGroupFormName: string;
}
const colorIST = '#58d058';
const colors: string[] = ['#ffc019', '#e47400', '#cc5500', '#ff5757', '#ff0000'];
const colorForbidden: string = '#b10303';

interface Ticks {
    label: string;
    position: number | null;
    incoherent: boolean;
}

interface ThresholdData {
    label: string;
    tempo: number | null;
    value: number | null;
}

export default function LimitsChart({ limitsGroupFormName }: Readonly<LimitsGraphProps>) {
    const currentLimits: CurrentLimits = useWatch({ name: `${limitsGroupFormName}` });
    const intl = useIntl();

    const formatTempo = useCallback((tempo: number | null) => {
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
        (maxValueIst: number, item: ThresholdData, previousItem?: ThresholdData) => {
            // Incoherent cases :
            //  threshold without tempo that is not ist
            //  threshold with biggest tempo and biggest value
            //  more than one threshold without value
            const isIst =
                (item.label === intl.formatMessage({ id: 'IST' }) && currentLimits.permanentLimit) ||
                (!currentLimits.permanentLimit && !item.tempo);

            const istValue = currentLimits.permanentLimit ? currentLimits.permanentLimit : maxValueIst;

            return (
                ((!item.tempo && currentLimits.permanentLimit && !isIst) ||
                    (!isIst && item.value && item.value < istValue) ||
                    (previousItem && item.tempo && previousItem.tempo && item.tempo > previousItem.tempo) ||
                    (previousItem && !item.tempo && !previousItem.tempo)) ??
                false
            );
        },
        [currentLimits, intl]
    );

    const { series, ticks } = useMemo(() => {
        const data: ThresholdData[] = [];
        let noValueThresholdFound = false;
        let maxValueIst = 0;

        if (currentLimits?.permanentLimit) {
            data.push({
                label: intl.formatMessage({ id: 'IST' }),
                value: currentLimits.permanentLimit,
                tempo: null,
            });
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
            if (!a.value && !b.value && a.tempo && b.tempo) {
                return a.tempo - b.tempo;
            }
            if (!a.value && b.value) {
                return 1;
            }
            if (a.value && b.value) {
                return a.value - b.value;
            }
            return 0;
        });

        const maxValue = Math.max(...data.map((item) => item.value ?? 0));
        let colorIndex = 0;
        let previousSum = 0;

        return data.reduce<{ series: BarSeriesType[]; ticks: Ticks[] }>(
            (acc, item, index) => {
                const isIst =
                    (item.label === intl.formatMessage({ id: 'IST' }) && currentLimits.permanentLimit) ||
                    (!currentLimits.permanentLimit && !item.tempo && item.value === maxValueIst);
                const difference = item.value ? item.value - previousSum : undefined;

                const color =
                    isIst || !item.tempo || (item.tempo && item.value && maxValueIst >= item.value)
                        ? colorIST
                        : colors?.[colorIndex] ?? colors[colors.length - 1];

                const incoherent = isIncoherent(maxValueIst, item, index > 0 ? data[index - 1] : undefined);

                if (item.value && item.value >= maxValueIst) {
                    previousSum = item.value;
                }
                if (item.value && item.value > maxValueIst) {
                    colorIndex++;
                }

                const updatedSeries: BarSeriesType[] =
                    (item.tempo && !item.value) || (item.value && item.value >= maxValueIst)
                        ? [
                              ...acc.series,
                              {
                                  type: 'bar',
                                  label:
                                      isIst || item.value === maxValueIst
                                          ? intl.formatMessage({ id: 'unlimited' })
                                          : formatTempo(item.tempo),
                                  data: [difference ?? maxValue * 0.15],
                                  color: item.value ? color : colorForbidden,
                                  stack: 'total',
                              },
                          ]
                        : [...acc.series];
                const updatedTicks: Ticks[] = [
                    ...acc.ticks,
                    { position: item.value, label: item.label, incoherent: incoherent },
                ];

                if (
                    index === data.length - 1 &&
                    updatedTicks[updatedTicks.length - 1].position &&
                    !noValueThresholdFound
                ) {
                    updatedSeries.push({
                        type: 'bar',
                        label: intl.formatMessage({ id: 'forbidden' }),
                        data: [updatedTicks?.[updatedTicks?.length - 1]?.position ?? 0.0],
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
            xAxis={[
                {
                    tickInterval: [...ticks.map((item) => item.position)],
                    disableLine: true,
                    tickLabelStyle: { fontSize: 10 },
                    id: 'bottomAxis',
                },
                {
                    tickInterval: [...ticks.map((item) => item.position)],
                    tickLabelStyle: { fontSize: 10 },
                    disableLine: true,
                    id: 'topAxis',
                    valueFormatter: (value: Ticks) => value.label,
                },
            ]}
            sx={{ pointerEvents: 'none' }}
        />
    );
}
