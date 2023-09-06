/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import makeStyles from '@mui/styles/makeStyles';
import {
    Grid,
    Box,
    Button,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    Tab,
    Tabs,
    Typography,
    Switch,
    Select,
    MenuItem,
} from '@mui/material';

import { useSnackMessage, useDebounce } from '@gridsuite/commons-ui';

import {
    SingleLineDiagramParameters,
    useGetAvailableComponentLibraries,
} from './single-line-diagram-parameters';

import { LoadFlowParameters } from './load-flow-parameters';
import { MapParameters } from './map-parameters';
import { NetworkParameters } from './network-parameters';
import {
    ShortCircuitParameters,
    useGetShortCircuitParameters,
} from './short-circuit-parameters';
import { SecurityAnalysisParameters } from './security-analysis-parameters';
import { SensitivityAnalysisParameters } from './sensitivity-analysis-parameters';
import DynamicSimulationParameters from './dynamicsimulation/dynamic-simulation-parameters';
import { PARAM_DEVELOPER_MODE } from '../../../utils/config-params';
import {
    useGetVoltageInitParameters,
    VoltageInitParameters,
} from './voltageinit/voltage-init-parameters';
import { updateConfigParameter } from '../../../services/config';
import {
    getLoadFlowProviders,
    getLoadFlowSpecificParametersDescription,
} from '../../../services/loadflow';
import { fetchSecurityAnalysisProviders } from '../../../services/security-analysis';
import { fetchSensitivityAnalysisProviders } from '../../../services/sensitivity-analysis';
import {
    fetchDefaultSensitivityAnalysisProvider,
    fetchSensitivityAnalysisProvider,
    getSensitivityAnalysisParameters,
    setSensitivityAnalysisParameters,
    updateSensitivityAnalysisProvider,
} from '../../../services/study/sensitivity-analysis';
import {
    getDefaultLoadFlowProvider,
    getLoadFlowParameters,
    getLoadFlowProvider,
    setLoadFlowParameters,
    setLoadFlowProvider,
} from '../../../services/study/loadflow';
import {
    fetchDefaultSecurityAnalysisProvider,
    fetchSecurityAnalysisProvider,
    getSecurityAnalysisParameters,
    setSecurityAnalysisParameters,
    updateSecurityAnalysisProvider,
} from '../../../services/study/security-analysis';
import {
    OptionalServicesNames,
    OptionalServicesStatus,
} from '../../utils/optional-services';
import { useOptionalServiceStatus } from '../../../hooks/use-optional-service-status';

export const CloseButton = ({ hideParameters, classeStyleName }) => {
    return (
        <LabelledButton
            callback={hideParameters}
            label={'close'}
            name={classeStyleName}
        />
    );
};

export const LabelledButton = ({ callback, label, name }) => {
    return (
        <Button onClick={callback} className={name}>
            <FormattedMessage id={label} />
        </Button>
    );
};

export const SwitchWithLabel = ({ value, label, callback }) => {
    const classes = useStyles();
    return (
        <>
            <Grid item xs={8} className={classes.parameterName}>
                <FormattedMessage id={label} />
            </Grid>
            <Grid item container xs={4} className={classes.controlItem}>
                <Switch
                    checked={value}
                    onChange={callback}
                    value={value}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                />
            </Grid>
        </>
    );
};

export const DropDown = ({ value, label, values, callback }) => {
    const classes = useStyles();
    return (
        <>
            <Grid item xs={8} className={classes.parameterName}>
                <FormattedMessage id={label} />
            </Grid>
            <Grid item container xs={4} className={classes.controlItem}>
                <Select
                    labelId={label}
                    value={value}
                    onChange={callback}
                    size="small"
                >
                    {Object.entries(values).map(([key, value]) => (
                        <MenuItem key={key} value={key}>
                            <FormattedMessage id={value} />
                        </MenuItem>
                    ))}
                </Select>
            </Grid>
        </>
    );
};

export const useStyles = makeStyles((theme) => ({
    title: {
        padding: theme.spacing(2),
    },
    minWidthMedium: {
        minWidth: theme.spacing(20),
    },
    parameterName: {
        fontWeight: 'bold',
        marginTop: theme.spacing(1),
    },
    controlItem: {
        justifyContent: 'flex-end',
        flexGrow: 1,
    },
    button: {
        marginBottom: theme.spacing(2),
        marginLeft: theme.spacing(1),
    },
    subgroupParameters: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1),
    },
    subgroupParametersAccordion: {
        '&:before': {
            display: 'none',
        },
        background: 'none',
    },
    subgroupParametersAccordionSummary: {
        flexDirection: 'row-reverse',
        '& .MuiAccordionSummary-expandIconWrapper': {
            transform: 'rotate(-90deg)',
        },
        '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
            transform: 'rotate(0deg)',
        },
        '& .MuiAccordionSummary-content': {
            marginLeft: theme.spacing(0),
        },
    },
    subgroupParametersAccordionDetails: {
        padding: theme.spacing(0),
    },
    marginTopButton: {
        marginTop: 10,
        position: 'sticky',
        bottom: 0,
    },
    scrollableGrid: {
        overflowY: 'auto',
        overflowX: 'hidden',
        maxHeight: '60vh',
        paddingRight: theme.spacing(2),
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(1),
        flexGrow: 1,
    },
    singleItem: {
        display: 'flex',
        flex: 'auto',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
    firstTextField: {
        marginLeft: theme.spacing(3),
    },
    secondTextField: {
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(2),
    },
    singleTextField: {
        display: 'flex',
        marginRight: theme.spacing(2),
        marginLeft: theme.spacing(1),
    },
    tooltip: {
        marginLeft: theme.spacing(1),
    },
    text: {
        display: 'flex',
        marginBottom: theme.spacing(1),
        marginTop: theme.spacing(1),
    },
    multipleItems: {
        display: 'flex',
        flex: 'auto',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
    tabWithError: {
        '&.Mui-selected': { color: theme.palette.error.main },
        color: theme.palette.error.main,
    },
    tabWithErrorIndicator: {
        backgroundColor: theme.palette.error.main,
    },
}));

export const TabPanel = (props) => {
    const { children, value, index, keepState, ...other } = props;
    return (
        <Typography
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            style={{ flexGrow: 1 }}
            {...other}
        >
            {(value === index || keepState) && <Box p={1}>{children}</Box>}
        </Typography>
    );
};

const INITIAL_PROVIDERS = {};

const FETCHING_STATUS = {
    NOT_STARTED: 'not_started',
    FETCHING: 'fetching',
    FINISHED: 'finished',
};

export const useParametersBackend = (
    user,
    type,
    optionalServiceStatus,
    backendFetchProviders,
    backendFetchProvider,
    backendFetchDefaultProvider,
    backendUpdateProvider,
    backendFetchParameters,
    backendUpdateParameters,
    backendFetchSpecificParameters
) => {
    const studyUuid = useSelector((state) => state.studyUuid);
    const { snackError } = useSnackMessage();

    const providersRef = useRef(INITIAL_PROVIDERS);
    const [provider, setProvider] = useState();

    const [fetching, setFetching] = useState(FETCHING_STATUS.NOT_STARTED);
    const [params, setParams] = useState(null);

    const [specificParamsDescription, setSpecificParamsDescription] =
        useState(null);

    const backendUpdateParametersCb = useCallback(
        (studyUuid, newParams, oldParams) => {
            backendUpdateParameters(studyUuid, newParams).catch((error) => {
                setParams(oldParams);
                snackError({
                    messageTxt: error.message,
                    headerId: 'update' + type + 'ParametersError',
                });
            });
        },
        [backendUpdateParameters, snackError, type]
    );

    const debouncedBackendUpdateParameters = useDebounce(
        backendUpdateParametersCb,
        1000
    );

    const updateProvider = useCallback(
        (newProvider) => {
            backendUpdateProvider(studyUuid, newProvider)
                .then(() => {
                    setProvider(newProvider);
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'update' + type + 'ProviderError',
                    });
                });
        },
        [type, backendUpdateProvider, studyUuid, snackError]
    );

    const resetProvider = useCallback(() => {
        backendFetchDefaultProvider()
            .then((defaultProvider) => {
                const providerNames = Object.keys(providersRef.current);
                if (providerNames.length > 0) {
                    const newProvider =
                        defaultProvider in providersRef.current
                            ? defaultProvider
                            : providerNames[0];
                    if (newProvider !== provider) {
                        updateProvider(newProvider);
                    }
                }
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'fetchDefault' + type + 'ProviderError',
                });
            });
    }, [
        backendFetchDefaultProvider,
        provider,
        updateProvider,
        snackError,
        type,
    ]);

    const updateParameter = useCallback(
        (newParams) => {
            if (backendUpdateParameters) {
                let oldParams = { ...params };
                setParams(newParams);
                debouncedBackendUpdateParameters(
                    studyUuid,
                    newParams,
                    oldParams
                );
            }
        },
        [
            debouncedBackendUpdateParameters,
            backendUpdateParameters,
            params,
            studyUuid,
        ]
    );

    const resetParameters = useCallback(
        (callBack) => {
            backendUpdateParameters(studyUuid, null)
                .then(() => {
                    return backendFetchParameters(studyUuid)
                        .then((params) => {
                            setParams(params);
                            if (callBack) {
                                callBack();
                            }
                        })
                        .catch((error) => {
                            snackError({
                                messageTxt: error.message,
                                headerId: 'fetch' + type + 'ParametersError',
                            });
                        });
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'update' + type + 'ParametersError',
                    });
                });
        },
        [
            studyUuid,
            type,
            backendUpdateParameters,
            backendFetchParameters,
            snackError,
            setParams,
        ]
    );

    useEffect(() => {
        if (
            user !== null &&
            optionalServiceStatus === OptionalServicesStatus.Up
        ) {
            setFetching(FETCHING_STATUS.FETCHING);
            backendFetchProviders()
                .then((providers) => {
                    // we can consider the provider gotten from back will be also used as
                    // a key for translation
                    const providersObj = providers.reduce(function (obj, v) {
                        obj[v] = v;
                        return obj;
                    }, {});
                    providersRef.current = providersObj;
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'fetch' + type + 'ProvidersError',
                    });
                });
            setFetching(FETCHING_STATUS.FINISHED);
        }
    }, [user, backendFetchProviders, type, snackError, optionalServiceStatus]);

    useEffect(() => {
        if (studyUuid && optionalServiceStatus === OptionalServicesStatus.Up) {
            if (fetching === FETCHING_STATUS.FINISHED && !provider) {
                backendFetchProvider(studyUuid)
                    .then((provider) => {
                        // if provider is not defined or not among allowed values, it's set to default value
                        if (provider in providersRef.current) {
                            setProvider(provider);
                        } else {
                            resetProvider();
                        }
                    })
                    .catch((error) => {
                        snackError({
                            messageTxt: error.message,
                            headerId: 'fetch' + type + 'ProviderError',
                        });
                    });
            }
        }
    }, [
        optionalServiceStatus,
        backendFetchProvider,
        fetching,
        provider,
        resetProvider,
        snackError,
        studyUuid,
        type,
    ]);

    useEffect(() => {
        if (
            studyUuid &&
            backendFetchSpecificParameters &&
            optionalServiceStatus === OptionalServicesStatus.Up
        ) {
            backendFetchSpecificParameters()
                .then((specificParams) => {
                    setSpecificParamsDescription(specificParams);
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'fetch' + type + 'SpecificParametersError',
                    });
                });
        }
    }, [
        optionalServiceStatus,
        backendFetchSpecificParameters,
        snackError,
        studyUuid,
        type,
    ]);

    useEffect(() => {
        if (
            studyUuid &&
            backendFetchParameters &&
            optionalServiceStatus === OptionalServicesStatus.Up
        ) {
            backendFetchParameters(studyUuid)
                .then((params) => {
                    setParams(params);
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'fetch' + type + 'ParametersError',
                    });
                });
        }
    }, [
        optionalServiceStatus,
        backendFetchParameters,
        snackError,
        studyUuid,
        type,
    ]);

    return [
        providersRef.current,
        provider,
        updateProvider,
        resetProvider,
        params,
        updateParameter,
        resetParameters,
        specificParamsDescription,
    ];
};

export function useParameterState(paramName) {
    const { snackError } = useSnackMessage();

    const paramGlobalState = useSelector((state) => state[paramName]);

    const [paramLocalState, setParamLocalState] = useState(paramGlobalState);

    useEffect(() => {
        setParamLocalState(paramGlobalState);
    }, [paramGlobalState]);

    const backendupdateConfigParameterCb = useCallback(
        (studyUuid, newParams) => {
            updateConfigParameter(studyUuid, newParams).catch((error) => {
                setParamLocalState(paramGlobalState);
                snackError({
                    messageTxt: error.message,
                    headerId: 'paramsChangingError',
                });
            });
        },
        [paramGlobalState, snackError]
    );

    const debouncedBackendupdateConfigParameterCb = useDebounce(
        backendupdateConfigParameterCb,
        1000
    );

    const handleChangeParamLocalState = useCallback(
        (value) => {
            setParamLocalState(value);
            debouncedBackendupdateConfigParameterCb(paramName, value);
        },
        [debouncedBackendupdateConfigParameterCb, paramName]
    );

    return [paramLocalState, handleChangeParamLocalState];
}

const TAB_VALUES = {
    sldParamsTabValue: 'SingleLineDiagram',
    mapParamsTabValue: 'Map',
    lfParamsTabValue: 'LoadFlow',
    securityAnalysisParamsTabValue: 'SecurityAnalysis',
    sensitivityAnalysisParamsTabValue: 'SensitivityAnalysis',
    shortCircuitParamsTabValue: 'ShortCircuit',
    dynamicSimulationParamsTabValue: 'DynamicSimulation',
    advancedParamsTabValue: 'Advanced',
    voltageInitParamsTabValue: 'VoltageInit',
};

const Parameters = ({ user, isParametersOpen, hideParameters }) => {
    const classes = useStyles();

    const [tabValue, setTabValue] = useState(TAB_VALUES.sldParamsTabValue);

    const studyUuid = useSelector((state) => state.studyUuid);

    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    const securityAnalysisAvailability = useOptionalServiceStatus(
        OptionalServicesNames.SecurityAnalysis
    );
    const sensitivityAnalysisAvailability = useOptionalServiceStatus(
        OptionalServicesNames.SensitivityAnalysis
    );
    const dynamicSimulationAvailability = useOptionalServiceStatus(
        OptionalServicesNames.DynamicSimulation
    );
    const voltageInitAvailability = useOptionalServiceStatus(
        OptionalServicesNames.VoltageInit
    );
    const shortCircuitAvailability = useOptionalServiceStatus(
        OptionalServicesNames.ShortCircuit
    );

    const loadFlowParametersBackend = useParametersBackend(
        user,
        'LoadFlow',
        OptionalServicesStatus.Up,
        getLoadFlowProviders,
        getLoadFlowProvider,
        getDefaultLoadFlowProvider,
        setLoadFlowProvider,
        getLoadFlowParameters,
        setLoadFlowParameters,
        getLoadFlowSpecificParametersDescription
    );

    const securityAnalysisParametersBackend = useParametersBackend(
        user,
        'SecurityAnalysis',
        securityAnalysisAvailability,
        fetchSecurityAnalysisProviders,
        fetchSecurityAnalysisProvider,
        fetchDefaultSecurityAnalysisProvider,
        updateSecurityAnalysisProvider,
        getSecurityAnalysisParameters,
        setSecurityAnalysisParameters
    );

    const sensitivityAnalysisParametersBackend = useParametersBackend(
        user,
        'SensitivityAnalysis',
        sensitivityAnalysisAvailability,
        fetchSensitivityAnalysisProviders,
        fetchSensitivityAnalysisProvider,
        fetchDefaultSensitivityAnalysisProvider,
        updateSensitivityAnalysisProvider,
        getSensitivityAnalysisParameters,
        setSensitivityAnalysisParameters
    );

    const useShortCircuitParameters = useGetShortCircuitParameters();

    const useVoltageInitParameters = useGetVoltageInitParameters();

    const componentLibraries = useGetAvailableComponentLibraries(user);

    useEffect(() => {
        setTabValue((oldValue) => {
            if (
                !enableDeveloperMode &&
                (oldValue === TAB_VALUES.sensitivityAnalysisParamsTabValue ||
                    oldValue === TAB_VALUES.shortCircuitParamsTabValue ||
                    oldValue === TAB_VALUES.dynamicSimulationParamsTabValue)
            ) {
                return TAB_VALUES.securityAnalysisParamsTabValue;
            }
            return oldValue;
        });
    }, [enableDeveloperMode]);

    return (
        <Dialog
            open={isParametersOpen}
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
            <DialogContent style={{ overflowY: 'hidden' }}>
                <Container maxWidth="md">
                    <Tabs
                        value={tabValue}
                        variant="scrollable"
                        onChange={(event, newValue) => setTabValue(newValue)}
                        aria-label="parameters"
                    >
                        <Tab
                            label={<FormattedMessage id="SingleLineDiagram" />}
                            value={TAB_VALUES.sldParamsTabValue}
                        />
                        <Tab
                            label={<FormattedMessage id="Map" />}
                            value={TAB_VALUES.mapParamsTabValue}
                        />
                        <Tab
                            disabled={!studyUuid}
                            label={<FormattedMessage id="LoadFlow" />}
                            value={TAB_VALUES.lfParamsTabValue}
                        />
                        {securityAnalysisAvailability ===
                            OptionalServicesStatus.Up && (
                            <Tab
                                disabled={!studyUuid}
                                label={
                                    <FormattedMessage id="SecurityAnalysis" />
                                }
                                value={
                                    TAB_VALUES.securityAnalysisParamsTabValue
                                }
                            />
                        )}
                        {sensitivityAnalysisAvailability ===
                            OptionalServicesStatus.Up && (
                            <Tab
                                disabled={!studyUuid}
                                label={
                                    <FormattedMessage id="SensitivityAnalysis" />
                                }
                                value={
                                    TAB_VALUES.sensitivityAnalysisParamsTabValue
                                }
                            />
                        )}
                        {shortCircuitAvailability ===
                            OptionalServicesStatus.Up &&
                            enableDeveloperMode && (
                                <Tab
                                    disabled={!studyUuid}
                                    label={
                                        <FormattedMessage id="ShortCircuit" />
                                    }
                                    value={
                                        TAB_VALUES.shortCircuitParamsTabValue
                                    }
                                />
                            )}
                        {dynamicSimulationAvailability ===
                            OptionalServicesStatus.Up &&
                            enableDeveloperMode && (
                                <Tab
                                    disabled={!studyUuid}
                                    label={
                                        <FormattedMessage id="DynamicSimulation" />
                                    }
                                    value={
                                        TAB_VALUES.dynamicSimulationParamsTabValue
                                    }
                                />
                            )}
                        {voltageInitAvailability ===
                            OptionalServicesStatus.Up &&
                            enableDeveloperMode && (
                                <Tab
                                    disabled={!studyUuid}
                                    label={
                                        <FormattedMessage id="VoltageInit" />
                                    }
                                    value={TAB_VALUES.voltageInitParamsTabValue}
                                />
                            )}
                        <Tab
                            label={<FormattedMessage id="Advanced" />}
                            value={TAB_VALUES.advancedParamsTabValue}
                        />
                    </Tabs>

                    <Grid container>
                        <TabPanel
                            value={tabValue}
                            index={TAB_VALUES.sldParamsTabValue}
                        >
                            <SingleLineDiagramParameters
                                hideParameters={hideParameters}
                                componentLibraries={componentLibraries}
                            />
                        </TabPanel>
                        <TabPanel
                            value={tabValue}
                            index={TAB_VALUES.mapParamsTabValue}
                        >
                            <MapParameters hideParameters={hideParameters} />
                        </TabPanel>
                        <TabPanel
                            value={tabValue}
                            index={TAB_VALUES.lfParamsTabValue}
                            keepState
                        >
                            {studyUuid && (
                                <LoadFlowParameters
                                    hideParameters={hideParameters}
                                    parametersBackend={
                                        loadFlowParametersBackend
                                    }
                                />
                            )}
                        </TabPanel>
                        {securityAnalysisAvailability ===
                            OptionalServicesStatus.Up && (
                            <TabPanel
                                value={tabValue}
                                index={
                                    TAB_VALUES.securityAnalysisParamsTabValue
                                }
                                keepState
                            >
                                {studyUuid && (
                                    <SecurityAnalysisParameters
                                        hideParameters={hideParameters}
                                        parametersBackend={
                                            securityAnalysisParametersBackend
                                        }
                                    />
                                )}
                            </TabPanel>
                        )}
                        {sensitivityAnalysisAvailability ===
                            OptionalServicesStatus.Up && (
                            <TabPanel
                                value={tabValue}
                                index={
                                    TAB_VALUES.sensitivityAnalysisParamsTabValue
                                }
                                keepState
                            >
                                {studyUuid && (
                                    <SensitivityAnalysisParameters
                                        hideParameters={hideParameters}
                                        parametersBackend={
                                            sensitivityAnalysisParametersBackend
                                        }
                                    />
                                )}
                            </TabPanel>
                        )}
                        {shortCircuitAvailability ===
                            OptionalServicesStatus.Up &&
                            //To be removed when ShortCircuit is not in developer mode only.
                            enableDeveloperMode && (
                                <TabPanel
                                    value={tabValue}
                                    index={
                                        TAB_VALUES.shortCircuitParamsTabValue
                                    }
                                    keepState
                                >
                                    {studyUuid && (
                                        <ShortCircuitParameters
                                            hideParameters={hideParameters}
                                            useShortCircuitParameters={
                                                useShortCircuitParameters
                                            }
                                        />
                                    )}
                                </TabPanel>
                            )}
                        {dynamicSimulationAvailability ===
                            OptionalServicesStatus.Up &&
                            //To be removed when DynamicSimulation is not in developer mode only.
                            enableDeveloperMode && (
                                <TabPanel
                                    value={tabValue}
                                    index={
                                        TAB_VALUES.dynamicSimulationParamsTabValue
                                    }
                                >
                                    {studyUuid && (
                                        <DynamicSimulationParameters
                                            user={user}
                                            hideParameters={hideParameters}
                                        />
                                    )}
                                </TabPanel>
                            )}
                        {voltageInitAvailability ===
                            OptionalServicesStatus.Up &&
                            //To be removed when DynamicSimulation is not in developer mode only.
                            enableDeveloperMode && (
                                <TabPanel
                                    value={tabValue}
                                    index={TAB_VALUES.voltageInitParamsTabValue}
                                    keepState
                                >
                                    {studyUuid && (
                                        <VoltageInitParameters
                                            user={user}
                                            hideParameters={hideParameters}
                                            useVoltageInitParameters={
                                                useVoltageInitParameters
                                            }
                                        />
                                    )}
                                </TabPanel>
                            )}
                        <TabPanel
                            value={tabValue}
                            index={TAB_VALUES.advancedParamsTabValue}
                        >
                            <NetworkParameters
                                hideParameters={hideParameters}
                            />
                        </TabPanel>
                    </Grid>
                </Container>
            </DialogContent>
        </Dialog>
    );
};

export default Parameters;
