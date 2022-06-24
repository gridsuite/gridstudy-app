/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PhotoIcon from '@mui/icons-material/Photo';
import React from 'react';
import { Handle } from 'react-flow-renderer';
import makeStyles from '@mui/styles/makeStyles';
import { useSelector } from 'react-redux';
import Tooltip from '@mui/material/Tooltip';

const useStyles = makeStyles((theme) => ({
    rootSelected: {
        background: 'lightseagreen',
        borderRadius: '30%',
    },
    root: {
        background: 'darkseagreen',
        borderRadius: '30%',
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
                    {props.data.buildStatus === 'BUILDING' ? (
                        <CircularProgress size={24} />
                    ) : isSelectedNode() ? (
                        <VisibilityIcon />
                    ) : (
                        props.data.readOnly && <PhotoIcon />
                    )}
                </IconButton>
            </Tooltip>
        </>
    );
};

export default RootNode;
