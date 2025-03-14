/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent } from 'react';

import { ConnectivityForm } from '../../../connectivity/connectivity-form';
import PropertiesForm from '../../common/properties/properties-form';
import { Box, Grid } from '@mui/material';
import { StandbyAutomatonForm } from './standby-automaton-form';
import { SetPointsLimitsForm } from './set-points-limits-form';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';
import { UUID } from 'crypto';
import GridItem from '../../../commons/grid-item';
import { StaticVarCompensatorCreationDialogTab } from './static-var-compensator-creation-utils';
import { CurrentTreeNode } from '../../../../../redux/reducer';

export interface StaticVarCompensatorCreationFormProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    tabIndex: number;
}

const StaticVarCompensatorCreationForm: FunctionComponent<StaticVarCompensatorCreationFormProps> = ({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    tabIndex,
}) => {
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode.id, currentRootNetworkUuid);
    const connectivityForm = (
        <ConnectivityForm
            voltageLevelOptions={voltageLevelOptions}
            withPosition={true}
            studyUuid={studyUuid}
            currentNode={currentNode}
            currentRootNetworkUuid={currentRootNetworkUuid}
            previousValues={undefined}
        />
    );

    return (
        <>
            <Box hidden={tabIndex !== StaticVarCompensatorCreationDialogTab.CONNECTIVITY_TAB} p={1}>
                <Grid container spacing={2}>
                    <GridItem size={12}>{connectivityForm}</GridItem>
                </Grid>
            </Box>
            <Box hidden={tabIndex !== StaticVarCompensatorCreationDialogTab.SET_POINTS_LIMITS_TAB}>
                <SetPointsLimitsForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    voltageLevelOptions={voltageLevelOptions}
                />
            </Box>
            <Box hidden={tabIndex !== StaticVarCompensatorCreationDialogTab.AUTOMATON_TAB}>
                <StandbyAutomatonForm />
            </Box>
            <Box hidden={tabIndex !== StaticVarCompensatorCreationDialogTab.ADDITIONAL_INFO_TAB}>
                <PropertiesForm networkElementType={'staticCompensator'} />
            </Box>
        </>
    );
};

export default StaticVarCompensatorCreationForm;
