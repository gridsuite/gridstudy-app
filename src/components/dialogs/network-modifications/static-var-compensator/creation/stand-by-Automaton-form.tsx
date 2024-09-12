/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import {
    ADD_STAND_BY_AUTOMATON,
    CHARACTERISTICS_CHOICE_AUTOMATON,
    CHARACTERISTICS_CHOICES,
    HIGH_VOLTAGE_SET_POINT,
    HIGH_VOLTAGE_THRESHOLD,
    LOW_VOLTAGE_SET_POINT,
    LOW_VOLTAGE_THRESHOLD,
    MAX_Q_AT_NOMINAL_V,
    MAX_SUSCEPTANCE,
    MIN_Q_AT_NOMINAL_V,
    MIN_SUSCEPTANCE,
    STAND_BY_AUTOMATON,
    VOLTAGE_REGULATION_MODE,
    VOLTAGE_REGULATION_MODES,
} from 'components/utils/field-constants';
import { CheckboxInput, FloatInput, SelectInput, SwitchInput, TextInput } from '@gridsuite/commons-ui';
import { SusceptanceAdornment, VoltageAdornment } from '../../../dialogUtils';
import { Box } from '@mui/system';
import React, { useState } from 'react';
import { useWatch } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tooltip from '@mui/material/Tooltip';
import { WarningAmber } from '@mui/icons-material';
import { SusceptanceArea } from './susceptance-area';
import { getFloatNumber } from './stand-by-automaton-form-utils';

type FieldKeys =
    | 'modeAutomaton'
    | 'standby'
    | 'lVoltageSetLimit'
    | 'hVoltageSetLimit'
    | 'lVoltageThreshold'
    | 'hVoltageThreshold';
export const StandbyAutomatonForm = () => {
    const [isHover, setHover] = useState(false);
    const watchAddStandbyAutomatonProps = useWatch({
        name: ADD_STAND_BY_AUTOMATON,
    });
    const watchVoltageMode = useWatch({ name: VOLTAGE_REGULATION_MODE });
    const watchChoiceAutomaton = useWatch({ name: CHARACTERISTICS_CHOICE_AUTOMATON });
    const watchSuceptanceMin = useWatch({ name: MIN_SUSCEPTANCE });
    const watchSuceptanceMax = useWatch({ name: MAX_SUSCEPTANCE });
    const watchQuNomMin = useWatch({ name: MIN_Q_AT_NOMINAL_V });
    const watchQuNomMax = useWatch({ name: MAX_Q_AT_NOMINAL_V });

    const isSusceptance = watchChoiceAutomaton === CHARACTERISTICS_CHOICES.SUSCEPTANCE.id;
    const isQFixe = watchChoiceAutomaton === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id;

    const createField = (
        Component: any,
        name: string,
        label: string,
        adornment?: any,
        additionalProps?: { disabled: boolean }
    ) => <Component name={name} label={label} adornment={adornment} size="small" formProps={additionalProps} />;

    const fields = {
        modeAutomaton: createField(TextInput, VOLTAGE_REGULATION_MODE, 'ModeAutomaton', null, {
            disabled: true,
        }),
        standby: (
            <Grid container onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
                <Grid container item xs={12}>
                    <FormControlLabel
                        value="StandbyAutomaton"
                        control={
                            <SwitchInput
                                name={STAND_BY_AUTOMATON}
                                formProps={{
                                    disabled: !(watchVoltageMode === VOLTAGE_REGULATION_MODES.VOLTAGE.id),
                                }}
                            />
                        }
                        label={<FormattedMessage id={'StandbyAutomaton'} />}
                        labelPlacement="start"
                    />
                    {isHover && !(watchVoltageMode === VOLTAGE_REGULATION_MODES.VOLTAGE.id) && (
                        <Box marginLeft={2} marginTop={'5px'}>
                            <Tooltip title={<FormattedMessage id="StandbyNotAvailable" />}>
                                <WarningAmber color="warning"></WarningAmber>
                            </Tooltip>
                        </Box>
                    )}
                </Grid>
            </Grid>
        ),
        lVoltageSetLimit: createField(FloatInput, LOW_VOLTAGE_SET_POINT, 'LowVoltageSetpoint', VoltageAdornment),
        hVoltageSetLimit: createField(FloatInput, HIGH_VOLTAGE_SET_POINT, 'HighVoltageSetpoint', VoltageAdornment),
        lVoltageThreshold: createField(FloatInput, LOW_VOLTAGE_THRESHOLD, 'LowVoltageThreshold', SusceptanceAdornment),
        hVoltageThreshold: createField(
            FloatInput,
            HIGH_VOLTAGE_THRESHOLD,
            'HighVoltageThreshold',
            SusceptanceAdornment
        ),
    };

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <Box>
                        <CheckboxInput name={ADD_STAND_BY_AUTOMATON} label="AddAutomaton" />
                    </Box>
                </Grid>
                {watchAddStandbyAutomatonProps && (
                    <>
                        <Grid container spacing={2} padding={2}>
                            {Object.keys(fields).map((key: string, index: number) => {
                                const typedKey = key as FieldKeys;
                                return (
                                    <Grid item xs={6} key={index}>
                                        {fields[typedKey]}
                                    </Grid>
                                );
                            })}
                        </Grid>

                        <Grid container spacing={2} padding={2}>
                            <Grid item xs={6}>
                                <SelectInput
                                    name={CHARACTERISTICS_CHOICE_AUTOMATON}
                                    options={Object.values(CHARACTERISTICS_CHOICES)}
                                    fullWidth
                                    disableClearable
                                    size="small"
                                />
                            </Grid>
                        </Grid>
                        {isSusceptance && (
                            <Grid container spacing={2} padding={2}>
                                <SusceptanceArea
                                    isSusceptance={true}
                                    isQFixe={false}
                                    min={getFloatNumber(watchSuceptanceMin)}
                                    max={getFloatNumber(watchSuceptanceMax)}
                                />
                            </Grid>
                        )}
                        {isQFixe && (
                            <Grid container spacing={2} padding={2}>
                                <SusceptanceArea
                                    isSusceptance={false}
                                    isQFixe={true}
                                    min={getFloatNumber(watchQuNomMin)}
                                    max={getFloatNumber(watchQuNomMax)}
                                />
                            </Grid>
                        )}
                    </>
                )}
            </Grid>
        </>
    );
};
