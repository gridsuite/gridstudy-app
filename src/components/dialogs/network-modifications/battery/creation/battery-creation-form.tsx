/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ActivePowerAdornment, filledTextField, FloatInput, TextInput } from '@gridsuite/commons-ui';
import {
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    MAXIMUM_ACTIVE_POWER,
    MINIMUM_ACTIVE_POWER,
} from 'components/utils/field-constants';
import { Grid } from '@mui/material';
import { ConnectivityForm } from '../../../connectivity/connectivity-form';
import { ReactiveLimitsForm } from '../../../reactive-limits/reactive-limits-form';
import PropertiesForm from '../../common/properties/properties-form';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';
import GridItem from '../../../commons/grid-item';
import GridSection from '../../../commons/grid-section';
import { ActivePowerControlForm } from '../../../active-power-control/active-power-control-form';
import type { UUID } from 'node:crypto';
import { CurrentTreeNode } from '../../../../graph/tree-node.type';
import { SetPointsForm } from '../../../set-points/set-points-form';
import ShortCircuitForm from '../../../short-circuit/short-circuit-form';

export interface BatteryCreationFormProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
}

export default function BatteryCreationForm({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
}: Readonly<BatteryCreationFormProps>) {
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode.id, currentRootNetworkUuid);

    const batteryIdField = (
        <TextInput name={EQUIPMENT_ID} label={'ID'} formProps={{ autoFocus: true, ...filledTextField }} />
    );

    const batteryNameField = <TextInput name={EQUIPMENT_NAME} label={'Name'} formProps={filledTextField} />;

    const connectivityForm = (
        <ConnectivityForm
            voltageLevelOptions={voltageLevelOptions}
            withPosition={true}
            studyUuid={studyUuid}
            currentNode={currentNode}
            currentRootNetworkUuid={currentRootNetworkUuid}
        />
    );

    const maximumActivePowerField = (
        <FloatInput name={MAXIMUM_ACTIVE_POWER} label={'MaximumActivePowerText'} adornment={ActivePowerAdornment} />
    );

    const minimumActivePowerField = (
        <FloatInput name={MINIMUM_ACTIVE_POWER} label={'MinimumActivePowerText'} adornment={ActivePowerAdornment} />
    );

    return (
        <>
            <Grid container spacing={2}>
                <GridItem size={4}>{batteryIdField}</GridItem>
                <GridItem size={4}>{batteryNameField}</GridItem>
            </Grid>

            {/* Connectivity part */}
            <GridSection title="Connectivity" />
            <Grid container spacing={2}>
                <GridItem size={12}>{connectivityForm}</GridItem>
            </Grid>

            {/* ActiveLimits part */}
            <GridSection title="ActiveLimits" />
            <Grid container spacing={2}>
                <GridItem size={4}>{minimumActivePowerField}</GridItem>
                <GridItem size={4}>{maximumActivePowerField}</GridItem>
            </Grid>

            {/* Reactive limits part */}
            <GridSection title="ReactiveLimits" />
            <ReactiveLimitsForm />

            {/* Set points part */}
            <SetPointsForm />

            {/* Active power control part */}
            <Grid container spacing={2} paddingTop={2}>
                <ActivePowerControlForm />
            </Grid>

            {/* Short Circuit part */}
            <GridSection title="ShortCircuit" />
            <ShortCircuitForm />

            <PropertiesForm networkElementType={'battery'} />
        </>
    );
}
