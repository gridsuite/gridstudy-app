/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {useEffect} from "react";

import {useDispatch, useSelector} from "react-redux";

import {useRouteMatch} from 'react-router-dom';

import Grid from "@material-ui/core/Grid";
import {makeStyles} from "@material-ui/core/styles";

import NetworkExplorer from "./network/network-explorer";
import NetworkMap from "./network/network-map";
import SingleLineDiagram from "./single-line-diagram";
import {
    fetchLinePositions,
    fetchLines,
    fetchSubstationPositions,
    fetchSubstations,
    fetchVoltageLevelDiagram
} from "../utils/rest-api";
import {
    closeStudy,
    loadGeoDataSuccess,
    loadNetworkSuccess,
    loadVoltageLevelDiagramSuccess,
    openStudy,
    removeVoltageLevelDiagram
} from "../redux/actions";
import Network from "./network/network";
import GeoData from "./network/geo-data";

const useStyles = makeStyles(theme => ({
    main: {
        position: "absolute",
        width:"100%",
        height: 'calc(100vh - 56px)',
        [`${theme.breakpoints.up('xs')} and (orientation: landscape)`]: {
            height: 'calc(100vh - 48px)'
        },
        [theme.breakpoints.up('sm')]: {
            height: 'calc(100vh - 64px)'
        },
    }
}));

const StudyPane = () => {

    const dispatch = useDispatch();

    const study = useSelector(state => state.study);

    const useName = useSelector(state => state.useName);

    const classes = useStyles();

    const match = useRouteMatch("/studies/:studyName");
    const studyName = match.params.studyName;

    useEffect(() => {
        dispatch(openStudy(studyName));
        loadNetwork(studyName);
        loadGeoData(studyName);

        return function () {
            dispatch(closeStudy());
        }
    }, [studyName]);

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

    function showVoltageLevelDiagram(voltageLevelId, voltageLevelName) {
        // load svg
        fetchVoltageLevelDiagram(study.name, voltageLevelId, useName)
            .then(svg => {
                dispatch(loadVoltageLevelDiagramSuccess(voltageLevelId, voltageLevelName, svg));
            });
    }

    function closeVoltageLevelDiagram() {
        dispatch(removeVoltageLevelDiagram());
    }

    return (
        study &&
        <Grid container className={classes.main}>
            <Grid item xs={12} md={2} key="explorer">
                <NetworkExplorer network={study.network}
                                 onVoltageLevelClick={ (id, name) => showVoltageLevelDiagram(id, name) }/>
            </Grid>
            <Grid item xs={12} md={10} key="map">
                <div style={{position:"relative", width:"100%", height: "100%"}}>
                    <NetworkMap network={study.network}
                                geoData={study.geoData}
                                labelsZoomThreshold={8}
                                initialPosition={[2.5, 46.6]}
                                initialZoom={6}
                                onSubstationClick={ (id, name) => showVoltageLevelDiagram(id, name) } />
                    {
                        study.diagram &&
                        <div style={{ position: "absolute", left: 10, top: 10, zIndex: 1 }}>
                            <SingleLineDiagram onClose={() => closeVoltageLevelDiagram()}
                                               diagramTitle={useName ? study.diagram.name : study.diagram.id}
                                               svg={ study.diagram.svg } />
                        </div>
                    }
                </div>
            </Grid>
        </Grid>
    );
};

export default StudyPane;