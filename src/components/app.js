/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {useEffect, useState} from 'react';

import {useDispatch, useSelector} from 'react-redux'

import {Redirect, Route, Switch, useHistory, useLocation} from 'react-router-dom';

import CssBaseline from '@material-ui/core/CssBaseline';
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
import StudyPane from './study-pane';
import StudyManager from './study-manager';
import {TopBar} from '@gridsuite/commons-ui';
import {LIGHT_THEME} from '../redux/actions'
import Parameters from "./parameters";

import {
    logout,
    getPreLoginPath,
    initializeAuthentication
} from '../utils/authentication/AuthService';

import PageNotFound from "./page-not-found";
import {useRouteMatch} from "react-router";
import {FormattedMessage} from "react-intl";
import AuthenticationRouter from "./authentication-components/authentication-router";

const lightTheme = createMuiTheme({
    palette: {
        type: 'light',
    },
    mapboxStyle: 'mapbox://styles/mapbox/light-v9'
});

const darkTheme = createMuiTheme({
    palette: {
        type: 'dark',
    },
    mapboxStyle: 'mapbox://styles/mapbox/dark-v9'
});

const getMuiTheme = (theme) => {
    if (theme === LIGHT_THEME) {
        return lightTheme;
    } else {
        return darkTheme;
    }
};

const noUserManager = {instance: null, error: null};

const App = () => {
    const theme = useSelector(state => state.theme);

    const user = useSelector(state => state.user);

    const signInCallbackError = useSelector(state => state.signInCallbackError);

    const [userManager, setUserManager] = useState(noUserManager);

    const [showParameters, setShowParameters] = useState(false);

    const history = useHistory();

    const dispatch = useDispatch();

    const location = useLocation();

    let matchSilentRenewCallbackUrl= useRouteMatch({
        path: '/silent-renew-callback',
        exact: true,
    });

    useEffect(() => {
        initializeAuthentication(dispatch, matchSilentRenewCallbackUrl != null, fetch('idpSettings.json'), process.env.REACT_APP_USE_AUTHENTICATION)
            .then(userManager => {
                setUserManager({instance: userManager, error: null});
                userManager.signinSilent().then(() => console.log("signIn silent called ")).catch(e => console.log('signIn silent:  ' + e));
            })
            .catch(function (error) {
                setUserManager({instance: null, error: error.message});
                console.debug("error when importing the idp settings")
            });
    }, []);

    function studyClickHandler(studyName) {
        history.push("/studies/" + studyName);
    }

    function showParametersClicked() {
        setShowParameters(true);
    }

    function hideParameters() {
        setShowParameters(false);
    }

    function onLogoClicked() {
        history.replace("/");
    }

    return (
        <ThemeProvider theme={getMuiTheme(theme)}>
            <React.Fragment>
                <CssBaseline />
                <TopBar appName="GridStudy" onParametersClick={() => showParametersClicked()} onLogoutClick={() => logout(dispatch, userManager.instance)} onLogoClick={() => onLogoClicked()} user={user}/>
                <Parameters showParameters={showParameters} hideParameters={hideParameters}/>
                { user !== null ? (
                        <Switch>
                            <Route exact path="/">
                                <StudyManager onClick={name => studyClickHandler(name)}/>
                            </Route>
                            <Route exact path="/studies/:studyName">
                                <StudyPane/>
                            </Route>
                            <Route exact path="/sign-in-callback">
                                <Redirect to={getPreLoginPath() || "/"} />
                            </Route>
                            <Route exact path="/logout-callback">
                                <h1>Error: logout failed; you are still logged in.</h1>
                            </Route>
                            <Route>
                                <PageNotFound message={<FormattedMessage id="PageNotFound"/>}/>
                            </Route>
                        </Switch>)
                    : (
                        <AuthenticationRouter userManager={userManager} signInCallbackError={signInCallbackError} dispatch={dispatch} history={history} location={location}/>
                    )}
            </React.Fragment>
        </ThemeProvider>
    )
};

export default App;
