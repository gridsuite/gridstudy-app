/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import {
    Navigate,
    Route,
    Routes,
    useLocation,
    useMatch,
    useNavigate,
} from 'react-router-dom';

import { StudyView } from './study-pane';
import {
    changeDisplayedColumns,
    changeLockedColumns,
    changeReorderedColumns,
    selectCenterLabelState,
    selectComponentLibrary,
    selectComputedLanguage,
    selectDiagonalLabelState,
    selectDisplayOverloadTableState,
    selectFavoriteContingencyLists,
    selectFavoriteSensiContingencyLists,
    selectLanguage,
    selectLineFlowAlertThreshold,
    selectLineFlowColorMode,
    selectLineFlowMode,
    selectLineFullPathState,
    selectLineParallelPathState,
    selectSubstationLayout,
    selectTheme,
    selectUseName,
    selectFluxConvention,
    selectFavoriteSensiVariablesFiltersLists,
    selectFavoriteSensiBranchFiltersLists,
    selectEnableDeveloperMode,
} from '../redux/actions';

import {
    AuthenticationRouter,
    CardErrorBoundary,
    getPreLoginPath,
    initializeAuthenticationProd,
} from '@gridsuite/commons-ui';

import PageNotFound from './page-not-found';
import { FormattedMessage } from 'react-intl';

import {
    connectNotificationsWsUpdateConfig,
    fetchConfigParameter,
    fetchConfigParameters,
    fetchDefaultParametersValues,
} from '../utils/rest-api';
import {
    APP_NAME,
    COMMON_APP_NAME,
    PARAM_CENTER_LABEL,
    PARAM_COMPONENT_LIBRARY,
    PARAM_DIAGONAL_LABEL,
    PARAM_DISPLAY_OVERLOAD_TABLE,
    PARAM_FAVORITE_CONTINGENCY_LISTS,
    PARAM_LANGUAGE,
    PARAM_LINE_FLOW_ALERT_THRESHOLD,
    PARAM_LINE_FLOW_COLOR_MODE,
    PARAM_LINE_FLOW_MODE,
    PARAM_LINE_FULL_PATH,
    PARAM_LINE_PARALLEL_PATH,
    PARAM_SUBSTATION_LAYOUT,
    PARAM_THEME,
    PARAM_USE_NAME,
    PARAM_FLUX_CONVENTION,
    PARAM_FAVORITE_SENSI_CONTINGENCY_LISTS,
    PARAM_FAVORITE_SENSI_VARIABLES_FILTERS_LISTS,
    PARAM_FAVORITE_SENSI_BRANCH_FILTERS_LISTS,
    PARAM_DEVELOPER_MODE,
} from '../utils/config-params';
import {
    DISPLAYED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE,
    LOCKED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE,
    REORDERED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE,
    TABLES_NAMES_INDEXES,
} from './network/config-tables';
import { getComputedLanguage } from '../utils/language';
import AppTopBar from './app-top-bar';
import { useSnackbar } from 'notistack';
import { displayErrorMessageWithSnackbar, useIntlRef } from '../utils/messages';
import { StudyContainer } from './study-container';

const noUserManager = { instance: null, error: null };

const STUDY_VIEWS = [
    StudyView.MAP,
    StudyView.SPREADSHEET,
    StudyView.RESULTS,
    StudyView.LOGS,
];

const App = () => {
    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    const user = useSelector((state) => state.user);

    const signInCallbackError = useSelector(
        (state) => state.signInCallbackError
    );

    const [userManager, setUserManager] = useState(noUserManager);

    const navigate = useNavigate();

    const dispatch = useDispatch();

    const location = useLocation();

    const [tabIndex, setTabIndex] = useState(0);

    const updateParams = useCallback(
        (params) => {
            console.debug('received UI parameters : ', params);
            let displayedColumnsParams = new Array(TABLES_NAMES_INDEXES.size);
            let dispatchDisplayedColumns = false;
            let lockedColumnsParams = new Array(TABLES_NAMES_INDEXES.size);
            let dispatchLockedColumns = false;
            let reorderedColumnsParams = new Array(TABLES_NAMES_INDEXES.size);
            let dispatchReorderedColumns = false;

            params.forEach((param) => {
                switch (param.name) {
                    case PARAM_THEME:
                        dispatch(selectTheme(param.value));
                        break;
                    case PARAM_LANGUAGE:
                        dispatch(selectLanguage(param.value));
                        dispatch(
                            selectComputedLanguage(
                                getComputedLanguage(param.value)
                            )
                        );
                        break;
                    case PARAM_CENTER_LABEL:
                        dispatch(
                            selectCenterLabelState(param.value === 'true')
                        );
                        break;
                    case PARAM_DIAGONAL_LABEL:
                        dispatch(
                            selectDiagonalLabelState(param.value === 'true')
                        );
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
                        dispatch(
                            selectEnableDeveloperMode(param.value === 'true')
                        );
                        break;
                    case PARAM_LINE_FULL_PATH:
                        dispatch(
                            selectLineFullPathState(param.value === 'true')
                        );
                        break;
                    case PARAM_LINE_PARALLEL_PATH:
                        dispatch(
                            selectLineParallelPathState(param.value === 'true')
                        );
                        break;
                    case PARAM_SUBSTATION_LAYOUT:
                        dispatch(selectSubstationLayout(param.value));
                        break;
                    case PARAM_COMPONENT_LIBRARY:
                        dispatch(selectComponentLibrary(param.value));
                        break;
                    case PARAM_DISPLAY_OVERLOAD_TABLE:
                        dispatch(
                            selectDisplayOverloadTableState(
                                param.value === 'true'
                            )
                        );
                        break;
                    case PARAM_USE_NAME:
                        dispatch(selectUseName(param.value === 'true'));
                        break;
                    case PARAM_FAVORITE_CONTINGENCY_LISTS:
                        dispatch(
                            selectFavoriteContingencyLists(
                                param.value.split(',')
                            )
                        );
                        break;
                    case PARAM_FAVORITE_SENSI_VARIABLES_FILTERS_LISTS:
                        dispatch(
                            selectFavoriteSensiVariablesFiltersLists(
                                param.value.split(',')
                            )
                        );
                        break;
                    case PARAM_FAVORITE_SENSI_CONTINGENCY_LISTS:
                        dispatch(
                            selectFavoriteSensiContingencyLists(
                                param.value.split(',')
                            )
                        );
                        break;
                    case PARAM_FAVORITE_SENSI_BRANCH_FILTERS_LISTS:
                        dispatch(
                            selectFavoriteSensiBranchFiltersLists(
                                param.value.split(',')
                            )
                        );
                        break;
                    default:
                        if (
                            param.name.startsWith(
                                DISPLAYED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE
                            )
                        ) {
                            let index = TABLES_NAMES_INDEXES.get(
                                param.name.slice(
                                    DISPLAYED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE.length
                                )
                            );
                            displayedColumnsParams[index] = {
                                index: index,
                                value: param.value,
                            };
                            dispatchDisplayedColumns = true;
                        }
                        if (
                            param.name.startsWith(
                                LOCKED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE
                            )
                        ) {
                            let index = TABLES_NAMES_INDEXES.get(
                                param.name.slice(
                                    LOCKED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE.length
                                )
                            );
                            lockedColumnsParams[index] = {
                                index: index,
                                value: param.value,
                            };
                            dispatchLockedColumns = true;
                        }
                        if (
                            param.name.startsWith(
                                REORDERED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE
                            )
                        ) {
                            let index = TABLES_NAMES_INDEXES.get(
                                param.name.slice(
                                    REORDERED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE.length
                                )
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
                dispatch(changeDisplayedColumns(displayedColumnsParams));
            }
            if (dispatchLockedColumns) {
                dispatch(changeLockedColumns(lockedColumnsParams));
            }
            if (dispatchReorderedColumns) {
                dispatch(changeReorderedColumns(reorderedColumnsParams));
            }
        },
        [dispatch]
    );

    const connectNotificationsUpdateConfig = useCallback(() => {
        const ws = connectNotificationsWsUpdateConfig();

        ws.onmessage = function (event) {
            let eventData = JSON.parse(event.data);
            if (eventData.headers && eventData.headers['parameterName']) {
                fetchConfigParameter(eventData.headers['parameterName'])
                    .then((param) => updateParams([param]))
                    .catch((errorMessage) =>
                        displayErrorMessageWithSnackbar({
                            errorMessage: errorMessage,
                            enqueueSnackbar: enqueueSnackbar,
                            headerMessage: {
                                headerMessageId: 'paramsRetrievingError',
                                intlRef: intlRef,
                            },
                        })
                    );
            }
        };
        ws.onerror = function (event) {
            console.error('Unexpected Notification WebSocket error', event);
        };
        return ws;
    }, [updateParams, enqueueSnackbar, intlRef]);

    // Can't use lazy initializer because useRouteMatch is a hook
    const [initialMatchSilentRenewCallbackUrl] = useState(
        useMatch({
            path: '/silent-renew-callback',
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
        initializeAuthenticationProd(
            dispatch,
            initialMatchSilentRenewCallbackUrl != null,
            fetch('idpSettings.json')
        )
            .then((userManager) => {
                setUserManager({ instance: userManager, error: null });
                userManager.getUser().then((user) => {
                    if (
                        user == null &&
                        initialMatchSilentRenewCallbackUrl == null
                    ) {
                        userManager.signinSilent().catch((error) => {
                            const oidcHackReloaded =
                                'gridsuite-oidc-hack-reloaded';
                            if (
                                !sessionStorage.getItem(oidcHackReloaded) &&
                                error.message ===
                                    'authority mismatch on settings vs. signin state'
                            ) {
                                sessionStorage.setItem(
                                    oidcHackReloaded,
                                    'true'
                                );
                                console.log(
                                    'Hack oidc, reload page to make login work'
                                );
                                window.location.reload();
                            }
                        });
                    }
                });
            })
            .catch(function (error) {
                setUserManager({ instance: null, error: error.message });
                console.debug('error when importing the idp settings');
            });
        // Note: initialMatchSilentRenewCallbackUrl and dispatch don't change
    }, [initialMatchSilentRenewCallbackUrl, dispatch]);

    useEffect(() => {
        if (user !== null) {
            fetchConfigParameters(COMMON_APP_NAME)
                .then((params) => updateParams(params))
                .catch((errorMessage) =>
                    displayErrorMessageWithSnackbar({
                        errorMessage: errorMessage,
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId: 'paramsRetrievingError',
                            intlRef: intlRef,
                        },
                    })
                );

            fetchConfigParameters(APP_NAME)
                .then((params) => {
                    fetchDefaultParametersValues()
                        .then((defaultValues) => {
                            // Browsing defaultParametersValues entries
                            Object.entries(defaultValues).forEach(
                                ([key, defaultValue]) => {
                                    // Checking if keys defined in defaultParametersValues file are already defined in config server
                                    // If they are not defined, values are taken from default values file
                                    if (
                                        !params.find(
                                            (param) => param.name === key
                                        )
                                    ) {
                                        params.push({
                                            name: key,
                                            value: defaultValue,
                                        });
                                    }
                                }
                            );
                            updateParams(params);
                        })
                        .catch((errorMessage) => {
                            displayErrorMessageWithSnackbar({
                                errorMessage: errorMessage,
                                enqueueSnackbar: enqueueSnackbar,
                                headerMessage: {
                                    headerMessageId: 'paramsRetrievingError',
                                    intlRef: intlRef,
                                },
                            });
                        });
                })
                .catch((errorMessage) =>
                    displayErrorMessageWithSnackbar({
                        errorMessage: errorMessage,
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId: 'paramsRetrievingError',
                            intlRef: intlRef,
                        },
                    })
                );

            const ws = connectNotificationsUpdateConfig();
            return function () {
                ws.close();
            };
        }
    }, [
        user,
        dispatch,
        updateParams,
        enqueueSnackbar,
        intlRef,
        connectNotificationsUpdateConfig,
    ]);

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
            <AppTopBar
                user={user}
                tabIndex={tabIndex}
                onChangeTab={onChangeTab}
                userManager={userManager}
            />
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
                                element={
                                    <StudyContainer
                                        view={STUDY_VIEWS[tabIndex]}
                                        onChangeTab={onChangeTab}
                                    />
                                }
                            />
                            <Route
                                path="/sign-in-callback"
                                element={
                                    <Navigate
                                        replace
                                        to={getPreLoginPath() || '/'}
                                    />
                                }
                            />
                            <Route
                                path="/logout-callback"
                                element={
                                    <h1>
                                        Error: logout failed; you are still
                                        logged in.
                                    </h1>
                                }
                            />
                            <Route
                                path="*"
                                element={
                                    <PageNotFound
                                        message={
                                            <FormattedMessage id="PageNotFound" />
                                        }
                                    />
                                }
                            />
                        </Routes>
                    ) : (
                        <AuthenticationRouter
                            userManager={userManager}
                            signInCallbackError={signInCallbackError}
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
