/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Tooltip,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';
import {
    createLoad,
    fetchEquipmentsInfos,
    fetchLoadInfos,
} from '../../utils/rest-api';
import TextFieldWithAdornment from '../util/text-field-with-adornment';
import { makeErrorHelper, validateField } from '../util/validation-functions';
import ConnectivityEdition from './connectivity-edition';
import { PARAM_USE_NAME } from '../../utils/config-params';
import FindInPageIcon from '@material-ui/icons/FindInPage';
import {
    equipmentStyles,
    getEquipmentsInfosForSearchBar,
    renderEquipmentForSearchBar,
    ElementSearchDialog,
} from '@gridsuite/commons-ui';

const useStyles = makeStyles((theme) => ({
    helperText: {
        margin: 0,
        marginTop: 4,
    },
    h3: {
        marginBottom: 0,
        paddingBottom: 1,
    },
    tooltip: {
        fontSize: 18,
        maxWidth: 'none',
    },
}));

const useEquipmentStyles = makeStyles(equipmentStyles);

/**
 * Dialog to create a load in the network
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param voltageLevelOptions : the network voltageLevels available
 * @param selectedNodeUuid : the currently selected tree node
 * @param workingNodeUuid : the node we are currently working on
 */
const LoadCreationDialog = ({
    open,
    onClose,
    voltageLevelOptions,
    selectedNodeUuid,
    workingNodeUuid,
}) => {
    const classes = useStyles();

    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const intl = useIntl();
    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const [loadId, setLoadId] = useState('');

    const [loadName, setLoadName] = useState('');

    const [loadType, setLoadType] = useState('');

    const [activePower, setActivePower] = useState('');

    const [reactivePower, setReactivePower] = useState('');

    const [voltageLevel, setVoltageLevel] = useState(null);

    const [busOrBusbarSection, setBusOrBusbarSection] = useState(null);

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
        // TODO: remove replace when parsing behaviour will be made according to locale
        // Replace ',' by '.' to ensure double values can be parsed correctly
        setActivePower(event.target.value?.replace(',', '.'));
    };

    const handleChangeReactivePower = (event) => {
        // TODO: remove replace when parsing behaviour will be made according to locale
        // Replace ',' by '.' to ensure double values can be parsed correctly
        setReactivePower(event.target.value?.replace(',', '.'));
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
                selectedNodeUuid,
                loadId,
                loadName ? loadName : null,
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
        setVoltageLevel(null);
        setBusOrBusbarSection(null);
    };

    const handleCloseAndClear = () => {
        clearValues();
        handleClose();
    };

    const handleClose = () => {
        setErrors(new Map());
        onClose();
    };

    //Search bar
    const equipmentClasses = useEquipmentStyles();

    const useNameLocal = useState(PARAM_USE_NAME);

    const [isDialogSearchOpen, setDialogSearchOpen] = useState(false);
    const [equipmentsFound, setEquipmentsFound] = useState([]);

    const handleOpenSearchDialog = () => {
        setDialogSearchOpen(true);
    };

    const handleSelectionChange = (element) => {
        fetchLoadInfos(studyUuid, workingNodeUuid, element.id)
            .then((load) => {
                setLoadId(load.id);
                setLoadName(load.name);
                setLoadType(load.type);
                setActivePower(load.p0);
                setReactivePower(load.q0);
                setVoltageLevel(
                    voltageLevelOptions.find(
                        (value) => value.id === load.voltageLevelId
                    )
                );
            })
            .then(() => {
                let msg = intl.formatMessage(
                    { id: 'LoadCopied' },
                    {
                        loadId: element.id,
                    }
                );
                enqueueSnackbar(msg, {
                    variant: 'info',
                    persist: false,
                    style: { whiteSpace: 'pre-line' },
                });
            });
        setDialogSearchOpen(false);
    };

    const searchMatchingEquipments = useCallback(
        (searchTerm) => {
            fetchEquipmentsInfos(
                studyUuid,
                workingNodeUuid,
                searchTerm,
                useNameLocal,
                'LOAD'
            )
                .then((infos) =>
                    setEquipmentsFound(
                        getEquipmentsInfosForSearchBar(infos, useNameLocal)
                    )
                )
                .catch((errorMessage) =>
                    displayErrorMessageWithSnackbar({
                        errorMessage: errorMessage,
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId: 'equipmentsSearchingError',
                            intlRef: intlRef,
                        },
                    })
                );
        },
        [studyUuid, workingNodeUuid, useNameLocal, enqueueSnackbar, intlRef]
    );

    return (
        <>
            <Dialog
                fullWidth
                maxWidth="md" // 3 columns
                open={open}
                onClose={handleClose}
                aria-labelledby="dialog-create-load"
            >
                <DialogTitle>
                    <Grid container spacing={1}>
                        <Grid item>
                            {intl.formatMessage({ id: 'CreateLoad' })}
                        </Grid>
                        <Grid item>
                            <Tooltip
                                title={intl.formatMessage({
                                    id: 'CopyFromExisting',
                                })}
                                placement="top"
                                arrow
                                enterDelay={500}
                                enterNextDelay={500}
                                classes={{ tooltip: classes.tooltip }}
                            >
                                <Button onClick={handleOpenSearchDialog}>
                                    <FindInPageIcon />
                                </Button>
                            </Tooltip>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={4} align="start">
                            <TextField
                                size="small"
                                fullWidth
                                id="load-id"
                                label={intl.formatMessage({ id: 'ID' })}
                                variant="filled"
                                value={loadId}
                                onChange={handleChangeLoadId}
                                /* Ensures no margin for error message (as when variant "filled" is used, a margin seems to be automatically applied to error message
                                   which is not the case when no variant is used) */
                                FormHelperTextProps={{
                                    className: classes.helperText,
                                }}
                                {...(errors.get('load-id')?.error && {
                                    error: true,
                                    helperText: intl.formatMessage({
                                        id: errors.get('load-id')?.errorMsgId,
                                    }),
                                })}
                            />
                        </Grid>
                        <Grid item xs={4} align="start">
                            <TextField
                                size="small"
                                fullWidth
                                id="load-name"
                                label={intl.formatMessage({
                                    id: 'NameOptional',
                                })}
                                value={loadName}
                                onChange={handleChangeLoadName}
                                variant="filled"
                            />
                        </Grid>
                        <Grid item xs={4} align="start">
                            <FormControl fullWidth size="small">
                                {/*This InputLabel is necessary in order to display
                                the label describing the content of the Select*/}
                                <InputLabel
                                    id="load-type-label"
                                    variant={'filled'}
                                >
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
                                        <em>
                                            {intl.formatMessage({ id: 'None' })}
                                        </em>
                                    </MenuItem>
                                    <MenuItem value={'UNDEFINED'}>
                                        {intl.formatMessage({
                                            id: 'UndefinedDefaultValue',
                                        })}
                                    </MenuItem>
                                    <MenuItem value={'AUXILIARY'}>
                                        {intl.formatMessage({
                                            id: 'Auxiliary',
                                        })}
                                    </MenuItem>
                                    <MenuItem value={'FICTITIOUS'}>
                                        {intl.formatMessage({
                                            id: 'Fictitious',
                                        })}
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <h3 className={classes.h3}>
                                <FormattedMessage id="Setpoints" />
                            </h3>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={4} align="start">
                            <TextFieldWithAdornment
                                size="small"
                                fullWidth
                                id="load-active-power"
                                label={intl.formatMessage({
                                    id: 'ActivePowerText',
                                })}
                                adornmentPosition={'end'}
                                adornmentText={'MW'}
                                value={activePower}
                                onChange={handleChangeActivePower}
                                {...(errors.get('active-power')?.error && {
                                    error: true,
                                    helperText: intl.formatMessage({
                                        id: errors.get('active-power')
                                            ?.errorMsgId,
                                    }),
                                })}
                            />
                        </Grid>
                        <Grid item xs={4} align="start">
                            <TextFieldWithAdornment
                                size="small"
                                fullWidth
                                id="load-reactive-power"
                                label={intl.formatMessage({
                                    id: 'ReactivePowerText',
                                })}
                                adornmentPosition={'end'}
                                adornmentText={'MVar'}
                                value={reactivePower}
                                onChange={handleChangeReactivePower}
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
                    {/* Connectivity part */}
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <h3 className={classes.h3}>
                                <FormattedMessage id="Connectivity" />
                            </h3>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={8} align="start">
                            <ConnectivityEdition
                                voltageLevelOptions={voltageLevelOptions}
                                voltageLevel={voltageLevel}
                                busOrBusbarSection={busOrBusbarSection}
                                onChangeVoltageLevel={(value) =>
                                    setVoltageLevel(value)
                                }
                                onChangeBusOrBusbarSection={(
                                    busOrBusbarSection
                                ) => setBusOrBusbarSection(busOrBusbarSection)}
                                errorVoltageLevel={
                                    errors.get('voltage-level')?.error
                                }
                                helperTextVoltageLevel={makeErrorHelper(
                                    errors,
                                    intl,
                                    'voltage-level'
                                )}
                                errorBusOrBusBarSection={
                                    errors.get('bus-bar')?.error
                                }
                                helperTextBusOrBusBarSection={makeErrorHelper(
                                    errors,
                                    intl,
                                    'bus-bar-level'
                                )}
                                workingNodeUuid={workingNodeUuid}
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
            <ElementSearchDialog
                open={isDialogSearchOpen}
                onClose={() => setDialogSearchOpen(false)}
                searchingLabel={intl.formatMessage({
                    id: 'equipment_search/label',
                })}
                onSearchTermChange={searchMatchingEquipments}
                onSelectionChange={(element) => {
                    handleSelectionChange(element);
                }}
                elementsFound={equipmentsFound}
                renderElement={renderEquipmentForSearchBar(
                    equipmentClasses,
                    intl
                )}
            />
        </>
    );
};

LoadCreationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    voltageLevelOptions: PropTypes.arrayOf(PropTypes.object),
    selectedNodeUuid: PropTypes.string,
    workingNodeUuid: PropTypes.string,
};

export default LoadCreationDialog;
