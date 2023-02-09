/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import ModificationDialog from './modificationDialog';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { createGenerator } from '../../utils/rest-api';
import { useSnackMessage } from '@gridsuite/commons-ui';
import {
    useDoubleValue,
    useEnumValue,
    useInputForm,
    useRadioValue,
    useRegulatingTerminalValue,
    useTextValue,
} from './inputs/input-hooks';
import { useReactiveCapabilityCurveTableValues } from './inputs/reactive-capability-curve-table';
import {
    ActivePowerAdornment,
    filledTextField,
    gridItem,
    GridSection,
    MVAPowerAdornment,
    OhmAdornment,
    percentageTextField,
    ReactivePowerAdornment,
    sanitizeString,
    VoltageAdornment,
} from './dialogUtils';
import EquipmentSearchDialog from './equipment-search-dialog';
import { useFormSearchCopy } from './form-search-copy-hook';
import { Box } from '@mui/system';
import {
    ENERGY_SOURCES,
    REACTIVE_LIMIT_TYPES,
    REGULATION_TYPES,
    UNDEFINED_CONNECTION_DIRECTION,
} from '../network/constants';
import { useBooleanValue } from './inputs/boolean';
import { useConnectivityValue } from './connectivity-edition';
import makeStyles from '@mui/styles/makeStyles';
import { ReactiveCapabilityCurveReactiveRange } from './reactive-capability-curve-reactive-range';
import { checkReactiveCapabilityCurve } from '../util/validation-functions';
import {
    REGULATING_EQUIPMENT,
    REGULATING_VOLTAGE_LEVEL,
} from './regulating-terminal-edition';

const useStyles = makeStyles((theme) => ({
    helperText: {
        margin: 0,
        marginTop: 4,
    },

    midFormErrorMessage: {
        color: theme.palette.error.main,
        fontSize: 'small',
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
    },
}));

/**
 * Dialog to create a generator in the network
 * @param voltageLevelOptionsPromise Promise handling list of voltage level options
 * @param voltageLevelsEquipmentsOptionsPromise Promise handling list of voltage level equipment options
 * @param currentNodeUuid the currently selected tree node
 * @param editData the data to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const GeneratorCreationDialog = ({
    voltageLevelOptionsPromise,
    voltageLevelsEquipmentsOptionsPromise,
    currentNodeUuid,
    editData,
    ...dialogProps
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const classes = useStyles();

    const { snackError } = useSnackMessage();

    const inputForm = useInputForm();

    const [formValues, setFormValues] = useState(undefined);

    const [reactivePowerRequired, setReactivePowerRequired] = useState(false);

    const [reactiveCapabilityCurveErrors, setReactiveCapabilityCurveErrors] =
        useState([]);

    const headerIds = [
        'ActivePowerText',
        'MinimumReactivePower',
        'MaximumReactivePower',
    ];

    const isDistantRegulation = (regulationType) => {
        return regulationType === REGULATION_TYPES.DISTANT.id;
    };

    const toFormValues = (generator) => {
        return {
            id: generator.id + '(1)',
            name: generator.name ?? '',
            energySource: generator.energySource,
            maxActivePower: generator.maxP,
            minActivePower: generator.minP,
            ratedNominalPower: generator.ratedS,
            activePowerSetpoint: generator.targetP,
            voltageRegulationOn: generator.voltageRegulatorOn,
            voltageSetpoint: generator.targetV,
            reactivePowerSetpoint: generator.targetQ,
            voltageLevelId: generator.voltageLevelId,
            busOrBusbarSectionId: null,
            plannedActivePowerSetPoint: generator.plannedActivePowerSetPoint,
            startupCost: generator.startupCost,
            marginalCost: generator.marginalCost,
            plannedOutageRate: generator.plannedOutageRate,
            forcedOutageRate: generator.forcedOutageRate,
            participate: generator.activePowerControlOn,
            droop: generator.droop,
            transientReactance: generator.transientReactance,
            stepUpTransformerReactance: generator.stepUpTransformerReactance,
            reactiveCapabilityCurvePoints:
                generator.reactiveCapabilityCurvePoints,
            minMaxReactiveLimits: generator.minMaxReactiveLimits,
            reactiveCapabilityCurve:
                generator.minMaxReactiveLimits === undefined, // We have to check if this field is present to determine if we are in reactive curve mode or not.
            minimumReactivePower:
                generator?.minMaxReactiveLimits?.minimumReactivePower,
            maximumReactivePower:
                generator?.minMaxReactiveLimits?.maximumReactivePower,
            regulatingTerminalConnectableId:
                generator.regulatingTerminalConnectableId ||
                generator.regulatingTerminalId,
            regulatingTerminalConnectableType:
                generator.regulatingTerminalConnectableType,
            regulatingTerminalVlId: generator.regulatingTerminalVlId,
            qPercent: generator.qPercent,
            connectionDirection: generator.connectionDirection,
            connectionName: generator.connectionName,
            connectionPosition: generator.connectionPosition,
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
        defaultValue: formValues?.id,
    });

    const [generatorName, generatorNameField] = useTextValue({
        label: 'Name',
        validation: { isFieldRequired: false },
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: formValues?.name,
    });

    const [energySource, energySourceField] = useEnumValue({
        label: 'EnergySourceText',
        inputForm: inputForm,
        formProps: filledTextField,
        enumValues: ENERGY_SOURCES,
        validation: {
            isFieldRequired: true,
        },
        defaultValue: formValues?.energySource ?? 'OTHER',
    });

    const [maximumActivePower, maximumActivePowerField] = useDoubleValue({
        label: 'MaximumActivePowerText',
        validation: {
            isFieldRequired: true,
        },
        adornment: ActivePowerAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.maxActivePower,
    });

    const [minimumActivePower, minimumActivePowerField] = useDoubleValue({
        label: 'MinimumActivePowerText',
        validation: {
            isFieldRequired: true,
            valueLessThanOrEqualTo: maximumActivePower,
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
            valueGreaterThan: '0',
            errorMsgId: 'RatedNominalPowerGreaterThanZero',
        },
        adornment: MVAPowerAdornment,
        inputForm: inputForm,
        defaultValue: formValues?.ratedNominalPower,
    });

    const [
        reactiveCapabilityCurveChoice,
        reactiveCapabilityCurveChoiceRadioButton,
    ] = useRadioValue({
        inputForm: inputForm,
        defaultValue:
            formValues?.reactiveCapabilityCurve === false ? 'MINMAX' : 'CURVE',
        possibleValues: REACTIVE_LIMIT_TYPES,
    });

    const isReactiveCapabilityCurveOn = useCallback(() => {
        return reactiveCapabilityCurveChoice === 'CURVE';
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
            Field: ReactiveCapabilityCurveReactiveRange,
            defaultValues: formValues?.reactiveCapabilityCurvePoints,
            isReactiveCapabilityCurveOn: isReactiveCapabilityCurveOn(),
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
        defaultValue: formValues?.voltageRegulationOn ?? false,
    });

    const [voltageSetpoint, voltageSetpointField] = useDoubleValue({
        label: 'VoltageText',
        validation: {
            isFieldRequired: voltageRegulation,
            valueGreaterThan: '0',
            errorMsgId: 'VoltageGreaterThanZero',
        },
        adornment: VoltageAdornment,
        inputForm: inputForm,
        formProps: { disabled: !voltageRegulation },
        defaultValue: formValues?.voltageSetpoint,
    });

    const [reactivePowerSetpoint, reactivePowerSetpointField] = useDoubleValue({
        label: 'ReactivePowerText',
        validation: {
            isFieldRequired: !voltageRegulation,
        },
        adornment: ReactivePowerAdornment,
        inputForm: inputForm,
        formProps: { disabled: voltageRegulation },
        defaultValue: formValues?.reactivePowerSetpoint,
    });

    const [voltageRegulationType, voltageRegulationTypeField] = useEnumValue({
        label: 'RegulationTypeText',
        inputForm: inputForm,
        enumValues: Object.values(REGULATION_TYPES),
        validation: {
            isFieldRequired: voltageRegulation,
        },
        defaultValue:
            formValues?.regulatingTerminalId ||
            formValues?.regulatingTerminalConnectableId
                ? REGULATION_TYPES.DISTANT.id
                : REGULATION_TYPES.LOCAL.id,
    });

    const [qPercent, qPercentField] = useDoubleValue({
        label: 'QPercentText',
        validation: {
            isFieldRequired: false,
            valueGreaterThanOrEqualTo: '0',
            valueLessThanOrEqualTo: '100',
            errorMsgId: 'NormalizedPercentage',
        },
        adornment: percentageTextField,
        inputForm: inputForm,
        defaultValue: formValues?.qPercent,
    });

    const [regulatingTerminal, regulatingTerminalField] =
        useRegulatingTerminalValue({
            label: 'RegulatingTerminalGenerator',
            validation: {
                isFieldRequired:
                    voltageRegulation &&
                    isDistantRegulation(voltageRegulationType),
            },
            inputForm: inputForm,
            disabled:
                !voltageRegulation ||
                !isDistantRegulation(voltageRegulationType),
            voltageLevelOptionsPromise: voltageLevelsEquipmentsOptionsPromise,
            voltageLevelIdDefaultValue:
                formValues?.regulatingTerminalVlId || null,
            equipmentSectionTypeDefaultValue:
                formValues?.regulatingTerminalConnectableType ||
                formValues?.regulatingTerminalType ||
                null,
            equipmentSectionIdDefaultValue:
                formValues?.regulatingTerminalConnectableId ||
                formValues?.regulatingTerminalId ||
                null,
        });

    const removeUnnecessaryFieldsValidation = useCallback(() => {
        if (!voltageRegulation || !isDistantRegulation(voltageRegulationType)) {
            inputForm.removeValidation(REGULATING_VOLTAGE_LEVEL);
            inputForm.removeValidation(REGULATING_EQUIPMENT);
            inputForm.removeValidation('QPercentText');
        }
        if (isReactiveCapabilityCurveOn()) {
            inputForm.removeValidation('MinimumReactivePower');
            inputForm.removeValidation('MaximumReactivePower');
        }
    }, [
        voltageRegulation,
        voltageRegulationType,
        inputForm,
        isReactiveCapabilityCurveOn,
    ]);

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

    const [plannedActivePowerSetPoint, plannedActivePowerSetPointField] =
        useDoubleValue({
            label: 'PlannedActivePowerSetPoint',
            validation: { isFieldRequired: false },
            adornment: ActivePowerAdornment,
            inputForm: inputForm,
            defaultValue: formValues?.plannedActivePowerSetPoint,
        });

    const [startupCost, startupCostField] = useDoubleValue({
        label: 'StartupCost',
        validation: { isFieldRequired: false },
        inputForm: inputForm,
        defaultValue: formValues?.startupCost,
    });

    const [marginalCost, marginalCostField] = useDoubleValue({
        label: 'MarginalCost',
        validation: { isFieldRequired: false },
        inputForm: inputForm,
        defaultValue: formValues?.marginalCost,
    });

    const [plannedOutageRate, plannedOutageRateField] = useDoubleValue({
        label: 'PlannedOutageRate',
        validation: {
            isFieldRequired: false,
            valueGreaterThanOrEqualTo: '0',
            valueLessThanOrEqualTo: '1',
            errorMsgId: 'RealPercentage',
        },
        inputForm: inputForm,
        defaultValue: formValues?.plannedOutageRate,
    });

    const [forcedOutageRate, forcedOutageRateField] = useDoubleValue({
        label: 'ForcedOutageRate',
        validation: {
            isFieldRequired: false,
            valueGreaterThanOrEqualTo: '0',
            valueLessThanOrEqualTo: '1',
            errorMsgId: 'RealPercentage',
        },
        inputForm: inputForm,
        defaultValue: formValues?.forcedOutageRate,
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
        connectionPositionValue: formValues?.connectionPosition,
        withPosition: true,
    });

    useEffect(() => {
        setReactivePowerRequired(
            minimumReactivePower !== '' || maximumReactivePower !== ''
        );
    }, [minimumReactivePower, maximumReactivePower]);

    const handleValidation = () => {
        // ReactiveCapabilityCurveCreation validation
        let isReactiveCapabilityCurveValid = true;
        if (isReactiveCapabilityCurveOn()) {
            const errorMessages = checkReactiveCapabilityCurve(
                reactiveCapabilityCurve
            );
            isReactiveCapabilityCurveValid = errorMessages.length === 0;
            setReactiveCapabilityCurveErrors(errorMessages);
        } else {
            setReactiveCapabilityCurveErrors([]);
        }
        removeUnnecessaryFieldsValidation();
        return (
            inputForm.validate() &&
            (!isReactiveCapabilityCurveOn() || isReactiveCapabilityCurveValid)
        );
    };

    const handleSave = () => {
        createGenerator(
            studyUuid,
            currentNodeUuid,
            generatorId,
            sanitizeString(generatorName),
            energySource,
            minimumActivePower,
            maximumActivePower,
            ratedNominalPower ? ratedNominalPower : null,
            activePowerSetpoint,
            reactivePowerSetpoint ?? null,
            voltageRegulation,
            voltageSetpoint ? voltageSetpoint : null,
            qPercent,
            connectivity.voltageLevel.id,
            connectivity.busOrBusbarSection.id,
            editData ? true : false,
            editData?.uuid,
            plannedActivePowerSetPoint ?? null,
            startupCost ?? null,
            marginalCost ?? null,
            plannedOutageRate ?? null,
            forcedOutageRate ?? null,
            transientReactance ? transientReactance : null,
            transformerReactance ? transformerReactance : null,
            (voltageRegulation &&
                isDistantRegulation(voltageRegulationType) &&
                regulatingTerminal?.equipmentSection?.id) ||
                null,
            (voltageRegulation &&
                isDistantRegulation(voltageRegulationType) &&
                regulatingTerminal?.equipmentSection?.type) ||
                null,
            (voltageRegulation &&
                isDistantRegulation(voltageRegulationType) &&
                regulatingTerminal?.voltageLevel?.id) ||
                null,
            isReactiveCapabilityCurveOn(),
            frequencyRegulation,
            frequencyRegulation ? droop : null,
            isReactiveCapabilityCurveOn() ? null : maximumReactivePower,
            isReactiveCapabilityCurveOn() ? null : minimumReactivePower,
            isReactiveCapabilityCurveOn() ? reactiveCapabilityCurve : null,
            connectivity?.connectionDirection?.id ??
                UNDEFINED_CONNECTION_DIRECTION,
            connectivity?.connectionName?.id ?? null,
            connectivity?.connectionPosition?.id ?? null
        ).catch((error) => {
            snackError({
                messageTxt: error.message,
                headerId: 'GeneratorCreationError',
            });
        });
    };

    const clear = () => {
        inputForm.reset();
        setFormValues(null);
    };

    const withVoltageRegulationInputs = () => {
        return (
            <>
                {gridItem(voltageRegulationTypeField, 4)}
                <Box sx={{ width: '100%' }} />
                <Grid item xs={4} justifySelf={'end'} />
                {gridItem(voltageSetpointField, 4)}
                <Box sx={{ width: '100%' }} />
                {voltageRegulation &&
                    isDistantRegulation(voltageRegulationType) && (
                        <>
                            <Grid item xs={4} justifySelf={'end'}>
                                <FormattedMessage id="RegulatingTerminalGenerator" />
                            </Grid>
                            {gridItem(regulatingTerminalField, 8)}
                            <Grid item xs={4} justifySelf={'end'} />
                            {gridItem(qPercentField, 4)}
                        </>
                    )}
            </>
        );
    };

    return (
        <ModificationDialog
            fullWidth
            maxWidth="md" // 3 columns
            onClear={clear}
            onValidation={handleValidation}
            onSave={handleSave}
            disabledSave={!inputForm.hasChanged}
            aria-labelledby="dialog-create-generator"
            titleId={'CreateGenerator'}
            searchCopy={searchCopy}
            {...dialogProps}
        >
            <div>
                <Grid container spacing={2}>
                    {gridItem(generatorIdField, 4)}
                    {gridItem(generatorNameField, 4)}
                    {gridItem(energySourceField, 4)}
                </Grid>

                {/* Connectivity part */}
                <GridSection title="Connectivity" />
                <Grid container spacing={2}>
                    {gridItem(connectivityField, 12)}
                </Grid>

                {/* Limits part */}
                <GridSection title="ActiveLimits" />
                <Grid container spacing={2}>
                    {gridItem(minimumActivePowerField, 4)}
                    {gridItem(maximumActivePowerField, 4)}
                    {gridItem(ratedNominalPowerField, 4)}
                </Grid>
                <GridSection title="ReactiveLimits" />
                <Grid container spacing={2}>
                    {gridItem(reactiveCapabilityCurveChoiceRadioButton, 12)}
                    {!isReactiveCapabilityCurveOn() &&
                        gridItem(minimumReactivePowerField, 4)}
                    {!isReactiveCapabilityCurveOn() &&
                        gridItem(maximumReactivePowerField, 4)}

                    {isReactiveCapabilityCurveOn() &&
                        reactiveCapabilityCurveErrors.length > 0 && (
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    {reactiveCapabilityCurveErrors.map(
                                        (messageDescriptorId) => (
                                            <div
                                                key={messageDescriptorId}
                                                className={
                                                    classes.midFormErrorMessage
                                                }
                                            >
                                                <FormattedMessage
                                                    id={messageDescriptorId}
                                                />
                                            </div>
                                        )
                                    )}
                                </Grid>
                            </Grid>
                        )}
                    {isReactiveCapabilityCurveOn() &&
                        gridItem(reactiveCapabilityCurveField, 12)}
                </Grid>

                {/* Setpoints part */}
                <GridSection title="Setpoints" />
                <Grid container spacing={2}>
                    {gridItem(activePowerSetpointField, 4)}
                    <Box sx={{ width: '100%' }} />

                    {gridItem(voltageRegulationField, 4)}
                    {voltageRegulation
                        ? withVoltageRegulationInputs()
                        : gridItem(reactivePowerSetpointField, 4)}
                    <Box sx={{ width: '100%' }} />
                    {gridItem(frequencyRegulationField, 4)}
                    {frequencyRegulation && gridItem(droopField, 4)}
                </Grid>

                {/* Short-circuit part */}
                <GridSection title="ShortCircuit" />
                <Grid container spacing={2}>
                    {gridItem(transientReactanceField, 4)}
                    {gridItem(transformerReactanceField, 4)}
                </Grid>

                {/* Cost of start part */}
                <GridSection title="Startup" />
                <Grid container spacing={2}>
                    {gridItem(plannedActivePowerSetPointField, 4)}
                    <Grid container item spacing={2}>
                        {gridItem(startupCostField, 4)}
                        {gridItem(marginalCostField, 4)}
                    </Grid>
                    <Grid container item spacing={2}>
                        {gridItem(plannedOutageRateField, 4)}
                        {gridItem(forcedOutageRateField, 4)}
                    </Grid>
                </Grid>
            </div>
            <EquipmentSearchDialog
                open={searchCopy.isDialogSearchOpen}
                onClose={searchCopy.handleCloseSearchDialog}
                equipmentType={'GENERATOR'}
                onSelectionChange={searchCopy.handleSelectionChange}
                currentNodeUuid={currentNodeUuid}
            />
        </ModificationDialog>
    );
};

GeneratorCreationDialog.propTypes = {
    editData: PropTypes.object,
    voltageLevelOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
    voltageLevelsEquipmentsOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
    currentNodeUuid: PropTypes.string,
};

export default GeneratorCreationDialog;
