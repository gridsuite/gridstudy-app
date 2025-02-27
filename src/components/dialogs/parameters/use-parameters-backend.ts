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
import { isComputationParametersUpdated } from './common/computation-parameters-util';
import { AppState } from 'redux/reducer';
import ComputingType from 'components/computing-status/computing-type';
import { UUID } from 'crypto';
import { User } from 'oidc-client';
import { ParametersInfos, SpecificParametersInfos, UseParametersBackendReturnProps } from './parameters.type';
import { formatComputingTypeLabel } from '../../computing-status/computing-type';
import { ILimitReductionsByVoltageLevel } from './common/limitreductions/columns-definitions';

const INITIAL_PROVIDERS = {};

export const useParametersBackend = <T extends ComputingType>(
    user: User | null,
    type: T,
    optionalServiceStatus: OptionalServicesStatus | undefined,
    backendFetchProviders: () => Promise<string[]>,
    backendFetchProvider: ((studyUuid: UUID) => Promise<string>) | null,
    backendFetchDefaultProvider: () => Promise<string>,
    backendUpdateProvider: ((studyUuid: UUID, newProvider: string) => Promise<void>) | null,
    backendFetchParameters: (studyUuid: UUID) => Promise<ParametersInfos<T>>,
    backendUpdateParameters?: (studyUuid: UUID, newParam: ParametersInfos<T> | null) => Promise<any>,
    backendFetchSpecificParametersDescription?: () => Promise<SpecificParametersInfos>,
    backendFetchDefaultLimitReductions?: () => Promise<ILimitReductionsByVoltageLevel[]>
): UseParametersBackendReturnProps<T> => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const studyUpdated = useSelector((state: AppState) => state.studyUpdated);

    const { snackError, snackWarning } = useSnackMessage();

    const providersRef = useRef<Record<string, string>>(INITIAL_PROVIDERS);
    const [provider, setProvider] = useState<string>();
    const providerRef = useRef(provider);
    providerRef.current = provider;

    const [params, setParams] = useState<ParametersInfos<T> | null>(null);
    const [specificParamsDescription, setSpecificParamsDescription] = useState<Record<string, any> | null>(null);
    const [defaultLimitReductions, setDefaultLimitReductions] = useState<ILimitReductionsByVoltageLevel[]>([]);

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
        (newProvider: string) => {
            if (!studyUuid) {
                return;
            }
            const oldProvider = providerRef.current;
            setProvider(newProvider); // local state
            backendUpdateProvider?.(studyUuid, newProvider).catch((error) => {
                setProvider(oldProvider);
                snackError({
                    messageTxt: error.message,
                    headerId: 'update' + formatComputingTypeLabel(type) + 'ProviderError',
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
                    headerId: 'fetchDefault' + formatComputingTypeLabel(type) + 'ProviderError',
                });
            });
    }, [backendFetchDefaultProvider, updateProvider, snackError, type]);

    // PROVIDER SYNC
    const fetchAvailableProviders = useCallback(() => {
        return backendFetchProviders()
            .then((providers) => {
                // we can consider the provider gotten from back will be also used as
                // a key for translation
                const providersObj = providers.reduce<Record<string, string>>((obj, v) => {
                    // TODO keep an array there is no reason for this reduce
                    obj[v] = v;
                    return obj;
                }, {});
                providersRef.current = providersObj;
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'fetch' + formatComputingTypeLabel(type) + 'ProvidersError',
                });
            });
    }, [backendFetchProviders, snackError, type]);

    const fetchProvider = useCallback(
        (studyUuid: UUID) => {
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
                        headerId: 'fetch' + formatComputingTypeLabel(type) + 'ProviderError',
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
        (studyUuid: UUID) => {
            backendFetchSpecificParametersDescription?.()
                .then((specificParams) => {
                    setSpecificParamsDescription(specificParams);
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'fetch' + formatComputingTypeLabel(type) + 'SpecificParametersError',
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

    // Default limit reductions
    const fetchDefaultLimitReductions = useCallback(() => {
        backendFetchDefaultLimitReductions?.()
            .then((defaultLimits: ILimitReductionsByVoltageLevel[]) => {
                setDefaultLimitReductions(defaultLimits);
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'fetchDefaultLimitReductionsError',
                });
            });
    }, [backendFetchDefaultLimitReductions, snackError]);

    // We just need to fetch default limit reductions once
    useEffect(() => {
        fetchDefaultLimitReductions();
    }, [fetchDefaultLimitReductions]);

    // PARAMETERS UPDATE
    const backendUpdateParametersCb = useCallback(
        (studyUuid: UUID, newParams: ParametersInfos<T>, oldParams: ParametersInfos<T> | null) => {
            backendUpdateParameters?.(studyUuid, newParams).catch((error) => {
                // Restore old local params and provider if update didn't work
                setParams(oldParams);
                if (oldParams && 'provider' in oldParams) {
                    setProvider(oldParams['provider']);
                } else {
                    setProvider(undefined);
                }
                snackError({
                    messageTxt: error.message,
                    headerId: 'update' + formatComputingTypeLabel(type) + 'ParametersError',
                });
            });
        },
        [backendUpdateParameters, snackError, type]
    );
    const debouncedBackendUpdateParameters = useDebounce(backendUpdateParametersCb, 1000);

    const updateParameter = useCallback(
        (newParams: ParametersInfos<T>) => {
            if (!studyUuid) {
                return;
            }
            const oldParams: ParametersInfos<T> | null = currentParams ? { ...currentParams } : null;
            // Set local states first to components rendering
            setParams(newParams);
            if (newParams && 'provider' in newParams) {
                setProvider(newParams['provider']);
            } else {
                setProvider(undefined);
            }
            // then send request to save it
            debouncedBackendUpdateParameters(studyUuid, newParams, oldParams);
        },
        [debouncedBackendUpdateParameters, currentParams, studyUuid]
    );

    // PARAMETERS RESET
    const resetParameters = useCallback(() => {
        if (!studyUuid || !backendUpdateParameters) {
            return;
        }
        return backendUpdateParameters(studyUuid, null)
            .then((response) => {
                if (response.status === 204) {
                    snackWarning({
                        headerId: 'reset' + formatComputingTypeLabel(type) + 'ParametersWarning',
                    });
                }
                // Parameters will be updated after an ComputationParametersUpdated notification
                // No need to set local params or provider states here
                // because a reset call with a button don't need an intermediate render like for forms
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'update' + formatComputingTypeLabel(type) + 'ParametersError',
                });
            });
    }, [studyUuid, type, backendUpdateParameters, snackError, snackWarning]);

    // PARAMETERS SYNC
    const fetchParameters = useCallback(
        (studyUuid: UUID) => {
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
                        headerId: 'fetch' + formatComputingTypeLabel(type) + 'ParametersError',
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
        defaultLimitReductions,
    ];
};
