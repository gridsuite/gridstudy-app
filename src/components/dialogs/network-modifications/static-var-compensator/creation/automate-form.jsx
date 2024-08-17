/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import {
    ADD_AUTOMATE,
    B0,
    CHARACTERISTICS_CHOICE,
    CHARACTERISTICS_CHOICES,
    HIGH_VOLTAGE_SET_POINT,
    HIGH_VOLTAGE_THRESHOLD,
    LOW_VOLTAGE_SET_LIMIT,
    LOW_VOLTAGE_THRESHOLD,
    MAX_Q_AT_NOMINAL_V,
    MAX_SUSCEPTANCE,
    MIN_Q_AT_NOMINAL_V,
    MIN_SUSCEPTANCE,
    Q0,
    SLIDER_Q_NOMINAL,
    SLIDER_SUSCEPTANCE,
    STAND_BY_AUTOMATE,
    VOLTAGE_REGULATION_MODE,
    VOLTAGE_REGULATION_MODES,
} from 'components/utils/field-constants';
import { CheckboxInput, FloatInput, SelectInput, SliderInput, SwitchInput, TextInput } from '@gridsuite/commons-ui';
import { gridItem, ReactivePowerAdornment, SusceptanceAdornment, VoltageAdornment } from '../../../dialogUtils';
import { Box } from '@mui/system';
import React, { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import yup from '../../../../utils/yup-config';
import { FormattedMessage } from 'react-intl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tooltip from '@mui/material/Tooltip';
import { WarningAmber } from '@mui/icons-material';

export const getAutomateEmptyFormData = () => ({
    [ADD_AUTOMATE]: false,
    [CHARACTERISTICS_CHOICE]: CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
    [STAND_BY_AUTOMATE]: false,
    [LOW_VOLTAGE_SET_LIMIT]: null,
    [HIGH_VOLTAGE_SET_POINT]: null,
    [LOW_VOLTAGE_THRESHOLD]: null,
    [HIGH_VOLTAGE_THRESHOLD]: null,
    [SLIDER_Q_NOMINAL]: null,
    [SLIDER_SUSCEPTANCE]: null,
    [Q0]: null,
    [B0]: null,
});

const createField = (Component, name, label, adornment = null, additionalProps = {}) => (
    <Component name={name} label={label} adornment={adornment} size="small" formProps={additionalProps} />
);

export const getAutomateFormValidationSchema = () => ({
    [ADD_AUTOMATE]: yup.boolean().nullable(),
    [STAND_BY_AUTOMATE]: yup
        .boolean()
        .nullable()
        .when([ADD_AUTOMATE, VOLTAGE_REGULATION_MODE], {
            is: (addAutomate, voltageRegulationMode) =>
                addAutomate && voltageRegulationMode === VOLTAGE_REGULATION_MODES.VOLTAGE.id,
            then: (schema) => schema.required(),
        }),
    [LOW_VOLTAGE_SET_LIMIT]: yup
        .number()
        .nullable()
        .when([ADD_AUTOMATE], {
            is: true,
            then: (schema) => schema.required(),
        }),
    [HIGH_VOLTAGE_SET_POINT]: yup
        .number()
        .nullable()
        .when([ADD_AUTOMATE], {
            is: true,
            then: (schema) => schema.required(),
        }),
    [LOW_VOLTAGE_THRESHOLD]: yup
        .number()
        .nullable()
        .when([ADD_AUTOMATE], {
            is: true,
            then: (schema) => schema.required(),
        }),
    [HIGH_VOLTAGE_THRESHOLD]: yup
        .number()
        .nullable()
        .when([ADD_AUTOMATE], {
            is: true,
            then: (schema) => schema.required(),
        }),
    [CHARACTERISTICS_CHOICE]: yup
        .string()
        .nullable()
        .when([ADD_AUTOMATE], {
            is: true,
            then: (schema) => schema.required(),
        }),
    [Q0]: yup
        .number()
        .nullable()
        .when([ADD_AUTOMATE], {
            is: true,
            then: (schema) => schema.required(),
        }),
    [B0]: yup
        .number()
        .nullable()
        .when([ADD_AUTOMATE], {
            is: true,
            then: (schema) => schema.required(),
        }),
});

export const getAutomateFormData = ({
    addAutomate,
    standBy,
    lVoltageSetPoint,
    hVoltageSetPoint,
    lVoltageThreshold,
    hVoltageThreshold,
    minSusceptance,
    maxSusceptance,
    minQAtNormalV,
    maxQAtNormalV,
    q0,
    b0,
}) => {
    return {
        [ADD_AUTOMATE]: addAutomate,
        [STAND_BY_AUTOMATE]: standBy,
        [LOW_VOLTAGE_SET_LIMIT]: lVoltageSetPoint,
        [HIGH_VOLTAGE_SET_POINT]: hVoltageSetPoint,
        [LOW_VOLTAGE_THRESHOLD]: lVoltageThreshold,
        [HIGH_VOLTAGE_THRESHOLD]: hVoltageThreshold,
        [MIN_SUSCEPTANCE]: minSusceptance,
        [MAX_SUSCEPTANCE]: maxSusceptance,
        [MIN_Q_AT_NOMINAL_V]: minQAtNormalV,
        [MAX_Q_AT_NOMINAL_V]: maxQAtNormalV,
        [Q0]: q0,
        [B0]: b0,
    };
};

export const AutomateForm = () => {
    const { setValue, getValues } = useFormContext();
    const [isHover, setHover] = useState(false);
    const watchAddAutomateProps = useWatch({
        name: ADD_AUTOMATE,
    });
    const watchVoltageMode = useWatch({ name: VOLTAGE_REGULATION_MODE });
    const watchProps = useWatch({ name: CHARACTERISTICS_CHOICE });
    const watchQmin = getValues(MIN_Q_AT_NOMINAL_V);
    const watchQmax = getValues(MAX_Q_AT_NOMINAL_V);
    const watchSuceptanceMin = getValues(MIN_SUSCEPTANCE);
    const watchSuceptanceMax = getValues(MAX_SUSCEPTANCE);
    const [standByDisabled, setStandByDisabled] = useState(watchVoltageMode === VOLTAGE_REGULATION_MODES.VOLTAGE.id);
    const isSusceptance = watchProps === CHARACTERISTICS_CHOICES.SUSCEPTANCE.id;
    const isQFixe = watchProps === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id;
    useEffect(() => {
        let avgValue = (Number(watchQmin) + Number(watchQmax)) / 2;
        setValue(SLIDER_Q_NOMINAL, avgValue);
        setValue(Q0, avgValue);
        setStandByDisabled(watchVoltageMode === VOLTAGE_REGULATION_MODES.VOLTAGE.id);
    }, [watchQmin, watchQmax, setValue, setStandByDisabled, watchVoltageMode]);

    const fields = {
        modeAutomate: createField(TextInput, VOLTAGE_REGULATION_MODE, 'ModeAutomate', null, {
            disabled: true,
        }),
        standBy: (
            <Grid container onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
                <Grid container item xs={12}>
                    <FormControlLabel
                        value="StandByAutomate"
                        control={
                            <SwitchInput
                                name={STAND_BY_AUTOMATE}
                                formProps={{
                                    disabled: !standByDisabled,
                                }}
                            />
                        }
                        label=<FormattedMessage id="StandByAutomate" />
                        labelPlacement="start"
                    />
                    {isHover && !standByDisabled && (
                        <Box marginLeft={2} marginTop={'5px'}>
                            <Tooltip title={<FormattedMessage id="StandbyNotAvailable" />}>
                                <WarningAmber color="warning"></WarningAmber>
                            </Tooltip>
                        </Box>
                    )}
                </Grid>
            </Grid>
        ),
        lVoltageSetLimit: createField(FloatInput, LOW_VOLTAGE_SET_LIMIT, 'LowVoltageSetLimit', VoltageAdornment),
        hVoltageSetLimit: createField(FloatInput, HIGH_VOLTAGE_SET_POINT, 'HighVoltageSetLimit', VoltageAdornment),
        lVoltageThreshold: createField(FloatInput, LOW_VOLTAGE_THRESHOLD, 'LowVoltageThreshold', SusceptanceAdornment),
        hVoltageThreshold: createField(
            FloatInput,
            HIGH_VOLTAGE_THRESHOLD,
            'HighVoltageThreshold',
            SusceptanceAdornment
        ),
    };

    const minQAtNominalVField = (
        <FloatInput
            key="minQ"
            name={MIN_Q_AT_NOMINAL_V}
            label="minQAtNominalV"
            adornment={ReactivePowerAdornment}
            formProps={{ disabled: true }}
        />
    );

    const maxQAtNominalVField = (
        <FloatInput
            key="maxQ"
            name={MAX_Q_AT_NOMINAL_V}
            label="maxQAtNominalV"
            adornment={ReactivePowerAdornment}
            formProps={{ disabled: true }}
        />
    );
    const minSusceptanceField = (
        <FloatInput
            key="minS"
            name={MIN_SUSCEPTANCE}
            label="minSusceptance"
            adornment={SusceptanceAdornment}
            formProps={{ disabled: true }}
        />
    );

    const maxSusceptanceField = (
        <FloatInput key="minS" name={MAX_SUSCEPTANCE} label="maxSusceptance" adornment={SusceptanceAdornment} />
    );

    const susceptanceField = <FloatInput key="S" name={B0} label="b0" adornment={SusceptanceAdornment} />;

    const qAtNominalVField = <FloatInput key="Q" name={Q0} label="q0" adornment={ReactivePowerAdornment} />;

    const sliderQ = <SliderInput name={SLIDER_Q_NOMINAL} min={watchQmin} max={watchQmax} />;
    const sliderS = <SliderInput name={SLIDER_SUSCEPTANCE} min={watchSuceptanceMin} max={watchSuceptanceMax} />;

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <Box>
                        <CheckboxInput name={ADD_AUTOMATE} label="AddAutomaton" size="small" />
                    </Box>
                </Grid>
                {watchAddAutomateProps && (
                    <>
                        <Grid container spacing={2} padding={2}>
                            {Object.keys(fields).map((key, index) => (
                                <Grid item xs={6} align="start" key={index}>
                                    {fields[key]}
                                </Grid>
                            ))}
                        </Grid>

                        <Grid container spacing={2} padding={2}>
                            <Grid item xs={6} align="start">
                                <SelectInput
                                    name={CHARACTERISTICS_CHOICE}
                                    options={Object.values(CHARACTERISTICS_CHOICES)}
                                    fullWidth
                                    disableClearable
                                    size="small"
                                />
                            </Grid>
                        </Grid>
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
                )}
            </Grid>
        </>
    );
};
