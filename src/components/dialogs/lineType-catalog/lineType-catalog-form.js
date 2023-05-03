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
import { gridItem, KilometerAdornment } from '../dialogUtils';
import EditIcon from '@mui/icons-material/Edit';
import FloatInput from '../../utils/rhf-inputs/float-input';
import { SEGMENT_DISTANCE_VALUE } from '../../utils/field-constants';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';

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

const useStyles = makeStyles((theme) => ({
    simpleLabel: {
        paddingTop: theme.spacing(1),
    },
}));

const formSchema = yup.object().shape({
    [SEGMENT_DISTANCE_VALUE]: yup
        .number()
        .nullable()
        .moreThan(0, 'SegmentDistanceGreaterThanZero'),
});

const emptyFormData = {
    [SEGMENT_DISTANCE_VALUE]: null,
};

const LineTypeCatalogForm = (props) => {
    const classes = useStyles();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { watch, trigger } = formMethods;
    const { onEditButtonClick, onSegmentDistanceChange } = props;

    const [innerSegmentDistanceValue, setInnerSegmentDistanceValue] =
        useState(0); // TODO FIX THIS ? It's part of a hack to prevent an infinite loop
    const segmentDistanceValue = watch(SEGMENT_DISTANCE_VALUE, 0);
    const lineType = props.lineSegments[props.index]?.lineType?.type ?? '';
    const resistance = props.lineSegments[props.index]?.resistance ?? 0.0;
    const reactance = props.lineSegments[props.index]?.reactance ?? 0.0;
    const susceptance = props.lineSegments[props.index]?.susceptance ?? 0.0;

    const segmentDistanceField = (
        <FloatInput
            name={SEGMENT_DISTANCE_VALUE}
            label={'SegmentDistance'}
            adornment={KilometerAdornment}
        />
    );

    const handleEditButtonClick = useCallback(
        () => onEditButtonClick && onEditButtonClick(props.index),
        [props.index, onEditButtonClick]
    );

    useEffect(() => {
        // TODO FIX THIS TEST THAT USES A COPY IN A STATE ? It's a hack to prevent an infinite loop
        if (innerSegmentDistanceValue !== segmentDistanceValue) {
            setInnerSegmentDistanceValue(segmentDistanceValue);
            onSegmentDistanceChange(props.index, segmentDistanceValue);
            trigger(SEGMENT_DISTANCE_VALUE);
        }
    }, [
        props.index,
        trigger,
        onSegmentDistanceChange,
        segmentDistanceValue,
        innerSegmentDistanceValue,
    ]);

    return (
        <FormProvider
            validationSchema={formSchema}
            removeOptional={true}
            {...formMethods}
        >
            {gridItem(segmentDistanceField, 2)}
            {gridItem(<div className={classes.simpleLabel}>{lineType}</div>, 2)}
            <Grid item xs={1}>
                <IconButton
                    className={classes.icon}
                    onClick={handleEditButtonClick}
                >
                    <EditIcon />
                </IconButton>
            </Grid>
            {gridItem(
                <div className={classes.simpleLabel}>{resistance}</div>,
                2
            )}
            {gridItem(
                <div className={classes.simpleLabel}>{reactance}</div>,
                2
            )}
            {gridItem(
                <div className={classes.simpleLabel}>{susceptance}</div>,
                2
            )}
        </FormProvider>
    );
};

LineTypeCatalogForm.propTypes = {
    index: PropTypes.number.isRequired,
    lineSegments: PropTypes.array,
    onEditButtonClick: PropTypes.func,
    onSegmentDistanceChange: PropTypes.func,
};

export default LineTypeCatalogForm;
