/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useDebounce, useSnackMessage } from '@gridsuite/commons-ui';
import { OptionalServicesStatus } from 'components/utils/optional-services';
import { UUID } from 'crypto';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { ReduxState } from 'redux/reducer.type';

const INITIAL_PROVIDERS = {};

const FETCHING_STATUS = {
    NOT_STARTED: 'not_started',
    FETCHING: 'fetching',
    FINISHED: 'finished',
};

export enum ComputationParameterType {
    LoadFlow = 'LoadFlow',
    SecurityAnalysis = 'SecurityAnalysis',
    SensitivityAnalysis = 'SensitivityAnalysis',
    NonEvacuatedEnergy = 'NonEvacuatedEnergy',
    DynamicSimulation = 'DynamicSimulation',
}

export type UseParametersBackendReturnProps = [
    currentParams: Record<string, string>,
    provider: string | undefined,
    updateProvider: (newProvider: string) => void,
    resetProvider: () => void,
    currentParams: Record<string, any>,
    updateParameter: (newParams: Record<string, any>) => void,
    resetParameters: (callBack?: () => void) => Promise<void>,
    specificParamsDescription: Record<string, any> | null
];

type UseParametersBackendProps = (
    type: ComputationParameterType,
    optionalServiceStatus: OptionalServicesStatus | undefined,
    backendFetchProviders: () => Promise<string[]>,
    backendFetchProvider: ((studyUuid: UUID) => Promise<string>) | null,
    backendFetchDefaultProvider: () => Promise<string>,
    backendUpdateProvider: (
        studyUuid: UUID,
        newProvider: string
    ) => Promise<void>,
    backendFetchParameters: (studyUuid: UUID) => Promise<any>,
    backendUpdateParameters?: (
        studyUuid: UUID,
        newProvider: string | null
    ) => Promise<any>,
    backendFetchSpecificParameters?: () => Promise<any>
) => UseParametersBackendReturnProps;

export const useParametersBackend: UseParametersBackendProps = (
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
    const user = useSelector((state: ReduxState) => state.user);
    const studyUuid = useSelector((state: ReduxState) => state.studyUuid);
    const { snackError, snackWarning } = useSnackMessage();

    const providersRef = useRef<Record<string, string>>(INITIAL_PROVIDERS);
    const [provider, setProvider] = useState<string>();

    const [fetching, setFetching] = useState(FETCHING_STATUS.NOT_STARTED);
    const [params, setParams] = useState<Record<string, any>>({});

    // since provider is updated seperately, we need to update the params with the new provider
    const currentParams = useMemo(() => {
        if (params && 'provider' in params && provider) {
            return { ...params, provider: provider };
        }
        return params;
    }, [params, provider]);

    const [specificParamsDescription, setSpecificParamsDescription] =
        useState<Record<string, any> | null>(null);

    const backendUpdateParametersCb = useCallback(
        (studyUuid: UUID, newParams: any, oldParams: any) => {
            backendUpdateParameters(studyUuid, newParams).catch(
                (error: any) => {
                    setParams(oldParams);
                    snackError({
                        messageTxt: error.message,
                        headerId: 'update' + type + 'ParametersError',
                    });
                }
            );
        },
        [backendUpdateParameters, snackError, type]
    );

    const debouncedBackendUpdateParameters = useDebounce(
        backendUpdateParametersCb,
        1000
    );

    const updateProvider = useCallback(
        (newProvider: string) => {
            backendUpdateProvider(studyUuid, newProvider)
                .then(() => {
                    setProvider(newProvider);
                })
                .catch((error: any) => {
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
            .then((defaultProvider: string) => {
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
            .catch((error: any) => {
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
        (newParams: Record<string, any>) => {
            if (debouncedBackendUpdateParameters) {
                let oldParams = { ...currentParams };
                setParams(newParams);
                setProvider(newParams['provider']);
                debouncedBackendUpdateParameters(
                    studyUuid,
                    newParams,
                    oldParams
                );
            }
        },
        [debouncedBackendUpdateParameters, currentParams, studyUuid]
    );

    const resetParameters = useCallback(
        (callBack: () => void) => {
            return backendUpdateParameters(studyUuid, null)
                .then((response) => {
                    if (response.status === 204) {
                        snackWarning({
                            headerId: 'reset' + type + 'ParametersWarning',
                        });
                    }
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
            snackWarning,
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
                    const providersObj = providers.reduce(function (
                        obj: Record<string, string>,
                        v
                    ) {
                        obj[v] = v;
                        return obj;
                    },
                    {});
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
            if (
                fetching === FETCHING_STATUS.FINISHED &&
                !provider &&
                backendFetchProvider
            ) {
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
        currentParams,
        updateParameter,
        resetParameters,
        specificParamsDescription,
    ];
};
