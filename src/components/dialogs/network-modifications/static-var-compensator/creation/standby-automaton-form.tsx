/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ADD_STAND_BY_AUTOMATON,
    AUTOMATON,
    HIGH_VOLTAGE_SET_POINT,
    HIGH_VOLTAGE_THRESHOLD,
    LOW_VOLTAGE_SET_POINT,
    LOW_VOLTAGE_THRESHOLD,
    SETPOINTS_LIMITS,
    STAND_BY_AUTOMATON,
    VOLTAGE_REGULATION_MODE,
    VOLTAGE_REGULATION_MODES,
} from 'components/utils/field-constants';
import { CheckboxInput, FloatInput, SwitchInput } from '@gridsuite/commons-ui';
import { VoltageAdornment } from '../../../dialog-utils';
import { useEffect, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import FormControlLabel from '@mui/material/FormControlLabel';
import { WarningAmber } from '@mui/icons-material';
import { SusceptanceArea } from './susceptance-area';
import { TextField, Tooltip, Grid, Box } from '@mui/material';

type FieldKeys = 'standby' | 'lVoltageSetLimit' | 'hVoltageSetLimit' | 'lVoltageThreshold' | 'hVoltageThreshold';
export const StandbyAutomatonForm = () => {
    const intl = useIntl();
    const id = AUTOMATON;
    const { setValue } = useFormContext();

    const [hover, setHover] = useState(false);
    const watchAddStandbyAutomatonProps = useWatch({
        name: `${id}.${ADD_STAND_BY_AUTOMATON}`,
    });
    const watchVoltageMode = useWatch({ name: `${SETPOINTS_LIMITS}.${VOLTAGE_REGULATION_MODE}` });
    const watchVoltageModeLabel = useMemo(() => {
        return Object.values(VOLTAGE_REGULATION_MODES).find((voltageMode) => voltageMode.id === watchVoltageMode)
            ?.label;
    }, [watchVoltageMode]);

    const standbyDisabled = useMemo(() => {
        return watchVoltageMode !== VOLTAGE_REGULATION_MODES.VOLTAGE.id;
    }, [watchVoltageMode]);

    useEffect(() => {
        if (standbyDisabled) {
            setValue(`${id}.${STAND_BY_AUTOMATON}`, false);
        }
    }, [standbyDisabled, setValue, id]);

    const createField = (
        Component: any,
        name: string,
        label: string,
        adornment?: any,
        additionalProps?: { disabled: boolean }
    ) => <Component name={name} label={label} adornment={adornment} size="small" formProps={additionalProps} />;

    const fields = {
        modeAutomaton: (
            <TextField
                value={intl.formatMessage({ id: watchVoltageModeLabel })}
                label={intl.formatMessage({ id: 'ModeAutomaton' })}
                disabled={true}
                size={'small'}
            />
        ),
        standby: (
            <Grid container onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
                <Grid container item xs={12}>
                    <FormControlLabel
                        value="StandbyAutomaton"
                        control={
                            <SwitchInput
                                name={`${id}.${STAND_BY_AUTOMATON}`}
                                formProps={{
                                    disabled: standbyDisabled,
                                }}
                            />
                        }
                        label={<FormattedMessage id={'StandbyAutomaton'} />}
                        labelPlacement="start"
                    />
                    {hover && watchVoltageMode !== VOLTAGE_REGULATION_MODES.VOLTAGE.id && (
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
            VoltageAdornment
        ),
        hVoltageThreshold: createField(
            FloatInput,
            `${id}.${HIGH_VOLTAGE_THRESHOLD}`,
            'HighVoltageThreshold',
            VoltageAdornment
        ),
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={4}>
                <Box>
                    <CheckboxInput name={`${id}.${ADD_STAND_BY_AUTOMATON}`} label="AddAutomaton" />
                </Box>
            </Grid>
            {watchAddStandbyAutomatonProps && (
                <>
                    <Grid container spacing={2} padding={2}>
                        {Object.keys(fields).map((key: string) => {
                            const typedKey = key as FieldKeys;
                            return (
                                <Grid item xs={6} key={key}>
                                    {fields[typedKey]}
                                </Grid>
                            );
                        })}
                    </Grid>
                    <Grid container spacing={2} padding={2}>
                        <SusceptanceArea />
                    </Grid>
                </>
            )}
        </Grid>
    );
};
