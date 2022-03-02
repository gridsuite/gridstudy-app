/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useCallback } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
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
    useConnectivityValue,
    useDoubleValue,
    useEnumValue,
    useInputForm,
    useIntegerValue,
    useTextValue,
} from './input-hooks';
import {
    ActivePowerAdornment,
    filledTextField,
    gridItem,
    ReactivePowerAdornment,
    VoltageAdornment,
} from './dialogUtils';

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
 */
const GeneratorCreationDialog = ({
    open,
    onClose,
    voltageLevelOptions,
    selectedNodeUuid,
    workingNodeUuid,
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const classes = useStyles();
    const intl = useIntl();
    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const inputForm = useInputForm();

    const [generatorId, generatorIdField] = useTextValue({
        label: 'ID',
        validation: { isFieldRequired: true },
        inputForm: inputForm,
        formProps: filledTextField,
    });

    const [generatorName, generatorNameField] = useTextValue({
        label: 'Name',
        inputForm: inputForm,
        formProps: filledTextField,
    });

    const [energySource, energySourceField] = useEnumValue({
        label: 'EnergySourceText',
        inputForm: inputForm,
        formProps: filledTextField,
        enumValues: ENERGY_SOURCES,
        validation: {
            isFieldRequired: false,
        },
    });

    const [maximumActivePower, maximumActivePowerField] = useIntegerValue({
        label: 'MaximumActivePowerText',
        validation: {
            isFieldRequired: true,
            isFieldNumeric: true,
        },
        adornment: ActivePowerAdornment,
        inputForm: inputForm,
    });

    const [minimumActivePower, minimumActivePowerField] = useIntegerValue({
        label: 'MinimumActivePowerText',
        validation: {
            isFieldRequired: true,
            isFieldNumeric: true,
            isValueLessOrEqualTo: maximumActivePower,
            errorMsgId: 'MinActivePowerLessThanMaxActivePower',
        },
        adornment: ActivePowerAdornment,
        inputForm: inputForm,
    });

    const [ratedNominalPower, ratedNominalPowerField] = useIntegerValue({
        label: 'RatedNominalPowerText',
        validation: {
            isFieldRequired: false,
            isFieldNumeric: true,
            isValueGreaterThan: '0',
            errorMsgId: 'RatedNominalPowerGreaterThanZero',
        },
        adornment: ReactivePowerAdornment,
        inputForm: inputForm,
    });

    const [activePowerSetpoint, activePowerSetpointField] = useIntegerValue({
        label: 'ActivePowerText',
        validation: {
            isFieldRequired: true,
            isFieldNumeric: true,
        },
        adornment: ActivePowerAdornment,
        inputForm: inputForm,
    });

    const [voltageRegulation, voltageRegulationField] = useBooleanValue({
        label: 'VoltageRegulationText',
        defaultValue: false,
        validation: { isFieldRequired: true },
        inputForm: inputForm,
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
    });

    const [reactivePowerSetpoint, reactivePowerSetpointField] = useIntegerValue(
        {
            label: 'ReactivePowerText',
            validation: {
                isFieldRequired: !voltageRegulation,
                isFieldNumeric: true,
            },
            adornment: ReactivePowerAdornment,
            inputForm: inputForm,
            formProps: { disabled: voltageRegulation },
        }
    );

    const [connectivity, connectivityField] = useConnectivityValue({
        label: 'Connectivity',
        inputForm: inputForm,
        voltageLevelOptions: voltageLevelOptions,
        workingNodeUuid: workingNodeUuid,
    });

    const handleSave = () => {
        if (inputForm.validate()) {
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
            // do not wait fetch response and close dialog, errors will be shown in snackbar.
            handleCloseAndClear();
        }
    };

    const clearValues = useCallback(() => {
        inputForm.clear();
    }, [inputForm]);

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
        <Dialog
            fullWidth
            maxWidth="md" // 3 columns
            open={open}
            onClose={handleClose}
            aria-labelledby="dialog-create-generator"
        >
            <DialogTitle>
                {intl.formatMessage({ id: 'CreateGenerator' })}
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
                    <FormattedMessage id="save" />
                </Button>
            </DialogActions>
        </Dialog>
    );
};

GeneratorCreationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    voltageLevelOptions: PropTypes.arrayOf(PropTypes.object),
    selectedNodeUuid: PropTypes.string,
    workingNodeUuid: PropTypes.string,
};

export default GeneratorCreationDialog;
