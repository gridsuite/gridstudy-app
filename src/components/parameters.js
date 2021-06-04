/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';

import { FormattedMessage } from 'react-intl';

import { useSelector } from 'react-redux';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import { useSnackbar } from 'notistack';

import { LineFlowMode } from './network/line-layer';
import { LineFlowColorMode } from './network/line-layer';
import {
    getLoadFlowParameters,
    setLoadFlowParameters,
    getLoadFlowProvider,
    setLoadFlowProvider,
    updateConfigParameter,
} from '../utils/rest-api';
import { SubstationLayout } from './single-line-diagram';
import {
    PARAM_CENTER_LABEL,
    PARAM_DIAGONAL_LABEL,
    PARAM_LINE_FLOW_ALERT_THRESHOLD,
    PARAM_LINE_FLOW_COLOR_MODE,
    PARAM_LINE_FLOW_MODE,
    PARAM_LINE_FULL_PATH,
    PARAM_SUBSTATION_LAYOUT,
    PARAM_DISPLAY_OVERLOAD_TABLE,
    PARAM_LINE_PARALLEL_PATH,
} from '../utils/config-params';
import { displayErrorMessageWithSnackbar, useIntlRef } from '../utils/messages';

const useStyles = makeStyles((theme) => ({
    title: {
        padding: theme.spacing(2),
    },
    grid: {
        padding: theme.spacing(2),
    },
    controlItem: {
        justifyContent: 'flex-end',
    },
    button: {
        marginBottom: '30px',
    },
}));

export function useParameterState(paramName) {
    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const paramGlobalState = useSelector((state) => state[paramName]);

    const [paramLocalState, setParamLocalState] = useState(paramGlobalState);

    useEffect(() => {
        setParamLocalState(paramGlobalState);
    }, [paramGlobalState]);

    const handleChangeParamLocalState = useCallback(
        (value) => {
            setParamLocalState(value);
            updateConfigParameter(paramName, value).catch((errorMessage) => {
                setParamLocalState(paramGlobalState);
                displayErrorMessageWithSnackbar({
                    errorMessage: errorMessage,
                    enqueueSnackbar: enqueueSnackbar,
                    headerMessage: {
                        headerMessageId: 'paramsChangingError',
                        intlRef: intlRef,
                    },
                });
            });
        },
        [
            paramName,
            enqueueSnackbar,
            intlRef,
            setParamLocalState,
            paramGlobalState,
        ]
    );

    return [paramLocalState, handleChangeParamLocalState];
}

const LF_PROVIDER_VALUES = {
    Default: 'Default',
    OpenLoadFlow: 'OpenLoadFlow',
    Hades2: 'Hades2',
};

const Parameters = ({ showParameters, hideParameters }) => {
    const classes = useStyles();

    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const [lineFullPathLocal, handleChangeLineFullPath] = useParameterState(
        PARAM_LINE_FULL_PATH
    );

    const [
        lineParallelPathLocal,
        handleChangeLineParallelPath,
    ] = useParameterState(PARAM_LINE_PARALLEL_PATH);

    const [
        lineFlowAlertThresholdLocal,
        handleChangeLineFlowAlertThreshold,
    ] = useParameterState(PARAM_LINE_FLOW_ALERT_THRESHOLD);

    const [
        displayOverloadTableLocal,
        handleChangeDisplayOverloadTable,
    ] = useParameterState(PARAM_DISPLAY_OVERLOAD_TABLE);

    const [lineFlowModeLocal, handleChangeLineFlowMode] = useParameterState(
        PARAM_LINE_FLOW_MODE
    );

    const [
        lineFlowColorModeLocal,
        handleChangeLineFlowColorMode,
    ] = useParameterState(PARAM_LINE_FLOW_COLOR_MODE);

    const [centerLabelLocal, handleChangeCenterLabel] = useParameterState(
        PARAM_CENTER_LABEL
    );

    const [diagonalLabelLocal, handleChangeDiagonalLabel] = useParameterState(
        PARAM_DIAGONAL_LABEL
    );

    const [
        substationLayoutLocal,
        handleChangeSubstationLayout,
    ] = useParameterState(PARAM_SUBSTATION_LAYOUT);

    const studyUuid = useSelector((state) => state.studyUuid);

    const [lfProvider, setLfProvider] = useState(null);

    const [lfParams, setLfParams] = useState(null);

    const [
        disabledFlowAlertThreshold,
        setDisabledFlowAlertThreshold,
    ] = useState(
        lineFlowColorModeLocal === 'nominalVoltage' &&
            !displayOverloadTableLocal
    );

    const [tabIndex, setTabIndex] = useState(0);

    useEffect(() => {
        if (studyUuid) {
            getLoadFlowParameters(studyUuid)
                .then((params) => setLfParams(params))
                .catch((errorMessage) =>
                    displayErrorMessageWithSnackbar({
                        errorMessage: errorMessage,
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId: 'paramsRetrievingError',
                            intlRef: intlRef,
                        },
                    })
                );
            getLoadFlowProvider(studyUuid)
                .then((provider) => {
                    setLfProvider(provider === '' ? 'Default' : provider);
                })
                .catch((errorMessage) =>
                    displayErrorMessageWithSnackbar({
                        errorMessage: errorMessage,
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId: 'getLoadFlowProviderError',
                            intlRef: intlRef,
                        },
                    })
                );
        }
    }, [studyUuid, enqueueSnackbar, intlRef]);

    useEffect(() => {
        setDisabledFlowAlertThreshold(
            lineFlowColorModeLocal === 'nominalVoltage' &&
                !displayOverloadTableLocal
        );
    }, [lineFlowColorModeLocal, displayOverloadTableLocal]);

    const alertThresholdMarks = [
        {
            value: 0,
            label: '0',
        },
        {
            value: 100,
            label: '100',
        },
    ];

    function TabPanel(props) {
        const { children, value, index, ...other } = props;

        return (
            <Typography
                component="div"
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {value === index && <Box p={3}>{children}</Box>}
            </Typography>
        );
    }

    function MakeSwitch(prop, label, callback) {
        return (
            <>
                <Grid item xs={8}>
                    <Typography component="span" variant="body1">
                        <Box fontWeight="fontWeightBold" m={1}>
                            <FormattedMessage id={label} />
                        </Box>
                    </Typography>
                </Grid>
                <Grid item container xs={4} className={classes.controlItem}>
                    <Switch
                        checked={prop}
                        onChange={callback}
                        value={prop}
                        color="primary"
                        inputProps={{ 'aria-label': 'primary checkbox' }}
                    />
                </Grid>
            </>
        );
    }

    function MakeDropDown(prop, label, values, callback) {
        return (
            <>
                <Grid item xs={8}>
                    <Typography component="span" variant="body1">
                        <Box fontWeight="fontWeightBold" m={1}>
                            <FormattedMessage id={label} />
                        </Box>
                    </Typography>
                </Grid>
                <Grid item container xs={4} className={classes.controlItem}>
                    <Select labelId={label} value={prop} onChange={callback}>
                        {Object.keys(values).map((key) => (
                            <MenuItem key={key} value={key}>
                                <FormattedMessage id={values[key]} />
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
            </>
        );
    }

    function MakeButton(callback, label) {
        return (
            <Grid item>
                <Button
                    onClick={callback}
                    variant="contained"
                    color="primary"
                    className={classes.button}
                >
                    <FormattedMessage id={label} />
                </Button>
            </Grid>
        );
    }

    function MakeSlider(
        threshold,
        label,
        disabled,
        onCommitCallback,
        thresholdMarks
    ) {
        const [sliderValue, setSliderValue] = useState(threshold);

        const handleValueChanged = (event, newValue) => {
            setSliderValue(newValue);
        };

        return (
            <>
                <Grid item xs={7}>
                    <Typography component="span" variant="body1">
                        <Box fontWeight="fontWeightBold" m={1}>
                            <FormattedMessage id={label} />
                        </Box>
                    </Typography>
                </Grid>
                <Grid item container xs={5} className={classes.controlItem}>
                    <Slider
                        min={0}
                        max={100}
                        valueLabelDisplay="auto"
                        onChange={handleValueChanged}
                        onChangeCommitted={onCommitCallback}
                        value={sliderValue}
                        disabled={disabled}
                        marks={thresholdMarks}
                    />
                </Grid>
            </>
        );
    }

    function MakeLineSeparator() {
        return (
            <Grid item xs={12}>
                <Divider />
            </Grid>
        );
    }

    function SingleLineDiagramParameters() {
        return (
            <Grid container spacing={2} className={classes.grid}>
                {MakeSwitch(diagonalLabelLocal, 'diagonalLabel', () => {
                    handleChangeDiagonalLabel(!diagonalLabelLocal);
                })}
                <MakeLineSeparator />
                {MakeSwitch(centerLabelLocal, 'centerLabel', () => {
                    handleChangeCenterLabel(!centerLabelLocal);
                })}
                <MakeLineSeparator />
                <Grid item xs={8}>
                    <Typography component="span" variant="body1">
                        <Box fontWeight="fontWeightBold" m={1}>
                            <FormattedMessage id="SubstationLayout" />
                        </Box>
                    </Typography>
                </Grid>
                <Grid item container xs={4} className={classes.controlItem}>
                    <Select
                        labelId="substation-layout-select-label"
                        value={substationLayoutLocal}
                        onChange={(event) => {
                            handleChangeSubstationLayout(event.target.value);
                        }}
                    >
                        <MenuItem value={SubstationLayout.HORIZONTAL}>
                            <FormattedMessage id="HorizontalSubstationLayout" />
                        </MenuItem>
                        <MenuItem value={SubstationLayout.VERTICAL}>
                            <FormattedMessage id="VerticalSubstationLayout" />
                        </MenuItem>
                        <MenuItem value={SubstationLayout.SMART}>
                            <FormattedMessage id="SmartSubstationLayout" />
                        </MenuItem>
                        <MenuItem
                            value={SubstationLayout.SMARTHORIZONTALCOMPACTION}
                        >
                            <FormattedMessage id="SmartWithHorizontalCompactionSubstationLayout" />
                        </MenuItem>
                        <MenuItem
                            value={SubstationLayout.SMARTVERTICALCOMPACTION}
                        >
                            <FormattedMessage id="SmartWithVerticalCompactionSubstationLayout" />
                        </MenuItem>
                    </Select>
                </Grid>
            </Grid>
        );
    }

    const MapParameters = () => {
        return (
            <Grid container spacing={2} className={classes.grid}>
                {MakeSwitch(lineFullPathLocal, 'lineFullPath', () => {
                    handleChangeLineFullPath(!lineFullPathLocal);
                })}
                <MakeLineSeparator />
                {MakeSwitch(lineParallelPathLocal, 'lineParallelPath', () => {
                    handleChangeLineParallelPath(!lineParallelPathLocal);
                })}
                <MakeLineSeparator />
                <Grid item xs={8}>
                    <Typography component="span" variant="body1">
                        <Box fontWeight="fontWeightBold" m={1}>
                            <FormattedMessage id="LineFlowMode" />
                        </Box>
                    </Typography>
                </Grid>
                <Grid item container xs={4} className={classes.controlItem}>
                    <Select
                        labelId="line-flow-mode-select-label"
                        value={lineFlowModeLocal}
                        onChange={(event) => {
                            handleChangeLineFlowMode(event.target.value);
                        }}
                    >
                        <MenuItem value={LineFlowMode.STATIC_ARROWS}>
                            <FormattedMessage id="StaticArrows" />
                        </MenuItem>
                        <MenuItem value={LineFlowMode.ANIMATED_ARROWS}>
                            <FormattedMessage id="AnimatedArrows" />
                        </MenuItem>
                        <MenuItem value={LineFlowMode.FEEDERS}>
                            <FormattedMessage id="Feeders" />
                        </MenuItem>
                    </Select>
                </Grid>
                <MakeLineSeparator />
                <Grid item xs={8}>
                    <Typography component="span" variant="body1">
                        <Box fontWeight="fontWeightBold" m={1}>
                            <FormattedMessage id="LineFlowColorMode" />
                        </Box>
                    </Typography>
                </Grid>
                <Grid item container xs={4} className={classes.controlItem}>
                    <Select
                        labelId="line-flow-color-mode-select-label"
                        value={lineFlowColorModeLocal}
                        onChange={(event) => {
                            handleChangeLineFlowColorMode(event.target.value);
                        }}
                    >
                        <MenuItem value={LineFlowColorMode.NOMINAL_VOLTAGE}>
                            <FormattedMessage id="NominalVoltage" />
                        </MenuItem>
                        <MenuItem value={LineFlowColorMode.OVERLOADS}>
                            <FormattedMessage id="Overloads" />
                        </MenuItem>
                    </Select>
                </Grid>
                <MakeLineSeparator />
                {MakeSlider(
                    Number(lineFlowAlertThresholdLocal),
                    'AlertThresholdLabel',
                    disabledFlowAlertThreshold,
                    (event, value) => {
                        handleChangeLineFlowAlertThreshold(value);
                    },
                    alertThresholdMarks
                )}
                <MakeLineSeparator />
                {MakeSwitch(
                    displayOverloadTableLocal,
                    'displayOverloadTable',
                    () => {
                        handleChangeDisplayOverloadTable(
                            !displayOverloadTableLocal
                        );
                    }
                )}
            </Grid>
        );
    };

    const TYPES = {
        enum: 'Enum',
        bool: 'Bool',
    };

    function makeComponentFor(defParam, key, lfParams, setter) {
        if (defParam.type === TYPES.bool) {
            return MakeSwitch(lfParams[key], defParam.description, (ev) =>
                setter({ ...lfParams, [key]: ev.target.checked })
            );
        } else if (defParam.type === TYPES.enum) {
            return MakeDropDown(
                lfParams[key],
                defParam.description,
                defParam.values,
                (ev) => setter({ ...lfParams, [key]: ev.target.value })
            );
        }
    }

    function makeComponentsFor(defParams, params, setter) {
        return Object.keys(defParams).map((key) => (
            <Grid container key={key}>
                {makeComponentFor(defParams[key], key, params, setter)}
                <MakeLineSeparator />
            </Grid>
        ));
    }

    const resetLfParameters = () => {
        setLoadFlowParameters(studyUuid, null)
            .then(() => {
                return getLoadFlowParameters(studyUuid)
                    .then((params) => setLfParams(params))
                    .catch((errorMessage) =>
                        displayErrorMessageWithSnackbar({
                            errorMessage: errorMessage,
                            enqueueSnackbar: enqueueSnackbar,
                            headerMessage: {
                                headerMessageId: 'paramsRetrievingError',
                                intlRef: intlRef,
                            },
                        })
                    );
            })
            .catch((errorMessage) =>
                displayErrorMessageWithSnackbar({
                    errorMessage: errorMessage,
                    enqueueSnackbar: enqueueSnackbar,
                    headerMessage: {
                        headerMessageId: 'paramsChangingError',
                        intlRef: intlRef,
                    },
                })
            );
    };

    const commitLFParameter = (newParams) => {
        let oldParams = { ...lfParams };
        setLfParams(newParams);
        setLoadFlowParameters(studyUuid, newParams).catch((errorMessage) => {
            setLfParams(oldParams);
            displayErrorMessageWithSnackbar({
                errorMessage: errorMessage,
                enqueueSnackbar: enqueueSnackbar,
                headerMessage: {
                    headerMessageId: 'paramsChangingError',
                    intlRef: intlRef,
                },
            });
        });
    };

    const updateLfProvider = (evt) => {
        const newProvider = evt.target.value;
        const oldProvider = lfProvider;
        setLfProvider(newProvider);
        setLoadFlowProvider(
            studyUuid,
            newProvider === 'Default' ? '' : newProvider
        ).catch((errorMessage) => {
            setLfProvider(oldProvider); // restore old value
            displayErrorMessageWithSnackbar({
                errorMessage: errorMessage,
                enqueueSnackbar: enqueueSnackbar,
                headerMessage: {
                    headerMessageId: 'setLoadFlowProviderError',
                    intlRef: intlRef,
                },
            });
        });
    };

    const LoadFlow = () => {
        return (
            <Grid
                container
                spacing={2}
                className={classes.grid}
                justify="flex-end"
            >
                <Grid container key="lfProvider">
                    {MakeDropDown(
                        lfProvider,
                        'Provider',
                        LF_PROVIDER_VALUES,
                        updateLfProvider
                    )}
                </Grid>
                <MakeLineSeparator />
                <LoadFlowParameters />
            </Grid>
        );
    };

    const LoadFlowParameters = () => {
        const defParams = {
            voltageInitMode: {
                type: TYPES.enum,
                description: 'descLfVoltageInitMode',
                values: {
                    UNIFORM_VALUES: 'descLfUniformValues',
                    PREVIOUS_VALUES: 'descLfPreviousValues',
                    DC_VALUES: 'descLfDcValues',
                },
            },
            transformerVoltageControlOn: {
                type: TYPES.bool,
                description: 'descLfTransformerVoltageControlOn',
            },
            noGeneratorReactiveLimits: {
                type: TYPES.bool,
                description: 'descLfNoGeneratorReactiveLimits',
            },
            phaseShifterRegulationOn: {
                type: TYPES.bool,
                description: 'descLfPhaseShifterRegulationOn',
            },
            twtSplitShuntAdmittance: {
                type: TYPES.bool,
                description: 'descLfTwtSplitShuntAdmittance',
            },
            simulShunt: {
                type: TYPES.bool,
                description: 'descLfSimulShunt',
            },
            readSlackBus: {
                type: TYPES.bool,
                description: 'descLfReadSlackBus',
            },
            writeSlackBus: {
                type: TYPES.bool,
                description: 'descLfWriteSlackBus',
            },
        };

        return (
            lfParams && (
                <>
                    {makeComponentsFor(defParams, lfParams, commitLFParameter)}
                    {MakeButton(resetLfParameters, 'resetToDefault')}
                </>
            )
        );
    };

    return (
        <Dialog
            open={showParameters}
            onClose={hideParameters}
            aria-labelledby="form-dialog-title"
            maxWidth={'md'}
            fullWidth={true}
        >
            <DialogTitle id="form-dialog-title">
                <Typography
                    component="span"
                    variant="h5"
                    className={classes.title}
                >
                    <FormattedMessage id="parameters" />
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Container maxWidth="md">
                    <Tabs
                        value={tabIndex}
                        indicatorColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                        onChange={(event, newValue) => setTabIndex(newValue)}
                        aria-label="parameters"
                    >
                        <Tab
                            label={<FormattedMessage id="SingleLineDiagram" />}
                        />
                        <Tab label={<FormattedMessage id="Map" />} />
                        <Tab
                            disabled={!studyUuid}
                            label={<FormattedMessage id="LoadFlow" />}
                        />
                    </Tabs>

                    <TabPanel value={tabIndex} index={0}>
                        <SingleLineDiagramParameters />
                    </TabPanel>
                    <TabPanel value={tabIndex} index={1}>
                        <MapParameters />
                    </TabPanel>
                    <TabPanel value={tabIndex} index={2}>
                        {studyUuid && <LoadFlow />}
                    </TabPanel>
                    <Grid item xs={12}>
                        <Button
                            onClick={hideParameters}
                            variant="contained"
                            color="primary"
                            className={classes.button}
                        >
                            <FormattedMessage id="close" />
                        </Button>
                    </Grid>
                </Container>
            </DialogContent>
        </Dialog>
    );
};

export default Parameters;
