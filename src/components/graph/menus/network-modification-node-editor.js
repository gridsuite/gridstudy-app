/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import { fetchNetworkModifications } from '../../../utils/rest-api';
import { displayErrorMessageWithSnackbar } from '../../../utils/messages';
import { useSelector } from 'react-redux';
import NetworkModificationDialog from '../../dialogs/network-modifications-dialog';
import List from '@material-ui/core/List';
import { makeStyles } from '@material-ui/core/styles';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { useSnackbar } from 'notistack';
import { ModificationListItem } from './modification-list-item';
import { ListItem } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import Divider from '@material-ui/core/Divider';

const useStyles = makeStyles((theme) => ({
    list: {
        flexGrow: '1',
    },
    addButton: {
        position: 'absolute',
        bottom: 20,
        right: 0,
        marginLeft: 8,
        marginRight: 8,
        marginTop: 8,
    },
}));

const NetworkModificationNodeEditor = ({ selectedNode }) => {
    const network = useSelector((state) => state.network);
    const [modifications, setModifications] = useState(undefined);
    const { enqueueSnackbar } = useSnackbar();
    const selectedNodeRef = useRef(); // initial empty to get first update

    useEffect(() => {
        if (selectedNode.current !== selectedNodeRef) {
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

    return (
        <>
            <List className={classes.list}>
                <ListItem key={'NodeEditorModificationsCount'}>
                    <FormattedMessage
                        id={'network_modification/modificationsCount'}
                        values={{ count: modifications?.length }}
                    />
                </ListItem>
                <Divider />
                {modifications?.map((item) => (
                    <ModificationListItem key={item.uuid} modification={item} />
                ))}
            </List>

            <Button
                className={classes.addButton}
                onClick={openNetworkModificationConfiguration}
            >
                <AddCircleOutlineIcon fontSize={'large'} />
            </Button>

            <NetworkModificationDialog
                open={openNetworkModificationsDialog}
                onClose={closeNetworkModificationConfiguration}
                network={network}
                selectedNodeUuid={selectedNode.id}
            />
        </>
    );
};

NetworkModificationNodeEditor.propTypes = {
    selectedNode: PropTypes.object.isRequired,
};

export default NetworkModificationNodeEditor;
