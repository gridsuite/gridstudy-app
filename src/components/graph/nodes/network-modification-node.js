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
import BuildIcon from '@mui/icons-material/Build';
import LockIcon from '@mui/icons-material/Lock';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    networkModificationSelected: {
        variant: 'contained',
        background: theme.palette.primary.main,
        textTransform: 'none',
        color: theme.palette.primary.contrastText,
        '&:hover': {
            background: theme.palette.primary.main,
        },
    },
    networkModification: {
        variant: 'outlined',
        background: theme.palette.primary.light,
        textTransform: 'none',
        color: theme.palette.primary.contrastText,
        '&:hover': {
            background: theme.palette.primary.main,
        },
    },
    buildStatusOk: {
        color: 'green',
    },
    buildStatusInvalid: {
        color: 'indianred',
    },
    margin: {
        marginLeft: '10px',
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
        </>
    );
};

export default NetworkModificationNode;
