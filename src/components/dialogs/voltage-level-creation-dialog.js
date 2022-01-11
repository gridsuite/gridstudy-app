/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
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
import AddIcon from '@material-ui/icons/ControlPoint';
import DeleteIcon from '@material-ui/icons/Delete';
import PropTypes from 'prop-types';
import { Popper, TextField } from '@material-ui/core';
import TextFieldWithAdornment from '../util/text-field-with-adornment';
import { useParams } from 'react-router-dom';
import { createVoltageLevel } from '../../utils/rest-api';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';
import { useSnackbar } from 'notistack';
import { validateField } from '../util/validation-functions';
import { makeStyles } from '@material-ui/core/styles';
import { Autocomplete, createFilterOptions } from '@material-ui/lab';
import IconButton from '@material-ui/core/IconButton';

const useStyles = makeStyles((theme) => ({
    helperText: {
        margin: 0,
        marginTop: 4,
    },
    h3: {
        marginBottom: 0,
        paddingBottom: 1,
    },
    popper: {
        style: {
            width: 'fit-content',
        },
    },
    button: {
        justifyContent: 'flex-start',
        fontSize: 'small',
    },
    '& .MuiOutlinedInput-root': {
        paddingLeft: 0,
    },
}));

const filter = createFilterOptions();

function addCheckToBlock(sink, fieldVarInBlock, isReq = true, isNum = false) {
    let fieldVarName = Object.keys(fieldVarInBlock)[0];
    let fieldValue = fieldVarInBlock[fieldVarName];
    console.log('checking "' + fieldVarName + '" ' + isReq + ' ' + isNum);
    sink.set(
        fieldVarName,
        validateField(fieldValue, {
            isFieldRequired: isReq,
            isFieldNumeric: isNum,
        })
    );
}

/**
 * Dialog to create a voltage level in the network
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param substationOptions the available network sites
 * @param selectedNodeUuid the currently selected tree node
 */
const VoltageLevelCreationDialog = ({
    open,
    onClose,
    substationOptions,
    selectedNodeUuid,
}) => {
    const classes = useStyles();

    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const intl = useIntl();
    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const [voltageLevelId, setVoltageLevelId] = useState('');

    const [voltageLevelName, setVoltageLevelName] = useState('');

    const [nominalVoltage, setNominalVoltage] = useState('');

    const [substation, setSubstation] = useState('');

    const [busBarSections, setBusBarSections] = useState([]);

    const [connections, setConnections] = useState([]);

    const [errors, setErrors] = useState(new Map());

    const onIdChange = (event) => {
        setVoltageLevelId(event.target.value);
    };

    const onNameChange = (event) => {
        setVoltageLevelName(event.target.value);
    };

    const onBusBarIdChange = (idx, event) => {
        let newId = event.target.value;

        let indexIn = busBarSections.findIndex((v, i) => v.idx === idx);
        let prevBbs = busBarSections[indexIn];
        let nextBbs = { ...prevBbs, id: newId };

        let next = [...busBarSections];
        next[indexIn] = nextBbs;
        console.log(
            'onBusBarIdChange ' +
                JSON.stringify(nextBbs) +
                ' :\n ' +
                JSON.stringify(busBarSections) +
                '\n->\n' +
                JSON.stringify(next)
        );
        setBusBarSections(next);
    };

    const onBusBarNameChange = (idx, event) => {
        let newName = event.target.value;

        let indexIn = busBarSections.findIndex((v, i) => v.idx === idx);
        let prevBbs = busBarSections[indexIn];
        let nextBbs = { ...prevBbs, name: newName };

        let next = [...busBarSections];
        next[indexIn] = nextBbs;
        console.log(
            'onBusBarNameChange ' +
                JSON.stringify(nextBbs) +
                ' :\n ' +
                JSON.stringify(busBarSections) +
                '\n->\n' +
                JSON.stringify(next)
        );
        setBusBarSections(next);
    };

    const onBusBarFieldChange = (idx, event, fieldName) => {
        let newFieldValue = event.target.value;

        let indexIn = busBarSections.findIndex((v, i) => v.idx === idx);
        let prevBbs = busBarSections[indexIn];
        let nextBbs = { ...prevBbs };
        nextBbs[fieldName] = newFieldValue;

        let next = [...busBarSections];
        next[indexIn] = nextBbs;
        console.log(
            'onBusBarNameChange ' +
                fieldName +
                ' ' +
                JSON.stringify(nextBbs) +
                ' :\n ' +
                JSON.stringify(busBarSections) +
                '\n->\n' +
                JSON.stringify(next)
        );
        setBusBarSections(next);
    };

    const handleChangeNominalVoltage = (event) => {
        setNominalVoltage(event.target.value?.replace(',', '.'));
    };

    const handleChangeSubstation = (event, value, reason) => {
        setSubstation(value);
    };

    const handleCreateBusBarSection = () => {
        let idx =
            busBarSections.length === 0
                ? 0
                : busBarSections[busBarSections.length - 1].idx + 1;
        let nextBbs = { idx: idx, id: '', name: '', vertPos: -1, horizPos: -1 };
        let next = [...busBarSections, nextBbs];
        console.log(
            'Would have added a bus bar section ' +
                JSON.stringify(nextBbs) +
                ' :\n ' +
                JSON.stringify(busBarSections) +
                '\n->\n' +
                JSON.stringify(next)
        );
        setBusBarSections(next);
    };

    const handleDeleteBusBarSection = (bbs) => {
        let next = busBarSections.filter((v, i, arr) => v.idx !== bbs.idx);
        console.log(
            'Deletes bus bar section ' +
                JSON.stringify(bbs) +
                ' :\n ' +
                JSON.stringify(busBarSections) +
                '\n->\n' +
                JSON.stringify(next)
        );
        setBusBarSections(next);
    };

    const handleCreateConnection = () => {
        let idx = busBarSections.length;
        let next = [
            ...connections,
            { idx: idx, fromBBS: null, toBBS: null, cnxType: 'Breaker' },
        ];
        setConnections(next);
        console.log('Would have added a connection');
    };

    const handleDeleteConnection = (cnx) => {
        console.log('Would have deleted connection ' + cnx);
    };

    const FittingPopper = (props) => {
        return (
            <Popper
                {...props}
                style={classes.popper.style}
                placement="bottom-start"
            />
        );
    };

    const collectErrors = () => {
        let tmpErrors = new Map(errors);

        addCheckToBlock(tmpErrors, { voltageLevelId });
        addCheckToBlock(tmpErrors, { nominalVoltage }, true, true);
        addCheckToBlock(tmpErrors, { substation });

        console.log(
            'errors:' +
                JSON.stringify(errors, (key, value) =>
                    value instanceof Map ? [...value] : value
                )
        );
        return tmpErrors;
    };

    const updateErrors = () => {
        let tmpErrors = collectErrors();

        setErrors(tmpErrors);

        return tmpErrors;
    };

    const handleSave = () => {
        let tmpErrors = updateErrors();

        // Check if error list contains an error
        let isValid =
            Array.from(tmpErrors.values()).findIndex((err) => err.error) === -1;

        if (isValid) {
            createVoltageLevel(
                studyUuid,
                selectedNodeUuid,
                voltageLevelId,
                voltageLevelName ? voltageLevelName : null
            )
                .then(() => {
                    handleCloseAndClear();
                })
                .catch((errorMessage) => {
                    displayErrorMessageWithSnackbar({
                        errorMessage: errorMessage,
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId: 'VoltageLevelCreationError',
                            intlRef: intlRef,
                        },
                    });
                });
        }
    };

    const clearValues = () => {
        setVoltageLevelId('');
        setVoltageLevelName('');
        setNominalVoltage('');
        setBusBarSections([]);
        setConnections([]);
    };

    const handleCloseAndClear = () => {
        clearValues();
        handleClose();
    };

    const handleClose = () => {
        setErrors(new Map());
        onClose();
    };

    function makeGridCells() {
        return (
            <>
                <Grid item xs={3} align="start">
                    {makeTFld({ voltageLevelId }, onIdChange, 'ID', true, true)}
                </Grid>
                <Grid item xs={3} align="start">
                    {makeTFld(
                        { voltageLevelName },
                        onNameChange,
                        'NameOptional',
                        false,
                        true
                    )}
                </Grid>
                <Grid item xs={3} align="start">
                    <TextFieldWithAdornment
                        size="small"
                        fullWidth
                        id="nominal-voltage"
                        label={intl.formatMessage({
                            id: 'NominalVoltage',
                        })}
                        variant="filled"
                        adornmentPosition={'end'}
                        adornmentText={'kV'}
                        value={nominalVoltage}
                        onChange={handleChangeNominalVoltage}
                        {...(errors.get('nominalVoltage')?.error && {
                            error: true,
                            helperText: intl.formatMessage({
                                id: errors.get('nominalVoltage')?.errorMsgId,
                            }),
                        })}
                    />
                </Grid>
                <Grid item xs={3} align="start">
                    {/* TODO: autoComplete prop is not working properly with material-ui v4,
                            it clears the field when blur event is raised, which actually forces the user to validate free input
                            with enter key for it to be validated.
                            check if autoComplete prop is fixed in v5 */}
                    <Autocomplete
                        size="small"
                        freeSolo
                        forcePopupIcon
                        autoHighlight
                        selectOnFocus
                        id="substation"
                        options={substationOptions.filter((x) => !!x)}
                        getOptionLabel={(ss) => {
                            return !ss ? '' : ss.id ? ss.id : '';
                        }}
                        /* Modifies the filter option method so that when a value is directly entered in the text field, a new option
                       is created in the options list with a value equal to the input value
                    */
                        filterOptions={(options, params) => {
                            const filtered = filter(options, params);

                            if (
                                params.inputValue !== '' &&
                                !options.find(
                                    (opt) => opt.id === params.inputValue
                                )
                            ) {
                                filtered.push({
                                    inputValue: params.inputValue,
                                    id: params.inputValue,
                                });
                            }
                            return filtered;
                        }}
                        value={substation}
                        onChange={handleChangeSubstation}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="filled"
                                fullWidth
                                label={intl.formatMessage({
                                    id: 'Substation',
                                })}
                                FormHelperTextProps={{
                                    className: classes.helperText,
                                }}
                                {...makeErrorIf(errors, intl, {
                                    substation,
                                })}
                            />
                        )}
                        PopperComponent={FittingPopper}
                    />
                </Grid>
            </>
        );
    }

    return (
        <Dialog
            fullWidth
            maxWidth="md" // 3 columns
            open={open}
            onClose={handleClose}
            aria-labelledby="dialog-create-voltage-level"
        >
            <DialogTitle>
                {intl.formatMessage({ id: 'CreateVoltageLevel' })}
            </DialogTitle>
            <DialogContent>
                <div>
                    <Grid container spacing={2}>
                        {makeGridCells()}
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <h3 className={classes.h3}>
                                <FormattedMessage id="BusBarSections" />
                            </h3>
                        </Grid>
                    </Grid>
                    {busBarSections.map((p) => makeBusbarSectionRow(p))}
                    <Grid container spacing={2}>
                        <Grid item xs={3}>
                            <Button
                                fullWidth
                                className={classes.button}
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={handleCreateBusBarSection}
                            >
                                {intl.formatMessage({
                                    id: 'CreateBusBarSection',
                                })}
                            </Button>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <h3 className={classes.h3}>
                                <FormattedMessage id="Connectivity" />
                            </h3>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        {connections.map((p) => makeConnectionRow(p))}
                    </Grid>
                    <Grid item xs={3}>
                        <Button
                            fullWidth
                            className={classes.button}
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={handleCreateConnection}
                        >
                            {intl.formatMessage({ id: 'CreateLink' })}
                        </Button>
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

    function makeTFld(
        fieldVarInBlock,
        onChangeCb,
        labelId,
        af = false,
        filled = false
    ) {
        let fieldName = Object.keys(fieldVarInBlock)[0];
        // let value = fieldVarInBlock[0];
        let value = fieldVarInBlock[fieldName];
        console.log(
            "Field name '" +
                fieldName +
                "' = '" +
                value +
                "' : " +
                JSON.stringify(fieldVarInBlock)
        );
        return (
            <TextField
                autoFocus={af}
                size="small"
                fullWidth
                id={fieldName}
                label={intl.formatMessage({ id: labelId })}
                {...(filled ? { variant: 'filled' } : undefined)}
                key={fieldName}
                value={value}
                onChange={onChangeCb}
                /* Ensures no margin for error message (as when variant "filled" is used, a margin seems to be automatically applied to error message
       which is not the case when no variant is used) */
                FormHelperTextProps={{
                    className: classes.helperText,
                }}
                {...makeErrorIf(errors, intl, fieldVarInBlock)}
            />
        );
    }

    function makeBusbarSectionRow(bbs) {
        if (!bbs) {
            console.error('suspicious bbs ' + bbs);
            return undefined;
        }
        let idBlock = {};
        idBlock['bbs_id.' + bbs.idx] = bbs.id;
        let idCb = (event) => {
            onBusBarIdChange(bbs.idx, event);
        };

        let nameBlock = {};
        nameBlock['bbs_name.' + bbs.idx] = bbs.name;
        let nameCb = (event) => {
            //onBusBarNameChange(bbs.idx, event);
            onBusBarFieldChange(bbs.idx, event, 'name');
        };

        return (
            <>
                <Grid container spacing={2} key={'bbs_id.' + bbs.idx}>
                    <Grid item xs={3}>
                        {makeTFld(idBlock, idCb, 'BusBarSectionID')}
                    </Grid>
                    <Grid item xs={3}>
                        {makeTFld(nameBlock, nameCb, 'BusBarSectionName')}
                    </Grid>
                    <IconButton
                        className={classes.icon}
                        key={'bbs_del' + bbs.idx}
                        onClick={() => handleDeleteBusBarSection(bbs)}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Grid>
            </>
        );
    }

    function makeConnectionRow(cnx) {
        <IconButton
            className={classes.icon}
            onClick={() => handleDeleteConnection(cnx)}
        >
            <DeleteIcon />
        </IconButton>;
    }
};

function makeErrorIf(errors, intl, fieldVarInBlock) {
    let fieldName = Object.keys(fieldVarInBlock)[0];
    let errEntry = errors.get(fieldName);

    if (!errEntry || !errEntry.error) return undefined;

    return {
        error: true,
        helperText: intl.formatMessage({
            id: errEntry.errorMsgId,
        }),
    };
}

VoltageLevelCreationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    voltageLevelOptions: PropTypes.arrayOf(PropTypes.object),
    selectedNodeUuid: PropTypes.string,
};

export default VoltageLevelCreationDialog;
