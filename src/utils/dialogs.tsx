/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { CancelButton, type SxStyle } from '@gridsuite/commons-ui';
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
                <Button onClick={onClick} variant="outlined" disabled={disabled}>
                    <FormattedMessage id={validateKey ?? 'validate'} />
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export { SelectOptionsDialog };
