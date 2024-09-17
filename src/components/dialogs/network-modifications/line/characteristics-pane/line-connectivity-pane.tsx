/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import { gridItem, GridSection } from '../../../dialogUtils';
import { ConnectivityForm } from '../../../connectivity/connectivity-form';
import { CONNECTIVITY_1, CONNECTIVITY_2 } from 'components/utils/field-constants';
import React, { FunctionComponent } from 'react';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';
import { CurrentTreeNode } from '../../../../../redux/reducer';
import { UUID } from 'crypto';

interface LineConnectivityPaneProps {
    currentNode: CurrentTreeNode;
    studyUuid: UUID;
    isModification?: boolean;
    previousValues?: any;
}

const LineConnectivityPane: FunctionComponent<LineConnectivityPaneProps> = ({
    currentNode,
    studyUuid,
    isModification = false,
    previousValues,
}) => {
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode.id);

    const connectivity1Field = (
        <ConnectivityForm
            id={CONNECTIVITY_1}
            studyUuid={studyUuid}
            currentNode={currentNode}
            voltageLevelOptions={voltageLevelOptions}
            withPosition={true}
            isEquipmentModification={isModification}
            previousValues={previousValues}
        />
    );

    const connectivity2Field = (
        <ConnectivityForm
            id={CONNECTIVITY_2}
            studyUuid={studyUuid}
            currentNode={currentNode}
            voltageLevelOptions={voltageLevelOptions}
            withPosition={true}
            isEquipmentModification={isModification}
            previousValues={previousValues}
        />
    );

    return (
        <>
            <GridSection title="Side1" heading="4" />
            <Grid container spacing={2}>
                {gridItem(connectivity1Field, 12)}
            </Grid>
            <GridSection title="Side2" heading="4" />
            <Grid container spacing={2}>
                {gridItem(connectivity2Field, 12)}
            </Grid>
        </>
    );
};

export default LineConnectivityPane;
