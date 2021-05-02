/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import {
    Redirect,
    Route,
    Switch,
    useHistory,
    useLocation,
} from 'react-router-dom';

import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import StudyPane, { StudyView } from './study-pane';
import StudyManager from './study-manager';
import {
    changeDisplayedColumns,
    resetResultCount,
    selectCenterLabelState,
    selectComputedLanguage,
    selectDiagonalLabelState,
    selectDisplayOverloadTableState,
    selectLanguage,
    selectLineFlowAlertThreshold,
    selectLineFlowColorMode,
    selectLineFlowMode,
    selectLineFullPathState,
    selectLineParallelPathState,
    selectSubstationLayout,
    selectTheme,
    selectUseName,
} from '../redux/actions';

import {
    AuthenticationRouter,
    getPreLoginPath,
    initializeAuthenticationProd,
    LIGHT_THEME,
} from '@gridsuite/commons-ui';

import PageNotFound from './page-not-found';
import { useRouteMatch } from 'react-router';
import { FormattedMessage } from 'react-intl';

import {
    connectNotificationsWsUpdateConfig,
    fetchConfigParameter,
    fetchConfigParameters,
} from '../utils/rest-api';
import {
    APP_NAME,
    COMMON_APP_NAME,
    PARAM_CENTER_LABEL,
    PARAM_DIAGONAL_LABEL,
    PARAM_DISPLAY_OVERLOAD_TABLE,
    PARAM_LANGUAGE,
    PARAM_LINE_FLOW_ALERT_THRESHOLD,
    PARAM_LINE_FLOW_COLOR_MODE,
    PARAM_LINE_FLOW_MODE,
    PARAM_LINE_FULL_PATH,
    PARAM_LINE_PARALLEL_PATH,
    PARAM_SUBSTATION_LAYOUT,
    PARAM_THEME,
    PARAM_USE_NAME,
} from '../utils/config-params';
import {
    COLUMNS_PARAMETER_PREFIX_IN_DATABASE,
    TABLES_NAMES_INDEXES,
} from './network/config-tables';
import { getComputedLanguage } from '../utils/language';
import AppTopBar from './app-top-bar';
import { useParameterState } from './parameters';

const lightTheme = createMuiTheme({
    palette: {
        type: 'light',
    },
    arrow: {
        fill: '#212121',
        stroke: '#212121',
    },
    arrow_hover: {
        fill: 'white',
        stroke: 'white',
    },
    circle: {
        stroke: 'white',
        fill: 'white',
    },
    circle_hover: {
        stroke: '#212121',
        fill: '#212121',
    },
    link: {
        color: 'blue',
    },
    mapboxStyle: 'mapbox://styles/mapbox/light-v9',
});

const darkTheme = createMuiTheme({
    palette: {
        type: 'dark',
    },
    arrow: {
        fill: 'white',
        stroke: 'white',
    },
    arrow_hover: {
        fill: '#424242',
        stroke: '#424242',
    },
    circle: {
        stroke: '#424242',
        fill: '#424242',
    },
    circle_hover: {
        stroke: 'white',
        fill: 'white',
    },
    link: {
        color: 'green',
    },
    mapboxStyle: 'mapbox://styles/mapbox/dark-v9',
});

const getMuiTheme = (theme) => {
    if (theme === LIGHT_THEME) {
        return lightTheme;
    } else {
        return darkTheme;
    }
};

const noUserManager = { instance: null, error: null };

const STUDY_VIEWS = [StudyView.MAP, StudyView.SPREADSHEET, StudyView.RESULTS];

const App = () => {
    const user = useSelector((state) => state.user);

    const [themeLocal, handleChangeTheme] = useParameterState(PARAM_THEME);

    const signInCallbackError = useSelector(
        (state) => state.signInCallbackError
    );

    const [userManager, setUserManager] = useState(noUserManager);

    const history = useHistory();

    const dispatch = useDispatch();

    const location = useLocation();

    const [tabIndex, setTabIndex] = useState(0);

    const updateParams = useCallback(
        (params) => {
            console.debug('received UI parameters : ', params);
            let displayedColumnsParams = new Array(TABLES_NAMES_INDEXES.size);
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
                    default:
                        if (
                            param.name.startsWith(
                                COLUMNS_PARAMETER_PREFIX_IN_DATABASE
                            )
                        ) {
                            let index = TABLES_NAMES_INDEXES.get(
                                param.name.slice(
                                    COLUMNS_PARAMETER_PREFIX_IN_DATABASE.length
                                )
                            );
                            displayedColumnsParams[index] = {
                                index: index,
                                value: param.value,
                            };
                        }
                }
            });
            dispatch(changeDisplayedColumns(displayedColumnsParams));
        },
        [dispatch]
    );

    const connectNotificationsUpdateConfig = useCallback(() => {
        const ws = connectNotificationsWsUpdateConfig();

        ws.onmessage = function (event) {
            let eventData = JSON.parse(event.data);
            if (eventData.headers && eventData.headers['parameterName']) {
                fetchConfigParameter(eventData.headers['parameterName']).then(
                    (param) => {
                        updateParams([param]);
                    }
                );
            }
        };
        ws.onerror = function (event) {
            console.error('Unexpected Notification WebSocket error', event);
        };
        return ws;
    }, [updateParams]);

    // Can't use lazy initializer because useRouteMatch is a hook
    const [initialMatchSilentRenewCallbackUrl] = useState(
        useRouteMatch({
            path: '/silent-renew-callback',
            exact: true,
        })
    );

    const isStudyPane =
        useRouteMatch({
            path: '/studies/:studyUuid',
            exact: true,
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
                                sessionStorage.setItem(oidcHackReloaded, true);
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
            fetchConfigParameters(COMMON_APP_NAME).then((params) => {
                updateParams(params);
            });
            fetchConfigParameters(APP_NAME).then((params) => {
                updateParams(params);
            });
            const ws = connectNotificationsUpdateConfig();
            return function () {
                ws.close();
            };
        }
    }, [user, dispatch, updateParams, connectNotificationsUpdateConfig]);

    function studyClickHandler(studyUuid) {
        history.push('/studies/' + encodeURIComponent(studyUuid));
    }

    const onChangeTab = useCallback((newTabIndex) => {
        setTabIndex(newTabIndex);
    }, []);

    // if result tab is displayed, clean badge
    if (STUDY_VIEWS[tabIndex] === StudyView.RESULTS) {
        dispatch(resetResultCount());
    }

    return (
        <ThemeProvider theme={getMuiTheme(themeLocal)}>
            <CssBaseline />
            <div
                className="singlestretch-child"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <AppTopBar
                    user={user}
                    themeLocal={themeLocal}
                    tabIndex={tabIndex}
                    onChangeTab={onChangeTab}
                    userManager={userManager}
                    handleChangeTheme={handleChangeTheme}
                    history={history}
                />
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
                        <Switch>
                            <Route exact path="/">
                                <StudyManager
                                    onClick={(studyUuid) =>
                                        studyClickHandler(studyUuid)
                                    }
                                />
                            </Route>
                            <Route exact path="/studies/:studyUuid">
                                <StudyPane
                                    view={STUDY_VIEWS[tabIndex]}
                                    onChangeTab={onChangeTab}
                                />
                            </Route>
                            <Route exact path="/sign-in-callback">
                                <Redirect to={getPreLoginPath() || '/'} />
                            </Route>
                            <Route exact path="/logout-callback">
                                <h1>
                                    Error: logout failed; you are still logged
                                    in.
                                </h1>
                            </Route>
                            <Route>
                                <PageNotFound
                                    message={
                                        <FormattedMessage id="PageNotFound" />
                                    }
                                />
                            </Route>
                        </Switch>
                    ) : (
                        <AuthenticationRouter
                            userManager={userManager}
                            signInCallbackError={signInCallbackError}
                            dispatch={dispatch}
                            history={history}
                            location={location}
                        />
                    )}
                </div>
            </div>
            )) }
        </ThemeProvider>
    );
};

export default App;
