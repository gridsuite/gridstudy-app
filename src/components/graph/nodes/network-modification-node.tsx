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
import { LIGHT_THEME, type MuiStyles } from '@gridsuite/commons-ui';
import { getLocalStorageTheme } from '../../../redux/session-storage/local-storage';
import { BUILD_STATUS } from '../../network/constants';
import { AppState } from 'redux/reducer';
import { CopyType } from 'components/network-modification.type';
import { ModificationNode } from '../tree-node.type';
import NodeHandle from './node-handle';
import { baseNodeStyles, interactiveNodeStyles } from './styles';
import NodeOverlaySpinner from './node-overlay-spinner';
import BuildStatusChip from './build-status-chip';

import { BuildButton } from './build-button';
import { Tooltip, Typography } from '@mui/material';
import { useIntl } from 'react-intl';
import { forwardRef, useMemo } from 'react';

const styles = {
    networkModificationSelected: (theme) => ({
        ...baseNodeStyles(theme, 'column'),
        background: theme.node.modification.selectedBackground,
        border: theme.node.modification.selectedBorder,
        boxShadow: theme.shadows[6],
        ...interactiveNodeStyles(theme, 'modification'),
    }),
    networkModification: (theme) => ({
        ...baseNodeStyles(theme, 'column'),
        border: theme.node.modification.border,
        ...interactiveNodeStyles(theme, 'modification'),
    }),
    contentBox: (theme) => ({
        flexGrow: 1,
        display: 'flex',
        alignItems: 'flex-end',
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(1),
    }),
    typographyText: (theme) => ({
        color: theme.palette.text.primary,
        fontSize: '20px',
        fontWeight: 400,
        lineHeight: 'normal',
        textAlign: 'left',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 2,
        overflow: 'hidden',
        width: 'auto',
        textOverflow: 'ellipsis',
        wordBreak: 'break-word',
    }),
    footerBox: (theme) => ({
        display: 'flex',
        justifyContent: 'flex-start',
        marginLeft: theme.spacing(1),
        height: '35%',
    }),
    buildBox: (theme) => ({
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: theme.spacing(-5),
        marginRight: theme.spacing(0),
        height: '35%',
    }),
    chipFloating: (theme) => ({
        position: 'absolute',
        top: theme.spacing(-4),
        left: theme.spacing(1),
        zIndex: 2,
    }),
    tooltip: {
        maxWidth: '720px',
    },
} as const satisfies MuiStyles;

const NodeBox = forwardRef<HTMLDivElement, any>(({ children, ...boxProps }, ref) => (
    <Box ref={ref} {...boxProps}>
        {children}
    </Box>
));

const NetworkModificationNode = (props: NodeProps<ModificationNode>) => {
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const selectionForCopy = useSelector((state: AppState) => state.nodeSelectionForCopy);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

    const intl = useIntl();

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
    const tooltipContent = useMemo(() => {
        return (
            <Box style={{ whiteSpace: 'pre-line' }}>
                <Box>{props.data.label}</Box>
                <Box>
                    {intl.formatMessage({ id: 'nodeStatus' })} :{' '}
                    {props.data
                        ? intl.formatMessage({ id: props.data.globalBuildStatus })
                        : intl.formatMessage({ id: 'NOT_BUILT' })}
                </Box>
                <Box>
                    {intl.formatMessage({ id: 'nodeType' })} : {intl.formatMessage({ id: props.data.nodeType })}
                </Box>
            </Box>
        );
    }, [props.data, intl]);

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

            <Tooltip
                title={tooltipContent}
                disableFocusListener
                disableTouchListener
                componentsProps={{
                    tooltip: { sx: { maxWidth: '720px' } },
                }}
                followCursor
                placement="right"
            >
                <NodeBox
                    sx={[
                        isSelectedNode() ? styles.networkModificationSelected : styles.networkModification,
                        { opacity: getNodeOpacity() },
                    ]}
                >
                    <Box sx={styles.contentBox}>
                        <Typography variant="body1" sx={styles.typographyText}>
                            {props.data.label}
                        </Typography>
                    </Box>

                    <Box sx={styles.footerBox}>
                        {props.data.globalBuildStatus !== BUILD_STATUS.BUILDING && (
                            <BuildStatusChip buildStatus={props.data.localBuildStatus} />
                        )}
                    </Box>

                    <Box sx={styles.buildBox}>
                        {props.data.localBuildStatus !== BUILD_STATUS.BUILDING && (
                            <BuildButton
                                buildStatus={props.data.localBuildStatus}
                                studyUuid={studyUuid}
                                currentRootNetworkUuid={currentRootNetworkUuid}
                                nodeUuid={props.id}
                            />
                        )}
                    </Box>

                    {props.data.localBuildStatus === BUILD_STATUS.BUILDING && <NodeOverlaySpinner />}
                </NodeBox>
            </Tooltip>
        </>
    );
};

export default NetworkModificationNode;
