/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { FormattedMessage, useIntl } from 'react-intl';
import { DialogContentText } from '@mui/material';
import CheckboxList from 'components/utils/checkbox-list';
import { ModificationListItem } from 'components/graph/menus/modification-list-item';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { restoreModifications } from 'services/study/network-modifications';

const useStyles = makeStyles((theme) => ({
    text: {
        padding: theme.spacing(1),
    },
    listContainer: {
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        paddingBottom: theme.spacing(8),
    },
    list: {
        paddingTop: theme.spacing(0),
        flexGrow: 1,
    },
    modificationsTitle: {
        display: 'flex',
        alignItems: 'center',
        margin: theme.spacing(0),
        padding: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        overflow: 'hidden',
    },
    toolbar: {
        padding: theme.spacing(0),
        border: theme.spacing(1),
        minHeight: 0,
        margin: 0,
        flexShrink: 0,
    },

    toolbarIcon: {
        marginRight: theme.spacing(1),
    },
    toolbarCheckbox: {
        marginLeft: theme.spacing(1.5),
    },
    filler: {
        flexGrow: 1,
    },
    dividerTool: {
        background: theme.palette.primary.main,
    },
    circularProgress: {
        marginRight: theme.spacing(2),
        color: theme.palette.primary.contrastText,
    },
    formattedMessageProgress: {
        marginTop: theme.spacing(2),
    },
    notification: {
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing(4),
        textAlign: 'center',
        color: theme.palette.primary.main,
    },
    icon: {
        width: theme.spacing(3),
    },
}));

/**
 * Dialog to select network modification to create
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param onOpenDialog handle the opening of dialogs
 * @param dialogs the list of dialog
 */ const RestoreModificationDialog = ({
    open,
    onClose,
    modifToRestore,
    currentNode,
    studyUuid,
}) => {
    const intl = useIntl();

    useEffect(() => {
        setModificationsToRestore(modifToRestore);
        console.log(modificationsToRestore,"=============")
    }, [modifToRestore]);

    const handleClose = () => {
        onClose();
    };

    const { snackInfo, snackError } = useSnackMessage();
    const [modificationsToRestore, setModificationsToRestore] = useState([]);

    const handleRestore = () => {
        const selectedModificationsUuidToRestore = [
            ...selectedItems.values(),
        ].map((item) => item.uuid);
        restoreModifications(
            studyUuid,
            currentNode.id,
            selectedModificationsUuidToRestore
        );
        // setModificationsToRestore(modificationsToRestore.map(m->m.))
        console.log(selectedModificationsUuidToRestore);
    };
    const classes = useStyles();

    const [selectedItems, setSelectedItems] = useState(new Set());

    return (
        <Dialog
            fullWidth
            maxWidth="xs"
            open={open}
            onClose={handleClose}
            aria-labelledby="dialog-restore-modifications"
        >
            <DialogTitle>
                {intl.formatMessage({ id: 'RestoreModifications' })}
            </DialogTitle>
            <DialogContent>
                <div className={classes.text}>
                    <DialogContentText>
                        {intl.formatMessage({ id: 'RestoreModificationText' })}
                    </DialogContentText>
                </div>
                <DragDropContext>
                    <Droppable
                        droppableId="restore-modification-list"
                        isDropDisabled={true}
                    >
                        {(provided) => (
                            <div
                                className={classes.listContainer}
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                <CheckboxList
                                    className={classes.list}
                                    onChecked={setSelectedItems}
                                    values={modificationsToRestore}
                                    itemComparator={(a, b) => a.uuid === b.uuid}
                                    itemRenderer={(props) => (
                                        <ModificationListItem
                                            key={props.item.uuid}
                                            isrestoredDialog
                                            isDragging={false}
                                            isOneNodeBuilding={false}
                                            disabled={false}
                                            {...props}
                                        />
                                    )}
                                />
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>
                    <FormattedMessage id="close" />
                </Button>
                <Button onClick={handleRestore}>
                    <FormattedMessage id="restore" />
                </Button>
            </DialogActions>
        </Dialog>
    );
};

RestoreModificationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    modifications: PropTypes.array,
    currentNode: PropTypes.any,
    studyUuid: PropTypes.any,
};

export default RestoreModificationDialog;
