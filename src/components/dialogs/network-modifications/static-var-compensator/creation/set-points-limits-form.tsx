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
    MAX_Q_AT_NOMINAL_V,
    MAX_SUSCEPTANCE,
    MIN_Q_AT_NOMINAL_V,
    MIN_SUSCEPTANCE,
    REACTIVE_POWER_SET_POINT,
    VOLTAGE_REGULATION_MODE,
    VOLTAGE_REGULATION_MODES,
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
import React, { FunctionComponent } from 'react';
import VoltageRegulation from '../../../set-points/voltage-regulation';
import { UUID } from 'crypto';

export interface SetPointsLimitsFormProps {
    studyUuid: UUID;
    currentNode: { id: UUID };
    voltageLevelOptions: {};
}
export const SetPointsLimitsForm: FunctionComponent<SetPointsLimitsFormProps> = ({
    studyUuid,
    currentNode,
    voltageLevelOptions,
}) => {
    const watchCharacteristicsChoice = useWatch({ name: CHARACTERISTICS_CHOICE });
    const minSusceptanceField = (
        <FloatInput name={MIN_SUSCEPTANCE} label={'minSusceptance'} adornment={SusceptanceAdornment} />
    );
    const maxSusceptanceField = (
        <FloatInput name={MAX_SUSCEPTANCE} label={'maxSusceptance'} adornment={SusceptanceAdornment} />
    );

    const minQAtNominalVField = (
        <FloatInput name={MIN_Q_AT_NOMINAL_V} label={'minQAtNominalV'} adornment={ReactivePowerAdornment} />
    );
    const maxQAtNominalVField = (
        <FloatInput name={MAX_Q_AT_NOMINAL_V} label={'maxQAtNominalV'} adornment={ReactivePowerAdornment} />
    );

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
                {watchCharacteristicsChoice === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id && (
                    <>
                        {gridItem(minQAtNominalVField, 4)}
                        {gridItem(maxQAtNominalVField, 4)}
                    </>
                )}
                {watchCharacteristicsChoice === CHARACTERISTICS_CHOICES.SUSCEPTANCE.id && (
                    <>
                        {gridItem(minSusceptanceField, 4)}
                        {gridItem(maxSusceptanceField, 4)}
                    </>
                )}
            </Grid>
            <GridSection title="Setpoints" />
            <Grid container spacing={2} padding={1}>
                <Grid item xs={4}>
                    <SelectInput
                        name={VOLTAGE_REGULATION_MODE}
                        label="ModeAutomaton"
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
                    previousValues={undefined}
                />
            </Grid>
        </>
    );
};
