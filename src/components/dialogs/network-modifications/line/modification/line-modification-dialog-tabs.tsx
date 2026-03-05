/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box } from '@mui/material';
import LineCharacteristicsPane from '../characteristics-pane/line-characteristics-pane';
import { LineModificationDialogTab } from '../line-utils';
import { LimitsPane } from '../../../limits/limits-pane';
import type { UUID } from 'node:crypto';
import { CurrentTreeNode } from '../../../../graph/tree-node.type';
import { BranchInfos } from '../../../../../services/study/network-map.type';
import { JSX, useCallback } from 'react';
import { BranchActiveReactivePowerMeasurementsForm, BranchConnectivityForm } from '@gridsuite/commons-ui';
import PositionDiagramPane from '../../../../grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';
import { fetchBusesOrBusbarSectionsForVoltageLevel } from '../../../../../services/study/network';

export interface LineModificationDialogTabsProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    lineToModify: BranchInfos | null;
    tabIndex: number | null;
}

const LineModificationDialogTabs = ({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    lineToModify,
    tabIndex,
}: Readonly<LineModificationDialogTabsProps>): JSX.Element => {
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

    return (
        <>
            <Box hidden={tabIndex !== LineModificationDialogTab.CONNECTIVITY_TAB} p={1}>
                <BranchConnectivityForm
                    isModification={true}
                    previousValues={lineToModify}
                    voltageLevelOptions={voltageLevelOptions}
                    PositionDiagramPane={PositionDiagramPane}
                    fetchBusesOrBusbarSections={fetchBusesOrBusbarSections}
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
                <LimitsPane currentNode={currentNode} equipmentToModify={lineToModify} clearableFields={true} />
            </Box>

            <Box hidden={tabIndex !== LineModificationDialogTab.STATE_ESTIMATION_TAB} p={1}>
                <BranchActiveReactivePowerMeasurementsForm equipmentToModify={lineToModify} />
            </Box>
        </>
    );
};

export default LineModificationDialogTabs;
