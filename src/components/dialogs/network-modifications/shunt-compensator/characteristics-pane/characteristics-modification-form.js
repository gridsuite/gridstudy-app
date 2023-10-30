/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import {
    CHARACTERISTICS_CHOICE,
    CHARACTERISTICS_CHOICES,
    Q_AT_NOMINAL_V,
    SHUNT_COMPENSATOR_TYPE,
    SHUNT_COMPENSATOR_TYPES,
    SUSCEPTANCE_PER_SECTION,
} from 'components/utils/field-constants';
import { Box } from '@mui/material';
import { useWatch } from 'react-hook-form';
import { FloatInput, RadioInput } from '@gridsuite/commons-ui';
import {
    gridItem,
    ReactivePowerAdornment,
    SusceptanceAdornment,
} from '../../../dialogUtils';
import { SelectInput } from '@gridsuite/commons-ui';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';

// to delete once the modification is on par with the creation form, this is the form without sections management
export const CharacteristicsModificationForm = ({
    previousValues,
    isModification = false,
}) => {
    const intl = useIntl();
    const QatNominalVField = (
        <FloatInput
            name={Q_AT_NOMINAL_V}
            label={'QatNominalV'}
            adornment={ReactivePowerAdornment}
            previousValue={previousValues?.qatNominalV}
            clearable={isModification}
        />
    );

    const previousHuntCompensatorType = useMemo(
        () =>
            previousValues?.bperSection
                ? intl.formatMessage({
                      id:
                          previousValues.bperSection > 0
                              ? SHUNT_COMPENSATOR_TYPES.CAPACITOR.label
                              : SHUNT_COMPENSATOR_TYPES.REACTOR.label,
                  })
                : '',
        [previousValues?.bperSection, intl]
    );

    const shuntCompensatorTypeField = (
        <SelectInput
            options={Object.values(SHUNT_COMPENSATOR_TYPES)}
            name={SHUNT_COMPENSATOR_TYPE}
            label={'Type'}
            size={'small'}
            previousValue={previousHuntCompensatorType}
        />
    );

    const susceptancePerSectionField = (
        <FloatInput
            name={SUSCEPTANCE_PER_SECTION}
            label={'ShuntSusceptancePerSection'}
            adornment={SusceptanceAdornment}
            previousValue={previousValues?.bperSection}
            clearable={isModification}
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
