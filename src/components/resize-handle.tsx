/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { PanelResizeHandle } from 'react-resizable-panels';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useTheme } from '@mui/material';

interface ResizeHandleProps {
    visible: boolean;
    rotated?: boolean;
}

const ResizeHandle = ({ visible, rotated = false }: ResizeHandleProps) => {
    const theme = useTheme();

    return (
        <PanelResizeHandle
            style={{
                display: visible ? 'flex' : 'none',
                alignItems: 'center',
                backgroundColor: theme.palette.background.paper,
                borderLeft: `1px solid ${theme.palette.divider}`,
                borderTop: `1px solid ${theme.palette.divider}`,
                justifyContent: 'center',
            }}
        >
            <DragIndicatorIcon fontSize="small" style={{ transform: rotated ? 'rotate(90deg)' : 'none' }} />
        </PanelResizeHandle>
    );
};

export default ResizeHandle;
