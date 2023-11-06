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
import {
    FloatInput,
    IntegerInput,
    RadioInput,
    SelectInput,
} from '@gridsuite/commons-ui';
import {
    gridItem,
    ReactivePowerAdornment,
    SusceptanceAdornment,
} from '../../../dialogUtils';
import { useCallback, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';

// this component needs to be isolated to avoid too many rerenders
export const CharacteristicsForm = ({
    previousValues,
    isModification = false,
}) => {
    const intl = useIntl();
    const {
        setValue,
        clearErrors,
        formState: { isSubmitted },
    } = useFormContext();

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

    const previousMaxQAtNominalV = useMemo(
        () => previousValues?.qatNominalV * previousValues?.maximumSectionCount,
        [previousValues]
    );

    const previousMaxSusceptance = useMemo(
        () => previousValues?.bperSection * previousValues?.maximumSectionCount,
        [previousValues]
    );
    const currentSectionCount = useMemo(
        () => sectionCount ?? previousValues?.sectionCount,
        [sectionCount, previousValues]
    );

    const currentMaximumSectionCount = useMemo(
        () => maximumSectionCount ?? previousValues?.maximumSectionCount,
        [maximumSectionCount, previousValues]
    );

    const currentMaxQAtNominalV = useMemo(
        () => maxQAtNominalV ?? previousMaxQAtNominalV,
        [maxQAtNominalV, previousMaxQAtNominalV]
    );

    const currentMaxSusceptance = useMemo(
        () => maxSusceptance ?? previousMaxSusceptance,
        [maxSusceptance, previousMaxSusceptance]
    );

    const maximumSectionCountField = (
        <IntegerInput
            name={MAXIMUM_SECTION_COUNT}
            label={'MaximumSectionCount'}
            previousValue={previousValues?.maximumSectionCount}
            clearable={isModification}
        />
    );

    const sectionCountField = (
        <IntegerInput
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
            previousValue={previousMaxQAtNominalV}
            clearable={isModification}
        />
    );

    const switchedOnMaxQAtNominalVField = (
        <FloatInput
            name={SWITCHED_ON_Q_AT_NOMINAL_V}
            label={'SwitchedOnMaxQAtNominalV'}
            adornment={ReactivePowerAdornment}
            previousValue={
                previousValues?.qatNominalV * previousValues?.sectionCount
            }
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
            previousValue={previousMaxSusceptance}
            clearable={isModification}
        />
    );

    const switchedOnSusceptanceField = (
        <FloatInput
            name={SWITCHED_ON_SUSCEPTANCE}
            label={'SwitchedOnMaxSusceptance'}
            adornment={SusceptanceAdornment}
            previousValue={
                previousValues?.bperSection * previousValues?.sectionCount
            }
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
                    currentSectionCount,
                    currentMaximumSectionCount,
                    linkedSwitchedOnValue,
                ].includes(null)
            ) {
                if (currentMaximumSectionCount > currentSectionCount) {
                    setValue(
                        SWITCHED_ON_FIELD,
                        (linkedSwitchedOnValue / currentMaximumSectionCount) *
                            currentSectionCount
                    );
                } else {
                    setValue(SWITCHED_ON_FIELD, null);
                }

                if (!isSubmitted) {
                    clearErrors(SECTION_COUNT);
                }
            } else {
                setValue(SWITCHED_ON_FIELD, null);
            }
        },
        [
            currentSectionCount,
            currentMaximumSectionCount,
            isSubmitted,
            setValue,
            clearErrors,
        ]
    );

    useEffect(() => {
        if (
            characteristicsChoice === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id
        ) {
            handleSwitchedOnValue(
                currentMaxQAtNominalV,
                SWITCHED_ON_Q_AT_NOMINAL_V
            );
        } else if (
            characteristicsChoice === CHARACTERISTICS_CHOICES.SUSCEPTANCE.id
        ) {
            handleSwitchedOnValue(
                currentMaxSusceptance,
                SWITCHED_ON_SUSCEPTANCE
            );
        }
    }, [
        characteristicsChoice,
        handleSwitchedOnValue,
        previousValues,
        currentMaxQAtNominalV,
        currentMaxSusceptance,
    ]);

    return (
        <Grid container spacing={2}>
            {gridItem(maximumSectionCountField, 4)}
            {gridItem(sectionCountField, 4)}
            {gridItem(characteristicsChoiceField, 12)}
            {characteristicsChoice ===
                CHARACTERISTICS_CHOICES.SUSCEPTANCE.id && (
                <Grid item container spacing={2}>
                    {gridItem(maxSusceptanceField, 4)}
                    {gridItem(switchedOnSusceptanceField, 4)}
                </Grid>
            )}
            {characteristicsChoice ===
                CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id && (
                <Grid item container spacing={2}>
                    {gridItem(shuntCompensatorTypeField, 4)}
                    <Box sx={{ width: '100%' }} />
                    {gridItem(maxQAtNominalVField, 4)}
                    {gridItem(switchedOnMaxQAtNominalVField, 4)}
                </Grid>
            )}
        </Grid>
    );
};
