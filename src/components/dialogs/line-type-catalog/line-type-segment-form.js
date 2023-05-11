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
    SEGMENT_KIND_VALUE,
    SEGMENT_REACTANCE,
    SEGMENT_RESISTANCE,
    SEGMENT_SUSCEPTANCE,
    SEGMENT_TYPE_VALUE,
    SEGMENTS,
    TOTAL_REACTANCE,
    TOTAL_RESISTANCE,
    TOTAL_SUSCEPTANCE,
} from '../../utils/field-constants';
import LineTypeCatalogSelectorDialog from './line-type-catalog-selector-dialog';
import { roundToDefaultPrecision } from '../../../utils/rounding';
import LineTypeSegmentCreation from './line-type-segment-creation';
import { getLineTypeCatalog } from '../../../utils/rest-api';
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
    const [lineTypeCatalog, setLineTypeCatalog] = useState([]);
    const [openCatalogDialogIndex, setOpenCatalogDialogIndex] = useState(null);
    const { snackError } = useSnackMessage();

    // Fetchs the lineType catalog on startup
    useEffect(() => {
        getLineTypeCatalog()
            .then((values) => {
                setLineTypeCatalog(values);
            })
            .catch((error) =>
                snackError({
                    messageTxt: error.message,
                    headerId: 'LineTypeCatalogFetchingError',
                })
            );
    }, [snackError]);

    const getEntryFromCatalog = useCallback(
        (kind, type) => {
            return lineTypeCatalog?.find(
                (entry) => entry.kind === kind && entry.type === type
            );
        },
        [lineTypeCatalog]
    );

    const updateSegmentValues = useCallback(
        (index) => {
            const distance = getValues(
                `${SEGMENTS}.${index}.${SEGMENT_DISTANCE_VALUE}`
            );
            const lineKind = getValues(
                `${SEGMENTS}.${index}.${SEGMENT_KIND_VALUE}`
            );
            const lineType = getValues(
                `${SEGMENTS}.${index}.${SEGMENT_TYPE_VALUE}`
            );
            const entryFromCatalog = getEntryFromCatalog(lineKind, lineType);

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
        [getValues, setValue, getEntryFromCatalog]
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
                const selectedKind = selectedLine.kind ?? '';
                setValue(
                    `${SEGMENTS}.${openCatalogDialogIndex}.${SEGMENT_TYPE_VALUE}`,
                    selectedType
                );
                setValue(
                    `${SEGMENTS}.${openCatalogDialogIndex}.${SEGMENT_KIND_VALUE}`,
                    selectedKind
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

    // To preselect a row in the LineTypeCatalogSelectorDialog, we need it's
    // kind (to select the correct tab) and it's type (to select the correct row).
    const getPreselectedRowForCatalog = useCallback(
        (index) => {
            const type = getValues(
                `${SEGMENTS}.${index}.${SEGMENT_TYPE_VALUE}`
            );
            const kind = getValues(
                `${SEGMENTS}.${index}.${SEGMENT_KIND_VALUE}`
            );
            return type && kind
                ? {
                      type: type,
                      kind: kind,
                  }
                : undefined;
        },
        [getValues]
    );

    /**
     * RENDER
     */
    return (
        <>
            <Grid container spacing={2}>
                {gridItem(<div />, 2)}
                {gridItem(
                    <div className={classes.header}>
                        <FormattedMessage id={'lineType.type'} />
                    </div>,
                    3
                )}
                {gridItem(
                    <div className={classes.headerJustifyEnd}>
                        <FormattedMessage id={'lineType.resistanceLabel'} />
                    </div>,
                    2
                )}
                {gridItem(
                    <div className={classes.headerJustifyEnd}>
                        <FormattedMessage id={'lineType.reactanceLabel'} />
                    </div>,
                    2
                )}
                {gridItem(
                    <div className={classes.headerJustifyEnd}>
                        <FormattedMessage id={'lineType.susceptanceLabel'} />
                    </div>,
                    2
                )}
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
                {gridItem(<div />, 2)}
                {gridItem(<div />, 2.5)}
                {gridItem(<div />, 0.5)}
                {gridItem(
                    <ReadOnlyInput isNumerical name={TOTAL_RESISTANCE} />,
                    2
                )}
                {gridItem(
                    <ReadOnlyInput isNumerical name={TOTAL_REACTANCE} />,
                    2
                )}
                {gridItem(
                    <ReadOnlyInput isNumerical name={TOTAL_SUSCEPTANCE} />,
                    2
                )}
                {gridItem(<div />, 1)}
            </Grid>

            {openCatalogDialogIndex !== null && (
                <LineTypeCatalogSelectorDialog
                    open={true}
                    onClose={onCatalogDialogClose}
                    rowData={lineTypeCatalog}
                    onSelectLine={onSelectCatalogLine}
                    titleId={'SelectType'}
                    preselectedRow={getPreselectedRowForCatalog(
                        openCatalogDialogIndex
                    )}
                />
            )}
        </>
    );
};
