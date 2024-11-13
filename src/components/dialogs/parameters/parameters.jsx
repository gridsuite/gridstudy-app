/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { Grid, Box, Button, Typography, Switch, Select, MenuItem } from '@mui/material';

import { useSnackMessage, useDebounce } from '@gridsuite/commons-ui';
import { OptionalServicesStatus } from 'components/utils/optional-services';
import { updateConfigParameter } from 'services/config';
import { isComputationParametersUpdated } from './common/computation-parameters-util';

export const CloseButton = ({ hideParameters, ...props }) => {
    return <LabelledButton callback={hideParameters} label={'close'} {...props} />;
};

export const LabelledButton = ({ callback, label, ...props }) => {
    return (
        <Button onClick={callback} {...props}>
            <FormattedMessage id={label} />
        </Button>
    );
};

export const SwitchWithLabel = ({ value, label, callback }) => {
    return (
        <>
            <Grid item xs={8} sx={styles.parameterName}>
                <FormattedMessage id={label} />
            </Grid>
            <Grid item container xs={4} sx={styles.controlItem}>
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
    return (
        <>
            <Grid item xs={5} sx={styles.parameterName}>
                <FormattedMessage id={label} />
            </Grid>
            <Grid item container xs={4} sx={styles.controlItem}>
                <Select labelId={label} value={value} onChange={callback} size="small">
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

export const styles = {
    title: (theme) => ({
        padding: theme.spacing(2),
    }),
    minWidthMedium: (theme) => ({
        minWidth: theme.spacing(20),
    }),
    parameterName: (theme) => ({
        fontWeight: 'bold',
        marginTop: theme.spacing(1),
    }),
    controlItem: {
        justifyContent: 'flex-end',
        flexGrow: 1,
    },
    controlParametersItem: {
        justifyContent: 'flex-start',
        flexGrow: 1,
        height: 'fit-content',
        paddingBottom: 4,
    },
    button: (theme) => ({
        marginBottom: theme.spacing(2),
        marginLeft: theme.spacing(1),
    }),
    subgroupParameters: (theme) => ({
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1),
    }),
    subgroupParametersAccordion: {
        '&:before': {
            display: 'none',
        },
        background: 'none',
    },
    subgroupParametersAccordionSummary: (theme) => ({
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
    }),
    subgroupParametersAccordionDetails: (theme) => ({
        padding: theme.spacing(0),
    }),
    marginTopButton: {
        marginTop: '10px',
        position: 'sticky',
        bottom: 0,
    },
    scrollableGrid: (theme) => ({
        overflowY: 'auto',
        overflowX: 'hidden',
        maxHeight: '85%', // TODO This needs to be refactored
        paddingRight: theme.spacing(2),
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(1),
        flexGrow: 1,
    }),
    singleItem: (theme) => ({
        display: 'flex',
        flex: 'auto',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    }),
    firstTextField: (theme) => ({
        marginLeft: theme.spacing(3),
    }),
    secondTextField: (theme) => ({
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(2),
    }),
    singleTextField: (theme) => ({
        display: 'flex',
        marginRight: theme.spacing(2),
        marginLeft: theme.spacing(1),
    }),
    tooltip: (theme) => ({
        marginLeft: theme.spacing(1),
    }),
    text: (theme) => ({
        display: 'flex',
        marginBottom: theme.spacing(1),
        marginTop: theme.spacing(1),
    }),
    multipleItems: (theme) => ({
        display: 'flex',
        flex: 'auto',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    }),
    tabWithError: (theme) => ({
        '&.Mui-selected': { color: theme.palette.error.main },
        color: theme.palette.error.main,
    }),
    tabWithErrorIndicator: (theme) => ({
        backgroundColor: theme.palette.error.main,
    }),
    panel: (theme) => ({
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1),
    }),
    adjustExistingLimitsInfo: (theme) => ({
        display: 'flex',
        alignItems: 'center',
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    }),
    circularProgress: (theme) => ({
        marginRight: theme.spacing(2),
        color: theme.palette.primary.contrastText,
    }),
    icon: (theme) => ({
        width: theme.spacing(3),
    }),
    modificationsTitle: (theme) => ({
        display: 'flex',
        alignItems: 'center',
        margin: theme.spacing(0),
        padding: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        overflow: 'hidden',
    }),
};

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
            {(value === index || keepState) && <Box sx={styles.panel}>{children}</Box>}
        </Typography>
    );
};

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
