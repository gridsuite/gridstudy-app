/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import { GridItem, KilometerAdornment } from '../dialog-utils';
import EditIcon from '@mui/icons-material/Edit';
import { FloatInput } from '@gridsuite/commons-ui';
import IconButton from '@mui/material/IconButton';
import {
    SEGMENT_DISTANCE_VALUE,
    SEGMENT_TYPE_VALUE,
    SEGMENT_RESISTANCE,
    SEGMENT_REACTANCE,
    SEGMENT_SUSCEPTANCE,
} from '../../utils/field-constants';
import { ReadOnlyInput } from '../../utils/rhf-inputs/read-only/read-only-input';
import { ButtonReadOnlyInput } from '../../utils/rhf-inputs/read-only/button-read-only-input';
import PropTypes from 'prop-types';

const LineTypeSegmentCreation = ({ name, index, onEditButtonClick, onSegmentDistanceChange }) => {
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

    const segmentResistanceField = <ReadOnlyInput isNumerical name={`${name}.${index}.${SEGMENT_RESISTANCE}`} />;

    const segmentReactanceField = <ReadOnlyInput isNumerical name={`${name}.${index}.${SEGMENT_REACTANCE}`} />;

    const segmentSusceptanceField = <ReadOnlyInput isNumerical name={`${name}.${index}.${SEGMENT_SUSCEPTANCE}`} />;

    const handleEditButtonClick = useCallback(
        () => onEditButtonClick && onEditButtonClick(index),
        [index, onEditButtonClick]
    );

    const segmentTypeField = (
        <ButtonReadOnlyInput name={`${name}.${index}.${SEGMENT_TYPE_VALUE}`}>
            {onEditButtonClick && (
                <IconButton onClick={handleEditButtonClick}>
                    <EditIcon />
                </IconButton>
            )}
        </ButtonReadOnlyInput>
    );

    useEffect(() => {
        onSegmentDistanceChange && onSegmentDistanceChange(index, watchDistance);
    }, [onSegmentDistanceChange, index, watchDistance]);

    return (
        <>
            {GridItem(segmentDistanceField, 2)}
            {GridItem(segmentTypeField, 3)}
            {GridItem(segmentResistanceField, 2)}
            {GridItem(segmentReactanceField, 2)}
            {GridItem(segmentSusceptanceField, 2)}
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
