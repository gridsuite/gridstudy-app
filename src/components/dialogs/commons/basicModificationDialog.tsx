/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage } from 'react-intl';
import { Button } from '@mui/material';
import { ModificationDialogContent, ModificationDialogContentProps } from './modification-dialog-content';

export type BasicModificationDialogProps = Omit<ModificationDialogContentProps, 'closeAndClear' | 'submitButton'> & {
    disabledSave?: boolean;
    onClear: () => void;
    onClose: () => void;
    onSave?: () => void;
};

export function BasicModificationDialog({
    disabledSave = false,
    onClear,
    onClose,
    onSave,
    ...dialogProps
}: Readonly<BasicModificationDialogProps>) {
    const closeAndClear = () => {
        onClear();
        onClose();
    };

    const handleSubmit = () => {
        onSave?.();
        // do not wait fetch response and close dialog, errors will be shown in snackbar.
        closeAndClear();
    };

    const submitButton = (
        <Button onClick={handleSubmit} variant="outlined" disabled={disabledSave} data-testid="ValidateButton">
            <FormattedMessage id="validate" />
        </Button>
    );

    return <ModificationDialogContent submitButton={submitButton} closeAndClear={closeAndClear} {...dialogProps} />;
}
