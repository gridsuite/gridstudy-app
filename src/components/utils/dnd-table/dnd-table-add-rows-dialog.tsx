/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useState } from 'react';
import { CancelButton } from '@gridsuite/commons-ui';

interface DndTableAddRowsDialogProps {
    open: boolean;
    handleAddButton: (rowNumber: number) => void;
    onClose: () => void;
}

function DndTableAddRowsDialog({ open, handleAddButton, onClose }: DndTableAddRowsDialogProps) {
    const [rowNumber, setRowNumber] = useState(1);

    function handleOnClose() {
        setRowNumber(1);
        onClose();
    }

    return (
        <Dialog open={open} onClose={handleOnClose}>
            <DialogTitle>
                <FormattedMessage id="AddRowsDialogTitle" />
            </DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    type="Number"
                    value={rowNumber}
                    onChange={(event) => {
                        setRowNumber(!event.target.value ? 0 : parseInt(event.target.value));
                    }}
                />
            </DialogContent>
            <DialogActions>
                <CancelButton onClick={handleOnClose} />
                <Button
                    onClick={() => {
                        handleAddButton(rowNumber);
                        handleOnClose();
                    }}
                    variant="outlined"
                    disabled={rowNumber <= 0}
                >
                    <FormattedMessage id="AddRowsButton" />
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default DndTableAddRowsDialog;
