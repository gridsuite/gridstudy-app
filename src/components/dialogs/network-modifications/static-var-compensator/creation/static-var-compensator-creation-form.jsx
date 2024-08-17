/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import React from 'react';

import { gridItem } from '../../../dialogUtils';
import { ConnectivityForm } from '../../../connectivity/connectivity-form';
import PropertiesForm from '../../common/properties/properties-form';
import { Box } from '@mui/material';
import { StaticVarCompensatorCreationDialogTab } from './static-var-compensator-creation-dialog-tabs';
import { AutomateForm } from './automate-form';
import { SetPointsLimitsForm } from './set-points-limits-form';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';

const StaticVarCompensatorCreationForm = ({ studyUuid, currentNode, tabIndex }) => {
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode.id);
    const connectivityForm = (
        <ConnectivityForm
            withPosition={true}
            voltageLevelOptions={voltageLevelOptions}
            studyUuid={studyUuid}
            currentNode={currentNode}
        />
    );

    return (
        <>
            <Box hidden={tabIndex !== StaticVarCompensatorCreationDialogTab.CONNECTIVITY_TAB} p={1}>
                <Grid container spacing={2}>
                    {gridItem(connectivityForm, 12)}
                </Grid>
            </Box>
            <Box hidden={tabIndex !== StaticVarCompensatorCreationDialogTab.SET_POINTS_LIMITS_TAB}>
                <SetPointsLimitsForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    voltageLevelOptions={voltageLevelOptions}
                />
            </Box>
            <Box hidden={tabIndex !== StaticVarCompensatorCreationDialogTab.AUTOMATON_TAB}>
                <AutomateForm />
            </Box>
            <Box hidden={tabIndex !== StaticVarCompensatorCreationDialogTab.ADDITIONAL_INFO_TAB}>
                <PropertiesForm networkElementType={'staticCompensator'} />
            </Box>
        </>
    );
};

export default StaticVarCompensatorCreationForm;
