/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';
import { lighten, darken } from '@mui/material/styles';
import NetworkModificationNodeEditor from './network-modification-node-editor';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { EditableTitle } from './editable-title';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { setModificationsDrawerOpen } from '../../../redux/actions';
import { updateTreeNode } from '../../../services/study/tree';

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
    const dispatch = useDispatch();
    const { snackError } = useSnackMessage();
    const currentTreeNode = useSelector((state) => state.currentTreeNode);
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const closeModificationsDrawer = () => {
        dispatch(setModificationsDrawerOpen(false));
    };

    const changeNodeName = (newName) => {
        updateTreeNode(studyUuid, {
            id: currentTreeNode?.id,
            type: currentTreeNode?.type,
            name: newName,
        }).catch((error) => {
            snackError({
                messageTxt: error.message,
                headerId: 'NodeUpdateError',
            });
        });
    };

    return (
        <div className={classes.paper}>
            <EditableTitle
                name={currentTreeNode?.data?.label}
                onClose={closeModificationsDrawer}
                onChange={changeNodeName}
            />
            <NetworkModificationNodeEditor />
        </div>
    );
};

NodeEditor.propTypes = {
    className: PropTypes.string,
};

export default NodeEditor;
