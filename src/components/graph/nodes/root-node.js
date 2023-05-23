/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import PhotoIcon from '@mui/icons-material/Photo';
import React from 'react';
import { Handle } from 'react-flow-renderer';
import makeStyles from '@mui/styles/makeStyles';
import { useSelector } from 'react-redux';
import Tooltip from '@mui/material/Tooltip';

const useStyles = makeStyles((theme) => ({
    rootSelected: {
        background: theme.node.background,
        borderRadius: '30%',
        boxShadow:
            theme.node.border +
            ' 0px 0px 3px 3px,' +
            theme.node.border +
            ' 0px 0px 25px,' +
            theme.node.border +
            ' 0px 0px 5px',
        '&:hover': {
            background: theme.node.background,
        },
    },
    root: {
        background: 'darkseagreen',
        borderRadius: '30%',
        '&:hover': {
            background: theme.node.hover,
        },
    },
}));

const RootNode = (props) => {
    const classes = useStyles();

    const currentNode = useSelector((state) => state.currentTreeNode);
    const isSelectedNode = () => {
        return props.id === currentNode?.id;
    };
    return (
        <>
            <Handle
                type="source"
                position="bottom"
                style={{
                    background: '#555',
                    zIndex: '1',
                }}
                isConnectable={false}
            />
            <Tooltip
                title={props.data.caseName}
                placement="top"
                disableHoverListener={!props.data.caseName}
            >
                <IconButton
                    variant="outlined"
                    className={
                        isSelectedNode() ? classes.rootSelected : classes.root
                    }
                >
                    {(props.data.buildStatusGlobal === 'BUILDING' && (
                        <CircularProgress size={24} />
                    )) || <PhotoIcon />}
                </IconButton>
            </Tooltip>
        </>
    );
};

export default RootNode;
