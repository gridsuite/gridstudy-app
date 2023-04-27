/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import yup from '../../utils/yup-config';
import Grid from '@mui/material/Grid';
import { gridItem } from '../dialogUtils';
import { Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FloatInput from '../../utils/rhf-inputs/float-input';
import { SEGMENT_DISTANCE_VALUE } from '../../utils/field-constants';

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

const formSchema = yup.object().shape({
    [SEGMENT_DISTANCE_VALUE]: yup
        .number()
        .nullable()
        //.required()
        .moreThan(0, 'SegmentDistanceGreaterThanZero'),
});

const emptyFormData = {
    [SEGMENT_DISTANCE_VALUE]: null,
};

const LineTypeCatalogForm = (props) => {
    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, watch, trigger } = formMethods;
    const [innerSegmentDistanceValue, setInnerSegmentDistanceValue] =
        useState(0); // TODO FIX THIS ? It's part of a hack to prevent an infinite loop
    const segmentDistanceValue = watch(SEGMENT_DISTANCE_VALUE, 0);

    const segmentDistanceField = (
        <FloatInput name={SEGMENT_DISTANCE_VALUE} label={'SegmentDistance'} />
    );

    const { onEditButtonClick, onDeleteButtonClick, onSegmentDistanceChange } =
        props;
    const handleEditButtonClick = useCallback(
        () => onEditButtonClick && onEditButtonClick(),
        [onEditButtonClick]
    );
    const handleDeleteButtonClick = useCallback(() => {
        reset(emptyFormData);
        onDeleteButtonClick && onDeleteButtonClick();
    }, [reset, onDeleteButtonClick]);

    useEffect(() => {
        // TODO FIX THIS TEST WITH A COPY IN A STATE ? It's a hack to prevent an infinite loop
        if (innerSegmentDistanceValue !== segmentDistanceValue) {
            setInnerSegmentDistanceValue(segmentDistanceValue);
            onSegmentDistanceChange(segmentDistanceValue);
            trigger(SEGMENT_DISTANCE_VALUE);
        }
    }, [
        trigger,
        onSegmentDistanceChange,
        segmentDistanceValue,
        innerSegmentDistanceValue,
    ]);

    return (
        <FormProvider validationSchema={formSchema} {...formMethods}>
            <Grid container spacing={2} key={'index'}>
                {gridItem(segmentDistanceField, 2)}
                {gridItem(<div>{props.segment?.lineType?.type ?? ''}</div>, 2)}
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
                {gridItem(<div>{props.segment?.resistance ?? 0}</div>, 2)}
                {gridItem(<div>{props.segment?.reactance ?? 0}</div>, 2)}
                {gridItem(<div>{props.segment?.susceptance ?? 0}</div>, 2)}
            </Grid>
        </FormProvider>
    );
};

LineTypeCatalogForm.propTypes = {}; // TODO CHARLY

export default LineTypeCatalogForm;
