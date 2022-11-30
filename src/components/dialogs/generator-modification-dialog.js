/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useEffect, useMemo, useState } from 'react';
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
} from './dialogUtils';
import { Box } from '@mui/system';
import { ENERGY_SOURCES, getEnergySourceLabel } from '../network/constants';
import { useNullableBooleanValue } from './inputs/boolean';
import { modifyGenerator } from '../../utils/rest-api';
import { useAutocompleteField } from './inputs/use-autocomplete-field';

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
    ...dialogProps
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

    const [voltageSetpoint, voltageSetpointField] = useDoubleValue({
        label: 'VoltageText',
        validation: {
            skipValidation: voltageRegulation === false,
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
        return inputForm.validate();
    };
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
            reactivePowerSetpoint,
            voltageRegulation,
            voltageSetpoint,
            undefined,
            undefined,
            editData?.uuid
        ).catch((errorMessage) => {
            snackError({
                messageTxt: errorMessage,
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
