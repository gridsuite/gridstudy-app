/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { ConnectivityForm } from './connectivity-form';
import { CONNECTIVITY, CONNECTIVITY_1, CONNECTIVITY_2 } from 'components/utils/field-constants';
import useVoltageLevelsListInfos from '../../../hooks/use-voltage-levels-list-infos';
import { CurrentTreeNode } from '../../../redux/reducer';
import { UUID } from 'crypto';
import GridSection from '../commons/grid-section';
import GridItem from '../commons/grid-item';

interface BranchConnectivityFormProps {
    currentNode: CurrentTreeNode;
    studyUuid: UUID;
    currentRootNetworkUuid: UUID;
    isModification?: boolean;
    previousValues?: any;
}

export function BranchConnectivityForm({
    currentNode,
    studyUuid,
    currentRootNetworkUuid,
    isModification = false,
    previousValues,
}: Readonly<BranchConnectivityFormProps>) {
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode.id, currentRootNetworkUuid);
    const id1 = `${CONNECTIVITY}.${CONNECTIVITY_1}`;
    const id2 = `${CONNECTIVITY}.${CONNECTIVITY_2}`;

    const connectivity1Field = (
        <ConnectivityForm
            id={id1}
            studyUuid={studyUuid}
            currentNode={currentNode}
            currentRootNetworkUuid={currentRootNetworkUuid}
            voltageLevelOptions={voltageLevelOptions}
            withPosition={true}
            isEquipmentModification={isModification}
            previousValues={{
                connectablePosition: previousValues?.connectablePosition1,
                terminalConnected: previousValues?.terminal1Connected,
            }}
        />
    );

    const connectivity2Field = (
        <ConnectivityForm
            id={id2}
            studyUuid={studyUuid}
            currentNode={currentNode}
            currentRootNetworkUuid={currentRootNetworkUuid}
            voltageLevelOptions={voltageLevelOptions}
            withPosition={true}
            isEquipmentModification={isModification}
            previousValues={{
                connectablePosition: previousValues?.connectablePosition2,
                terminalConnected: previousValues?.terminal2Connected,
            }}
        />
    );

    return (
        <>
            <GridSection title="Side1" heading={4} />
            <Grid container spacing={2}>
                <GridItem size={12}>{connectivity1Field}</GridItem>
            </Grid>
            <GridSection title="Side2" heading={4} />
            <Grid container spacing={2}>
                <GridItem size={12}>{connectivity2Field}</GridItem>
            </Grid>
        </>
    );
}
