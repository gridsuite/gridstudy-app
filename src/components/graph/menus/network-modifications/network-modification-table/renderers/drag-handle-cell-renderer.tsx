/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Box } from '@mui/material';
import { memo } from 'react';
import { styles } from '../styles';

const DragHandleCell = ({ isRowDragDisabled }: { isRowDragDisabled: boolean }) => {
    if (isRowDragDisabled) {
        return <Box sx={{ width: 24 }} />;
    }
    return (
        <Box sx={styles.dragHandle}>
            <DragIndicatorIcon fontSize="small" />
        </Box>
    );
};

export default DragHandleCell;
