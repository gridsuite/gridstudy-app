/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { createGenerator } from '../../utils/rest-api';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';
import { useSnackbar } from 'notistack';
import { makeStyles } from '@material-ui/core/styles';
import {
    useBooleanValue,
    useButtonWithTooltip,
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
    ReactivePowerAdornment,
    VoltageAdornment,
} from './dialogUtils';
import EquipmentSearchDialog from './equipment-search-dialog';
import { useFormSearchCopy } from './form-search-copy-hook';

const useStyles = makeStyles((theme) => ({
    helperText: {
        margin: 0,
        marginTop: 4,
    },
    h3: {
        marginBottom: 0,
        paddingBottom: 1,
    },
}));

const ENERGY_SOURCES = [
    { id: '', label: 'None' },
    { id: 'HYDRO', label: 'Hydro' },
    { id: 'NUCLEAR', label: 'Nuclear' },
    { id: 'WIND', label: 'Wind' },
    { id: 'THERMAL', label: 'Thermal' },
    { id: 'SOLAR', label: 'Solar' },
    { id: 'OTHER', label: 'Other' },
];

/**
 * Dialog to create a generator in the network
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param voltageLevelOptions : the network voltageLevels available
 * @param selectedNodeUuid : the currently selected tree node
 * @param workingNodeUuid : the node we are currently working on
 */
const GeneratorCreationDialog = ({
    open,
    onClose,
    voltageLevelOptions,
    selectedNodeUuid,
    workingNodeUuid,
    editData,
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const classes = useStyles();
    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const inputForm = useInputForm();

    const [formValues, setFormValues] = useState(undefined);

    const toFormValues = (generator) => {
        return {
            equipmentId: generator.id + '(1)',
            equipmentName: generator.name,
            energySource: generator.energySource,
            maxActivePower: generator.maxP,
            minActivePower: generator.minP,
            ratedNominalPower: generator.ratedS,
            activePowerSetpoint: generator.targetP,
            voltageRegulatorOn: generator.voltageRegulatorOn,
            voltageSetpoint: generator.targetV,
            reactivePowerSetpoint: generator.targetQ,
            voltageLevelId: generator.voltageLevelId,
            busOrBusbarSectionId: null,
        };
    };

    const equipmentPath = 'generators';

    const clearValues = () => {
        setFormValues(null);
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

    const [generatorId, generatorIdField] = useTextValue({
        label: 'ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.equipmentId,
    });

    const [generatorName, generatorNameField] = useTextValue({
        label: 'Name',
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.equipmentName,
    });

    const [energySource, energySourceField] = useEnumValue({
        label: 'EnergySourceText',
        inputForm: inputForm,
        formProps: filledTextField,
        enumValues: ENERGY_SOURCES,
        validation: {
            isFieldRequired: false,
        },
        defaultValue: formValues?.energySource,
    });

    const [maximumActivePower, maximumActivePowerField] = useDoubleValue({
        label: 'MaximumActivePowerText',
        validation: {
            isFieldRequired: true,
            isFieldNumeric: true,
        },
        adornment: ActivePowerAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.maxActivePower,
    });

    const [minimumActivePower, minimumActivePowerField] = useDoubleValue({
        label: 'MinimumActivePowerText',
        validation: {
            isFieldRequired: true,
            isFieldNumeric: true,
            isValueLessOrEqualTo: maximumActivePower,
            errorMsgId: 'MinActivePowerLessThanMaxActivePower',
        },
        adornment: ActivePowerAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.minActivePower,
    });

    const [ratedNominalPower, ratedNominalPowerField] = useDoubleValue({
        label: 'RatedNominalPowerText',
        validation: {
            isFieldRequired: false,
            isFieldNumeric: true,
            isValueGreaterThan: '0',
            errorMsgId: 'RatedNominalPowerGreaterThanZero',
        },
        adornment: ReactivePowerAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.ratedNominalPower,
    });

    const [activePowerSetpoint, activePowerSetpointField] = useDoubleValue({
        label: 'ActivePowerText',
        validation: {
            isFieldRequired: true,
            isFieldNumeric: true,
        },
        adornment: ActivePowerAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.activePowerSetpoint,
    });

    const [voltageRegulation, voltageRegulationField] = useBooleanValue({
        label: 'VoltageRegulationText',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        defaultValue: formValues?.voltageRegulationOn || false,
    });

    const [voltageSetpoint, voltageSetpointField] = useDoubleValue({
        label: 'VoltageText',
        validation: {
            isFieldRequired: voltageRegulation,
            isFieldNumeric: true,
            isValueGreaterThan: '0',
            errorMsgId: 'VoltageGreaterThanZero',
        },
        adornment: VoltageAdornment,
        formProps: { disabled: !voltageRegulation },
        inputForm: inputForm,
        defaultValue: formValues?.voltageSetpoint,
    });

    const [reactivePowerSetpoint, reactivePowerSetpointField] = useDoubleValue({
        label: 'ReactivePowerText',
        validation: {
            isFieldRequired: !voltageRegulation,
            isFieldNumeric: true,
        },
        adornment: ReactivePowerAdornment,
        inputForm: inputForm,
        formProps: { disabled: voltageRegulation },
        defaultValue: formValues?.reactivePowerSetpoint,
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
                createGenerator(
                    studyUuid,
                    selectedNodeUuid,
                    generatorId,
                    generatorName ? generatorName : null,
                    !energySource ? 'OTHER' : energySource,
                    minimumActivePower,
                    maximumActivePower,
                    ratedNominalPower ? ratedNominalPower : null,
                    activePowerSetpoint,
                    reactivePowerSetpoint ? reactivePowerSetpoint : null,
                    voltageRegulation,
                    voltageSetpoint ? voltageSetpoint : null,
                    connectivity.voltageLevel.id,
                    connectivity.busOrBusbarSection.id,
                    true,
                    editData.uuid
                ).catch((errorMessage) => {
                    displayErrorMessageWithSnackbar({
                        errorMessage: errorMessage,
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId: 'GeneratorCreationError',
                            intlRef: intlRef,
                        },
                    });
                });
            } else {
                createGenerator(
                    studyUuid,
                    selectedNodeUuid,
                    generatorId,
                    generatorName ? generatorName : null,
                    !energySource ? 'OTHER' : energySource,
                    minimumActivePower,
                    maximumActivePower,
                    ratedNominalPower ? ratedNominalPower : null,
                    activePowerSetpoint,
                    reactivePowerSetpoint ? reactivePowerSetpoint : null,
                    voltageRegulation,
                    voltageSetpoint ? voltageSetpoint : null,
                    connectivity.voltageLevel.id,
                    connectivity.busOrBusbarSection.id
                ).catch((errorMessage) => {
                    displayErrorMessageWithSnackbar({
                        errorMessage: errorMessage,
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId: 'GeneratorCreationError',
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
                maxWidth="md" // 3 columns
                open={open}
                onClose={handleClose}
                aria-labelledby="dialog-create-generator"
            >
                <DialogTitle>
                    <Grid container justifyContent={'space-between'}>
                        <Grid item xs={11}>
                            <FormattedMessage id="CreateGenerator" />
                        </Grid>
                        <Grid item> {copyEquipmentButton} </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <div>
                        <Grid container spacing={2}>
                            {gridItem(generatorIdField, 4)}
                            {gridItem(generatorNameField, 4)}
                            {gridItem(energySourceField, 4)}
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <h3 className={classes.h3}>
                                    <FormattedMessage id="Limits" />
                                </h3>
                            </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                            {gridItem(minimumActivePowerField, 4)}
                            {gridItem(maximumActivePowerField, 4)}
                            {gridItem(ratedNominalPowerField, 4)}
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <h3 className={classes.h3}>
                                    <FormattedMessage id="Setpoints" />
                                </h3>
                            </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                            {gridItem(activePowerSetpointField, 4)}
                            {gridItem(reactivePowerSetpointField, 4)}
                        </Grid>
                        <Grid container spacing={2} alignItems="center">
                            {gridItem(voltageRegulationField, 4)}
                            {gridItem(voltageSetpointField, 4)}
                        </Grid>
                        {/* Connectivity part */}
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <h3 className={classes.h3}>
                                    <FormattedMessage id="Connectivity" />
                                </h3>
                            </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                            {gridItem(connectivityField, 8)}
                        </Grid>
                    </div>
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
                equipmentType={'GENERATOR'}
                onSelectionChange={searchCopy.handleSelectionChange}
                selectedNodeUuid={selectedNodeUuid}
            />
        </>
    );
};

GeneratorCreationDialog.propTypes = {
    editData: PropTypes.object,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    voltageLevelOptions: PropTypes.arrayOf(PropTypes.object),
    selectedNodeUuid: PropTypes.string,
    workingNodeUuid: PropTypes.string,
};

export default GeneratorCreationDialog;
