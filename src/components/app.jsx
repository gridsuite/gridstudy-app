/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    getOptionalServiceByServerName,
    OptionalServicesNames,
    OptionalServicesStatus,
} from './utils/optional-services';
import { Navigate, Route, Routes, useLocation, useMatch, useNavigate } from 'react-router-dom';
import {
    AuthenticationRouter,
    CardErrorBoundary,
    getPreLoginPath,
    initializeAuthenticationProd,
    useSnackMessage,
    useNotificationsListener,
} from '@gridsuite/commons-ui';
import PageNotFound from './page-not-found';
import { FormattedMessage } from 'react-intl';
import {
    APP_NAME,
    COMMON_APP_NAME,
    PARAM_DEVELOPER_MODE,
    PARAM_FAVORITE_CONTINGENCY_LISTS,
    PARAM_LANGUAGE,
    PARAM_THEME,
    PARAM_USE_NAME,
} from '../utils/config-params';
import { getComputedLanguage } from '../utils/language';
import AppTopBar from './app-top-bar';
import { StudyContainer } from './study-container';
import { fetchValidateUser } from '../services/user-admin';
import { fetchConfigParameter, fetchConfigParameters } from '../services/config';
import { fetchDefaultParametersValues, fetchIdpSettings } from '../services/utils';
import { getOptionalServices } from '../services/study/index';
import {
    attemptLeaveParametersTab,
    initTableDefinitions,
    selectComputedLanguage,
    selectEnableDeveloperMode,
    selectFavoriteContingencyLists,
    selectLanguage,
    selectTheme,
    selectUseName,
    setAppTabIndex,
    setOptionalServices,
    setParamsLoaded,
    setUpdateNetworkVisualizationParameters,
} from '../redux/actions';
import { NOTIFICATIONS_URL_KEYS } from './utils/notificationsProvider-utils';
import { getNetworkVisualizationParameters, getSpreadsheetConfigCollection } from '../services/study/study-config.ts';
import { StudyView } from './utils/utils';

const noUserManager = { instance: null, error: null };

const STUDY_VIEWS = [StudyView.MAP, StudyView.SPREADSHEET, StudyView.RESULTS, StudyView.LOGS, StudyView.PARAMETERS];

const App = () => {
    const { snackError } = useSnackMessage();

    const appTabIndex = useSelector((state) => state.appTabIndex);
    const user = useSelector((state) => state.user);
    const studyUuid = useSelector((state) => state.studyUuid);
    const signInCallbackError = useSelector((state) => state.signInCallbackError);
    const authenticationRouterError = useSelector((state) => state.authenticationRouterError);
    const showAuthenticationRouterLogin = useSelector((state) => state.showAuthenticationRouterLogin);

    const [userManager, setUserManager] = useState(noUserManager);

    const navigate = useNavigate();

    const dispatch = useDispatch();

    const location = useLocation();

    const updateNetworkVisualizationsParams = useCallback(
        (params) => {
            console.debug('received network visualizations parameters : ', params);
            dispatch(setUpdateNetworkVisualizationParameters(params));
        },
        [dispatch]
    );

    const updateParams = useCallback(
        (params) => {
            console.debug('received UI parameters : ', params);
            params.forEach((param) => {
                switch (param.name) {
                    case PARAM_THEME:
                        dispatch(selectTheme(param.value));
                        break;
                    case PARAM_LANGUAGE:
                        dispatch(selectLanguage(param.value));
                        dispatch(selectComputedLanguage(getComputedLanguage(param.value)));
                        break;
                    case PARAM_DEVELOPER_MODE:
                        dispatch(selectEnableDeveloperMode(param.value === 'true'));
                        break;
                    case PARAM_USE_NAME:
                        dispatch(selectUseName(param.value === 'true'));
                        break;
                    case PARAM_FAVORITE_CONTINGENCY_LISTS:
                        dispatch(selectFavoriteContingencyLists(param.value.split(',').filter((list) => list)));
                        break;
                    default:
                        console.error('unsupported UI parameters : ', param.name);
                }
            });
        },
        [dispatch]
    );

    const updateConfig = useCallback(
        (event) => {
            let eventData = JSON.parse(event.data);
            if (eventData.headers && eventData.headers['parameterName']) {
                fetchConfigParameter(eventData.headers['parameterName'])
                    .then((param) => {
                        updateParams([param]);
                    })
                    .catch((error) =>
                        snackError({
                            messageTxt: error.message,
                            headerId: 'paramsRetrievingError',
                        })
                    );
            }
        },
        [snackError, updateParams]
    );

    useNotificationsListener(NOTIFICATIONS_URL_KEYS.CONFIG, {
        listenerCallbackMessage: updateConfig,
    });

    // Can't use lazy initializer because useRouteMatch is a hook
    const [initialMatchSilentRenewCallbackUrl] = useState(
        useMatch({
            path: '/silent-renew-callback',
        })
    );

    const [initialMatchSigninCallbackUrl] = useState(
        useMatch({
            path: '/sign-in-callback',
        })
    );

    const isStudyPane =
        useMatch({
            path: '/studies/:studyUuid',
        }) !== null;

    useEffect(() => {
        document.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    });

    useEffect(() => {
        // need subfunction when async as suggested by rule react-hooks/exhaustive-deps
        (async function initializeAuthentication() {
            try {
                setUserManager({
                    instance: await initializeAuthenticationProd(
                        dispatch,
                        initialMatchSilentRenewCallbackUrl != null,
                        fetchIdpSettings,
                        fetchValidateUser,
                        initialMatchSigninCallbackUrl != null
                    ),
                    error: null,
                });
            } catch (error) {
                setUserManager({ instance: null, error: error.message });
            }
        })();
        // Note: initialMatchSilentRenewCallbackUrl and dispatch don't change
    }, [initialMatchSilentRenewCallbackUrl, dispatch, initialMatchSigninCallbackUrl]);

    useEffect(() => {
        if (user !== null && studyUuid !== null) {
            const fetchNetworkVisualizationParametersPromise = getNetworkVisualizationParameters(studyUuid).then(
                (params) => updateNetworkVisualizationsParams(params)
            );

            const fetchCommonConfigPromise = fetchConfigParameters(COMMON_APP_NAME).then((params) =>
                updateParams(params)
            );

            const fetchAppConfigPromise = fetchConfigParameters(APP_NAME).then((params) => {
                fetchDefaultParametersValues().then((defaultValues) => {
                    // Browsing defaultParametersValues entries
                    Object.entries(defaultValues).forEach(([key, defaultValue]) => {
                        // Checking if keys defined in defaultParametersValues file are already defined in config server
                        // If they are not defined, values are taken from default values file
                        if (!params.find((param) => param.name === key)) {
                            params.push({
                                name: key,
                                value: defaultValue,
                            });
                        }
                    });
                    updateParams(params);
                });
            });

            const mapColumns = (columns) => {
                return columns.map((column) => {
                    return {
                        ...column,
                        dependencies: column.dependencies?.length ? JSON.parse(column.dependencies) : undefined,
                    };
                });
            };

            const fetchSpreadsheetConfigPromise = getSpreadsheetConfigCollection(studyUuid).then((config) => {
                const tableDefinitions = config.spreadsheetConfigs.map((spreadsheetConfig, index) => {
                    return {
                        uuid: spreadsheetConfig.id,
                        index: index,
                        name: spreadsheetConfig.name,
                        columns: mapColumns(spreadsheetConfig.columns),
                        type: spreadsheetConfig.sheetType,
                    };
                });
                dispatch(initTableDefinitions(config.id, tableDefinitions));
            });

            const fetchOptionalServices = getOptionalServices()
                .then((services) => {
                    const retrieveOptionalServices = services.map((service) => {
                        return {
                            ...service,
                            name: getOptionalServiceByServerName(service.name),
                        };
                    });
                    // get all potentially optional services
                    const optionalServicesNames = Object.keys(OptionalServicesNames);

                    // if one of those services was not returned by "getOptionalServices", it means it was defined as "not optional"
                    // in that case, we consider it is UP
                    optionalServicesNames
                        .filter(
                            (serviceName) =>
                                !retrieveOptionalServices.map((service) => service.name).includes(serviceName)
                        )
                        .forEach((serviceName) =>
                            retrieveOptionalServices.push({
                                name: serviceName,
                                status: OptionalServicesStatus.Up,
                            })
                        );
                    dispatch(setOptionalServices(retrieveOptionalServices));
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'optionalServicesRetrievingError',
                    });
                });

            // Dispatch globally when all params are loaded to allow easy waiting.
            // This might not be necessary but allows to gradually migrate parts
            // of the code that don't subscribe to exactly the parameters they need.
            // Code that depends on this could be rewritten to depend on what it acually needs.
            Promise.all([
                fetchNetworkVisualizationParametersPromise,
                fetchCommonConfigPromise,
                fetchAppConfigPromise,
                fetchOptionalServices,
                fetchSpreadsheetConfigPromise,
            ])
                .then(() => {
                    dispatch(setParamsLoaded());
                })
                .catch((error) =>
                    snackError({
                        messageTxt: error.message,
                        headerId: 'paramsRetrievingError',
                    })
                );
        }
    }, [user, studyUuid, dispatch, updateParams, snackError, updateNetworkVisualizationsParams]);

    const onChangeTab = useCallback(
        (newTabIndex) => {
            const parametersTabIndex = STUDY_VIEWS.indexOf(StudyView.PARAMETERS);

            //check if we are leaving the parameters tab
            if (appTabIndex === parametersTabIndex && newTabIndex !== parametersTabIndex) {
                dispatch(attemptLeaveParametersTab(newTabIndex));
            } else {
                dispatch(setAppTabIndex(newTabIndex));
            }
        },
        [dispatch, appTabIndex]
    );

    return (
        <div
            className="singlestretch-child"
            style={{
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <AppTopBar user={user} onChangeTab={onChangeTab} userManager={userManager} />
            <CardErrorBoundary>
                <div
                    className="singlestretch-parent"
                    style={{
                        flexGrow: 1,
                        //Study pane needs 'hidden' when displaying a
                        //fullscreen sld or when displaying the results or
                        //elements tables for certain screen sizes because
                        //width/heights are computed programmaticaly and
                        //resizing the page trigger render loops due to
                        //appearing and disappearing scrollbars.
                        //For all other cases, auto is better because it will
                        //be easier to see that we have a layout problem when
                        //scrollbars appear when they should not.
                        overflow: isStudyPane ? 'hidden' : 'auto',
                    }}
                >
                    {user !== null ? (
                        <Routes>
                            <Route
                                path="/studies/:studyUuid"
                                element={<StudyContainer view={STUDY_VIEWS[appTabIndex]} onChangeTab={onChangeTab} />}
                            />
                            <Route
                                path="/sign-in-callback"
                                element={<Navigate replace to={getPreLoginPath() || '/'} />}
                            />
                            <Route
                                path="/logout-callback"
                                element={<h1>Error: logout failed; you are still logged in.</h1>}
                            />
                            <Route
                                path="*"
                                element={<PageNotFound message={<FormattedMessage id="PageNotFound" />} />}
                            />
                        </Routes>
                    ) : (
                        <AuthenticationRouter
                            userManager={userManager}
                            signInCallbackError={signInCallbackError}
                            authenticationRouterError={authenticationRouterError}
                            showAuthenticationRouterLogin={showAuthenticationRouterLogin}
                            dispatch={dispatch}
                            navigate={navigate}
                            location={location}
                        />
                    )}
                </div>
            </CardErrorBoundary>
        </div>
    );
};

export default App;
