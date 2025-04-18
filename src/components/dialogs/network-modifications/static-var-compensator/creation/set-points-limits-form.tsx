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
    SETPOINTS_LIMITS,
    VOLTAGE_REGULATION_MODE,
    VOLTAGE_REGULATION_MODES,
    VOLTAGE_REGULATION_TYPE,
    VOLTAGE_SET_POINT,
} from 'components/utils/field-constants';
import { FloatInput, SelectInput } from '@gridsuite/commons-ui';
import { ReactivePowerAdornment, SusceptanceAdornment, VoltageAdornment } from '../../../dialog-utils';
import { useWatch } from 'react-hook-form';
import { FunctionComponent } from 'react';
import { UUID } from 'crypto';
import { REGULATION_TYPES } from '../../../../network/constants';
import { RegulatingTerminalForm } from '../../../regulating-terminal/regulating-terminal-form';
import { FormattedMessage } from 'react-intl';
import { EQUIPMENT_TYPES } from '../../../../utils/equipment-types';
import GridSection from '../../../commons/grid-section';
import GridItem from '../../../commons/grid-item';

export interface SetPointsLimitsFormProps {
    studyUuid: UUID;
    currentNode: { id: UUID };
    currentRootNetworkUuid: UUID;
    voltageLevelOptions: any;
}
export const SetPointsLimitsForm: FunctionComponent<SetPointsLimitsFormProps> = ({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    voltageLevelOptions,
}) => {
    const id = SETPOINTS_LIMITS;
    const watchCharacteristicsChoice = useWatch({ name: `${id}.${CHARACTERISTICS_CHOICE}` });
    // a tricky solution to rerender voltage/reactive setpoints field with label changed between required <-> optional
    useWatch({ name: `${id}.${VOLTAGE_REGULATION_MODE}` });
    const watchRegulationType = useWatch({ name: `${id}.${VOLTAGE_REGULATION_TYPE}` });
    const minSusceptanceField = (
        <FloatInput name={`${id}.${MIN_SUSCEPTANCE}`} label={'minSusceptance'} adornment={SusceptanceAdornment} />
    );
    const maxSusceptanceField = (
        <FloatInput name={`${id}.${MAX_SUSCEPTANCE}`} label={'maximumSusceptance'} adornment={SusceptanceAdornment} />
    );

    const minQAtNominalVField = (
        <FloatInput name={`${id}.${MIN_Q_AT_NOMINAL_V}`} label={'minQAtNominalV'} adornment={ReactivePowerAdornment} />
    );
    const maxQAtNominalVField = (
        <FloatInput name={`${id}.${MAX_Q_AT_NOMINAL_V}`} label={'maxQAtVnominal'} adornment={ReactivePowerAdornment} />
    );

    const voltageSetPointField = (
        <FloatInput name={`${id}.${VOLTAGE_SET_POINT}`} label={'VoltageText'} adornment={VoltageAdornment} />
    );

    const reactivePowerSetPointField = (
        <FloatInput
            name={`${id}.${REACTIVE_POWER_SET_POINT}`}
            label={'ReactivePowerText'}
            adornment={ReactivePowerAdornment}
        />
    );

    const voltageRegulationTypeField = (
        <SelectInput
            options={Object.values(REGULATION_TYPES)}
            name={`${id}.${VOLTAGE_REGULATION_TYPE}`}
            label={'RegulationTypeText'}
            size={'small'}
        />
    );

    const regulatingTerminalField = (
        <RegulatingTerminalForm
            id={id}
            direction={undefined}
            disabled={false}
            studyUuid={studyUuid}
            currentNodeUuid={currentNode.id}
            currentRootNetworkUuid={currentRootNetworkUuid}
            voltageLevelOptions={voltageLevelOptions}
            equipmentSectionTypeDefaultValue={EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR}
            regulatingTerminalVlId={undefined}
            equipmentSectionType={undefined}
        />
    );

    return (
        <>
            <GridSection title="ReactiveLimits" />

            <Grid container spacing={2} padding={1}>
                <Grid item xs={4}>
                    <SelectInput
                        name={`${id}.${CHARACTERISTICS_CHOICE}`}
                        options={Object.values(CHARACTERISTICS_CHOICES)}
                        fullWidth
                        disableClearable
                        size="small"
                    />
                </Grid>
                {watchCharacteristicsChoice === CHARACTERISTICS_CHOICES.Q_AT_NOMINAL_V.id && (
                    <>
                        <GridItem size={4}>{minQAtNominalVField}</GridItem>
                        <GridItem size={4}>{maxQAtNominalVField}</GridItem>
                    </>
                )}
                {watchCharacteristicsChoice === CHARACTERISTICS_CHOICES.SUSCEPTANCE.id && (
                    <>
                        <GridItem size={4}>{minSusceptanceField}</GridItem>
                        <GridItem size={4}>{maxSusceptanceField}</GridItem>
                    </>
                )}
            </Grid>
            <GridSection title="Setpoints" />
            <Grid container spacing={2} padding={1}>
                <Grid item xs={4}>
                    <SelectInput
                        name={`${id}.${VOLTAGE_REGULATION_MODE}`}
                        label="ModeAutomaton"
                        options={Object.values(VOLTAGE_REGULATION_MODES)}
                        fullWidth
                        disableClearable
                        size="small"
                    />
                </Grid>
                <GridItem size={4}>{voltageSetPointField}</GridItem>
                <GridItem size={4}>{reactivePowerSetPointField}</GridItem>
                <GridItem size={4}>{voltageRegulationTypeField}</GridItem>
            </Grid>
            {watchRegulationType === REGULATION_TYPES.DISTANT.id && (
                <Grid container spacing={2} padding={1}>
                    <Grid item xs={4} alignItems={'center'}>
                        <FormattedMessage id="RegulatingTerminalGenerator" />
                    </Grid>
                    <GridItem size={8}>{regulatingTerminalField}</GridItem>
                </Grid>
            )}
        </>
    );
};
