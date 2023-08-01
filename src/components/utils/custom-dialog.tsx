import React, { FunctionComponent } from 'react';
import { useIntl } from 'react-intl';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import Button from '@mui/material/Button';

interface CustomDialogProps {
    show: boolean;
    title?: string;
    content: React.ReactNode;
    onValidate: () => void;
    onClose: () => void;
}
export const CustomDialog: FunctionComponent<CustomDialogProps> = ({
    show,
    title,
    content,
    onValidate,
    onClose,
}) => {
    const intl = useIntl();

    const handleClose = (): void => {
        onClose();
    };

    const handleValidate = (): void => {
        onValidate();
        onClose();
    };

    return (
        <Dialog open={show} onClose={onClose} maxWidth={'xs'} fullWidth={true}>
            <DialogTitle id={'modal-title'}>{title}</DialogTitle>
            <DialogContent>{content}</DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>
                    {intl.formatMessage({ id: 'cancel' })}
                </Button>
                <Button variant={'outlined'} onClick={handleValidate}>
                    {intl.formatMessage({ id: 'validate' })}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
