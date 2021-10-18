/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import { InputLabel, MenuItem, Select, TextField } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import TextFieldWithAdornment from '../util/text-field-with-adornment';
import { useParams } from 'react-router-dom';
import { createGenerator } from '../../utils/rest-api';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';
import { useSnackbar } from 'notistack';
import { validateField } from '../util/validation-functions';
import { makeStyles } from '@material-ui/core/styles';
import ConnectivityDialog from './connectivity-dialog';

const useStyles = makeStyles((theme) => ({
    helperText: {
        margin: 0,
    },
    popper: {
        style: {
            width: 'fit-content',
        },
    },
    dialogPaper: {
        minWidth: '800px',
        margin: 'auto',
    },
    divDialog: {
        minWidth: '750px',
        margin: 'auto',
    },
    voltageRegulation: {
        paddingTop: '10px',
    },
}));

/**
 * Dialog to create a generator in the network
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 */
const GeneratorCreationDialog = ({ open, onClose, network }) => {
    const classes = useStyles();

    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const intl = useIntl();
    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const [busOrBusbarSectionOptions, setBusOrBusbarSectionOptions] = useState(
        []
    );

    const [generatorId, setGeneratorId] = useState('');

    const [generatorName, setGeneratorName] = useState('');

    const [energySource, setEnergySource] = useState('');

    const [minimumActivePower, setMinimumActivePower] = useState('');

    const [maximumActivePower, setMaximumActivePower] = useState('');

    const [ratedNominalPower, setRatedNominalPower] = useState('');

    const [activePowerSetpoint, setActivePowerSetpoint] = useState('');

    const [reactivePowerSetpoint, setReactivePowerSetpoint] = useState('');
    const [enabledReactivePowerSetpoint, setEnabledReactivePowerSetpoint] =
        useState(true);

    const [voltageRegulation, setVoltageRegulation] = useState(false);

    const [voltageSetpoint, setVoltageSetpoint] = useState('');
    const [enabledVoltageSetpoint, setEnabledVoltageSetpoint] = useState(false);

    const [voltageLevel, setVoltageLevel] = useState(null);

    const [busOrBusbarSection, setBusOrBusbarSection] = useState(null);

    const [errors, setErrors] = useState(new Map());

    const handleChangeGenertorId = (event) => {
        setGeneratorId(event.target.value);
    };

    const handleChangeGeneratorName = (event) => {
        setGeneratorName(event.target.value);
    };

    const handleChangeEnergySource = (event) => {
        setEnergySource(event.target.value);
    };

    const handleChangeMinimumActivePower = (event) => {
        // TODO: remove replace when parsing behaviour will be made according to locale
        // Replace ',' by '.' to ensure double values can be parsed correctly
        setMinimumActivePower(event.target.value?.replace(',', '.'));
    };

    const handleChangeMaximumActivePower = (event) => {
        // TODO: remove replace when parsing behaviour will be made according to locale
        // Replace ',' by '.' to ensure double values can be parsed correctly
        setMaximumActivePower(event.target.value?.replace(',', '.'));
    };

    const handleChangeRatedNominalPower = (event) => {
        // TODO: remove replace when parsing behaviour will be made according to locale
        // Replace ',' by '.' to ensure double values can be parsed correctly
        setRatedNominalPower(event.target.value?.replace(',', '.'));
    };

    const handleChangeActivePowerSetpoint = (event) => {
        // TODO: remove replace when parsing behaviour will be made according to locale
        // Replace ',' by '.' to ensure double values can be parsed correctly
        setActivePowerSetpoint(event.target.value?.replace(',', '.'));
    };

    const handleChangeReactivePowerSetpoint = (event) => {
        // TODO: remove replace when parsing behaviour will be made according to locale
        // Replace ',' by '.' to ensure double values can be parsed correctly
        setReactivePowerSetpoint(event.target.value?.replace(',', '.'));
    };

    const handleChangeVoltageRegulation = (event) => {
        setVoltageRegulation(event.target.checked);
        setEnabledReactivePowerSetpoint(!event.target.checked);
        setEnabledVoltageSetpoint(event.target.checked);

        let tmpErrors = new Map(errors);
        if (event.target.checked) {
            setReactivePowerSetpoint('');
            tmpErrors.set('reactive-power-set-point', {
                error: false,
                errorMsgId: '',
            });
        } else {
            setVoltageSetpoint('');
            tmpErrors.set('voltage-set-point', {
                error: false,
                errorMsgId: '',
            });
        }
        setErrors(tmpErrors);
    };

    const handleChangeVoltageSetpoint = (event) => {
        // TODO: remove replace when parsing behaviour will be made according to locale
        // Replace ',' by '.' to ensure double values can be parsed correctly
        setVoltageSetpoint(event.target.value?.replace(',', '.'));
    };

    const checkMinMaxPower = (minPower, maxPower) => {
        if (maxPower) {
            if (Number(minPower) > Number(maxPower)) {
                return {
                    error: true,
                    errorMsgId: 'MinActivePowerLessThanMaxActivePower',
                };
            } else {
                return { error: false, errorMsgId: '' };
            }
        } else {
            return { error: false, errorMsgId: '' };
        }
    };

    const checkRatedNominalPower = (ratedPower) => {
        if (ratedPower) {
            if (Number(ratedPower) <= 0) {
                return {
                    error: true,
                    errorMsgId: 'RatedNominalPowerGreaterThanZero',
                };
            } else {
                return { error: false, errorMsgId: '' };
            }
        } else {
            return { error: false, errorMsgId: '' };
        }
    };

    const checkVoltageSetpoint = (vSetpoint) => {
        if (vSetpoint) {
            if (Number(vSetpoint) <= 0) {
                return {
                    error: true,
                    errorMsgId: 'VoltageGreaterThanZero',
                };
            } else {
                return { error: false, errorMsgId: '' };
            }
        } else {
            return { error: false, errorMsgId: '' };
        }
    };

    const handleSave = () => {
        let tmpErrors = new Map(errors);

        tmpErrors.set(
            'generator-id',
            validateField(generatorId, {
                isFieldRequired: true,
            })
        );

        tmpErrors.set(
            'minimum-active-power',
            validateField(minimumActivePower, {
                isFieldRequired: true,
                isFieldNumeric: true,
                checkFieldValue: () => {
                    return checkMinMaxPower(
                        minimumActivePower,
                        maximumActivePower
                    );
                },
            })
        );

        tmpErrors.set(
            'maximum-active-power',
            validateField(maximumActivePower, {
                isFieldRequired: true,
                isFieldNumeric: true,
            })
        );

        tmpErrors.set(
            'rated-nominal-power',
            validateField(ratedNominalPower, {
                isFieldRequired: false,
                isFieldNumeric: true,
                checkFieldValue: () => {
                    return checkRatedNominalPower(ratedNominalPower);
                },
            })
        );

        tmpErrors.set(
            'active-power-set-point',
            validateField(activePowerSetpoint, {
                isFieldRequired: true,
                isFieldNumeric: true,
            })
        );

        tmpErrors.set(
            'reactive-power-set-point',
            validateField(reactivePowerSetpoint, {
                isFieldRequired: !voltageRegulation,
                isFieldNumeric: true,
            })
        );

        tmpErrors.set(
            'voltage-set-point',
            validateField(voltageSetpoint, {
                isFieldRequired: voltageRegulation,
                isFieldNumeric: true,
                checkFieldValue: () => {
                    return checkVoltageSetpoint(voltageSetpoint);
                },
            })
        );

        tmpErrors.set(
            'voltage-level',
            validateField(voltageLevel, {
                isFieldRequired: true,
            })
        );

        tmpErrors.set(
            'bus-bar',
            validateField(busOrBusbarSection, {
                isFieldRequired: true,
            })
        );

        setErrors(tmpErrors);

        // Check if error list contains an error
        let isValid =
            Array.from(tmpErrors.values()).findIndex((err) => err.error) === -1;

        if (isValid) {
            createGenerator(
                studyUuid,
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
                voltageLevel.id,
                busOrBusbarSection.id
            )
                .then(() => {
                    handleCloseAndClear();
                })
                .catch((errorMessage) => {
                    displayErrorMessageWithSnackbar({
                        errorMessage: errorMessage,
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId: 'GeneratorCreationError',
                            intlRef: intlRef,
                        },
                    });
                });
        }
    };

    const clearValues = () => {
        setGeneratorId('');
        setGeneratorName('');
        setEnergySource('');
        setMinimumActivePower('');
        setMaximumActivePower('');
        setRatedNominalPower('');
        setActivePowerSetpoint('');
        setReactivePowerSetpoint('');
        setVoltageRegulation(false);
        setVoltageSetpoint('');
        setVoltageLevel(null);
        setBusOrBusbarSection(null);
        setBusOrBusbarSectionOptions([]);
    };

    const handleCloseAndClear = () => {
        clearValues();
        handleClose();
    };

    const handleClose = () => {
        setErrors(new Map());
        onClose();
    };

    return (
        <Dialog
            classes={{ paper: classes.dialogPaper }}
            open={open}
            onClose={handleClose}
            aria-labelledby="dialog-create-generator"
        >
            <DialogTitle>
                {intl.formatMessage({ id: 'CreateGenerator' })}
            </DialogTitle>
            <DialogContent>
                <div className={classes.divDialog}>
                    <Grid container spacing={2}>
                        <Grid item xs={4} align="center">
                            <TextField
                                fullWidth
                                id="generator-id"
                                label={intl.formatMessage({ id: 'ID' })}
                                variant="filled"
                                value={generatorId}
                                onChange={handleChangeGenertorId}
                                /* Ensures no margin for error message (as when variant "filled" is used, a margin seems to be automatically applied to error message
                               which is not the case when no variant is used) */
                                FormHelperTextProps={{
                                    className: classes.helperText,
                                }}
                                {...(errors.get('generator-id')?.error && {
                                    error: true,
                                    helperText: intl.formatMessage({
                                        id: errors.get('generator-id')
                                            ?.errorMsgId,
                                    }),
                                })}
                            />
                        </Grid>
                        <Grid item xs={4} align="center">
                            <TextField
                                id="generator-name"
                                label={intl.formatMessage({
                                    id: 'NameOptional',
                                })}
                                defaultValue=""
                                value={generatorName}
                                onChange={handleChangeGeneratorName}
                                variant="filled"
                            />
                        </Grid>
                        <Grid item xs={4} align="center">
                            <FormControl fullWidth>
                                {/*This InputLabel is necessary in order to display
                                   the label describing the content of the Select*/}
                                <InputLabel
                                    id="energy-source-label"
                                    variant={'filled'}
                                >
                                    {intl.formatMessage({
                                        id: 'EnergySourceOptional',
                                    })}
                                </InputLabel>
                                <Select
                                    id="energy-source"
                                    value={energySource}
                                    onChange={handleChangeEnergySource}
                                    variant="filled"
                                    fullWidth
                                >
                                    <MenuItem value="">
                                        <em>
                                            {intl.formatMessage({ id: 'None' })}
                                        </em>
                                    </MenuItem>
                                    <MenuItem value={'HYDRO'}>
                                        {intl.formatMessage({ id: 'Hydro' })}
                                    </MenuItem>
                                    <MenuItem value={'NUCLEAR'}>
                                        {intl.formatMessage({ id: 'Nuclear' })}
                                    </MenuItem>
                                    <MenuItem value={'WIND'}>
                                        {intl.formatMessage({ id: 'Wind' })}
                                    </MenuItem>
                                    <MenuItem value={'THERMAL'}>
                                        {intl.formatMessage({ id: 'Thermal' })}
                                    </MenuItem>
                                    <MenuItem value={'SOLAR'}>
                                        {intl.formatMessage({ id: 'Solar' })}
                                    </MenuItem>
                                    <MenuItem value={'OTHER'}>
                                        {intl.formatMessage({ id: 'Other' })}
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <br />
                    <br />
                    <FormattedMessage id="Limits" />
                    <Grid container spacing={2}>
                        <Grid item xs={4} align="start">
                            <TextFieldWithAdornment
                                id="minimum-active-power"
                                label={intl.formatMessage({
                                    id: 'MinimumActivePowerText',
                                })}
                                adornmentPosition={'end'}
                                adornmentText={'MW'}
                                value={minimumActivePower}
                                onChange={handleChangeMinimumActivePower}
                                defaultValue=""
                                {...(errors.get('minimum-active-power')
                                    ?.error && {
                                    error: true,
                                    helperText: intl.formatMessage({
                                        id: errors.get('minimum-active-power')
                                            ?.errorMsgId,
                                    }),
                                })}
                            />
                        </Grid>
                        <Grid item xs={4} align="start">
                            <TextFieldWithAdornment
                                id="maximum-active-power"
                                label={intl.formatMessage({
                                    id: 'MaximumActivePowerText',
                                })}
                                adornmentPosition={'end'}
                                adornmentText={'MW'}
                                value={maximumActivePower}
                                onChange={handleChangeMaximumActivePower}
                                defaultValue=""
                                {...(errors.get('maximum-active-power')
                                    ?.error && {
                                    error: true,
                                    helperText: intl.formatMessage({
                                        id: errors.get('maximum-active-power')
                                            ?.errorMsgId,
                                    }),
                                })}
                            />
                        </Grid>
                        <Grid item xs={4} align="start">
                            <TextFieldWithAdornment
                                id="rated-nominal-power"
                                label={intl.formatMessage({
                                    id: 'RatedNominalPowerText',
                                })}
                                adornmentPosition={'end'}
                                adornmentText={'MVA'}
                                value={ratedNominalPower}
                                onChange={handleChangeRatedNominalPower}
                                defaultValue=""
                                {...(errors.get('rated-nominal-power')
                                    ?.error && {
                                    error: true,
                                    helperText: intl.formatMessage({
                                        id: errors.get('rated-nominal-power')
                                            ?.errorMsgId,
                                    }),
                                })}
                            />
                        </Grid>
                    </Grid>
                    <br />
                    <br />
                    <FormattedMessage id="Setpoints" />
                    <Grid container spacing={2}>
                        <Grid item xs={4} align="start">
                            <TextFieldWithAdornment
                                id="active-power-set-point"
                                label={intl.formatMessage({
                                    id: 'ActivePowerText',
                                })}
                                adornmentPosition={'end'}
                                adornmentText={'MW'}
                                value={activePowerSetpoint}
                                onChange={handleChangeActivePowerSetpoint}
                                defaultValue=""
                                {...(errors.get('active-power-set-point')
                                    ?.error && {
                                    error: true,
                                    helperText: intl.formatMessage({
                                        id: errors.get('active-power-set-point')
                                            ?.errorMsgId,
                                    }),
                                })}
                            />
                        </Grid>
                        <Grid item xs={4} align="start">
                            <TextFieldWithAdornment
                                id="reactive-power-set-point"
                                label={intl.formatMessage({
                                    id: 'ReactivePowerText',
                                })}
                                adornmentPosition={'end'}
                                adornmentText={'MVar'}
                                disabled={!enabledReactivePowerSetpoint}
                                value={reactivePowerSetpoint}
                                onChange={handleChangeReactivePowerSetpoint}
                                defaultValue=""
                                {...(errors.get('reactive-power-set-point')
                                    ?.error && {
                                    error: true,
                                    helperText: intl.formatMessage({
                                        id: errors.get(
                                            'reactive-power-set-point'
                                        )?.errorMsgId,
                                    }),
                                })}
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={4} align="start">
                            <FormControlLabel
                                className={classes.voltageRegulation}
                                id="voltage-regulation"
                                control={
                                    <Switch
                                        checked={voltageRegulation}
                                        onChange={(e) =>
                                            handleChangeVoltageRegulation(e)
                                        }
                                        value="checked"
                                        color="primary"
                                        inputProps={{
                                            'aria-label': 'primary checkbox',
                                        }}
                                    />
                                }
                                label={intl.formatMessage({
                                    id: 'VoltageRegulationText',
                                })}
                            />
                        </Grid>
                        <Grid item xs={4} align="start">
                            <TextFieldWithAdornment
                                id="voltage-set-point"
                                label={intl.formatMessage({
                                    id: 'VoltageText',
                                })}
                                adornmentPosition={'end'}
                                adornmentText={'kV'}
                                disabled={!enabledVoltageSetpoint}
                                value={voltageSetpoint}
                                onChange={handleChangeVoltageSetpoint}
                                defaultValue=""
                                {...(errors.get('voltage-set-point')?.error && {
                                    error: true,
                                    helperText: intl.formatMessage({
                                        id: errors.get('voltage-set-point')
                                            ?.errorMsgId,
                                    }),
                                })}
                            />
                        </Grid>
                    </Grid>
                    <br />
                    <br />

                    {/* Connectivity part */}
                    <ConnectivityDialog
                        network={network}
                        voltageLevel={voltageLevel}
                        busOrBusbarSection={busOrBusbarSection}
                        busOrBusbarSectionOptions={busOrBusbarSectionOptions}
                        errors={errors}
                        changeBusOrBusbarSectionOptions={(
                            busOrBusbarSectionOptions
                        ) =>
                            setBusOrBusbarSectionOptions(
                                busOrBusbarSectionOptions
                            )
                        }
                        changeVoltageLevel={(value) => setVoltageLevel(value)}
                        changeBusOrBusbarSection={(busOrBusbarSection) =>
                            setBusOrBusbarSection(busOrBusbarSection)
                        }
                    />
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
    network: PropTypes.object.isRequired,
};

export default GeneratorCreationDialog;
