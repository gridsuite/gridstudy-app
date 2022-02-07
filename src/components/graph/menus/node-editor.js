/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useRef, useState } from 'react';
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
import { useParams } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
    paper: {
        height: 'max-content',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        elevation: 3,
    },
}));

const NodeEditor = ({ onClose, className }) => {
    const classes = useStyles();
    const intlRef = useIntlRef();
    const { enqueueSnackbar } = useSnackbar();
    const [selectedNode, setSelectedNode] = useState();

    const studyUpdatedForce = useSelector((state) => state.studyUpdated);
    const selectedNodeUuid = useSelector((state) => state.selectedTreeNode);
    const selectedNodeUuidRef = useRef();

    const studyUuid = decodeURIComponent(useParams().studyUuid);

    useEffect(() => {
        if (!selectedNodeUuid) return;
        const headers = studyUpdatedForce?.eventData?.headers;
        const updateType = headers?.updateType;
        if (
            selectedNodeUuidRef.current !== selectedNodeUuid ||
            (updateType === 'nodeUpdated' &&
                headers.nodes.indexOf(selectedNodeUuid) !== -1) ||
            (updateType === 'study' && headers.node === selectedNodeUuid)
        ) {
            selectedNodeUuidRef.current = selectedNodeUuid;
            fetchNetworkModificationTreeNode(studyUuid, selectedNodeUuid)
                .then((res) => {
                    if (selectedNodeUuid === selectedNodeUuidRef.current)
                        setSelectedNode(res);
                })
                .catch((err) =>
                    displayErrorMessageWithSnackbar({
                        errorMessage: err.message,
                        enqueueSnackbar,
                    })
                );
        }
    }, [
        setSelectedNode,
        enqueueSnackbar,
        selectedNodeUuid,
        selectedNodeUuidRef,
        studyUpdatedForce,
        studyUuid,
    ]);

    const changeNodeName = (newName) => {
        if (!selectedNode) return;
        updateTreeNode(studyUuid, {
            id: selectedNode.id,
            type: selectedNode.type,
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
        <div className={className}>
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
    className: PropTypes.string,
};

export default NodeEditor;
