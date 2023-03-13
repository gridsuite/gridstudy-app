/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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

function DndTableAddRowsDialog({ open, handleAddButton, onClose }) {
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
                        handleAddButton(rowNumber);
                        handleOnClose();
                    }}
                >
                    <FormattedMessage id="AddRowsButton" />
                </Button>
            </DialogActions>
        </Dialog>
    );
}

DndTableAddRowsDialog.prototype = {
    open: PropTypes.bool.isRequired,
    handleAddRowsButton: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default DndTableAddRowsDialog;
