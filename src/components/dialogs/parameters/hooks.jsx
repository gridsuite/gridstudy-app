/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useDebounce, useSnackMessage } from '@gridsuite/commons-ui';
import { OptionalServicesStatus } from 'components/utils/optional-services';
import { updateConfigParameter } from 'services/config';
import { isComputationParametersUpdated } from './common/computation-parameters-util';

const INITIAL_PROVIDERS = {};

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
    backendFetchSpecificParametersDescription
) => {
    const studyUuid = useSelector((state) => state.studyUuid);
    const studyUpdated = useSelector((state) => state.studyUpdated);

    const { snackError, snackWarning } = useSnackMessage();

    const providersRef = useRef(INITIAL_PROVIDERS);
    const [provider, setProvider] = useState();
    const providerRef = useRef(provider);
    providerRef.current = provider;

    const [params, setParams] = useState(null);
    const [specificParamsDescription, setSpecificParamsDescription] = useState(null);

    const optionalServiceStatusRef = useRef(optionalServiceStatus);
    optionalServiceStatusRef.current = optionalServiceStatus;

    // since provider is updated seperately sometimes we need to update the params with the new provider
    const currentParams = useMemo(() => {
        if (params && 'provider' in params && provider) {
            return { ...params, provider: provider };
        }
        return params;
    }, [params, provider]);

    // PROVIDER UPDATE
    const updateProvider = useCallback(
        (newProvider) => {
            const oldProvider = providerRef.current;
            setProvider(newProvider); // local state
            backendUpdateProvider(studyUuid, newProvider).catch((error) => {
                setProvider(oldProvider);
                snackError({
                    messageTxt: error.message,
                    headerId: 'update' + type + 'ProviderError',
                });
            });
        },
        [backendUpdateProvider, studyUuid, snackError, type]
    );

    // PROVIDER RESET
    const resetProvider = useCallback(() => {
        backendFetchDefaultProvider()
            .then((defaultProvider) => {
                const providerNames = Object.keys(providersRef.current);
                if (providerNames.length > 0) {
                    const newProvider = defaultProvider in providersRef.current ? defaultProvider : providerNames[0];
                    if (newProvider !== providerRef.current) {
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
    }, [backendFetchDefaultProvider, updateProvider, snackError, type]);

    // PROVIDER SYNC
    const fetchAvailableProviders = useCallback(() => {
        return backendFetchProviders()
            .then((providers) => {
                // we can consider the provider gotten from back will be also used as
                // a key for translation
                const providersObj = providers.reduce((obj, v) => {
                    // TODO keep an array there is no reason for this reduce
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
    }, [backendFetchProviders, snackError, type]);

    const fetchProvider = useCallback(
        (studyUuid) => {
            backendFetchProvider?.(studyUuid)
                .then((newProvider) => {
                    // if provider is not defined or not among allowed values, it's set to default value
                    if (newProvider in providersRef.current) {
                        setProvider(newProvider);
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
        },
        [backendFetchProvider, resetProvider, snackError, type]
    );

    // We need to fetch available providers when optionalServiceStatus changes
    // Then fetch saved provider for this study and set it
    // other dependencies don't change this much
    useEffect(() => {
        if (user !== null && studyUuid && optionalServiceStatus === OptionalServicesStatus.Up) {
            fetchAvailableProviders().then(() => fetchProvider(studyUuid));
        }
    }, [fetchAvailableProviders, fetchProvider, optionalServiceStatus, studyUuid, user]);

    // we need to fetch provider when ever a computationParametersUpdated notification received.
    // use optionalServiceStatusRef here to avoid double effects proc
    // other dependencies don't change this much
    useEffect(() => {
        if (
            isComputationParametersUpdated(type, studyUpdated) &&
            studyUuid &&
            optionalServiceStatusRef.current === OptionalServicesStatus.Up
        ) {
            fetchProvider(studyUuid);
        }
    }, [fetchProvider, studyUpdated, studyUuid, type]);

    // SPECIFIC PARAMETERS DESCRIPTION
    const fetchSpecificParametersDescription = useCallback(
        (studyUuid) => {
            backendFetchSpecificParametersDescription?.()
                .then((specificParams) => {
                    setSpecificParamsDescription(specificParams);
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'fetch' + type + 'SpecificParametersError',
                    });
                });
        },
        [backendFetchSpecificParametersDescription, snackError, type]
    );

    // We need to fetch specific parameters description when optionalServiceStatus changes
    // other dependencies don't change this much
    useEffect(() => {
        if (studyUuid && optionalServiceStatus === OptionalServicesStatus.Up) {
            fetchSpecificParametersDescription(studyUuid);
        }
    }, [optionalServiceStatus, studyUuid, fetchSpecificParametersDescription]);

    // PARAMETERS UPDATE
    const backendUpdateParametersCb = useCallback(
        (studyUuid, newParams, oldParams) => {
            backendUpdateParameters?.(studyUuid, newParams).catch((error) => {
                // Restore old local params and provider if update didn't work
                setParams(oldParams);
                setProvider(oldParams['provider']);
                snackError({
                    messageTxt: error.message,
                    headerId: 'update' + type + 'ParametersError',
                });
            });
        },
        [backendUpdateParameters, snackError, type]
    );
    const debouncedBackendUpdateParameters = useDebounce(backendUpdateParametersCb, 1000);

    const updateParameter = useCallback(
        (newParams) => {
            const oldParams = { ...currentParams };
            // Set local states first to components rendering
            setParams(newParams);
            setProvider(newParams['provider']);
            // then send request to save it
            debouncedBackendUpdateParameters(studyUuid, newParams, oldParams);
        },
        [debouncedBackendUpdateParameters, currentParams, studyUuid]
    );

    // PARAMETERS RESET
    const resetParameters = useCallback(
        (callBack) => {
            return backendUpdateParameters(studyUuid, null)
                .then((response) => {
                    if (response.status === 204) {
                        snackWarning({
                            headerId: 'reset' + type + 'ParametersWarning',
                        });
                    }
                    // Parameters will be updated after an ComputationParametersUpdated notification
                    // No need to set local params or provider states here
                    // because a reset call with a button don't need an intermediate render like for forms
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'update' + type + 'ParametersError',
                    });
                });
        },
        [studyUuid, type, backendUpdateParameters, snackError, snackWarning]
    );

    // PARAMETERS SYNC
    const fetchParameters = useCallback(
        (studyUuid) => {
            backendFetchParameters(studyUuid)
                .then((params) => {
                    setParams(params);
                    if ('provider' in params) {
                        setProvider(params.provider);
                    }
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'fetch' + type + 'ParametersError',
                    });
                });
        },
        [backendFetchParameters, type, snackError]
    );

    // We need to fetch parameters when optionalServiceStatus changes
    // other dependencies don't change this much
    useEffect(() => {
        if (studyUuid && optionalServiceStatus === OptionalServicesStatus.Up) {
            fetchParameters(studyUuid);
        }
    }, [optionalServiceStatus, studyUuid, fetchParameters]);

    // we need to fetch parameters when ever a computationParametersUpdated notification received.
    // use optionalServiceStatusRef here to avoid double effects proc
    // other dependencies don't change this much
    useEffect(() => {
        if (
            isComputationParametersUpdated(type, studyUpdated) &&
            studyUuid &&
            optionalServiceStatusRef.current === OptionalServicesStatus.Up
        ) {
            fetchParameters(studyUuid);
        }
    }, [fetchParameters, studyUuid, type, studyUpdated]);

    return [
        providersRef.current,
        provider,
        updateProvider,
        resetProvider,
        currentParams,
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

    const debouncedBackendupdateConfigParameterCb = useDebounce(backendupdateConfigParameterCb, 1000);

    const handleChangeParamLocalState = useCallback(
        (value) => {
            setParamLocalState(value);
            debouncedBackendupdateConfigParameterCb(paramName, value);
        },
        [debouncedBackendupdateConfigParameterCb, paramName]
    );

    return [paramLocalState, handleChangeParamLocalState];
}
