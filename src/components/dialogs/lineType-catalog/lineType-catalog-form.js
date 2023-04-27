/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import yup from '../../utils/yup-config';
import Grid from '@mui/material/Grid';
import { gridItem } from '../dialogUtils';
import { Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FloatInput from '../../utils/rhf-inputs/float-input';
import {
    SEGMENT_DISTANCE_VALUE,
    SEGMENT_RESISTANCE,
    SEGMENT_REACTANCE,
    SEGMENT_SUSCEPTANCE,
} from '../../utils/field-constants';
import { ReadOnlyInput } from '../../utils/rhf-inputs/read-only-input';
import { roundToDefaultPrecision } from '../../../utils/rounding';

/**
 * lineSegment definition :
 * {
 *   distance: float
 *   lineType: {
 *     type": "TEST3 789EF",
 *     kind": "AERIAL",
 *     voltage": 225,
 *     conductorType": "CU - Cuivre",
 *     section": 15,
 *     conductorsNumber": 4,
 *     circuitsNumber": 1,
 *     groundWiresNumber": 0,
 *     linearResistance": 0.00009876,
 *     linearReactance": 0.0005,
 *     linearCapacity": 0.000000009
 *   }
 *   resistance: float
 *   reactance: float
 *   susceptance: float
 * }
 *
 */

function toResistance(distance, linearResistance) {
    if (
        distance === undefined ||
        isNaN(distance) ||
        linearResistance === undefined ||
        isNaN(linearResistance)
    ) {
        return 0;
    }
    return Number(distance) * Number(linearResistance);
}

function toReactance(distance, linearReactance) {
    if (
        distance === undefined ||
        isNaN(distance) ||
        linearReactance === undefined ||
        isNaN(linearReactance)
    ) {
        return 0;
    }
    return Number(distance) * Number(linearReactance);
}

function toSusceptance(distance, linearCapacity) {
    if (
        distance === undefined ||
        isNaN(distance) ||
        linearCapacity === undefined ||
        isNaN(linearCapacity)
    ) {
        return 0;
    }
    return (
        Number(distance) *
        Number(linearCapacity) *
        2 *
        Math.PI *
        50 *
        Math.pow(10, 6)
    );
}

const formSchema = yup.object().shape({
    [SEGMENT_DISTANCE_VALUE]: yup
        .number()
        .nullable()
        .required()
        .min(0, 'ReactiveCapabilityCurveCreationErrorQminPQmaxPIncoherence'), // TODO CHARLY Check if needed and update the error message if needed.
    [SEGMENT_RESISTANCE]: yup.number().required(),
    [SEGMENT_REACTANCE]: yup.number().required(),
    [SEGMENT_SUSCEPTANCE]: yup.number().required(),
});

const emptyFormData = {
    [SEGMENT_DISTANCE_VALUE]: null,
    [SEGMENT_RESISTANCE]: 0,
    [SEGMENT_REACTANCE]: 0,
    [SEGMENT_SUSCEPTANCE]: 0,
};

const LineTypeCatalogForm = (props) => {
    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, watch, setValue } = formMethods;
    const segmentDistanceValue = watch(SEGMENT_DISTANCE_VALUE, 0);

    const segmentDistanceField = (
        <FloatInput
            name={SEGMENT_DISTANCE_VALUE}
            label={'SegmentDistance'}
            // adornment={meterAdornment}
        />
    );

    useEffect(() => {
        setValue(
            SEGMENT_RESISTANCE,
            roundToDefaultPrecision(
                toResistance(
                    segmentDistanceValue,
                    props?.value?.linearResistance
                )
            ),
            { shouldTouch: true }
        );
        setValue(
            SEGMENT_REACTANCE,
            roundToDefaultPrecision(
                toReactance(segmentDistanceValue, props?.value?.linearReactance)
            ),
            { shouldTouch: true }
        );
        setValue(
            SEGMENT_SUSCEPTANCE,
            roundToDefaultPrecision(
                toSusceptance(
                    segmentDistanceValue,
                    props?.value?.linearCapacity
                )
            ),
            { shouldTouch: true }
        );
    }, [setValue, segmentDistanceValue, props.value]);

    const { onEditButtonClick, onDeleteButtonClick } = props;
    const handleEditButtonClick = useCallback(
        () => onEditButtonClick && onEditButtonClick(),
        [onEditButtonClick]
    );
    const handleDeleteButtonClick = useCallback(() => {
        reset(emptyFormData);
        onDeleteButtonClick && onDeleteButtonClick();
    }, [reset, onDeleteButtonClick]);

    return (
        <FormProvider validationSchema={formSchema} {...formMethods}>
            <Grid container spacing={2} key={'index'}>
                {gridItem(segmentDistanceField, 2)}
                {gridItem(<div>{props?.value?.type}</div>, 2)}
                {gridItem(
                    <Button
                        onClick={handleEditButtonClick}
                        startIcon={<EditIcon />}
                    />,
                    1
                )}
                {gridItem(
                    <Button
                        onClick={handleDeleteButtonClick}
                        startIcon={<DeleteIcon />}
                    />,
                    1
                )}
                {gridItem(<ReadOnlyInput name={`${SEGMENT_RESISTANCE}`} />, 2)}
                {gridItem(<ReadOnlyInput name={`${SEGMENT_REACTANCE}`} />, 2)}
                {gridItem(<ReadOnlyInput name={`${SEGMENT_SUSCEPTANCE}`} />, 2)}
            </Grid>
        </FormProvider>
    );
};

LineTypeCatalogForm.propTypes = {};

export default LineTypeCatalogForm;
