/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import Grid from '@mui/material/Grid';
import { gridItem } from '../dialogUtils';
import { FormattedMessage } from 'react-intl';
import ExpandableInput from '../../utils/rhf-inputs/expandable-input';
import { ReadOnlyInput } from '../../utils/rhf-inputs/read-only/read-only-input';
import {
    SEGMENT_DISTANCE_VALUE,
    SEGMENT_TYPE_ID,
    SEGMENT_REACTANCE,
    SEGMENT_RESISTANCE,
    SEGMENT_SUSCEPTANCE,
    SEGMENT_TYPE_VALUE,
    SEGMENTS,
    TOTAL_REACTANCE,
    TOTAL_RESISTANCE,
    TOTAL_SUSCEPTANCE,
} from '../../utils/field-constants';
import LineTypesCatalogSelectorDialog from './line-types-catalog-selector-dialog';
import { roundToDefaultPrecision } from '../../../utils/rounding';
import LineTypeSegmentCreation from './line-type-segment-creation';
import { getLineTypesCatalog } from '../../../utils/rest-api';
import { emptyLineSegment } from './line-type-segment-dialog';
import {
    calculateResistance,
    calculateReactance,
    calculateSusceptance,
} from '../../utils/utils';
import makeStyles from '@mui/styles/makeStyles';
import { useSnackMessage } from '@gridsuite/commons-ui';

const useStyles = makeStyles((theme) => ({
    header: {
        fontWeight: 'bold',
    },
    headerJustifyEnd: {
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'end',
    },
}));

export const LineTypeSegmentForm = () => {
    const classes = useStyles();
    const { setValue, getValues, clearErrors } = useFormContext();
    const [lineTypesCatalog, setLineTypesCatalog] = useState([]);
    const [openCatalogDialogIndex, setOpenCatalogDialogIndex] = useState(null);
    const { snackError } = useSnackMessage();

    // Fetchs the lineType catalog on startup
    useEffect(() => {
        getLineTypesCatalog()
            .then((values) => {
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
        (index) => {
            const distance = getValues(
                `${SEGMENTS}.${index}.${SEGMENT_DISTANCE_VALUE}`
            );
            const typeId = getValues(`${SEGMENTS}.${index}.${SEGMENT_TYPE_ID}`);

            const entryFromCatalog = lineTypesCatalog?.find(
                (entry) => entry.id === typeId
            );

            const newResistance = roundToDefaultPrecision(
                calculateResistance(
                    distance,
                    entryFromCatalog?.linearResistance ?? 0
                )
            );
            const newReactance = roundToDefaultPrecision(
                calculateReactance(
                    distance,
                    entryFromCatalog?.linearReactance ?? 0
                )
            );
            const newSusceptance = roundToDefaultPrecision(
                calculateSusceptance(
                    distance,
                    entryFromCatalog?.linearCapacity ?? 0
                )
            );

            setValue(
                `${SEGMENTS}.${index}.${SEGMENT_RESISTANCE}`,
                newResistance
            );
            setValue(`${SEGMENTS}.${index}.${SEGMENT_REACTANCE}`, newReactance);
            setValue(
                `${SEGMENTS}.${index}.${SEGMENT_SUSCEPTANCE}`,
                newSusceptance
            );
        },
        [getValues, setValue, lineTypesCatalog]
    );

    const updateTotals = useCallback(() => {
        const segments = getValues(SEGMENTS);
        const totalResistance = segments.reduce(
            (accum, item) => accum + item[SEGMENT_RESISTANCE] ?? 0,
            0
        );
        const totalReactance = segments.reduce(
            (accum, item) => accum + item[SEGMENT_REACTANCE] ?? 0,
            0
        );
        const totalSusceptance = segments.reduce(
            (accum, item) => accum + item[SEGMENT_SUSCEPTANCE] ?? 0,
            0
        );
        setValue(TOTAL_RESISTANCE, roundToDefaultPrecision(totalResistance));
        setValue(TOTAL_REACTANCE, roundToDefaultPrecision(totalReactance));
        setValue(TOTAL_SUSCEPTANCE, roundToDefaultPrecision(totalSusceptance));
    }, [getValues, setValue]);

    const onCatalogDialogClose = () => {
        setOpenCatalogDialogIndex(null);
    };

    const openCatalogDialog = (index) => {
        setOpenCatalogDialogIndex(index);
    };

    const onSelectCatalogLine = useCallback(
        (selectedLine) => {
            if (selectedLine) {
                const selectedType = selectedLine.type ?? '';
                const selectedTypeId = selectedLine.id ?? '';
                setValue(
                    `${SEGMENTS}.${openCatalogDialogIndex}.${SEGMENT_TYPE_VALUE}`,
                    selectedType
                );
                setValue(
                    `${SEGMENTS}.${openCatalogDialogIndex}.${SEGMENT_TYPE_ID}`,
                    selectedTypeId
                );
                clearErrors(
                    `${SEGMENTS}.${openCatalogDialogIndex}.${SEGMENT_TYPE_VALUE}`
                );
                updateSegmentValues(openCatalogDialogIndex);
                updateTotals();
            }
        },
        [
            updateSegmentValues,
            updateTotals,
            setValue,
            clearErrors,
            openCatalogDialogIndex,
        ]
    );

    const handleSegmentDistantChange = useCallback(
        (index) => {
            updateSegmentValues(index);
            updateTotals();
        },
        [updateSegmentValues, updateTotals]
    );

    const handleSegmentDelete = useCallback(
        (index) => {
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
        (index) => {
            return getValues(`${SEGMENTS}.${index}.${SEGMENT_TYPE_ID}`);
        },
        [getValues]
    );

    const segmentTypeHeader = (
        <div className={classes.header}>
            <FormattedMessage id={'lineType.type'} />
        </div>
    );

    const segmentResistanceHeader = (
        <div className={classes.headerJustifyEnd}>
            <FormattedMessage id={'lineType.resistanceLabel'} />
        </div>
    );

    const segmentReactanceHeader = (
        <div className={classes.headerJustifyEnd}>
            <FormattedMessage id={'lineType.reactanceLabel'} />
        </div>
    );

    const segmentSusceptanceHeader = (
        <div className={classes.headerJustifyEnd}>
            <FormattedMessage id={'lineType.susceptanceLabel'} />
        </div>
    );

    const totalResistanceField = (
        <ReadOnlyInput isNumerical name={TOTAL_RESISTANCE} />
    );

    const totalReactanceField = (
        <ReadOnlyInput isNumerical name={TOTAL_REACTANCE} />
    );

    const totalSusceptanceField = (
        <ReadOnlyInput isNumerical name={TOTAL_SUSCEPTANCE} />
    );

    return (
        <>
            <Grid container spacing={2}>
                {gridItem(<div />, 2)}
                {gridItem(segmentTypeHeader, 3)}
                {gridItem(segmentResistanceHeader, 2)}
                {gridItem(segmentReactanceHeader, 2)}
                {gridItem(segmentSusceptanceHeader, 2)}
                {gridItem(<div />, 1)}
            </Grid>
            <ExpandableInput
                name={SEGMENTS}
                Field={LineTypeSegmentCreation}
                fieldProps={{
                    onSegmentDistanceChange: (index, newDistance) =>
                        handleSegmentDistantChange(index, newDistance),
                    onEditButtonClick: (index) => openCatalogDialog(index),
                }}
                addButtonLabel={'AddSegment'}
                initialValue={emptyLineSegment}
                deleteCallback={handleSegmentDelete}
                alignItems="center"
            />
            <hr />
            <Grid container spacing={2}>
                {gridItem(<div />, 5)}
                {gridItem(totalResistanceField, 2)}
                {gridItem(totalReactanceField, 2)}
                {gridItem(totalSusceptanceField, 2)}
                {gridItem(<div />, 1)}
            </Grid>

            {openCatalogDialogIndex !== null && (
                <LineTypesCatalogSelectorDialog
                    open={true}
                    onClose={onCatalogDialogClose}
                    rowData={lineTypesCatalog}
                    onSelectLine={onSelectCatalogLine}
                    titleId={'SelectType'}
                    preselectedRowId={getPreselectedRowIdForCatalog(
                        openCatalogDialogIndex
                    )}
                />
            )}
        </>
    );
};
