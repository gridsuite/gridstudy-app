/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import Button from '@mui/material/Button';
import { Handle } from 'react-flow-renderer';
import { useSelector } from 'react-redux';
import CircularProgress from '@mui/material/CircularProgress';
import LockIcon from '@mui/icons-material/Lock';
import { OverflowableText } from '@gridsuite/commons-ui';
import { CopyType } from '../../network-modification-tree-pane';
import { getLocalStorageTheme } from '../../../redux/local-storage';
import { LIGHT_THEME } from '@gridsuite/commons-ui';
import { BUILD_STATUS } from '../../network/constants';
import { Box } from '@mui/system';

const BUILT_NODE_BANNER_COLOR = '#74a358';
const BUILT_WITH_WARNING_NODE_BANNER_COLOR = '#FFA500';
const BUILT_WITH_ERROR_NODE_BANNER_COLOR = '#DC143C';
const NOT_BUILT_NODE_BANNER_COLOR = '#9196a1';

const buildBanner = {
    display: 'flex',
    height: '100%',
    width: '15%',
    position: 'absolute',
    top: '0px',
    left: '0px',
};

const bottomBuildBanner = {
    display: 'flex',
    height: '25%',
    width: '15%',
    position: 'absolute',
    bottom: '0px',
    left: '0px',
};

const styles = {
    networkModificationSelected: (theme) => ({
        position: 'relative',
        variant: 'contained',
        background: theme.node.background,
        textTransform: 'none',
        color: theme.palette.primary.contrastText,
        '&:hover': {
            background: theme.node.background,
        },
        overflow: 'hidden',
        boxShadow:
            theme.node.border +
            ' 0px 0px 3px 3px,' +
            theme.node.border +
            ' 0px 0px 25px,' +
            theme.node.border +
            ' 0px 0px 5px 1px',
    }),
    networkModification: (theme) => ({
        background: theme.palette.text.secondary,
        textTransform: 'none',
        color: theme.palette.primary.contrastText,
        '&:hover': {
            background: theme.node.hover,
        },
        overflow: 'hidden',
    }),
    outOfBoundIcons: {
        display: 'flex',
        flexDirection: 'column',
        position: 'absolute',
        right: '-30px',
        top: '18px',
    },
    labelWrapper: {
        display: 'flex',
        width: '85%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        lineHeight: 'normal',
        marginLeft: 'auto',
    },
    buildBannerOK: {
        ...buildBanner,
        background: BUILT_NODE_BANNER_COLOR,
    },
    buildBannerWarning: {
        ...buildBanner,
        background: BUILT_WITH_WARNING_NODE_BANNER_COLOR,
    },
    buildBannerError: {
        ...buildBanner,
        background: BUILT_WITH_ERROR_NODE_BANNER_COLOR,
    },
    buildBannerNotBuilt: {
        ...buildBanner,
        background: NOT_BUILT_NODE_BANNER_COLOR,
    },
    bottomBuildBannerOK: {
        ...bottomBuildBanner,
        background: BUILT_NODE_BANNER_COLOR,
    },
    bottomBuildBannerWarning: {
        ...bottomBuildBanner,
        background: BUILT_WITH_WARNING_NODE_BANNER_COLOR,
    },
    bottomBuildBannerError: {
        ...bottomBuildBanner,
        background: BUILT_WITH_ERROR_NODE_BANNER_COLOR,
    },
    bottomBuildBannerNotBuilt: {
        ...bottomBuildBanner,
        background: NOT_BUILT_NODE_BANNER_COLOR,
    },

    margin: (theme) => ({
        marginLeft: theme.spacing(1.25),
    }),
    tooltip: {
        maxWidth: '720px',
    },
};

const NetworkModificationNode = (props) => {
    const currentNode = useSelector((state) => state.currentTreeNode);
    const selectionForCopy = useSelector((state) => state.selectionForCopy);

    const isSelectedNode = () => {
        // TODO This is a hack, when ReactFlow v10 is available, we should remove this.
        return props.id === currentNode?.id;
    };

    const isSelectedForCut = () => {
        return (
            (props.id === selectionForCopy?.nodeId &&
                selectionForCopy?.copyType === CopyType.NODE_CUT) ||
            ((props.id === selectionForCopy?.nodeId ||
                selectionForCopy.allChildrenIds?.includes(props.id)) &&
                selectionForCopy?.copyType === CopyType.SUBTREE_CUT)
        );
    };

    const getNodeOpacity = () => {
        return isSelectedForCut()
            ? getLocalStorageTheme() === LIGHT_THEME
                ? 0.3
                : 0.6
            : 'unset';
    };

    function getStyleForBanner(buildStatus) {
        switch (buildStatus) {
            case BUILD_STATUS.BUILT:
                return styles.buildBannerOK;
            case BUILD_STATUS.BUILT_WITH_ERROR:
                return styles.buildBannerError;
            case BUILD_STATUS.BUILT_WITH_WARNING:
                return styles.buildBannerWarning;
            default:
                return styles.buildBannerNotBuilt;
        }
    }

    function getStyleForBottomBanner(buildStatus) {
        switch (buildStatus) {
            case BUILD_STATUS.BUILT:
                return styles.bottomBuildBannerOK;
            case BUILD_STATUS.BUILT_WITH_ERROR:
                return styles.bottomBuildBannerError;
            case BUILD_STATUS.BUILT_WITH_WARNING:
                return styles.bottomBuildBannerWarning;
            default:
                return styles.bottomBuildBannerNotBuilt;
        }
    }

    return (
        <>
            <Handle
                type="source"
                position="bottom"
                style={{ background: '#555' }}
                isConnectable={false}
            />
            <Handle
                type="target"
                position="top"
                style={{ background: '#555' }}
                isConnectable={false}
            />
            <Button
                style={{
                    opacity: getNodeOpacity(),
                }}
                sx={
                    isSelectedNode()
                        ? styles.networkModificationSelected
                        : styles.networkModification
                }
            >
                <Box sx={getStyleForBanner(props.data.localBuildStatus)}>
                    {props.data.localBuildStatus === 'BUILDING' && (
                        <CircularProgress
                            size={20}
                            color="primary"
                            style={{ margin: 'auto' }}
                        />
                    )}
                </Box>
                <Box
                    sx={getStyleForBottomBanner(props.data.globalBuildStatus)}
                ></Box>

                <Box sx={styles.labelWrapper}>
                    <span
                        style={{
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: '3',
                            //Usage of a deprecated property because there's no satisfying alternative yet : replace with line-clamp in the future
                            WebkitBoxOrient: 'vertical',
                        }}
                    >
                        <OverflowableText
                            text={props.data.label}
                            sx={{ width: '100%' }}
                            tooltipSx={styles.tooltip}
                        />
                    </span>
                </Box>
            </Button>

            <Box sx={styles.outOfBoundIcons}>
                {props.data.readOnly && <LockIcon />}
            </Box>
        </>
    );
};

export default NetworkModificationNode;
