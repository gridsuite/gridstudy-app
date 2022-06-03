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
<<<<<<< Updated upstream
import clsx from 'clsx';
=======
import Tooltip from '@mui/material/Tooltip';
>>>>>>> Stashed changes

const useStyles = makeStyles((theme) => ({
    networkModificationVisualized: {
        position: 'relative',
        variant: 'contained',
        background: theme.palette.primary.main,
        textTransform: 'none',
        color: theme.palette.primary.contrastText,
        '&:hover': {
            background: theme.palette.primary.main,
        },
        overflow: 'hidden',
    },
    networkModificationSelected: {
        position: 'relative',
        variant: 'contained',
        background: '#fff',
        textTransform: 'none',
        color: theme.palette.primary.contrastText,
        '&:hover': {
            background: theme.palette.primary.main,
        },
        overflow: 'hidden',
    },
    networkModification: {
        background: '#c5c8d1',
        textTransform: 'none',
        color: theme.palette.primary.contrastText,
        '&:hover': {
            background: theme.palette.primary.main,
        },
        overflow: 'hidden',
    },
    outOfBoundIcons: {
        color: '#fff',
        position: 'absolute',
        right: '-30px',
        top: '18px',
    },
    buildStatusOk: {
        color: 'green',
    },
    buildStatusInvalid: {
        color: 'indianred',
    },
<<<<<<< Updated upstream
    margin: {
        marginLeft: '10px',
=======
    buildBannerOK: {
        display: 'flex',
        height: '100%',
        width: '15%',
        position: 'absolute',
        top: '0px',
        left: '0px',
        background: '#74a358',
    },
    buildBannerInvalid: {
        display: 'flex',
        height: '100%',
        width: '15%',
        position: 'absolute',
        top: '0px',
        left: '0px',
        background: '#9196a1',
    },
    labelWrapper: {
        display: 'flex',
        width: '85%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        lineHeight: 'normal',
        marginLeft: 'auto',
>>>>>>> Stashed changes
    },
}));

const NetworkModificationNode = (props) => {
    const classes = useStyles();

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
<<<<<<< Updated upstream
            <Button
                variant="outlined"
                className={
                    props.selected
                        ? classes.networkModificationSelected
                        : classes.networkModification
                }
                disableElevation
            >
                {props.data.label}
                {props.data.buildStatus === 'BUILDING' ? (
                    <CircularProgress
                        size={24}
                        color="secondary"
                        className={classes.margin}
                    />
                ) : props.id === workingNode?.id ? (
                    <VisibilityIcon className={classes.margin} />
                ) : (
                    props.data.buildStatus !== 'NOT_BUILT' && (
                        <BuildIcon
                            className={clsx(
                                props.data.buildStatus === 'BUILT'
                                    ? classes.buildStatusOk
                                    : classes.buildStatusInvalid,
                                classes.margin
                            )}
                        />
                    )
                )}
                {props.data.readOnly && <LockIcon className={classes.margin} />}
            </Button>
=======
            <Tooltip title={props.data.label} placement="top">
                <Button
                    className={
                        props.id === workingNode?.id
                            ? classes.networkModificationVisualized
                            : props.selected
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
                {(props.data.readOnly && <LockIcon />) ||
                    (props.id === workingNode?.id && <VisibilityIcon />)}
            </div>
>>>>>>> Stashed changes
        </>
    );
};

export default NetworkModificationNode;
