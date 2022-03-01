/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';
import { createSubstation } from '../../utils/rest-api';
import { useCountryValue, useInputForm, useTextValue } from './input-hooks';
import { filledTextField } from './dialogUtils';

/**
 * Dialog to create a substation in the network
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param selectedNodeUuid : the currently selected tree node
 */
const SubstationCreationDialog = ({ open, onClose, selectedNodeUuid }) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const intl = useIntl();
    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const inputForm = useInputForm();

    const [substationId, substationIdField] = useTextValue({
        label: 'ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
    });

    const [substationName, substationNameField] = useTextValue({
        label: 'Name',
        inputForm: inputForm,
        formProps: filledTextField,
    });

    const [substationCountry, substationCountryField] = useCountryValue({
        label: 'Country',
        inputForm: inputForm,
        formProps: filledTextField,
        validation: { isFieldRequired: false },
    });

    const handleSave = () => {
        if (inputForm.validate()) {
            createSubstation(
                studyUuid,
                selectedNodeUuid,
                substationId,
                substationName,
                substationCountry
            ).catch((errorMessage) => {
                displayErrorMessageWithSnackbar({
                    errorMessage: errorMessage,
                    enqueueSnackbar: enqueueSnackbar,
                    headerMessage: {
                        headerMessageId: 'SubstationCreationError',
                        intlRef: intlRef,
                    },
                });
            });
            // do not wait fetch response and close dialog, errors will be shown in snackbar.
            handleCloseAndClear();
        }
    };

    const clearValues = useCallback(() => {
        inputForm.clear();
    }, [inputForm]);

    const handleClose = useCallback(
        (event, reason) => {
            if (reason !== 'backdropClick') {
                inputForm.reset();
                onClose();
            }
        },
        [inputForm, onClose]
    );

    const handleCloseAndClear = () => {
        clearValues();
        handleClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="dialog-create-substation"
            fullWidth={true}
        >
            <DialogTitle>
                {intl.formatMessage({ id: 'CreateSubstation' })}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    {gridItem(substationIdField, 4)}
                    {gridItem(substationNameField, 4)}
                    {gridItem(substationCountryField, 4)}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseAndClear} variant="text">
                    <FormattedMessage id="close" />
                </Button>
                <Button onClick={handleSave} variant="text">
                    <FormattedMessage id="save" />
                </Button>
            </DialogActions>
        </Dialog>
    );
};

SubstationCreationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    selectedNodeUuid: PropTypes.string,
};

export default SubstationCreationDialog;
