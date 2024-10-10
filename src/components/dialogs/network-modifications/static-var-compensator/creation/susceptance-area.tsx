/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import {
    AUTOMATON,
    B0,
    CHARACTERISTICS_CHOICE,
    CHARACTERISTICS_CHOICES,
    MAX_Q_AT_V_NOMINAL,
    MAX_SUSCEPTANCE,
    MIN_Q_AT_NOMINAL_V,
    MIN_SUSCEPTANCE,
    Q0,
    SETPOINTS_LIMITS,
    SLIDER_Q_NOMINAL,
    SLIDER_SUSCEPTANCE,
} from 'components/utils/field-constants';
import { FloatInput, SliderInput } from '@gridsuite/commons-ui';
import { gridItem, ReactivePowerAdornment, SusceptanceAdornment } from '../../../dialogUtils';
import React, { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { InputAdornment, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';

export const SusceptanceArea = () => {
    const id = AUTOMATON;
    const { setValue } = useFormContext();
    const watchChoiceAutomaton = useWatch({ name: `${SETPOINTS_LIMITS}.${CHARACTERISTICS_CHOICE}` });
    const minS = useWatch({ name: `${SETPOINTS_LIMITS}.${MIN_SUSCEPTANCE}` });
    const maxS = useWatch({ name: `${SETPOINTS_LIMITS}.${MAX_SUSCEPTANCE}` });
    const minQ = useWatch({ name: `${SETPOINTS_LIMITS}.${MIN_Q_AT_NOMINAL_V}` });
    const maxQ = useWatch({ name: `${SETPOINTS_LIMITS}.${MAX_Q_AT_V_NOMINAL}` });

    useEffect(() => {
        const avgSfixeValue =
            Number.isNaN(parseFloat(minS)) || Number.isNaN(parseFloat(maxS))
                ? null
                : (parseFloat(minS) + parseFloat(maxS)) / 2;
        const avgQfixeValue =
            Number.isNaN(parseFloat(minQ)) || Number.isNaN(parseFloat(maxQ))
                ? null
                : (parseFloat(minQ) + parseFloat(maxQ)) / 2;
        setValue(`${id}.${SLIDER_SUSCEPTANCE}`, avgSfixeValue);
        setValue(`${id}.${SLIDER_Q_NOMINAL}`, avgQfixeValue);
    }, [setValue, minS, minQ, maxS, maxQ, id]);

    const onSliderSusceptanceChange = (value?: number) => {
        setValue(`${id}.${B0}`, value);
        return value;
    };

    const onSliderQnomChange = (value?: number) => {
        setValue(`${id}.${Q0}`, value);
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
            label={<FormattedMessage id={'maximumSusceptance'} />}
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

    const susceptanceField = <FloatInput name={`${id}.${B0}`} label="b0" adornment={SusceptanceAdornment} />;

    const qAtNominalVField = (
        <FloatInput name={`${id}.${Q0}`} label="ConstantQWithoutUnit" adornment={ReactivePowerAdornment} />
    );

    const sliderS = (
        <SliderInput
            name={`${id}.${SLIDER_SUSCEPTANCE}`}
            min={parseFloat(minS)}
            max={parseFloat(maxS)}
            step={0.1}
            onValueChanged={onSliderSusceptanceChange}
        />
    );
    const sliderQ = (
        <SliderInput
            name={`${id}.${SLIDER_Q_NOMINAL}`}
            min={parseFloat(minQ)}
            max={parseFloat(maxQ)}
            step={0.1}
            onValueChanged={onSliderQnomChange}
        />
    );

    const sliderSDisable = Number.isNaN(parseFloat(minS)) || Number.isNaN(parseFloat(maxS));
    const sliderQDisable = Number.isNaN(parseFloat(minQ)) || Number.isNaN(parseFloat(maxQ));
    return (
        <Grid container spacing={2} padding={2}>
            {watchChoiceAutomaton === CHARACTERISTICS_CHOICES.SUSCEPTANCE.id && (
                <>
                    {gridItem(minSusceptanceField, 3)}
                    {!sliderSDisable && gridItem(sliderS, 3)}
                    {gridItem(maxSusceptanceField, 3)}
                    {gridItem(susceptanceField, 3)}
                </>
            )}
            {watchChoiceAutomaton === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id && (
                <>
                    {gridItem(minQAtNominalVField, 3)}
                    {!sliderQDisable && gridItem(sliderQ, 3)}
                    {gridItem(maxQAtNominalVField, 3)}
                    {gridItem(qAtNominalVField, 3)}
                </>
            )}
        </Grid>
    );
};
