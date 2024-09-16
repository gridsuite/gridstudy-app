/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import {
    B0,
    CHARACTERISTICS_CHOICE_AUTOMATON,
    CHARACTERISTICS_CHOICES,
    MAX_Q_AT_NOMINAL_V,
    MAX_SUSCEPTANCE,
    MIN_Q_AT_NOMINAL_V,
    MIN_SUSCEPTANCE,
    Q0,
    SLIDER_Q_NOMINAL,
    SLIDER_SUSCEPTANCE,
} from 'components/utils/field-constants';
import { SliderInput, TextInput } from '@gridsuite/commons-ui';
import { gridItem, ReactivePowerAdornment, SusceptanceAdornment } from '../../../dialogUtils';
import React, { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { getFloatNumber } from './stand-by-automaton-form-utils';
import { isValidPercentage } from '../../../percentage-area/percentage-area-utils';
import { InputAdornment, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';

export const SusceptanceArea = () => {
    const { setValue } = useFormContext();
    const watchChoiceAutomaton = useWatch({ name: CHARACTERISTICS_CHOICE_AUTOMATON });
    const minS = useWatch({ name: MIN_SUSCEPTANCE });
    const maxS = useWatch({ name: MAX_SUSCEPTANCE });
    const minQ = useWatch({ name: MIN_Q_AT_NOMINAL_V });
    const maxQ = useWatch({ name: MAX_Q_AT_NOMINAL_V });

    useEffect(() => {
        let avgSfixeValue = (getFloatNumber(minS) + getFloatNumber(maxS)) / 2;
        let avgQfixeValue = (getFloatNumber(minQ) + getFloatNumber(maxQ)) / 2;
        setValue(B0, avgSfixeValue);
        setValue(SLIDER_SUSCEPTANCE, avgSfixeValue);
        setValue(Q0, avgQfixeValue);
        setValue(SLIDER_Q_NOMINAL, avgQfixeValue);
    }, [setValue, minS, minQ, maxS, maxQ]);

    const onSliderSusceptanceChange = (value: string) => {
        setValue(B0, getFloatNumber(value));
        return value;
    };

    const onSliderQnomChange = (value: string) => {
        setValue(Q0, getFloatNumber(value));
        return value;
    };

    const handleSusceptanceValueChange = (value: string) => {
        setValue(SLIDER_SUSCEPTANCE, getFloatNumber(value));
        return value;
    };

    const handleQnomValueChange = (value: string) => {
        setValue(SLIDER_Q_NOMINAL, getFloatNumber(value));
        return value;
    };

    const minSusceptanceField = (
        <TextField
            value={minS}
            label={<FormattedMessage id={'minSusceptance'} />}
            disabled={true}
            size={'small'}
            InputProps={{
                endAdornment: <InputAdornment position="start">S</InputAdornment>,
            }}
        />
    );

    const maxSusceptanceField = (
        <TextField
            value={maxS}
            label={<FormattedMessage id={'maxSusceptance'} />}
            disabled={true}
            size={'small'}
            InputProps={{
                endAdornment: <InputAdornment position="start">S</InputAdornment>,
            }}
        />
    );

    const minQAtNominalVField = (
        <TextField
            value={minQ}
            label={<FormattedMessage id={'minQ'} />}
            disabled={true}
            size={'small'}
            InputProps={{
                endAdornment: <InputAdornment position="start">MVA</InputAdornment>,
            }}
        />
    );

    const maxQAtNominalVField = (
        <TextField
            value={maxQ}
            label={<FormattedMessage id={'maxQ'} />}
            disabled={true}
            size={'small'}
            InputProps={{
                endAdornment: <InputAdornment position="start">MVA</InputAdornment>,
            }}
        />
    );

    const susceptanceField = (
        <TextInput
            name={B0}
            label="b0"
            adornment={SusceptanceAdornment}
            acceptValue={isValidPercentage}
            outputTransform={handleSusceptanceValueChange}
        />
    );

    const qAtNominalVField = (
        <TextInput
            name={Q0}
            label="q0"
            adornment={ReactivePowerAdornment}
            acceptValue={isValidPercentage}
            outputTransform={handleQnomValueChange}
        />
    );

    const sliderS = (
        <SliderInput
            name={SLIDER_SUSCEPTANCE}
            min={getFloatNumber(minS)}
            max={getFloatNumber(maxS)}
            step={0.1}
            onValueChanged={onSliderSusceptanceChange}
        />
    );
    const sliderQ = (
        <SliderInput
            name={SLIDER_Q_NOMINAL}
            min={getFloatNumber(minQ)}
            max={getFloatNumber(maxQ)}
            step={0.1}
            onValueChanged={onSliderQnomChange}
        />
    );

    return (
        <>
            {watchChoiceAutomaton === CHARACTERISTICS_CHOICES.SUSCEPTANCE.id && (
                <Grid container spacing={2} padding={2}>
                    {gridItem(minSusceptanceField, 3)}
                    {gridItem(sliderS, 3)}
                    {gridItem(maxSusceptanceField, 3)}
                    {gridItem(susceptanceField, 3)}
                </Grid>
            )}
            {watchChoiceAutomaton === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id && (
                <Grid container spacing={2} padding={2}>
                    {gridItem(minQAtNominalVField, 3)}
                    {gridItem(sliderQ, 3)}
                    {gridItem(maxQAtNominalVField, 3)}
                    {gridItem(qAtNominalVField, 3)}
                </Grid>
            )}
        </>
    );
};
