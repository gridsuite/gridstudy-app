/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Theme } from '@mui/material';
import { NodeProps } from '@xyflow/react';
import { nodeHeight as nodeLayoutHeight, nodeWidth as nodeLayoutWidth } from '../layout';
import SecurityIcon from '@mui/icons-material/Security';
import { FormattedMessage } from 'react-intl';
import { LabeledGroupNodeType } from './labeled-group-node.type';

const styles = {
    border: {
        border: 'dashed 3px #8B8F8F',
        borderRadius: '8px',
    },
    label: (theme: Theme) => ({
        position: 'absolute',
        top: -13,
        right: 8,
        backgroundColor: theme.reactflow.labeledGroup.backgroundColor,
        padding: '0px 6px',
        border: '1px solid',
        borderColor: theme.reactflow.labeledGroup.borderColor,
        fontSize: 12,
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
    }),
};

export function LabeledGroupNode({ data }: NodeProps<LabeledGroupNodeType>) {
    // data extracted from index.css - react-flow__node-NETWORK_MODIFICATION class
    const NODE_WIDTH = 180;
    const NODE_HEIGHT = 60;

    // Vertically, the border is halfway between the node and the edge above,
    // and since that edge is centered between two nodes, we divide the space by 4.
    const verticalPadding = (nodeLayoutHeight - NODE_HEIGHT) / 4;
    // horizontally, the border is placed exactly halfway between two nodes — that's why we divide the space between them by 2.
    const horizontalPadding = (nodeLayoutWidth - NODE_WIDTH) / 2;

    const labeledGroupTopPosition = data.position.topLeft.row * nodeLayoutHeight - verticalPadding;
    const labeledGroupLeftPosition = data.position.topLeft.column * nodeLayoutWidth - horizontalPadding;

    const labeledGroupHeight =
        (data.position.bottomRight.row - data.position.topLeft.row + 1) * nodeLayoutHeight - 2 * verticalPadding;
    const labeledGroupWidth = (data.position.bottomRight.column - data.position.topLeft.column + 1) * nodeLayoutWidth;

    return (
        <Box
            position={'absolute'}
            visibility={'visible'} // react-flow sometimes hides nodes for obscure reasons
            top={labeledGroupTopPosition}
            left={labeledGroupLeftPosition}
            height={labeledGroupHeight}
            width={labeledGroupWidth}
            sx={styles.border}
        >
            <Box sx={styles.label}>
                <SecurityIcon sx={{ fontSize: '12px' }} />
                <FormattedMessage id="labeledGroupSecurity" />
            </Box>
        </Box>
    );
}
