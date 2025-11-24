/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Box, Grid } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { ExpandableInput } from '../../utils/rhf-inputs/expandable-input';
import { ReadOnlyInput } from '../../utils/rhf-inputs/read-only/read-only-input';
import {
    FINAL_CURRENT_LIMITS,
    SEGMENT_CURRENT_LIMITS,
    SEGMENT_DISTANCE_VALUE,
    SEGMENT_REACTANCE,
    SEGMENT_RESISTANCE,
    SEGMENT_SUSCEPTANCE,
    SEGMENT_TYPE_ID,
    SEGMENT_TYPE_VALUE,
    SEGMENTS,
    TOTAL_REACTANCE,
    TOTAL_RESISTANCE,
    TOTAL_SUSCEPTANCE,
} from '../../utils/field-constants';
import LineTypesCatalogSelectorDialog from './line-types-catalog-selector-dialog';
import { roundToDefaultPrecision } from '@gridsuite/commons-ui';
import LineTypeSegmentCreation from './line-type-segment-creation';
import { calculateReactance, calculateResistance, calculateSusceptance } from '../../utils/utils';
import {
    CustomAGGrid,
    DefaultCellRenderer,
    type MuiStyles,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { getLineTypesCatalog } from '../../../services/network-modification';
import GridItem from '../commons/grid-item';
import { CurrentLimitsInfo, LineTypeInfo } from './line-catalog.type';
import { emptyLineSegment, SegmentFormData } from './segment-utils';
import { ColDef } from 'ag-grid-community';
import GridSection from '../commons/grid-section';

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

export const LineTypeSegmentForm = () => {
    const { setValue, getValues, clearErrors } = useFormContext();
    const [lineTypesCatalog, setLineTypesCatalog] = useState<LineTypeInfo[]>([]);
    const [openCatalogDialogIndex, setOpenCatalogDialogIndex] = useState<number | null>(null);
    const { snackError } = useSnackMessage();
    const intl = useIntl();
    const [currentLimitResult, setCurrentLimitResult] = useState<CurrentLimitsInfo[]>([]);

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

    const updateSegmentLimitsValues = useCallback(
        (index: number) => {
            const typeId = getValues(`${SEGMENTS}.${index}.${SEGMENT_TYPE_ID}`);
            const entryFromCatalog = lineTypesCatalog?.find((entry) => entry.id === typeId);
            setValue(`${SEGMENTS}.${index}.${SEGMENT_CURRENT_LIMITS}`, entryFromCatalog?.limitsForLineType);
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
        const computedLimits = new Map<string, CurrentLimitsInfo>();
        segments.forEach((segment) => {
            segment[SEGMENT_CURRENT_LIMITS]?.forEach((limit: CurrentLimitsInfo) => {
                if (computedLimits.has(limit.limitSetName)) {
                    let computedLimit: CurrentLimitsInfo | undefined = computedLimits.get(limit.limitSetName);
                    if (computedLimit !== undefined) {
                        if (limit?.temporaryLimitValue != null) {
                            if (computedLimit.temporaryLimitValue == null) {
                                computedLimit.temporaryLimitValue = limit.temporaryLimitValue;
                                computedLimit.temporaryLimitName = limit.temporaryLimitName;
                                computedLimit.temporaryLimitAcceptableDuration = limit.temporaryLimitAcceptableDuration;
                            } else {
                                let temporaryLimitValue = Math.min(
                                    computedLimit.temporaryLimitValue,
                                    limit.temporaryLimitValue
                                );
                                if (temporaryLimitValue === limit.temporaryLimitValue) {
                                    computedLimit.temporaryLimitValue = limit.temporaryLimitValue;
                                    computedLimit.temporaryLimitAcceptableDuration =
                                        limit.temporaryLimitAcceptableDuration;
                                    computedLimit.temporaryLimitName = limit.temporaryLimitName;
                                }
                            }
                        }
                        computedLimit.permanentLimit = Math.min(computedLimit.permanentLimit, limit.permanentLimit);
                    }
                } else {
                    computedLimits.set(limit.limitSetName, limit);
                }
            });
        });
        setCurrentLimitResult(Array.from(computedLimits.values()));
        setValue(FINAL_CURRENT_LIMITS, Array.from(computedLimits.values()));
    }, [getValues, setValue, setCurrentLimitResult]);

    const onSelectCatalogLine = useCallback(
        (selectedLine: LineTypeInfo) => {
            if (selectedLine && openCatalogDialogIndex !== null) {
                const selectedType = selectedLine.type ?? '';
                const selectedTypeId = selectedLine.id ?? '';
                setValue(`${SEGMENTS}.${openCatalogDialogIndex}.${SEGMENT_TYPE_VALUE}`, selectedType);
                setValue(`${SEGMENTS}.${openCatalogDialogIndex}.${SEGMENT_TYPE_ID}`, selectedTypeId);
                clearErrors(`${SEGMENTS}.${openCatalogDialogIndex}.${SEGMENT_TYPE_VALUE}`);
                updateSegmentValues(openCatalogDialogIndex);
                updateSegmentLimitsValues(openCatalogDialogIndex);
                updateTotals();
                keepMostConstrainingLimits();
            }
        },
        [
            updateSegmentValues,
            updateTotals,
            setValue,
            clearErrors,
            openCatalogDialogIndex,
            updateSegmentLimitsValues,
            keepMostConstrainingLimits,
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

    const getPreselectedRowIdForCatalog = useCallback(
        (index: number) => {
            return getValues(`${SEGMENTS}.${index}.${SEGMENT_TYPE_ID}`);
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

    const limitsColumnDefs = useMemo((): ColDef[] => {
        return [
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
            {
                headerName: intl.formatMessage({ id: 'lineTypes.currentLimits.Temporary' }),
                field: 'temporaryLimitValue',
                cellRenderer: DefaultCellRenderer,
            },
        ];
    }, [intl]);

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
                    rowData={currentLimitResult}
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
                    preselectedRowId={getPreselectedRowIdForCatalog(openCatalogDialogIndex)}
                />
            )}
        </>
    );
};
