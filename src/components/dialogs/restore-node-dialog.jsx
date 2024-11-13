/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { Button, Box, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText } from '@mui/material';
import { deleteStashedNodes, fetchStashedNodes, restoreStashedNodes } from '../../services/study/tree-subtree';
import LoaderWithOverlay from '../utils/loader-with-overlay';
import { CancelButton, CheckBoxList } from '@gridsuite/commons-ui';
import { CustomDialog } from 'components/utils/custom-dialog';
import { toggleElementFromList } from 'components/utils/utils';

/**
 * Dialog to select network modification to create
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param anchorNodeId the anchor node id relative to which the restore will take place
 * @param studyUuid the study id
 */
const RestoreNodesDialog = ({ open, onClose, anchorNodeId, studyUuid }) => {
    const intl = useIntl();

    const [nodes, setNodes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedNodes, setSelectedNodes] = useState([]);
    const [openDeleteConfirmationPopup, setOpenDeleteConfirmationPopup] = useState(false);

    const handleClose = () => {
        onClose();
        setSelectedNodes([]);
        setIsLoading(false);
        setNodes([]);
    };

    const handleDelete = () => {
        const nodeIds = [...selectedNodes].map((node) => node.first.id);
        deleteStashedNodes(studyUuid, nodeIds);
        handleClose();
    };

    const handleRestore = () => {
        const nodeIds = [...selectedNodes].map((node) => node.first.id);
        restoreStashedNodes(studyUuid, nodeIds, anchorNodeId);
        handleClose();
    };

    useEffect(() => {
        if (open) {
            setIsLoading(true);
            fetchStashedNodes(studyUuid).then((res) => {
                setNodes(res);
                setIsLoading(false);
            });
        } else {
            setNodes([]);
            setIsLoading(false);
        }
    }, [studyUuid, open]);

    return (
        <Dialog fullWidth maxWidth="xs" open={open} onClose={handleClose} aria-labelledby="dialog-restore-nodes">
            <DialogTitle>
                {intl.formatMessage({
                    id: 'restoreNodes',
                })}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ padding: 1 }}>
                    <DialogContentText>
                        {intl.formatMessage({
                            id: 'restoreNodesText',
                        })}
                    </DialogContentText>
                </Box>
                {isLoading && (
                    <LoaderWithOverlay
                        color="inherit"
                        loaderSize={70}
                        isFixed={false}
                        loadingMessageText={'LoadingRemoteData'}
                    />
                )}
                {!isLoading && nodes && (
                    <CheckBoxList
                        items={nodes}
                        addSelectAllCheckbox
                        selectAllCheckBoxLabel={'SelectAll'}
                        selectedItems={selectedNodes}
                        onSelectionChange={setSelectedNodes}
                        getItemId={(v) => v.first.id}
                        getItemLabel={(v) => v.first.name + (v.second !== 0 ? ' ( + ' + v.second + ' )' : '')}
                        onItemClick={(node) =>
                            setSelectedNodes((oldCheckedElements) =>
                                toggleElementFromList(node, oldCheckedElements, (v) => v.first.id)
                            )
                        }
                        divider
                    />
                )}
            </DialogContent>
            <DialogActions>
                <CancelButton onClick={handleClose} />
                <Button
                    onClick={() => setOpenDeleteConfirmationPopup(true)}
                    disabled={!selectedNodes.length || nodes.length === 0}
                >
                    <FormattedMessage id="DeleteRows" />
                </Button>
                <Button
                    onClick={handleRestore}
                    disabled={!selectedNodes.length || nodes.length === 0}
                    variant="outlined"
                >
                    <FormattedMessage id="button.restore" />
                </Button>
            </DialogActions>
            {openDeleteConfirmationPopup && (
                <CustomDialog
                    content={
                        <FormattedMessage
                            id="deleteNodesText"
                            values={{
                                numberToDelete: selectedNodes.length,
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

RestoreNodesDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    anchorNodeId: PropTypes.any,
    studyUuid: PropTypes.any,
};

export default RestoreNodesDialog;
