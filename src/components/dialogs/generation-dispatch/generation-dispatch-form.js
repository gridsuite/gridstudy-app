/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import TextInput from '../../util/rhf-inputs/text-input';
import { LOSS_COEFFICIENT } from '../../util/field-constants';
import {
    gridItem,
    percentageTextField,
    standardTextField,
} from '../dialogUtils';
import Grid from '@mui/material/Grid';
import {
    formatPercentageValue,
    isValidPercentage,
} from '../percentage-area/percentage-area-utils';
import { useFormContext } from 'react-hook-form';
import React from 'react';

const GenerationDispatchForm = ({ currentNode, studyUuid }) => {
    const { setValue } = useFormContext();

    const handleLossCoefficientValueChange = (value) => {
        const lossCoefficientValue = formatPercentageValue(value);
        setValue(LOSS_COEFFICIENT, lossCoefficientValue, {
            shouldValidate: true,
        });
        return lossCoefficientValue;
    };

    const lossCoefficientField = (
        <TextInput
            name={LOSS_COEFFICIENT}
            label={'LossCoefficient'}
            adornment={percentageTextField}
            acceptValue={isValidPercentage}
            outputTransform={handleLossCoefficientValueChange}
            formProps={standardTextField}
        />
    );

    return (
        <>
            <Grid container spacing={2} alignItems="center">
                {gridItem(lossCoefficientField, 3)}
            </Grid>
        </>
    );
};

export default GenerationDispatchForm;
