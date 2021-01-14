/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';

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
import { LIGHT_THEME, resetResultCount } from '../redux/actions';
import Parameters from './parameters';

import {
    AuthenticationRouter,
    getPreLoginPath,
    initializeAuthenticationProd,
    logout,
    TopBar,
} from '@gridsuite/commons-ui';

import PageNotFound from './page-not-found';
import { useRouteMatch } from 'react-router';
import { FormattedMessage } from 'react-intl';

import { ReactComponent as GridStudyLogoLight } from '../images/GridStudy_logo_light.svg';
import { ReactComponent as GridStudyLogoDark } from '../images/GridStudy_logo_dark.svg';
import { fetchAppsAndUrls } from '../utils/rest-api';

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

const STUDY_VIEWS = [StudyView.MAP, StudyView.TABLE, StudyView.RESULTS];

const App = () => {
    const theme = useSelector((state) => state.theme);

    const user = useSelector((state) => state.user);

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

    // Can't use lazy initializer because useRouteMatch is a hook
    const [initialMatchSilentRenewCallbackUrl] = useState(
        useRouteMatch({
            path: '/silent-renew-callback',
            exact: true,
        })
    );

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

    // if result tab is displayed, clean badge
    if (STUDY_VIEWS[tabIndex] === StudyView.RESULTS) {
        dispatch(resetResultCount());
    }

    return (
        <ThemeProvider theme={getMuiTheme(theme)}>
            <CssBaseline />
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
                onLogoutClick={() => logout(dispatch, userManager.instance)}
                onLogoClick={() => onLogoClicked()}
                user={user}
                appsAndUrls={appsAndUrls}
            >
                {studyName && (
                    <Tabs
                        value={tabIndex}
                        indicatorColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                        onChange={(event, newTabIndex) =>
                            setTabIndex(newTabIndex)
                        }
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
                                        <FormattedMessage id={tabName} />
                                    </Badge>
                                );
                            } else {
                                label = <FormattedMessage id={tabName} />;
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
                        <StudyPane view={STUDY_VIEWS[tabIndex]} />
                    </Route>
                    <Route exact path="/sign-in-callback">
                        <Redirect to={getPreLoginPath() || '/'} />
                    </Route>
                    <Route exact path="/logout-callback">
                        <h1>
                            Error: logout failed; you are still logged in.
                        </h1>
                    </Route>
                    <Route>
                        <PageNotFound
                            message={<FormattedMessage id="PageNotFound" />}
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
        </ThemeProvider>
    );
};

export default App;
