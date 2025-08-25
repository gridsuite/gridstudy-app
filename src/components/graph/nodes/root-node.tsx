/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import { NodeProps, Position } from '@xyflow/react';
import { useSelector } from 'react-redux';
import { BUILD_STATUS } from '../../network/constants';
import { AppState } from 'redux/reducer';
import { RootNode as RootNodeType } from 'components/graph/tree-node.type';
import { Theme } from '@mui/material/styles';
import { Box } from '@mui/material';
import { OverflowableText } from '@gridsuite/commons-ui';
import { DeviceHub } from '@mui/icons-material';
import NodeHandle from './node-handle';
import { baseNodeStyles, interactiveNodeStyles, selectedBaseNodeStyles } from './styles';

const styles = {
    // full node container styles
    rootSelected: (theme: Theme) => ({
        ...selectedBaseNodeStyles(theme, 'row'),
        border: theme.node.root.border,
        boxShadow: theme.shadows[10],
        ...interactiveNodeStyles(theme, 'root'),
    }),
    root: (theme: Theme) => ({
        ...baseNodeStyles(theme, 'row'),
        border: theme.node.root.border,
        ...interactiveNodeStyles(theme, 'root'),
    }),

    iconContainer: (theme: Theme) => ({
        flexGrow: 1,
        display: 'flex',
        alignItems: 'center',
        marginLeft: theme.spacing(0.8),
    }),

    iconButton: (theme: Theme) => ({
        width: 37,
        height: 37,
        background: theme.node.root.icon.background,
        borderRadius: '8px',
        '&:hover': {
            background: theme.node.root.icon.background,
        },
    }),

    deviceIcon: (theme: Theme) => ({
        fill: theme.node.root.icon.fill,
        width: 18,
        height: 18,
    }),

    labelContainer: (theme: Theme) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '70%',
        marginRight: theme.spacing(0.8),
    }),

    overflowText: (theme: Theme) => ({
        color: theme.palette.text.primary,
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: 'normal',
        textAlign: 'left',
    }),
};

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
                <Box sx={styles.iconContainer}>
                    <IconButton sx={styles.iconButton}>
                        {props.data.globalBuildStatus === BUILD_STATUS.BUILDING ? (
                            <CircularProgress size={24} />
                        ) : (
                            <DeviceHub sx={styles.deviceIcon} />
                        )}
                    </IconButton>
                </Box>
                <Box sx={styles.labelContainer}>
                    <OverflowableText text={currentRootNetwork?.name} sx={styles.overflowText} maxLineCount={3} />
                </Box>
            </Box>
        </>
    );
};

export default RootNode;
