/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import {useDispatch, useSelector} from 'react-redux'
import {Redirect, Route, Switch, useHistory} from 'react-router-dom';

import {createMuiTheme, makeStyles, ThemeProvider} from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Box from '@material-ui/core/Box';
import Drawer from '@material-ui/core/Drawer';

import NetworkExplorer from './network/network-explorer';
import SingleLineDiagram from './single-line-diagram';
import NetworkMap from './network/network-map';
import StudyManager from './study-manager';
import Network from './network/network';
import TopBar from './top-bar';
import {
    loadNetworkSuccess,
    loadVoltageLevelDiagramSuccess,
    openStudy,
    removeVoltageLevelDiagram
} from '../redux/actions'
import {
    fetchLinePositions,
    fetchLines,
    fetchSubstationPositions,
    fetchSubstations,
    fetchVoltageLevelDiagram
} from '../utils/rest-api'

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

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
    },
    grow: {
        flexGrow: 1,
    },
    toolbar: theme.mixins.toolbar,
    main: {
        flexGrow: 1,
        position: "absolute",
        width:"100%",
        height: 'calc(100vh - 56px)',
        [`${theme.breakpoints.up('xs')} and (orientation: landscape)`]: {
            height: 'calc(100vh - 48px)'
        },
        [theme.breakpoints.up('sm')]: {
            height: 'calc(100vh - 64px)'
        },
        bgcolor: "background.default"
    }
}));

const App = () => {

    const dispatch = useDispatch();

    const openedStudyName = useSelector(state => state.openedStudyName);

    const network = useSelector(state => state.network);

    const diagram = useSelector(state => state.diagram);

    const dark = useSelector(state => state.darkTheme);

    const useName = useSelector(state => state.useName);

    const history = useHistory();

    const classes = useStyles();

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

    function showVoltageLevelDiagram(voltageLevelId, voltageLevelName) {
        // load svg
        fetchVoltageLevelDiagram(openedStudyName, voltageLevelId, useName)
            .then(svg => {
                dispatch(loadVoltageLevelDiagramSuccess(voltageLevelId, svg, voltageLevelName));
            });
    }

    function createNetworkPane() {
        return (
            <div>
                <Drawer className={classes.drawer} classes={{ paper: classes.drawerPaper }} variant="permanent" anchor="left">
                    { /* to force drawer content to start below appbar */ }
                    <div className={classes.toolbar} />
                    <NetworkExplorer network={network}
                                     onSubstationClick={ (id, name) => showVoltageLevelDiagram(id, name) }/>
                </Drawer>
                <NetworkMap network={ network }
                            labelsZoomThreshold={8}
                            initialPosition={[2.5, 46.6]}
                            initialZoom={6}
                            onSubstationClick={ (id, name) => showVoltageLevelDiagram(id, name) } />
                {
                    diagram &&
                    <div style={{ position: "absolute", left: 250, top: 10, zIndex: 1 }}>
                        <SingleLineDiagram diagramId={useName ? diagram.name : diagram.id} svg={ diagram.svg } />
                    </div>
                }
            </div>
        )
    }

    function createApp() {
        return (
            <Box className={classes.main}>
                <Switch>
                    <Route exact path="/">
                        <StudyManager onStudyClick={ name => studyClicked(name) }/>
                    </Route>
                    <Route exact path="/map">
                        { network ? createNetworkPane() : <Redirect to="/" /> }
                    </Route>
                </Switch>
            </Box>
        )
    }

    return (
        <ThemeProvider theme={dark ? darkTheme : lightTheme}>
            <React.Fragment>
                <CssBaseline />
                    <TopBar />
                { createApp() }
            </React.Fragment>
        </ThemeProvider>
    )
};

export default App;
