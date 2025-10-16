/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, useTheme } from '@mui/material';
import { NodeProps } from '@xyflow/react';
import SecurityIcon from '@mui/icons-material/Security';
import { nodeHeight as nodeLayoutHeight, nodeWidth as nodeLayoutWidth } from '../layout';
import { FormattedMessage } from 'react-intl';
import { LabeledGroupNodeType } from './labeled-group-node.type';
import { NODE_HEIGHT, NODE_WIDTH } from './constants';
import { labeledGroupNodeStyles, getContainerStyle, LABEL_GROUP_OFFSET } from './labeled-group-node.styles';

export function LabeledGroupNode({ data }: NodeProps<LabeledGroupNodeType>) {
    const theme = useTheme();
    // Vertically, the border is halfway between the node and the edge above,
    // and since that edge is centered between two nodes, we divide the space by 4.
    const verticalPadding = (nodeLayoutHeight - NODE_HEIGHT) / 4;
    // horizontally, the border is placed exactly halfway between two nodes — that's why we divide the space between them by 2.
    const horizontalPadding = (nodeLayoutWidth - NODE_WIDTH) / 2;

    // Adjust position and size to account for border width and label block
    const labeledGroupTopPosition = data.position.topLeft.row * nodeLayoutHeight - verticalPadding - LABEL_GROUP_OFFSET;
    const labeledGroupLeftPosition = data.position.topLeft.column * nodeLayoutWidth - horizontalPadding;

    const labeledGroupHeight =
        (data.position.bottomRight.row - data.position.topLeft.row + 1) * nodeLayoutHeight -
        2 * verticalPadding +
        2 * LABEL_GROUP_OFFSET;
    const labeledGroupWidth = (data.position.bottomRight.column - data.position.topLeft.column + 1) * nodeLayoutWidth;

    const isLight = theme.palette.mode === 'light';

    return (
        <Box
            position={'absolute'}
            visibility={'visible'} // react-flow sometimes hides nodes for obscure reasons
            top={labeledGroupTopPosition}
            left={labeledGroupLeftPosition}
            height={labeledGroupHeight}
            width={labeledGroupWidth}
            sx={getContainerStyle(theme, isLight)}
        >
            <Box sx={labeledGroupNodeStyles.label}>
                <SecurityIcon sx={labeledGroupNodeStyles.icon} />
                <Box component="span" sx={labeledGroupNodeStyles.text}>
                    <FormattedMessage id="labeledGroupSecurity" />
                </Box>
            </Box>
        </Box>
    );
}
