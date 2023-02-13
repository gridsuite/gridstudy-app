/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import ModificationDialog from './modificationDialog';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { useSnackMessage } from '@gridsuite/commons-ui';
import makeStyles from '@mui/styles/makeStyles';
import {
    useDoubleValue,
    useOptionalEnumValue,
    useInputForm,
    useTextValue,
    useRadioValue,
    useRegulatingTerminalValue,
} from './inputs/input-hooks';
import {
    ActivePowerAdornment,
    filledTextField,
    getIdOrSelf,
    gridItem,
    gridItemWithTooltip,
    MVAPowerAdornment,
    ReactivePowerAdornment,
    sanitizeString,
    VoltageAdornment,
    GridSection,
    percentageTextField,
    OhmAdornment,
} from './dialogUtils';
import { Box } from '@mui/system';
import {
    ENERGY_SOURCES,
    getEnergySourceLabel,
    REACTIVE_LIMIT_TYPES,
    REGULATION_TYPES,
} from '../network/constants';
import {
    REGULATING_EQUIPMENT,
    REGULATING_VOLTAGE_LEVEL,
} from './regulating-terminal-edition';
import { useNullableBooleanValue } from './inputs/boolean';
import {
    fetchEquipmentInfos,
    fetchEquipmentsIds,
    modifyGenerator,
} from 'utils/rest-api';
import { useAutocompleteField } from './inputs/use-autocomplete-field';
import { useReactiveCapabilityCurveTableValues } from './inputs/reactive-capability-curve-table';
import {
    checkReactiveCapabilityCurve,
    validateValueIsGreaterThan,
} from '../util/validation-functions';

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

function getValue(val) {
    return val ? val.value : undefined;
}

function getValueOrNull(val) {
    return val ? val.value : null;
}

/**
 * Dialog to create a generator in the network
 * @param currentNodeUuid the currently selected tree node
 * @param equipmentOptionsPromise Promise handling list of generator options
 * @param editData the data to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const GeneratorModificationDialog = ({
    editData,
    currentNodeUuid,
    voltageLevelsIdsAndTopologyPromise,
    ...dialogProps
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const intl = useIntl();

    const classes = useStyles();

    const { snackError } = useSnackMessage();

    const inputForm = useInputForm();

    const [formValues, setFormValues] = useState({});

    const [equipmentOptions, setEquipmentOptions] = useState([]);

    const [isRegulatingTerminalRequired, setIsRegulatingTerminalRequired] =
        useState(false);

    const [reactiveCapabilityCurveErrors, setReactiveCapabilityCurveErrors] =
        useState([]);

    const [reactivePowerRequired, setReactivePowerRequired] = useState(false);

    const isActualRegulationDistant = (regulationType) => {
        return regulationType === REGULATION_TYPES.DISTANT.id;
    };

    const [generatorInfo, setGeneratorInfo] = useState();

    const defaultReactiveCapabilityCurveChoice = () => {
        const reactiveCapabilityChoice = getValueOrNull(
            formValues?.reactiveCapabilityCurve
        );
        if (reactiveCapabilityChoice !== null) {
            return reactiveCapabilityChoice ? 'CURVE' : 'MINMAX';
        } else if (generatorInfo?.minMaxReactiveLimits !== undefined) {
            return 'MINMAX';
        }
        return 'CURVE';
    };

    const [loadingEquipmentOptions, setLoadingEquipmentOptions] =
        useState(true);

    useEffect(() => {
        fetchEquipmentsIds(
            studyUuid,
            currentNodeUuid,
            undefined,
            'GENERATOR',
            true
        ).then((values) => {
            setEquipmentOptions(values);
            setLoadingEquipmentOptions(false);
        });
    }, [studyUuid, currentNodeUuid]);

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

    const [generatorId, generatorIdField] = useAutocompleteField({
        label: 'ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
        values: equipmentOptions?.sort((a, b) => a.localeCompare(b)),
        allowNewValue: true,
        getLabel: getIdOrSelf,
        defaultValue:
            equipmentOptions?.find((e) => e === formValueEquipmentId?.id) ||
            formValueEquipmentId,
        loading: loadingEquipmentOptions,
    });

    const id = useMemo(() => {
        let id;
        if (typeof generatorId === 'object') {
            if (generatorId?.id !== '') {
                id = generatorId?.id;
            }
        } else {
            if (generatorId !== '') {
                id = generatorId;
            }
        }
        return id ?? formValueEquipmentId?.id;
    }, [generatorId, formValueEquipmentId]);

    useEffect(() => {
        if (id) {
            fetchEquipmentInfos(
                studyUuid,
                currentNodeUuid,
                'generators',
                id,
                false
            ).then((value) => {
                if (value) {
                    setGeneratorInfo(value);
                }
            });
        } else {
            setGeneratorInfo(null);
        }
    }, [studyUuid, currentNodeUuid, id]);

    const [generatorName, generatorNameField] = useTextValue({
        label: 'Name',
        inputForm: inputForm,
        formProps: filledTextField,
        defaultValue: getValue(formValues?.equipmentName) || undefined,
        previousValue: generatorInfo?.name,
        clearable: true,
    });

    const energySourceLabelId = getEnergySourceLabel(
        generatorInfo?.energySource
    );
    const previousEnergySourceLabel = energySourceLabelId
        ? intl.formatMessage({
              id: energySourceLabelId,
          })
        : undefined;

    const [energySource, energySourceField] = useOptionalEnumValue({
        label: 'EnergySourceText',
        inputForm: inputForm,
        formProps: filledTextField,
        enumObjects: ENERGY_SOURCES,
        defaultValue: formValues?.energySource?.value ?? null,
        previousValue: previousEnergySourceLabel,
    });

    const [maximumActivePower, maximumActivePowerField] = useDoubleValue({
        label: 'MaximumActivePowerText',
        validation: {
            isFieldNumeric: true,
        },
        adornment: ActivePowerAdornment,
        inputForm: inputForm,
        defaultValue: getValue(formValues?.maxActivePower),
        previousValue: generatorInfo?.maxP,
        clearable: true,
    });

    const [minimumActivePower, minimumActivePowerField] = useDoubleValue({
        label: 'MinimumActivePowerText',
        validation: {
            isFieldNumeric: true,
            valueLessThanOrEqualTo: maximumActivePower || generatorInfo?.maxP,
            errorMsgId: 'MinActivePowerLessThanMaxActivePower',
        },
        adornment: ActivePowerAdornment,
        inputForm: inputForm,
        defaultValue: getValue(formValues?.minActivePower),
        previousValue: generatorInfo?.minP,
        clearable: true,
    });

    const headerIds = [
        'ActivePowerText',
        'MinimumReactivePower',
        'MaximumReactivePower',
    ];

    const [
        reactiveCapabilityCurveChoice,
        reactiveCapabilityCurveChoiceRadioButton,
    ] = useRadioValue({
        inputForm: inputForm,
        defaultValue: defaultReactiveCapabilityCurveChoice(),
        possibleValues: REACTIVE_LIMIT_TYPES,
    });

    const isPreviousReactiveCapabilityCurveOn = useMemo(() => {
        return generatorInfo?.reactiveCapabilityCurvePoints !== undefined;
    }, [generatorInfo]);

    const isReactiveCapabilityCurveOn = useMemo(() => {
        return reactiveCapabilityCurveChoice === 'CURVE';
    }, [reactiveCapabilityCurveChoice]);

    const reactiveCapabilityCurveOn = useMemo(() => {
        // if the previous value was false, then we reactiveCapabilityCurveOn to true (to activate validation on all fields)
        // else if the reactiveCapabilityCurveOn is false, then we return false (to deactivate validation on all fields)
        // else we return undefined so that the validation is set based on the previousValues in : (dialogs/inputs/reactive-capability-curve-table.js)
        if (
            isReactiveCapabilityCurveOn &&
            !isPreviousReactiveCapabilityCurveOn
        ) {
            return true;
        } else if (!isReactiveCapabilityCurveOn) {
            return false;
        }
        return undefined;
    }, [isReactiveCapabilityCurveOn, isPreviousReactiveCapabilityCurveOn]);

    const [
        reactiveCapabilityCurve,
        reactiveCapabilityCurveField,
        displayedPreviousValues,
    ] = useReactiveCapabilityCurveTableValues({
        tableHeadersIds: headerIds,
        inputForm: inputForm,
        defaultValues: formValues?.reactiveCapabilityCurvePoints,
        isReactiveCapabilityCurveOn: reactiveCapabilityCurveOn,
        isModificationForm: true,
        previousValues: generatorInfo?.reactiveCapabilityCurvePoints,
    });

    const [maximumReactivePower, maximumReactivePowerField] = useDoubleValue({
        label: 'MaximumReactivePower',
        validation: {
            isFieldNumeric: true,
            isFieldRequired: reactivePowerRequired,
        },
        adornment: ReactivePowerAdornment,
        inputForm: inputForm,
        defaultValue: getValue(formValues?.maximumReactivePower),
        previousValue:
            generatorInfo?.minMaxReactiveLimits?.maximumReactivePower,
    });

    const [minimumReactivePower, minimumReactivePowerField] = useDoubleValue({
        label: 'MinimumReactivePower',
        validation: {
            isFieldNumeric: true,
            isFieldRequired: reactivePowerRequired,
            valueLessThanOrEqualTo:
                maximumReactivePower ||
                generatorInfo?.minMaxReactiveLimits?.maximumReactivePower,
            errorMsgId: 'MinReactivePowerLessThanMaxActivePower',
        },
        adornment: ReactivePowerAdornment,
        inputForm: inputForm,
        defaultValue: getValue(formValues?.minimumReactivePower),
        previousValue:
            generatorInfo?.minMaxReactiveLimits?.minimumReactivePower,
    });

    useEffect(() => {
        setReactivePowerRequired(
            (minimumReactivePower !== '' &&
                !generatorInfo?.minMaxReactiveLimits?.minimumReactivePower) ||
                (maximumReactivePower !== '' &&
                    !generatorInfo?.minMaxReactiveLimits?.maximumReactivePower)
                ? true
                : undefined // if the field is not required then we set "reactivePowerRequired" to undefined so that the optional label is not displayed
        );
    }, [minimumReactivePower, maximumReactivePower, generatorInfo]);

    const [ratedNominalPower, ratedNominalPowerField] = useDoubleValue({
        label: 'RatedNominalPowerText',
        validation: {
            isFieldNumeric: true,
            valueGreaterThan: '0',
            errorMsgId: 'RatedNominalPowerGreaterThanZero',
        },
        adornment: MVAPowerAdornment,
        inputForm: inputForm,
        defaultValue: getValue(formValues?.ratedNominalPower),
        previousValue: generatorInfo?.ratedS,
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
        previousValue: generatorInfo?.targetP,
        clearable: true,
    });

    let previousRegulation = '';
    if (generatorInfo?.voltageRegulatorOn)
        previousRegulation = intl.formatMessage({ id: 'On' });
    else if (generatorInfo?.voltageRegulatorOn === false)
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
        defaultValue: getValue(formValues?.qPercent),
        previousValue: generatorInfo?.qPercent,
    });

    const withVoltageRegulationInputs = () => {
        return (
            <>
                {gridItem(voltageRegulationTypeField, 4)}
                <Box sx={{ width: '100%' }} />
                <Grid item xs={4} justifySelf={'end'} />
                {gridItem(voltageSetpointField, 4)}
                <Box sx={{ width: '100%' }} />
                {isDistantRegulation && (
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

    const isPreviousRegulationDistant = useCallback(() => {
        return (
            getPreviousRegulationType(generatorInfo) ===
            REGULATION_TYPES.DISTANT
        );
    }, [generatorInfo]);

    function getPreviousRegulationType(generatorInformation) {
        if (generatorInformation?.voltageRegulatorOn) {
            return generatorInformation?.regulatingTerminalVlId ||
                generatorInformation?.regulatingTerminalConnectableId
                ? REGULATION_TYPES.DISTANT
                : REGULATION_TYPES.LOCAL;
        } else {
            return null;
        }
    }

    const previousRegulationTypeLabel = getPreviousRegulationType(generatorInfo)
        ?.label
        ? intl.formatMessage({
              id: getPreviousRegulationType(generatorInfo)?.label,
          })
        : undefined;
    const [voltageRegulationType, voltageRegulationTypeField] =
        useOptionalEnumValue({
            label: 'RegulationTypeText',
            inputForm: inputForm,
            enumObjects: Object.values(REGULATION_TYPES),
            defaultValue: formValues?.voltageRegulationType?.value ?? null,
            previousValue: previousRegulationTypeLabel,
        });

    let previousFrequencyRegulation = '';
    if (!generatorInfo) {
        previousFrequencyRegulation = undefined;
    } else {
        if (generatorInfo?.activePowerControlOn) {
            previousFrequencyRegulation = intl.formatMessage({ id: 'On' });
        } else if (
            generatorInfo?.activePowerControlOn === false ||
            (generatorInfo?.id !== '' &&
                generatorInfo?.activePowerControlOn === undefined)
        ) {
            previousFrequencyRegulation = intl.formatMessage({ id: 'Off' });
        }
    }

    const [frequencyRegulation, frequencyRegulationField] =
        useNullableBooleanValue({
            label: 'FrequencyRegulation',
            inputForm: inputForm,
            defaultValue: getValueOrNull(formValues?.participate),
            previousValue: previousFrequencyRegulation,
            clearable: true,
        });

    const isVoltageRegulationOn = useMemo(() => {
        return (
            voltageRegulation === true ||
            (voltageRegulation === null &&
                generatorInfo?.voltageRegulatorOn === true)
        );
    }, [voltageRegulation, generatorInfo]);

    const isFrequencyRegulationOn = useMemo(() => {
        return (
            frequencyRegulation === true ||
            (frequencyRegulation === null &&
                generatorInfo?.activePowerControlOn === true)
        );
    }, [frequencyRegulation, generatorInfo]);

    const isDistantRegulation = useMemo(() => {
        return (
            isActualRegulationDistant(voltageRegulationType) ||
            (voltageRegulationType === null && isPreviousRegulationDistant())
        );
    }, [voltageRegulationType, isPreviousRegulationDistant]);

    const [regulatingTerminal, regulatingTerminalField] =
        useRegulatingTerminalValue({
            studyUuid,
            currentNodeUuid,
            label: 'RegulatingTerminalGenerator',
            validation: {
                isFieldRequired:
                    isVoltageRegulationOn &&
                    isDistantRegulation &&
                    isRegulatingTerminalRequired,
            },
            inputForm: inputForm,
            disabled: !isDistantRegulation,
            voltageLevelIdDefaultValue:
                getValue(formValues?.regulatingTerminalVlId) || null,
            equipmentSectionTypeDefaultValue:
                getValue(formValues?.regulatingTerminalConnectableType) ||
                getValue(formValues?.regulatingTerminalType) ||
                null,
            equipmentSectionIdDefaultValue:
                getValue(formValues?.regulatingTerminalConnectableId) ||
                getValue(formValues?.regulatingTerminalId) ||
                null,
            previousRegulatingTerminalValue:
                generatorInfo?.regulatingTerminalVlId,
            previousEquipmentSectionTypeValue:
                generatorInfo?.regulatingTerminalConnectableType
                    ? generatorInfo?.regulatingTerminalConnectableType +
                      ' : ' +
                      generatorInfo?.regulatingTerminalConnectableId
                    : null,
            voltageLevelsIdsAndTopologyPromise,
        });

    useEffect(() => {
        setIsRegulatingTerminalRequired(
            (regulatingTerminal?.equipmentSection === null &&
                regulatingTerminal?.voltageLevel !== null) ||
                (regulatingTerminal?.equipmentSection === null &&
                    regulatingTerminal?.voltageLevel === null &&
                    !isPreviousRegulationDistant())
        );
    }, [isPreviousRegulationDistant, regulatingTerminal]);

    const [droop, droopField] = useDoubleValue({
        label: 'Droop',
        validation: {
            isFieldRequired:
                frequencyRegulation &&
                !validateValueIsGreaterThan(generatorInfo?.droop, 0), // The field is required if active power regulation is ON and there is no previous valid value.
            valueGreaterThan: 0,
            errorMsgId: 'DroopGreaterThanZero',
        },
        adornment: percentageTextField,
        inputForm: inputForm,
        formProps: {
            disabled: frequencyRegulation !== null && !frequencyRegulation,
        },
        defaultValue: getValue(formValues?.droop),
        previousValue: generatorInfo?.droop,
    });

    const [transientReactance, transientReactanceField] = useDoubleValue({
        label: 'TransientReactance',
        adornment: OhmAdornment,
        inputForm: inputForm,
        defaultValue: getValue(formValues?.transientReactance),
        previousValue: generatorInfo?.transientReactance,
    });

    const [transformerReactance, transformerReactanceField] = useDoubleValue({
        label: 'TransformerReactance',
        adornment: OhmAdornment,
        inputForm: inputForm,
        defaultValue: getValue(formValues?.stepUpTransformerReactance),
        previousValue: generatorInfo?.stepUpTransformerReactance,
    });

    const [plannedActivePowerSetPoint, plannedActivePowerSetPointField] =
        useDoubleValue({
            label: 'PlannedActivePowerSetPoint',
            adornment: ActivePowerAdornment,
            inputForm: inputForm,
            defaultValue: getValue(formValues?.plannedActivePowerSetPoint),
            previousValue: generatorInfo?.plannedActivePowerSetPoint,
        });

    const [startupCost, startupCostField] = useDoubleValue({
        label: 'StartupCost',
        inputForm: inputForm,
        defaultValue: getValue(formValues?.startupCost),
        previousValue: generatorInfo?.startupCost,
    });

    const [marginalCost, marginalCostField] = useDoubleValue({
        label: 'MarginalCost',
        inputForm: inputForm,
        defaultValue: getValue(formValues?.marginalCost),
        previousValue: generatorInfo?.marginalCost,
    });

    const [plannedOutageRate, plannedOutageRateField] = useDoubleValue({
        label: 'PlannedOutageRate',
        validation: {
            valueGreaterThanOrEqualTo: '0',
            valueLessThanOrEqualTo: '1',
            errorMsgId: 'RealPercentage',
        },
        inputForm: inputForm,
        defaultValue: getValue(formValues?.plannedOutageRate),
        previousValue: generatorInfo?.plannedOutageRate,
    });

    const [forcedOutageRate, forcedOutageRateField] = useDoubleValue({
        label: 'ForcedOutageRate',
        validation: {
            valueGreaterThanOrEqualTo: '0',
            valueLessThanOrEqualTo: '1',
            errorMsgId: 'RealPercentage',
        },
        inputForm: inputForm,
        defaultValue: getValue(formValues?.forcedOutageRate),
        previousValue: generatorInfo?.forcedOutageRate,
    });

    const [voltageSetpoint, voltageSetpointField] = useDoubleValue({
        label: 'VoltageText',
        validation: {
            isFieldNumeric: true,
            valueGreaterThan: '0',
            errorMsgId: 'VoltageGreaterThanZero',
        },
        adornment: VoltageAdornment,
        formProps: { disabled: voltageRegulation === false },
        inputForm: inputForm,
        defaultValue: getValue(formValues?.voltageSetpoint),
        previousValue: generatorInfo?.targetV,
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
        previousValue: generatorInfo?.targetQ,
        clearable: true,
    });

    const removeUnnecessaryFieldsValidation = useCallback(() => {
        if (!isVoltageRegulationOn || !isDistantRegulation) {
            inputForm.removeValidation(REGULATING_VOLTAGE_LEVEL);
            inputForm.removeValidation(REGULATING_EQUIPMENT);
            inputForm.removeValidation('QPercentText');
        }
        if (isReactiveCapabilityCurveOn) {
            inputForm.removeValidation('MinimumReactivePower');
            inputForm.removeValidation('MaximumReactivePower');
        }
    }, [
        inputForm,
        isDistantRegulation,
        isReactiveCapabilityCurveOn,
        isVoltageRegulationOn,
    ]);

    const buildCurvePointsToCheck = useMemo(() => {
        const pointsToCheck = [];
        reactiveCapabilityCurve.forEach((point, index) => {
            if (point && displayedPreviousValues) {
                let pointToStore = {
                    p: point.p ? point.p : displayedPreviousValues[index]?.p,
                    oldP: displayedPreviousValues[index]?.p,
                    qminP: point.qminP
                        ? point.qminP
                        : displayedPreviousValues[index]?.qminP,
                    oldQminP: displayedPreviousValues[index]?.qminP,
                    qmaxP: point.qmaxP
                        ? point.qmaxP
                        : displayedPreviousValues[index]?.qmaxP,
                    oldQmaxP: displayedPreviousValues[index]?.qmaxP,
                };

                pointsToCheck.push(pointToStore);
            }
        });
        return pointsToCheck;
    }, [reactiveCapabilityCurve, displayedPreviousValues]);

    const buildCurvePointsToStore = useMemo(() => {
        // if there was no modification on the curve points, we don't store it
        if (
            displayedPreviousValues &&
            reactiveCapabilityCurve &&
            reactiveCapabilityCurve.length ===
                generatorInfo?.reactiveCapabilityCurvePoints?.length &&
            reactiveCapabilityCurve.filter(
                (point) =>
                    point.p !== '' || point.qminP !== '' || point.qmaxP !== ''
            ).length === 0
        ) {
            return null;
        } else {
            const pointsToStore = [];
            reactiveCapabilityCurve.forEach((point, index) => {
                if (point) {
                    let pointToStore = {
                        p: point.p,
                        oldP:
                            displayedPreviousValues !== undefined
                                ? displayedPreviousValues[index]?.p
                                : null,
                        qminP: point.qminP,
                        oldQminP:
                            displayedPreviousValues !== undefined
                                ? displayedPreviousValues[index]?.qminP
                                : null,
                        qmaxP: point.qmaxP,
                        oldQmaxP:
                            displayedPreviousValues !== undefined
                                ? displayedPreviousValues[index]?.qmaxP
                                : null,
                    };

                    pointsToStore.push(pointToStore);
                }
            });
            return pointsToStore;
        }
    }, [displayedPreviousValues, reactiveCapabilityCurve, generatorInfo]);

    const handleValidation = () => {
        // ReactiveCapabilityCurveCreation validation
        let isReactiveCapabilityCurveValid = true;
        // if the ReactiveCapability Curve is on, we check if it is valid
        // else if the previous ReactiveCapability Curve was on, we check the modifications that were made
        if (
            isReactiveCapabilityCurveOn &&
            !isPreviousReactiveCapabilityCurveOn
        ) {
            const errorMessages = checkReactiveCapabilityCurve(
                reactiveCapabilityCurve
            );
            isReactiveCapabilityCurveValid = errorMessages.length === 0;
            setReactiveCapabilityCurveErrors(errorMessages);
        } else if (
            isPreviousReactiveCapabilityCurveOn &&
            isReactiveCapabilityCurveOn
        ) {
            const errorMessages = checkReactiveCapabilityCurve(
                buildCurvePointsToCheck
            );
            isReactiveCapabilityCurveValid = errorMessages.length === 0;
            setReactiveCapabilityCurveErrors(errorMessages);
        } else {
            setReactiveCapabilityCurveErrors([]);
        }
        removeUnnecessaryFieldsValidation();
        return (
            inputForm.validate() &&
            (!isReactiveCapabilityCurveOn || isReactiveCapabilityCurveValid)
        );
    };

    const handleSave = () => {
        modifyGenerator(
            studyUuid,
            currentNodeUuid,
            id,
            sanitizeString(generatorName),
            energySource,
            minimumActivePower,
            maximumActivePower,
            ratedNominalPower,
            activePowerSetpoint,
            !isVoltageRegulationOn ? reactivePowerSetpoint : null,
            voltageRegulation,
            isVoltageRegulationOn ? voltageSetpoint : null,
            undefined,
            undefined,
            editData?.uuid,
            isVoltageRegulationOn && isDistantRegulation ? qPercent : null,
            plannedActivePowerSetPoint ?? null,
            startupCost ?? null,
            marginalCost ?? null,
            plannedOutageRate ?? null,
            forcedOutageRate ?? null,
            transientReactance ?? null,
            transformerReactance ?? null,
            voltageRegulationType,
            isVoltageRegulationOn && isDistantRegulation
                ? regulatingTerminal?.equipmentSection?.id
                : null,
            isVoltageRegulationOn && isDistantRegulation
                ? regulatingTerminal?.equipmentSection?.type
                : null,
            isVoltageRegulationOn && isDistantRegulation
                ? regulatingTerminal?.voltageLevel?.id
                : null,
            isReactiveCapabilityCurveOn,
            frequencyRegulation,
            isFrequencyRegulationOn ? droop : null,
            isReactiveCapabilityCurveOn ? null : maximumReactivePower,
            isReactiveCapabilityCurveOn ? null : minimumReactivePower,
            isReactiveCapabilityCurveOn ? buildCurvePointsToStore : null
        ).catch((error) => {
            snackError({
                messageTxt: error.message,
                headerId: 'GeneratorModificationError',
            });
        });
    };

    const clear = () => {
        inputForm.reset();
        setFormValues(null);
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
            titleId="ModifyGenerator"
            {...dialogProps}
        >
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
                        <h4 className={classes.h4}>
                            <FormattedMessage id="ActiveLimits" />
                        </h4>
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    {gridItem(minimumActivePowerField, 4)}
                    {gridItem(maximumActivePowerField, 4)}
                    {gridItem(ratedNominalPowerField, 4)}
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <h4 className={classes.h4}>
                            <FormattedMessage id="ReactiveLimits" />
                        </h4>
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    {gridItem(reactiveCapabilityCurveChoiceRadioButton, 12)}
                    {!isReactiveCapabilityCurveOn &&
                        gridItem(minimumReactivePowerField, 4)}
                    {!isReactiveCapabilityCurveOn &&
                        gridItem(maximumReactivePowerField, 4)}
                    {isReactiveCapabilityCurveOn &&
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
                    {isReactiveCapabilityCurveOn &&
                        gridItem(reactiveCapabilityCurveField, 12)}
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
                    {isVoltageRegulationOn
                        ? withVoltageRegulationInputs()
                        : gridItem(reactivePowerSetpointField, 4)}
                    <Box sx={{ width: '100%' }} />
                    {gridItemWithTooltip(
                        frequencyRegulationField,
                        frequencyRegulation !== null ? (
                            ''
                        ) : (
                            <FormattedMessage id={'NoModification'} />
                        ),
                        4
                    )}
                    {isFrequencyRegulationOn && gridItem(droopField, 4)}
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
        </ModificationDialog>
    );
};

GeneratorModificationDialog.propTypes = {
    editData: PropTypes.object,
    currentNodeUuid: PropTypes.string,
    equipmentOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
};

export default GeneratorModificationDialog;
