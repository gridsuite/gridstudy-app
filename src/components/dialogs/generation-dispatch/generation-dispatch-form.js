/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { EQUIPMENT_TYPES } from '../../utils/equipment-types';
import DirectoryItemsInput from '../../utils/rhf-inputs/directory-items-input';
import FloatInput from '../../utils/rhf-inputs/float-input';
import {
    LOSS_COEFFICIENT,
    DEFAULT_OUTAGE_RATE,
    GENERATORS_WITHOUT_OUTAGE,
    GENERATORS_WITH_FIXED_ACTIVE_POWER,
} from '../../utils/field-constants';
import {
    gridItem,
    percentageTextField,
    GridSection,
} from '../../dialogs/dialogUtils';
import Grid from '@mui/material/Grid';
import {
    formatPercentageValue,
    isValidPercentage,
} from '../percentage-area/percentage-area-utils';
import { elementType } from '@gridsuite/commons-ui';
import { useFormContext } from 'react-hook-form';
import React from 'react';
import makeStyles from '@mui/styles/makeStyles';

export const useStyles = makeStyles((theme) => ({
    padding: {
        paddingTop: theme.spacing(2),
    },
}));

const GenerationDispatchForm = ({ currentNode, studyUuid }) => {
    const classes = useStyles();
    const { setValue } = useFormContext();

    const handleCoefficientValueChange = (id, value) => {
        const coefficientValue = formatPercentageValue(value);
        setValue(id, coefficientValue, {
            shouldValidate: true,
        });
        return coefficientValue;
    };

    const lossCoefficientField = (
        <FloatInput
            name={LOSS_COEFFICIENT}
            label={'LossCoefficient'}
            adornment={percentageTextField}
            acceptValue={isValidPercentage}
            outputTransform={(value) =>
                handleCoefficientValueChange(LOSS_COEFFICIENT, value)
            }
        />
    );

    const defaultOutageRateField = (
        <FloatInput
            name={DEFAULT_OUTAGE_RATE}
            label={'DefaultOutageRate'}
            adornment={percentageTextField}
            acceptValue={isValidPercentage}
            outputTransform={(value) =>
                handleCoefficientValueChange(DEFAULT_OUTAGE_RATE, value)
            }
        />
    );

    const generatorsWithoutOutageField = (
        <DirectoryItemsInput
            name={`${GENERATORS_WITHOUT_OUTAGE}`}
            equipmentTypes={[EQUIPMENT_TYPES.GENERATOR.type]}
            elementType={elementType.FILTER}
            label={'GeneratorsWithoutOutage'}
            titleId={'FiltersListsSelection'}
        />
    );

    const generatorsWithFixedActivePowerField = (
        <DirectoryItemsInput
            name={`${GENERATORS_WITH_FIXED_ACTIVE_POWER}`}
            equipmentTypes={[EQUIPMENT_TYPES.GENERATOR.type]}
            elementType={elementType.FILTER}
            label={'GeneratorsWithFixedActivePower'}
            titleId={'FiltersListsSelection'}
        />
    );

    return (
        <>
            <Grid
                container
                direction="column"
                spacing={2}
                alignItems="start"
                className={classes.padding}
            >
                {gridItem(lossCoefficientField, 4)}
                {gridItem(generatorsWithFixedActivePowerField, 6)}
            </Grid>
            <GridSection title="ReduceMaxP" />
            <Grid container spacing={2} alignItems="center">
                {gridItem(defaultOutageRateField, 4)}
                {gridItem(generatorsWithoutOutageField, 6)}
            </Grid>
        </>
    );
};

export default GenerationDispatchForm;
