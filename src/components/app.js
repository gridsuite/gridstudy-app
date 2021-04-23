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
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {
    createMuiTheme,
    makeStyles,
    ThemeProvider,
} from '@material-ui/core/styles';
import { Badge } from '@material-ui/core';
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
    logout,
    SnackbarProvider,
    TopBar,
} from '@gridsuite/commons-ui';

import PageNotFound from './page-not-found';
import { useRouteMatch } from 'react-router';
import { FormattedMessage } from 'react-intl';

import { ReactComponent as GridStudyLogoLight } from '../images/GridStudy_logo_light.svg';
import { ReactComponent as GridStudyLogoDark } from '../images/GridStudy_logo_dark.svg';
import {
    connectNotificationsWsUpdateConfig,
    fetchAppsAndUrls,
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
import Parameters, { useParameterState } from './parameters';
import { getComputedLanguage } from '../utils/language';

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

const useStyles = makeStyles(() => ({
    tabs: {
        marginLeft: 18,
    },
}));

const noUserManager = { instance: null, error: null };

const STUDY_VIEWS = [StudyView.MAP, StudyView.SPREADSHEET, StudyView.RESULTS];

const App = () => {
    const user = useSelector((state) => state.user);

    const [themeLocal, handleChangeTheme] = useParameterState(PARAM_THEME);

    const [languageLocal, handleChangeLanguage] = useParameterState(
        PARAM_LANGUAGE
    );

    const [useNameLocal, handleChangeUseName] = useParameterState(
        PARAM_USE_NAME
    );

    const studyUuid = useSelector((state) => state.studyUuid);

    const [appsAndUrls, setAppsAndUrls] = React.useState([]);

    const signInCallbackError = useSelector(
        (state) => state.signInCallbackError
    );

    const [userManager, setUserManager] = useState(noUserManager);

    const [showParameters, setShowParameters] = useState(false);

    const history = useHistory();

    const dispatch = useDispatch();

    const location = useLocation();

    const classes = useStyles();

    const [tabIndex, setTabIndex] = React.useState(0);

    const resultCount = useSelector((state) => state.resultCount);

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
            fetchAppsAndUrls().then((res) => {
                setAppsAndUrls(res);
            });
        }
    }, [user]);

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

    function showParametersClicked() {
        setShowParameters(true);
    }

    function hideParameters() {
        setShowParameters(false);
    }

    function onLogoClicked() {
        history.replace('/');
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
            <SnackbarProvider hideIconVariant={false}>
                <CssBaseline />
                <div
                    className="singlestretch-child"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <TopBar
                        appName="Study"
                        appColor="#0CA789"
                        appLogo={
                            themeLocal === LIGHT_THEME ? (
                                <GridStudyLogoLight />
                            ) : (
                                <GridStudyLogoDark />
                            )
                        }
                        onParametersClick={() => showParametersClicked()}
                        onLogoutClick={() =>
                            logout(dispatch, userManager.instance)
                        }
                        onLogoClick={() => onLogoClicked()}
                        user={user}
                        appsAndUrls={appsAndUrls}
                        onThemeClick={handleChangeTheme}
                        onAboutClick={() => console.debug('about')}
                        theme={themeLocal}
                        onEquipmentLabellingClick={handleChangeUseName}
                        equipmentLabelling={useNameLocal}
                        onLanguageClick={handleChangeLanguage}
                        language={languageLocal}
                    >
                        {studyUuid && (
                            <Tabs
                                value={tabIndex}
                                indicatorColor="primary"
                                variant="scrollable"
                                scrollButtons="auto"
                                onChange={(event, newTabIndex) => {
                                    onChangeTab(newTabIndex);
                                }}
                                aria-label="views"
                                className={classes.tabs}
                            >
                                {STUDY_VIEWS.map((tabName) => {
                                    let label;
                                    if (
                                        tabName === StudyView.RESULTS &&
                                        resultCount > 0
                                    ) {
                                        label = (
                                            <Badge
                                                badgeContent={resultCount}
                                                color="secondary"
                                            >
                                                <FormattedMessage
                                                    id={tabName}
                                                />
                                            </Badge>
                                        );
                                    } else {
                                        label = (
                                            <FormattedMessage id={tabName} />
                                        );
                                    }
                                    return <Tab key={tabName} label={label} />;
                                })}
                            </Tabs>
                        )}
                    </TopBar>
                    <Parameters
                        showParameters={showParameters}
                        hideParameters={hideParameters}
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
                                        Error: logout failed; you are still
                                        logged in.
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
            </SnackbarProvider>
        </ThemeProvider>
    );
};

export default App;
