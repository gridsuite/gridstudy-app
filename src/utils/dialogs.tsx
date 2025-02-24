/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import { FormattedMessage } from 'react-intl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { CancelButton } from '@gridsuite/commons-ui';
import { ReactElement } from 'react';
import { SxProps, Theme } from '@mui/material';

interface SelectOptionsDialogProps {
    open: boolean;
    onClose: () => void;
    onClick: () => void;
    title: string;
    child: ReactElement;
    style?: SxProps<Theme>;
    validateKey?: string;
    disabled?: boolean;
}

const SelectOptionsDialog = ({
    open,
    onClose,
    onClick,
    title,
    child,
    style,
    validateKey,
    disabled = false,
}: SelectOptionsDialogProps) => {
    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} sx={style}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent style={{ padding: '8px 32px 8px 15px' }}>{child}</DialogContent>
            <DialogActions>
                <CancelButton onClick={handleClose} />
                <Button onClick={onClick} variant="outlined" disabled={disabled}>
                    <FormattedMessage id={validateKey ?? 'validate'} />
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export { SelectOptionsDialog };
