/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import {
    ADD_STAND_BY_AUTOMATON,
    AUTOMATON,
    CHARACTERISTICS_CHOICE_AUTOMATON,
    CHARACTERISTICS_CHOICES,
    HIGH_VOLTAGE_SET_POINT,
    HIGH_VOLTAGE_THRESHOLD,
    LOW_VOLTAGE_SET_POINT,
    LOW_VOLTAGE_THRESHOLD,
    SETPOINTS_LIMITS,
    STAND_BY_AUTOMATON,
    VOLTAGE_REGULATION_MODE,
    VOLTAGE_REGULATION_MODES,
} from 'components/utils/field-constants';
import { CheckboxInput, FloatInput, SelectInput, SwitchInput, TextInput } from '@gridsuite/commons-ui';
import { SusceptanceAdornment, VoltageAdornment } from '../../../dialogUtils';
import { Box } from '@mui/system';
import React, { useEffect, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tooltip from '@mui/material/Tooltip';
import { WarningAmber } from '@mui/icons-material';
import { SusceptanceArea } from './susceptance-area';

type FieldKeys = 'standby' | 'lVoltageSetLimit' | 'hVoltageSetLimit' | 'lVoltageThreshold' | 'hVoltageThreshold';
export const StandByAutomatonForm = () => {
    const id = AUTOMATON;
    const { setValue } = useFormContext();

    const [isHover, setHover] = useState(false);
    const watchAddStandbyAutomatonProps = useWatch({
        name: `${id}.${ADD_STAND_BY_AUTOMATON}`,
    });
    // a tricky solution to rerender voltage/reactive setpoints field with label changed between required <-> optional
    const watchVoltageMode = useWatch({ name: `${SETPOINTS_LIMITS}.${VOLTAGE_REGULATION_MODE}` });

    const isDisabled = useMemo(() => {
        return watchVoltageMode !== VOLTAGE_REGULATION_MODES.VOLTAGE.id;
    }, [watchVoltageMode]);

    useEffect(() => {
        if (isDisabled) {
            setValue(`${id}.${STAND_BY_AUTOMATON}`, false);
        }
    }, [isDisabled, setValue, id]);

    const createField = (
        Component: any,
        name: string,
        label: string,
        adornment?: any,
        additionalProps?: { disabled: boolean }
    ) => <Component name={name} label={label} adornment={adornment} size="small" formProps={additionalProps} />;

    const fields = {
        modeAutomaton: createField(TextInput, `${SETPOINTS_LIMITS}.${VOLTAGE_REGULATION_MODE}`, 'ModeAutomaton', null, {
            disabled: true,
        }),
        standby: (
            <Grid container onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
                <Grid container item xs={12}>
                    <FormControlLabel
                        value="StandbyAutomaton"
                        control={
                            <SwitchInput
                                name={`${id}.${STAND_BY_AUTOMATON}`}
                                formProps={{
                                    disabled: isDisabled,
                                }}
                            />
                        }
                        label={<FormattedMessage id={'StandbyAutomaton'} />}
                        labelPlacement="start"
                    />
                    {isHover && watchVoltageMode !== VOLTAGE_REGULATION_MODES.VOLTAGE.id && (
                        <Box marginLeft={2} marginTop={'5px'}>
                            <Tooltip title={<FormattedMessage id="StandbyNotAvailable" />}>
                                <WarningAmber color="warning"></WarningAmber>
                            </Tooltip>
                        </Box>
                    )}
                </Grid>
            </Grid>
        ),
        lVoltageSetLimit: createField(
            FloatInput,
            `${id}.${LOW_VOLTAGE_SET_POINT}`,
            'LowVoltageSetpoint',
            VoltageAdornment
        ),
        hVoltageSetLimit: createField(
            FloatInput,
            `${id}.${HIGH_VOLTAGE_SET_POINT}`,
            'HighVoltageSetpoint',
            VoltageAdornment
        ),
        lVoltageThreshold: createField(
            FloatInput,
            `${id}.${LOW_VOLTAGE_THRESHOLD}`,
            'LowVoltageThreshold',
            SusceptanceAdornment
        ),
        hVoltageThreshold: createField(
            FloatInput,
            `${id}.${HIGH_VOLTAGE_THRESHOLD}`,
            'HighVoltageThreshold',
            SusceptanceAdornment
        ),
    };

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <Box>
                        <CheckboxInput name={`${id}.${ADD_STAND_BY_AUTOMATON}`} label="AddAutomaton" />
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
                                    name={`${id}.${CHARACTERISTICS_CHOICE_AUTOMATON}`}
                                    options={Object.values(CHARACTERISTICS_CHOICES)}
                                    fullWidth
                                    disableClearable
                                    size="small"
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2} padding={2}>
                            <SusceptanceArea />
                        </Grid>
                    </>
                )}
            </Grid>
        </>
    );
};
