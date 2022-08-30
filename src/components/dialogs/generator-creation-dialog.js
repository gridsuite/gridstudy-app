/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { createGenerator } from '../../utils/rest-api';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';
import { useSnackbar } from 'notistack';
import makeStyles from '@mui/styles/makeStyles';
import {
    useButtonWithTooltip,
    useConnectivityValue,
    useDoubleValue,
    useEnumValue,
    useInputForm,
    useRegulatingTerminalValue,
    useTableValues,
    useTextValue,
} from './input-hooks';
import {
    ActivePowerAdornment,
    filledTextField,
    gridItem,
    MVAPowerAdornment,
    OhmAdornment,
    percentageTextField,
    ReactivePowerAdornment,
    VoltageAdornment,
} from './dialogUtils';
import EquipmentSearchDialog from './equipment-search-dialog';
import { useFormSearchCopy } from './form-search-copy-hook';
import { Box } from '@mui/system';
import { ENERGY_SOURCES } from '../network/constants';
import { useBooleanValue } from './inputs/boolean';

const useStyles = makeStyles((theme) => ({
    helperText: {
        margin: 0,
        marginTop: 4,
    },
}));

const RCCurve = ({ index, onChange, defaultValue, inputForm }) => {
    const [isFieldRequired, setIsFieldRequired] = useState(false);
    const [p, pField] = useDoubleValue({
        label: 'P',
        validation: {
            isFieldRequired: isFieldRequired,
            isFieldNumeric: true,
        },
        adornment: ReactivePowerAdornment,
        inputForm: inputForm,
        defaultValue: defaultValue?.pmin ? defaultValue.pmin : '',
    });
    const [qminP, qminPField] = useDoubleValue({
        label: 'QminP',
        validation: {
            isFieldRequired: isFieldRequired,
            isFieldNumeric: true,
        },
        adornment: ReactivePowerAdornment,
        inputForm: inputForm,
        defaultValue: defaultValue?.qminPmin ? defaultValue.qminPmin : '',
    });

    const [qmaxP, qmaxPField] = useDoubleValue({
        label: 'QmaxP',
        validation: {
            isFieldRequired: isFieldRequired,
            isFieldNumeric: true,
        },
        adornment: ReactivePowerAdornment,
        inputForm: inputForm,
        defaultValue: defaultValue?.qmaxPmin ? defaultValue.qmaxPmin : '',
    });

    useEffect(() => {
        onChange(index, { pmin: p, qminPmin: qminP, qmaxPmin: qmaxP });
        setIsFieldRequired(p || qminP || qmaxP);
    }, [index, onChange, p, qminP, qmaxP]);

    return (
        <>
            {gridItem(pField, 3)}
            {gridItem(qminPField, 3)}
            {gridItem(qmaxPField, 3)}
        </>
    );
};

/**
 * Dialog to create a generator in the network
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param voltageLevelOptionsPromise Promise handling list of voltage level options
 * @param currentNodeUuid : the currently selected tree node
 * @param editData the data to edit
 */
const GeneratorCreationDialog = ({
    open,
    onClose,
    voltageLevelOptionsPromise,
    voltageLevelsEquipmentsOptionsPromise,
    currentNodeUuid,
    editData,
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const classes = useStyles();
    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const inputForm = useInputForm();

    const [formValues, setFormValues] = useState(undefined);

    const [reactivePowerRequired, setReactivePowerRequired] = useState(false);

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
            marginalCost: generator.marginalCost,
            participate: generator.activePowerControlOn,
            droop: generator.droop,
            transientReactance: generator.transientReactance,
            reactiveCapabilityCurvePt: generator.reactiveCapabilityCurvePt,
        };
    };

    const equipmentPath = 'generators';

    const clearValues = () => {
        setFormValues(null);
    };

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
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
        validation: { isFieldRequired: false },
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
        adornment: MVAPowerAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.ratedNominalPower,
    });

    const [reactiveCapabilityCurve, reactiveCapabilityCurveField] =
        useBooleanValue({
            label: 'ReactiveCapabilityCurve',
            validation: { isFieldRequired: true },
            inputForm: inputForm,
            defaultValue: true,
        });

    const [minimumReactivePower, minimumReactivePowerField] = useDoubleValue({
        label: 'MinimumReactivePower',
        validation: {
            isFieldRequired: reactivePowerRequired,
            isFieldNumeric: true,
        },
        adornment: ReactivePowerAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.activePowerSetpoint,
    });

    const [maximumReactivePower, maximumReactivePowerField] = useDoubleValue({
        label: 'MaximumReactivePower',
        validation: {
            isFieldRequired: reactivePowerRequired,
            isFieldNumeric: true,
        },
        adornment: ReactivePowerAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.activePowerSetpoint,
    });

    const [reactiveCapabilityCurveOn, reactiveCapabilityCurveOnField] =
        useTableValues({
            id: 'ReactiveCapabilityCurveOn',
            tableHeadersIds: [
                'ActivePower',
                'MinimumReactivePower',
                'MaximumReactivePower',
            ],
            inputForm: inputForm,
            Field: RCCurve,
            defaultValues: formValues?.reactiveCapabilityCurvePt,
            isRequired: false,
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
        defaultValue: formValues?.voltageRegulatorOn || false,
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

    const [regulatingTerminal, regulatingTerminalField] =
        useRegulatingTerminalValue({
            label: 'RegulatingTerminalGenerator',
            inputForm: inputForm,
            disabled: !voltageRegulation,
            voltageLevelOptionsPromise: voltageLevelsEquipmentsOptionsPromise,
            voltageLevelIdDefaultValue: formValues?.voltageLevelId || null,
            busOrBusbarSectionIdDefaultValue:
                formValues?.busOrBusbarSectionId || null,
        });

    const [frequencyRegulation, frequencyRegulationField] = useBooleanValue({
        label: 'FrequencyRegulation',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        defaultValue: formValues?.participate || false,
    });

    const [droop, droopField] = useDoubleValue({
        label: 'Droop',
        validation: {
            isFieldRequired: voltageRegulation,
            isFieldNumeric: true,
        },
        adornment: percentageTextField,
        inputForm: inputForm,
        formProps: { disabled: !frequencyRegulation },
        defaultValue: formValues?.reactivePowerSetpoint,
    });

    const [transientReactance, transientReactanceField] = useDoubleValue({
        label: 'TransientReactance',
        validation: {
            isFieldRequired: false,
            isFieldNumeric: true,
        },
        adornment: OhmAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.marginalCost,
    });

    const [transformerReactance, transformerReactanceField] = useDoubleValue({
        label: 'TransformerReactance',
        validation: {
            isFieldRequired: false,
            isFieldNumeric: true,
        },
        adornment: OhmAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.marginalCost,
    });

    const [marginalCost, marginalCostField] = useDoubleValue({
        label: 'MarginalCost',
        validation: {
            isFieldRequired: false,
            isFieldNumeric: true,
        },
        inputForm: inputForm,
        defaultValue: formValues?.marginalCost,
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

    useEffect(() => {
        setReactivePowerRequired(
            minimumReactivePower !== '' || maximumReactivePower !== ''
        );
    }, [minimumReactivePower, maximumReactivePower]);

    const handleSave = () => {
        if (inputForm.validate()) {
            createGenerator(
                studyUuid,
                currentNodeUuid,
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
                editData ? true : false,
                editData ? editData.uuid : undefined,
                marginalCost ? marginalCost : null,
                transientReactance ? transientReactance : null,
                transformerReactance ? transformerReactance : null,
                regulatingTerminal?.equipmentSection?.id,
                regulatingTerminal?.equipmentSection?.type,
                frequencyRegulation,
                droop,
                reactiveCapabilityCurveOn
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
                            <Box sx={{ width: '100%' }} />
                            {gridItem(reactiveCapabilityCurveField, 8)}
                            <Box sx={{ width: '100%' }} />
                            {reactiveCapabilityCurve &&
                                gridItem(minimumReactivePowerField, 4)}
                            {reactiveCapabilityCurve &&
                                gridItem(maximumReactivePowerField, 4)}
                            {!reactiveCapabilityCurve &&
                                reactiveCapabilityCurveOnField}
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
                            {gridItem(voltageRegulationField, 4)}
                            {gridItem(voltageSetpointField, 4)}
                            <Box sx={{ width: '100%' }} />
                            <Grid item xs={4} justifySelf={'end'}>
                                <FormattedMessage id="RegulatingTerminal" />
                            </Grid>
                            {gridItem(regulatingTerminalField, 8)}
                            <Box sx={{ width: '100%' }} />
                            {gridItem(frequencyRegulationField, 4)}
                            {gridItem(droopField, 4)}
                        </Grid>
                        {/*Court-circuit part*/}
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <h3 className={classes.h3}>
                                    <FormattedMessage id="CourtCircuit" />
                                </h3>
                            </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                            {gridItem(transientReactanceField, 4)}
                            {gridItem(transformerReactanceField, 4)}
                        </Grid>
                        {/* Coast of start part*/}
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <h3 className={classes.h3}>
                                    <FormattedMessage id="MarginalCost" />
                                </h3>
                            </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                            {gridItem(marginalCostField, 4)}
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
                        <FormattedMessage id="cancel" />
                    </Button>
                    <Button onClick={handleSave}>
                        <FormattedMessage id="validate" />
                    </Button>
                </DialogActions>
            </Dialog>
            <EquipmentSearchDialog
                open={searchCopy.isDialogSearchOpen}
                onClose={searchCopy.handleCloseSearchDialog}
                equipmentType={'GENERATOR'}
                onSelectionChange={searchCopy.handleSelectionChange}
                currentNodeUuid={currentNodeUuid}
            />
        </>
    );
};

GeneratorCreationDialog.propTypes = {
    editData: PropTypes.object,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    voltageLevelOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
    currentNodeUuid: PropTypes.string,
};

export default GeneratorCreationDialog;
