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
import TopBar from './top-bar';
import {LIGHT_THEME} from '../redux/actions'
import Parameters from "./parameters";
import {userManagerPromise, login, logout, handleSigninCallback, dispatchUser, getPreLoginPath} from '../utils/authentication/AuthService';
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
        if (props.userManager.instance !== null) {
            props.handleSigninCallback();
        }
    }, [props.userManager]);

    return (
        <h1> </h1>
    )
};

const noUserManager = {instance: null, error: null};

const App = () => {
    const theme = useSelector(state => state.theme);

    const user = useSelector(state => state.user);

    const signInCallbackError = useSelector(state => state.signInCallbackError);


    const [userManager, setUserManager] = useState(noUserManager);

    const history = useHistory();

    const dispatch = useDispatch();

    const location = useLocation();

    useEffect(() => {
        userManagerPromise
            .then(userManager => {
                setUserManager({instance : userManager, error : null });
                dispatchUser(dispatch, userManager);
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
        if (location.pathname !== "/parameters") {
            history.push("/parameters");
        }
    }

    return (
        <ThemeProvider theme={getMuiTheme(theme)}>
            <React.Fragment>
                <CssBaseline />
                <TopBar onParametersClick={() => showParameters()} onLogoutClick={() => logout(dispatch, userManager.instance)}/>
                { user !== null ? (
                        <Switch>
                            <Route exact path="/">
                                <StudyManager onStudyClick={name => studyClickHandler(name)}/>
                            </Route>
                            <Route exact path="/studies/:studyName">
                                <StudyPane/>
                            </Route>
                            <Route exact path="/parameters">
                                <Parameters/>
                            </Route>
                            <Route exact path="/logout-callback">
                                <Redirect to="/" />
                            </Route>
                            <Route exact path="/sign-in-callback">
                                <Redirect to={getPreLoginPath() || "/"} />
                            </Route>
                            <Route>
                                <h1>Error: bad URL; No matched Route.</h1>
                            </Route>
                        </Switch>)
                    : ( <React.Fragment>
                            {userManager.error !== null && (<h1>Error : Getting userManager; {userManager.error}</h1>)}
                            {signInCallbackError !== null && (<h1>Error : SignIn Callback Error; {signInCallbackError.message}</h1>)}
                            <Switch>
                                <Route exact path="/sign-in-callback">
                                    <SignInCallback userManager={userManager} handleSigninCallback={() => handleSigninCallback(dispatch, history, userManager.instance)}/>
                                </Route>
                                <Route>
                                    {userManager.error === null && (<Authentication disabled={userManager.instance === null} onLoginClick={() => login(location, userManager.instance)}/>)}
                                </Route>
                            </Switch>
                        </React.Fragment>
                    )}
            </React.Fragment>
        </ThemeProvider>
    )
};

export default App;
