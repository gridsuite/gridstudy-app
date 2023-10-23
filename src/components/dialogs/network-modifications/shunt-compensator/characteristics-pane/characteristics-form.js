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
    MAX_Q_AT_NOMINAL_V,
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

    const [
        sectionCount,
        maximumSectionCount,
        maxQAtNominalV,
        maxSusceptance,
        characteristicsChoice,
    ] = useWatch({
        name: [
            SECTION_COUNT,
            MAXIMUM_SECTION_COUNT,
            MAX_Q_AT_NOMINAL_V,
            MAX_SUSCEPTANCE,
            CHARACTERISTICS_CHOICE,
        ],
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

    const maxQAtNominalVField = (
        <FloatInput
            name={MAX_Q_AT_NOMINAL_V}
            label={'maxQAtNominalV'}
            adornment={ReactivePowerAdornment}
            previousValue={previousValues?.maxQAtNominalV}
            clearable={isModification}
        />
    );

    const switchedOnMaxQAtNominalVField = (
        <FloatInput
            name={SWITCHED_ON_Q_AT_NOMINAL_V}
            label={'SwitchedOnMaxQAtNominalV'}
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
        (linkedSwitchedOnValue, SWITCHED_ON_FIELD) => {
            if (
                ![
                    sectionCount,
                    maximumSectionCount,
                    linkedSwitchedOnValue,
                ].includes(null)
            ) {
                trigger(SECTION_COUNT).then((isValid) => {
                    if (isValid) {
                        setValue(
                            SWITCHED_ON_FIELD,
                            (linkedSwitchedOnValue / maximumSectionCount) *
                                sectionCount
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
            handleSwitchedOnValue(maxQAtNominalV, SWITCHED_ON_Q_AT_NOMINAL_V);
        } else if (
            characteristicsChoice === CHARACTERISTICS_CHOICES.SUSCEPTANCE.id
        ) {
            handleSwitchedOnValue(maxSusceptance, SWITCHED_ON_SUSCEPTANCE);
        }
    }, [
        maxQAtNominalV,
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
                    gridItem(maxQAtNominalVField, 4)}
                {characteristicsChoice ===
                    CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id &&
                    gridItem(switchedOnMaxQAtNominalVField, 4)}
            </Grid>
        </>
    );
};
