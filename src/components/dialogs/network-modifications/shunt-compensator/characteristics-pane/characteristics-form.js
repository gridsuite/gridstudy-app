/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import {
    CHARACTERISTICS_CHOICE,
    CHARACTERISTICS_CHOICES,
    MAXIMUM_SECTION_COUNT,
    MAX_SUSCEPTANCE,
    QMAX_AT_NOMINAL_V,
    SECTION_COUNT,
    SHUNT_COMPENSATOR_TYPE,
    SHUNT_COMPENSATOR_TYPES,
    SWITCHED_ON_Q_AT_NOMINAL_V,
    SWITCHED_ON_SUSCEPTANCE,
} from 'components/utils/field-constants';
import { Box } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { FloatInput } from '@gridsuite/commons-ui';
import { RadioInput } from '@gridsuite/commons-ui';
import {
    gridItem,
    ReactivePowerAdornment,
    SusceptanceAdornment,
} from '../../../dialogUtils';
import { SelectInput } from '@gridsuite/commons-ui';
import { useCallback, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';

// this component needs to be isolated to avoid too many rerenders
export const CharacteristicsForm = ({
    previousValues,
    isModification = false,
}) => {
    const intl = useIntl();
    const { setValue, trigger, clearErrors } = useFormContext();

    const sectionCount = useWatch({
        name: SECTION_COUNT,
    });
    const maximumSectionCount = useWatch({
        name: MAXIMUM_SECTION_COUNT,
    });

    const QMaxAtNominalV = useWatch({
        name: QMAX_AT_NOMINAL_V,
    });
    const maxSusceptance = useWatch({
        name: MAX_SUSCEPTANCE,
    });

    const characteristicsChoice = useWatch({
        name: CHARACTERISTICS_CHOICE,
    });

    const maximumSectionCountField = (
        <FloatInput
            name={MAXIMUM_SECTION_COUNT}
            label={'MaximumSectionCount'}
            previousValue={previousValues?.maximumSectionCount}
            clearable={isModification}
        />
    );

    const sectionCountField = (
        <FloatInput
            name={SECTION_COUNT}
            label={'ShuntSectionCount'}
            previousValue={previousValues?.sectionCount}
            clearable={isModification}
        />
    );

    const QMaxAtNominalVField = (
        <FloatInput
            name={QMAX_AT_NOMINAL_V}
            label={'QMaxAtNominalV'}
            adornment={ReactivePowerAdornment}
            previousValue={previousValues?.QMaxAtNominalV}
            clearable={isModification}
        />
    );

    const switchedOnQMaxAtNominalVField = (
        <FloatInput
            name={SWITCHED_ON_Q_AT_NOMINAL_V}
            label={'SwitchedOnQMaxAtNominalV'}
            adornment={ReactivePowerAdornment}
            clearable={isModification}
            formProps={{
                disabled: true,
            }}
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

    const maxSusceptanceField = (
        <FloatInput
            name={MAX_SUSCEPTANCE}
            label={'MaxShuntSusceptance'}
            adornment={SusceptanceAdornment}
            previousValue={previousValues?.bperSection}
            clearable={isModification}
        />
    );

    const switchedOnSusceptanceField = (
        <FloatInput
            name={SWITCHED_ON_SUSCEPTANCE}
            label={'SwitchedOnMaxSusceptance'}
            adornment={SusceptanceAdornment}
            clearable={isModification}
            formProps={{
                disabled: true,
            }}
        />
    );

    const characteristicsChoiceField = (
        <RadioInput
            name={CHARACTERISTICS_CHOICE}
            options={Object.values(CHARACTERISTICS_CHOICES)}
        />
    );

    const handleSwitchedOnValue = useCallback(
        (linkedValue, SWITCHED_ON_FIELD) => {
            if (
                ![sectionCount, maximumSectionCount, linkedValue].includes(null)
            ) {
                trigger(SECTION_COUNT).then((isValid) => {
                    if (isValid) {
                        setValue(
                            SWITCHED_ON_FIELD,
                            (linkedValue / maximumSectionCount) * sectionCount
                        );
                    } else {
                        setValue(SWITCHED_ON_FIELD, null);
                    }
                });
            } else {
                setValue(SWITCHED_ON_FIELD, null);
                clearErrors(SECTION_COUNT);
            }
        },
        [maximumSectionCount, sectionCount, clearErrors, setValue, trigger]
    );

    useEffect(() => {
        if (
            characteristicsChoice === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id
        ) {
            handleSwitchedOnValue(QMaxAtNominalV, SWITCHED_ON_Q_AT_NOMINAL_V);
        } else if (
            characteristicsChoice === CHARACTERISTICS_CHOICES.SUSCEPTANCE.id
        ) {
            handleSwitchedOnValue(maxSusceptance, SWITCHED_ON_SUSCEPTANCE);
        }
    }, [
        QMaxAtNominalV,
        maxSusceptance,
        characteristicsChoice,
        handleSwitchedOnValue,
    ]);

    return (
        <>
            <Grid container spacing={2}>
                {gridItem(maximumSectionCountField, 4)}
                {gridItem(sectionCountField, 4)}
                {gridItem(characteristicsChoiceField, 12)}
                {characteristicsChoice ===
                    CHARACTERISTICS_CHOICES.SUSCEPTANCE.id &&
                    gridItem(maxSusceptanceField, 4)}
                {characteristicsChoice ===
                    CHARACTERISTICS_CHOICES.SUSCEPTANCE.id &&
                    gridItem(switchedOnSusceptanceField, 4)}
                {characteristicsChoice ===
                    CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id &&
                    gridItem(shuntCompensatorTypeField, 4)}
                <Box sx={{ width: '100%' }} />
                {characteristicsChoice ===
                    CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id &&
                    gridItem(QMaxAtNominalVField, 4)}
                {characteristicsChoice ===
                    CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id &&
                    gridItem(switchedOnQMaxAtNominalVField, 4)}
            </Grid>
        </>
    );
};
