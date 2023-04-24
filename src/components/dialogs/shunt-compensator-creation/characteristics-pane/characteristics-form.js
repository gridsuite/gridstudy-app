/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import {
    Q_AT_NOMINAL_V,
    SHUNT_COMPENSATOR_TYPE,
    SHUNT_COMPENSATOR_TYPES,
    SUSCEPTANCE_PER_SECTION,
    CHARACTERISTICS_CHOICE,
    CHARACTERISTICS_CHOICES,
} from 'components/util/field-constants';
import { Box } from '@mui/material';
import { useWatch } from 'react-hook-form';
import FloatInput from 'components/util/rhf-inputs/float-input';
import EnumInput from 'components/util/rhf-inputs/enum-input';
import RadioInput from 'components/util/rhf-inputs/radio-input';
import {
    SusceptanceAdornment,
    ReactivePowerAdornment,
    gridItem,
} from '../../dialogUtils';

// this component needs to be isolated to avoid too many rerenders
export const CharacteristicsForm = () => {
    const QatNominalVField = (
        <FloatInput
            name={Q_AT_NOMINAL_V}
            label={'QatNominalV'}
            adornment={ReactivePowerAdornment}
        />
    );

    const shuntCompensatorTypeField = (
        <EnumInput
            options={Object.values(SHUNT_COMPENSATOR_TYPES)}
            name={SHUNT_COMPENSATOR_TYPE}
            label={'Type'}
            size={'small'}
        />
    );

    const susceptancePerSectionField = (
        <FloatInput
            name={SUSCEPTANCE_PER_SECTION}
            label={'ShuntSusceptancePerSection'}
            adornment={SusceptanceAdornment}
        />
    );

    const characteristicsChoiceField = (
        <RadioInput
            name={CHARACTERISTICS_CHOICE}
            options={Object.values(CHARACTERISTICS_CHOICES)}
        />
    );

    const characteristicsChoice = useWatch({
        name: CHARACTERISTICS_CHOICE,
    });

    return (
        <>
            <Grid container spacing={2}>
                {gridItem(characteristicsChoiceField, 12)}
                {characteristicsChoice ===
                    CHARACTERISTICS_CHOICES.SUSCEPTANCE.id &&
                    gridItem(susceptancePerSectionField, 4)}
                {characteristicsChoice ===
                    CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id &&
                    gridItem(shuntCompensatorTypeField, 4)}
                <Box sx={{ width: '100%' }} />
                {characteristicsChoice ===
                    CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id &&
                    gridItem(QatNominalVField, 4)}
            </Grid>
        </>
    );
};
