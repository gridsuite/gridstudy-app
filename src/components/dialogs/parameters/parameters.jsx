/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {
    useCallback,
    useEffect,
    useState,
    useRef,
    useMemo,
} from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import {
    Grid,
    Box,
    Button,
    Typography,
    Switch,
    Select,
    MenuItem,
} from '@mui/material';

import { useSnackMessage, useDebounce } from '@gridsuite/commons-ui';
import { OptionalServicesStatus } from 'components/utils/optional-services';
import { updateConfigParameter } from 'services/config';

export const CloseButton = ({ hideParameters, ...props }) => {
    return (
        <LabelledButton callback={hideParameters} label={'close'} {...props} />
    );
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
            <Grid item xs={8} sx={styles.parameterName}>
                <FormattedMessage id={label} />
            </Grid>
            <Grid item container xs={4} sx={styles.controlItem}>
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
        maxHeight: '85%',
        paddingRight: theme.spacing(2),
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(1),
        flexGrow: 1,
    }),
    singleItem: (theme) => ({
        display: 'flex',
        flex: 'auto',
        alignItems: 'center',
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
        alignItems: 'center',
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
            {(value === index || keepState) && (
                <Box sx={styles.panel}>{children}</Box>
            )}
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
    backendFetchSpecificParameters,
) => {
    const studyUuid = useSelector((state) => state.studyUuid);
    const { snackError } = useSnackMessage();

    const providersRef = useRef(INITIAL_PROVIDERS);
    const [provider, setProvider] = useState();

    const [fetching, setFetching] = useState(FETCHING_STATUS.NOT_STARTED);
    const [params, setParams] = useState(null);

    // since provider is updated seperately, we need to update the params with the new provider
    const currentParams = useMemo(() => {
        if (params && 'provider' in params && provider) {
            return { ...params, provider: provider };
        }
        return params;
    }, [params, provider]);

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
        [backendUpdateParameters, snackError, type],
    );

    const debouncedBackendUpdateParameters = useDebounce(
        backendUpdateParametersCb,
        1000,
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
        [type, backendUpdateProvider, studyUuid, snackError],
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
                let oldParams = { ...currentParams };
                setParams(newParams);
                debouncedBackendUpdateParameters(
                    studyUuid,
                    newParams,
                    oldParams,
                );
            }
        },
        [
            debouncedBackendUpdateParameters,
            backendUpdateParameters,
            currentParams,
            studyUuid,
        ],
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
        ],
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
        [paramGlobalState, snackError],
    );

    const debouncedBackendupdateConfigParameterCb = useDebounce(
        backendupdateConfigParameterCb,
        1000,
    );

    const handleChangeParamLocalState = useCallback(
        (value) => {
            setParamLocalState(value);
            debouncedBackendupdateConfigParameterCb(paramName, value);
        },
        [debouncedBackendupdateConfigParameterCb, paramName],
    );

    return [paramLocalState, handleChangeParamLocalState];
}
