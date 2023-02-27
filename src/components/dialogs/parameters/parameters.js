/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import {
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    Tab,
    Tabs,
    Typography,
} from '@mui/material';

import {
    fetchDefaultDynamicSimulationProvider,
    fetchDefaultSecurityAnalysisProvider,
    fetchDefaultSensitivityAnalysisProvider,
    fetchDynamicSimulationParameters,
    fetchDynamicSimulationProvider,
    fetchDynamicSimulationProviders,
    fetchSecurityAnalysisProvider,
    fetchSecurityAnalysisProviders,
    fetchSensitivityAnalysisProvider,
    fetchSensitivityAnalysisProviders,
    getDefaultLoadFlowProvider,
    getLoadFlowParameters,
    getLoadFlowProvider,
    getLoadFlowProviders,
    setLoadFlowParameters,
    setLoadFlowProvider,
    updateConfigParameter,
    updateDynamicSimulationParameters,
    updateDynamicSimulationProvider,
    updateSecurityAnalysisProvider,
    updateSensitivityAnalysisProvider,
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
import { SecurityAnalysisParameters } from './security-analysis-parameters';
import { SensitivityAnalysisParameters } from './sensitivity-analysis-parameters';
import DynamicSimulationParameters from './dynamicsimulation/dynamic-simulation-parameters';
import { PARAM_DEVELOPER_MODE } from '../../../utils/config-params';
import TabPanel from './common/tab-panel';
import { useStyles } from './parameters-styles';

export const FluxConventions = {
    IIDM: 'iidm',
    TARGET: 'target',
};

const INITIAL_PROVIDERS = {};

export const useParametersBackend = (
    user,
    type,
    backendFetchProviders,
    backendFetchProvider,
    backendFetchDefaultProvider,
    backendUpdateProvider,
    backendFetchParameters,
    backendUpdateParameters
) => {
    const studyUuid = useSelector((state) => state.studyUuid);

    const { snackError } = useSnackMessage();

    const [providers, setProviders] = useState(INITIAL_PROVIDERS);

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

    const updateParameter = useCallback(
        (newParams) => {
            if (backendUpdateParameters) {
                let oldParams = { ...params };
                setParams(newParams);
                backendUpdateParameters(studyUuid, newParams).catch((error) => {
                    setParams(oldParams);
                    snackError({
                        messageTxt: error.message,
                        headerId: 'update' + type + 'ParametersError',
                    });
                });
            }
        },
        [
            type,
            backendUpdateParameters,
            params,
            snackError,
            studyUuid,
            setParams,
        ]
    );

    const resetParameters = useCallback(() => {
        backendUpdateParameters(studyUuid, null)
            .then(() => {
                return backendFetchParameters(studyUuid)
                    .then((params) => setParams(params))
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
    }, [
        studyUuid,
        type,
        backendUpdateParameters,
        backendFetchParameters,
        snackError,
        setParams,
    ]);

    useEffect(() => {
        if (studyUuid) {
            if (backendFetchParameters) {
                backendFetchParameters(studyUuid)
                    .then((params) => setParams(params))
                    .catch((error) => {
                        snackError({
                            messageTxt: error.message,
                            headerId: 'fetch' + type + 'ParametersError',
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
        providers,
        resetProvider,
        setParams,
    ]);

    return [
        providers,
        provider,
        updateProvider,
        resetProvider,
        params,
        updateParameter,
        resetParameters,
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

const TAB_VALUES = {
    sldParamsTabValue: 'SingleLineDiagram',
    mapParamsTabValue: 'Map',
    lfParamsTabValue: 'LoadFlow',
    securityAnalysisParamsTabValue: 'SecurityAnalysis',
    sensitivityAnalysisParamsTabValue: 'SensitivityAnalysis',
    shortCircuitParamsTabValue: 'ShortCircuit',
    dynamicSimulationParamsTabValue: 'DynamicSimulation',
    advancedParamsTabValue: 'Advanced',
};

const Parameters = ({ user, isParametersOpen, hideParameters }) => {
    const classes = useStyles();

    const [tabValue, setTabValue] = useState(TAB_VALUES.sldParamsTabValue);

    const studyUuid = useSelector((state) => state.studyUuid);

    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    const loadFlowParametersBackend = useParametersBackend(
        user,
        'LoadFlow',
        getLoadFlowProviders,
        getLoadFlowProvider,
        getDefaultLoadFlowProvider,
        setLoadFlowProvider,
        getLoadFlowParameters,
        setLoadFlowParameters
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

    const dynamicSimulationParametersBackend = useParametersBackend(
        user,
        'DynamicSimulation',
        fetchDynamicSimulationProviders,
        fetchDynamicSimulationProvider,
        fetchDefaultDynamicSimulationProvider,
        updateDynamicSimulationProvider,
        fetchDynamicSimulationParameters,
        updateDynamicSimulationParameters
    );

    const componentLibraries = useGetAvailableComponentLibraries(user);

    const [showAdvancedLfParams, setShowAdvancedLfParams] = useState(false);

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
            <DialogContent>
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
                        <Tab
                            disabled={!studyUuid}
                            label={<FormattedMessage id="SecurityAnalysis" />}
                            value={TAB_VALUES.securityAnalysisParamsTabValue}
                        />
                        {enableDeveloperMode && (
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
                        {enableDeveloperMode && (
                            <Tab
                                disabled={!studyUuid}
                                label={<FormattedMessage id="ShortCircuit" />}
                                value={TAB_VALUES.shortCircuitParamsTabValue}
                            />
                        )}
                        {enableDeveloperMode && (
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
                        <Tab
                            label={<FormattedMessage id="Advanced" />}
                            value={TAB_VALUES.advancedParamsTabValue}
                        />
                    </Tabs>

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
                    >
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
                        value={tabValue}
                        index={TAB_VALUES.securityAnalysisParamsTabValue}
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
                    {
                        //To be removed when Sensitivity Analysis is not in developer mode only.
                        enableDeveloperMode && (
                            <TabPanel
                                value={tabValue}
                                index={
                                    TAB_VALUES.sensitivityAnalysisParamsTabValue
                                }
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
                        )
                    }
                    {
                        //To be removed when ShortCircuit is not in developer mode only.
                        enableDeveloperMode && (
                            <TabPanel
                                value={tabValue}
                                index={TAB_VALUES.shortCircuitParamsTabValue}
                            >
                                {studyUuid && (
                                    <ShortCircuitParameters
                                        hideParameters={hideParameters}
                                        parametersBackend={
                                            useShortCircuitParameters
                                        }
                                    />
                                )}
                            </TabPanel>
                        )
                    }
                    {
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
                                        hideParameters={hideParameters}
                                        parametersBackend={
                                            dynamicSimulationParametersBackend
                                        }
                                    />
                                )}
                            </TabPanel>
                        )
                    }
                    <TabPanel
                        value={tabValue}
                        index={TAB_VALUES.advancedParamsTabValue}
                    >
                        <NetworkParameters hideParameters={hideParameters} />
                    </TabPanel>
                </Container>
            </DialogContent>
        </Dialog>
    );
};

export default Parameters;
