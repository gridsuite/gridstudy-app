/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import {
    CancelButton,
    CheckBoxList,
    NetworkModificationMetadata,
    snackWithFallback,
    useModificationLabelComputer,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { deleteModifications, restoreModifications } from 'services/study/network-modifications';
import { CustomDialog } from 'components/utils/custom-dialog';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer.type';
import { toggleElementFromList } from 'components/utils/utils';

interface RestoreModificationDialogProps {
    open: boolean;
    onClose: () => void;
    modifToRestore: NetworkModificationMetadata[];
}

/**
 * Dialog to select network modification to restore
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param modifToRestore List of network modifications to restore
 * @param currentNode the current node
 */

const RestoreModificationDialog = ({ open, onClose, modifToRestore }: RestoreModificationDialogProps) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();

    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const [stashedModifications, setStashedModifications] = useState<NetworkModificationMetadata[]>([]);
    const [selectedItems, setSelectedItems] = useState<NetworkModificationMetadata[]>([]);
    const [openDeleteConfirmationPopup, setOpenDeleteConfirmationPopup] = useState(false);

    const { computeLabel } = useModificationLabelComputer();

    const handleClose = () => {
        setSelectedItems([]);
        onClose();
    };

    const handleDelete = () => {
        const selectedModificationsUuidsToDelete = selectedItems.map((item) => item.uuid);
        setOpenDeleteConfirmationPopup(false);
        deleteModifications(studyUuid, currentNode?.id, selectedModificationsUuidsToDelete).catch((error) => {
            snackWithFallback(snackError, error, { headerId: 'errDeleteModificationMsg' });
        });
        handleClose();
    };

    const handleRestore = () => {
        const selectedModificationsUuidToRestore = selectedItems.map((item) => item.uuid);

        restoreModifications(studyUuid, currentNode?.id, selectedModificationsUuidToRestore);
        handleClose();
    };

    useEffect(() => {
        setStashedModifications(modifToRestore);
    }, [modifToRestore]);

    const getLabel = (modif: NetworkModificationMetadata) => {
        if (!modif) {
            return '';
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
                <FormattedMessage id="RestoreModifications" />
            </DialogTitle>
            <DialogContent>
                <CheckBoxList
                    items={stashedModifications}
                    selectedItems={selectedItems}
                    onSelectionChange={setSelectedItems}
                    getItemId={(v) => v.uuid}
                    getItemLabel={getLabel}
                    onItemClick={(stashedModification) =>
                        setSelectedItems((oldCheckedElements) =>
                            toggleElementFromList(stashedModification, oldCheckedElements, (v) => v.uuid)
                        )
                    }
                    addSelectAllCheckbox
                    selectAllCheckBoxLabel={'SelectAll'}
                    divider
                />
            </DialogContent>
            <DialogActions>
                <CancelButton onClick={handleClose} />
                <Button onClick={() => setOpenDeleteConfirmationPopup(true)} disabled={!selectedItems.length}>
                    <FormattedMessage id="DeleteRows" />
                </Button>
                <Button variant="outlined" onClick={handleRestore} disabled={!selectedItems.length}>
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

export default RestoreModificationDialog;
