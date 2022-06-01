/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { useSnackMessage } from '../../utils/messages';
import makeStyles from '@mui/styles/makeStyles';
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
    compareById,
    filledTextField,
    getId,
    gridItem,
    gridItemWithTooltip,
    MVAPowerAdornment,
    ReactivePowerAdornment,
    VoltageAdornment,
} from './dialogUtils';
import { Box } from '@mui/system';
import { ENERGY_SOURCES, getEnergySourceLabel } from '../network/constants';
import { useNullableBooleanValue } from './inputs/boolean';
import { modifyGenerator } from '../../utils/rest-api';

const useStyles = makeStyles((theme) => ({
    helperText: {
        margin: 0,
        marginTop: 4,
    },
}));

function getValue(val) {
    return val ? val.value : undefined;
}

function getValueOrNull(val) {
    return val ? val.value : null;
}

/**
 * Dialog to create a generator in the network
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param voltageLevelOptions : the network voltageLevels available
 * @param selectedNodeUuid : the currently selected tree node
 * @param workingNodeUuid : the node we are currently working on
 * @param fetchedEquipmentOptions the data generator option
 * @param editData the data to edit
 */
const GeneratorModificationDialog = ({
    editData,
    open,
    onClose,
    voltageLevelOptions,
    selectedNodeUuid,
    workingNodeUuid,
    fetchedEquipmentOptions,
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const intl = useIntl();

    const classes = useStyles();

    const { snackError } = useSnackMessage();

    const inputForm = useInputForm();

    const [formValues, setFormValues] = useState({});

    const [equipmentOptions, setEquipmentOptions] = useState([]);

    const [loadingEquipmentOptions, setLoadingEquipmentOptions] =
        useState(true);

    const clearValues = () => {
        setFormValues(null);
    };

    useEffect(() => {
        fetchedEquipmentOptions.then((values) => {
            setEquipmentOptions(values);
            setLoadingEquipmentOptions(false);
        });
    }, [fetchedEquipmentOptions]);

    useEffect(() => {
        if (editData) {
            setFormValues(editData);
        }
    }, [editData]);

    const formValueEquipmentId = useMemo(() => {
        return formValues?.equipmentId
            ? { id: formValues?.equipmentId }
            : { id: '' };
    }, [formValues]);

    const [generatorInfos, generatorIdField] = useAutocompleteField({
        label: 'ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
        values: equipmentOptions?.sort(compareById),
        allowNewValue: true,
        getLabel: getId,
        defaultValue:
            equipmentOptions?.find((e) => e.id === formValueEquipmentId?.id) ||
            formValueEquipmentId,
        loading: loadingEquipmentOptions,
    });

    const [generatorName, generatorNameField] = useTextValue({
        label: 'Name',
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: getValue(formValues?.equipmentName) || undefined,
        previousValue: generatorInfos?.name,
        clearable: true,
    });

    const energySourceLabelId = getEnergySourceLabel(
        generatorInfos?.energySource
    );
    const previousEnergySourceLabel = energySourceLabelId
        ? intl.formatMessage({
              id: energySourceLabelId,
          })
        : undefined;

    const [energySource, energySourceField] = useEnumValue({
        label: 'EnergySourceText',
        inputForm: inputForm,
        formProps: filledTextField,
        enumValues: ENERGY_SOURCES,
        defaultValue: getValue(formValues?.energySource),
        previousValue: previousEnergySourceLabel,
        clearable: true,
    });

    const [maximumActivePower, maximumActivePowerField] = useDoubleValue({
        label: 'MaximumActivePowerText',
        validation: {
            isFieldNumeric: true,
        },
        adornment: ActivePowerAdornment,
        inputForm: inputForm,
        defaultValue: getValue(formValues?.maxActivePower),
        previousValue: generatorInfos?.maxP,
        clearable: true,
    });

    const [minimumActivePower, minimumActivePowerField] = useDoubleValue({
        label: 'MinimumActivePowerText',
        validation: {
            isFieldNumeric: true,
            isValueLessOrEqualTo: maximumActivePower,
            errorMsgId: 'MinActivePowerLessThanMaxActivePower',
        },
        adornment: ActivePowerAdornment,
        inputForm: inputForm,
        defaultValue: getValue(formValues?.minActivePower),
        previousValue: generatorInfos?.minP,
        clearable: true,
    });

    const [ratedNominalPower, ratedNominalPowerField] = useDoubleValue({
        label: 'RatedNominalPowerText',
        validation: {
            isFieldNumeric: true,
            isValueGreaterThan: '0',
            errorMsgId: 'RatedNominalPowerGreaterThanZero',
        },
        adornment: MVAPowerAdornment,
        inputForm: inputForm,
        defaultValue: getValue(formValues?.ratedNominalPower),
        previousValue: generatorInfos?.ratedS,
        clearable: true,
    });

    const [activePowerSetpoint, activePowerSetpointField] = useDoubleValue({
        label: 'ActivePowerText',
        validation: {
            isFieldNumeric: true,
        },
        adornment: ActivePowerAdornment,
        inputForm: inputForm,
        defaultValue: getValue(formValues?.activePowerSetpoint),
        previousValue: generatorInfos?.targetP,
        clearable: true,
    });

    let previousRegulation = '';
    if (generatorInfos?.voltageRegulatorOn)
        previousRegulation = intl.formatMessage({ id: 'On' });
    else if (generatorInfos?.voltageRegulatorOn === false)
        previousRegulation = intl.formatMessage({ id: 'Off' });

    const [voltageRegulation, voltageRegulationField] = useNullableBooleanValue(
        {
            label: 'VoltageRegulationText',
            inputForm: inputForm,
            defaultValue: getValueOrNull(formValues?.voltageRegulationOn),
            previousValue: previousRegulation,
            clearable: true,
        }
    );

    const [voltageSetpoint, voltageSetpointField] = useDoubleValue({
        label: 'VoltageText',
        validation: {
            isFieldNumeric: true,
            isValueGreaterThan: '0',
            errorMsgId: 'VoltageGreaterThanZero',
        },
        adornment: VoltageAdornment,
        formProps: { disabled: voltageRegulation === false },
        inputForm: inputForm,
        defaultValue: getValue(formValues?.voltageSetpoint),
        previousValue: generatorInfos?.targetV,
        clearable: true,
    });

    const [reactivePowerSetpoint, reactivePowerSetpointField] = useDoubleValue({
        label: 'ReactivePowerText',
        validation: {
            isFieldNumeric: true,
        },
        adornment: ReactivePowerAdornment,
        inputForm: inputForm,
        formProps: { disabled: voltageRegulation === true },
        defaultValue: getValue(formValues?.reactivePowerSetpoint),
        previousValue: generatorInfos?.targetQ,
        clearable: true,
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
        voltageLevelIdDefaultValue:
            getValue(formValues?.voltageLevelId) || null,
        voltageLevelPreviousValue: generatorInfos?.voltageLevelId,
        busOrBusbarSectionIdDefaultValue:
            getValue(formValues?.busOrBusbarSectionId) || null,
    });

    const handleSave = () => {
        if (inputForm.validate()) {
            modifyGenerator(
                studyUuid,
                selectedNodeUuid,
                generatorInfos?.id,
                generatorName,
                energySource,
                minimumActivePower,
                maximumActivePower,
                ratedNominalPower,
                activePowerSetpoint,
                reactivePowerSetpoint,
                voltageRegulation,
                voltageSetpoint,
                connectivity?.voltageLevel?.id,
                connectivity?.busOrBusbarSection?.id,
                editData?.uuid
            ).catch((errorMessage) => {
                snackError(errorMessage, 'GeneratorModificationError');
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
                maxWidth="md" // 3 columns
                open={open}
                onClose={handleClose}
                aria-labelledby="dialog-create-generator"
            >
                <DialogTitle>
                    <Grid container justifyContent={'space-between'}>
                        <Grid item xs={11}>
                            <FormattedMessage id="ModifyGenerator" />
                        </Grid>
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
                            <Box sx={{ width: '100%' }} />
                            {gridItemWithTooltip(
                                voltageRegulationField,
                                voltageRegulation !== null ? (
                                    ''
                                ) : (
                                    <FormattedMessage id={'NoModification'} />
                                ),
                                4
                            )}
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
                    <Button onClick={handleCloseAndClear}>
                        <FormattedMessage id="close" />
                    </Button>
                    <Button onClick={handleSave}>
                        <FormattedMessage id={editData ? 'Update' : 'save'} />
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

GeneratorModificationDialog.propTypes = {
    editData: PropTypes.object,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    voltageLevelOptions: PropTypes.arrayOf(PropTypes.object),
    selectedNodeUuid: PropTypes.string,
    workingNodeUuid: PropTypes.string,
};

export default GeneratorModificationDialog;
