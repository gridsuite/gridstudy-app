/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import {
    CHARACTERISTICS_CHOICE,
    CHARACTERISTICS_CHOICES,
    EQUIPMENT,
    ID,
    MAX_Q_AT_NOMINAL_V,
    MAX_SUSCEPTANCE,
    MIN_Q_AT_NOMINAL_V,
    MIN_SUSCEPTANCE,
    NAME,
    NOMINAL_VOLTAGE,
    REACTIVE_POWER_SET_POINT,
    SUBSTATION_ID,
    TOPOLOGY_KIND,
    TYPE,
    VOLTAGE_LEVEL,
    VOLTAGE_REGULATION_MODE,
    VOLTAGE_REGULATION_MODES,
    VOLTAGE_REGULATION_TYPE,
    VOLTAGE_SET_POINT,
} from 'components/utils/field-constants';
import { FloatInput, SelectInput } from '@gridsuite/commons-ui';
import {
    gridItem,
    GridSection,
    ReactivePowerAdornment,
    SusceptanceAdornment,
    VoltageAdornment,
} from '../../../dialogUtils';
import { useWatch } from 'react-hook-form';
import yup from '../../../../utils/yup-config';
import React, { useEffect, useMemo, useState } from 'react';
import VoltageRegulation from '../../../set-points/voltage-regulation';
import { REGULATION_TYPES } from '../../../../network/constants';
import { getRegulatingTerminalEmptyFormData } from '../../../regulating-terminal/regulating-terminal-form-utils';

export const getReactiveFormEmptyFormData = () => ({
    [MAX_Q_AT_NOMINAL_V]: null,
    [MIN_Q_AT_NOMINAL_V]: null,
    [MAX_SUSCEPTANCE]: null,
    [MIN_SUSCEPTANCE]: null,
    [VOLTAGE_SET_POINT]: null,
    [REACTIVE_POWER_SET_POINT]: null,
    [CHARACTERISTICS_CHOICE]: CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
    [VOLTAGE_REGULATION_MODE]: VOLTAGE_REGULATION_MODES.OFF.id,
    [VOLTAGE_REGULATION_TYPE]: REGULATION_TYPES.LOCAL.id,
    [VOLTAGE_LEVEL]: null,
    [EQUIPMENT]: null,
    ...getRegulatingTerminalEmptyFormData(),
});

export const getReactiveFormValidationSchema = () => ({
    [MAX_Q_AT_NOMINAL_V]: yup
        .number()
        .nullable()
        .when([CHARACTERISTICS_CHOICE], {
            is: (characteristicsChoice) => characteristicsChoice === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
            then: (schema) => schema.required(),
        }),
    [MIN_Q_AT_NOMINAL_V]: yup
        .number()
        .nullable()
        .when([CHARACTERISTICS_CHOICE], {
            is: (characteristicsChoice) => characteristicsChoice === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
            then: (schema) => schema.required(),
        }),
    [MAX_SUSCEPTANCE]: yup
        .number()
        .nullable()
        .when([CHARACTERISTICS_CHOICE], {
            is: (characteristicsChoice) => characteristicsChoice === CHARACTERISTICS_CHOICES.SUSCEPTANCE.id,
            then: (schema) => schema.required(),
        }),
    [MIN_SUSCEPTANCE]: yup
        .number()
        .nullable()
        .when([CHARACTERISTICS_CHOICE], {
            is: (characteristicsChoice) => characteristicsChoice === CHARACTERISTICS_CHOICES.SUSCEPTANCE.id,
            then: (schema) => schema.required(),
        }),
    [VOLTAGE_SET_POINT]: yup
        .number()
        .nullable()
        .when([VOLTAGE_REGULATION_MODE], {
            is: (characteristicsChoice) => characteristicsChoice === VOLTAGE_REGULATION_MODES.VOLTAGE.id,
            then: (schema) => schema.required(),
            otherwise: (schema) => schema.notRequired(),
        }),
    [REACTIVE_POWER_SET_POINT]: yup
        .number()
        .nullable()
        .when([VOLTAGE_REGULATION_MODE], {
            is: (characteristicsChoice) => characteristicsChoice === VOLTAGE_REGULATION_MODES.REACTIF_POWER.id,
            then: (schema) => schema.required(),
            otherwise: (schema) => schema.notRequired(),
        }),
    [CHARACTERISTICS_CHOICE]: yup.string().required(),
    [VOLTAGE_REGULATION_MODE]: yup.string().required(),
    [VOLTAGE_REGULATION_TYPE]: yup.string().required(),

    [VOLTAGE_LEVEL]: yup
        .object()
        .nullable()
        .shape({
            [ID]: yup.string(),
            [NAME]: yup.string(),
            [SUBSTATION_ID]: yup.string(),
            [NOMINAL_VOLTAGE]: yup.string(),
            [TOPOLOGY_KIND]: yup.string().nullable(),
        })
        .when([VOLTAGE_REGULATION_MODE, VOLTAGE_REGULATION_TYPE], {
            is: (voltageRegulation, voltageRegulationType) =>
                voltageRegulation && voltageRegulationType === REGULATION_TYPES.DISTANT.id,
            then: (schema) => schema.required(),
        }),
    [EQUIPMENT]: yup
        .object()
        .nullable()
        .shape({
            [ID]: yup.string(),
            [NAME]: yup.string().nullable(),
            [TYPE]: yup.string(),
        })
        .when([VOLTAGE_REGULATION_MODE, VOLTAGE_REGULATION_TYPE], {
            is: (voltageRegulationMode, voltageRegulationType, vl) =>
                voltageRegulationMode === VOLTAGE_REGULATION_MODES.VOLTAGE.id &&
                voltageRegulationType === REGULATION_TYPES.DISTANT.id,
            then: (schema) => schema.required(),
        }),
});

export const getReactiveFormData = ({
    maxSusceptance,
    minSusceptance,
    maxQAtNominalV,
    minQAtNominalV,
    voltageSetpoint,
    reactivePowerSetPoint,
}) => {
    return {
        [CHARACTERISTICS_CHOICE]: maxSusceptance
            ? CHARACTERISTICS_CHOICES.SUSCEPTANCE.id
            : CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
        [VOLTAGE_REGULATION_MODE]: voltageSetpoint
            ? VOLTAGE_REGULATION_MODES.VOLTAGE.id
            : reactivePowerSetPoint
            ? VOLTAGE_REGULATION_MODES.REACTIF_POWER.id
            : VOLTAGE_REGULATION_MODES.OFF.id,
        [MAX_SUSCEPTANCE]: maxSusceptance,
        [MIN_SUSCEPTANCE]: minSusceptance,
        [MAX_Q_AT_NOMINAL_V]: maxQAtNominalV,
        [MIN_Q_AT_NOMINAL_V]: minQAtNominalV,
        [VOLTAGE_SET_POINT]: voltageSetpoint,
        [REACTIVE_POWER_SET_POINT]: reactivePowerSetPoint,
    };
};

export const SetPointsLimitsForm = ({ studyUuid, currentNode, voltageLevelOptions }) => {
    const [formState, setFormState] = useState({
        openWatchProps: CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id,
        openWatchVoltageMode: VOLTAGE_REGULATION_MODES.OFF.id,
    });

    /*    const { setValue, watch } = useFormContext();
    const voltageRegulationMode = watch();

    useEffect(() => {
        setValue(`${MODE_AUTOMATE}`, voltageRegulationMode.voltageRegulationMode);
    }, [voltageRegulationMode, setValue]);*/

    const updateFormState = (key, value) => {
        setFormState((prevState) => ({ ...prevState, [key]: value }));
    };

    const watchProps = useWatch({ name: CHARACTERISTICS_CHOICE });
    const watchVoltageMode = useWatch({ name: VOLTAGE_REGULATION_MODE });

    useEffect(() => {
        if (watchProps) {
            updateFormState('openWatchProps', CHARACTERISTICS_CHOICES[watchProps]?.id);
        }
    }, [watchProps]);

    useEffect(() => {
        if (watchVoltageMode) {
            updateFormState('openWatchVoltageMode', VOLTAGE_REGULATION_MODES[watchVoltageMode]?.id);
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

    const voltageSetPointField = (
        <FloatInput name={VOLTAGE_SET_POINT} label={'VoltageText'} adornment={VoltageAdornment} />
    );

    const reactivePowerSetPointField = (
        <FloatInput name={REACTIVE_POWER_SET_POINT} label={'ReactivePowerText'} adornment={ReactivePowerAdornment} />
    );

    return (
        <>
            <GridSection title="ReactiveLimits" />

            <Grid container spacing={2} padding={1}>
                <Grid item xs={4}>
                    <SelectInput
                        name={CHARACTERISTICS_CHOICE}
                        options={Object.values(CHARACTERISTICS_CHOICES)}
                        fullWidth
                        disableClearable
                        size="small"
                    />
                </Grid>
                <Grid container item xs={8} spacing={2} alignContent={'center'}>
                    {getInputFields.map((field, index) => (
                        <Grid item xs={6} key={index}>
                            {field}
                        </Grid>
                    ))}
                </Grid>
            </Grid>
            <GridSection title="Setpoints" />
            <Grid container spacing={2} padding={1}>
                <Grid item xs={4}>
                    <SelectInput
                        name={VOLTAGE_REGULATION_MODE}
                        label="ModeAutomate"
                        options={Object.values(VOLTAGE_REGULATION_MODES)}
                        fullWidth
                        disableClearable
                        size="small"
                    />
                </Grid>
                {gridItem(voltageSetPointField, 4)}
                {gridItem(reactivePowerSetPointField, 4)}
                <VoltageRegulation
                    voltageLevelOptions={voltageLevelOptions}
                    currentNodeUuid={currentNode.id}
                    studyUuid={studyUuid}
                    onlyRegulationTypes={true}
                />
            </Grid>
        </>
    );
};
