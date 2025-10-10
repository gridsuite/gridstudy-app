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
import { LIGHT_THEME } from '@gridsuite/commons-ui';
import { getLocalStorageTheme } from '../../../redux/session-storage/local-storage';
import { BUILD_STATUS } from '../../network/constants';
import { AppState } from 'redux/reducer';
import { CopyType } from 'components/network-modification.type';
import { ModificationNode } from '../tree-node.type';
import NodeHandle from './node-handle';
import NodeOverlaySpinner from './node-overlay-spinner';
import BuildStatusChip from './build-status-chip';
import React, { useCallback, useMemo } from 'react';
import { BuildButton } from './build-button';
import { Tooltip, Typography, useTheme } from '@mui/material';
import { useIntl } from 'react-intl';
import { TOOLTIP_DELAY } from 'utils/UIconstants';
import ForwardRefBox from 'components/utils/forwardRefBox';
import { zoomStyles } from '../zoom.styles';
import { modificationNodeStyles, getBorderWidthStyle, getNodeBaseStyle } from './network-modification-node.styles';

const NetworkModificationNode = (props: NodeProps<ModificationNode>) => {
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const selectionForCopy = useSelector((state: AppState) => state.nodeSelectionForCopy);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

    const intl = useIntl();
    const theme = useTheme();
    const isSelectedNode = useCallback(() => {
        return props.id === currentNode?.id;
    }, [currentNode, props.id]);

    const isSelectedForCut = useCallback(() => {
        return (
            (props.id === selectionForCopy?.nodeId && selectionForCopy?.copyType === CopyType.NODE_CUT) ||
            ((props.id === selectionForCopy?.nodeId ||
                selectionForCopy.allChildren?.map((child) => child.id)?.includes(props.id)) &&
                selectionForCopy?.copyType === CopyType.SUBTREE_CUT)
        );
    }, [props.id, selectionForCopy]);

    const nodeOpacity = useMemo(() => {
        if (!isSelectedForCut()) {
            return 1;
        }
        return getLocalStorageTheme() === LIGHT_THEME ? 0.3 : 0.6;
    }, [isSelectedForCut]);

    const tooltipContent = useMemo(() => {
        return (
            <Box style={{ whiteSpace: 'pre-line' }}>
                <Box>{props.data.label}</Box>
                <Box>
                    {intl.formatMessage({ id: 'nodeStatus' })} :{' '}
                    {props.data.globalBuildStatus
                        ? intl.formatMessage({ id: props.data.globalBuildStatus })
                        : intl.formatMessage({ id: 'NOT_BUILT' })}
                </Box>
                <Box>
                    {intl.formatMessage({ id: 'nodeType' })} : {intl.formatMessage({ id: props.data.nodeType })}
                </Box>
            </Box>
        );
    }, [props.data, intl]);

    return (
        <>
            <NodeHandle type={'source'} position={Position.Bottom} />
            <NodeHandle type={'target'} position={Position.Top} />

            {props.data.globalBuildStatus !== props.data.localBuildStatus &&
                zoomStyles.visibility.showGlobalBuildStatus(theme) && (
                    <BuildStatusChip
                        buildStatus={props.data.globalBuildStatus}
                        sx={modificationNodeStyles.chipFloating}
                        icon={<ArrowUpwardIcon sx={modificationNodeStyles.globalBuildStatusIcon} color="inherit" />}
                        onClick={(e) => e.stopPropagation()}
                    />
                )}

            <Tooltip
                title={tooltipContent}
                disableFocusListener
                disableTouchListener
                componentsProps={{
                    tooltip: { sx: modificationNodeStyles.tooltip },
                }}
                arrow
                enterDelay={theme.tree?.is.minimalDetail ? 0 : TOOLTIP_DELAY}
                enterNextDelay={theme.tree?.is.minimalDetail ? 0 : TOOLTIP_DELAY}
                placement="left"
            >
                <ForwardRefBox
                    sx={[
                        (theme) => getNodeBaseStyle(theme, isSelectedNode()),
                        { opacity: nodeOpacity },
                        (theme) => getBorderWidthStyle(theme, isSelectedNode()),
                    ]}
                >
                    <Box sx={modificationNodeStyles.contentBox}>
                        <Typography variant="body1" sx={modificationNodeStyles.typographyText}>
                            {props.data.label}
                        </Typography>
                    </Box>

                    <Box sx={modificationNodeStyles.footer}>
                        <Box>
                            {props.data.globalBuildStatus !== BUILD_STATUS.BUILDING && (
                                <BuildStatusChip
                                    buildStatus={props.data.localBuildStatus}
                                    sx={modificationNodeStyles.chipLarge}
                                />
                            )}
                        </Box>
                        <Box sx={modificationNodeStyles.buildButtonContainer}>
                            {props.data.localBuildStatus !== BUILD_STATUS.BUILDING && (
                                <BuildButton
                                    buildStatus={props.data.localBuildStatus}
                                    studyUuid={studyUuid}
                                    currentRootNetworkUuid={currentRootNetworkUuid}
                                    nodeUuid={props.id}
                                />
                            )}
                        </Box>
                    </Box>

                    {props.data.localBuildStatus === BUILD_STATUS.BUILDING && <NodeOverlaySpinner />}
                </ForwardRefBox>
            </Tooltip>
        </>
    );
};

export default NetworkModificationNode;
