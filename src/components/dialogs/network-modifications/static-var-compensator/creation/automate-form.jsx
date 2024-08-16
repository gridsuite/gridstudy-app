/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import {
    ADD_AUTOMATE,
    HIGH_VOLTAGE_SET_POINT,
    HIGH_VOLTAGE_THRESHOLD,
    LOW_VOLTAGE_SET_LIMIT,
    LOW_VOLTAGE_THRESHOLD,
    MODE_AUTOMATE,
    STAND_BY_AUTOMATE,
} from 'components/utils/field-constants';
import { CheckboxInput, FloatInput, SwitchInput, TextInput } from '@gridsuite/commons-ui';
import { SusceptanceAdornment, VoltageAdornment } from '../../../dialogUtils';
import { Box } from '@mui/system';
import React from 'react';
import { useWatch } from 'react-hook-form';
import yup from '../../../../utils/yup-config';
import { FormattedMessage } from 'react-intl';

export const getAutomateEmptyFormData = () => ({
    [ADD_AUTOMATE]: false,
    [MODE_AUTOMATE]: null,
    [STAND_BY_AUTOMATE]: false,
    [LOW_VOLTAGE_SET_LIMIT]: null,
    [HIGH_VOLTAGE_SET_POINT]: null,
    [LOW_VOLTAGE_THRESHOLD]: null,
    [HIGH_VOLTAGE_THRESHOLD]: null,
});

const createField = (Component, name, label, adornment = null, additionalProps = {}) => (
    <Component name={name} label={label} adornment={adornment} size="small" {...additionalProps} />
);

export const getAutomateFormValidationSchema = () => ({
    [ADD_AUTOMATE]: yup.boolean().nullable(),
    [MODE_AUTOMATE]: yup.string().nullable(),
    [STAND_BY_AUTOMATE]: yup.boolean().nullable(),
    [LOW_VOLTAGE_SET_LIMIT]: yup.number().nullable(),
    [HIGH_VOLTAGE_SET_POINT]: yup.number().nullable(),
    [LOW_VOLTAGE_THRESHOLD]: yup.number().nullable(),
    [HIGH_VOLTAGE_THRESHOLD]: yup.number().nullable(),
});
export const AutomateForm = () => {
    const watchAddAutomateProps = useWatch({
        name: ADD_AUTOMATE,
    });
    const fields = {
        modeAutomate: createField(TextInput, MODE_AUTOMATE, 'ModeAutomate', null, { disabled: true }),
        standBy: (
            <Box>
                <FormattedMessage id="StandByAutomate" />
                <SwitchInput name={STAND_BY_AUTOMATE} size="small" />
            </Box>
        ),
        lowVoltageSetLimit: createField(FloatInput, LOW_VOLTAGE_SET_LIMIT, 'LowVoltageSetLimit', VoltageAdornment),
        highVoltageSetLimit: createField(FloatInput, HIGH_VOLTAGE_SET_POINT, 'HighVoltageSetLimit', VoltageAdornment),
        lowVoltageThreshold: createField(
            FloatInput,
            LOW_VOLTAGE_THRESHOLD,
            'lowVoltageThreshold',
            SusceptanceAdornment
        ),
        highVoltageThreshold: createField(
            FloatInput,
            HIGH_VOLTAGE_THRESHOLD,
            'highVoltageThreshold',
            SusceptanceAdornment
        ),
    };

    return (
        <Grid container spacing={1}>
            <Grid item xs={4}>
                <Box>
                    <CheckboxInput name={ADD_AUTOMATE} label="AddAutomaton" size="small" />
                </Box>
            </Grid>
            {watchAddAutomateProps && (
                <Grid container spacing={2}>
                    {Object.keys(fields).map((key, index) => (
                        <Grid item xs={6} align="start" key={index}>
                            {fields[key]}
                        </Grid>
                    ))}
                </Grid>
            )}
        </Grid>
    );
};
