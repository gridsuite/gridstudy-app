/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { FormattedMessage } from 'react-intl';
import {
    Button,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useButtonWithTooltip } from '../../../dialogs/inputs/input-hooks';
import { useFormContext } from 'react-hook-form';
import SubmitButton from './submitButton';

/**
 * Generic Modification Dialog which manage basic common behaviors
 * @param {String} titleId id for title translation
 * @param {EventListener} onClose Event to close the dialog
 * @param {CallbackEvent} onClear callback when the dialog needs to be cleared
 * @param {CallbackEvent} onSave callback when saving the modification
 * @param {Boolean} disabledSave to control disabled prop of the validate button
 * @param {Object} searchCopy Object managing search equipments for copy
 * @param {ReactElement} subtitle subtitle component to put inside DialogTitle
 * @param {Array} dialogProps props that are forwarded to the MUI Dialog component
 */
const ModificationDialog = ({
    titleId,
    onClose,
    onClear,
    onSave,
    onValidationError,
    disabledSave = false,
    searchCopy,
    subtitle,
    onValidated,
    children,
    ...dialogProps
}) => {
    const { handleSubmit } = useFormContext();

    const copyEquipmentButton = useButtonWithTooltip({
        label: 'CopyFromExisting',
        handleClick: searchCopy?.handleOpenSearchDialog,
    });

    const closeAndClear = (event, reason) => {
        onClear();
        onClose(event, reason);
    };

    // For the global Parent Component, disable close with backdropClick
    // Then close the dialog for other reasons
    const handleClose = (event, reason) => {
        if (reason !== 'backdropClick') {
            closeAndClear(event, reason);
        }
    };

    const handleCancel = (event) => {
        closeAndClear(event, 'cancelButtonClick');
    };

    const handleValidate = (data) => {
        onValidated && onValidated();
        onSave(data);
        // do not wait fetch response and close dialog, errors will be shown in snackbar.
        closeAndClear(data, 'validateButtonClick');
    };

    const handleValidationError = (errors) =>
        onValidationError && onValidationError(errors);

    return (
        <Dialog
            onClose={handleClose}
            aria-labelledby={titleId}
            {...dialogProps}
        >
            <DialogTitle>
                <Grid container justifyContent={'space-between'}>
                    <Grid item xs={11}>
                        <FormattedMessage id={titleId} />
                    </Grid>
                    {searchCopy && <Grid item> {copyEquipmentButton} </Grid>}
                </Grid>
                {subtitle}
            </DialogTitle>
            <DialogContent>{children}</DialogContent>
            <DialogActions>
                <Button onClick={handleCancel}>
                    <FormattedMessage id="cancel" />
                </Button>
                <SubmitButton
                    onClick={handleSubmit(
                        handleValidate,
                        handleValidationError
                    )}
                    disabled={disabledSave}
                />
            </DialogActions>
        </Dialog>
    );
};

ModificationDialog.propTypes = {
    titleId: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onValidationError: PropTypes.func,
    onValidated: PropTypes.func,
    disabledSave: PropTypes.bool,
    searchCopy: PropTypes.object,
    subtitle: PropTypes.element,
    children: PropTypes.node,
};

export default ModificationDialog;
