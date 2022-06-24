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
import VisibilityIcon from '@mui/icons-material/Visibility';
import LockIcon from '@mui/icons-material/Lock';
import Tooltip from '@mui/material/Tooltip';

const VALID_NODE_BANNER_COLOR = '#74a358';
const INVALID_NODE_BANNER_COLOR = '#9196a1';

const useStyles = makeStyles((theme) => ({
    networkModificationSelected: {
        position: 'relative',
        variant: 'contained',
        //background: theme.palette.primary.main,
        background: theme.node.networkModification.background,
        textTransform: 'none',
        color: theme.palette.primary.contrastText,
        '&:hover': {
            background: theme.node.networkModification.background,
        },
        overflow: 'hidden',
        border: '2px outset',
        borderColor: theme.node.networkModification.border,
        boxShadow:
            theme.node.networkModification.border +
            ' 0px 0px 25px,' +
            theme.node.networkModification.border +
            ' 0px 0px 5px 1px',
    },
    networkModification: {
        background: theme.palette.text.secondary,
        textTransform: 'none',
        color: theme.palette.primary.contrastText,
        '&:hover': {
            background: theme.node.networkModification.hover,
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
        display: 'flex',
        height: '100%',
        width: '15%',
        position: 'absolute',
        top: '0px',
        left: '0px',
        background: VALID_NODE_BANNER_COLOR,
        backgroundSize: 'contain',
    },
    buildBannerInvalid: {
        display: 'flex',
        height: '100%',
        width: '15%',
        position: 'absolute',
        top: '0px',
        left: '0px',
        background: INVALID_NODE_BANNER_COLOR,
        backgroundSize: 'contain',
    },
    margin: {
        marginLeft: theme.spacing(1.25),
    },
}));

const NetworkModificationNode = (props) => {
    const classes = useStyles();

    const selectedNode = useSelector((state) => state.selectedTreeNode);
    const workingNode = useSelector((state) => state.workingTreeNode);

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
            <Tooltip title={props.data.label} placement="top">
                <Button
                    className={
                        props.id === selectedNode.id
                            ? classes.networkModificationSelected
                            : classes.networkModification
                    }
                >
                    <div
                        className={
                            props.data.buildStatus === 'BUILT'
                                ? classes.buildBannerOK
                                : classes.buildBannerInvalid
                        }
                    >
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
                            {props.data.label}
                        </span>
                    </div>
                </Button>
            </Tooltip>

            <div className={classes.outOfBoundIcons}>
                {props.data.readOnly && <LockIcon />}
                {props.id === workingNode?.id && <VisibilityIcon />}
            </div>
        </>
    );
};

export default NetworkModificationNode;
