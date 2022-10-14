/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
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
import { LOAD_TYPES } from '../network/constants';
import {
    useDoubleValue,
    useEnumValue,
    useInputForm,
    useButtonWithTooltip,
    useTextValue,
} from './inputs/input-hooks';
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
import { useConnectivityValue } from './connectivity-edition';

/**
 * Dialog to create a load in the network
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param voltageLevelOptionsPromise Promise handling list of voltage level options
 * @param currentNodeUuid : the node we are currently working on
 * @param editData the data to edit
 */
const LoadCreationDialog = ({
    editData,
    open,
    onClose,
    voltageLevelOptionsPromise,
    currentNodeUuid,
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const inputForm = useInputForm();

    const [formValues, setFormValues] = useState(undefined);

    const equipmentPath = 'loads';

    const [btnSaveListDisabled, setBtnSaveListDisabled] = useState(true);

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
        currentNodeUuid,
        equipmentPath,
        toFormValues,
        setFormValues,
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
        validation: { isFieldRequired: false },
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.equipmentName,
    });

    const [loadType, loadTypeField] = useEnumValue({
        label: 'Type',
        validation: { isFieldRequired: false },
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
        voltageLevelOptionsPromise: voltageLevelOptionsPromise,
        currentNodeUuid: currentNodeUuid,
        voltageLevelIdDefaultValue: formValues?.voltageLevelId || null,
        busOrBusbarSectionIdDefaultValue:
            formValues?.busOrBusbarSectionId || null,
    });

    function isEmpty(value) {
        return value === '';
    }

    useEffect(() => {
        if (
            loadId !== formValues?.equipmentId ||
            loadType !== formValues?.loadType ||
            (formValues?.equipmentName !== undefined &&
                loadName !== formValues?.equipmentName) ||
            (formValues?.equipmentName === undefined && !isEmpty(loadName)) ||
            activePower !== String(formValues?.activePower) ||
            reactivePower !== String(formValues?.reactivePower) ||
            connectivity?.voltageLevel?.id !== formValues?.voltageLevelId ||
            connectivity?.busOrBusbarSection?.id !==
                formValues?.busOrBusbarSectionId
        ) {
            setBtnSaveListDisabled(false);
        } else {
            setBtnSaveListDisabled(true);
        }
    }, [
        activePower,
        loadName,
        connectivity?.voltageLevel,
        connectivity?.busOrBusbarSection,
        formValues,
        loadId,
        loadType,
        reactivePower,
    ]);

    const handleSave = () => {
        if (inputForm.validate()) {
            createLoad(
                studyUuid,
                currentNodeUuid,
                loadId,
                loadName ? loadName : null,
                !loadType ? 'UNDEFINED' : loadType,
                activePower,
                reactivePower,
                connectivity.voltageLevel.id,
                connectivity.busOrBusbarSection.id,
                editData ? true : false,
                editData ? editData.uuid : undefined
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
        setFormValues(null);
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
                    <Button onClick={handleCloseAndClear}>
                        <FormattedMessage id="cancel" />
                    </Button>
                    <Button onClick={handleSave} disabled={btnSaveListDisabled}>
                        <FormattedMessage id="validate" />
                    </Button>
                </DialogActions>
            </Dialog>
            <EquipmentSearchDialog
                open={searchCopy.isDialogSearchOpen}
                onClose={searchCopy.handleCloseSearchDialog}
                equipmentType={'LOAD'}
                onSelectionChange={searchCopy.handleSelectionChange}
                currentNodeUuid={currentNodeUuid}
            />
        </>
    );
};

LoadCreationDialog.propTypes = {
    editData: PropTypes.object,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    voltageLevelOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
    currentNodeUuid: PropTypes.string,
};

export default LoadCreationDialog;
