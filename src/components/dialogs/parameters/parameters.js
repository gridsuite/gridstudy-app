/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';
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

import {
    fetchDefaultSecurityAnalysisProvider,
    fetchDefaultSensitivityAnalysisProvider,
    fetchSecurityAnalysisProvider,
    fetchSensitivityAnalysisProvider,
    fetchSecurityAnalysisProviders,
    fetchSensitivityAnalysisProviders,
    updateConfigParameter,
    updateSecurityAnalysisProvider,
    updateSensitivityAnalysisProvider,
    getLoadFlowParameters,
    getLoadFlowProviders,
    getLoadFlowProvider,
    getDefaultLoadFlowProvider,
    setLoadFlowProvider,
} from '../../../utils/rest-api';

import { useSnackMessage } from '@gridsuite/commons-ui';

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
import { PARAM_DEVELOPER_MODE } from '../../../utils/config-params';
import { SecurityAnalysisParameters } from './security-analysis-parameters';
import { SensitivityAnalysisParameters } from './sensitivity-analysis-parameters';

export const CloseButton = ({ hideParameters, classeStyleName }) => {
    return (
        <Button onClick={hideParameters} className={classeStyleName}>
            <FormattedMessage id="close" />
        </Button>
    );
};

export const SwitchWithLabel = ({ value, label, callback }) => {
    const classes = useStyles();
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
                    value={value}
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
};

export const useStyles = makeStyles((theme) => ({
    title: {
        padding: theme.spacing(2),
    },
    grid: {
        paddingTop: theme.spacing(2),
        padding: theme.spacing(0),
        flexGrow: 1,
    },
    minWidthMedium: {
        minWidth: theme.spacing(20),
    },
    controlItem: {
        justifyContent: 'flex-end',
    },
    button: {
        marginBottom: theme.spacing(2),
        marginLeft: theme.spacing(1),
    },
    advancedParameterButton: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(1),
    },
    marginTopButton: {
        marginTop: 10,
    },
}));

export const FluxConventions = {
    IIDM: 'iidm',
    TARGET: 'target',
};
export const LabelledButton = ({ callback, label, name }) => {
    return (
        <Button onClick={callback} className={name}>
            <FormattedMessage id={label} />
        </Button>
    );
};

export const useParametersBackend = (
    user,
    type,
    backendFetchProviders,
    backendFetchProvider,
    backendFetchDefaultProvider,
    backendUpdateProvider,
    backendFetchParameters
) => {
    const studyUuid = useSelector((state) => state.studyUuid);

    const { snackError } = useSnackMessage();

    const [providers, setProviders] = useState([]);

    const [provider, setProvider] = useState(null);

    const [params, setParams] = useState(null);

    useEffect(() => {
        if (user !== null) {
            backendFetchProviders()
                .then((providers) => {
                    // we can consider the provider get from back will be also used as
                    // a key for translation
                    const providersObj = providers.reduce(function (obj, v, i) {
                        obj[v] = v;
                        return obj;
                    }, {});
                    setProviders(providersObj);
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'fetch' + type + 'ProvidersError',
                    });
                });
        }
    }, [user, backendFetchProviders, type, snackError]);

    const updateProvider = useCallback(
        (newProvider) => {
            backendUpdateProvider(studyUuid, newProvider)
                .then(() => setProvider(newProvider))
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
                const providerNames = Object.keys(providers);
                if (providerNames.length > 0) {
                    const newProvider =
                        defaultProvider in providers
                            ? defaultProvider
                            : providerNames[0];
                    updateProvider(newProvider);
                }
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'fetchDefault' + type + 'ProviderError',
                });
            });
    }, [
        type,
        backendFetchDefaultProvider,
        providers,
        updateProvider,
        snackError,
    ]);

    useEffect(() => {
        if (studyUuid) {
            if (backendFetchParameters) {
                backendFetchParameters(studyUuid)
                    .then((params) => setParams(params))
                    .catch((error) => {
                        snackError({
                            messageTxt: error.message,
                            headerId: 'paramsRetrievingError',
                        });
                    });
            }
            backendFetchProvider(studyUuid)
                .then((provider) => {
                    // if provider is not defined or not among allowed values, it's set to default value
                    if (provider in providers) {
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
    }, [
        type,
        backendFetchParameters,
        backendFetchProvider,
        studyUuid,
        snackError,
        resetProvider,
        setParams,
    ]);

    return [
        providers,
        provider,
        updateProvider,
        resetProvider,
        params,
        setParams,
    ];
};

export function useParameterState(paramName) {
    const { snackError } = useSnackMessage();

    const paramGlobalState = useSelector((state) => state[paramName]);

    const [paramLocalState, setParamLocalState] = useState(paramGlobalState);

    useEffect(() => {
        setParamLocalState(paramGlobalState);
    }, [paramGlobalState]);

    const handleChangeParamLocalState = useCallback(
        (value) => {
            setParamLocalState(value);
            updateConfigParameter(paramName, value).catch((error) => {
                setParamLocalState(paramGlobalState);
                snackError({
                    messageTxt: error.message,
                    headerId: 'paramsChangingError',
                });
            });
        },
        [paramName, setParamLocalState, paramGlobalState, snackError]
    );

    return [paramLocalState, handleChangeParamLocalState];
}

const sldParamsTabIndex = 0;
const mapParamsTabIndex = 1;
const lfParamsTabIndex = 2;
const securityAnalysisParamsTabIndex = 3;
const sensitivityAnalysisParamsTabIndex = 4;
const shortCircuitParamsTabIndex = 5;
const advancedParamsTabIndex = 6;

const Parameters = ({ user, isParametersOpen, hideParameters }) => {
    const classes = useStyles();

    const [tabIndex, setTabIndex] = useState(0);

    const studyUuid = useSelector((state) => state.studyUuid);

    const loadFlowParametersBackend = useParametersBackend(
        user,
        'LoadFlow',
        getLoadFlowProviders,
        getLoadFlowProvider,
        getDefaultLoadFlowProvider,
        setLoadFlowProvider,
        getLoadFlowParameters
    );

    const securityAnalysisParametersBackend = useParametersBackend(
        user,
        'SecurityAnalysis',
        fetchSecurityAnalysisProviders,
        fetchSecurityAnalysisProvider,
        fetchDefaultSecurityAnalysisProvider,
        updateSecurityAnalysisProvider
    );

    const sensitivityAnalysisParametersBackend = useParametersBackend(
        user,
        'SensitivityAnalysis',
        fetchSensitivityAnalysisProviders,
        fetchSensitivityAnalysisProvider,
        fetchDefaultSensitivityAnalysisProvider,
        updateSensitivityAnalysisProvider
    );

    const useShortCircuitParameters = useGetShortCircuitParameters();

    const componentLibraries = useGetAvailableComponentLibraries(user);

    const [showAdvancedLfParams, setShowAdvancedLfParams] = useState(false);

    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

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
                {value === index && <Box p={1}>{children}</Box>}
            </Typography>
        );
    }

    //To be removed when ShortCircuit is not in developer mode only.
    useEffect(() => {
        setTabIndex(
            enableDeveloperMode
                ? advancedParamsTabIndex
                : advancedParamsTabIndex - 1
        );
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
                        <Tab
                            disabled={!studyUuid}
                            label={<FormattedMessage id="SecurityAnalysis" />}
                        />
                        <Tab
                            disabled={!studyUuid}
                            label={
                                <FormattedMessage id="SensitivityAnalysis" />
                            }
                        />
                        {enableDeveloperMode && (
                            <Tab
                                disabled={!studyUuid}
                                label={<FormattedMessage id="ShortCircuit" />}
                            />
                        )}
                        <Tab label={<FormattedMessage id="Advanced" />} />
                    </Tabs>

                    <TabPanel value={tabIndex} index={sldParamsTabIndex}>
                        <SingleLineDiagramParameters
                            hideParameters={hideParameters}
                            componentLibraries={componentLibraries}
                        />
                    </TabPanel>
                    <TabPanel value={tabIndex} index={mapParamsTabIndex}>
                        <MapParameters hideParameters={hideParameters} />
                    </TabPanel>
                    <TabPanel value={tabIndex} index={lfParamsTabIndex}>
                        {studyUuid && (
                            <LoadFlowParameters
                                hideParameters={hideParameters}
                                parametersBackend={loadFlowParametersBackend}
                                showAdvancedLfParams={showAdvancedLfParams}
                                setShowAdvancedLfParams={
                                    setShowAdvancedLfParams
                                }
                            />
                        )}
                    </TabPanel>
                    <TabPanel
                        value={tabIndex}
                        index={securityAnalysisParamsTabIndex}
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
                    <TabPanel
                        value={tabIndex}
                        index={sensitivityAnalysisParamsTabIndex}
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
                    {
                        //To be removed when ShortCircuit is not in developer mode only.
                        enableDeveloperMode && (
                            <TabPanel
                                value={tabIndex}
                                index={shortCircuitParamsTabIndex}
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
                        )
                    }
                    <TabPanel
                        value={tabIndex}
                        //Ternary to be removed when ShortCircuit is not in developer mode only.
                        index={
                            enableDeveloperMode
                                ? advancedParamsTabIndex
                                : advancedParamsTabIndex - 1
                        }
                    >
                        <NetworkParameters hideParameters={hideParameters} />
                    </TabPanel>
                </Container>
            </DialogContent>
        </Dialog>
    );
};

export default Parameters;
