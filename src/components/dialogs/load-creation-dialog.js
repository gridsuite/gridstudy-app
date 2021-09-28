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
import {
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import InputAdornment from '@material-ui/core/InputAdornment';

/**
 * Dialog to create a load in the network
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param {String} title Title of the dialog
 */
const LoadCreationDialog = ({ open, onClose, title }) => {
    const intl = useIntl();

    const [loadId, setLoadId] = useState('');

    const [loadType, setLoadType] = useState('');

    const [voltageLevel, setVoltageLevel] = useState('');

    const [bus, setBus] = useState('');

    const [errors, setErrors] = useState({});

    const handleChangeLoadType = (event) => {
        setLoadType(event.target.value);
    };

    const handleChangeLoadId = (event) => {
        setLoadId(event.target.value);
    };

    const handleChangeVoltageLevel = (event) => {
        setVoltageLevel(event.target.value);
    };

    const handleChangeBus = (event) => {
        setBus(event.target.value);
    };

    const handleSave = () => {
        let tmpErrors = { ...errors };

        if (loadId === '') {
            tmpErrors['load-id'] = true;
        }
        else {
            handleClose();
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
                            required
                            id="load-id"
                            label={intl.formatMessage({ id: 'ID' })}
                            variant="filled"
                            color="secondary"
                            value={loadId}
                            onChange={handleChangeLoadId}
                            {...(errors['load-id'] && {
                                error: true,
                                helperText: 'This field is required',
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
                <FormattedMessage id="Setpoints" />
                <Grid container spacing={2}>
                    <Grid item xs={4} align="center">
                        <TextField
                            required
                            id="load-active-power"
                            label={intl.formatMessage({
                                id: 'ActivePowerText',
                            })}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        MW
                                    </InputAdornment>
                                ),
                            }}
                            defaultValue=""
                        />
                    </Grid>
                    <Grid item xs={4} align="center">
                        <TextField
                            required
                            id="load-reactive-power"
                            label={intl.formatMessage({
                                id: 'ReactivePowerText',
                            })}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        MW
                                    </InputAdornment>
                                ),
                            }}
                            defaultValue=""
                        />
                    </Grid>
                </Grid>
                <FormattedMessage id="Connectivity" />
                <Grid container spacing={2}>
                    <Grid item xs={4} align="center">
                        <FormControl fullWidth>
                            <InputLabel
                                id="voltage-level-label"
                                margin={'dense'}
                            >
                                {intl.formatMessage({ id: 'VoltageLevel' })}
                            </InputLabel>
                            <Select
                                id="voltage-level"
                                value={voltageLevel}
                                onChange={handleChangeVoltageLevel}
                                variant="filled"
                                fullWidth
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={4} align="center">
                        <FormControl fullWidth>
                            <InputLabel id="bus-label" margin={'dense'}>
                                {intl.formatMessage({ id: 'BusBarBus' })}
                            </InputLabel>
                            <Select
                                id="bus"
                                value={bus}
                                onChange={handleChangeBus}
                                variant="filled"
                                fullWidth
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                            </Select>
                        </FormControl>
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
};

export default LoadCreationDialog;
