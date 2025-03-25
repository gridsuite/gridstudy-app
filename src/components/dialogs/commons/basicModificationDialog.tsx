/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage } from 'react-intl';
import { Button } from '@mui/material';
import { ModificationDialogContent } from './modification-dialog-content';
import React, { ReactNode } from 'react';

interface BasicModificationDialogProps {
    children?: ReactNode;
    disabledSave?: boolean;
    onClear: () => void;
    onDialogClose?: () => void;
    onSave: () => void;
    open: boolean;
    titleId: string;
}

export function BasicModificationDialog({
    children,
    disabledSave = false,
    onClear,
    onDialogClose,
    onSave,
    open,
    titleId,
    ...dialogProps
}: Readonly<BasicModificationDialogProps>) {
    const closeAndClear = (event: React.MouseEvent, reason: string) => {
        onClear();
        if (onDialogClose) {
            onDialogClose();
        }
    };

    const handleSubmit = (event: React.MouseEvent) => {
        onSave();
        // do not wait fetch response and close dialog, errors will be shown in snackbar.
        closeAndClear(event, 'validateButtonClick');
    };

    const submitButton = (
        <Button onClick={handleSubmit} variant="outlined" disabled={disabledSave}>
            <FormattedMessage id="validate" />
        </Button>
    );

    return (
        <ModificationDialogContent
            children={children}
            submitButton={submitButton}
            closeAndClear={closeAndClear}
            open={open}
            titleId={titleId}
            {...dialogProps}
        />
    );
}
