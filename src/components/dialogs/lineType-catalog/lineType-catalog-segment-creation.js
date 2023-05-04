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
    SEGMENTS,
    SEGMENT_DISTANCE_VALUE,
    SEGMENT_TYPE_VALUE,
    SEGMENT_RESISTANCE,
    SEGMENT_REACTANCE,
    SEGMENT_SUSCEPTANCE,
} from '../../utils/field-constants';
import { ReadOnlyInput } from '../../utils/rhf-inputs/read-only-input';

const useStyles = makeStyles((theme) => ({
    simpleLabel: {
        paddingTop: theme.spacing(1),
    },
}));

export const LineTypeCatalogSegmentCreation = ({
    index,
    onEditButtonClick,
    onSegmentDistanceChange /*, lineSegments*/,
}) => {
    const classes = useStyles();

    const segmentDistanceField = (
        <FloatInput
            name={`${SEGMENTS}.${index}.${SEGMENT_DISTANCE_VALUE}`}
            label={'SegmentDistance'}
            adornment={KilometerAdornment}
        />
    );

    const handleEditButtonClick = useCallback(
        () => onEditButtonClick && onEditButtonClick(index),
        [index, onEditButtonClick]
    );

    const watchDistance = useWatch({
        name: `${SEGMENTS}.${index}.${SEGMENT_DISTANCE_VALUE}`,
    });

    useEffect(() => {
        onSegmentDistanceChange &&
            onSegmentDistanceChange(index, watchDistance);
    }, [onSegmentDistanceChange, index, watchDistance]);

    return (
        <>
            {gridItem(segmentDistanceField, 2)}
            {gridItem(
                <ReadOnlyInput
                    name={`${SEGMENTS}.${index}.${SEGMENT_TYPE_VALUE}`}
                />,
                2
            )}
            {onEditButtonClick && (
                <Grid item xs={1}>
                    <IconButton
                        className={classes.icon}
                        onClick={handleEditButtonClick}
                    >
                        <EditIcon />
                    </IconButton>
                </Grid>
            )}
            {gridItem(
                <ReadOnlyInput
                    name={`${SEGMENTS}.${index}.${SEGMENT_RESISTANCE}`}
                />,
                2
            )}
            {gridItem(
                <ReadOnlyInput
                    name={`${SEGMENTS}.${index}.${SEGMENT_REACTANCE}`}
                />,
                2
            )}
            {gridItem(
                <ReadOnlyInput
                    name={`${SEGMENTS}.${index}.${SEGMENT_SUSCEPTANCE}`}
                />,
                2
            )}
        </>
    );
};
