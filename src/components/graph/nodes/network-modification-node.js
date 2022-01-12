/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import VisibilityIcon from '@material-ui/icons/Visibility';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';
import Button from '@material-ui/core/Button';
import { Handle } from 'react-flow-renderer';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';

const useStyles = makeStyles((theme) => ({
    networkModificationSelected: {
        variant: 'contained',
        background: 'steelblue',
        textTransform: 'none',
    },
    networkModification: {
        variant: 'outlined',
        background: 'lightsteelblue',
        textTransform: 'none',
    },
    buildStatusOk: {
        color: 'green',
    },
    buildStatusInvalid: {
        color: 'red',
    },
}));

const NetworkModificationNode = (props) => {
    const classes = useStyles();

    const workingNodeUuid = useSelector((state) => state.workingTreeNode);

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
                startIcon={
                    props.data.buildStatus === 'BUILDING' ? (
                        <CircularProgress size={14} />
                    ) : (
                        props.data.buildStatus !== 'NOT_BUILT' && (
                            <CheckCircleIcon
                                className={
                                    props.data.buildStatus === 'BUILT'
                                        ? classes.buildStatusOk
                                        : classes.buildStatusInvalid
                                }
                            />
                        )
                    )
                }
                endIcon={props.id === workingNodeUuid && <VisibilityIcon />}
                disableElevation
            >
                {props.data.label}
            </Button>
        </>
    );
};

export default NetworkModificationNode;
