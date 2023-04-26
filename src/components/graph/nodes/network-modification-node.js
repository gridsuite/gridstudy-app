/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React from 'react';
import Button from '@mui/material/Button';
import { Handle } from 'react-flow-renderer';
import makeStyles from '@mui/styles/makeStyles';
import { useSelector } from 'react-redux';
import CircularProgress from '@mui/material/CircularProgress';
import LockIcon from '@mui/icons-material/Lock';
import { OverflowableText } from '@gridsuite/commons-ui';
import { CopyType } from '../../network-modification-tree-pane';
import { getLocalStorageTheme } from '../../../redux/local-storage';
import { LIGHT_THEME } from '@gridsuite/commons-ui';
import { BUILD_STATUS } from '../../network/constants';

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

const useStyles = makeStyles((theme) => ({
    networkModificationSelected: {
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
    },
    networkModification: {
        background: theme.palette.text.secondary,
        textTransform: 'none',
        color: theme.palette.primary.contrastText,
        '&:hover': {
            background: theme.node.hover,
        },
        overflow: 'hidden',
    },
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
    margin: {
        marginLeft: theme.spacing(1.25),
    },
    tooltip: {
        maxWidth: '720px',
    },
}));

const NetworkModificationNode = (props) => {
    const classes = useStyles();

    const currentNode = useSelector((state) => state.currentTreeNode);
    const selectedNodeForCopy = useSelector(
        (state) => state.selectedNodeForCopy
    );
    const selectedNodeForSubtreeCopy = useSelector(
        (state) => state.selectedNodeForSubtreeCopy
    );

    const isSelectedNode = () => {
        // TODO This is a hack, when ReactFlow v10 is available, we should remove this.
        return props.id === currentNode?.id;
    };

    const isSelectedForCut = () => {
        return (
            (props.id === selectedNodeForCopy?.nodeId &&
                selectedNodeForCopy?.copyType === CopyType.CUT) ||
            ((props.id === selectedNodeForSubtreeCopy?.nodeId ||
                selectedNodeForSubtreeCopy.allChildrenIds?.includes(
                    props.id
                )) &&
                selectedNodeForSubtreeCopy?.copyType === CopyType.CUT)
        );
    };

    const getNodeOpacity = () => {
        return isSelectedForCut()
            ? getLocalStorageTheme() === LIGHT_THEME
                ? 0.3
                : 0.6
            : 'unset';
    };

    function getClassForBanner(buildStatus) {
        switch (buildStatus) {
            case BUILD_STATUS.BUILT:
                return classes.buildBannerOK;
            case BUILD_STATUS.BUILT_WITH_ERROR:
                return classes.buildBannerError;
            case BUILD_STATUS.BUILT_WITH_WARNING:
                return classes.buildBannerWarning;
            default:
                return classes.buildBannerNotBuilt;
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
                className={
                    isSelectedNode()
                        ? classes.networkModificationSelected
                        : classes.networkModification
                }
            >
                <div className={getClassForBanner(props.data.buildStatus)}>
                    {props.data.buildStatus === 'BUILDING' && (
                        <CircularProgress
                            size={20}
                            color="primary"
                            style={{ margin: 'auto' }}
                        />
                    )}
                </div>

                <div className={classes.labelWrapper}>
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
                            style={{ width: '100%' }}
                            tooltipStyle={classes.tooltip}
                        />
                    </span>
                </div>
            </Button>

            <div className={classes.outOfBoundIcons}>
                {props.data.readOnly && <LockIcon />}
            </div>
        </>
    );
};

export default NetworkModificationNode;
