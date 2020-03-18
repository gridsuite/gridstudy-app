/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';

import {useSelector} from 'react-redux'

import {Route, Switch, useHistory, useLocation} from 'react-router-dom';

import CssBaseline from '@material-ui/core/CssBaseline';
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
import StudyPane from './study-pane';
import StudyManager from './study-manager';
import TopBar from './top-bar';
import {LIGHT_THEME} from '../redux/actions'
import Parameters from "./parameters";

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

const App = () => {

    const theme = useSelector(state => state.theme);

    const history = useHistory();

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

    return (
        <ThemeProvider theme={getMuiTheme(theme)}>
            <React.Fragment>
                <CssBaseline />
                <TopBar onParametersClick={ () => showParameters() }/>
                <Switch>
                    <Route exact path="/">
                        <StudyManager onStudyClick={ name => studyClickHandler(name) }/>
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
                </Switch>
            </React.Fragment>
        </ThemeProvider>
    )
};

export default App;
