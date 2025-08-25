/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { NodeProps, Position } from '@xyflow/react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import { LIGHT_THEME, OverflowableText } from '@gridsuite/commons-ui';
import { getLocalStorageTheme } from '../../../redux/session-storage/local-storage';
import { BUILD_STATUS } from '../../network/constants';
import { Theme } from '@mui/material';
import { AppState } from 'redux/reducer';
import { CopyType } from 'components/network-modification.type';
import { ModificationNode } from '../tree-node.type';
import NodeHandle from './node-handle';
import { baseNodeStyles, interactiveNodeStyles, selectedBaseNodeStyles } from './styles';
import NodeOverlaySpinner from './node-overlay-spinner';
import BuildStatusChip from './build-status-chip';
import { NODE_HEIGHT, NODE_WIDTH } from './constants';

const styles = {
    networkModificationSelected: (theme: Theme) => ({
        ...selectedBaseNodeStyles(theme, 'column'),
        border: theme.node.modification.selectedBorder,
        ...interactiveNodeStyles(theme, 'modification'),
    }),
    networkModification: (theme: Theme) => ({
        ...baseNodeStyles(theme, 'column'),
        border: theme.node.modification.border,
        ...interactiveNodeStyles(theme, 'modification'),
    }),
    nodeBox: {
        height: NODE_HEIGHT,
        width: NODE_WIDTH,
    },
    contentBox: (theme: Theme) => ({
        flexGrow: 1,
        display: 'flex',
        alignItems: 'flex-end',
        marginLeft: theme.spacing(0.8),
        marginRight: theme.spacing(0.8),
        marginBottom: theme.spacing(0.8),
    }),
    overflowText: (theme: Theme) => ({
        color: theme.palette.text.primary,
        fontSize: '20px',
        fontWeight: 400,
        lineHeight: 'normal',
        textAlign: 'left',
    }),
    footerBox: (theme: Theme) => ({
        display: 'flex',
        justifyContent: 'flex-start',
        marginLeft: theme.spacing(0.8),
        height: '35%',
    }),
    chipFloating: (theme: Theme) => ({
        position: 'absolute',
        top: theme.spacing(-4),
        left: theme.spacing(0.8),
        zIndex: 2,
    }),
    tooltip: {
        maxWidth: '720px',
    },
};

const NetworkModificationNode = (props: NodeProps<ModificationNode>) => {
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const selectionForCopy = useSelector((state: AppState) => state.nodeSelectionForCopy);

    const isSelectedNode = () => {
        return props.id === currentNode?.id;
    };

    const isSelectedForCut = () => {
        return (
            (props.id === selectionForCopy?.nodeId && selectionForCopy?.copyType === CopyType.NODE_CUT) ||
            ((props.id === selectionForCopy?.nodeId ||
                selectionForCopy.allChildren?.map((child) => child.id)?.includes(props.id)) &&
                selectionForCopy?.copyType === CopyType.SUBTREE_CUT)
        );
    };

    const getNodeOpacity = () => {
        return isSelectedForCut() ? (getLocalStorageTheme() === LIGHT_THEME ? 0.3 : 0.6) : 'unset';
    };

    return (
        <>
            <NodeHandle type={'source'} position={Position.Bottom} />
            <NodeHandle type={'target'} position={Position.Top} />

            {props.data.globalBuildStatus !== props.data.localBuildStatus && (
                <BuildStatusChip
                    buildStatus={props.data.globalBuildStatus}
                    sx={styles.chipFloating}
                    icon={<ArrowUpwardIcon style={{ fontSize: '14px' }} color="inherit" />}
                    onClick={(e) => e.stopPropagation()}
                />
            )}

            <Box
                sx={[
                    isSelectedNode() ? styles.networkModificationSelected : styles.networkModification,
                    styles.nodeBox,
                    { opacity: getNodeOpacity() },
                ]}
            >
                <Box sx={styles.contentBox}>
                    <OverflowableText
                        text={props.data.label}
                        sx={styles.overflowText}
                        tooltipSx={styles.tooltip}
                        maxLineCount={2}
                    />
                </Box>

                <Box sx={styles.footerBox}>
                    {props.data.globalBuildStatus !== BUILD_STATUS.BUILDING && (
                        <BuildStatusChip buildStatus={props.data.localBuildStatus} />
                    )}
                </Box>

                {props.data.localBuildStatus === BUILD_STATUS.BUILDING && <NodeOverlaySpinner />}
            </Box>
        </>
    );
};

export default NetworkModificationNode;
