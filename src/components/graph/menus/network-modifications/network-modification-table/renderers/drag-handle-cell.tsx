/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Box } from '@mui/material';
import { networkModificationTableStyles } from '../network-modification-table-styles';
import { FunctionComponent } from 'react';

const DragHandleCell: FunctionComponent<{ isRowDragDisabled: boolean }> = ({ isRowDragDisabled }) => {
    return (
        <Box sx={networkModificationTableStyles.dragHandle}>
            {!isRowDragDisabled && (
                <DragIndicatorIcon fontSize="small" sx={networkModificationTableStyles.dragIndicatorIcon} />
            )}
        </Box>
    );
};

export default DragHandleCell;
