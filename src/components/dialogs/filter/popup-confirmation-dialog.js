/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { DialogContentText } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { FormattedMessage } from 'react-intl';

const PopupConfirmationDialog = ({
    openConfirmationPopup,
    setOpenConfirmationPopup,
    handlePopupConfirmation,
}) => {
    return (
        <Dialog
            open={openConfirmationPopup}
            aria-labelledby="dialog-title-change-equipment-type"
        >
            <DialogTitle id={'dialog-title-change-equipment-type'}>
                {'Confirmation'}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <FormattedMessage id={'changeTypeMessage'} />
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenConfirmationPopup(false)}>
                    <FormattedMessage id="cancel" />
                </Button>
                <Button onClick={handlePopupConfirmation} variant="outlined">
                    <FormattedMessage id="validate" />
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PopupConfirmationDialog;
