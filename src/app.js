/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import {useDispatch, useSelector} from 'react-redux'
import {Redirect, Route, Switch, useHistory} from 'react-router-dom';
import {FormattedMessage} from 'react-intl';

import {createMuiTheme, makeStyles, ThemeProvider} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import BrightnessHighIcon from '@material-ui/icons/BrightnessHigh';
import BrightnessLowIcon from '@material-ui/icons/BrightnessLow';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import Drawer from '@material-ui/core/Drawer';

import NetworkExplorer from './network-explorer';
import SingleLineDiagram from './single-line-diagram';
import NetworkMap from './network-map';
import StudyManager from './study-manager';
import Network from './network';
import {ReactComponent as PowsyblLogo} from './images/powsybl_logo.svg';
import {
    loadNetworkSuccess,
    loadVoltageLevelDiagramSuccess,
    openStudy,
    removeVoltageLevelDiagram,
    selectDarkTheme
} from './actions'
import {fetchLines, fetchSubstationPositions, fetchSubstations, fetchVoltageLevelDiagram} from './rest-api'

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
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
    },
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
    logo: {
        width: 48,
        height: 48,
    },
    title: {
        marginLeft: 18
    },
    grid: {
        flexGrow: 1,
        paddingLeft: theme.spacing(2),
        bgcolor: "background.default"
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

    const history = useHistory();

    const classes = useStyles();

    function switchTheme() {
        dispatch(selectDarkTheme(!dark));
    }

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

        Promise.all([substations, substationPositions, lines])
            .then(values => {
                const network = new Network();
                network.setSubstations(values[0]);
                network.setLines(values[2]);
                network.setSubstationPositions(values[1]);
                dispatch(loadNetworkSuccess(network));
            });
    }

    function studyClicked(studyName) {
        resetStudy(studyName);
        history.push("/map");
        loadNetwork(studyName);
    }

    function showVoltageLevelDiagram(voltageLevelId) {
        // load svg
        fetchVoltageLevelDiagram(openedStudyName, voltageLevelId)
            .then(svg => {
                dispatch(loadVoltageLevelDiagramSuccess(voltageLevelId, svg));
            });
    }

    function createAppBar() {
        return (
            <AppBar position="static" color="default" className={classes.appBar}>
                <Toolbar>
                    <PowsyblLogo className={classes.logo}/>
                    <Typography variant="h6" className={classes.title}>
                        <FormattedMessage id="appName"/>
                    </Typography>
                    <div className={classes.grow} />
                    <IconButton aria-label="Change theme" color="inherit" onClick={() => switchTheme()}>
                        { dark ? <BrightnessLowIcon /> : <BrightnessHighIcon /> }
                    </IconButton>
                </Toolbar>
            </AppBar>
        )
    }

    function createNetworkPane() {
        return (
            <div>
                <Drawer className={classes.drawer} classes={{ paper: classes.drawerPaper }} variant="permanent" anchor="left">
                    { /* to force drawer content to start below appbar */ }
                    <div className={classes.toolbar} />
                    <NetworkExplorer network={ network }
                                     onSubstationClick={ id => showVoltageLevelDiagram(id) }/>
                </Drawer>
                <NetworkMap network={ network }
                            labelsZoomThreshold={8}
                            initialPosition={[2.5, 46.6]}
                            initialZoom={6}
                            onSubstationClick={ id => showVoltageLevelDiagram(id) } />
                {
                    diagram &&
                    <div style={{ position: "absolute", left: 250, top: 10, zIndex: 1 }}>
                        <SingleLineDiagram diagramId={diagram.id} svg={ diagram.svg } />
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
                { createAppBar() }
                { createApp() }
            </React.Fragment>
        </ThemeProvider>
    )
};

export default App;
