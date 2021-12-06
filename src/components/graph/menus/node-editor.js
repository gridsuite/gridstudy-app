/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';
import { Paper } from '@material-ui/core';
import PropTypes from 'prop-types';
import makeStyles from '@material-ui/core/styles/makeStyles';
import NetworkModificationNodeEditor from './network-modification-node-editor';
import ModelNodeEditor from './model-node-editor';
import {
    fetchNetworkModificationTreeNode,
    updateTreeNode,
} from '../../../utils/rest-api';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../../utils/messages';
import { EditableTitle } from './editable-title';
import { useSnackbar } from 'notistack';
import { useSelector } from 'react-redux';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        height: 'max-content',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        elevation: 3,
    },
}));

const NodeEditor = ({ onClose, ...props }) => {
    const classes = useStyles();
    const intlRef = useIntlRef();
    const { enqueueSnackbar } = useSnackbar();
    const [selectedNode, setSelectedNode] = useState();

    const selectedNodeUuid = useSelector((state) => state.selectedTreeNode);

    useEffect(() => {
        if (!selectedNodeUuid) return;
        fetchNetworkModificationTreeNode(selectedNodeUuid)
            .then((res) => setSelectedNode(res))
            .catch((err) =>
                displayErrorMessageWithSnackbar({
                    errorMessage: err.message,
                    enqueueSnackbar,
                })
            );
    }, [setSelectedNode, enqueueSnackbar, selectedNodeUuid]);

    const changeNodeName = (newName) => {
        updateTreeNode({
            id: selectedNode?.id,
            type: selectedNode?.type,
            name: newName,
        }).catch((errorMessage) => {
            displayErrorMessageWithSnackbar({
                errorMessage: errorMessage,
                enqueueSnackbar: enqueueSnackbar,
                headerMessage: {
                    headerMessageId: 'NodeUpdateError',
                    intlRef: intlRef,
                },
            });
        });
    };

    return (
        <div {...props}>
            {selectedNode !== undefined && (
                <>
                    <EditableTitle
                        name={selectedNode.name}
                        onClose={onClose}
                        onChange={changeNodeName}
                    />
                    <Paper className={classes.paper}>
                        {selectedNode && selectedNode.type !== 'MODEL' && (
                            <NetworkModificationNodeEditor
                                selectedNode={selectedNode}
                            />
                        )}
                        {selectedNode && selectedNode.type === 'MODEL' && (
                            <ModelNodeEditor selectedNode={selectedNode} />
                        )}
                    </Paper>
                </>
            )}
        </div>
    );
};

NodeEditor.propTypes = {
    onClose: PropTypes.func,
};

export default NodeEditor;
