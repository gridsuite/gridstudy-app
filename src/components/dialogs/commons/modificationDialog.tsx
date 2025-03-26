/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { FieldErrors, useFormContext } from 'react-hook-form';
import { SubmitButton } from '@gridsuite/commons-ui';
import { ModificationDialogContent, ModificationDialogContentProps } from './modification-dialog-content';

/**
 * Generic Modification Dialog which manage basic common behaviors with react
 * hook form validation.
 * @param {CallbackEvent} onClear callback when the dialog needs to be cleared
 * @param {CallbackEvent} onSave callback when saving the modification
 * @param {Boolean} disabledSave to control disabled prop of the validate button
 * @param {CallbackEvent} onValidated callback when validation is successful
 * @param {CallbackEvent} onValidationError callback when validation failed
 * @param {Array} dialogProps props that are forwarded to the MUI Dialog component
 */

export type ModificationDialogProps = Omit<ModificationDialogContentProps, 'closeAndClear' | 'submitButton'> & {
    disabledSave?: boolean;
    onClear: () => void;
    onDialogClose?: () => void;
    onSave: (modificationData: any) => void;
    onValidated?: () => void;
    onValidationError?: (errors: FieldErrors) => void;
};

export function ModificationDialog({
    disabledSave = false,
    onClear,
    onDialogClose,
    onSave,
    onValidated,
    onValidationError,
    ...dialogProps
}: Readonly<ModificationDialogProps>) {
    const { handleSubmit } = useFormContext();

    const closeAndClear = (event: React.MouseEvent, reason: string) => {
        onClear();
        if (onDialogClose) {
            onDialogClose();
        }
    };

    const handleValidate = (data: any) => {
        onValidated && onValidated();
        onSave(data);
        // do not wait fetch response and close dialog, errors will be shown in snackbar.
        closeAndClear(data, 'validateButtonClick');
    };

    const handleScrollWhenError = useCallback(() => {
        // When scrolling to the field with focus, you can end up with the label not completely displayed
        // We ensure that field with focus is displayed in the middle of the dialog
        // Delay focusing to ensure it happens after the validation. without timout, document.activeElement will return the validation button.
        const timeoutId = setTimeout(() => {
            const focusedElement = document.activeElement;

            if (focusedElement instanceof HTMLElement) {
                focusedElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }
        }, 0); // Delay of 0 milliseconds, effectively running at the next opportunity

        return () => clearTimeout(timeoutId);
    }, []);

    const handleValidationError = (errors: FieldErrors) => {
        onValidationError && onValidationError(errors);
        handleScrollWhenError();
    };

    const submitButton = (
        <SubmitButton
            onClick={handleSubmit(handleValidate, handleValidationError)}
            variant="outlined"
            disabled={disabledSave}
        />
    );

    return <ModificationDialogContent closeAndClear={closeAndClear} submitButton={submitButton} {...dialogProps} />;
}
