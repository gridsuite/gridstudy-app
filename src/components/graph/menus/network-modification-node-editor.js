/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
    fetchNetworkModifications,
    deleteModification,
} from '../../../utils/rest-api';
import { displayErrorMessageWithSnackbar } from '../../../utils/messages';
import { useSelector } from 'react-redux';
import NetworkModificationDialog from '../../dialogs/network-modifications-dialog';
import { makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import { ModificationListItem } from './modification-list-item';
import { Checkbox, Fab, Paper, Toolbar, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import CheckboxList from '../../util/checkbox-list';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

const useStyles = makeStyles((theme) => ({
    list: {
        paddingTop: 0,
        overflowY: 'auto',
    },
    addButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        margin: theme.spacing(3),
    },
    modificationCount: {
        margin: 0,
        padding: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
        color: 'white',
    },
    toolbar: {
        padding: theme.spacing(0),
        paddingLeft: theme.spacing(1),
        border: theme.spacing(1),
        minHeight: 0,
        margin: 0,
    },

    toolbarCheck: {
        padding: theme.spacing(1),
        minWidth: 0,
        flexGrow: 1,
        justifyContent: 'flex-start',
    },
    toolbarIcon: {
        padding: theme.spacing(1),
        margin: 0,
        border: 0,
    },
    dividerTool: {
        background: theme.palette.primary.main,
    },
}));

function isChecked(s1, s2) {
    return s1 !== 0;
}

function isPartial(s1, s2) {
    if (s1 === 0) return false;
    return s1 !== s2;
}

const NetworkModificationNodeEditor = ({ selectedNode }) => {
    const network = useSelector((state) => state.network);
    const workingNode = useSelector((state) => state.workingTreeNode);
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const [modifications, setModifications] = useState(undefined);
    const { enqueueSnackbar } = useSnackbar();
    const selectedNodeRef = useRef(); // initial empty to get first update

    const [selectedItems, setSelectedItems] = useState(new Set());
    const [toggleSelectAll, setToggleSelectAll] = useState();

    useEffect(() => {
        if (selectedNode !== selectedNodeRef.current) {
            selectedNodeRef.current = selectedNode;
            if (!selectedNode.networkModification) setModifications([]);
            else {
                fetchNetworkModifications(selectedNode.networkModification)
                    .then((res) => {
                        if (selectedNodeRef.current === selectedNode)
                            setModifications(res.status ? [] : res);
                    })
                    .catch((err) =>
                        displayErrorMessageWithSnackbar({
                            errorMessage: err.message,
                            enqueueSnackbar,
                        })
                    );
            }
        }
    }, [selectedNode, setModifications, enqueueSnackbar, selectedNodeRef]);

    const [openNetworkModificationsDialog, setOpenNetworkModificationsDialog] =
        useState(false);

    const classes = useStyles();

    const openNetworkModificationConfiguration = () => {
        setOpenNetworkModificationsDialog(true);
    };

    const closeNetworkModificationConfiguration = () => {
        setOpenNetworkModificationsDialog(false);
    };

    const doDeleteModification = () => {
        deleteModification(
            studyUuid,
            selectedNode,
            [...selectedItems.values()].map((item) => item.uuid)
        );
    };

    return (
        <>
            <Typography className={classes.modificationCount}>
                <FormattedMessage
                    id={'network_modification/modificationsCount'}
                    values={{ count: modifications?.length }}
                />
            </Typography>
            <Toolbar className={classes.toolbar}>
                <Checkbox
                    className={classes.toolbarCheck}
                    color={'primary'}
                    edge="start"
                    checked={isChecked(
                        selectedItems.size,
                        modifications?.length
                    )}
                    indeterminate={isPartial(
                        selectedItems.size,
                        modifications?.length
                    )}
                    disableRipple
                    onClick={() => setToggleSelectAll((oldVal) => !oldVal)}
                />
                <IconButton
                    onClick={doDeleteModification}
                    size={'small'}
                    className={classes.toolbarIcon}
                    disabled={selectedItems?.size < 1}
                >
                    <DeleteIcon />
                </IconButton>
            </Toolbar>
            <Divider className={classes.dividerTool} />
            <CheckboxList
                onChecked={setSelectedItems}
                className={classes.list}
                values={modifications}
                setChecked={setSelectedItems}
                itemRenderer={(props) => <ModificationListItem {...props} />}
                toggleSelectAll={toggleSelectAll}
            />

            <Fab
                className={classes.addButton}
                color="primary"
                onClick={openNetworkModificationConfiguration}
            >
                <AddIcon />
            </Fab>

            <NetworkModificationDialog
                open={openNetworkModificationsDialog}
                onClose={closeNetworkModificationConfiguration}
                network={network}
                selectedNodeUuid={selectedNode.id}
                workingNodeUuid={workingNode?.id}
            />
        </>
    );
};

NetworkModificationNodeEditor.propTypes = {
    selectedNode: PropTypes.object.isRequired,
};

export default NetworkModificationNodeEditor;
