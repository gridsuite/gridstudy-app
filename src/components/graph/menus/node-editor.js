/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { Paper } from '@material-ui/core';
import PropTypes from 'prop-types';
import makeStyles from '@material-ui/core/styles/makeStyles';
import NetworkModificationNodeEditor from './network-modification-node-editor';
import ModelNodeEditor from './model-node-editor';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        height: '100%',
        padding: theme.spacing(2),
        elevation: 3,
    },
}));

const NodeEditor = ({ selectedNode, handleNodeModified }) => {
    const classes = useStyles();

    return (
        <Paper className={classes.paper}>
            {selectedNode.type === 'NETWORK_MODIFICATION' && (
                <NetworkModificationNodeEditor selectedNode={selectedNode} />
            )}
            {selectedNode.type === 'MODEL' && (
                <ModelNodeEditor selectedNode={selectedNode} />
            )}
        </Paper>
    );
};

NodeEditor.propTypes = {
    selectedNode: PropTypes.object.isRequired,
};

export default NodeEditor;
