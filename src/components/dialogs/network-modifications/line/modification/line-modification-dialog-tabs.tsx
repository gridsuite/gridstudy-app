/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box } from '@mui/material';
import LineCharacteristicsPane from '../characteristics-pane/line-characteristics-pane';
import { BranchConnectivityForm } from '../../../connectivity/branch-connectivity-form';
import BranchActiveReactivePowerMeasurementsForm from '../../common/measurements/branch-active-reactive-power-form';
import { LineModificationDialogTab } from '../line-utils';
import { LimitsPaneCreation } from '../../../limits/creation/limits-pane-creation';
import { UUID } from 'crypto';
import { CurrentTreeNode } from '../../../../graph/tree-node.type';
import { LineInfos } from '../../../../../services/study/network-map.type';

export interface LineModificationDialogTabsProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    lineToModify: LineInfos;
    tabIndex: number;
}

const LineModificationDialogTabs = ({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    lineToModify,
    tabIndex,
}: Readonly<LineModificationDialogTabsProps>): JSX.Element => {
    return (
        <>
            <Box hidden={tabIndex !== LineModificationDialogTab.CONNECTIVITY_TAB} p={1}>
                <BranchConnectivityForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    isModification={true}
                    previousValues={lineToModify}
                />
            </Box>
            <Box hidden={tabIndex !== LineModificationDialogTab.CHARACTERISTICS_TAB} p={1}>
                <LineCharacteristicsPane
                    displayConnectivity={false}
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    lineToModify={lineToModify}
                    clearableFields={true}
                    isModification={true}
                />
            </Box>

            <Box hidden={tabIndex !== LineModificationDialogTab.LIMITS_TAB} p={1}>
                <LimitsPaneCreation currentNode={currentNode} equipmentToModify={lineToModify} clearableFields={true} />
            </Box>

            <Box hidden={tabIndex !== LineModificationDialogTab.STATE_ESTIMATION_TAB} p={1}>
                <BranchActiveReactivePowerMeasurementsForm equipmentToModify={lineToModify} />
            </Box>
        </>
    );
};

export default LineModificationDialogTabs;
