/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';

import { FormattedMessage } from 'react-intl';

import { useSelector } from 'react-redux';

import makeStyles from '@mui/styles/makeStyles';
import {
    Chip,
    Grid,
    MenuItem,
    Autocomplete,
    Box,
    Button,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    TextField,
    Select,
    Switch,
    Tab,
    Tabs,
    Typography,
    Slider,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckIcon from '@mui/icons-material/Check';
import { useSnackbar } from 'notistack';

import { LineFlowMode } from './network/line-layer';
import { LineFlowColorMode } from './network/line-layer';
import {
    getLoadFlowParameters,
    setLoadFlowParameters,
    getLoadFlowProvider,
    setLoadFlowProvider,
    updateConfigParameter,
    getAvailableComponentLibraries,
    getDefaultLoadFlowProvider,
    fetchDefaultParametersValues,
} from '../utils/rest-api';
import { SubstationLayout } from './diagrams/singleLineDiagram/single-line-diagram';
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
    PARAM_COMPONENT_LIBRARY,
    PARAM_FLUX_CONVENTION,
} from '../utils/config-params';
import { displayErrorMessageWithSnackbar, useIntlRef } from '../utils/messages';

const useStyles = makeStyles((theme) => ({
    title: {
        padding: theme.spacing(2),
    },
    grid: {
        padding: theme.spacing(2),
    },
    minWidthMedium: {
        minWidth: theme.spacing(20),
    },
    controlItem: {
        justifyContent: 'flex-end',
    },
    button: {
        marginBottom: '30px',
    },
    advancedParameterButton: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(1),
    },
}));

export const FluxConventions = {
    IIDM: 'iidm',
    TARGET: 'target',
};

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
    OpenLoadFlow: 'OpenLoadFlow',
    Hades2: 'Hades2',
};

const Parameters = ({ showParameters, hideParameters, user }) => {
    const classes = useStyles();

    let countriesList;
    try {
        countriesList = require('localized-countries')(
            require('localized-countries/data/' +
                navigator.language.substr(0, 2))
        );
    } catch (error) {
        // fallback to english if no localised list found
        countriesList = require('localized-countries')(
            require('localized-countries/data/en')
        );
    }

    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const [lineFullPathLocal, handleChangeLineFullPath] =
        useParameterState(PARAM_LINE_FULL_PATH);

    const [lineParallelPathLocal, handleChangeLineParallelPath] =
        useParameterState(PARAM_LINE_PARALLEL_PATH);

    const [lineFlowAlertThresholdLocal, handleChangeLineFlowAlertThreshold] =
        useParameterState(PARAM_LINE_FLOW_ALERT_THRESHOLD);

    const [displayOverloadTableLocal, handleChangeDisplayOverloadTable] =
        useParameterState(PARAM_DISPLAY_OVERLOAD_TABLE);

    const [lineFlowModeLocal, handleChangeLineFlowMode] =
        useParameterState(PARAM_LINE_FLOW_MODE);

    const [lineFlowColorModeLocal, handleChangeLineFlowColorMode] =
        useParameterState(PARAM_LINE_FLOW_COLOR_MODE);

    const [centerLabelLocal, handleChangeCenterLabel] =
        useParameterState(PARAM_CENTER_LABEL);

    const [diagonalLabelLocal, handleChangeDiagonalLabel] =
        useParameterState(PARAM_DIAGONAL_LABEL);

    const [substationLayoutLocal, handleChangeSubstationLayout] =
        useParameterState(PARAM_SUBSTATION_LAYOUT);

    const [componentLibraryLocal, handleChangeComponentLibrary] =
        useParameterState(PARAM_COMPONENT_LIBRARY);

    const [fluxConventionLocal, handleChangeFluxConvention] = useParameterState(
        PARAM_FLUX_CONVENTION
    );

    const studyUuid = useSelector((state) => state.studyUuid);

    const [lfProvider, setLfProvider] = useState(null);

    const [lfParams, setLfParams] = useState(null);

    const [showAdvancedLfParams, setShowAdvancedLfParams] = useState(false);

    const [disabledFlowAlertThreshold, setDisabledFlowAlertThreshold] =
        useState(
            lineFlowColorModeLocal === 'nominalVoltage' &&
                !displayOverloadTableLocal
        );

    const [tabIndex, setTabIndex] = useState(0);

    const [componentLibraries, setComponentLibraries] = useState([]);

    const updateLfProvider = useCallback(
        (newProvider) => {
            setLoadFlowProvider(studyUuid, newProvider)
                .then(() => setLfProvider(newProvider))
                .catch((errorMessage) => {
                    displayErrorMessageWithSnackbar({
                        errorMessage: errorMessage,
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId: 'setLoadFlowProviderError',
                            intlRef: intlRef,
                        },
                    });
                });
        },
        [studyUuid, enqueueSnackbar, intlRef]
    );

    const setLoadFlowProviderToDefault = useCallback(() => {
        getDefaultLoadFlowProvider()
            .then((defaultLFProvider) => {
                updateLfProvider(
                    defaultLFProvider in LF_PROVIDER_VALUES
                        ? defaultLFProvider
                        : LF_PROVIDER_VALUES.OpenLoadFlow
                );
            })
            .catch((errorMessage) => {
                displayErrorMessageWithSnackbar({
                    errorMessage: errorMessage,
                    enqueueSnackbar: enqueueSnackbar,
                    headerMessage: {
                        headerMessageId: 'defaultLoadflowRetrievingError',
                        intlRef: intlRef,
                    },
                });
            });
    }, [updateLfProvider, enqueueSnackbar, intlRef]);

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
                    // if provider is not defined or not among allowed values, it's set to default value
                    if (!(provider in LF_PROVIDER_VALUES)) {
                        setLoadFlowProviderToDefault();
                    } else {
                        setLfProvider(provider);
                    }
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
    }, [studyUuid, enqueueSnackbar, intlRef, setLoadFlowProviderToDefault]);

    useEffect(() => {
        if (user !== null) {
            getAvailableComponentLibraries().then((libraries) => {
                setComponentLibraries(libraries);
            });
        }
    }, [user]);

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
                        inputProps={{ 'aria-label': 'primary checkbox' }}
                    />
                </Grid>
            </>
        );
    }

    function MakeAdvancedParameterButton(showOpenIcon, label, callback) {
        return (
            <>
                <Grid item xs={12} className={classes.advancedParameterButton}>
                    <Button
                        startIcon={<SettingsIcon />}
                        endIcon={
                            showOpenIcon ? (
                                <CheckIcon style={{ color: 'green' }} />
                            ) : undefined
                        }
                        onClick={callback}
                    >
                        <FormattedMessage id={label} />
                    </Button>
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
                    <Select
                        labelId={label}
                        value={prop}
                        onChange={callback}
                        size="small"
                    >
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

    function MakeCountrySelector(value, label, callback) {
        return (
            <>
                <Grid item xs={6}>
                    <Typography component="span" variant="body1">
                        <Box fontWeight="fontWeightBold" m={1}>
                            <FormattedMessage id={label} />
                        </Box>
                    </Typography>
                </Grid>
                <Grid item container xs={6} className={classes.controlItem}>
                    <Autocomplete
                        size="small"
                        value={value}
                        multiple="true"
                        onChange={(event, newValues) => callback(newValues)}
                        options={Object.keys(countriesList.object())}
                        getOptionLabel={(code) => countriesList.get(code)}
                        renderInput={(props) => (
                            <TextField
                                label={
                                    <FormattedMessage
                                        id={
                                            value?.length === 0
                                                ? 'descLfAllCountries'
                                                : 'descLfCountries'
                                        }
                                    />
                                }
                                className={classes.minWidthMedium}
                                {...props}
                            />
                        )}
                        renderTags={(val, getTagsProps) =>
                            val.map((code, index) => (
                                <Chip
                                    id={'chip_' + code}
                                    size={'small'}
                                    label={countriesList.get(code)}
                                    {...getTagsProps({ index })}
                                />
                            ))
                        }
                    />
                </Grid>
            </>
        );
    }

    function MakeButton(callback, label) {
        return (
            <Grid item paddingTop={1}>
                <Button onClick={callback} className={classes.button}>
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
            <Grid container spacing={1} className={classes.grid}>
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
                        size="small"
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

                <MakeLineSeparator />

                <Grid item xs={8}>
                    <Typography component="span" variant="body1">
                        <Box fontWeight="fontWeightBold" m={1}>
                            <FormattedMessage id="ComponentLibrary" />
                        </Box>
                    </Typography>
                </Grid>
                <Grid item container xs={4} className={classes.controlItem}>
                    <Select
                        size="small"
                        labelId="component-library-select-label"
                        value={
                            componentLibraryLocal !== null
                                ? componentLibraryLocal
                                : componentLibraries[0]
                        }
                        onChange={(event) => {
                            handleChangeComponentLibrary(event.target.value);
                        }}
                    >
                        {componentLibraries.map((library) => {
                            return (
                                <MenuItem key={library} value={library}>
                                    {library}
                                </MenuItem>
                            );
                        })}
                    </Select>
                </Grid>
            </Grid>
        );
    }

    function NetworkParameters() {
        return (
            <Grid container spacing={1} className={classes.grid}>
                <Grid item container spacing={1}>
                    <Grid item xs={8}>
                        <Typography component="span" variant="body1">
                            <Box fontWeight="fontWeightBold" m={1}>
                                <FormattedMessage id="FluxConvention" />
                            </Box>
                        </Typography>
                    </Grid>
                    <Grid item container xs={4} className={classes.controlItem}>
                        <Select
                            size="small"
                            labelId="flux-convention-select-label"
                            value={fluxConventionLocal}
                            onChange={(event) => {
                                handleChangeFluxConvention(event.target.value);
                            }}
                        >
                            <MenuItem value={FluxConventions.IIDM}>
                                <FormattedMessage id="FluxConvention.iidm" />
                            </MenuItem>
                            <MenuItem value={FluxConventions.TARGET}>
                                <FormattedMessage id="FluxConvention.target" />
                            </MenuItem>
                        </Select>
                    </Grid>
                    <MakeLineSeparator />
                </Grid>
                {MakeButton(resetNetworkParameters, 'resetToDefault')}
            </Grid>
        );
    }

    const MapParameters = () => {
        return (
            <Grid container spacing={1} className={classes.grid}>
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
                        size="small"
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
                        size="small"
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
        countries: 'Countries',
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
        } else if (defParam.type === TYPES.countries) {
            return MakeCountrySelector(
                lfParams[key],
                defParam.description,
                (newValues) => {
                    setter({ ...lfParams, [key]: [...newValues] });
                }
            );
        }
    }

    function makeComponentsFor(defParams, params, setter) {
        return Object.keys(defParams).map((key) => (
            <Grid container spacing={1} paddingTop={1} key={key}>
                {makeComponentFor(defParams[key], key, params, setter)}
                <MakeLineSeparator />
            </Grid>
        ));
    }

    const resetNetworkParameters = () => {
        fetchDefaultParametersValues().then((defaultValues) => {
            const defaultFluxConvention = defaultValues.fluxConvention;
            if (
                Object.values(FluxConventions).includes(defaultFluxConvention)
            ) {
                handleChangeFluxConvention(defaultFluxConvention);
            }
        });
    };

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

        setLoadFlowProviderToDefault();
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

    const updateLfProviderCallback = useCallback(
        (evt) => {
            updateLfProvider(evt.target.value);
        },
        [updateLfProvider]
    );

    const LoadFlow = () => {
        return (
            <Grid container className={classes.grid}>
                <Grid container key="lfProvider">
                    {MakeDropDown(
                        lfProvider,
                        'Provider',
                        LF_PROVIDER_VALUES,
                        updateLfProviderCallback
                    )}

                    <Grid container paddingTop={1}>
                        <MakeLineSeparator />
                    </Grid>
                    <BasicLoadFlowParameters />
                    <AdvancedLoadFlowParameters />
                </Grid>
                {MakeButton(resetLfParameters, 'resetToDefault')}
            </Grid>
        );
    };

    const BasicLoadFlowParameters = () => {
        const defParams = {
            transformerVoltageControlOn: {
                type: TYPES.bool,
                description: 'descLfTransformerVoltageControlOn',
            },
            phaseShifterRegulationOn: {
                type: TYPES.bool,
                description: 'descLfPhaseShifterRegulationOn',
            },
            dc: {
                type: TYPES.bool,
                description: 'descLfDC',
            },
            balanceType: {
                type: TYPES.enum,
                description: 'descLfBalanceType',
                values: {
                    PROPORTIONAL_TO_GENERATION_P: 'descLfBalanceTypeGenP',
                    PROPORTIONAL_TO_GENERATION_P_MAX:
                        'descLfBalanceTypeGenPMax',
                    PROPORTIONAL_TO_LOAD: 'descLfBalanceTypeLoad',
                    PROPORTIONAL_TO_CONFORM_LOAD:
                        'descLfBalanceTypeConformLoad',
                },
            },
            countriesToBalance: {
                type: TYPES.countries,
                description: 'descLfCountriesToBalance',
            },
            connectedComponentMode: {
                type: TYPES.enum,
                description: 'descLfConnectedComponentMode',
                values: {
                    MAIN: 'descLfConnectedComponentModeMain',
                    ALL: 'descLfConnectedComponentModeAll',
                },
            },
            hvdcAcEmulation: {
                type: TYPES.bool,
                description: 'descLfHvdcAcEmulation',
            },
        };

        return (
            lfParams && (
                <>{makeComponentsFor(defParams, lfParams, commitLFParameter)}</>
            )
        );
    };

    const AdvancedLoadFlowParameters = () => {
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
            noGeneratorReactiveLimits: {
                type: TYPES.bool,
                description: 'descLfNoGeneratorReactiveLimits',
            },
            twtSplitShuntAdmittance: {
                type: TYPES.bool,
                description: 'descLfTwtSplitShuntAdmittance',
            },
            readSlackBus: {
                type: TYPES.bool,
                description: 'descLfReadSlackBus',
            },
            writeSlackBus: {
                type: TYPES.bool,
                description: 'descLfWriteSlackBus',
            },
            distributedSlack: {
                type: TYPES.bool,
                description: 'descLfDistributedSlack',
            },
            shuntCompensatorVoltageControlOn: {
                type: TYPES.bool,
                description: 'descLfShuntCompensatorVoltageControlOn',
            },
            dcUseTransformerRatio: {
                type: TYPES.bool,
                description: 'descLfDcUseTransformerRatio',
            },
        };

        return (
            lfParams && (
                <>
                    {MakeAdvancedParameterButton(
                        showAdvancedLfParams,
                        'showAdvancedParameters',
                        () => setShowAdvancedLfParams(!showAdvancedLfParams)
                    )}
                    {showAdvancedLfParams &&
                        makeComponentsFor(
                            defParams,
                            lfParams,
                            commitLFParameter
                        )}
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
                        variant="scrollable"
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
                        <Tab label={<FormattedMessage id="Network" />} />
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
                    <TabPanel value={tabIndex} index={3}>
                        <NetworkParameters />
                    </TabPanel>
                    <Grid container justifyContent={'flex-end'}>
                        <Button
                            onClick={hideParameters}
                            justifyContent="flex-end"
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
