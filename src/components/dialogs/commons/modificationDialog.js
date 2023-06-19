/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useFormContext } from 'react-hook-form';
import SubmitButton from './submitButton';
import ModificationDialogContent from './modification-dialog-content';

/**
 * Generic Modification Dialog which manage basic common behaviors with react
 * hook form validation.
 * @param {EventListener} onClose Event to close the dialog
 * @param {CallbackEvent} onClear callback when the dialog needs to be cleared
 * @param {CallbackEvent} onSave callback when saving the modification
 * @param {Boolean} disabledSave to control disabled prop of the validate button
 * @param {CallbackEvent} onValidated callback when validation is successful
 * @param {CallbackEvent} onValidationError callback when validation failed
 * @param {Array} props props that are forwarded to the MUI Dialog component
 */
const ModificationDialog = ({
    onClose,
    onClear,
    onSave,
    disabledSave = false,
    onValidated,
    onValidationError,
    ...props
}) => {
    const { handleSubmit } = useFormContext();

    const closeAndClear = (event, reason) => {
        onClear();
        onClose(event, reason);
    };

    const handleValidate = (data) => {
        onValidated && onValidated();
        onSave(data);
        // do not wait fetch response and close dialog, errors will be shown in snackbar.
        closeAndClear(data, 'validateButtonClick');
    };

    const handleValidationError = (errors) =>
        onValidationError && onValidationError(errors);

    const submitButton = (
        <SubmitButton
            onClick={handleSubmit(handleValidate, handleValidationError)}
            disabled={disabledSave}
        />
    );

    return (
        <ModificationDialogContent
            submitButton={submitButton}
            closeAndClear={closeAndClear}
            onValidated={onValidated}
            onValidationError={onValidationError}
            {...props}
        />
    );
};

ModificationDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    disabledSave: PropTypes.bool,
    onValidated: PropTypes.func,
    onValidationError: PropTypes.func,
};

export default ModificationDialog;
