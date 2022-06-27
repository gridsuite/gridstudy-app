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
import { setModificationsDrawerOpen } from '../../../redux/actions';

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
    const [currentNode, setCurrentNode] = useState();

    const studyUpdatedForce = useSelector((state) => state.studyUpdated);
    const currentNodeUuid = useSelector((state) => state.currentTreeNode)?.id;

    const currentNodeUuidRef = useRef();

    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const closeModificationsDrawer = () => {
        dispatch(setModificationsDrawerOpen(false));
    };

    useEffect(() => {
        if (!currentNodeUuid) return;
        const headers = studyUpdatedForce?.eventData?.headers;
        const updateType = headers?.updateType;
        if (
            currentNodeUuidRef.current !== currentNodeUuid ||
            (updateType === 'nodeUpdated' &&
                headers.nodes.indexOf(currentNodeUuid) !== -1) ||
            (updateType === 'study' && headers.node === currentNodeUuid)
        ) {
            currentNodeUuidRef.current = currentNodeUuid;
            fetchNetworkModificationTreeNode(studyUuid, currentNodeUuid)
                .then((res) => {
                    if (currentNodeUuid === currentNodeUuidRef.current)
                        setCurrentNode(res);
                })
                .catch((err) =>
                    displayErrorMessageWithSnackbar({
                        errorMessage: err.message,
                        enqueueSnackbar,
                    })
                );
        }
    }, [
        setCurrentNode,
        enqueueSnackbar,
        currentNodeUuid,
        currentNodeUuidRef,
        studyUpdatedForce,
        studyUuid,
    ]);

    const changeNodeName = (newName) => {
        if (!currentNode) return;
        updateTreeNode(studyUuid, {
            id: currentNode.id,
            type: currentNode.type,
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
            {currentNode !== undefined && (
                <div className={classes.paper}>
                    <EditableTitle
                        name={currentNode.name}
                        onClose={closeModificationsDrawer}
                        onChange={changeNodeName}
                    />
                    <>
                        {currentNode && (
                            <NetworkModificationNodeEditor
                                currentTreeNode={currentNode}
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
