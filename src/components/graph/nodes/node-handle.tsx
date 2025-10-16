/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useTheme } from '@mui/material';
import { Handle, HandleType, Position } from '@xyflow/react';
import { zoomStyles } from '../zoom.styles';

type NodeHandleProps = {
    type: HandleType;
    position: Position;
};

const NodeHandle = ({ type, position }: NodeHandleProps) => {
    const theme = useTheme();
    const hidden = !zoomStyles.visibility.showHandles(theme);

    return (
        <Handle
            type={type}
            position={position}
            style={{
                opacity: hidden ? 0 : 1,
                width: 12,
                height: 12,
                borderRadius: '50%',
                border: theme.reactflow.handle.border,
                background: theme.reactflow.handle.background,
                zIndex: 99,
            }}
            isConnectable={false}
        />
    );
};

export default NodeHandle;
