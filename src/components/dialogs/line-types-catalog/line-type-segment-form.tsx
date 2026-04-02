/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Box, Grid } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    AREA,
    FINAL_CURRENT_LIMITS,
    SEGMENT_CURRENT_LIMITS,
    SEGMENT_DISTANCE_VALUE,
    SEGMENT_REACTANCE,
    SEGMENT_RESISTANCE,
    SEGMENT_SUSCEPTANCE,
    SEGMENT_TYPE_ID,
    SEGMENT_TYPE_VALUE,
    SEGMENTS,
    SHAPE_FACTOR,
    TEMPERATURE,
    TOTAL_REACTANCE,
    TOTAL_RESISTANCE,
    TOTAL_SUSCEPTANCE,
} from '../../utils/field-constants';
import LineTypesCatalogSelectorDialog from './line-types-catalog-selector-dialog';
import { roundToDefaultPrecision } from '../../../utils/rounding';
import LineTypeSegmentCreation from './line-type-segment-creation';
import { calculateReactance, calculateResistance, calculateSusceptance } from '../../utils/utils';
import {
    CustomAGGrid,
    DefaultCellRenderer,
    ExpandableInput,
    ExpandableInputHandle,
    fetchStudyMetadata,
    type MuiStyles,
    ReadOnlyInput,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { getLineTypesCatalog, getLineTypeWithLimits } from '../../../services/network-modification';
import GridItem from '../commons/grid-item';
import {
    AreaTemperatureShapeFactorInfo,
    CurrentLimitsInfo,
    LimitSelectedRowData,
    LineTypeInfo,
} from './line-catalog.type';
import { emptyLineSegment, SegmentFormData } from './segment-utils';
import { ColDef } from 'ag-grid-community';
import GridSection from '../commons/grid-section';
import { LineSegmentInfos } from '../../../services/network-modification-types';

const styles = {
    h3: {
        marginTop: 0,
        marginBottom: 0,
    },
    header: {
        fontWeight: 'bold',
    },
    headerJustifyEnd: {
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'end',
    },
} as const satisfies MuiStyles;

export interface LineTypeSegmentFormProps {
    editData?: LineSegmentInfos[];
}

export function LineTypeSegmentForm({ editData }: Readonly<LineTypeSegmentFormProps>) {
    const { setValue, getValues, clearErrors } = useFormContext();
    const [lineTypesCatalog, setLineTypesCatalog] = useState<LineTypeInfo[]>([]);
    const [openCatalogDialogIndex, setOpenCatalogDialogIndex] = useState<number | null>(null);
    const { snackError } = useSnackMessage();
    const intl = useIntl();
    const [currentLimitResult, setCurrentLimitResult] = useState<CurrentLimitsInfo[]>([]);
    const [limitsColumnDefs, setLimitsColumnDefs] = useState<ColDef[]>([]);
    const arrayRef = useRef<ExpandableInputHandle>(null);

    // Fetches the lineTypes catalog on startup
    useEffect(() => {
        getLineTypesCatalog()
            .then((values: LineTypeInfo[]) => {
                setLineTypesCatalog(values);
            })
            .catch((error) =>
                snackWithFallback(snackError, error, {
                    headerId: 'LineTypesCatalogFetchingError',
                })
            );
    }, [snackError]);

    const updateSegmentValues = useCallback(
        (index: number) => {
            const distance = getValues(`${SEGMENTS}.${index}.${SEGMENT_DISTANCE_VALUE}`);
            const typeId = getValues(`${SEGMENTS}.${index}.${SEGMENT_TYPE_ID}`);

            const entryFromCatalog = lineTypesCatalog?.find((entry) => entry.id === typeId);

            const newResistance = roundToDefaultPrecision(
                calculateResistance(distance, entryFromCatalog?.linearResistance ?? 0)
            );
            const newReactance = roundToDefaultPrecision(
                calculateReactance(distance, entryFromCatalog?.linearReactance ?? 0)
            );
            const newSusceptance = roundToDefaultPrecision(
                calculateSusceptance(distance, entryFromCatalog?.linearCapacity ?? 0)
            );

            setValue(`${SEGMENTS}.${index}.${SEGMENT_RESISTANCE}`, newResistance);
            setValue(`${SEGMENTS}.${index}.${SEGMENT_REACTANCE}`, newReactance);
            setValue(`${SEGMENTS}.${index}.${SEGMENT_SUSCEPTANCE}`, newSusceptance);
        },
        [getValues, setValue, lineTypesCatalog]
    );

    const updateTotals = useCallback(() => {
        const segments: SegmentFormData[] = getValues(SEGMENTS);
        const totalResistance = segments.reduce(
            (accum: number, item: SegmentFormData) => accum + (item[SEGMENT_RESISTANCE] ?? 0),
            0
        );
        const totalReactance = segments.reduce(
            (accum: number, item: SegmentFormData) => accum + (item[SEGMENT_REACTANCE] ?? 0),
            0
        );
        const totalSusceptance = segments.reduce(
            (accum: number, item: SegmentFormData) => accum + (item[SEGMENT_SUSCEPTANCE] ?? 0),
            0
        );
        setValue(TOTAL_RESISTANCE, roundToDefaultPrecision(totalResistance));
        setValue(TOTAL_REACTANCE, roundToDefaultPrecision(totalReactance));
        setValue(TOTAL_SUSCEPTANCE, roundToDefaultPrecision(totalSusceptance));
    }, [getValues, setValue]);

    const onCatalogDialogClose = () => {
        setOpenCatalogDialogIndex(null);
    };

    const openCatalogDialog = (index: number) => {
        setOpenCatalogDialogIndex(index);
    };

    const keepMostConstrainingLimits = useCallback(() => {
        const segments: SegmentFormData[] = getValues(SEGMENTS);
        const mostContrainingLimits = new Map<string, CurrentLimitsInfo>();
        segments.forEach((segment) => {
            segment[SEGMENT_CURRENT_LIMITS]?.forEach((limit: CurrentLimitsInfo) => {
                if (mostContrainingLimits.has(limit.limitSetName)) {
                    let computedLimit: CurrentLimitsInfo | undefined = mostContrainingLimits.get(limit.limitSetName);
                    if (computedLimit !== undefined && computedLimit.temporaryLimits !== null) {
                        limit.temporaryLimits.forEach((temporaryLimit) => {
                            const foundTemporaryLimit = computedLimit?.temporaryLimits.find(
                                (temporaryLimitData) => temporaryLimitData.name === temporaryLimit.name
                            );
                            if (foundTemporaryLimit === undefined) {
                                computedLimit?.temporaryLimits.push(temporaryLimit);
                            } else if (temporaryLimit.limitValue === null) {
                                foundTemporaryLimit.limitValue = temporaryLimit.limitValue;
                            } else {
                                foundTemporaryLimit.limitValue = Math.min(
                                    foundTemporaryLimit.limitValue,
                                    temporaryLimit.limitValue
                                );
                            }
                        });
                        computedLimit.permanentLimit = Math.min(computedLimit.permanentLimit, limit.permanentLimit);
                    }
                } else {
                    // need deep copy else segment[SEGMENT_CURRENT_LIMITS] will be modified with computedLimit
                    mostContrainingLimits.set(limit.limitSetName, structuredClone(limit));
                }
            });
        });
        setCurrentLimitResult(Array.from(mostContrainingLimits.values()));
        setValue(FINAL_CURRENT_LIMITS, Array.from(mostContrainingLimits.values()));
    }, [getValues, setValue, setCurrentLimitResult]);

    const updateSegmentLimitsValues = useCallback(
        (index: number, limitInfo: CurrentLimitsInfo[]) => {
            setValue(`${SEGMENTS}.${index}.${SEGMENT_CURRENT_LIMITS}`, limitInfo);
        },
        [setValue]
    );

    const appendSegmentsLimits = useCallback(
        (segment: LineSegmentInfos) => {
            getLineTypeWithLimits(
                segment[SEGMENT_TYPE_ID],
                segment[AREA],
                segment[TEMPERATURE],
                segment[SHAPE_FACTOR]
            ).then((lineTypeWithLimits) => {
                const newResistance = roundToDefaultPrecision(
                    calculateResistance(segment[SEGMENT_DISTANCE_VALUE], lineTypeWithLimits?.linearResistance ?? 0)
                );
                const newReactance = roundToDefaultPrecision(
                    calculateReactance(segment[SEGMENT_DISTANCE_VALUE], lineTypeWithLimits?.linearReactance ?? 0)
                );
                const newSusceptance = roundToDefaultPrecision(
                    calculateSusceptance(segment[SEGMENT_DISTANCE_VALUE], lineTypeWithLimits?.linearCapacity ?? 0)
                );
                arrayRef?.current?.appendItem({
                    ...emptyLineSegment,
                    [SEGMENT_TYPE_ID]: segment[SEGMENT_TYPE_ID],
                    [SEGMENT_TYPE_VALUE]: lineTypeWithLimits?.type ?? '',
                    [AREA]: segment[AREA],
                    [TEMPERATURE]: segment[TEMPERATURE],
                    [SHAPE_FACTOR]: segment[SHAPE_FACTOR],
                    [SEGMENT_DISTANCE_VALUE]: segment[SEGMENT_DISTANCE_VALUE],
                    [SEGMENT_RESISTANCE]: newResistance,
                    [SEGMENT_REACTANCE]: newReactance,
                    [SEGMENT_SUSCEPTANCE]: newSusceptance,
                    [SEGMENT_CURRENT_LIMITS]: lineTypeWithLimits?.limitsForLineType ?? [],
                });
                updateTotals();
                keepMostConstrainingLimits();
            });
        },
        [keepMostConstrainingLimits, updateTotals]
    );

    useEffect(() => {
        if (!editData || editData.length === 0) {
            return;
        }
        arrayRef.current?.replaceItems([]);
        editData.forEach((segment) => {
            appendSegmentsLimits(segment);
        });
    }, [editData, appendSegmentsLimits]);

    const onSelectCatalogLine = useCallback(
        (selectedLine: LineTypeInfo, selectedAreaAndTemperature2LineTypeData: AreaTemperatureShapeFactorInfo) => {
            getLineTypeWithLimits(
                selectedLine.id,
                selectedAreaAndTemperature2LineTypeData?.area,
                selectedAreaAndTemperature2LineTypeData?.temperature,
                selectedAreaAndTemperature2LineTypeData?.shapeFactor
            )
                .then((lineTypeWithLimits) => {
                    if (lineTypeWithLimits && openCatalogDialogIndex !== null) {
                        const selectedType = lineTypeWithLimits.type ?? '';
                        const selectedTypeId = lineTypeWithLimits.id ?? '';
                        setValue(`${SEGMENTS}.${openCatalogDialogIndex}.${SEGMENT_TYPE_VALUE}`, selectedType);
                        setValue(`${SEGMENTS}.${openCatalogDialogIndex}.${SEGMENT_TYPE_ID}`, selectedTypeId);
                        setValue(
                            `${SEGMENTS}.${openCatalogDialogIndex}.${AREA}`,
                            selectedAreaAndTemperature2LineTypeData?.area
                        );
                        setValue(
                            `${SEGMENTS}.${openCatalogDialogIndex}.${TEMPERATURE}`,
                            selectedAreaAndTemperature2LineTypeData?.temperature
                        );
                        setValue(
                            `${SEGMENTS}.${openCatalogDialogIndex}.${SHAPE_FACTOR}`,
                            selectedAreaAndTemperature2LineTypeData?.shapeFactor
                        );
                        clearErrors(`${SEGMENTS}.${openCatalogDialogIndex}.${SEGMENT_TYPE_VALUE}`);
                        updateSegmentValues(openCatalogDialogIndex);
                        updateSegmentLimitsValues(openCatalogDialogIndex, lineTypeWithLimits.limitsForLineType);
                        updateTotals();
                        keepMostConstrainingLimits();
                    }
                })
                .catch((error) =>
                    snackWithFallback(snackError, error, {
                        headerId: 'LineTypesCatalogFetchingError',
                    })
                );
        },
        [
            updateSegmentValues,
            updateTotals,
            setValue,
            clearErrors,
            openCatalogDialogIndex,
            updateSegmentLimitsValues,
            keepMostConstrainingLimits,
            snackError,
        ]
    );

    const handleSegmentDistantChange = useCallback(
        (index: number) => {
            updateSegmentValues(index);
            updateTotals();
        },
        [updateSegmentValues, updateTotals]
    );

    const handleSegmentDelete = useCallback(
        (index: number) => {
            // Forces the values to zero juste before deleting the row.
            // We have to do this because the line deletion is trigger after this
            // function's return.
            setValue(`${SEGMENTS}.${index}.${SEGMENT_RESISTANCE}`, 0);
            setValue(`${SEGMENTS}.${index}.${SEGMENT_REACTANCE}`, 0);
            setValue(`${SEGMENTS}.${index}.${SEGMENT_SUSCEPTANCE}`, 0);
            updateTotals();
            setValue(`${SEGMENTS}.${index}.${SEGMENT_CURRENT_LIMITS}`, []);
            keepMostConstrainingLimits();
            return true; // Needed to remove the line in ExpandableInput
        },
        [setValue, updateTotals, keepMostConstrainingLimits]
    );

    const getPreselectedRowData = useCallback(
        (index: number) => {
            return {
                id: getValues(`${SEGMENTS}.${index}.${SEGMENT_TYPE_ID}`),
                temperature: getValues(`${SEGMENTS}.${index}.${TEMPERATURE}`),
                area: getValues(`${SEGMENTS}.${index}.${AREA}`),
                shapeFactor: getValues(`${SEGMENTS}.${index}.${SHAPE_FACTOR}`),
            };
        },
        [getValues]
    );

    const segmentTypeHeader = (
        <Box sx={styles.header}>
            <FormattedMessage id={'lineTypes.type'} />
        </Box>
    );

    const segmentResistanceHeader = (
        <Box sx={styles.headerJustifyEnd}>
            <FormattedMessage id={'lineTypes.resistanceLabel'} />
        </Box>
    );

    const segmentReactanceHeader = (
        <Box sx={styles.headerJustifyEnd}>
            <FormattedMessage id={'lineTypes.reactanceLabel'} />
        </Box>
    );

    const segmentSusceptanceHeader = (
        <Box sx={styles.headerJustifyEnd}>
            <FormattedMessage id={'lineTypes.susceptanceLabel'} />
        </Box>
    );

    const totalResistanceField = <ReadOnlyInput isNumerical name={TOTAL_RESISTANCE} />;

    const totalReactanceField = <ReadOnlyInput isNumerical name={TOTAL_REACTANCE} />;

    const totalSusceptanceField = <ReadOnlyInput isNumerical name={TOTAL_SUSCEPTANCE} />;

    const limitsDefaultColDef: ColDef = useMemo(
        () => ({
            sortable: false,
            resizable: false,
            wrapHeaderText: true,
            editable: false,
            headerClass: 'centered-header',
            suppressMovable: true,
            autoHeaderHeight: true,
            lockPinned: true,
            flex: 1,
        }),
        []
    );

    useMemo((): void => {
        let base: ColDef[] = [
            {
                headerName: intl.formatMessage({ id: 'lineTypes.currentLimits.limitSet' }),
                field: 'limitSetName',
                pinned: 'left',
                cellRenderer: DefaultCellRenderer,
            },
            {
                headerName: intl.formatMessage({ id: 'lineTypes.currentLimits.Permanent' }),
                field: 'permanentLimit',
                cellRenderer: DefaultCellRenderer,
            },
        ];
        let limitNamesSet = new Set<string>();
        currentLimitResult.forEach((limit) => {
            limit.temporaryLimits?.forEach((temporaryLimit) => {
                limitNamesSet.add(temporaryLimit.name);
            });
        });
        fetchStudyMetadata().then((studyMetadata) => {
            manageHeader(base, limitNamesSet, studyMetadata?.temporaryLimitsNamesForCatalog);
        });
    }, [intl, currentLimitResult]);

    const manageHeader = (base: ColDef[], limitNamesSet: Set<string>, temporaryLimitsNamesForCatalog?: string[]) => {
        // metadata order makes order of temporary limits columns
        if (temporaryLimitsNamesForCatalog) {
            temporaryLimitsNamesForCatalog.forEach((limitName) => {
                if (limitNamesSet.has(limitName)) {
                    base.push({
                        headerName: `${limitName} [A]`,
                        field: limitName,
                        cellRenderer: DefaultCellRenderer,
                    });
                }
            });
            // limits that are in catalog and not in metadata are added at the end
            limitNamesSet.forEach((limitName) => {
                if (!temporaryLimitsNamesForCatalog.includes(limitName)) {
                    base.push({
                        headerName: `${limitName} [A]`,
                        field: limitName,
                        cellRenderer: DefaultCellRenderer,
                    });
                }
            });
        } else {
            // no metadata, all limits are added (no order)
            limitNamesSet.forEach((limitName) => {
                base.push({
                    headerName: `${limitName} [A]`,
                    field: limitName,
                    cellRenderer: DefaultCellRenderer,
                });
            });
        }
        setLimitsColumnDefs(base);
    };

    const rowData = useMemo(() => {
        const finalDataArray: LimitSelectedRowData[] = [];
        currentLimitResult.forEach((currentLimit) => {
            const limitData: LimitSelectedRowData = {
                limitSetName: currentLimit.limitSetName,
                permanentLimit: currentLimit.permanentLimit,
            };
            currentLimit.temporaryLimits.forEach((temporaryLimit) => {
                limitData[temporaryLimit.name] = temporaryLimit.limitValue;
            });
            finalDataArray.push(limitData);
        });
        return finalDataArray;
    }, [currentLimitResult]);

    return (
        <>
            <Grid container spacing={2}>
                <GridItem size={2}>{<div />}</GridItem>
                <GridItem size={3}>{segmentTypeHeader}</GridItem>
                <GridItem size={2}>{segmentResistanceHeader}</GridItem>
                <GridItem size={2}>{segmentReactanceHeader}</GridItem>
                <GridItem size={2}>{segmentSusceptanceHeader}</GridItem>
                <GridItem size={1}>{<div />}</GridItem>
            </Grid>
            <ExpandableInput
                ref={arrayRef}
                name={SEGMENTS}
                Field={LineTypeSegmentCreation}
                fieldProps={{
                    onSegmentDistanceChange: (index: number) => handleSegmentDistantChange(index),
                    onEditButtonClick: (index: number) => openCatalogDialog(index),
                }}
                addButtonLabel={'AddSegment'}
                initialValue={emptyLineSegment}
                deleteCallback={handleSegmentDelete}
                alignItems="center"
            />
            <hr />
            <Grid container spacing={2}>
                <GridItem size={5}>{<div />}</GridItem>
                <GridItem size={2}>{totalResistanceField}</GridItem>
                <GridItem size={2}>{totalReactanceField}</GridItem>
                <GridItem size={2}>{totalSusceptanceField}</GridItem>
                <GridItem size={1}>{<div />}</GridItem>
            </Grid>
            <GridSection title="lineTypes.currentLimits.limitSets" customStyle={styles.h3} />
            <Grid container sx={{ height: '100%' }} direction="column">
                <CustomAGGrid
                    rowData={rowData}
                    defaultColDef={limitsDefaultColDef}
                    columnDefs={limitsColumnDefs}
                    domLayout="autoHeight"
                />
            </Grid>

            {openCatalogDialogIndex !== null && (
                <LineTypesCatalogSelectorDialog
                    onClose={onCatalogDialogClose}
                    rowData={lineTypesCatalog}
                    onSelectLine={onSelectCatalogLine}
                    preselectedParams={getPreselectedRowData(openCatalogDialogIndex)}
                />
            )}
        </>
    );
}
