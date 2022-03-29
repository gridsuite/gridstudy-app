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
    fetchNetworkModification,
} from '../../../utils/rest-api';
import { displayErrorMessageWithSnackbar } from '../../../utils/messages';
import { useSelector } from 'react-redux';
import NetworkModificationDialog from '../../dialogs/network-modifications-dialog';
import List from '@material-ui/core/List';
import { makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import { ModificationListItem } from './modification-list-item';
import { Fab, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';

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
}));

const NetworkModificationNodeEditor = ({ selectedNode }) => {
    const network = useSelector((state) => state.network);
    const workingNode = useSelector((state) => state.workingTreeNode);
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const [modifications, setModifications] = useState(undefined);
    const { enqueueSnackbar } = useSnackbar();
    const selectedNodeRef = useRef(); // initial empty to get first update

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
        setEditData(undefined);
    };

    const doDeleteModification = (uuid) => {
        deleteModification(studyUuid, selectedNode, uuid);
    };

    const [editData, setEditData] = useState(undefined);

    const doEditModification = (modificationUuid) => {
        const modification = fetchNetworkModification(modificationUuid);
        modification.then((res) => {
            res.json().then((data) => {
                setEditData(data[0]);
            });
        });
    };

    return (
        <>
            <Typography className={classes.modificationCount}>
                <FormattedMessage
                    id={'network_modification/modificationsCount'}
                    values={{ count: modifications?.length }}
                />
            </Typography>
            <List className={classes.list}>
                {modifications?.map((item) => (
                    <ModificationListItem
                        key={item.uuid}
                        modification={item}
                        onDelete={doDeleteModification}
                        onEdit={doEditModification}
                    />
                ))}
            </List>

            <Fab
                className={classes.addButton}
                color="primary"
                onClick={openNetworkModificationConfiguration}
            >
                <AddIcon />
            </Fab>

            <NetworkModificationDialog
                open={openNetworkModificationsDialog}
                editData={editData}
                setEditData={setEditData}
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
