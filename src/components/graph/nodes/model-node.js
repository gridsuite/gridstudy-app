/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import CircularProgress from '@material-ui/core/CircularProgress';
import VisibilityIcon from '@material-ui/icons/Visibility';
import React from 'react';
import BuildIcon from '@material-ui/icons/Build';
import { Handle } from 'react-flow-renderer';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';

const useStyles = makeStyles((theme) => ({
    modelSelected: {
        background: 'lightseagreen',
    },
    model: {
        background: 'darkseagreen',
    },
    buildStatusOk: {
        color: 'green',
    },
    buildStatusInvalid: {
        color: 'indianred',
    },
}));

const ModelNode = (props) => {
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
            <IconButton
                variant="outlined"
                className={
                    props.selected ? classes.modelSelected : classes.model
                }
            >
                {props.data.buildStatus === 'BUILDING' ? (
                    <CircularProgress size={24} />
                ) : props.id === workingNodeUuid ? (
                    <VisibilityIcon />
                ) : (
                    props.data.buildStatus !== 'NOT_BUILT' && (
                        <BuildIcon
                            className={
                                props.data.buildStatus === 'BUILT'
                                    ? classes.buildStatusOk
                                    : classes.buildStatusInvalid
                            }
                        />
                    )
                )}
            </IconButton>
        </>
    );
};

export default ModelNode;
