/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Typography } from '@mui/material';
import { NodeProps } from '@xyflow/react';
import { nodeHeight, nodeWidth } from '../layout';
import SecurityIcon from '@mui/icons-material/Security';
import { FormattedMessage } from 'react-intl';

const styles = {
    border: {
        border: 'dashed 3px #8B8F8F',
        borderRadius: '8px',
    },
    label: {
        position: 'absolute',
        top: -13, // décale un peu vers le haut hors de la box
        right: 8, // décale un peu vers la droite hors de la box
        backgroundColor: 'black',
        padding: '0px 6px',
        border: '1px solid white',
        fontSize: 12,
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
    },
};

export function LabeledGroupNode({ data }: NodeProps<any>) {
    const verticalPadding = (nodeHeight - 60) / 4;
    const horizontalPadding = (nodeWidth - 180) / 2;

    const labeledGroupTopPosition = data.position.topLeft.y * nodeHeight - verticalPadding;
    const labeledGroupLeftPosition = data.position.topLeft.x * nodeWidth - horizontalPadding;
    const labeledGroupHeight =
        (data.position.bottomRight.y - data.position.topLeft.y + 1) * nodeHeight - 2 * verticalPadding;
    const labeledGroupWidth = (data.position.bottomRight.x - data.position.topLeft.x + 1) * nodeWidth;

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
                <SecurityIcon style={{ fontSize: '12px' }} />
                <FormattedMessage id="labeledGroupSecurity" />
            </Box>
        </Box>
    );
}
