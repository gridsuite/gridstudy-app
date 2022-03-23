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
import React, { useCallback, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';
import { createSubstation } from '../../utils/rest-api';
import {
    useButtonWithTooltip,
    useCountryValue,
    useInputForm,
    useTextValue,
} from './input-hooks';
import { filledTextField, gridItem } from './dialogUtils';
import EquipmentSearchDialog from './equipment-search-dialog';
import { useFormSearchCopy } from './form-search-copy-hook';

/**
 * Dialog to create a substation in the network
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param selectedNodeUuid : the currently selected tree node
 */
const SubstationCreationDialog = ({ open, onClose, selectedNodeUuid }) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const inputForm = useInputForm();

    const [formValues, setFormValues] = useState(undefined);

    const equipmentPath = 'substations';

    const clearValues = () => {
        setFormValues(null);
    };

    const toFormValues = (substation) => {
        return {
            equipmentId: substation.id + '(1)',
            equipmentName: substation.name,
            substationCountryLabel: substation.countryName,
            substationCountry: null,
        };
    };

    const searchCopy = useFormSearchCopy({
        studyUuid,
        selectedNodeUuid,
        equipmentPath,
        toFormValues,
        setFormValues,
        clearValues,
    });

    const copyEquipmentButton = useButtonWithTooltip({
        label: 'CopyFromExisting',
        handleClick: searchCopy.handleOpenSearchDialog,
    });

    const [substationId, substationIdField] = useTextValue({
        label: 'ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.equipmentId,
    });

    const [substationName, substationNameField] = useTextValue({
        label: 'Name',
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.equipmentName,
    });

    const [substationCountry, substationCountryField] = useCountryValue({
        label: 'Country',
        inputForm: inputForm,
        formProps: filledTextField,
        validation: { isFieldRequired: false },
        defaultCodeValue: formValues ? formValues.substationCountry : null,
        defaultLabelValue: formValues
            ? formValues.substationCountryLabel
            : null,
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
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="dialog-create-substation"
                fullWidth={true}
            >
                <DialogTitle>
                    <Grid container justifyContent={'space-between'}>
                        <Grid item xs={11}>
                            <FormattedMessage id="CreateSubstation" />
                        </Grid>
                        <Grid item> {copyEquipmentButton} </Grid>
                    </Grid>
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
            <EquipmentSearchDialog
                open={searchCopy.isDialogSearchOpen}
                onClose={searchCopy.handleCloseSearchDialog}
                equipmentType={'SUBSTATION'}
                onSelectionChange={searchCopy.handleSelectionChange}
                selectedNodeUuid={selectedNodeUuid}
            />
        </>
    );
};

SubstationCreationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    selectedNodeUuid: PropTypes.string,
};

export default SubstationCreationDialog;
