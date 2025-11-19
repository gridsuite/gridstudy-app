/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { retrieveOptionalServices } from './utils/optional-services';
import { Navigate, Route, Routes, useLocation, useMatch, useNavigate } from 'react-router';
import {
    AnnouncementNotification,
    AuthenticationRouter,
    CardErrorBoundary,
    COMMON_APP_NAME,
    fetchConfigParameter,
    fetchConfigParameters,
    getComputedLanguage,
    getPreLoginPath,
    initializeAuthenticationProd,
    LAST_SELECTED_DIRECTORY,
    NotificationsUrlKeys,
    useNotificationsListener,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import PageNotFound from './page-not-found';
import { FormattedMessage } from 'react-intl';
import {
    APP_NAME,
    PARAM_DEVELOPER_MODE,
    PARAM_FAVORITE_CONTINGENCY_LISTS,
    PARAM_LANGUAGE,
    PARAM_THEME,
    PARAM_USE_NAME,
} from '../utils/config-params';
import AppTopBar from './app-top-bar';
import { StudyContainer } from './study-container';
import { fetchDefaultParametersValues, fetchIdpSettings } from '../services/utils';
import { getOptionalServices } from '../services/study/index';
import {
    addFilterForNewSpreadsheet,
    attemptLeaveParametersTab,
    initComputationResultFilters,
    initTableDefinitions,
    renameTableDefinition,
    saveSpreadsheetGlobalFilters,
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
    updateTableColumns,
} from '../redux/actions';
import {
    getComputationResultFilters,
    getNetworkVisualizationParameters,
    getSpreadsheetConfigCollection,
} from '../services/study/study-config';
import { STUDY_VIEWS, StudyView } from './utils/utils';
import { isNetworkVisualizationParametersUpdatedNotification, NotificationType } from 'types/notification-types';
import {
    getSpreadsheetConfigCollection as getSpreadsheetConfigCollectionFromId,
    getSpreadsheetModel,
} from '../services/study-config';
import {
    extractColumnsFilters,
    mapColumnsDto,
    processSpreadsheetsCollectionData,
} from './spreadsheet-view/add-spreadsheet/dialogs/add-spreadsheet-utils';
import useStudyNavigationSync from 'hooks/use-study-navigation-sync';
import { useOptionalLoadingParameters } from '../hooks/use-optional-loading-parameters';
import { processComputationResultFilters } from './results/computing-result-filters.type.ts';

const noUserManager = { instance: null, error: null };

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

    useOptionalLoadingParameters(studyUuid);

    const updateNetworkVisualizationsParams = useCallback(
        (params) => {
            console.debug('received network visualizations parameters : ', params);
            dispatch(setUpdateNetworkVisualizationParameters(params));
        },
        [dispatch]
    );

    const updateParams = useCallback(
        (params, defaultValues = null) => {
            console.debug('received UI parameters : ', params);
            if (defaultValues) {
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
                console.debug('UI parameters filled with default values when undefined : ', params);
            }
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
                    case LAST_SELECTED_DIRECTORY:
                        localStorage.setItem(LAST_SELECTED_DIRECTORY, param.value);
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
                fetchConfigParameter(APP_NAME, eventData.headers['parameterName'])
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

    useNotificationsListener(NotificationsUrlKeys.CONFIG, {
        listenerCallbackMessage: updateConfig,
    });

    useStudyNavigationSync();

    const networkVisuParamsUpdated = useCallback(
        (event) => {
            const eventData = JSON.parse(event.data);
            if (studyUuid && isNetworkVisualizationParametersUpdatedNotification(eventData)) {
                getNetworkVisualizationParameters(studyUuid).then((params) =>
                    updateNetworkVisualizationsParams(params)
                );
            }
        },
        [studyUuid, updateNetworkVisualizationsParams]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: networkVisuParamsUpdated,
    });

    const resetTableDefinitions = useCallback(
        (collection) => {
            const { tablesFilters, tableGlobalFilters, tableDefinitions } =
                processSpreadsheetsCollectionData(collection);
            dispatch(initTableDefinitions(collection.id, tableDefinitions, tablesFilters, tableGlobalFilters));
        },
        [dispatch]
    );

    const updateSpreadsheetTabOnNotification = useCallback(
        (configUuid) => {
            console.debug('Update spreadsheet tab on notification', configUuid);
            getSpreadsheetModel(configUuid)
                .then((model) => {
                    const tabUuid = model.id;
                    const formattedColumns = mapColumnsDto(model.columns);
                    const columnsFilters = extractColumnsFilters(model.columns);
                    const formattedGlobalFilters = model.globalFilters ?? [];
                    dispatch(renameTableDefinition(tabUuid, model.name));
                    dispatch(updateTableColumns(tabUuid, formattedColumns));
                    dispatch(addFilterForNewSpreadsheet(tabUuid, columnsFilters));
                    dispatch(saveSpreadsheetGlobalFilters(tabUuid, formattedGlobalFilters));
                })
                .catch((error) => {
                    console.error(error);
                    snackError({
                        messageTxt: error,
                        headerId: 'spreadsheet/create_new_spreadsheet/error_loading_model',
                    });
                });
        },
        [dispatch, snackError]
    );

    const updateSpreadsheetCollectionOnNotification = useCallback(
        (collectionUuid) => {
            console.debug('Reset spreadsheet collection on notification', collectionUuid);
            getSpreadsheetConfigCollectionFromId(collectionUuid)
                .then((collection) => {
                    resetTableDefinitions(collection);
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error,
                        headerId: 'spreadsheet/create_new_spreadsheet/error_loading_collection',
                    });
                });
        },
        [resetTableDefinitions, snackError]
    );

    const onSpreadsheetNotification = useCallback(
        (event) => {
            const eventData = JSON.parse(event.data);
            if (eventData.headers.studyUuid !== studyUuid) {
                return;
            }
            if (eventData.headers.updateType === NotificationType.SPREADSHEET_TAB_UPDATED) {
                const configUuid = eventData.payload;
                updateSpreadsheetTabOnNotification(configUuid);
            } else if (eventData.headers.updateType === NotificationType.SPREADSHEET_COLLECTION_UPDATED) {
                const collectionUuid = eventData.payload;
                updateSpreadsheetCollectionOnNotification(collectionUuid);
            }
        },
        [studyUuid, updateSpreadsheetCollectionOnNotification, updateSpreadsheetTabOnNotification]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, {
        listenerCallbackMessage: onSpreadsheetNotification,
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
                    updateParams(params, defaultValues);
                });
            });

            const fetchSpreadsheetConfigPromise = getSpreadsheetConfigCollection(studyUuid).then((collection) => {
                resetTableDefinitions(collection);
            });

            const fetchComputationResultFiltersPromise = getComputationResultFilters(studyUuid).then((collection) => {
                console.log('raw computing filters:', collection);
                const processed = processComputationResultFilters(collection);
                console.log('===============processed', processed);
                dispatch(initComputationResultFilters(processed));
            });

            const fetchOptionalServices = getOptionalServices()
                .then((services) => {
                    dispatch(setOptionalServices(retrieveOptionalServices(services)));
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
                fetchComputationResultFiltersPromise,
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
    }, [user, studyUuid, dispatch, updateParams, snackError, updateNetworkVisualizationsParams, resetTableDefinitions]);

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
            <AnnouncementNotification user={user} />
            <CardErrorBoundary>
                <div
                    className="singlestretch-parent"
                    style={{
                        flexGrow: 1,
                        //Study pane needs 'hidden' when displaying the results
                        //or elements tables for certain screen sizes because
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
