/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';
import { createLine } from '../../utils/rest-api';
import TextFieldWithAdornment from '../util/text-field-with-adornment';
import { validateField } from '../util/validation-functions';
import ConnectivityEdition from './connectivity-edition';

const useStyles = makeStyles((theme) => ({
    helperText: {
        margin: 0,
        marginTop: 4,
    },
    popper: {
        style: {
            width: 'fit-content',
        },
    },
    h3: {
        marginBottom: 0,
        paddingBottom: 1,
    },
    h4: {
        marginBottom: 0,
    },
}));

/**
 * Dialog to create a line in the network
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param voltageLevelOptions : the network voltageLevels available
 */
const LineCreationDialog = ({ open, onClose, voltageLevelOptions }) => {
    const classes = useStyles();

    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const intl = useIntl();
    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const [lineId, setLineId] = useState('');

    const [lineName, setLineName] = useState('');

    const [seriesResistance, setSeriesResistance] = useState('');

    const [seriesReactance, setSeriesReactance] = useState('');

    const [shuntConductance1, setShuntConductance1] = useState('');
    const [shuntSusceptance1, setShuntSusceptance1] = useState('');
    const [voltageLevel1, setVoltageLevel1] = useState(null);
    const [busOrBusbarSection1, setBusOrBusbarSection1] = useState(null);

    const [shuntConductance2, setShuntConductance2] = useState('');
    const [shuntSusceptance2, setShuntSusceptance2] = useState('');
    const [voltageLevel2, setVoltageLevel2] = useState(null);
    const [busOrBusbarSection2, setBusOrBusbarSection2] = useState(null);

    const [errors, setErrors] = useState(new Map());

    const handleChangeLineId = (event) => {
        setLineId(event.target.value);
    };

    const handleChangeLineName = (event) => {
        setLineName(event.target.value);
    };

    const handleChangeSeriesResistance = (event) => {
        setSeriesResistance(event.target.value?.replace(',', '.'));
    };

    const handleChangeSeriesReactance = (event) => {
        setSeriesReactance(event.target.value?.replace(',', '.'));
    };

    const handleChangeShuntConductance1 = (event) => {
        setShuntConductance1(event.target.value?.replace(',', '.'));
    };

    const handleChangeShuntSusceptance1 = (event) => {
        setShuntSusceptance1(event.target.value?.replace(',', '.'));
    };

    const handleChangeShuntConductance2 = (event) => {
        setShuntConductance2(event.target.value?.replace(',', '.'));
    };

    const handleChangeShuntSusceptance2 = (event) => {
        setShuntSusceptance2(event.target.value?.replace(',', '.'));
    };

    const handleSave = () => {
        let tmpErrors = new Map(errors);

        tmpErrors.set(
            'line-id',
            validateField(lineId, {
                isFieldRequired: true,
            })
        );

        tmpErrors.set(
            'series-resistance',
            validateField(seriesResistance, {
                isFieldRequired: true,
                isFieldNumeric: true,
            })
        );

        tmpErrors.set(
            'series-reactance',
            validateField(seriesReactance, {
                isFieldRequired: true,
                isFieldNumeric: true,
            })
        );

        tmpErrors.set(
            'shunt-conductance-side1',
            validateField(shuntConductance1, {
                isFieldRequired: false,
                isFieldNumeric: true,
            })
        );

        tmpErrors.set(
            'shunt-susceptance-side1',
            validateField(shuntSusceptance1, {
                isFieldRequired: false,
                isFieldNumeric: true,
            })
        );

        tmpErrors.set(
            'voltage-level1',
            validateField(voltageLevel1, {
                isFieldRequired: true,
            })
        );

        tmpErrors.set(
            'bus-bar1',
            validateField(busOrBusbarSection1, {
                isFieldRequired: true,
            })
        );

        tmpErrors.set(
            'shunt-conductance-side2',
            validateField(shuntConductance2, {
                isFieldRequired: false,
                isFieldNumeric: true,
            })
        );

        tmpErrors.set(
            'shunt-susceptance-side2',
            validateField(shuntSusceptance2, {
                isFieldRequired: false,
                isFieldNumeric: true,
            })
        );

        tmpErrors.set(
            'voltage-level2',
            validateField(voltageLevel2, {
                isFieldRequired: true,
            })
        );

        tmpErrors.set(
            'bus-bar2',
            validateField(busOrBusbarSection2, {
                isFieldRequired: true,
            })
        );

        setErrors(tmpErrors);

        // Check if error list contains an error
        let isValid =
            Array.from(tmpErrors.values()).findIndex((err) => err.error) === -1;

        if (isValid) {
            createLine(
                studyUuid,
                lineId,
                lineName,
                seriesResistance,
                seriesReactance,
                shuntConductance1,
                shuntSusceptance1,
                shuntConductance2,
                shuntSusceptance2,
                voltageLevel1.id,
                busOrBusbarSection1.id,
                voltageLevel2.id,
                busOrBusbarSection2.id
            )
                .then(() => {
                    handleCloseAndClear();
                })
                .catch((errorMessage) => {
                    displayErrorMessageWithSnackbar({
                        errorMessage: errorMessage,
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId: 'LineCreationError',
                            intlRef: intlRef,
                        },
                    });
                });
        }
    };

    const clearValues = () => {
        setLineId('');
        setLineName('');
        setSeriesResistance('');
        setSeriesReactance('');

        setShuntConductance1('');
        setShuntSusceptance1('');
        setVoltageLevel1(null);
        setBusOrBusbarSection1(null);

        setShuntConductance2('');
        setShuntSusceptance2('');
        setVoltageLevel2(null);
        setBusOrBusbarSection2(null);
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
            open={open}
            onClose={handleClose}
            aria-labelledby="dialog-create-line"
            fullWidth={true}
        >
            <DialogTitle>
                {intl.formatMessage({ id: 'CreateLine' })}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={6} align="start">
                        <TextField
                            size="small"
                            fullWidth
                            id="line-id"
                            label={intl.formatMessage({ id: 'ID' })}
                            variant="filled"
                            value={lineId}
                            onChange={handleChangeLineId}
                            /* Ensures no margin for error message (as when variant "filled" is used, a margin seems to be automatically applied to error message
                               which is not the case when no variant is used) */
                            FormHelperTextProps={{
                                className: classes.helperText,
                            }}
                            {...(errors.get('line-id')?.error && {
                                error: true,
                                helperText: intl.formatMessage({
                                    id: errors.get('line-id')?.errorMsgId,
                                }),
                            })}
                        />
                    </Grid>
                    <Grid item xs={6} align="start">
                        <TextField
                            size="small"
                            fullWidth
                            id="line-name"
                            label={
                                intl.formatMessage({ id: 'Name' }) +
                                ' ' +
                                intl.formatMessage({
                                    id: 'Optional',
                                })
                            }
                            value={lineName}
                            onChange={handleChangeLineName}
                            variant="filled"
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <h3 className={classes.h3}>
                            <FormattedMessage id="Characteristics" />
                        </h3>
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextFieldWithAdornment
                            size="small"
                            fullWidth
                            id="line-series-resistance"
                            label={intl.formatMessage({
                                id: 'SeriesResistanceText',
                            })}
                            adornmentPosition={'end'}
                            adornmentText={'Ω'}
                            value={seriesResistance}
                            onChange={handleChangeSeriesResistance}
                            {...(errors.get('series-resistance')?.error && {
                                error: true,
                                helperText: intl.formatMessage({
                                    id: errors.get('series-resistance')
                                        ?.errorMsgId,
                                }),
                            })}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextFieldWithAdornment
                            size="small"
                            fullWidth
                            id="line-series-reactance"
                            label={intl.formatMessage({
                                id: 'SeriesReactanceText',
                            })}
                            adornmentPosition={'end'}
                            adornmentText={'Ω'}
                            value={seriesReactance}
                            onChange={handleChangeSeriesReactance}
                            {...(errors.get('series-reactance')?.error && {
                                error: true,
                                helperText: intl.formatMessage({
                                    id: errors.get('series-reactance')
                                        ?.errorMsgId,
                                }),
                            })}
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <h4 className={classes.h4}>
                            <FormattedMessage id="Side1" />
                        </h4>
                    </Grid>
                    <Grid item xs={6}>
                        <h4 className={classes.h4}>
                            <FormattedMessage id="Side2" />
                        </h4>
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item container xs={6} direction="column">
                        <Grid container direction="column" spacing={2}>
                            <Grid item align="start">
                                <TextFieldWithAdornment
                                    size="small"
                                    fullWidth
                                    id="line-shunt-conductance-side1"
                                    label={
                                        intl.formatMessage({
                                            id: 'ShuntConductanceText',
                                        }) +
                                        ' ' +
                                        intl.formatMessage({
                                            id: 'Optional',
                                        })
                                    }
                                    adornmentPosition={'end'}
                                    adornmentText={'S'}
                                    value={shuntConductance1}
                                    onChange={handleChangeShuntConductance1}
                                    {...(errors.get('shunt-conductance-side1')
                                        ?.error && {
                                        error: true,
                                        helperText: intl.formatMessage({
                                            id: errors.get(
                                                'shunt-conductance-side1'
                                            )?.errorMsgId,
                                        }),
                                    })}
                                />
                            </Grid>
                            <Grid item align="start">
                                <TextFieldWithAdornment
                                    size="small"
                                    fullWidth
                                    id="line-shunt-susceptance-side1"
                                    label={
                                        intl.formatMessage({
                                            id: 'ShuntSusceptanceText',
                                        }) +
                                        ' ' +
                                        intl.formatMessage({
                                            id: 'Optional',
                                        })
                                    }
                                    adornmentPosition={'end'}
                                    adornmentText={'S'}
                                    value={shuntSusceptance1}
                                    onChange={handleChangeShuntSusceptance1}
                                    {...(errors.get('shunt-susceptance-side1')
                                        ?.error && {
                                        error: true,
                                        helperText: intl.formatMessage({
                                            id: errors.get(
                                                'shunt-susceptance-side1'
                                            )?.errorMsgId,
                                        }),
                                    })}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item container direction="column" xs={6}>
                        <Grid container direction="column" spacing={2}>
                            <Grid item align="start">
                                <TextFieldWithAdornment
                                    size="small"
                                    fullWidth
                                    id="line-shunt-conductance-side2"
                                    label={
                                        intl.formatMessage({
                                            id: 'ShuntConductanceText',
                                        }) +
                                        ' ' +
                                        intl.formatMessage({
                                            id: 'Optional',
                                        })
                                    }
                                    adornmentPosition={'end'}
                                    adornmentText={'S'}
                                    value={shuntConductance2}
                                    onChange={handleChangeShuntConductance2}
                                    {...(errors.get('shunt-conductance-side2')
                                        ?.error && {
                                        error: true,
                                        helperText: intl.formatMessage({
                                            id: errors.get(
                                                'shunt-conductance-side2'
                                            )?.errorMsgId,
                                        }),
                                    })}
                                />
                            </Grid>
                            <Grid item align="start">
                                <TextFieldWithAdornment
                                    size="small"
                                    fullWidth
                                    id="line-shunt-susceptance-side2"
                                    label={
                                        intl.formatMessage({
                                            id: 'ShuntSusceptanceText',
                                        }) +
                                        ' ' +
                                        intl.formatMessage({
                                            id: 'Optional',
                                        })
                                    }
                                    adornmentPosition={'end'}
                                    adornmentText={'S'}
                                    value={shuntSusceptance2}
                                    onChange={handleChangeShuntSusceptance2}
                                    {...(errors.get('shunt-susceptance-side2')
                                        ?.error && {
                                        error: true,
                                        helperText: intl.formatMessage({
                                            id: errors.get(
                                                'shunt-susceptance-side2'
                                            )?.errorMsgId,
                                        }),
                                    })}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                {/* <br /> */}
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <h3 className={classes.h3}>
                            <FormattedMessage id="Connectivity" />
                        </h3>
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <h4 className={classes.h4}>
                            <FormattedMessage id="Side1" />
                        </h4>
                    </Grid>
                    <Grid item xs={6}>
                        <h4 className={classes.h4}>
                            <FormattedMessage id="Side2" />
                        </h4>
                    </Grid>
                </Grid>

                <Grid container spacing={2}>
                    <Grid item container xs={6} direction="column">
                        <Grid container direction="column" spacing={2}>
                            <Grid item align="start">
                                <ConnectivityEdition
                                    voltageLevelOptions={voltageLevelOptions}
                                    voltageLevel={voltageLevel1}
                                    busOrBusbarSection={busOrBusbarSection1}
                                    onChangeVoltageLevel={(value) =>
                                        setVoltageLevel1(value)
                                    }
                                    onChangeBusOrBusbarSection={(
                                        busOrBusbarSection
                                    ) =>
                                        setBusOrBusbarSection1(
                                            busOrBusbarSection
                                        )
                                    }
                                    direction="column"
                                    errorVoltageLevel={
                                        errors.get('voltage-level1')?.error
                                    }
                                    helperTextVoltageLevel={
                                        errors.get('voltage-level1')?.error &&
                                        intl.formatMessage({
                                            id: errors.get('voltage-level1')
                                                ?.errorMsgId,
                                        })
                                    }
                                    errorBusOrBusBarSection={
                                        errors.get('bus-bar1')?.error
                                    }
                                    helperTextBusOrBusBarSection={
                                        errors.get('bus-bar1')?.error &&
                                        intl.formatMessage({
                                            id: errors.get('bus-bar1')
                                                ?.errorMsgId,
                                        })
                                    }
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item container direction="column" xs={6}>
                        <Grid container direction="column" spacing={2}>
                            <Grid item align="start">
                                <ConnectivityEdition
                                    voltageLevelOptions={voltageLevelOptions}
                                    voltageLevel={voltageLevel2}
                                    busOrBusbarSection={busOrBusbarSection2}
                                    onChangeVoltageLevel={(value) =>
                                        setVoltageLevel2(value)
                                    }
                                    onChangeBusOrBusbarSection={(
                                        busOrBusbarSection
                                    ) =>
                                        setBusOrBusbarSection2(
                                            busOrBusbarSection
                                        )
                                    }
                                    direction="column"
                                    errorVoltageLevel={
                                        errors.get('voltage-level2')?.error
                                    }
                                    helperTextVoltageLevel={
                                        errors.get('voltage-level2')?.error &&
                                        intl.formatMessage({
                                            id: errors.get('voltage-level2')
                                                ?.errorMsgId,
                                        })
                                    }
                                    errorBusOrBusBarSection={
                                        errors.get('bus-bar2')?.error
                                    }
                                    helperTextBusOrBusBarSection={
                                        errors.get('bus-bar2')?.error &&
                                        intl.formatMessage({
                                            id: errors.get('bus-bar2')
                                                ?.errorMsgId,
                                        })
                                    }
                                />
                            </Grid>
                        </Grid>
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

LineCreationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    voltageLevelOptions: PropTypes.arrayOf(PropTypes.object),
};

export default LineCreationDialog;
