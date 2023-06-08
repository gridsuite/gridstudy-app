/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { LineCreationDialogTab } from './line-modification-dialog';
import { Box } from '@mui/material';
import LimitsPane from '../../../limits/limits-pane';
import LineCharacteristicsPane from '../characteristics-pane/line-characteristics-pane';

const LineModificationDialogTabs = ({
    studyUuid,
    currentNode,
    lineToModify,
    modifiedLine,
    tabIndex,
}) => {
    return (
        <>
            <Box
                hidden={tabIndex !== LineCreationDialogTab.CHARACTERISTICS_TAB}
                p={1}
                sx={{ marginTop: -2 }}
            >
                <LineCharacteristicsPane
                    displayConnectivity={false}
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    lineToModify={lineToModify}
                    clearableFields={true}
                />
            </Box>

            <Box hidden={tabIndex !== LineCreationDialogTab.LIMITS_TAB} p={1}>
                <LimitsPane
                    currentNode={currentNode}
                    equipmentToModify={lineToModify}
                    modifiedEquipment={modifiedLine}
                    clearableFields={true}
                />
            </Box>
        </>
    );
};

export default LineModificationDialogTabs;
