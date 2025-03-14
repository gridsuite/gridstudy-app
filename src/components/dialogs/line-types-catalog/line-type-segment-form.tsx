/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Box, Grid } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { ExpandableInput } from '../../utils/rhf-inputs/expandable-input';
import { ReadOnlyInput } from '../../utils/rhf-inputs/read-only/read-only-input';
import {
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
import { roundToDefaultPrecision } from '../../../utils/rounding';
import LineTypeSegmentCreation from './line-type-segment-creation';
import { calculateReactance, calculateResistance, calculateSusceptance } from '../../utils/utils';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { getLineTypesCatalog } from '../../../services/network-modification';
import GridItem from '../commons/grid-item';
import { LineTypeInfo } from './line-catalog.type';
import { emptyLineSegment, SegmentFormData } from './segment-utils';

const styles = {
    header: {
        fontWeight: 'bold',
    },
    headerJustifyEnd: {
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'end',
    },
};

export const LineTypeSegmentForm = () => {
    const { setValue, getValues, clearErrors } = useFormContext();
    const [lineTypesCatalog, setLineTypesCatalog] = useState<LineTypeInfo[]>([]);
    const [openCatalogDialogIndex, setOpenCatalogDialogIndex] = useState<number | null>(null);
    const { snackError } = useSnackMessage();

    // Fetches the lineTypes catalog on startup
    useEffect(() => {
        getLineTypesCatalog()
            .then((values: LineTypeInfo[]) => {
                setLineTypesCatalog(values);
            })
            .catch((error) =>
                snackError({
                    messageTxt: error.message,
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

    const onSelectCatalogLine = useCallback(
        (selectedLine: LineTypeInfo) => {
            if (selectedLine && openCatalogDialogIndex !== null) {
                const selectedType = selectedLine.type ?? '';
                const selectedTypeId = selectedLine.id ?? '';
                setValue(`${SEGMENTS}.${openCatalogDialogIndex}.${SEGMENT_TYPE_VALUE}`, selectedType);
                setValue(`${SEGMENTS}.${openCatalogDialogIndex}.${SEGMENT_TYPE_ID}`, selectedTypeId);
                clearErrors(`${SEGMENTS}.${openCatalogDialogIndex}.${SEGMENT_TYPE_VALUE}`);
                updateSegmentValues(openCatalogDialogIndex);
                updateTotals();
            }
        },
        [updateSegmentValues, updateTotals, setValue, clearErrors, openCatalogDialogIndex]
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
            return true; // Needed to remove the line in ExpandableInput
        },
        [setValue, updateTotals]
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

            {openCatalogDialogIndex !== null && (
                <LineTypesCatalogSelectorDialog
                    onClose={onCatalogDialogClose}
                    rowData={lineTypesCatalog}
                    onSelectLine={onSelectCatalogLine}
                    preselectedRowId={getPreselectedRowIdForCatalog(openCatalogDialogIndex)}
                    dialogProps={undefined}
                />
            )}
        </>
    );
};
