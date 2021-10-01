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
import { Autocomplete } from '@material-ui/lab';
import TextFieldWithAdornment from '../util/text-field-with-adornment';

/**
 * Dialog to create a load in the network
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param {String} title Title of the dialog
 */
const LoadCreationDialog = ({ open, onClose, network }) => {
    const intl = useIntl();

    const [loadId, setLoadId] = useState('');

    const [loadType, setLoadType] = useState('');

    const [activePower, setActivePower] = useState('');

    const [reactivePower, setReactivePower] = useState('');

    const [voltageLevel, setVoltageLevel] = useState('');

    const [bus, setBus] = useState('');

    const [errors, setErrors] = useState({});

    const handleChangeLoadId = (event) => {
        setLoadId(event.target.value);
    };

    const handleChangeLoadType = (event) => {
        setLoadType(event.target.value);
    };

    const handleChangeActivePower = (event) => {
        setActivePower(event.target.value);
    };

    const handleChangeReactivePower = (event) => {
        setReactivePower(event.target.value);
    };

    const handleChangeVoltageLevel = (event, value, reason) => {
        setVoltageLevel(value);
    };

    const handleChangeBus = (event) => {
        setBus(event.target.value);
    };

    const handleSave = () => {
        console.log('NNO', voltageLevel);
        let tmpErrors = { ...errors };

        if (!loadId) {
            tmpErrors['load-id'] = {
                error: true,
                errorText: intl.formatMessage({ id: 'FieldIsRequired' }),
            };
        } else {
            tmpErrors['load-id'] = { error: false, errorText: '' };
        }

        if (!activePower) {
            tmpErrors['active-power'] = {
                error: true,
                errorText: intl.formatMessage({
                    id: 'FieldIsRequired',
                }),
            };
        } else {
            let activePowerVal = Number(activePower.replace(',', '.'));
            if (isNaN(activePowerVal)) {
                tmpErrors['active-power'] = {
                    error: true,
                    errorText: intl.formatMessage({ id: 'FieldAcceptNumeric' }),
                };
            } else {
                tmpErrors['active-power'] = { error: false, errorText: '' };
            }
        }

        if (!reactivePower) {
            tmpErrors['reactive-power'] = {
                error: true,
                errorText: intl.formatMessage({
                    id: 'FieldIsRequired',
                }),
            };
        } else {
            let reactivePowerVal = Number(reactivePower.replace(',', '.'));
            if (isNaN(reactivePowerVal)) {
                tmpErrors['reactive-power'] = {
                    error: true,
                    errorText: intl.formatMessage({ id: 'FieldAcceptNumeric' }),
                };
            } else {
                tmpErrors['reactive-power'] = { error: false, errorText: '' };
            }
        }

        if (!voltageLevel) {
            tmpErrors['voltage-level'] = {
                error: true,
                errorText: intl.formatMessage({
                    id: 'FieldIsRequired',
                }),
            };
        } else {
            tmpErrors['voltage-level'] = { error: false, errorText: '' };
        }

        if (!bus) {
            tmpErrors['bus-bar'] = {
                error: true,
                errorText: intl.formatMessage({ id: 'FieldIsRequired' }),
            };
        } else {
            tmpErrors['bus-bar'] = { error: false, errorText: '' };
        }
        setErrors({ ...tmpErrors });
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    const handleExited = () => {
        setErrors({});
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            onExited={handleExited}
            aria-labelledby="dialog-create-load"
        >
            <DialogTitle>
                {intl.formatMessage({ id: 'CreateLoad' })}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={4} align="center">
                        <TextField
                            fullWidth
                            id="load-id"
                            label={intl.formatMessage({ id: 'ID' })}
                            variant="filled"
                            color="secondary"
                            value={loadId}
                            onChange={handleChangeLoadId}
                            {...(errors['load-id']?.error && {
                                error: true,
                                helperText: errors['load-id']?.errorText,
                            })}
                        />
                    </Grid>
                    <Grid item xs={4} align="center">
                        <TextField
                            id="load-name"
                            label={intl.formatMessage({ id: 'NameOptional' })}
                            defaultValue=""
                            variant="filled"
                        />
                    </Grid>
                    <Grid item xs={4} align="center">
                        <FormControl fullWidth>
                            <InputLabel id="load-type-label" margin={'dense'}>
                                {intl.formatMessage({ id: 'TypeOptional' })}
                            </InputLabel>
                            <Select
                                id="load-type"
                                value={loadType}
                                onChange={handleChangeLoadType}
                                variant="filled"
                                fullWidth
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                <MenuItem value={'UNDEFINED'}>
                                    {intl.formatMessage({
                                        id: 'UndefinedDefaultValue',
                                    })}
                                </MenuItem>
                                <MenuItem value={'AUXILIARY'}>
                                    {intl.formatMessage({ id: 'Auxiliary' })}
                                </MenuItem>
                                <MenuItem value={'FICTITIOUS'}>
                                    {intl.formatMessage({ id: 'Fictitious' })}
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
                <br />
                <br />
                <FormattedMessage id="Setpoints" />
                <Grid container spacing={2}>
                    <Grid item xs={4} align="center">
                        <TextFieldWithAdornment
                            id="load-active-power"
                            label={intl.formatMessage({
                                id: 'ActivePowerText',
                            })}
                            adornmentPosition={'end'}
                            adornmentText={'MW'}
                            value={activePower}
                            onChange={handleChangeActivePower}
                            defaultValue=""
                            {...(errors['active-power']?.error && {
                                error: true,
                                helperText: errors['active-power']?.errorText,
                            })}
                        />
                    </Grid>
                    <Grid item xs={4} align="center">
                        <TextFieldWithAdornment
                            id="load-reactive-power"
                            label={intl.formatMessage({
                                id: 'ReactivePowerText',
                            })}
                            adornmentPosition={'end'}
                            adornmentText={'MV'}
                            value={reactivePower}
                            onChange={handleChangeReactivePower}
                            defaultValue=""
                            {...(errors['reactive-power']?.error && {
                                error: true,
                                helperText: errors['reactive-power']?.errorText,
                            })}
                        />
                    </Grid>
                </Grid>
                <br />
                <br />
                <FormattedMessage id="Connectivity" />
                <Grid container spacing={2}>
                    <Grid item xs={4} align="center">
                        <Autocomplete
                            id="voltage-level"
                            size="small"
                            autoComplete
                            autoSelect
                            autoHighlight
                            options={network?.voltageLevels}
                            getOptionLabel={(vl) => vl.id}
                            value={voltageLevel}
                            onChange={handleChangeVoltageLevel}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    label={intl.formatMessage({
                                        id: 'VoltageLevel',
                                    })}
                                    {...(errors['voltage-level']?.error && {
                                        error: true,
                                        helperText:
                                            errors['voltage-level']?.errorText,
                                    })}
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={4} align="center">
                        <Autocomplete
                            id="bus"
                            size="small"
                            autoComplete
                            autoSelect
                            autoHighlight
                            options={[]}
                            getOptionLabel={(bus) => bus.id}
                            value={voltageLevel}
                            onChange={handleChangeBus}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    label={intl.formatMessage({
                                        id: 'BusBarBus',
                                    })}
                                    {...(errors['bus-bar']?.error && {
                                        error: true,
                                        helperText:
                                            errors['bus-bar']?.errorText,
                                    })}
                                />
                            )}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant="text">
                    <FormattedMessage id="close" />
                </Button>
                <Button onClick={handleSave} variant="text">
                    <FormattedMessage id="save" />
                </Button>
            </DialogActions>
        </Dialog>
    );
};

LoadCreationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    network: PropTypes.object.isRequired,
};

export default LoadCreationDialog;
