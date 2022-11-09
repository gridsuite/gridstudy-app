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
    useInputForm, useRadioValue,
    useRegulatingTerminalValue,
    useTextValue
} from "./inputs/input-hooks";
import { useReactiveCapabilityCurveTableValues } from "./inputs/reactive-capability-curve-table";
import {
    ActivePowerAdornment,
    filledTextField,
    gridItem, GridSection, GridSubSection,
    MVAPowerAdornment,
    OhmAdornment,
    percentageTextField,
    ReactivePowerAdornment,
    sanitizeString,
    VoltageAdornment
} from "./dialogUtils";
import EquipmentSearchDialog from './equipment-search-dialog';
import { useFormSearchCopy } from './form-search-copy-hook';
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

    const [isReactiveCapabilityCurveOn, setReactiveCapabilityCurveOn] = useState(true);

    const [rCCurveError, setRCCurveError] = useState();

    const headerIds = [
        'ActivePower',
        'MinimumReactivePower',
        'MaximumReactivePower',
    ];
    const fieldRequired = { isFieldRequired: true };

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
            stepUpTransformerReactance: generator.stepUpTransformerReactance,
            reactiveCapabilityCurvePoints:
                generator.reactiveCapabilityCurvePoints,
            minMaxReactiveLimits: generator?.minMaxReactiveLimits,
            regulatingTerminalConnectableId:
                generator.regulatingTerminalConnectableId,
            regulatingTerminalConnectableType:
                generator.regulatingTerminalConnectableType,
            regulatingTerminalVlId: generator.regulatingTerminalVlId,
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
        validation: fieldRequired,
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

    const [reactiveCapabilityCurveChoice, isReactiveCapabilityCurveOnField] = useRadioValue({
        validation: fieldRequired,
        inputForm: inputForm,
        defaultValue: formValues?.reactiveCapabilityCurve == false ? "ReactiveLimitsKindMinMax" : "ReactiveLimitsKindCurve",
        possibleValues: ["ReactiveLimitsKindMinMax", "ReactiveLimitsKindCurve"]
    });

    useEffect(() => {
        setReactiveCapabilityCurveOn(reactiveCapabilityCurveChoice === "ReactiveLimitsKindCurve");
    }, [reactiveCapabilityCurveChoice]);

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
        useReactiveCapabilityCurveTableValues({
            tableHeadersIds: headerIds,
            inputForm: inputForm,
            defaultValues: formValues?.reactiveCapabilityCurvePoints,
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
        validation: fieldRequired,
        inputForm: inputForm,
        defaultValue: formValues?.voltageRegulationOn ?? false,
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
                formValues?.regulatingTerminalConnectableType || null,
            equipmentSectionIdDefaultValue:
                formValues?.regulatingTerminalConnectableId || null,
        });

    const [frequencyRegulation, frequencyRegulationField] = useBooleanValue({
        label: 'FrequencyRegulation',
        validation: fieldRequired,
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
        connectionDirectionValue: formValues
            ? formValues.connectionDirection
            : '',
        connectionNameValue: formValues?.connectionName,
        withPosition: true,
    });

    useEffect(() => {
        setReactivePowerRequired(
            minimumReactivePower !== '' || maximumReactivePower !== ''
        );
    }, [minimumReactivePower, maximumReactivePower]);

    const handleSave = () => {
        const isRCCNotValid = isReactiveCapabilityCurveOn && reactiveCapabilityCurve.length < 2; // TODO CHARLY set la verif formulaire ici

        // TODO Jon
        // TODO Jon
        // TODO Jon
        // Au final, la solution qui fonctionne sur laquelle je me base aujourd'hui,
        // c'est d'implémenter les tests ici.
        // Plus tard, je regarderai pour injecter les résultats de ces tests ici, à l'intérieur
        // du composant du tableau, pour afficher aux bon endroits les bonnes erreures.
        setRCCurveError(
            isRCCNotValid ? 'ReactiveCapabilityCurveCreationError' : null
        );

        if (inputForm.validate() && !isRCCNotValid) {
            createGenerator(
                studyUuid,
                currentNodeUuid,
                generatorId,
                sanitizeString(generatorName),
                !energySource ? 'OTHER' : energySource,
                minimumActivePower,
                maximumActivePower,
                ratedNominalPower ? ratedNominalPower : null,
                activePowerSetpoint,
                reactivePowerSetpoint ?? null,
                voltageRegulation,
                voltageSetpoint ? voltageSetpoint : null,
                connectivity.voltageLevel.id,
                connectivity.busOrBusbarSection.id,
                editData ? true : false,
                editData?.uuid,
                marginalCost ? marginalCost : null,
                transientReactance ? transientReactance : null,
                transformerReactance ? transformerReactance : null,
                (voltageRegulation &&
                    regulatingTerminal?.equipmentSection?.id) ||
                    null,
                (voltageRegulation &&
                    regulatingTerminal?.equipmentSection?.type) ||
                    null,
                (voltageRegulation && regulatingTerminal?.voltageLevel?.id) ||
                    null,
                isReactiveCapabilityCurveOn,
                frequencyRegulation,
                frequencyRegulation ? droop : null,
                isReactiveCapabilityCurveOn ? null : maximumReactivePower,
                isReactiveCapabilityCurveOn ? null : minimumReactivePower,
                isReactiveCapabilityCurveOn ? reactiveCapabilityCurve : null,
                connectivity?.connectionDirection?.id ?? 'UNDEFINED',
                connectivity?.connectionName?.id ?? null
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

                        {/* Connectivity part */}
                        <GridSection title="Connectivity" />
                        <Grid container spacing={2}>
                            {gridItem(connectivityField, 8)}
                        </Grid>

                        {/* Limits part */}
                        <GridSection title="Limits" />
                        <GridSubSection title="ActiveLimits" />
                        <Grid container spacing={2}>
                            {gridItem(minimumActivePowerField, 4)}
                            {gridItem(maximumActivePowerField, 4)}
                            {gridItem(ratedNominalPowerField, 4)}
                        </Grid>
                        <GridSubSection title="ReactiveLimits" />
                        <Grid container spacing={2}>

                            {gridItem(isReactiveCapabilityCurveOnField, 12)}

                            {rCCurveError && (
                                <div className={classes.rccError}>
                                    <FormattedMessage id="ReactiveCapabilityCurveCreationError" />
                                </div>
                            )}

                            {!isReactiveCapabilityCurveOn && gridItem(minimumReactivePowerField, 4)}
                            {!isReactiveCapabilityCurveOn && gridItem(maximumReactivePowerField, 4)}
                            {!!isReactiveCapabilityCurveOn && gridItem(reactiveCapabilityCurveField, 12)}
                        </Grid>

                        {/* Setpoints part */}
                        <GridSection title="Setpoints" />
                        <Grid container spacing={2}>
                            {gridItem(activePowerSetpointField, 4)}
                            {gridItem(reactivePowerSetpointField, 4)}

                            {gridItem(voltageRegulationField, 4)}
                            {gridItem(voltageSetpointField, 4)}

                            <Grid item xs={4} justifySelf={'end'}>
                                <FormattedMessage id="RegulatingTerminalGenerator" />
                            </Grid>
                            {gridItem(regulatingTerminalField, 8)}

                            {gridItem(frequencyRegulationField, 4)}
                            {gridItem(droopField, 4)}
                        </Grid>

                        {/* Short-circuit part */}
                        <GridSection title="ShortCircuit" />
                        <Grid container spacing={2}>
                            {gridItem(transientReactanceField, 4)}
                            {gridItem(transformerReactanceField, 4)}
                        </Grid>

                        {/* Cost of start part */}
                        <GridSection title="MarginalCost" />
                        <Grid container spacing={2}>
                            {gridItem(marginalCostField, 4)}
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
