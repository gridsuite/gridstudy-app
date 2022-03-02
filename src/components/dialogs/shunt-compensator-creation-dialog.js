/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';
import { useSnackbar } from 'notistack';
import {
    useBooleanValue,
    useConnectivityValue,
    useDoubleValue,
    useInputForm,
    useIntegerValue,
    useTextValue,
} from './input-hooks';
import { createShuntCompensator } from '../../utils/rest-api';
import {
    filledTextField,
    gridItem,
    GridSection,
    SusceptanceAdornment,
    toPositiveIntValue,
} from './dialogUtils';

const disabledChecked = { disabled: true };

/**
 * Dialog to create a shunt compensator in the network
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param voltageLevelOptions : the network voltageLevels available
 * @param selectedNodeUuid : the currently selected tree node
 */
const ShuntCompensatorCreationDialog = ({
    open,
    onClose,
    voltageLevelOptions,
    selectedNodeUuid,
    workingNodeUuid,
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const inputForm = useInputForm();

    const [shuntCompensatorId, shuntCompensatorIdField] = useTextValue({
        label: 'ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
    });

    const [shuntCompensatorName, shuntCompensatorNameField] = useTextValue({
        label: 'Name',
        inputForm: inputForm,
        formProps: filledTextField,
    });

    const [maximumNumberOfSections, maximumNumberOfSectionsField] =
        useIntegerValue({
            label: 'ShuntMaximumNumberOfSections',
            defaultValue: 1,
            validation: {
                isFieldRequired: true,
                isValueGreaterThan: '0',
                errorMsgId: 'ShuntCompensatorErrorMaximumLessThanOne',
            },
            transformValue: toPositiveIntValue,
            inputForm: inputForm,
        });

    const [currentNumberOfSections, currentNumberOfSectionsField] =
        useIntegerValue({
            label: 'ShuntCurrentNumberOfSections',
            defaultValue: 0,
            validation: {
                isValueLessOrEqualTo: maximumNumberOfSections,
                isValueGreaterThan: '-1',
                errorMsgId: 'ShuntCompensatorErrorCurrentLessThanMaximum',
                isFieldRequired: true,
            },
            transformValue: toPositiveIntValue,
            inputForm: inputForm,
        });

    const [identicalSections, identicalSectionsField] = useBooleanValue({
        label: 'ShuntIdenticalSections',
        defaultValue: true,
        validation: { isFieldRequired: true },
        formProps: disabledChecked,
        inputForm: inputForm,
    });

    const [susceptancePerSection, susceptancePerSectionField] = useDoubleValue({
        label: 'ShuntSusceptancePerSection',
        validation: { isFieldRequired: true },
        adornment: SusceptanceAdornment,
        inputForm: inputForm,
    });

    const [connectivity, connectivityField] = useConnectivityValue({
        label: 'Connectivity',
        inputForm: inputForm,
        voltageLevelOptions: voltageLevelOptions,
        workingNodeUuid: workingNodeUuid,
    });

    const handleSave = () => {
        if (inputForm.validate()) {
            createShuntCompensator(
                studyUuid,
                selectedNodeUuid,
                shuntCompensatorId,
                shuntCompensatorName ? shuntCompensatorName : null,
                maximumNumberOfSections,
                currentNumberOfSections,
                identicalSections,
                susceptancePerSection,
                connectivity
            ).catch((errorMessage) => {
                displayErrorMessageWithSnackbar({
                    errorMessage: errorMessage,
                    enqueueSnackbar: enqueueSnackbar,
                    headerMessage: {
                        headerMessageId: 'ShuntCompensatorCreationError',
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
            fullWidth
            open={open}
            onClose={handleClose}
            aria-labelledby="dialog-create-shuntCompensator"
        >
            <DialogTitle>
                <FormattedMessage id="CreateShuntCompensator" />
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    {gridItem(shuntCompensatorIdField)}
                    {gridItem(shuntCompensatorNameField)}
                </Grid>
                <GridSection title="Characteristics" />
                <Grid container spacing={2}>
                    {gridItem(maximumNumberOfSectionsField)}
                    {gridItem(currentNumberOfSectionsField)}
                </Grid>
                <Grid container spacing={2}>
                    {gridItem(identicalSectionsField)}
                    {gridItem(susceptancePerSectionField)}
                </Grid>
                <GridSection title="Connectivity" />
                <Grid container spacing={2}>
                    {gridItem(connectivityField, 12)}
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

ShuntCompensatorCreationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    voltageLevelOptions: PropTypes.arrayOf(PropTypes.object),
    selectedNodeUuid: PropTypes.string,
    workingNodeUuid: PropTypes.string,
};

export default ShuntCompensatorCreationDialog;
