/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { LineModificationDialogTab } from './line-modification-dialog';
import { Box } from '@mui/material';
import { LimitsPane } from '../../../limits/limits-pane';
import LineCharacteristicsPane from '../characteristics-pane/line-characteristics-pane';
import BranchConnectivityForm from '../../../connectivity/branch-connectivity-form';

const LineModificationDialogTabs = ({ studyUuid, currentNode, currentRootNetworkUuid, lineToModify, tabIndex }) => {
    return (
        <>
            <Box hidden={tabIndex !== LineModificationDialogTab.CONNECTIVITY_TAB} p={1}>
                <BranchConnectivityForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    withPosition={true}
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
                <LimitsPane
                    currentNode={currentNode}
                    equipmentToModify={lineToModify}
                    clearableFields={true}
                    onlySelectedLimitsGroup
                />
            </Box>
        </>
    );
};

export default LineModificationDialogTabs;
