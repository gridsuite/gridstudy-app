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
import { StudyView } from './study-pane';
import {
    AuthenticationRouter,
    CardErrorBoundary,
    getPreLoginPath,
    initializeAuthenticationProd,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import PageNotFound from './page-not-found';
import { FormattedMessage } from 'react-intl';
import {
    APP_NAME,
    COMMON_APP_NAME,
    PARAM_CENTER_LABEL,
    PARAM_COMPONENT_LIBRARY,
    PARAM_DEVELOPER_MODE,
    PARAM_DIAGONAL_LABEL,
    PARAM_FAVORITE_CONTINGENCY_LISTS,
    PARAM_FLUX_CONVENTION,
    PARAM_INIT_NAD_WITH_GEO_DATA,
    PARAM_LANGUAGE,
    PARAM_LIMIT_REDUCTION,
    PARAM_LINE_FLOW_ALERT_THRESHOLD,
    PARAM_LINE_FLOW_COLOR_MODE,
    PARAM_LINE_FLOW_MODE,
    PARAM_LINE_FULL_PATH,
    PARAM_LINE_PARALLEL_PATH,
    PARAM_MAP_BASEMAP,
    PARAM_MAP_MANUAL_REFRESH,
    PARAM_SUBSTATION_LAYOUT,
    PARAM_THEME,
    PARAM_USE_NAME,
} from '../utils/config-params';
import {
    DISPLAYED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE,
    LOCKED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE,
    REORDERED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE,
} from './spreadsheet/utils/constants';
import { getComputedLanguage } from '../utils/language';
import AppTopBar from './app-top-bar';
import { StudyContainer } from './study-container';
import { fetchValidateUser } from '../services/user-admin';
import { connectNotificationsWsUpdateConfig } from '../services/config-notification';
import { fetchConfigParameter, fetchConfigParameters } from '../services/config';
import { fetchDefaultParametersValues, fetchIdpSettings } from '../services/utils';
import { getOptionalServices } from '../services/study';
import {
    changeDisplayedColumns,
    changeLockedColumns,
    changeReorderedColumns,
    limitReductionModified,
    selectCenterLabelState,
    selectComponentLibrary,
    selectComputedLanguage,
    selectDiagonalLabelState,
    selectEnableDeveloperMode,
    selectFavoriteContingencyLists,
    selectFluxConvention,
    selectInitNadWithGeoData,
    selectLanguage,
    selectLimitReduction,
    selectLineFlowAlertThreshold,
    selectLineFlowColorMode,
    selectLineFlowMode,
    selectLineFullPathState,
    selectLineParallelPathState,
    selectMapBaseMap,
    selectMapManualRefresh,
    selectSubstationLayout,
    selectTheme,
    selectUseName,
    setOptionalServices,
    setParamsLoaded,
} from '../redux/actions';

const noUserManager = { instance: null, error: null };

const STUDY_VIEWS = [StudyView.MAP, StudyView.SPREADSHEET, StudyView.RESULTS, StudyView.LOGS, StudyView.PARAMETERS];

const App = () => {
    const { snackError } = useSnackMessage();

    const user = useSelector((state) => state.user);
    const tablesNamesIndexes = useSelector((state) => state.tables.namesIndexes);
    const tablesDefinitionIndexes = useSelector((state) => state.tables.definitionIndexes);

    const signInCallbackError = useSelector((state) => state.signInCallbackError);
    const authenticationRouterError = useSelector((state) => state.authenticationRouterError);
    const showAuthenticationRouterLogin = useSelector((state) => state.showAuthenticationRouterLogin);

    const [userManager, setUserManager] = useState(noUserManager);

    const navigate = useNavigate();

    const dispatch = useDispatch();

    const location = useLocation();

    const [tabIndex, setTabIndex] = useState(0);

    const updateParams = useCallback(
        (params) => {
            console.debug('received UI parameters : ', params);
            let displayedColumnsParams = new Array(tablesNamesIndexes.size);
            let dispatchDisplayedColumns = false;
            let lockedColumnsParams = new Array(tablesNamesIndexes.size);
            let dispatchLockedColumns = false;
            let reorderedColumnsParams = new Array(tablesNamesIndexes.size);
            let dispatchReorderedColumns = false;

            params.forEach((param) => {
                switch (param.name) {
                    case PARAM_THEME:
                        dispatch(selectTheme(param.value));
                        break;
                    case PARAM_LANGUAGE:
                        dispatch(selectLanguage(param.value));
                        dispatch(selectComputedLanguage(getComputedLanguage(param.value)));
                        break;
                    case PARAM_CENTER_LABEL:
                        dispatch(selectCenterLabelState(param.value === 'true'));
                        break;
                    case PARAM_DIAGONAL_LABEL:
                        dispatch(selectDiagonalLabelState(param.value === 'true'));
                        break;
                    case PARAM_LIMIT_REDUCTION:
                        dispatch(selectLimitReduction(param.value));
                        break;
                    case PARAM_LINE_FLOW_ALERT_THRESHOLD:
                        dispatch(selectLineFlowAlertThreshold(param.value));
                        break;
                    case PARAM_LINE_FLOW_COLOR_MODE:
                        dispatch(selectLineFlowColorMode(param.value));
                        break;
                    case PARAM_LINE_FLOW_MODE:
                        dispatch(selectLineFlowMode(param.value));
                        break;
                    case PARAM_FLUX_CONVENTION:
                        dispatch(selectFluxConvention(param.value));
                        break;
                    case PARAM_DEVELOPER_MODE:
                        dispatch(selectEnableDeveloperMode(param.value === 'true'));
                        break;
                    case PARAM_INIT_NAD_WITH_GEO_DATA:
                        dispatch(selectInitNadWithGeoData(param.value === 'true'));
                        break;
                    case PARAM_LINE_FULL_PATH:
                        dispatch(selectLineFullPathState(param.value === 'true'));
                        break;
                    case PARAM_LINE_PARALLEL_PATH:
                        dispatch(selectLineParallelPathState(param.value === 'true'));
                        break;
                    case PARAM_SUBSTATION_LAYOUT:
                        dispatch(selectSubstationLayout(param.value));
                        break;
                    case PARAM_COMPONENT_LIBRARY:
                        dispatch(selectComponentLibrary(param.value));
                        break;
                    case PARAM_MAP_MANUAL_REFRESH:
                        dispatch(selectMapManualRefresh(param.value === 'true'));
                        break;
                    case PARAM_MAP_BASEMAP:
                        dispatch(selectMapBaseMap(param.value));
                        break;
                    case PARAM_USE_NAME:
                        dispatch(selectUseName(param.value === 'true'));
                        break;
                    case PARAM_FAVORITE_CONTINGENCY_LISTS:
                        dispatch(selectFavoriteContingencyLists(param.value.split(',').filter((list) => list)));
                        break;
                    default:
                        if (param.name.startsWith(DISPLAYED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE)) {
                            let index = tablesNamesIndexes.get(
                                param.name.slice(DISPLAYED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE.length)
                            );
                            displayedColumnsParams[index] = {
                                index: index,
                                value: param.value,
                            };
                            dispatchDisplayedColumns = true;
                        }
                        if (param.name.startsWith(LOCKED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE)) {
                            let index = tablesNamesIndexes.get(
                                param.name.slice(LOCKED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE.length)
                            );
                            lockedColumnsParams[index] = {
                                index: index,
                                value: param.value,
                            };
                            dispatchLockedColumns = true;
                        }
                        if (param.name.startsWith(REORDERED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE)) {
                            let index = tablesNamesIndexes.get(
                                param.name.slice(REORDERED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE.length)
                            );
                            reorderedColumnsParams[index] = {
                                index: index,
                                value: param.value,
                            };
                            dispatchReorderedColumns = true;
                        }
                }
            });
            if (dispatchDisplayedColumns) {
                if (dispatchReorderedColumns) {
                    cleanEquipmentsColumnsParamsWithNewAndDeleted(displayedColumnsParams, reorderedColumnsParams);
                }
                dispatch(changeDisplayedColumns(displayedColumnsParams));
            }
            if (dispatchLockedColumns) {
                if (dispatchReorderedColumns) {
                    cleanEquipmentsColumnsParamsWithNewAndDeleted(lockedColumnsParams, reorderedColumnsParams, true);
                }
                dispatch(changeLockedColumns(lockedColumnsParams));
            }
            if (dispatchReorderedColumns) {
                cleanEquipmentsColumnsParamsWithNewAndDeleted(reorderedColumnsParams, reorderedColumnsParams);
                dispatch(changeReorderedColumns(reorderedColumnsParams));
            }
            function cleanEquipmentsColumnsParamsWithNewAndDeleted(
                equipmentsColumnsParams,
                reorderedColumnsParams,
                deletedOnly = false
            ) {
                for (const param of equipmentsColumnsParams) {
                    if (!param) {
                        continue;
                    }

                    const index = param.index;

                    const equipmentAllColumnsIds = tablesDefinitionIndexes.get(index).columns.map((item) => item.id);

                    const equipmentReorderedColumnsIds = JSON.parse(reorderedColumnsParams[index].value);
                    const equipmentNewColumnsIds = equipmentAllColumnsIds.filter(
                        (item) => !equipmentReorderedColumnsIds.includes(item)
                    );

                    const equipmentsParamColumnIds = JSON.parse(equipmentsColumnsParams[index].value);

                    // Remove deleted ids
                    const equipmentsNewParamColumnIds = equipmentsParamColumnIds.filter((item) =>
                        equipmentAllColumnsIds.includes(item)
                    );

                    // Update columns
                    if (deletedOnly) {
                        param.value = JSON.stringify([...equipmentsNewParamColumnIds]);
                    } else {
                        param.value = JSON.stringify([...equipmentsNewParamColumnIds, ...equipmentNewColumnsIds]);
                    }
                }
            }
        },
        [dispatch, tablesNamesIndexes, tablesDefinitionIndexes]
    );

    const connectNotificationsUpdateConfig = useCallback(() => {
        const ws = connectNotificationsWsUpdateConfig();

        ws.onmessage = function (event) {
            let eventData = JSON.parse(event.data);
            if (eventData.headers && eventData.headers['parameterName']) {
                fetchConfigParameter(eventData.headers['parameterName'])
                    .then((param) => {
                        updateParams([param]);
                        if (param.name === 'limitReduction') {
                            dispatch(limitReductionModified(true));
                        }
                    })
                    .catch((error) =>
                        snackError({
                            messageTxt: error.message,
                            headerId: 'paramsRetrievingError',
                        })
                    );
            }
        };
        ws.onerror = function (event) {
            console.error('Unexpected Notification WebSocket error', event);
        };
        return ws;
    }, [updateParams, snackError, dispatch]);

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
        if (user !== null) {
            const fetchCommonConfigPromise = fetchConfigParameters(COMMON_APP_NAME).then((params) =>
                updateParams(params)
            );

            const fetchAppConfigPromise = fetchConfigParameters(APP_NAME).then((params) => {
                fetchDefaultParametersValues()
                    .then((defaultValues) => {
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
                    })
                    .catch((error) => {
                        snackError({
                            messageTxt: error.message,
                            headerId: 'paramsRetrievingError',
                        });
                    });
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
            Promise.all([fetchCommonConfigPromise, fetchAppConfigPromise, fetchOptionalServices])
                .then(() => {
                    dispatch(setParamsLoaded());
                })
                .catch((error) =>
                    snackError({
                        messageTxt: error.message,
                        headerId: 'paramsRetrievingError',
                    })
                );

            const ws = connectNotificationsUpdateConfig();
            return function () {
                ws.close();
            };
        }
    }, [user, dispatch, updateParams, connectNotificationsUpdateConfig, snackError]);

    const onChangeTab = useCallback((newTabIndex) => {
        setTabIndex(newTabIndex);
    }, []);

    return (
        <div
            className="singlestretch-child"
            style={{
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <AppTopBar user={user} tabIndex={tabIndex} onChangeTab={onChangeTab} userManager={userManager} />
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
                                element={<StudyContainer view={STUDY_VIEWS[tabIndex]} onChangeTab={onChangeTab} />}
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
