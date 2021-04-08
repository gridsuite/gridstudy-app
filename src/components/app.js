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
    resetResultCount,
    selectCenterLabelState,
    selectDiagonalLabelState,
    selectLineFlowAlertThreshold,
    selectLineFlowColorMode,
    selectLineFlowMode,
    selectLineFullPathState,
    selectLineParallelPathState,
    selectSubstationLayout,
    selectTheme,
    selectUseName,
    selectDisplayOverloadTableState,
    changeDisplayedColumns,
    selectLanguage,
} from '../redux/actions';
import Parameters from './parameters';
import {
    LIGHT_THEME,
    AuthenticationRouter,
    getPreLoginPath,
    initializeAuthenticationProd,
    logout,
    TopBar,
    SnackbarProvider,
} from '@gridsuite/commons-ui';

import PageNotFound from './page-not-found';
import { useRouteMatch } from 'react-router';
import { FormattedMessage } from 'react-intl';

import { ReactComponent as GridStudyLogoLight } from '../images/GridStudy_logo_light.svg';
import { ReactComponent as GridStudyLogoDark } from '../images/GridStudy_logo_dark.svg';
import {
    connectNotificationsWsUpdateConfig,
    fetchAppsAndUrls,
    fetchConfigParameters,
    updateConfigParameter,
} from '../utils/rest-api';
import {
    PARAMS_CENTER_LABEL_KEY,
    PARAMS_DIAGONAL_LABEL_KEY,
    PARAMS_LINE_FLOW_ALERT_THRESHOLD_KEY,
    PARAMS_LINE_FLOW_COLOR_MODE_KEY,
    PARAMS_LINE_FLOW_MODE_KEY,
    PARAMS_LINE_FULL_PATH_KEY,
    PARAMS_LINE_PARALLEL_PATH_KEY,
    PARAMS_SUBSTATION_LAYOUT_KEY,
    PARAMS_THEME_KEY,
    PARAMS_USE_NAME_KEY,
    PARAMS_DISPLAY_OVERLOAD_TABLE_KEY,
    PARAMS_LANGUAGE_KEY,
} from '../utils/config-params';
import {
    COLUMNS_PARAMETER_PREFIX_IN_DATABASE,
    TABLES_NAMES_INDEXES,
} from './network/constants';

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
    const theme = useSelector((state) => state.theme);

    const user = useSelector((state) => state.user);

    const useName = useSelector((state) => state.useName);

    const language = useSelector((state) => state.language);

    const studyName = useSelector((state) => state.studyName);

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
            let displayedColumnsParams = new Array(TABLES_NAMES_INDEXES.size);
            params.forEach((param) => {
                switch (param.name) {
                    case PARAMS_THEME_KEY:
                        dispatch(selectTheme(param.value));
                        break;
                    case PARAMS_LANGUAGE_KEY:
                        dispatch(selectLanguage(param.value));
                        break;
                    case PARAMS_CENTER_LABEL_KEY:
                        dispatch(
                            selectCenterLabelState(param.value === 'true')
                        );
                        break;
                    case PARAMS_DIAGONAL_LABEL_KEY:
                        dispatch(
                            selectDiagonalLabelState(param.value === 'true')
                        );
                        break;
                    case PARAMS_LINE_FLOW_ALERT_THRESHOLD_KEY:
                        dispatch(selectLineFlowAlertThreshold(param.value));
                        break;
                    case PARAMS_LINE_FLOW_COLOR_MODE_KEY:
                        dispatch(selectLineFlowColorMode(param.value));
                        break;
                    case PARAMS_LINE_FLOW_MODE_KEY:
                        dispatch(selectLineFlowMode(param.value));
                        break;
                    case PARAMS_LINE_FULL_PATH_KEY:
                        dispatch(
                            selectLineFullPathState(param.value === 'true')
                        );
                        break;
                    case PARAMS_LINE_PARALLEL_PATH_KEY:
                        dispatch(
                            selectLineParallelPathState(param.value === 'true')
                        );
                        break;
                    case PARAMS_SUBSTATION_LAYOUT_KEY:
                        dispatch(selectSubstationLayout(param.value));
                        break;
                    case PARAMS_DISPLAY_OVERLOAD_TABLE_KEY:
                        dispatch(
                            selectDisplayOverloadTableState(
                                param.value === 'true'
                            )
                        );
                        break;
                    case PARAMS_USE_NAME_KEY:
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
            fetchConfigParameters().then((params) => {
                updateParams(params);
            });
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
            path: '/:userId/studies/:studyName',
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
            fetchConfigParameters().then((params) => {
                console.debug('received UI parameters : ', params);
                updateParams(params);
            });
            const ws = connectNotificationsUpdateConfig();
            return function () {
                ws.close();
            };
        }
    }, [user, dispatch, updateParams, connectNotificationsUpdateConfig]);

    function studyClickHandler(studyName, userId) {
        history.push(
            '/' +
                encodeURIComponent(userId) +
                '/studies/' +
                encodeURIComponent(studyName)
        );
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

    function onChangeTab(newTabIndex) {
        setTabIndex(newTabIndex);
    }

    const handleThemeClick = (theme) => {
        updateConfigParameter(PARAMS_THEME_KEY, theme);
    };

    const handleEquipmentLabellingClick = (useName) => {
        updateConfigParameter(PARAMS_USE_NAME_KEY, useName);
    };

    const handleLanguageClick = (language) => {
        updateConfigParameter(PARAMS_LANGUAGE_KEY, language);

    };

    // if result tab is displayed, clean badge
    if (STUDY_VIEWS[tabIndex] === StudyView.RESULTS) {
        dispatch(resetResultCount());
    }

    return (
        <ThemeProvider theme={getMuiTheme(theme)}>
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
                            theme === LIGHT_THEME ? (
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
                        onThemeClick={handleThemeClick}
                        onAboutClick={() => console.debug('about')}
                        theme={theme}
                        onEquipmentLabellingClick={
                            handleEquipmentLabellingClick
                        }
                        equipmentLabelling={useName}
                        onLanguageClick={handleLanguageClick}
                        language={language}
                    >
                        {studyName && (
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
                                        onClick={(name, userId) =>
                                            studyClickHandler(name, userId)
                                        }
                                    />
                                </Route>
                                <Route exact path="/:userId/studies/:studyName">
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
