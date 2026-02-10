/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box } from '@mui/material';
import { ConnectivityForm } from 'components/dialogs/connectivity/connectivity-form';
import { SetPointsForm } from 'components/dialogs/set-points/set-points-form';
import { Identifiable, PropertiesForm } from '@gridsuite/commons-ui';
import { LoadDialogTab } from './load-utils';
import { PowerMeasurementsForm } from '../../common/measurements/power-measurements-form';
import GridSection from 'components/dialogs/commons/grid-section';
import React from 'react';
import type { UUID } from 'node:crypto';
import { CurrentTreeNode } from 'components/graph/tree-node.type';
import { LoadFormInfos } from './load.type';

interface LoadDialogTabsContentProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    loadToModify?: LoadFormInfos | null;
    tabIndex: number;
    voltageLevelOptions: Identifiable[];
    isModification?: boolean;
}

const LoadDialogTabsContent: React.FC<LoadDialogTabsContentProps> = ({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    loadToModify,
    tabIndex,
    voltageLevelOptions,
    isModification = false,
}) => {
    return (
        <>
            <Box hidden={tabIndex !== LoadDialogTab.CONNECTIVITY_TAB} p={1}>
                <ConnectivityForm
                    voltageLevelOptions={voltageLevelOptions}
                    withPosition={true}
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    isEquipmentModification={isModification}
                    previousValues={{
                        connectablePosition: loadToModify?.connectablePosition,
                        voltageLevelId: loadToModify?.voltageLevelId,
                        busOrBusbarSectionId: loadToModify?.busOrBusbarSectionId,
                        terminalConnected: loadToModify?.terminalConnected,
                    }}
                />
            </Box>
            <Box hidden={tabIndex !== LoadDialogTab.CHARACTERISTICS_TAB} p={1} sx={{ marginTop: -4 }}>
                <SetPointsForm
                    previousValues={{
                        activePower: loadToModify?.p0,
                        reactivePower: loadToModify?.q0,
                    }}
                    isModification={isModification}
                />
                <PropertiesForm networkElementType={'load'} isModification={isModification} />
            </Box>
            {isModification && (
                <Box hidden={tabIndex !== LoadDialogTab.STATE_ESTIMATION_TAB} p={1} sx={{ marginTop: -4 }}>
                    <GridSection title="MeasurementsSection" />
                    <PowerMeasurementsForm
                        activePowerMeasurement={loadToModify?.measurementP}
                        reactivePowerMeasurement={loadToModify?.measurementQ}
                    />
                </Box>
            )}
        </>
    );
};

export default LoadDialogTabsContent;
