/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    TextInput,
    PropertiesForm,
    filledTextField,
    ConnectivityForm,
    PowerMeasurementsForm,
} from '@gridsuite/commons-ui';
import { EQUIPMENT_NAME } from '../../../../utils/field-constants';
import { Grid, TextField } from '@mui/material';
import GridItem from '../../../commons/grid-item';
import GridSection from '../../../commons/grid-section';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos.js';
import type { UUID } from 'node:crypto';
import { CurrentTreeNode } from '../../../../graph/tree-node.type';
import { ShuntCompensatorFormInfos } from '../shunt-compensator-dialog.type';
import CharacteristicsForm from '../characteristics-pane/characteristics-form';
import PositionDiagramPane from '../../../../grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';
import { useCallback } from 'react';
import { fetchBusesOrBusbarSectionsForVoltageLevel } from '../../../../../services/study/network';

export interface ShuntCompensatorModificationFormProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    shuntCompensatorToModify: ShuntCompensatorFormInfos | null;
    equipmentId: string;
}

export default function ShuntCompensatorModificationForm({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    shuntCompensatorToModify,
    equipmentId,
}: Readonly<ShuntCompensatorModificationFormProps>) {
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode.id, currentRootNetworkUuid);
    const fetchBusesOrBusbarSections = useCallback(
        (voltageLevelId: string) =>
            fetchBusesOrBusbarSectionsForVoltageLevel(
                studyUuid,
                currentNode.id,
                currentRootNetworkUuid,
                voltageLevelId
            ),
        [studyUuid, currentNode.id, currentRootNetworkUuid]
    );
    const shuntCompensatorIdField = (
        <TextField
            size="small"
            fullWidth
            label={'ID'}
            value={equipmentId}
            InputProps={{
                readOnly: true,
            }}
            disabled
            {...filledTextField}
        />
    );
    const shuntCompensatorNameField = (
        <TextInput
            name={EQUIPMENT_NAME}
            label={'Name'}
            formProps={filledTextField}
            previousValue={shuntCompensatorToModify?.name}
            clearable
        />
    );

    const characteristicsForm = (
        <CharacteristicsForm previousValues={shuntCompensatorToModify ?? undefined} isModification={true} />
    );

    const connectivityForm = (
        <ConnectivityForm
            withPosition={true}
            isEquipmentModification={true}
            previousValues={shuntCompensatorToModify ?? undefined}
            voltageLevelOptions={voltageLevelOptions}
            PositionDiagramPane={PositionDiagramPane}
            fetchBusesOrBusbarSections={fetchBusesOrBusbarSections}
        />
    );

    const measurementsForm = (
        <PowerMeasurementsForm
            reactivePowerMeasurement={shuntCompensatorToModify?.measurementQ}
            reactivePowerOnly={true}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                <GridItem size={4}>{shuntCompensatorIdField}</GridItem>
                <GridItem size={4}>{shuntCompensatorNameField}</GridItem>
            </Grid>
            {/* Connectivity part */}
            <GridSection title="Connectivity" />
            <Grid container spacing={2}>
                <GridItem size={12}>{connectivityForm}</GridItem>
            </Grid>
            <GridSection title="Characteristics" />
            <Grid container spacing={2}>
                <GridItem size={12}>{characteristicsForm}</GridItem>
            </Grid>
            <GridSection title="MeasurementsSection" />
            <Grid container spacing={2}>
                <GridItem size={12}>{measurementsForm}</GridItem>
            </Grid>
            <PropertiesForm networkElementType={'shuntCompensator'} isModification={true} />
        </>
    );
}
