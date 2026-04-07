/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { networkModificationTableStyles } from '../network-modification-table-styles';

interface DepthBoxProps {
    firstLevel: boolean;
    displayAsFolder?: boolean;
}

const DepthBox = ({ firstLevel, displayAsFolder = false }: DepthBoxProps) => {
    return (
        <Box
            sx={
                displayAsFolder
                    ? networkModificationTableStyles.folderDepthBox
                    : firstLevel
                      ? networkModificationTableStyles.firstLevelDepthBox
                      : networkModificationTableStyles.depthBox
            }
        >
            <Box sx={networkModificationTableStyles.depthBoxLine} />
            {displayAsFolder && <Box sx={networkModificationTableStyles.depthBoxTick} />}
        </Box>
    );
};

export default DepthBox;
