/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { CancelButton, ValidateButton, type SxStyle } from '@gridsuite/commons-ui';
import { ReactElement, useCallback } from 'react';

interface SelectOptionsDialogProps {
    open: boolean;
    onClose: () => void;
    onClick: () => void;
    title: string;
    child: ReactElement;
    style?: SxStyle;
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

    const handleDialogClose = useCallback(
        (event_: React.MouseEvent, reason: string) => {
            // don't close the dialog for outside click
            if (reason !== 'backdropClick') {
                onClose();
            }
        },
        [onClose]
    );

    return (
        <Dialog open={open} onClose={handleDialogClose} sx={style}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent style={{ padding: '8px 32px 8px 15px' }}>{child}</DialogContent>
            <DialogActions>
                <CancelButton onClick={handleClose} />
                <ValidateButton label={validateKey} onClick={onClick} disabled={disabled} />
            </DialogActions>
        </Dialog>
    );
};

export { SelectOptionsDialog };
