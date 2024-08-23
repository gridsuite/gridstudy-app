/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import {
    B0,
    MAX_Q_AT_NOMINAL_V,
    MAX_SUSCEPTANCE,
    MIN_Q_AT_NOMINAL_V,
    MIN_SUSCEPTANCE,
    Q0,
    SLIDER_Q_NOMINAL,
    SLIDER_SUSCEPTANCE,
} from 'components/utils/field-constants';
import { FloatInput, SliderInput, TextInput } from '@gridsuite/commons-ui';
import { gridItem, ReactivePowerAdornment, SusceptanceAdornment } from '../../../dialogUtils';
import React, { FunctionComponent, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { getFloatNumber } from './automate-form-utils';
import { isValidPercentage } from '../../../percentage-area/percentage-area-utils';

export interface SusceptanceAreaProps {
    isSusceptance: boolean;
    isQFixe: boolean;
    min: number;
    max: number;
}
export const SusceptanceArea: FunctionComponent<SusceptanceAreaProps> = ({ isSusceptance, isQFixe, min, max }) => {
    const { setValue } = useFormContext();

    useEffect(() => {
        let avgValue = (Number(min) + Number(max)) / 2;
        if (isSusceptance) {
            setValue(B0, avgValue);
            setValue(SLIDER_SUSCEPTANCE, avgValue);
        } else if (isQFixe) {
            setValue(Q0, avgValue);
            setValue(SLIDER_Q_NOMINAL, avgValue);
        }
    }, [setValue, isSusceptance, isQFixe, min, max]);

    const onSliderSusceptanceChange = (value: any) => {
        setValue(B0, getFloatNumber(value));
        return value;
    };

    const onSliderQnomChange = (value: any) => {
        setValue(Q0, getFloatNumber(value));
        return value;
    };

    const handleSusceptanceValueChange = (value: any) => {
        setValue(SLIDER_SUSCEPTANCE, getFloatNumber(value));
        return value;
    };

    const handleQnomValueChange = (value: any) => {
        setValue(SLIDER_Q_NOMINAL, parseFloat(value));
        return value;
    };

    const minSusceptanceField = (
        <FloatInput
            name={MIN_SUSCEPTANCE}
            label="minSusceptance"
            adornment={SusceptanceAdornment}
            formProps={{ disabled: true }}
        />
    );

    const maxSusceptanceField = (
        <FloatInput
            name={MAX_SUSCEPTANCE}
            label="maxSusceptance"
            adornment={SusceptanceAdornment}
            formProps={{ disabled: true }}
        />
    );

    const minQAtNominalVField = (
        <FloatInput
            name={MIN_Q_AT_NOMINAL_V}
            label="minQAtNominalV"
            adornment={ReactivePowerAdornment}
            formProps={{ disabled: true }}
        />
    );

    const maxQAtNominalVField = (
        <FloatInput
            name={MAX_Q_AT_NOMINAL_V}
            label="maxQAtNominalV"
            adornment={ReactivePowerAdornment}
            formProps={{ disabled: true }}
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
            min={min}
            max={max}
            step={1}
            onValueChanged={onSliderSusceptanceChange}
        />
    );
    const sliderQ = (
        <SliderInput name={SLIDER_Q_NOMINAL} min={min} max={max} step={1} onValueChanged={onSliderQnomChange} />
    );

    return (
        <>
            {isSusceptance && (
                <Grid container spacing={2} padding={2}>
                    {gridItem(minSusceptanceField, 3)}
                    {gridItem(sliderS, 3)}
                    {gridItem(maxSusceptanceField, 3)}
                    {gridItem(susceptanceField, 3)}
                </Grid>
            )}
            {isQFixe && (
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
