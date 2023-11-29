/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { FormattedMessage, useIntl } from 'react-intl';
import { Box, Checkbox, DialogContentText } from '@mui/material';
import CheckboxList from 'components/utils/checkbox-list';
import { ModificationListItem } from 'components/graph/menus/modification-list-item';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import {
    deleteModifications,
    restoreModifications,
} from 'services/study/network-modifications';
import { OverflowableText } from '@gridsuite/commons-ui';

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
    selectAll: (theme) => ({
        display: 'flex',
        alignItems: 'center',
        paddingLeft: theme.spacing(3),
    }),
    list: (theme) => ({
        paddingTop: theme.spacing(0),
        flexGrow: 1,
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
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [toggleSelectAll, setToggleSelectAll] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);

    const handleClose = () => {
        onClose();
    };

    const handleDelete = () => {
        setOpenAlert(false);
        deleteModifications(
            studyUuid,
            currentNode.id,
            [...selectedItems].map((item) => item.uuid)
        );
        handleClose();
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

    const handleSelectAll = useCallback(() => {
        setToggleSelectAll((prev) => !prev);
    }, []);

    useEffect(() => {
        setModificationsToRestore(modifToRestore);
    }, [modifToRestore]);

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
                                <Box sx={styles.selectAll}>
                                    <Checkbox
                                        color={'primary'}
                                        edge="start"
                                        checked={
                                            selectedItems.size ===
                                            modificationsToRestore.length
                                        }
                                        onClick={handleSelectAll}
                                        disableRipple
                                    />
                                    <OverflowableText
                                        text={intl.formatMessage({
                                            id: 'SelectAll',
                                        })}
                                    />
                                </Box>
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
                                    toggleSelectAll={toggleSelectAll}
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
                    onClick={() => setOpenAlert(true)}
                    disabled={!selectedItems.size}
                >
                    <FormattedMessage id="DeleteRows" />
                </Button>
                <Button onClick={handleRestore} disabled={!selectedItems.size}>
                    <FormattedMessage id="restore" />
                </Button>
            </DialogActions>
            <Dialog
                fullWidth
                maxWidth="xs"
                open={openAlert}
                onClose={handleClose}
                aria-labelledby="dialog-confirm-delete-modifications"
            >
                <DialogTitle>
                    <FormattedMessage
                        id="DeleteModificationText"
                        values={{
                            numberToDelete: selectedItems.size,
                        }}
                    />
                </DialogTitle>
                <DialogActions>
                    <Button onClick={() => setOpenAlert(false)}>
                        <FormattedMessage id="close" />
                    </Button>
                    <Button
                        onClick={handleDelete}
                        disabled={!selectedItems.size}
                    >
                        <FormattedMessage id="DeleteRows" />
                    </Button>
                </DialogActions>
            </Dialog>
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
