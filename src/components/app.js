/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {useEffect, useState} from 'react';

import {useDispatch, useSelector} from 'react-redux'

import {Route, Switch, useHistory, useLocation} from 'react-router-dom';

import CssBaseline from '@material-ui/core/CssBaseline';
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
import StudyPane from './study-pane';
import StudyManager from './study-manager';
import TopBar from './top-bar';
import {LIGHT_THEME, setLoggedUser} from '../redux/actions'
import Parameters from "./parameters";
import {userManagerPromise} from '../utils/authentication/AuthService';
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

const SignInCallback = (props) => {

    useEffect(() => {
        props.handleSigninCallback();
    }, [props.userManager]);

    return (
        <h1> </h1>
    )
};

const noUserManager = {instance: null, error: null};

const App = () => {
    const theme = useSelector(state => state.theme);

    const user = useSelector(state => state.user);

    const [userManager, setUserManager] = useState(noUserManager);

    const history = useHistory();

    const dispatch = useDispatch();

    const location = useLocation();

    useEffect(() => {
        userManagerPromise
            .then(userManager => {
                setUserManager({instance : userManager, error : null });
            })
            .catch(function(error) {
                setUserManager({instance : null, error : error.message});
                console.debug("error when importing the idp settings")
             });
    }, []);

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
        if (userManager.instance && !userManager.error) {
            return userManager.instance.signinRedirect().then(() => console.debug("login"));
        }
    }

    function dispatchUser() {
        if (userManager.instance && !userManager.error) {
            return userManager.instance.getUser().then(user => {
                if (user) {
                    console.debug('User has been successfully loaded from store.');
                    return dispatch(setLoggedUser(user));
                } else {
                    console.debug('You are not logged in.');
                }
            });
        }
    }

    function  logout() {
        if (userManager.instance && !userManager.error) {
            dispatch(setLoggedUser(null));
            return userManager.instance.signoutRedirect().then(
                () => console.debug("logged out"));
        }
    }

    function handleSigninCallback() {
        if (userManager.instance && !userManager.error) {
            userManager.instance.signinRedirectCallback().then(function () {
                dispatchUser();
                const previousPath = sessionStorage.getItem("powsybl-study-app-current-path");
                history.push(previousPath);
            }).catch(function (e) {
                console.error(e);
            });
        }
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
                                    <SignInCallback userManager={userManager} handleSigninCallback={handleSigninCallback}/>
                                </Route>
                                <Route>
                                    {userManager.error !== null && (<h1>Error : Getting userManager; {userManager.error}</h1>)}
                                    {userManager.error === null && (<Authentication disabled={userManager.instance === null} onLoginClick={() => login()}/>)}
                                </Route>
                            </Switch>
                        )}
            </React.Fragment>
        </ThemeProvider>
    )
};

export default App;
