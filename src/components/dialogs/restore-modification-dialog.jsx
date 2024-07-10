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
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import {
    deleteModifications,
    restoreModifications,
} from 'services/study/network-modifications';
import { CancelButton, OverflowableText } from '@gridsuite/commons-ui';
import { CustomDialog } from 'components/utils/custom-dialog';
import { isPartial } from 'components/graph/menus/network-modification-node-editor';
import { areUuidsEqual } from 'components/utils/utils';
import { useModificationLabelComputer } from '../graph/util/use-modification-label-computer.jsx';
import CheckboxList from '../utils/CheckBoxList/check-box-list';

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
        paddingBottom: theme.spacing(1),
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

    const [stashedModifications, setStashedModifications] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [openDeleteConfirmationPopup, setOpenDeleteConfirmationPopup] =
        useState(false);

    const { computeLabel } = useModificationLabelComputer();

    const handleClose = () => {
        setSelectedItems([]);
        onClose();
    };

    const handleDelete = () => {
        const selectedModificationsUuidsToDelete = selectedItems.map(
            (item) => item.uuid
        );
        setOpenDeleteConfirmationPopup(false);
        deleteModifications(
            studyUuid,
            currentNode.id,
            selectedModificationsUuidsToDelete
        );
        handleClose();
    };

    const handleRestore = () => {
        const selectedModificationsUuidToRestore = selectedItems.map(
            (item) => item.uuid
        );

        restoreModifications(
            studyUuid,
            currentNode.id,
            selectedModificationsUuidToRestore
        );
        handleClose();
    };

    const handleSelectAll = useCallback(() => {
        setSelectedItems((oldValues) =>
            oldValues.length === 0 ? stashedModifications : []
        );
    }, [stashedModifications]);

    useEffect(() => {
        setStashedModifications(modifToRestore);
    }, [modifToRestore]);

    const [isAllSelected, setIsAllSelected] = useState(false);
    const [isAnySelected, setIsAnySelected] = useState(false);
    const getLabel = (modif) => {
        if (!modif) {
            return null;
        }
        return intl.formatMessage(
            { id: 'network_modifications.' + modif.messageType },
            {
                ...modif,
                ...computeLabel(modif),
            }
        );
    };
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
                <Box sx={styles.text}>
                    <DialogContentText>
                        {intl.formatMessage({
                            id: 'RestoreModificationText',
                        })}
                    </DialogContentText>
                </Box>
                <DragDropContext>
                    <Droppable
                        droppableId="restore-modification-list"
                        isDropDisabled={true}
                    >
                        {(provided) => (
                            <Box
                                sx={styles.listContainer}
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                <Box sx={styles.selectAll}>
                                    <Checkbox
                                        color={'primary'}
                                        edge="start"
                                        checked={isAllSelected}
                                        indeterminate={isPartial(isAnySelected)}
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
                                    values={stashedModifications}
                                    itemComparator={areUuidsEqual}
                                    isAllSelected={isAllSelected}
                                    setIsAllSelected={setIsAllSelected}
                                    setIsPartiallySelected={setIsAnySelected}
                                    getValueId={(v) => v.uuid}
                                    getValueLabel={getLabel}
                                    labelSx={{ flexGrow: '1' }}
                                />
                                {provided.placeholder}
                            </Box>
                        )}
                    </Droppable>
                </DragDropContext>
            </DialogContent>
            <DialogActions>
                <CancelButton onClick={handleClose} />
                <Button
                    onClick={() => setOpenDeleteConfirmationPopup(true)}
                    disabled={!selectedItems.length}
                >
                    <FormattedMessage id="DeleteRows" />
                </Button>
                <Button
                    variant="outlined"
                    onClick={handleRestore}
                    disabled={!selectedItems.length}
                >
                    <FormattedMessage id="button.restore" />
                </Button>
            </DialogActions>
            {openDeleteConfirmationPopup && (
                <CustomDialog
                    content={
                        <FormattedMessage
                            id="DeleteModificationText"
                            values={{
                                numberToDelete: selectedItems.length,
                            }}
                        />
                    }
                    onValidate={handleDelete}
                    validateButtonLabel="button.delete"
                    onClose={() => setOpenDeleteConfirmationPopup(false)}
                />
            )}
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
