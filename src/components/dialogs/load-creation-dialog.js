/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
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
import React, { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';
import {
    useConnectivityValue,
    useDoubleValue,
    useEnumValue,
    useInputForm,
    useButtonWithTooltip,
    useTextValue,
} from './input-hooks';
import {
    ActivePowerAdornment,
    filledTextField,
    gridItem,
    GridSection,
    ReactivePowerAdornment,
} from './dialogUtils';

import { createLoad } from '../../utils/rest-api';
import EquipmentSearchDialog from './equipment-search-dialog';
import { useFormSearchCopy } from './form-search-copy-hook';

const LOAD_TYPES = [
    { id: '', label: 'None' },
    { id: 'UNDEFINED', label: 'UndefinedDefaultValue' },
    { id: 'AUXILIARY', label: 'Auxiliary' },
    { id: 'FICTITIOUS', label: 'Fictitious' },
];

/**
 * Dialog to create a load in the network
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param voltageLevelOptions : the network voltageLevels available
 * @param selectedNodeUuid : the currently selected tree node
 * @param workingNodeUuid : the node we are currently working on
 */
const LoadCreationDialog = ({
    editData,
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

    const [formValues, setFormValues] = useState(undefined);

    const equipmentPath = 'loads';

    const clearValues = () => {
        setFormValues(null);
    };

    const toFormValues = (load) => {
        return {
            equipmentId: load.id + '(1)',
            equipmentName: load.name,
            loadType: load.type,
            activePower: load.p0,
            reactivePower: load.q0,
            voltageLevelId: load.voltageLevelId,
            busOrBusbarSectionId: null,
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

    useEffect(() => {
        if (editData) {
            setFormValues(editData);
        }
    }, [editData]);

    const [loadId, loadIdField] = useTextValue({
        label: 'ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.equipmentId,
    });

    const [loadName, loadNameField] = useTextValue({
        label: 'Name',
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.equipmentName,
    });

    const [loadType, loadTypeField] = useEnumValue({
        label: 'Type',
        inputForm: inputForm,
        formProps: filledTextField,
        enumValues: LOAD_TYPES,
        defaultValue: formValues ? formValues.loadType : '',
    });

    const [activePower, activePowerField] = useDoubleValue({
        label: 'ActivePowerText',
        validation: {
            isFieldRequired: true,
            isFieldNumeric: true,
        },
        adornment: ActivePowerAdornment,
        inputForm: inputForm,
        defaultValue: formValues ? String(formValues.activePower) : undefined,
    });

    const [reactivePower, reactivePowerField] = useDoubleValue({
        label: 'ReactivePowerText',
        validation: {
            isFieldRequired: true,
            isFieldNumeric: true,
        },
        adornment: ReactivePowerAdornment,
        inputForm: inputForm,
        defaultValue: formValues ? String(formValues.reactivePower) : undefined,
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
            if (editData) {
                createLoad(
                    studyUuid,
                    selectedNodeUuid,
                    loadId,
                    loadName ? loadName : null,
                    !loadType ? 'UNDEFINED' : loadType,
                    activePower,
                    reactivePower,
                    connectivity.voltageLevel.id,
                    connectivity.busOrBusbarSection.id,
                    true,
                    editData.uuid
                ).catch((errorMessage) => {
                    displayErrorMessageWithSnackbar({
                        errorMessage: errorMessage,
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId: 'LoadCreationError',
                            intlRef: intlRef,
                        },
                    });
                });
            } else {
                createLoad(
                    studyUuid,
                    selectedNodeUuid,
                    loadId,
                    loadName ? loadName : null,
                    !loadType ? 'UNDEFINED' : loadType,
                    activePower,
                    reactivePower,
                    connectivity.voltageLevel.id,
                    connectivity.busOrBusbarSection.id
                ).catch((errorMessage) => {
                    displayErrorMessageWithSnackbar({
                        errorMessage: errorMessage,
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId: 'LoadCreationError',
                            intlRef: intlRef,
                        },
                    });
                });
            }
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
                fullWidth
                open={open}
                onClose={handleClose}
                aria-labelledby="dialog-create-load"
                maxWidth={'md'}
            >
                <DialogTitle>
                    <Grid container justifyContent={'space-between'}>
                        <Grid item xs={11}>
                            <FormattedMessage id="CreateLoad" />
                        </Grid>
                        <Grid item> {copyEquipmentButton} </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        {gridItem(loadIdField, 4)}
                        {gridItem(loadNameField, 4)}
                        {gridItem(loadTypeField, 4)}
                    </Grid>
                    <GridSection title="Setpoints" />
                    <Grid container spacing={2}>
                        {gridItem(activePowerField, 4)}
                        {gridItem(reactivePowerField, 4)}
                    </Grid>
                    <GridSection title="Connectivity" />
                    <Grid container spacing={2}>
                        {gridItem(connectivityField, 8)}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAndClear} variant="text">
                        <FormattedMessage id="close" />
                    </Button>
                    <Button onClick={handleSave} variant="text">
                        <FormattedMessage id={editData ? 'Update' : 'save'} />
                    </Button>
                </DialogActions>
            </Dialog>
            <EquipmentSearchDialog
                open={searchCopy.isDialogSearchOpen}
                onClose={searchCopy.handleCloseSearchDialog}
                equipmentType={'LOAD'}
                onSelectionChange={searchCopy.handleSelectionChange}
                selectedNodeUuid={selectedNodeUuid}
            />
        </>
    );
};

LoadCreationDialog.propTypes = {
    editData: PropTypes.object,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    voltageLevelOptions: PropTypes.arrayOf(PropTypes.object),
    selectedNodeUuid: PropTypes.string,
    workingNodeUuid: PropTypes.string,
};

export default LoadCreationDialog;
