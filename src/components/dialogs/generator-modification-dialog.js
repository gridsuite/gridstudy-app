/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
    useEnumValue,
    useRegulatingTerminalValue,
} from './inputs/input-hooks';
import {
    ActivePowerAdornment,
    compareById,
    filledTextField,
    getId,
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
import { modifyGenerator } from '../../utils/rest-api';
import { useAutocompleteField } from './inputs/use-autocomplete-field';
import { useReactiveCapabilityCurveTableValues } from './inputs/reactive-capability-curve-table';
import { ReactiveCapabilityCurveReactiveRange } from './reactive-capability-curve-reactive-range';
import { checkReactiveCapabilityCurve } from '../util/validation-functions';

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
 * @param currentNodeUuid the currently selected tree node
 * @param equipmentOptionsPromise Promise handling list of generator options
 * @param editData the data to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const GeneratorModificationDialog = ({
    editData,
    currentNodeUuid,
    equipmentOptionsPromise,
    voltageLevelOptionsPromise,
    voltageLevelsEquipmentsOptionsPromise,
    ...dialogProps
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const intl = useIntl();

    const classes = useStyles();

    const { snackError } = useSnackMessage();

    const inputForm = useInputForm();

    const [formValues, setFormValues] = useState({});

    const [equipmentOptions, setEquipmentOptions] = useState([]);

    const [reactivePowerRequired, setReactivePowerRequired] = useState(false);

    const [reactiveCapabilityCurveErrors, setReactiveCapabilityCurveErrors] =
        useState([]);

    const isDistantRegulation = (regulationType) => {
        return regulationType === REGULATION_TYPES.DISTANT.id;
    };

    const [loadingEquipmentOptions, setLoadingEquipmentOptions] =
        useState(true);

    useEffect(() => {
        if (!equipmentOptionsPromise) return;
        equipmentOptionsPromise.then((values) => {
            setEquipmentOptions(values);
            setLoadingEquipmentOptions(false);
        });
    }, [equipmentOptionsPromise]);

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
        previousValue: generatorInfos?.maxP,
        clearable: true,
    });

    const [minimumActivePower, minimumActivePowerField] = useDoubleValue({
        label: 'MinimumActivePowerText',
        validation: {
            isFieldNumeric: true,
            valueLessThanOrEqualTo: maximumActivePower,
            errorMsgId: 'MinActivePowerLessThanMaxActivePower',
        },
        adornment: ActivePowerAdornment,
        inputForm: inputForm,
        defaultValue: getValue(formValues?.minActivePower),
        previousValue: generatorInfos?.minP,
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
        defaultValue:
            (getValueOrNull(formValues?.reactiveCapabilityCurve) === null &&
                generatorInfos?.minMaxReactiveLimits !== undefined) ||
            getValueOrNull(formValues?.reactiveCapabilityCurve) === false
                ? 'MINMAX'
                : 'CURVE',
        possibleValues: REACTIVE_LIMIT_TYPES,
    });

    const isReactiveCapabilityCurveOn = useCallback(() => {
        return reactiveCapabilityCurveChoice === 'CURVE';
    }, [reactiveCapabilityCurveChoice]);

    const [reactiveCapabilityCurve, reactiveCapabilityCurveField] =
        useReactiveCapabilityCurveTableValues({
            tableHeadersIds: headerIds,
            inputForm: inputForm,
            Field: ReactiveCapabilityCurveReactiveRange,
            defaultValues: formValues?.reactiveCapabilityCurvePoints,
            isReactiveCapabilityCurveOn: isReactiveCapabilityCurveOn(),
            previousValues: generatorInfos?.reactiveCapabilityCurvePoints,
        });

    const [minimumReactivePower, minimumReactivePowerField] = useDoubleValue({
        label: 'MinimumReactivePower',
        validation: { isFieldRequired: reactivePowerRequired },
        adornment: ReactivePowerAdornment,
        inputForm: inputForm,
        defaultValue: getValue(formValues?.minimumReactivePower),
        previousValue:
            generatorInfos?.minMaxReactiveLimits?.minimumReactivePower,
    });

    const [maximumReactivePower, maximumReactivePowerField] = useDoubleValue({
        label: 'MaximumReactivePower',
        validation: { isFieldRequired: reactivePowerRequired },
        adornment: ReactivePowerAdornment,
        inputForm: inputForm,
        defaultValue: getValue(formValues?.maximumReactivePower),
        previousValue:
            generatorInfos?.minMaxReactiveLimits?.maximumReactivePower,
    });

    useEffect(() => {
        setReactivePowerRequired(
            minimumReactivePower !== '' || maximumReactivePower !== ''
        );
    }, [minimumReactivePower, maximumReactivePower]);

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
        previousValue: generatorInfos?.qPercent,
    });

    const withVoltageRegulationInputs = () => {
        return (
            <>
                {gridItem(voltageRegulationTypeField, 4)}
                <Box sx={{ width: '100%' }} />
                <Grid item xs={4} justifySelf={'end'} />
                {gridItem(voltageSetpointField, 4)}
                <Box sx={{ width: '100%' }} />
                {(voltageRegulation || voltageRegulation === null) &&
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

    function isPreviousRegulationDistant(generatorInfos) {
        return getPreviousRegulationType(generatorInfos) ===
            REGULATION_TYPES.DISTANT
            ? true
            : false;
    }

    function getPreviousRegulationType(generatorInfos) {
        if (generatorInfos?.voltageRegulatorOn) {
            return generatorInfos?.regulatingTerminalId ||
                generatorInfos?.regulatingTerminalConnectableId
                ? REGULATION_TYPES.DISTANT
                : REGULATION_TYPES.LOCAL;
        } else {
            return null;
        }
    }

    const [voltageRegulationType, voltageRegulationTypeField] = useEnumValue({
        label: 'RegulationTypeText',
        inputForm: inputForm,
        enumValues: Object.values(REGULATION_TYPES),
        validation: {
            isFieldRequired: voltageRegulation,
        },
        defaultValue:
            getValue(formValues?.regulatingTerminalId) ||
            getValue(formValues?.regulatingTerminalConnectableId) ||
            isPreviousRegulationDistant(generatorInfos)
                ? REGULATION_TYPES.DISTANT.id
                : REGULATION_TYPES.LOCAL.id,
        previousValue: getPreviousRegulationType(generatorInfos),
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
                (voltageRegulation !== null && !voltageRegulation) ||
                !isDistantRegulation(voltageRegulationType),
            voltageLevelOptionsPromise: voltageLevelsEquipmentsOptionsPromise,
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
                generatorInfos?.regulatingTerminalVlId,
            previousEquipmentSectionTypeValue:
                generatorInfos?.regulatingTerminalConnectableType +
                ' : ' +
                generatorInfos?.regulatingTerminalConnectableId,
        });

    useEffect(() => {
        if (!voltageRegulation || !isDistantRegulation(voltageRegulationType)) {
            inputForm.removeValidation(REGULATING_VOLTAGE_LEVEL);
            inputForm.removeValidation(REGULATING_EQUIPMENT);
        }
    }, [voltageRegulation, voltageRegulationType, inputForm]);

    let previousFrequencyRegulation = '';
    if (generatorInfos?.activePowerControlOn)
        previousFrequencyRegulation = intl.formatMessage({ id: 'On' });
    else if (
        generatorInfos?.activePowerControlOn === false ||
        generatorInfos?.activePowerControlOn === undefined
    )
        previousFrequencyRegulation = intl.formatMessage({ id: 'Off' });

    const [frequencyRegulation, frequencyRegulationField] =
        useNullableBooleanValue({
            label: 'FrequencyRegulation',
            inputForm: inputForm,
            defaultValue: getValueOrNull(formValues?.participate),
            previousValue: previousFrequencyRegulation,
            clearable: true,
        });

    const [droop, droopField] = useDoubleValue({
        label: 'Droop',
        validation: { isFieldRequired: frequencyRegulation },
        adornment: percentageTextField,
        inputForm: inputForm,
        formProps: {
            disabled: frequencyRegulation !== null && !frequencyRegulation,
        },
        defaultValue: getValue(formValues?.droop),
        previousValue: generatorInfos?.droop,
    });

    const [transientReactance, transientReactanceField] = useDoubleValue({
        label: 'TransientReactance',
        validation: { isFieldRequired: false },
        adornment: OhmAdornment,
        inputForm: inputForm,
        defaultValue: getValue(formValues?.transientReactance),
        previousValue: generatorInfos?.transientReactance,
    });

    const [transformerReactance, transformerReactanceField] = useDoubleValue({
        label: 'TransformerReactance',
        validation: { isFieldRequired: false },
        adornment: OhmAdornment,
        inputForm: inputForm,
        defaultValue: getValue(formValues?.stepUpTransformerReactance),
        previousValue: generatorInfos?.stepUpTransformerReactance,
    });
    const [marginalCost, marginalCostField] = useDoubleValue({
        label: 'MarginalCost',
        validation: { isFieldRequired: false },
        inputForm: inputForm,
        defaultValue: getValue(formValues?.marginalCost),
        previousValue: generatorInfos?.marginalCost,
    });
    const [voltageSetpoint, voltageSetpointField] = useDoubleValue({
        label: 'VoltageText',
        validation: {
            isFieldRequired: voltageRegulation,
            isFieldNumeric: true,
            valueGreaterThan: '0',
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
        return (
            inputForm.validate() &&
            (!isReactiveCapabilityCurveOn() || isReactiveCapabilityCurveValid)
        );
    };

    function isVoltageRegulationOn() {
        return (
            voltageRegulation === true ||
            (voltageRegulation === null &&
                generatorInfos?.voltageRegulatorOn === true)
        );
    }

    function isFrequencyRegulationOn() {
        return (
            frequencyRegulation === true ||
            (frequencyRegulation === null &&
                generatorInfos?.activePowerControlOn === true)
        );
    }

    const handleSave = () => {
        modifyGenerator(
            studyUuid,
            currentNodeUuid,
            generatorInfos?.id,
            sanitizeString(generatorName),
            energySource,
            minimumActivePower,
            maximumActivePower,
            ratedNominalPower,
            activePowerSetpoint,
            !isVoltageRegulationOn() ? reactivePowerSetpoint : null,
            voltageRegulation,
            isVoltageRegulationOn() ? voltageSetpoint : null,
            undefined,
            undefined,
            editData?.uuid,
            isVoltageRegulationOn() &&
                isDistantRegulation(voltageRegulationType)
                ? qPercent
                : null,
            marginalCost ? marginalCost : null,
            transientReactance ? transientReactance : null,
            transformerReactance ? transformerReactance : null,
            isVoltageRegulationOn() &&
                isDistantRegulation(voltageRegulationType)
                ? regulatingTerminal?.equipmentSection?.id
                : null,
            isVoltageRegulationOn() &&
                isDistantRegulation(voltageRegulationType)
                ? regulatingTerminal?.equipmentSection?.type
                : null,
            isVoltageRegulationOn() &&
                isDistantRegulation(voltageRegulationType)
                ? regulatingTerminal?.voltageLevel?.id
                : null,
            isReactiveCapabilityCurveOn(),
            frequencyRegulation,
            isFrequencyRegulationOn() ? droop : null,
            isReactiveCapabilityCurveOn() ? null : maximumReactivePower,
            isReactiveCapabilityCurveOn() ? null : minimumReactivePower,
            isReactiveCapabilityCurveOn() ? reactiveCapabilityCurve : null
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
                    {isVoltageRegulationOn()
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
                    {isFrequencyRegulationOn() && gridItem(droopField, 4)}
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
    voltageLevelOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
    voltageLevelsEquipmentsOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
};

export default GeneratorModificationDialog;
