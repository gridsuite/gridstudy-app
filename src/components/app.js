/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';

import {useDispatch, useSelector} from 'react-redux'

import {Redirect, Route, Switch, useHistory} from 'react-router-dom';

import CssBaseline from '@material-ui/core/CssBaseline';
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';

import Network from './network/network';
import StudyPane from './study-pane';
import StudyManager from './study-manager';
import TopBar from './top-bar';
import {closeStudy, LIGHT_THEME, loadGeoDataSuccess, loadNetworkSuccess, openStudy} from '../redux/actions'
import {fetchLinePositions, fetchLines, fetchSubstationPositions, fetchSubstations} from '../utils/rest-api'
import GeoData from "./network/geo-data";
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
}

const App = () => {

    const dispatch = useDispatch();

    const study = useSelector(state => state.study);

    const theme = useSelector(state => state.theme);

    const history = useHistory();

    function resetStudy(studyName) {
        dispatch(closeStudy());
        dispatch(openStudy(studyName));
    }

    function loadNetwork(studyName) {
        console.info(`Loading network of study '${studyName}'...`);

        const substations = fetchSubstations(studyName);

        const lines = fetchLines(studyName);

        Promise.all([substations, lines])
            .then(values => {
                const network = new Network();
                network.setSubstations(values[0]);
                network.setLines(values[1]);
                dispatch(loadNetworkSuccess(network));
            });
    }

    function loadGeoData(studyName) {
        console.info(`Loading geo data of study '${studyName}'...`);

        const substationPositions = fetchSubstationPositions(studyName);

        const linePositions = fetchLinePositions(studyName);

        Promise.all([substationPositions, linePositions])
            .then(values => {
                const geoData = new GeoData();
                geoData.setSubstationPositions(values[0]);
                geoData.setLinePositions(values[1]);
                dispatch(loadGeoDataSuccess(geoData));
            });
    }

    function showParameters() {
        history.push("/parameters");
    }

    function studyClickHandler(studyName) {
        resetStudy(studyName);
        history.push("/map");
        loadNetwork(studyName);
        loadGeoData(studyName);
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
                    <Route exact path="/map">
                        { study ? <StudyPane /> : <Redirect to="/" /> }
                    </Route>
                    <Route exact path="/parameters">
                        <Parameters/>
                    </Route>
                </Switch>
            </React.Fragment>
        </ThemeProvider>
    )
};

export default App;
