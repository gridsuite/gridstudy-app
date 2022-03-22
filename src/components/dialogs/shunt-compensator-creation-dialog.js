/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
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
    useButtonWithTooltip,
    useConnectivityValue,
    useDoubleValue,
    useInputForm,
    useIntegerValue,
    useTextValue,
} from './input-hooks';
import {
    createShuntCompensator,
    fetchEquipmentInfos,
} from '../../utils/rest-api';
import {
    filledTextField,
    gridItem,
    GridSection,
    SusceptanceAdornment,
    toPositiveIntValue,
} from './dialogUtils';
import EquipmentSearchDialog from './equipment-search-dialog';

const disabledChecked = { disabled: true };

/**
 * Dialog to create a shunt compensator in the network
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param voltageLevelOptions : the network voltageLevels available
 * @param selectedNodeUuid : the currently selected tree node
 * @param workingNodeUuid : the node we are currently working on
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

    const intl = useIntl();

    const { enqueueSnackbar } = useSnackbar();

    const inputForm = useInputForm();

    const [formValues, setFormValues] = useState(undefined);

    const [isDialogSearchOpen, setDialogSearchOpen] = useState(false);

    const handleCloseSearchDialog = () => {
        setDialogSearchOpen(false);
    };

    const handleOpenSearchDialog = () => {
        setDialogSearchOpen(true);
    };

    const copyEquipmentButton = useButtonWithTooltip({
        label: 'CopyFromExisting',
        handleClick: handleOpenSearchDialog,
    });

    const [shuntCompensatorId, shuntCompensatorIdField] = useTextValue({
        label: 'ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.equipmentId,
    });

    const [shuntCompensatorName, shuntCompensatorNameField] = useTextValue({
        label: 'Name',
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.equipmentName,
    });

    const [maximumNumberOfSections, maximumNumberOfSectionsField] =
        useIntegerValue({
            label: 'ShuntMaximumNumberOfSections',
            validation: {
                isFieldRequired: true,
                isValueGreaterThan: '0',
                errorMsgId: 'ShuntCompensatorErrorMaximumLessThanOne',
            },
            transformValue: toPositiveIntValue,
            inputForm: inputForm,
            defaultValue: formValues ? formValues.maximumNumberOfSections : 1,
        });

    const [currentNumberOfSections, currentNumberOfSectionsField] =
        useIntegerValue({
            label: 'ShuntCurrentNumberOfSections',
            validation: {
                isValueLessOrEqualTo: maximumNumberOfSections,
                isValueGreaterThan: '-1',
                errorMsgId: 'ShuntCompensatorErrorCurrentLessThanMaximum',
                isFieldRequired: true,
            },
            transformValue: toPositiveIntValue,
            inputForm: inputForm,
            defaultValue: formValues ? formValues.currentNumberOfSections : 0,
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
        defaultValue: formValues?.susceptancePerSection,
    });

    const [connectivity, connectivityField] = useConnectivityValue({
        label: 'Connectivity',
        inputForm: inputForm,
        voltageLevelOptions: voltageLevelOptions,
        workingNodeUuid: workingNodeUuid,
        voltageLevelIdDefaultValue: formValues?.voltageLevelId || null,
        busOrBusbarSectionIdDefaultValue:
            formValues?.busOrBusbarSectionId || null,
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

    const handleSelectionChange = (element) => {
        let msg;
        return fetchEquipmentInfos(
            studyUuid,
            selectedNodeUuid,
            'shunt-compensators',
            element.id,
            true
        ).then((response) => {
            if (response.status === 200) {
                response.json().then((shuntCompensator) => {
                    setFormValues(null);
                    const shuntCompensatorFormValues = {
                        equipmentId: shuntCompensator.id + '(1)',
                        equipmentName: shuntCompensator.name,
                        maximumNumberOfSections:
                            shuntCompensator.maximumSectionCount,
                        currentNumberOfSections: shuntCompensator.sectionCount,
                        susceptancePerSection: shuntCompensator.bperSection,
                        voltageLevelId: shuntCompensator.voltageLevelId,
                        busOrBusbarSectionId: null,
                    };
                    setFormValues(shuntCompensatorFormValues);

                    msg = intl.formatMessage(
                        { id: 'EquipmentCopied' },
                        {
                            equipmentId: element.id,
                        }
                    );
                    enqueueSnackbar(msg, {
                        variant: 'info',
                        persist: false,
                        style: { whiteSpace: 'pre-line' },
                    });
                });
            } else {
                console.error(
                    'error while fetching shuntCompensator {shuntCompensatorId} : status = {status}',
                    element.id,
                    response.status
                );
                if (response.status === 404) {
                    msg = intl.formatMessage(
                        { id: 'EquipmentCopyFailed404' },
                        {
                            equipmentId: element.id,
                        }
                    );
                } else {
                    msg = intl.formatMessage(
                        { id: 'EquipmentCopyFailed' },
                        {
                            equipmentId: element.id,
                        }
                    );
                }
                displayErrorMessageWithSnackbar({
                    errorMessage: msg,
                    enqueueSnackbar,
                });
            }
            handleCloseSearchDialog();
        });
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
        <>
            <Dialog
                fullWidth
                open={open}
                onClose={handleClose}
                aria-labelledby="dialog-create-shuntCompensator"
            >
                <DialogTitle>
                    <Grid container justifyContent={'space-between'}>
                        <Grid item xs={11}>
                            <FormattedMessage id="CreateShuntCompensator" />
                        </Grid>
                        <Grid item> {copyEquipmentButton} </Grid>
                    </Grid>
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
            <EquipmentSearchDialog
                open={isDialogSearchOpen}
                onClose={handleCloseSearchDialog}
                equipmentType={'SHUNT_COMPENSATOR'}
                onSelectionChange={handleSelectionChange}
                selectedNodeUuid={selectedNodeUuid}
            />
        </>
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
