/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import Button from '@mui/material//Button';
import Dialog from '@mui/material//Dialog';
import DialogActions from '@mui/material//DialogActions';
import DialogContent from '@mui/material//DialogContent';
import DialogTitle from '@mui/material//DialogTitle';
import Grid from '@mui/material/Grid';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';
import { modifyLoad } from '../../utils/rest-api';
import {
    useAutocompleteField,
    useConnectivityValue,
    useDoubleValue,
    useEnumValue,
    useInputForm,
    useTextValue,
} from './input-hooks';
import {
    ActivePowerAdornment,
    filledTextField,
    gridItem,
    GridSection,
    ReactivePowerAdornment,
} from './dialogUtils';

import EquipmentSearchDialog from './equipment-search-dialog';
import { useFormSearchCopy } from './form-search-copy-hook';

const LOAD_TYPES = [
    { id: '', label: 'None' },
    { id: 'UNDEFINED', label: 'UndefinedDefaultValue' },
    { id: 'AUXILIARY', label: 'Auxiliary' },
    { id: 'FICTITIOUS', label: 'Fictitious' },
];

const getId = (e) => e?.id;

/**
 * Dialog to create a load in the network
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param voltageLevelOptions : the network voltageLevels available
 * @param selectedNodeUuid : the currently selected tree node
 * @param workingNodeUuid : the node we are currently working on
 * @param editData the data to edit
 */
const LoadModificationDialog = ({
    editData,
    open,
    onClose,
    voltageLevelOptions,
    selectedNodeUuid,
    workingNodeUuid,
    equipmentOptions,
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

    useEffect(() => {
        if (editData) {
            setFormValues(editData);
        }
    }, [editData]);

    const [loadId, loadIdField] = useAutocompleteField({
        label: 'ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
        values: equipmentOptions,
        allowNewValue: true,
        getLabel: getId,
        defaultValue: null,
    });

    const [loadName, loadNameField] = useTextValue({
        label: 'Name',
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.equipmentName?.value,
    });

    const [loadType, loadTypeField] = useEnumValue({
        label: 'Type',
        inputForm: inputForm,
        formProps: filledTextField,
        enumValues: LOAD_TYPES,
        defaultValue: formValues ? formValues.loadType?.value : '',
    });

    const [activePower, activePowerField] = useDoubleValue({
        label: 'ActivePowerText',
        validation: {
            isFieldNumeric: true,
        },
        adornment: ActivePowerAdornment,
        inputForm: inputForm,
        defaultValue: formValues
            ? String(formValues.activePower?.value)
            : undefined,
    });

    const [reactivePower, reactivePowerField] = useDoubleValue({
        label: 'ReactivePowerText',
        validation: {
            isFieldNumeric: true,
        },
        adornment: ReactivePowerAdornment,
        inputForm: inputForm,
        defaultValue: formValues
            ? String(formValues.reactivePower?.value)
            : undefined,
    });

    const [connectivity, connectivityField] = useConnectivityValue({
        label: 'Connectivity',
        validation: {
            isFieldRequired: false,
        },
        disabled: true,
        inputForm: inputForm,
        voltageLevelOptions: voltageLevelOptions,
        workingNodeUuid: workingNodeUuid,
        voltageLevelIdDefaultValue: formValues?.voltageLevelId?.value || null,
        busOrBusbarSectionIdDefaultValue:
            formValues?.busOrBusbarSectionId?.value || null,
    });

    const handleSave = () => {
        if (inputForm.validate()) {
            modifyLoad(
                studyUuid,
                selectedNodeUuid,
                loadId?.id,
                loadName ? loadName : null,
                !loadType ? 'UNDEFINED' : loadType,
                activePower,
                reactivePower,
                connectivity?.voltageLevel?.id,
                connectivity?.busOrBusbarSection?.id,
                editData ? true : false,
                editData ? editData.uuid : undefined
            ).catch((errorMessage) => {
                displayErrorMessageWithSnackbar({
                    errorMessage: errorMessage,
                    enqueueSnackbar: enqueueSnackbar,
                    headerMessage: {
                        headerMessageId: 'LoadModificationError',
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
                fullWidth
                open={open}
                onClose={handleClose}
                aria-labelledby="dialog-create-load"
                maxWidth={'md'}
            >
                <DialogTitle>
                    <Grid container justifyContent={'space-between'}>
                        <Grid item xs={12}>
                            <FormattedMessage id="CreateLoad" />
                        </Grid>
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

LoadModificationDialog.propTypes = {
    editData: PropTypes.object,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    voltageLevelOptions: PropTypes.arrayOf(PropTypes.object),
    selectedNodeUuid: PropTypes.string,
    workingNodeUuid: PropTypes.string,
};

export default LoadModificationDialog;
