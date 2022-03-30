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
}));

const NetworkModificationNode = (props) => {
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
            </Button>
        </>
    );
};

export default NetworkModificationNode;
