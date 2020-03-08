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
import NetworkPane from './network-pane';
import StudyManager from './study-manager';
import TopBar from './top-bar';
import {loadNetworkSuccess, openStudy, removeVoltageLevelDiagram} from '../redux/actions'
import {fetchLinePositions, fetchLines, fetchSubstationPositions, fetchSubstations} from '../utils/rest-api'

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

const App = () => {

    const dispatch = useDispatch();

    const network = useSelector(state => state.network);

    const dark = useSelector(state => state.darkTheme);

    const history = useHistory();

    function resetStudy(studyName) {
        dispatch(removeVoltageLevelDiagram());
        dispatch(openStudy(studyName));
        dispatch(loadNetworkSuccess(new Network()));
    }

    function loadNetwork(studyName) {
        console.info(`Loading network of study '${studyName}'...`);

        const substations = fetchSubstations(studyName);

        const substationPositions = fetchSubstationPositions(studyName);

        const lines = fetchLines(studyName);

        const linePositions = fetchLinePositions(studyName);

        Promise.all([substations, substationPositions, lines, linePositions])
            .then(values => {
                const network = new Network();
                network.setSubstations(values[0]);
                network.setLines(values[2]);
                network.setSubstationPositions(values[1]);
                network.setLinePositions(values[3]);
                dispatch(loadNetworkSuccess(network));
            });
    }

    function studyClicked(studyName) {
        resetStudy(studyName);
        history.push("/map");
        loadNetwork(studyName);
    }

    return (
        <ThemeProvider theme={dark ? darkTheme : lightTheme}>
            <React.Fragment>
                <CssBaseline />
                <TopBar />
                <Switch>
                    <Route exact path="/">
                        <StudyManager onStudyClick={ name => studyClicked(name) }/>
                    </Route>
                    <Route exact path="/map">
                        { network ? <NetworkPane /> : <Redirect to="/" /> }
                    </Route>
                </Switch>
            </React.Fragment>
        </ThemeProvider>
    )
};

export default App;
