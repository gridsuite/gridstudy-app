/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import IconButton from '@mui/material/IconButton';
import { NodeProps, Position } from '@xyflow/react';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { RootNode as RootNodeType } from 'components/graph/tree-node.type';
import { Box } from '@mui/material';
import { type MuiStyles, OverflowableText } from '@gridsuite/commons-ui';
import { DeviceHub } from '@mui/icons-material';
import NodeHandle from './node-handle';
import { baseNodeStyles, interactiveNodeStyles } from './styles';
import { UnbuildAllNodesButton } from '../menus/root-network/unbuild-all-nodes-button';

const styles = {
    // full node container styles
    rootSelected: (theme) => ({
        ...baseNodeStyles(theme, 'column'),
        background: theme.node.root.selectedBackground,
        border: theme.node.root.border,
        boxShadow: theme.shadows[10],
        ...interactiveNodeStyles(theme, 'root'),
    }),
    root: (theme) => ({
        ...baseNodeStyles(theme, 'column'),
        border: theme.node.root.border,
        ...interactiveNodeStyles(theme, 'root'),
    }),

    iconContainer: (theme) => ({
        flexGrow: 1,
        display: 'flex',
        alignItems: 'center',
        marginLeft: theme.spacing(1),
    }),

    iconButton: (theme) => ({
        width: 37,
        height: 37,
        background: theme.node.root.icon.background,
        borderRadius: '8px',
        '&:hover': {
            background: theme.node.root.icon.background,
        },
    }),

    deviceIcon: (theme) => ({
        fill: theme.node.root.icon.fill,
        width: 18,
        height: 18,
    }),

    labelContainer: (theme) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '70%',
        marginRight: theme.spacing(1),
    }),

    overflowText: (theme) => ({
        color: theme.palette.text.primary,
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: 'normal',
        textAlign: 'left',
    }),

    mainBox: () => ({
        display: 'flex',
        height: '100%',
    }),

    buildBox: (theme) => ({
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: theme.spacing(-5),
        marginRight: theme.spacing(0),
        height: '35%',
    }),
} as const satisfies MuiStyles;

const RootNode = (props: NodeProps<RootNodeType>) => {
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const rootNetworks = useSelector((state: AppState) => state.rootNetworks);

    const currentRootNetwork = rootNetworks.find(
        (rootNetwork) => rootNetwork.rootNetworkUuid === currentRootNetworkUuid
    );

    const isSelectedNode = () => {
        return props.id === currentNode?.id;
    };

    return (
        <>
            <NodeHandle type={'source'} position={Position.Bottom} />
            <Box sx={isSelectedNode() ? styles.rootSelected : styles.root}>
                <Box sx={styles.mainBox}>
                    <Box sx={styles.iconContainer}>
                        <IconButton sx={styles.iconButton}>
                            <DeviceHub sx={styles.deviceIcon} />
                        </IconButton>
                    </Box>
                    <Box sx={styles.labelContainer}>
                        <OverflowableText text={currentRootNetwork?.name} sx={styles.overflowText} maxLineCount={3} />
                    </Box>
                </Box>
                <Box sx={styles.buildBox}>
                    <UnbuildAllNodesButton />
                </Box>
            </Box>
        </>
    );
};

export default RootNode;
