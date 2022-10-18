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
    useDoubleValue,
    useEnumValue,
    useInputForm,
    useRegulatingTerminalValue,
    useTableValues,
    useTextValue,
} from './inputs/input-hooks';
import {
    ActivePowerAdornment,
    compareById,
    filledTextField,
    getId,
    gridItem,
    gridItemWithTooltip,
    MVAPowerAdornment,
    OhmAdornment,
    percentageTextField,
    ReactivePowerAdornment,
    VoltageAdornment,
} from './dialogUtils';
import { Box } from '@mui/system';
import { ENERGY_SOURCES, getEnergySourceLabel } from '../network/constants';
import { useBooleanValue, useNullableBooleanValue } from './inputs/boolean';
import { modifyGenerator } from '../../utils/rest-api';
import { useAutocompleteField } from './inputs/use-autocomplete-field';
import { ReactiveCapabilityCurveTable } from './reactive-capability-curve-table';

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
 * @param currentNodeUuid : the currently selected tree node
 * @param equipmentOptionsPromise Promise handling list of generator options
 * @param editData the data to edit
 */
const GeneratorModificationDialog = ({
    editData,
    open,
    onClose,
    currentNodeUuid,
    equipmentOptionsPromise,
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

    const headerIds = [
        'ActivePowerLabel',
        'MinimumReactivePower',
        'MaximumReactivePower',
    ];

    const fieldRequired = { isFieldRequired: true };
    const fieldDisabled = { disabled: true };

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
        validation: fieldRequired,
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

    const [isReactiveCapabilityCurveOn, isReactiveCapabilityCurveOnField] =
        useBooleanValue({
            label: 'ReactiveCapabilityCurve',
            validation: fieldRequired,
            inputForm: inputForm,
            defaultValue: !generatorInfos?.minMaxReactiveLimits,
            formProps: fieldDisabled,
        });

    const [minimumReactivePower, minimumReactivePowerField] = useDoubleValue({
        label: 'MinimumReactivePower',
        adornment: ReactivePowerAdornment,
        inputForm: inputForm,
        defaultValue:
            generatorInfos?.minMaxReactiveLimits?.minimumReactivePower,
        formProps: fieldDisabled,
    });

    const [maximumReactivePower, maximumReactivePowerField] = useDoubleValue({
        label: 'MaximumReactivePower',
        adornment: ReactivePowerAdornment,
        inputForm: inputForm,
        defaultValue:
            generatorInfos?.minMaxReactiveLimits?.maximumReactivePower,
        formProps: fieldDisabled,
    });

    const [reactiveCapabilityCurve, reactiveCapabilityCurveField] =
        useTableValues({
            id: 'ReactiveCapabilityCurveOn',
            tableHeadersIds: headerIds,
            inputForm: inputForm,
            Field: ReactiveCapabilityCurveTable,
            defaultValues: generatorInfos?.reactiveCapabilityCurvePoints,
            isRequired: false,
            isReactiveCapabilityCurveOn: isReactiveCapabilityCurveOn,
            disabled: true,
        });

    const [regulatingTerminal, regulatingTerminalField] =
        useRegulatingTerminalValue({
            label: 'RegulatingTerminalGenerator',
            inputForm: inputForm,
            disabled: true,
            voltageLevelOptionsPromise: null,
            voltageLevelIdDefaultValue:
                generatorInfos?.regulatingTerminalVlId || null,
            equipmentSectionTypeDefaultValue:
                generatorInfos?.regulatingTerminalConnectableType || null,
            equipmentSectionIdDefaultValue:
                generatorInfos?.regulatingTerminalConnectableId || null,
        });

    const [frequencyRegulation, frequencyRegulationField] = useBooleanValue({
        label: 'FrequencyRegulation',
        validation: fieldRequired,
        inputForm: inputForm,
        defaultValue: generatorInfos?.activePowerControlOn ?? false,
        formProps: fieldDisabled,
    });

    const [droop, droopField] = useDoubleValue({
        label: 'Droop',
        validation: { isFieldRequired: frequencyRegulation },
        adornment: percentageTextField,
        inputForm: inputForm,
        formProps: fieldDisabled,
        defaultValue: generatorInfos?.droop,
    });

    const [transientReactance, transientReactanceField] = useDoubleValue({
        label: 'TransientReactance',
        validation: { isFieldRequired: false },
        adornment: OhmAdornment,
        inputForm: inputForm,
        defaultValue: generatorInfos?.transientReactance,
        formProps: fieldDisabled,
    });

    const [transformerReactance, transformerReactanceField] = useDoubleValue({
        label: 'TransformerReactance',
        validation: { isFieldRequired: false },
        adornment: OhmAdornment,
        inputForm: inputForm,
        defaultValue: generatorInfos?.stepUpTransformerReactance,
        formProps: fieldDisabled,
    });

    const [marginalCost, marginalCostField] = useDoubleValue({
        label: 'MarginalCost',
        validation: { isFieldRequired: false },
        inputForm: inputForm,
        defaultValue: generatorInfos?.marginalCost,
        formProps: fieldDisabled,
    });

    const handleSave = () => {
        if (inputForm.validate()) {
            modifyGenerator(
                studyUuid,
                currentNodeUuid,
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
                undefined,
                undefined,
                editData?.uuid,
                marginalCost,
                maximumReactivePower,
                minimumReactivePower,
                frequencyRegulation,
                droop,
                regulatingTerminal?.voltageLevel?.id,
                regulatingTerminal?.equipmentSection?.id,
                regulatingTerminal?.equipmentSection?.type,
                transformerReactance,
                reactiveCapabilityCurve,
                transientReactance
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
                            <Box sx={{ width: '100%' }} />
                            {gridItem(isReactiveCapabilityCurveOnField, 8)}
                            <Box sx={{ width: '100%' }} />
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
                            <Box sx={{ width: '100%' }} />
                            <Grid item xs={4} justifySelf={'end'}>
                                <FormattedMessage id="RegulatingTerminalGenerator" />
                            </Grid>
                            {gridItem(regulatingTerminalField, 8)}
                            <Box sx={{ width: '100%' }} />
                            {gridItem(frequencyRegulationField, 4)}
                            {gridItem(droopField, 4)}
                        </Grid>
                        {/*Short-circuit part*/}
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <h3 className={classes.h3}>
                                    <FormattedMessage id="ShortCircuit" />
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
        </>
    );
};

GeneratorModificationDialog.propTypes = {
    editData: PropTypes.object,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    currentNodeUuid: PropTypes.string,
    equipmentOptionsPromise: PropTypes.shape({
        then: PropTypes.func.isRequired,
        catch: PropTypes.func.isRequired,
    }),
};

export default GeneratorModificationDialog;
