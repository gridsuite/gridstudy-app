import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { DialogContentText } from '@mui/material';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { FormattedMessage } from 'react-intl';
import React from 'react';

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
