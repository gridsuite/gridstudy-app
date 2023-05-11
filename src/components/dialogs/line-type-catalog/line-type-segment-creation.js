/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import { gridItem, KilometerAdornment } from '../dialogUtils';
import EditIcon from '@mui/icons-material/Edit';
import FloatInput from '../../utils/rhf-inputs/float-input';
import makeStyles from '@mui/styles/makeStyles';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import {
    SEGMENT_DISTANCE_VALUE,
    SEGMENT_TYPE_VALUE,
    SEGMENT_RESISTANCE,
    SEGMENT_REACTANCE,
    SEGMENT_SUSCEPTANCE,
} from '../../utils/field-constants';
import { ReadOnlyInput } from '../../utils/rhf-inputs/read-only/read-only-input';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
    simpleLabel: {
        paddingTop: theme.spacing(1),
    },
}));

const LineTypeSegmentCreation = ({
    name,
    index,
    onEditButtonClick,
    onSegmentDistanceChange,
}) => {
    const classes = useStyles();

    const watchDistance = useWatch({
        name: `${name}.${index}.${SEGMENT_DISTANCE_VALUE}`,
    });

    const segmentDistanceField = (
        <FloatInput
            name={`${name}.${index}.${SEGMENT_DISTANCE_VALUE}`}
            label={'SegmentDistance'}
            adornment={KilometerAdornment}
        />
    );

    const segmentTypeField = (
        <ReadOnlyInput name={`${name}.${index}.${SEGMENT_TYPE_VALUE}`} />
    );

    const segmentResistanceField = (
        <ReadOnlyInput
            isNumerical
            name={`${name}.${index}.${SEGMENT_RESISTANCE}`}
        />
    );

    const segmentReactanceField = (
        <ReadOnlyInput
            isNumerical
            name={`${name}.${index}.${SEGMENT_REACTANCE}`}
        />
    );

    const segmentSusceptanceField = (
        <ReadOnlyInput
            isNumerical
            name={`${name}.${index}.${SEGMENT_SUSCEPTANCE}`}
        />
    );

    const handleEditButtonClick = useCallback(
        () => onEditButtonClick && onEditButtonClick(index),
        [index, onEditButtonClick]
    );

    useEffect(() => {
        onSegmentDistanceChange &&
            onSegmentDistanceChange(index, watchDistance);
    }, [onSegmentDistanceChange, index, watchDistance]);

    return (
        <>
            {gridItem(segmentDistanceField, 2)}
            {gridItem(segmentTypeField, 2.5)}
            {onEditButtonClick && (
                <Grid item xs={0.5}>
                    <IconButton
                        className={classes.icon}
                        onClick={handleEditButtonClick}
                    >
                        <EditIcon />
                    </IconButton>
                </Grid>
            )}
            {gridItem(segmentResistanceField, 2)}
            {gridItem(segmentReactanceField, 2)}
            {gridItem(segmentSusceptanceField, 2)}
        </>
    );
};

LineTypeSegmentCreation.prototype = {
    name: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    onEditButtonClick: PropTypes.func.isRequired,
    onSegmentDistanceChange: PropTypes.func.isRequired,
};

export default LineTypeSegmentCreation;
