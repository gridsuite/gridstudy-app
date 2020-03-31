/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {useEffect} from 'react';

import {useDispatch, useSelector} from 'react-redux'

import {Route, Switch, useHistory, useLocation} from 'react-router-dom';

import CssBaseline from '@material-ui/core/CssBaseline';
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
import StudyPane from './study-pane';
import StudyManager from './study-manager';
import TopBar from './top-bar';
import {LIGHT_THEME, setLoggedUser} from '../redux/actions'
import Parameters from "./parameters";
import { userManager } from '../utils/authentication/AuthService';
import Authentication from "./authentication";

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

const SignInCallback = ({getUser}) => {
    const history = useHistory();

    function handleCallback() {
        userManager.signinRedirectCallback().then(function () {
            getUser();
            const previousPath = sessionStorage.getItem("powsybl-study-app-current-path");
            history.push(previousPath);
        }).catch(function (e) {
            console.error(e);
        });
    }

    useEffect(() => {
        handleCallback();
    }, []);

    return (
        <h1> </h1>
    )
};

const App = () => {
    const theme = useSelector(state => state.theme);

    const user = useSelector(state => state.user);

    const history = useHistory();

    const dispatch = useDispatch();

    const location = useLocation();

    function studyClickHandler(studyName) {
        history.push("/studies/" + studyName);
    }

    function showParameters() {
        if (location.pathname === "/parameters") {
            // if already at parameters go back to study
            history.goBack();
        } else {
            history.push("/parameters");
        }
    }

    function login() {
        sessionStorage.setItem("powsybl-study-app-current-path",  location.pathname + location.search);
        userManager.signinRedirect().then(() => console.debug("login"));
    }

    function  getUser() {
        userManager.getUser().then(user => {
            if (user) {
                dispatch(setLoggedUser(user));
                console.debug('User has been successfully loaded from store.');
            } else {
                console.debug('You are not logged in.');
            }
        });
    }

    function  logout() {
        dispatch(setLoggedUser(null));
        userManager.signoutRedirect().then(
            () => console.debug("logged out"));
    }

    return (
        <ThemeProvider theme={getMuiTheme(theme)}>
            <React.Fragment>
                <CssBaseline />
                <TopBar onParametersClick={() => showParameters()} onLogoutClick={() => logout()}/>
                    { user !== null ? (
                        <Switch>
                            <Route exact path="/">
                                  <StudyManager onStudyClick={name => studyClickHandler(name)}/>)
                            </Route>
                            <Route exact path="/studies/:studyName">
                               <StudyPane/>
                            </Route>
                            <Route exact path="/parameters">
                              <Parameters/>
                            </Route>
                            <Route>
                                <h1>Error: bad URL; No matched Route.</h1>
                            </Route>
                        </Switch>)
                        : (
                            <Switch>
                                <Route exact path="/sign-in-callback">
                                    <SignInCallback getUser={getUser}/>
                                </Route>
                                <Route>
                                    <Authentication onLoginClick={() => login()}/>
                                </Route>
                            </Switch>
                        )}
            </React.Fragment>
        </ThemeProvider>
    )
};

export default App;
