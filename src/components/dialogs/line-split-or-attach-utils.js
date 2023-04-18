/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// functions for useComplementaryPercentage

import { Slider, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import TextFieldWithAdornment from '../util/text-field-with-adornment';
import { validateField } from '../util/validation-functions';

function genHelperError(...errors) {
    const inError = errors.find((e) => e);
    if (inError) {
        return {
            error: true,
            helperText: <FormattedMessage id={inError} />,
        };
    }
    return {};
}

const maxDecimals = 1;

function asMostlyPercentStr(value) {
    if (value < 0) {
        return '0';
    }
    if (value > 100) {
        return '100';
    }
    if (typeof value === 'number') {
        return value.toFixed(maxDecimals);
    }
    if (typeof value !== 'string') {
        return '';
    }
    const rgxra = /^([0-9]*)([.,]*)([0-9]*)/.exec(value);
    if (!rgxra) {
        return '';
    }
    return (
        rgxra[1] + rgxra[2].substring(0, 1) + rgxra[3].substring(0, maxDecimals)
    );
}

function leftSideValue(str) {
    if (typeof str === 'string' && str.substring(0, 4) === '100-') {
        return str.substring(0, 3) - str.substring(4);
    }
    return str;
}

function slideValue(str) {
    if (typeof str === 'string' && str.substring(0, 4) === '100-') {
        const rest = str.substring(4);
        if (isNaN(rest)) {
            return 100;
        }
        return str.substring(0, 3) - rest;
    }
    return parseFloat(str);
}

function rightSideValue(str) {
    if (typeof str === 'string' && str.substring(0, 4) === '100-') {
        return str.substring(4);
    }
    const diff = 100 - str;
    return isNaN(diff) || diff === 100.0 ? '100' : diff.toFixed(maxDecimals);
}

export const useComplementaryPercentage = ({
    upperLeftText,
    upperRightText,
    validation,
    defaultValue,
    inputForm,
    formProps,
    errorMsg,
    id,
    label,
    ...props
}) => {
    function initValue(defaultValue) {
        return typeof defaultValue === 'number'
            ? defaultValue.toFixed(maxDecimals)
            : Number(50).toFixed(maxDecimals);
    }

    const [mostlyFloatStrValue, setMostlyFloatStrValue] = useState(
        initValue(defaultValue)
    );

    useEffect(() => {
        setMostlyFloatStrValue(initValue(defaultValue));
    }, [defaultValue]);

    const [error, setError] = useState();
    const validationRef = useRef();
    validationRef.current = validation;

    useEffect(() => {
        function validate() {
            const res = validateField(
                '' + mostlyFloatStrValue,
                validationRef.current
            );
            setError(res?.errorMsgId);
            return !res.error;
        }
        inputForm.addValidation(id ? id : label, validate);
    }, [validation, mostlyFloatStrValue, id, inputForm, label]);

    const handleChangeLeftValue = (event) => {
        setMostlyFloatStrValue(asMostlyPercentStr(event.target.value));
    };

    const handleChangeRightValue = (event) => {
        const floatValueStr = asMostlyPercentStr(event.target.value);
        const nextValue = '100-' + floatValueStr;
        setMostlyFloatStrValue(nextValue);
    };

    const handleSliderChange = (event, newValue) => {
        setMostlyFloatStrValue(asMostlyPercentStr(newValue));
    };

    return [
        mostlyFloatStrValue,
        <Grid container spacing={2}>
            <Grid container spacing={2} item>
                <Grid item xs={5} align={'start'}>
                    <Typography>{upperLeftText}</Typography>
                </Grid>
                <Grid item xs={2}></Grid>
                <Grid item xs={5} align={'end'}>
                    <Typography align="right">{upperRightText}</Typography>
                </Grid>
            </Grid>
            <Slider
                size="small"
                min={0.0}
                max={100.0}
                step={0.1}
                value={slideValue(mostlyFloatStrValue)}
                onChange={handleSliderChange}
            />
            <Grid container spacing={2} item>
                <Grid item xs={3} align={'start'}>
                    <TextFieldWithAdornment
                        size="small"
                        variant="standard"
                        adornmentText="%"
                        adornmentPosition="end"
                        fullWidth
                        value={leftSideValue(mostlyFloatStrValue)}
                        onChange={handleChangeLeftValue}
                        {...genHelperError(error, errorMsg)}
                        {...formProps}
                    />
                </Grid>
                <Grid item xs={6}></Grid>
                <Grid item xs={3} align={'end'}>
                    <TextFieldWithAdornment
                        size="small"
                        variant="standard"
                        adornmentText="%"
                        adornmentPosition="end"
                        fullWidth
                        value={rightSideValue(mostlyFloatStrValue)} // handle numerical mostlyFloatStrValue
                        onChange={handleChangeRightValue}
                        {...genHelperError(error, errorMsg)}
                        {...formProps}
                    />
                </Grid>
            </Grid>
        </Grid>,
    ];
};

export function makeVoltageLevelCreationParams(vlId, bobbsId, vl) {
    if (!vlId) {
        return null;
    }
    if (!bobbsId) {
        return { id: vlId };
    }
    return {
        ...(vl || {}),
        equipmentId: vlId,
        busbarSections: [{ id: bobbsId, horizPos: 1, vertPos: 1 }],
    };
}
