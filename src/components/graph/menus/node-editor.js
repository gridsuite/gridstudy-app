/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';
import { lighten, darken } from '@mui/material/styles';
import NetworkModificationNodeEditor from './network-modification-node-editor';
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
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
    currentNode,
    setModificationsDrawerOpen,
} from '../../../redux/actions';

const useStyles = makeStyles((theme) => ({
    paper: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        elevation: 3,
        background:
            theme.palette.mode === 'light'
                ? darken(theme.palette.background.paper, 0.1)
                : lighten(theme.palette.background.paper, 0.2),
    },
}));

const NodeEditor = () => {
    const classes = useStyles();
    const intlRef = useIntlRef();
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();
    const [selectedNode, setSelectedNode] = useState();

    const studyUpdatedForce = useSelector((state) => state.studyUpdated);
    const selectedNodeUuid = useSelector((state) => state.selectedTreeNode)?.id;

    const selectedNodeUuidRef = useRef();

    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const closeModificationsDrawer = () => {
        dispatch(setModificationsDrawerOpen(false));
    };

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
                    if (selectedNodeUuid === selectedNodeUuidRef.current) {
                        setSelectedNode(res);
                        //  update current node global object
                        dispatch(currentNode(res));
                    }
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
        dispatch,
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
        <>
            {selectedNode !== undefined && (
                <div className={classes.paper}>
                    <EditableTitle
                        name={selectedNode.name}
                        onClose={closeModificationsDrawer}
                        onChange={changeNodeName}
                    />
                    <>
                        {selectedNode && (
                            <NetworkModificationNodeEditor
                                selectedNode={selectedNode}
                            />
                        )}
                    </>
                </div>
            )}
        </>
    );
};

NodeEditor.propTypes = {
    className: PropTypes.string,
};

export default NodeEditor;
