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
import { CurrentLimits, Limit } from '../../../services/network-modification-types';
import { BarSeriesType } from '@mui/x-charts/models/seriesType/bar';
import { AxisValueFormatterContext } from '@mui/x-charts/models/axis';

export interface LimitsGraphProps {
    limitsGroupFormName: string;
}
const colorPermanentLimit = '#58d058';
const colors: string[] = ['#ffc019', '#e47400', '#cc5500', '#ff5757', '#ff0000'];
const colorForbidden: string = '#b10303';

interface Ticks {
    label: string;
    position: number | null;
    incoherent: boolean;
}

const formatTempo = (tempo: number | null) => {
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
};

export default function LimitsChart({ limitsGroupFormName }: Readonly<LimitsGraphProps>) {
    const currentLimits: CurrentLimits = useWatch({ name: `${limitsGroupFormName}` });
    const intl = useIntl();

    const isIncoherent = useCallback(
        (maxValuePermanentLimit: number, item: Limit, previousItem?: Limit) => {
            // Incoherent cases :
            //  threshold without tempo that is not permanent limit when permanent limit exists
            //  threshold with biggest tempo and biggest value than the previous threshold
            //  more than one threshold without value
            const isPermanentLimit =
                (item.name === intl.formatMessage({ id: 'IST' }) && currentLimits.permanentLimit) ||
                (!currentLimits.permanentLimit && !item.acceptableDuration);

            const permanentLimitValue = currentLimits.permanentLimit
                ? currentLimits.permanentLimit
                : maxValuePermanentLimit;

            const itemTempoGreaterThanPrevious: boolean =
                (item?.acceptableDuration &&
                    previousItem?.acceptableDuration &&
                    item.acceptableDuration > previousItem.acceptableDuration) ||
                false;

            const atLeastTwoItemsWithNotempo: boolean =
                (previousItem?.acceptableDuration && !item.acceptableDuration) || false;

            return (
                (!item.acceptableDuration && currentLimits.permanentLimit && !isPermanentLimit) ||
                (!isPermanentLimit && item.value && item.value < permanentLimitValue) ||
                itemTempoGreaterThanPrevious ||
                atLeastTwoItemsWithNotempo ||
                false
            );
        },
        [currentLimits, intl]
    );

    const { series, ticks } = useMemo(() => {
        const thresholds: Limit[] = [];
        let noValueThresholdFound = false;
        let maxValuePermanentLimit: number = 0;

        if (currentLimits?.permanentLimit) {
            thresholds.push({
                name: intl.formatMessage({ id: 'IST' }),
                value: currentLimits.permanentLimit ? +currentLimits.permanentLimit : currentLimits.permanentLimit,
                acceptableDuration: null,
            });
            maxValuePermanentLimit = currentLimits.permanentLimit ?? 0;
        }

        if (currentLimits?.temporaryLimits) {
            currentLimits.temporaryLimits
                .filter((field) => field.name && (field.acceptableDuration || field.value))
                .forEach((field) => {
                    if (!field.value) {
                        noValueThresholdFound = true;
                    }
                    if (!field.acceptableDuration && field.value) {
                        maxValuePermanentLimit = Math.max(maxValuePermanentLimit, field.value);
                    }
                    thresholds.push({
                        name: field.name,
                        value: field.value ? +field.value : field.value,
                        acceptableDuration: field.acceptableDuration,
                    });
                });
        }

        // Sort by value, if no value put at the end
        thresholds.sort((a, b) => {
            if (a.value && !b.value) {
                return -1;
            }
            if (!a.value && !b.value && a.acceptableDuration && b.acceptableDuration) {
                return a.acceptableDuration - b.acceptableDuration;
            }
            if (!a.value && b.value) {
                return 1;
            }
            if (a.value && b.value) {
                return a.value - b.value;
            }
            return 0;
        });

        const maxValue = Math.max(...thresholds.map((item) => item.value ?? 0));
        let colorIndex = 0;
        let previousSum = 0;

        return thresholds.reduce<{ series: BarSeriesType[]; ticks: Ticks[] }>(
            (acc, item, index) => {
                const isPermanentLimit =
                    (item.name === intl.formatMessage({ id: 'IST' }) && currentLimits.permanentLimit) ||
                    (!currentLimits.permanentLimit &&
                        !item.acceptableDuration &&
                        item.value === maxValuePermanentLimit);
                const difference = item.value ? item.value - previousSum : undefined;

                const color =
                    isPermanentLimit ||
                    !item.acceptableDuration ||
                    (item.acceptableDuration && item.value && maxValuePermanentLimit >= item.value)
                        ? colorPermanentLimit
                        : colors?.[colorIndex] ?? colors[colors.length - 1];

                const incoherent = isIncoherent(
                    maxValuePermanentLimit,
                    item,
                    index > 0 ? thresholds[index - 1] : undefined
                );

                if (item.value && item.value >= maxValuePermanentLimit) {
                    previousSum = item.value;
                }
                if (item.value && item.value > maxValuePermanentLimit) {
                    colorIndex++;
                }

                const updatedSeries: BarSeriesType[] =
                    (item.acceptableDuration && !item.value) || (item.value && item.value >= maxValuePermanentLimit)
                        ? [
                              ...acc.series,
                              {
                                  type: 'bar',
                                  label:
                                      isPermanentLimit || item.value === maxValuePermanentLimit
                                          ? intl.formatMessage({ id: 'unlimited' })
                                          : formatTempo(item.acceptableDuration),
                                  data: [difference ?? maxValue * 0.15],
                                  color: item.value ? color : colorForbidden,
                                  stack: 'total',
                              },
                          ]
                        : [...acc.series];
                const updatedTicks: Ticks[] = [
                    ...acc.ticks,
                    { position: item.value, label: item.name, incoherent: incoherent },
                ];

                if (
                    index === thresholds.length - 1 &&
                    updatedTicks[updatedTicks.length - 1].position &&
                    !noValueThresholdFound
                ) {
                    updatedSeries.push({
                        type: 'bar',
                        label: intl.formatMessage({ id: 'forbidden' }),
                        data: [(updatedTicks?.[updatedTicks?.length - 1]?.position ?? 0.0) * 0.15],
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
    }, [currentLimits, intl, isIncoherent]);

    const config = {
        id: 'topAxis',
        valueFormatter: (value: number, context: AxisValueFormatterContext) =>
            ticks.find((item: Ticks) => item.position === value)?.label,
    };

    return (
        <BarChart
            margin={{ left: 0, right: 0, top: 20 }}
            height={110}
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
                    : [{ label: intl.formatMessage({ id: 'unlimited' }), data: [100], color: colorPermanentLimit }]
            }
            layout="horizontal"
            leftAxis={null}
            bottomAxis={{
                tickInterval: [...ticks.map((item) => item.position)],
                disableLine: true,
                tickLabelStyle: { fontSize: 10 },
                position: 'bottom',
            }}
            topAxis={{
                tickInterval: [...ticks.map((item) => item.position)],
                tickLabelStyle: { fontSize: 10 },
                disableLine: true,
                position: 'top',
                ...config,
            }}
            sx={{ pointerEvents: 'none' }}
        />
    );
}
