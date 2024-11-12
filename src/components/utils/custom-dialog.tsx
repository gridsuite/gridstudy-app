/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent } from 'react';
import { useIntl } from 'react-intl';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import Button from '@mui/material/Button';
import { CancelButton } from '@gridsuite/commons-ui';

interface CustomDialogProps {
    title?: string;
    content: React.ReactNode;
    onValidate: () => void;
    validateButtonLabel?: string;
    onClose: () => void;
}
export const CustomDialog: FunctionComponent<CustomDialogProps> = ({
    title,
    content,
    onValidate,
    validateButtonLabel,
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
        <Dialog open={true} onClose={onClose} maxWidth={'xs'} fullWidth={true}>
            {title && <DialogTitle id={'modal-title'}>{title}</DialogTitle>}
            <DialogContent>{content}</DialogContent>
            <DialogActions>
                <CancelButton onClick={handleClose} />
                <Button variant={'outlined'} onClick={handleValidate}>
                    {intl.formatMessage({
                        id: validateButtonLabel ?? 'validate',
                    })}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
