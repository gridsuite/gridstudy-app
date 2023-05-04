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
import { ReadOnlyInput } from '../../utils/rhf-inputs/read-only-input';
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
import LineTypeCatalogSelectorDialog from './lineType-catalog-selector-dialog';
import { roundToDefaultPrecision } from '../../../utils/rounding';
import { LineTypeCatalogSegmentCreation } from './lineType-catalog-segment-creation';
import { getLineTypeCatalog } from '../../../utils/rest-api';
import { emptyLineSegment } from './lineType-catalog-segment-dialog';
import {
    calculateResistance,
    calculateReactance,
    calculateSusceptance,
} from '../../utils/utils';

export const LineTypeCatalogSegmentForm = () => {
    const { setValue, getValues } = useFormContext();
    const [lineTypeCatalog, setLineTypeCatalog] = useState([]);
    const [openCatalogDialogIndex, setOpenCatalogDialogIndex] = useState(null);

    // Fetchs the lineType catalog on startup
    useEffect(() => {
        getLineTypeCatalog().then((values) => {
            setLineTypeCatalog(values);
        });
    }, []);

    const getResistanceFromCatalog = useCallback(
        (kind, type) => {
            const matchingCatalogEntry = lineTypeCatalog?.find(
                (entry) => entry.kind === kind && entry.type === type
            );
            return matchingCatalogEntry?.linearResistance ?? 0;
        },
        [lineTypeCatalog]
    );

    const getReactanceFromCatalog = useCallback(
        (kind, type) => {
            const matchingCatalogEntry = lineTypeCatalog?.find(
                (entry) => entry.kind === kind && entry.type === type
            );
            return matchingCatalogEntry?.linearReactance ?? 0;
        },
        [lineTypeCatalog]
    );

    const getSusceptanceFromCatalog = useCallback(
        (kind, type) => {
            const matchingCatalogEntry = lineTypeCatalog?.find(
                (entry) => entry.kind === kind && entry.type === type
            );
            return matchingCatalogEntry?.linearCapacity ?? 0;
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

            const linearResistance = getResistanceFromCatalog(
                lineKind,
                lineType
            );
            const newResistance = roundToDefaultPrecision(
                calculateResistance(distance, linearResistance)
            );
            setValue(
                `${SEGMENTS}.${index}.${SEGMENT_RESISTANCE}`,
                newResistance
            );

            const linearReactance = getReactanceFromCatalog(lineKind, lineType);
            const newReactance = roundToDefaultPrecision(
                calculateReactance(distance, linearReactance)
            );
            setValue(`${SEGMENTS}.${index}.${SEGMENT_REACTANCE}`, newReactance);

            const linearSusceptance = getSusceptanceFromCatalog(
                lineKind,
                lineType
            );
            const newSusceptance = roundToDefaultPrecision(
                calculateSusceptance(distance, linearSusceptance)
            );
            setValue(
                `${SEGMENTS}.${index}.${SEGMENT_SUSCEPTANCE}`,
                newSusceptance
            );
        },
        [
            getValues,
            setValue,
            getResistanceFromCatalog,
            getReactanceFromCatalog,
            getSusceptanceFromCatalog,
        ]
    );
    // TODO CHARLY onDelete : calculate a nouveau les valeures
    // TODO CHARLY supprimer les anciens fichiers qui ne sont plus utilisés
    const updateTotals = useCallback(() => {
        const totalResistance = getValues(SEGMENTS).reduce(
            (accum, item) => accum + item[SEGMENT_RESISTANCE] ?? 0,
            0
        );
        const totalReactance = getValues(SEGMENTS).reduce(
            (accum, item) => accum + item[SEGMENT_REACTANCE] ?? 0,
            0
        );
        const totalSusceptance = getValues(SEGMENTS).reduce(
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
                updateSegmentValues(openCatalogDialogIndex);
                updateTotals();
            }
        },
        [updateSegmentValues, updateTotals, setValue, openCatalogDialogIndex]
    );

    const handleSegmentDistantChange = useCallback(
        (index) => {
            updateSegmentValues(index);
            updateTotals();
        },
        [updateSegmentValues, updateTotals]
    );

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
            <Grid container direction="row-reverse" spacing={2}>
                {gridItem(
                    <FormattedMessage id={'lineType.susceptanceLabel'} />,
                    3
                )}
                {gridItem(
                    <FormattedMessage id={'lineType.reactanceLabel'} />,
                    2
                )}
                {gridItem(
                    <FormattedMessage id={'lineType.resistanceLabel'} />,
                    2
                )}
                {gridItem(<FormattedMessage id={'lineType.type'} />, 3)}
            </Grid>
            <ExpandableInput
                name={SEGMENTS}
                Field={LineTypeCatalogSegmentCreation}
                fieldProps={{
                    onSegmentDistanceChange: (index, newDistance) =>
                        handleSegmentDistantChange(index, newDistance),
                    onEditButtonClick: (index) => openCatalogDialog(index),
                }}
                addButtonLabel={'AddSegment'}
                initialValue={emptyLineSegment}
            />
            <hr />
            <Grid container direction="row-reverse" spacing={2}>
                {gridItem(<ReadOnlyInput name={TOTAL_SUSCEPTANCE} />, 3)}
                {gridItem(<ReadOnlyInput name={TOTAL_REACTANCE} />, 2)}
                {gridItem(<ReadOnlyInput name={TOTAL_RESISTANCE} />, 2)}
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
