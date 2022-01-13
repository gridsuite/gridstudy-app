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
import {
    InputLabel,
    MenuItem,
    Popper,
    Select,
    TextField,
} from '@material-ui/core';
import TextFieldWithAdornment from '../util/text-field-with-adornment';
import { useParams } from 'react-router-dom';
import { createVoltageLevel } from '../../utils/rest-api';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';
import { useSnackbar } from 'notistack';
import { makeErrorRecord, validateField } from '../util/validation-functions';
import { makeStyles } from '@material-ui/core/styles';
import { Autocomplete, createFilterOptions } from '@material-ui/lab';
import IconButton from '@material-ui/core/IconButton';
import FormControl from '@material-ui/core/FormControl';

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

    const onBusBarFieldChange = (idx, event, fieldName) => {
        let newFieldValue = event.target.value;

        let indexIn = busBarSections.findIndex((v, i) => v.idx === idx);
        let prevBbs = busBarSections[indexIn];
        let nextBbs = { ...prevBbs };
        nextBbs[fieldName] = newFieldValue;

        let next = [...busBarSections];
        next[indexIn] = nextBbs;
        setBusBarSections(next);
    };

    const onConnectivityChange = (idx, value, fieldName) => {
        let indexIn = connections.findIndex((v, i) => v.idx === idx);
        let prevCnx = connections[indexIn];
        let nextCnx = { ...prevCnx };
        nextCnx[fieldName] = value;
        let next = [...connections];
        next[indexIn] = nextCnx;
        setConnections(next);
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
        let nextBbs = { idx: idx, id: '', name: '', vertPos: 1, horizPos: 1 };
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
        let idx = connections.length;
        let next = [
            ...connections,
            {
                idx: idx,
                fromBBS: null,
                toBBS: null,
                cnxType: 'BREAKER',
            },
        ];
        console.log(
            'About to add a connection ' + JSON.stringify(next[next.length - 1])
        );
        setConnections(next);
    };

    const handleDeleteConnection = (cnx) => {
        let next = connections.filter((v, i, arr) => v.idx !== cnx.idx);
        console.log(
            'Deletes connection ' +
                JSON.stringify(cnx) +
                ' :\n ' +
                JSON.stringify(busBarSections) +
                '\n->\n' +
                JSON.stringify(next)
        );
        setConnections(next);
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

    const buildByHPosVPos = () => {
        let byHorizVert = new Map();
        for (let bbs of busBarSections) {
            let hpos;
            let vpos;
            if (
                typeof bbs.horizPos === String &&
                bbs.horizPos &&
                typeof bbs.vertPos === String &&
                bbs.vertPos
            ) {
                hpos = Number(bbs.horizPos.replace(',', '.'));
                vpos = Number(bbs.vertPos.replace(',', '.'));
            } else {
                hpos = bbs.horizPos;
                vpos = bbs.vertPos;
            }

            if (!isNaN(hpos && !isNaN(vpos))) {
                let k = '' + hpos + ',' + vpos;
                //let p = { hpos, vpos };
                let others = byHorizVert.get(k);
                if (!others) {
                    others = [];
                    byHorizVert.set(k, others);
                }
                others.push(bbs.idx);
            }
        }

        return byHorizVert;
    };

    const collectErrors = () => {
        let tmpErrors = new Map();

        addCheckToBlock(tmpErrors, { voltageLevelId });
        addCheckToBlock(tmpErrors, { nominalVoltage }, true, true);
        addCheckToBlock(tmpErrors, { substation });

        for (let bbs of busBarSections) {
            addCheckToBlock(tmpErrors, makeBlock('bbs_id.' + bbs.idx, bbs.id));
            addCheckToBlock(
                tmpErrors,
                makeBlock('bbs_hpos.' + bbs.idx, bbs.horizPos)
            );
            addCheckToBlock(
                tmpErrors,
                makeBlock('bbs_vpos.' + bbs.idx, bbs.vertPos)
            );
        }

        let byHorizVert = buildByHPosVPos();
        for (let p of byHorizVert) {
            let indices = p[1];
            if (indices.length > 1) {
                let msgId = 'SameHorizAndVertPos';
                for (let idx of indices) {
                    tmpErrors.set('bbs_hpos.' + idx, makeErrorRecord(msgId));
                    tmpErrors.set('bbs_vpos.' + idx, makeErrorRecord(msgId));
                }
            }
        }

        for (let cnx of connections) {
            addCheckToBlock(
                tmpErrors,
                makeBlock('cnx_fromBBS.' + cnx.idx, cnx.fromBBS)
            );
            addCheckToBlock(
                tmpErrors,
                makeBlock('cnx_toBBS.' + cnx.idx, cnx.toBBS)
            );
        }

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
                        {makeLevelLevelRow()}
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
                    {connections.map((p) => makeConnectionRow(p))}
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
        filled = false,
        numerical = false
    ) {
        let fieldName = Object.keys(fieldVarInBlock)[0];
        let value = fieldVarInBlock[fieldName];
        return (
            <TextField
                autoFocus={af}
                size="small"
                fullWidth
                id={fieldName}
                label={intl.formatMessage({ id: labelId })}
                {...(filled ? { variant: 'filled' } : undefined)}
                {...(numerical
                    ? {
                          type: 'number',
                          inputProps: { min: 0, style: { textAlign: 'right' } },
                      }
                    : undefined)}
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

    function makeLevelLevelRow() {
        return (
            <>
                <Grid item xs={3} align="start">
                    {makeTFld(
                        { voltageLevelId },
                        onIdChange,
                        'ID',
                        !voltageLevelId,
                        true
                    )}
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
                        FormHelperTextProps={{
                            className: classes.helperText,
                        }}
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

    function makeBlock(prefix, value) {
        let block = {};
        block[prefix] = value;
        return block;
    }

    function makeBusbarSectionRow(bbs) {
        if (!bbs) {
            console.error('suspicious bbs ' + bbs);
            return undefined;
        }

        let idBlock = makeBlock('bbs_id.' + bbs.idx, bbs.id);
        let idCb = (event) => {
            onBusBarFieldChange(bbs.idx, event, 'id');
        };

        let nameBlock = makeBlock('bbs_name.' + bbs.idx, bbs.name);
        let nameCb = (event) => {
            onBusBarFieldChange(bbs.idx, event, 'name');
        };

        let horizPosBlock = makeBlock('bbs_hpos.' + bbs.idx, bbs.horizPos);
        let hposCb = (event) => {
            onBusBarFieldChange(bbs.idx, event, 'horizPos');
        };

        let vertPosBlock = makeBlock('bbs_vpos.' + bbs.idx, bbs.vertPos);
        let vposCb = (event) => {
            onBusBarFieldChange(bbs.idx, event, 'vertPos');
        };

        return (
            <>
                <Grid container spacing={2} key={'bbs_id.' + bbs.idx}>
                    <Grid item xs={3}>
                        {makeTFld(idBlock, idCb, 'BusBarSectionID', !bbs.id)}
                    </Grid>
                    <Grid item xs={3}>
                        {makeTFld(nameBlock, nameCb, 'BusBarSectionName')}
                    </Grid>
                    <Grid item xs={3}>
                        {makeTFld(
                            horizPosBlock,
                            hposCb,
                            'BusBarHorizPos',
                            false,
                            false,
                            true
                        )}
                    </Grid>
                    <Grid item xs={2}>
                        {makeTFld(
                            vertPosBlock,
                            vposCb,
                            'BusBarVertPos',
                            false,
                            false,
                            true
                        )}
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

    function makeBusBarSelector(cnx, isFrom) {
        let fieldName = isFrom ? 'fromBBS' : 'toBBS';
        let prefix = 'cnx_' + fieldName + '.' + cnx.idx;
        let value = cnx[fieldName];
        let sideBlock = makeBlock(prefix, value);
        let bbsCb = (event, value) => {
            onConnectivityChange(cnx.idx, value, fieldName);
        };
        let bbs = isFrom ? cnx.fromBBS : cnx.toBBS;
        let af = isFrom && !cnx.fromBBS;

        return (
            <Autocomplete
                size="small"
                freeSolo
                forcePopupIcon
                autoHighlight
                selectOnFocus
                key={fieldName}
                options={busBarSections.filter((x) => !!x)}
                getOptionLabel={(ss) => {
                    return !ss ? '' : ss.id ? ss.id : '';
                }}
                value={bbs}
                onChange={bbsCb}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        autoFocus={af}
                        fullWidth
                        label={intl.formatMessage({
                            id: 'BusBarSection',
                        })}
                        FormHelperTextProps={{
                            className: classes.helperText,
                        }}
                        {...makeErrorIf(errors, intl, sideBlock)}
                    />
                )}
                PopperComponent={FittingPopper}
            />
        );
    }

    function makeConnectionRow(cnx) {
        if (!cnx) return undefined;

        let onTypeChange = (event) => {
            let value = event.target.value;
            onConnectivityChange(cnx.idx, value, 'cnxType');
        };

        return (
            <>
                <Grid container spacing={2} key={'cnx_id.' + cnx.idx}>
                    <Grid item xs={3}>
                        {makeBusBarSelector(cnx, true)}
                    </Grid>
                    <Grid item xs={3}>
                        {makeBusBarSelector(cnx, false)}
                    </Grid>
                    <Grid item xs={3}>
                        <FormControl fullWidth size="small">
                            {/*This InputLabel is necessary in order to display
                            the label describing the content of the Select*/}
                            <InputLabel
                                key={'cnx-type' + cnx.idx}
                                variant={'filled'}
                            >
                                {intl.formatMessage({ id: 'TypeOptional' })}
                            </InputLabel>
                            <Select
                                key={'cnx-type-sel' + cnx.idx}
                                value={cnx.cnxType}
                                onChange={onTypeChange}
                                variant="filled"
                                fullWidth
                            >
                                <MenuItem value="">
                                    <em>
                                        {intl.formatMessage({ id: 'None' })}
                                    </em>
                                </MenuItem>
                                <MenuItem value={'BREAKER'}>
                                    {intl.formatMessage({ id: 'Breaker' })}
                                </MenuItem>
                                <MenuItem value={'DISCONNECTOR'}>
                                    {intl.formatMessage({ id: 'Disconnector' })}
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <IconButton
                        className={classes.icon}
                        onClick={() => handleDeleteConnection(cnx)}
                    >
                        <DeleteIcon />
                    </IconButton>
                </Grid>
            </>
        );
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
