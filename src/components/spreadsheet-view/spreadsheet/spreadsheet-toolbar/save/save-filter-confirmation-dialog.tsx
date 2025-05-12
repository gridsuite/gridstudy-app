/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { FormattedMessage } from 'react-intl';

export interface SaveFilterConfirmationDialogProps {
    open: boolean;
    onConfirm: (includeFilters: boolean) => void;
}

export function SaveFilterConfirmationDialog({ open, onConfirm }: Readonly<SaveFilterConfirmationDialogProps>) {
    return (
        <Dialog open={open}>
            <DialogTitle id="filter-confirmation-dialog-title">
                <FormattedMessage id="spreadsheet/save/include_filters_title" />
            </DialogTitle>
            <DialogContent>
                <FormattedMessage id="spreadsheet/save/include_filters_message" />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onConfirm(false)}>
                    <FormattedMessage id="spreadsheet/save/include_filters_no" />
                </Button>
                <Button onClick={() => onConfirm(true)}>
                    <FormattedMessage id="spreadsheet/save/include_filters_yes" />
                </Button>
            </DialogActions>
        </Dialog>
    );
}
