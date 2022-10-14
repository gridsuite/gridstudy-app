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
import {
    useButtonWithTooltip,
    useDoubleValue,
    useEnumValue,
    useInputForm,
    useRegulatingTerminalValue,
    useTableValues,
    useTextValue,
} from './inputs/input-hooks';
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
import { useConnectivityValue } from './connectivity-edition';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
    helperText: {
        margin: 0,
        marginTop: 4,
    },

    rccError: {
        color: theme.palette.error.main,
        fontSize: 'small',
        textAlign: 'center',
        margin: theme.spacing(2),
    },
}));

const RCCurve = ({
    index,
    onChange,
    defaultValue,
    inputForm,
    isFieldRequired,
}) => {
    const [p, pField] = useDoubleValue({
        label: 'P',
        id: 'P' + index,
        validation: { isFieldRequired: isFieldRequired },
        adornment: ActivePowerAdornment,
        inputForm: inputForm,
        defaultValue: defaultValue?.p || '',
    });
    const [qminP, qminPField] = useDoubleValue({
        label: 'QminP',
        id: 'QminP' + index,
        validation: { isFieldRequired: isFieldRequired },
        adornment: ReactivePowerAdornment,
        inputForm: inputForm,
        defaultValue: defaultValue?.qminP || '',
    });

    const [qmaxP, qmaxPField] = useDoubleValue({
        label: 'QmaxP',
        id: 'QmaxP' + index,
        validation: { isFieldRequired: isFieldRequired },
        adornment: ReactivePowerAdornment,
        inputForm: inputForm,
        defaultValue: defaultValue?.qmaxP || '',
    });

    useEffect(() => {
        onChange(index, { p: p, qminP: qminP, qmaxP: qmaxP });
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

    const [btnSaveListDisabled, setBtnSaveListDisabled] = useState(true);

    const [rCCurveError, setRCCurveError] = useState();

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
            participate: generator.frequencyRegulation,
            droop: generator.droop,
            transientReactance: generator.transientReactance,
            transformerReactance: generator.transformerReactance,
            reactiveCapabilityCurvePt: generator.reactiveCapabilityCurvePt,
            minimumReactivePower: generator.minimumReactivePower,
            maximumReactivePower: generator.minimumReactivePower,
            regulatingTerminal: generator.regulatingTerminal,
        };
    };

    const equipmentPath = 'generators';

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

    const [isReactiveCapabilityCurveOn, isReactiveCapabilityCurveOnField] =
        useBooleanValue({
            label: 'ReactiveCapabilityCurve',
            validation: { isFieldRequired: true },
            inputForm: inputForm,
            defaultValue: formValues?.reactiveCapabilityCurve ?? true,
        });

    const [minimumReactivePower, minimumReactivePowerField] = useDoubleValue({
        label: 'MinimumReactivePower',
        validation: { isFieldRequired: reactivePowerRequired },
        adornment: ReactivePowerAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.minimumReactivePower,
    });

    const [maximumReactivePower, maximumReactivePowerField] = useDoubleValue({
        label: 'MaximumReactivePower',
        validation: { isFieldRequired: reactivePowerRequired },
        adornment: ReactivePowerAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.maximumReactivePower,
    });

    const [reactiveCapabilityCurve, reactiveCapabilityCurveField] =
        useTableValues({
            id: 'ReactiveCapabilityCurveOn',
            tableHeadersIds: [
                'ActivePower',
                'MinimumReactivePower',
                'MaximumReactivePower',
            ],
            inputForm: inputForm,
            Field: RCCurve,
            defaultValues: formValues?.points,
            isRequired: false,
            isReactiveCapabilityCurveOn: isReactiveCapabilityCurveOn,
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

    const [regulatingTerminal, regulatingTerminalField] =
        useRegulatingTerminalValue({
            label: 'RegulatingTerminalGenerator',
            inputForm: inputForm,
            disabled: !voltageRegulation,
            voltageLevelOptionsPromise: voltageLevelsEquipmentsOptionsPromise,
            voltageLevelIdDefaultValue:
                formValues?.regulatingTerminalVlId || null,
            equipmentSectionTypeDefaultValue:
                formValues?.regulatingTerminalType || null,
            equipmentSectionIdDefaultValue:
                formValues?.regulatingTerminalId || null,
        });

    const [frequencyRegulation, frequencyRegulationField] = useBooleanValue({
        label: 'FrequencyRegulation',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        defaultValue: formValues?.participate ?? false,
    });

    const [droop, droopField] = useDoubleValue({
        label: 'Droop',
        validation: { isFieldRequired: frequencyRegulation },
        adornment: percentageTextField,
        inputForm: inputForm,
        formProps: { disabled: !frequencyRegulation },
        defaultValue: formValues?.droop,
    });

    const [transientReactance, transientReactanceField] = useDoubleValue({
        label: 'TransientReactance',
        validation: { isFieldRequired: false },
        adornment: OhmAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.transientReactance,
    });

    const [transformerReactance, transformerReactanceField] = useDoubleValue({
        label: 'TransformerReactance',
        validation: { isFieldRequired: false },
        adornment: OhmAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.stepUpTransformerReactance,
    });

    const [marginalCost, marginalCostField] = useDoubleValue({
        label: 'MarginalCost',
        validation: { isFieldRequired: false },
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

    function isEmpty(value) {
        return value === '';
    }

    useEffect(() => {
        if (
            formValues?.reactiveCapabilityCurve === false &&
            reactiveCapabilityCurve.length === 1
        ) {
            setBtnSaveListDisabled(false);
        } else {
            setBtnSaveListDisabled(true);
        }
    }, [formValues, reactiveCapabilityCurve]);

    useEffect(() => {
        if (
            generatorId !== formValues?.equipmentId ||
            (isEmpty(generatorName) &&
                formValues?.equipmentName !== undefined) ||
            generatorName !== formValues?.equipmentName ||
            energySource !== formValues?.energySource ||
            (minimumActivePower !== formValues?.minActivePower &&
                minimumActivePower !== String(formValues?.maxActivePower)) ||
            (maximumActivePower !== formValues?.maxActivePower &&
                maximumActivePower !== String(formValues?.maxActivePower)) ||
            (ratedNominalPower !== formValues?.ratedNominalPower &&
                ratedNominalPower !== String(formValues?.ratedNominalPower)) ||
            (minimumReactivePower !== formValues?.minimumReactivePower &&
                minimumReactivePower !==
                    String(formValues?.minimumReactivePower)) ||
            (maximumReactivePower !== formValues?.maximumReactivePower &&
                maximumReactivePower !==
                    String(formValues?.maximumReactivePower)) ||
            (activePowerSetpoint !== formValues?.activePowerSetpoint &&
                activePowerSetpoint !==
                    String(formValues?.activePowerSetpoint)) ||
            voltageRegulation !== formValues?.voltageRegulationOn ||
            frequencyRegulation !== formValues?.participate ||
            transformerReactance !== formValues?.stepUpTransformerReactance ||
            transientReactance !== formValues?.transientReactance ||
            (formValues?.marginalCost === undefined &&
                !isEmpty(marginalCost)) ||
            marginalCost !== formValues?.marginalCost ||
            connectivity?.voltageLevel?.name !== formValues?.voltageLevelId ||
            connectivity?.busOrBusbarSection?.id !==
                formValues?.busOrBusbarSectionId
        ) {
            setBtnSaveListDisabled(false);
        } else {
            setBtnSaveListDisabled(true);
        }
    }, [
        formValues,
        generatorId,
        generatorName,
        energySource,
        minimumActivePower,
        maximumActivePower,
        ratedNominalPower,
        minimumReactivePower,
        activePowerSetpoint,
        maximumReactivePower,
        voltageRegulation,
        regulatingTerminal,
        frequencyRegulation,
        transformerReactance,
        transientReactance,
        marginalCost,
        connectivity,
    ]);

    const handleSave = () => {
        const isRCCNotValid =
            isReactiveCapabilityCurveOn && reactiveCapabilityCurve.length < 2;
        setRCCurveError(
            isRCCNotValid ? 'ReactiveCapabilityCurveCreationError' : null
        );

        if (inputForm.validate() && !isRCCNotValid) {
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
                editData?.uuid,
                marginalCost ? marginalCost : null,
                transientReactance ? transientReactance : null,
                transformerReactance ? transformerReactance : null,
                voltageRegulation
                    ? regulatingTerminal?.equipmentSection?.id
                    : null,
                voltageRegulation
                    ? regulatingTerminal?.equipmentSection?.type
                    : null,
                voltageRegulation ? regulatingTerminal?.voltageLevel.id : null,
                isReactiveCapabilityCurveOn,
                frequencyRegulation,
                frequencyRegulation ? droop : null,
                isReactiveCapabilityCurveOn ? null : maximumReactivePower,
                isReactiveCapabilityCurveOn ? null : minimumReactivePower,
                isReactiveCapabilityCurveOn ? reactiveCapabilityCurve : null
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
        setFormValues(null);
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
                            {gridItem(isReactiveCapabilityCurveOnField, 8)}
                            <Box sx={{ width: '100%' }} />
                            {rCCurveError && (
                                <div className={classes.rccError}>
                                    <FormattedMessage id="ReactiveCapabilityCurveCreationError" />
                                </div>
                            )}
                            <Box sx={{ width: '100%' }} />
                            {!isReactiveCapabilityCurveOn &&
                                gridItem(minimumReactivePowerField, 4)}
                            {!isReactiveCapabilityCurveOn &&
                                gridItem(maximumReactivePowerField, 4)}
                            {isReactiveCapabilityCurveOn &&
                                reactiveCapabilityCurveField}
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
                    <Button onClick={handleSave} disabled={btnSaveListDisabled}>
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
