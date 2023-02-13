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
import PropTypes from 'prop-types';

function AddRowsDialog({ open, handleAddRowsButton, onClose }) {
    const [rowNumber, setRowNumber] = useState(1);

    function handleOnClose() {
        setRowNumber(1);
        onClose();
    }

    return (
        <Dialog open={open} onClose={handleOnClose}>
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
                <Button onClick={handleOnClose}>
                    <FormattedMessage id="cancel" />
                </Button>
                <Button
                    onClick={() => {
                        handleAddRowsButton(rowNumber);
                        handleOnClose();
                    }}
                >
                    <FormattedMessage id="AddTapRowsButton" />
                </Button>
            </DialogActions>
        </Dialog>
    );
}

AddRowsDialog.prototype = {
    open: PropTypes.bool,
    handleAddRowsButton: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default AddRowsDialog;
