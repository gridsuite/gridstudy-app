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
import { createTwoWindingsTransformer } from '../../utils/rest-api';
import TextFieldWithAdornment from '../util/text-field-with-adornment';
import { validateField } from '../util/validation-functions';
import ConnectivityEdition from './connectivity-edition';
import { useSelector } from 'react-redux';

const useStyles = makeStyles((theme) => ({
    helperText: {
        margin: 0,
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
 * Dialog to create a two windings transformer in the network
 * @param {Boolean} open Is the dialog open ?
 * @param {EventListener} onClose Event to close the dialog
 * @param voltageLevelOptions : the network voltageLevels available
 */
const TwoWindingsTransformerCreationDialog = ({
    open,
    onClose,
    voltageLevelOptions,
}) => {
    const classes = useStyles();

    const studyUuid = decodeURIComponent(useParams().studyUuid);
    const selectedNodeUuid = useSelector((state) => state.selectTreeNode);

    const intl = useIntl();
    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const [twoWindingsTransformerId, setTwoWindingsTransformerId] =
        useState('');

    const [twoWindingsTransformerName, setTwoWindingsTransformerName] =
        useState('');

    const [seriesResistance, setSeriesResistance] = useState('');
    const [seriesReactance, setSeriesReactance] = useState('');

    const [magnetizingConductance, setMagnetizingConductance] = useState('');
    const [magnetizingSusceptance, setMagnetizingSusceptance] = useState('');

    const [ratedVoltage1, setRatedVoltage1] = useState('');
    const [ratedVoltage2, setRatedVoltage2] = useState('');

    const [voltageLevel1, setVoltageLevel1] = useState(null);
    const [busOrBusbarSection1, setBusOrBusbarSection1] = useState(null);
    const [voltageLevel2, setVoltageLevel2] = useState(null);
    const [busOrBusbarSection2, setBusOrBusbarSection2] = useState(null);

    const [errors, setErrors] = useState(new Map());

    const handleChangeTwoWindingsTransformerId = (event) => {
        setTwoWindingsTransformerId(event.target.value);
    };

    const handleChangeTwoWindingsTransformerName = (event) => {
        setTwoWindingsTransformerName(event.target.value);
    };

    const handleChangeSeriesResistance = (event) => {
        setSeriesResistance(event.target.value?.replace(',', '.'));
    };

    const handleChangeSeriesReactance = (event) => {
        setSeriesReactance(event.target.value?.replace(',', '.'));
    };

    const handleChangeMagnetizingConductance = (event) => {
        setMagnetizingConductance(event.target.value?.replace(',', '.'));
    };

    const handleChangeMagnetizingSuceptance = (event) => {
        setMagnetizingSusceptance(event.target.value?.replace(',', '.'));
    };

    const handleChangeRatedVoltage1 = (event) => {
        setRatedVoltage1(event.target.value?.replace(',', '.'));
    };

    const handleChangeRatedVoltage2 = (event) => {
        setRatedVoltage2(event.target.value?.replace(',', '.'));
    };

    const handleSave = () => {
        let tmpErrors = new Map(errors);

        tmpErrors.set(
            '2wt-id',
            validateField(twoWindingsTransformerId, {
                isFieldRequired: true,
            })
        );

        tmpErrors.set(
            '2wt-series-resistance',
            validateField(seriesResistance, {
                isFieldRequired: true,
                isFieldNumeric: true,
            })
        );

        tmpErrors.set(
            '2wt-series-reactance',
            validateField(seriesReactance, {
                isFieldRequired: true,
                isFieldNumeric: true,
            })
        );

        tmpErrors.set(
            '2wt-magnetizing-conductance',
            validateField(magnetizingConductance, {
                isFieldRequired: true,
                isFieldNumeric: true,
            })
        );

        tmpErrors.set(
            '2wt-magnetizing-susceptance',
            validateField(magnetizingSusceptance, {
                isFieldRequired: true,
                isFieldNumeric: true,
            })
        );

        tmpErrors.set(
            '2wt-rated-voltage-side-1',
            validateField(ratedVoltage1, {
                isFieldRequired: true,
                isFieldNumeric: true,
            })
        );

        tmpErrors.set(
            '2wt-rated-voltage-side-2',
            validateField(ratedVoltage2, {
                isFieldRequired: true,
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
            createTwoWindingsTransformer(
                studyUuid,
                selectedNodeUuid,
                twoWindingsTransformerId,
                twoWindingsTransformerName,
                seriesResistance,
                seriesReactance,
                magnetizingConductance,
                magnetizingSusceptance,
                ratedVoltage1,
                ratedVoltage2,
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
                            headerMessageId:
                                'TwoWindingsTransformerCreationError',
                            intlRef: intlRef,
                        },
                    });
                });
        }
    };

    const clearValues = () => {
        setTwoWindingsTransformerId('');
        setTwoWindingsTransformerName('');

        setSeriesResistance('');
        setSeriesReactance('');

        setMagnetizingConductance('');
        setMagnetizingSusceptance('');

        setRatedVoltage1('');
        setRatedVoltage2('');

        setVoltageLevel1(null);
        setBusOrBusbarSection1(null);
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
            aria-labelledby="dialog-create-two-windings-transformer"
            fullWidth={true}
        >
            <DialogTitle>
                {intl.formatMessage({ id: 'CreateTwoWindingsTransformer' })}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={6} align="start">
                        <TextField
                            fullWidth
                            id="2wt-id"
                            label={intl.formatMessage({ id: 'ID' })}
                            variant="filled"
                            value={twoWindingsTransformerId}
                            onChange={handleChangeTwoWindingsTransformerId}
                            /* Ensures no margin for error message (as when variant "filled" is used, a margin seems to be automatically applied to error message
                               which is not the case when no variant is used) */
                            FormHelperTextProps={{
                                className: classes.helperText,
                            }}
                            {...(errors.get('2wt-id')?.error && {
                                error: true,
                                helperText: intl.formatMessage({
                                    id: errors.get('2wt-id')?.errorMsgId,
                                }),
                            })}
                        />
                    </Grid>
                    <Grid item xs={6} align="start">
                        <TextField
                            fullWidth
                            id="2wt-name"
                            label={
                                intl.formatMessage({ id: 'Name' }) +
                                ' ' +
                                intl.formatMessage({
                                    id: 'Optional',
                                })
                            }
                            value={twoWindingsTransformerName}
                            onChange={handleChangeTwoWindingsTransformerName}
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
                            fullWidth
                            id="2wt-series-resistance"
                            label={intl.formatMessage({
                                id: 'SeriesResistanceText',
                            })}
                            adornmentPosition={'end'}
                            adornmentText={'Ω'}
                            value={seriesResistance}
                            onChange={handleChangeSeriesResistance}
                            {...(errors.get('2wt-series-resistance')?.error && {
                                error: true,
                                helperText: intl.formatMessage({
                                    id: errors.get('2wt-series-resistance')
                                        ?.errorMsgId,
                                }),
                            })}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextFieldWithAdornment
                            fullWidth
                            id="2wt-series-reactance"
                            label={intl.formatMessage({
                                id: 'SeriesReactanceText',
                            })}
                            adornmentPosition={'end'}
                            adornmentText={'Ω'}
                            value={seriesReactance}
                            onChange={handleChangeSeriesReactance}
                            {...(errors.get('2wt-series-reactance')?.error && {
                                error: true,
                                helperText: intl.formatMessage({
                                    id: errors.get('2wt-series-reactance')
                                        ?.errorMsgId,
                                }),
                            })}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextFieldWithAdornment
                            fullWidth
                            id="2wt-magnetizing-conductance"
                            label={intl.formatMessage({
                                id: 'MagnetizingConductance',
                            })}
                            adornmentPosition={'end'}
                            adornmentText={'S'}
                            value={magnetizingConductance}
                            onChange={handleChangeMagnetizingConductance}
                            {...(errors.get('2wt-magnetizing-conductance')
                                ?.error && {
                                error: true,
                                helperText: intl.formatMessage({
                                    id: errors.get(
                                        '2wt-magnetizing-conductance'
                                    )?.errorMsgId,
                                }),
                            })}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextFieldWithAdornment
                            fullWidth
                            id="2wt-magnetizing-susceptance"
                            label={intl.formatMessage({
                                id: 'MagnetizingSusceptance',
                            })}
                            adornmentPosition={'end'}
                            adornmentText={'S'}
                            value={magnetizingSusceptance}
                            onChange={handleChangeMagnetizingSuceptance}
                            {...(errors.get('2wt-magnetizing-susceptance')
                                ?.error && {
                                error: true,
                                helperText: intl.formatMessage({
                                    id: errors.get(
                                        '2wt-magnetizing-susceptance'
                                    )?.errorMsgId,
                                }),
                            })}
                        />
                    </Grid>
                </Grid>
                {/* <br /> */}
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <h3 className={classes.h3}>
                            <FormattedMessage id="Limits" />
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
                    <Grid item xs={6}>
                        <TextFieldWithAdornment
                            fullWidth
                            id="2wt-rated-voltage-side-1"
                            label={intl.formatMessage({
                                id: 'RatedVoltage',
                            })}
                            adornmentPosition={'end'}
                            adornmentText={'kV'}
                            value={ratedVoltage1}
                            onChange={handleChangeRatedVoltage1}
                            {...(errors.get('2wt-rated-voltage-side-1')
                                ?.error && {
                                error: true,
                                helperText: intl.formatMessage({
                                    id: errors.get('2wt-rated-voltage-side-1')
                                        ?.errorMsgId,
                                }),
                            })}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextFieldWithAdornment
                            fullWidth
                            id="2wt-rated-voltage-side-2"
                            label={intl.formatMessage({
                                id: 'RatedVoltage',
                            })}
                            adornmentPosition={'end'}
                            adornmentText={'kV'}
                            value={ratedVoltage2}
                            onChange={handleChangeRatedVoltage2}
                            {...(errors.get('2wt-rated-voltage-side-2')
                                ?.error && {
                                error: true,
                                helperText: intl.formatMessage({
                                    id: errors.get('2wt-rated-voltage-side-2')
                                        ?.errorMsgId,
                                }),
                            })}
                        />
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

TwoWindingsTransformerCreationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    voltageLevelOptions: PropTypes.arrayOf(PropTypes.object),
};

export default TwoWindingsTransformerCreationDialog;
