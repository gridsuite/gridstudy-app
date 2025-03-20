/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import { KilometerAdornment } from '../dialog-utils';
import EditIcon from '@mui/icons-material/Edit';
import { FloatInput } from '@gridsuite/commons-ui';
import { IconButton } from '@mui/material';
import {
    SEGMENT_DISTANCE_VALUE,
    SEGMENT_TYPE_VALUE,
    SEGMENT_RESISTANCE,
    SEGMENT_REACTANCE,
    SEGMENT_SUSCEPTANCE,
} from '../../utils/field-constants';
import { ReadOnlyInput } from '../../utils/rhf-inputs/read-only/read-only-input';
import { ButtonReadOnlyInput } from '../../utils/rhf-inputs/read-only/button-read-only-input';
import GridItem from '../commons/grid-item';

export interface LineTypeSegmentCreationProps {
    name: string;
    index: number;
    onEditButtonClick: (index: number) => void;
    onSegmentDistanceChange: (index: number) => void;
}

const LineTypeSegmentCreation: FunctionComponent<LineTypeSegmentCreationProps> = ({
    name,
    index,
    onEditButtonClick,
    onSegmentDistanceChange,
}) => {
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
            <IconButton onClick={handleEditButtonClick}>
                <EditIcon />
            </IconButton>
        </ButtonReadOnlyInput>
    );

    useEffect(() => {
        onSegmentDistanceChange && onSegmentDistanceChange(index);
    }, [onSegmentDistanceChange, index, watchDistance]);

    return (
        <>
            <GridItem size={2}>{segmentDistanceField}</GridItem>
            <GridItem size={3}>{segmentTypeField}</GridItem>
            <GridItem size={2}>{segmentResistanceField}</GridItem>
            <GridItem size={2}>{segmentReactanceField}</GridItem>
            <GridItem size={2}>{segmentSusceptanceField}</GridItem>
        </>
    );
};

export default LineTypeSegmentCreation;
