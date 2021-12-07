/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React from 'react';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import { Handle } from 'react-flow-renderer';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    modelSelected: {
        background: 'lightseagreen',
    },
    model: {
        background: 'darkseagreen',
    },
}));

const ModelNode = (props) => {
    const classes = useStyles();

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
                <PlayArrowIcon />
            </IconButton>
        </>
    );
};

export default ModelNode;
