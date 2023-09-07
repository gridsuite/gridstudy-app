/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
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
import { restoreModifications } from 'services/study/network-modifications';

const styles = {
    text: (theme) => ({
        padding: theme.spacing(1),
    }),
    listContainer: (theme) => ({
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        paddingBottom: theme.spacing(8),
    }),
    list: (theme) => ({
        paddingTop: theme.spacing(0),
        flexGrow: 1,
    }),
    modificationsTitle: (theme) => ({
        display: 'flex',
        alignItems: 'center',
        margin: theme.spacing(0),
        padding: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        overflow: 'hidden',
    }),
    toolbar: (theme) => ({
        padding: theme.spacing(0),
        border: theme.spacing(1),
        minHeight: 0,
        margin: 0,
        flexShrink: 0,
    }),
    toolbarIcon: (theme) => ({
        marginRight: theme.spacing(1),
    }),
    toolbarCheckbox: (theme) => ({
        marginLeft: theme.spacing(1.5),
    }),
    filler: (theme) => ({
        flexGrow: 1,
    }),
    dividerTool: (theme) => ({
        background: theme.palette.primary.main,
    }),
    circularProgress: (theme) => ({
        marginRight: theme.spacing(2),
        color: theme.palette.primary.contrastText,
    }),
    formattedMessageProgress: (theme) => ({
        marginTop: theme.spacing(2),
    }),
    notification: (theme) => ({
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing(4),
        textAlign: 'center',
        color: theme.palette.primary.main,
    }),
    icon: (theme) => ({
        width: theme.spacing(3),
    }),
};

/**
 * Dialog to select network modification to restore
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param modifToRestore List of network modifications to restore
 * @param currentNode the current node
 * @param studyUuid Id of the current study
 */

const RestoreModificationDialog = ({
    open,
    onClose,
    modifToRestore,
    currentNode,
    studyUuid,
}) => {
    const intl = useIntl();
    const [modificationsToRestore, setModificationsToRestore] = useState([]);

    useEffect(() => {
        setModificationsToRestore(modifToRestore);
    }, [modifToRestore]);

    const handleClose = () => {
        onClose();
    };

    const handleRestore = () => {
        const selectedModificationsUuidToRestore = [
            ...selectedItems.values(),
        ].map((item) => item.uuid);
        restoreModifications(
            studyUuid,
            currentNode.id,
            selectedModificationsUuidToRestore
        );
        handleClose();
    };

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
                <div sx={styles.text}>
                    <DialogContentText>
                        {intl.formatMessage({
                            id: 'RestoreModificationText',
                        })}
                    </DialogContentText>
                </div>
                <DragDropContext>
                    <Droppable
                        droppableId="restore-modification-list"
                        isDropDisabled={true}
                    >
                        {(provided) => (
                            <div
                                sx={styles.listContainer}
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                <CheckboxList
                                    sx={styles.list}
                                    onChecked={setSelectedItems}
                                    values={modificationsToRestore}
                                    itemComparator={(a, b) => a.uuid === b.uuid}
                                    itemRenderer={(props) => (
                                        <>
                                            <ModificationListItem
                                                key={props.item.uuid}
                                                isRestorationDialog
                                                isDragging={false}
                                                isOneNodeBuilding={false}
                                                disabled={false}
                                                listSize={
                                                    modificationsToRestore.length
                                                }
                                                {...props}
                                            />
                                        </>
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
                <Button
                    onClick={handleRestore}
                    disabled={modificationsToRestore.length === 0}
                >
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
