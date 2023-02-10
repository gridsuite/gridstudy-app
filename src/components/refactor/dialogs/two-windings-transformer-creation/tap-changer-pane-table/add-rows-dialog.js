import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from '@mui/material';
import { FormattedMessage } from 'react-intl';
import React, { useState } from 'react';

function AddRowsDialog({ open, handleAddRowsButton, onClose }) {
    const [rowNumber, setRowNumber] = useState(1);

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                <FormattedMessage id="AddTapRowsDialogTitle" />
            </DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    type="Number"
                    value={rowNumber}
                    onChange={(event) => {
                        setRowNumber(parseInt(event.target.value));
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => {
                        handleAddRowsButton(rowNumber);
                        onClose();
                    }}
                >
                    <FormattedMessage id="AddTapRowsButton" />
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default AddRowsDialog;
