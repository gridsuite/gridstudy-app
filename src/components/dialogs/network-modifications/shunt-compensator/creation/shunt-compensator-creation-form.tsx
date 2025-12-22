/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { EQUIPMENT_ID, EQUIPMENT_NAME } from 'components/utils/field-constants';

import { filledTextField } from '../../../dialog-utils';

import { TextInput } from '@gridsuite/commons-ui';
import { ConnectivityForm } from '../../../connectivity/connectivity-form';
import PropertiesForm from '../../common/properties/properties-form';
import GridItem from '../../../commons/grid-item';
import GridSection from '../../../commons/grid-section';
import type { UUID } from 'node:crypto';
import { CurrentTreeNode } from '../../../../graph/tree-node.type';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';
import CharacteristicsForm from '../characteristics-pane/characteristics-form';

export interface ShuntCompensatorCreationFormProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
}

export default function ShuntCompensatorCreationForm({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
}: Readonly<ShuntCompensatorCreationFormProps>) {
    const currentNodeUuid = currentNode?.id;
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNodeUuid, currentRootNetworkUuid);

    const shuntCompensatorIdField = (
        <TextInput name={EQUIPMENT_ID} label={'ID'} formProps={{ autoFocus: true, ...filledTextField }} />
    );

    const shuntCompensatorNameField = <TextInput name={EQUIPMENT_NAME} label={'Name'} formProps={filledTextField} />;

    const connectivityForm = (
        <ConnectivityForm
            withPosition={true}
            voltageLevelOptions={voltageLevelOptions}
            studyUuid={studyUuid}
            currentNode={currentNode}
            currentRootNetworkUuid={currentRootNetworkUuid}
        />
    );

    const characteristicsForm = <CharacteristicsForm />;

    return (
        <>
            <Grid container spacing={2}>
                <GridItem size={4}>{shuntCompensatorIdField}</GridItem>
                <GridItem size={4}>{shuntCompensatorNameField}</GridItem>
            </Grid>
            <GridSection title="Connectivity" />
            <Grid container spacing={2}>
                <GridItem size={12}>{connectivityForm}</GridItem>
            </Grid>
            <GridSection title="Characteristics" />
            <Grid container spacing={2}>
                <GridItem size={12}>{characteristicsForm}</GridItem>
            </Grid>
            <PropertiesForm networkElementType={'shuntCompensator'} />
        </>
    );
}
