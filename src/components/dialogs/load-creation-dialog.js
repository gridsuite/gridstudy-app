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
    Popper,
    Select,
    TextField,
} from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import { Autocomplete } from '@material-ui/lab';
import TextFieldWithAdornment from '../util/text-field-with-adornment';
import { useParams } from 'react-router-dom';
import {
    createLoad,
    fetchBusbarSectionsForVoltageLevel,
    fetchBusesForVoltageLevel,
} from '../../utils/rest-api';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';
import { useSnackbar } from 'notistack';
import { validateField } from '../util/validation-functions';

/**
 * Dialog to create a load in the network
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param {String} title Title of the dialog
 */
const LoadCreationDialog = ({ open, onClose, network }) => {
    const styles = () => ({
        popper: {
            width: 'fit-content',
        },
    });

    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const intl = useIntl();
    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const [busOrBusbarSectionOptions, setBusOrBusbarSectionOptions] = useState(
        []
    );

    const [loadId, setLoadId] = useState('');

    const [loadName, setLoadName] = useState('');

    const [loadType, setLoadType] = useState('');

    const [activePower, setActivePower] = useState('');

    const [reactivePower, setReactivePower] = useState('');

    const [voltageLevel, setVoltageLevel] = useState('');

    const [busOrBusbarSection, setBusOrBusbarSection] = useState('');

    const [errors, setErrors] = useState(new Map());

    const handleChangeLoadId = (event) => {
        setLoadId(event.target.value);
    };

    const handleChangeLoadName = (event) => {
        setLoadName(event.target.value);
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
        if (reason === 'input') {
            setVoltageLevel({ id: value });
        } else {
            setVoltageLevel(value);
        }
        if (value?.topologyKind === 'NODE_BREAKER') {
            // TODO specify the correct network variant num
            fetchBusbarSectionsForVoltageLevel(studyUuid, 0, value.id).then(
                (busbarSections) => {
                    setBusOrBusbarSectionOptions(busbarSections);
                }
            );
        } else if (value?.topologyKind === 'BUS_BREAKER') {
            // TODO specify the correct network variant num
            fetchBusesForVoltageLevel(studyUuid, 0, value.id).then((buses) =>
                setBusOrBusbarSectionOptions(buses)
            );
        } else {
            setBusOrBusbarSectionOptions([]);
        }
    };

    const handleChangeBus = (event, value, reason) => {
        if (reason === 'input') {
            setBusOrBusbarSection({ id: value });
        } else {
            setBusOrBusbarSection(value);
        }
    };

    const handleSave = () => {
        let tmpErrors = new Map(errors);

        tmpErrors.set(
            'load-id',
            validateField(loadId, {
                isFieldRequired: true,
            })
        );

        tmpErrors.set(
            'active-power',
            validateField(activePower, {
                isFieldRequired: true,
                isFieldNumeric: true,
            })
        );

        tmpErrors.set(
            'reactive-power',
            validateField(reactivePower, {
                isFieldRequired: true,
                isFieldNumeric: true,
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
            createLoad(
                studyUuid,
                loadId,
                loadName,
                !loadType ? 'UNDEFINED' : loadType,
                activePower,
                reactivePower,
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
                            headerMessageId: 'LoadCreationError',
                            intlRef: intlRef,
                        },
                    });
                });
        }
    };

    const clearValues = () => {
        setLoadId('');
        setLoadName('');
        setLoadType('');
        setActivePower('');
        setReactivePower('');
        setVoltageLevel('');
        setBusOrBusbarSection('');
        setBusOrBusbarSectionOptions([]);
    };

    const handleCloseAndClear = () => {
        clearValues();
        setErrors(new Map());
        onClose();
    };

    const handleClose = () => {
        setErrors(new Map());
        onClose();
    };

    const FittingPopper = (props) => {
        return (
            <Popper {...props} style={styles.popper} placement="bottom-start" />
        );
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
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
                            value={loadId}
                            onChange={handleChangeLoadId}
                            {...(errors.get('load-id')?.error && {
                                error: true,
                                helperText: intl.formatMessage({
                                    id: errors.get('load-id')?.errorMsgId,
                                }),
                            })}
                        />
                    </Grid>
                    <Grid item xs={4} align="center">
                        <TextField
                            id="load-name"
                            label={intl.formatMessage({ id: 'NameOptional' })}
                            defaultValue=""
                            value={loadName}
                            onChange={handleChangeLoadName}
                            variant="filled"
                        />
                    </Grid>
                    <Grid item xs={4} align="center">
                        <FormControl fullWidth>
                            <InputLabel id="load-type-label" variant={'filled'}>
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
                            {...(errors.get('active-power')?.error && {
                                error: true,
                                helperText: intl.formatMessage({
                                    id: errors.get('active-power')?.errorMsgId,
                                }),
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
                            adornmentText={'MVar'}
                            value={reactivePower}
                            onChange={handleChangeReactivePower}
                            defaultValue=""
                            {...(errors.get('reactive-power')?.error && {
                                error: true,
                                helperText: intl.formatMessage({
                                    id: errors.get('reactive-power')
                                        ?.errorMsgId,
                                }),
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
                            freeSolo
                            forcePopupIcon
                            id="voltage-level"
                            size="small"
                            options={network?.voltageLevels}
                            getOptionLabel={(vl) => vl.id}
                            value={voltageLevel}
                            onChange={handleChangeVoltageLevel}
                            onInputChange={handleChangeVoltageLevel}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    label={intl.formatMessage({
                                        id: 'VoltageLevel',
                                    })}
                                    {...(errors.get('voltage-level')?.error && {
                                        error: true,
                                        helperText: intl.formatMessage({
                                            id: errors.get('voltage-level')
                                                ?.errorMsgId,
                                        }),
                                    })}
                                />
                            )}
                            PopperComponent={FittingPopper}
                        />
                    </Grid>
                    <Grid item xs={4} align="center">
                        <Autocomplete
                            freeSolo
                            forcePopupIcon
                            id="bus"
                            size="small"
                            disabled={!voltageLevel}
                            options={busOrBusbarSectionOptions}
                            getOptionLabel={(busOrBusbarSection) =>
                                busOrBusbarSection?.id
                            }
                            value={busOrBusbarSection}
                            onChange={handleChangeBus}
                            onInputChange={handleChangeBus}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    label={intl.formatMessage({
                                        id: 'BusBarBus',
                                    })}
                                    {...(errors.get('bus-bar')?.error && {
                                        error: true,
                                        helperText: intl.formatMessage({
                                            id: errors.get('bus-bar')
                                                ?.errorMsgId,
                                        }),
                                    })}
                                />
                            )}
                            PopperComponent={FittingPopper}
                        />
                    </Grid>
                </Grid>
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

LoadCreationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    network: PropTypes.object.isRequired,
};

export default LoadCreationDialog;
