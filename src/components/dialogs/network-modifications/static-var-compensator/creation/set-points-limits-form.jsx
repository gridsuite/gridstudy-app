/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import {
    ACTIVE_POWER_SET_POINT,
    CHARACTERISTICS_CHOICE,
    CHARACTERISTICS_CHOICES,
    MAX_Q_AT_NOMINAL_V,
    MAX_SUSCEPTANCE,
    MIN_Q_AT_NOMINAL_V,
    MIN_SUSCEPTANCE,
    REACTIVE_POWER_SET_POINT,
    VOLTAGE_REGULATION,
} from 'components/utils/field-constants';
import { FloatInput, SelectInput } from '@gridsuite/commons-ui';
import { ActivePowerAdornment, ReactivePowerAdornment, SusceptanceAdornment } from '../../../dialogUtils';
import { useWatch } from 'react-hook-form';
import yup from '../../../../utils/yup-config';
import React, { useEffect, useMemo, useState } from 'react';
import { VOLTAGE_REGULATION_MODE } from '../../../../network/constants';
import VoltageRegulation from '../../../set-points/voltage-regulation';
import { useGetVoltageInitParameters } from '../../../parameters/voltageinit/use-get-voltage-init-parameters';

export const getReactiveFormEmptyFormData = () => ({
    [MAX_Q_AT_NOMINAL_V]: null,
    [MIN_Q_AT_NOMINAL_V]: null,
    [MAX_SUSCEPTANCE]: null,
    [MIN_SUSCEPTANCE]: null,
    [ACTIVE_POWER_SET_POINT]: null,
    [REACTIVE_POWER_SET_POINT]: null,
    [CHARACTERISTICS_CHOICE]: CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
    [VOLTAGE_REGULATION_MODE]: VOLTAGE_REGULATION_MODE.OFF.id,
});

export const getReactiveFormValidationSchema = () => ({
    [MAX_Q_AT_NOMINAL_V]: yup.number().nullable(),
    [MIN_Q_AT_NOMINAL_V]: yup.number().nullable(),
    [MAX_SUSCEPTANCE]: yup.number().nullable(),
    [MIN_SUSCEPTANCE]: yup.number().nullable(),
    [ACTIVE_POWER_SET_POINT]: yup.number().nullable(),
    [REACTIVE_POWER_SET_POINT]: yup.number().nullable(),
    [CHARACTERISTICS_CHOICE]: yup.string(),
    [VOLTAGE_REGULATION_MODE]: yup.string(),
});

export const SetPointsLimitsForm = ({ studyUuid, currentNode }) => {
    const [formState, setFormState] = useState({
        openWatchProps: CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
        openWatchVoltageMode: VOLTAGE_REGULATION_MODE.OFF.id,
    });

    const updateFormState = (key, value) => {
        setFormState((prevState) => ({ ...prevState, [key]: value }));
    };

    const watchProps = useWatch({ name: CHARACTERISTICS_CHOICE });
    const watchVoltageMode = useWatch({ name: VOLTAGE_REGULATION });

    useEffect(() => {
        if (watchProps) {
            updateFormState('openWatchProps', CHARACTERISTICS_CHOICES[watchProps]?.id);
        }
    }, [watchProps]);

    useEffect(() => {
        if (watchVoltageMode) {
            updateFormState('openWatchVoltageMode', VOLTAGE_REGULATION_MODE[watchVoltageMode]?.id);
        }
    }, [watchVoltageMode]);

    const getInputFields = useMemo(() => {
        const fields = {
            Q_AT_NOMINAL_V: [
                <FloatInput
                    key="minQ"
                    name={MIN_Q_AT_NOMINAL_V}
                    label="minQAtNominalV"
                    adornment={ReactivePowerAdornment}
                />,
                <FloatInput
                    key="maxQ"
                    name={MAX_Q_AT_NOMINAL_V}
                    label="maxQAtNominalV"
                    adornment={ReactivePowerAdornment}
                />,
            ],
            SUSCEPTANCE: [
                <FloatInput
                    key="minS"
                    name={MIN_SUSCEPTANCE}
                    label="minSusceptance"
                    adornment={SusceptanceAdornment}
                />,
                <FloatInput
                    key="maxS"
                    name={MAX_SUSCEPTANCE}
                    label="maxSusceptance"
                    adornment={SusceptanceAdornment}
                />,
            ],
        };
        return fields[formState.openWatchProps] || [];
    }, [formState.openWatchProps]);

    const powerSetPoints = useMemo(
        () =>
            formState.openWatchVoltageMode === VOLTAGE_REGULATION_MODE.VOLTAGE.id ? (
                <>
                    <Grid item xs={4} align="start">
                        <FloatInput
                            name={ACTIVE_POWER_SET_POINT}
                            label="ActivePowerText"
                            adornment={ActivePowerAdornment}
                        />
                    </Grid>
                    <Grid item xs={4} align="start">
                        <FloatInput
                            name={REACTIVE_POWER_SET_POINT}
                            label="ReactivePowerText"
                            adornment={ReactivePowerAdornment}
                        />
                    </Grid>
                </>
            ) : null,
        [formState.openWatchVoltageMode]
    );

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={4} align="start">
                    <SelectInput
                        name={CHARACTERISTICS_CHOICE}
                        options={Object.values(CHARACTERISTICS_CHOICES)}
                        defaultValue={CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id}
                        fullWidth
                        disableClearable
                        size="small"
                    />
                </Grid>
                {getInputFields}
            </Grid>
            <Grid container spacing={2}>
                <Grid item xs={4} align="start">
                    <SelectInput
                        name={VOLTAGE_REGULATION}
                        label="Mode"
                        options={Object.values(VOLTAGE_REGULATION_MODE)}
                        defaultValue={VOLTAGE_REGULATION_MODE.OFF.id}
                        fullWidth
                        disableClearable
                        size="small"
                    />
                </Grid>
                {powerSetPoints}
                <VoltageRegulation
                    voltageLevelOptions={useGetVoltageInitParameters()}
                    currentNodeUuid={currentNode.id}
                    studyUuid={studyUuid}
                />
            </Grid>
        </>
    );
};
