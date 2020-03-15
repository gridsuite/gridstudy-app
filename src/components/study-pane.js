/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {useEffect, useState} from "react";

import {useDispatch, useSelector} from "react-redux";

import {useHistory, useLocation, useParams} from 'react-router-dom';

import {parse, stringify} from "qs";

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
    fetchVoltageLevelSingleLineDiagram
} from "../utils/rest-api";
import {
    addVoltageLevelSingleLineDiagram,
    closeStudy,
    loadGeoDataSuccess,
    loadNetworkSuccess,
    openStudy,
    removeVoltageLevelSingleLineDiagram
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

    const voltageLevelId = useSelector(state => state.study ? state.study.singleLineDiagram.voltageLevelId : null);

    const useName = useSelector(state => state.useName);

    const [svg, setSvg] = useState(null);

    const [init, setInit] = useState(false);

    const classes = useStyles();

    const { studyName } = useParams();

    const location = useLocation();

    const history = useHistory();

    useEffect(() => {
        dispatch(openStudy(studyName));
        loadNetwork(studyName);
        loadGeoData(studyName);

        return function () {
            dispatch(closeStudy());
        }
    }, [studyName]);

    useEffect(() => {
        if (voltageLevelId) {
            history.replace("/studies/" + studyName + stringify({ voltageLeveLId: voltageLevelId }, { addQueryPrefix: true }))

            // load svg
            fetchVoltageLevelSingleLineDiagram(studyName, voltageLevelId, useName)
                .then(svg => {
                    setSvg(svg);
                });
        } else {
            if (init) {
                setSvg(null);
            } else {
                setInit(true);

                // set voltage level single line diagram coming from query parameter
                const queryParams = parse(location.search, { ignoreQueryPrefix: true });
                const initialVoltageLevelId = queryParams["voltageLeveLId"];
                if (initialVoltageLevelId) {
                    dispatch(addVoltageLevelSingleLineDiagram(initialVoltageLevelId));
                }
            }
        }
    }, [voltageLevelId, useName]);

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

    function showVoltageLevelDiagram(voltageLevelId) {
        dispatch(addVoltageLevelSingleLineDiagram(voltageLevelId));
    }

    function closeVoltageLevelDiagram() {
        history.replace("/studies/" + studyName)
        dispatch(removeVoltageLevelSingleLineDiagram());
    }

    function getDiagramTitle() {
        return useName ? study.network.getVoltageLevel(study.singleLineDiagram.voltageLevelId).name
                       : study.singleLineDiagram.voltageLevelId;
    }

    return (
        study &&
        <Grid container className={classes.main}>
            <Grid item xs={12} md={2} key="explorer">
                <NetworkExplorer network={study.network}
                                 onVoltageLevelClick={ id => showVoltageLevelDiagram(id) }/>
            </Grid>
            <Grid item xs={12} md={10} key="map">
                <div style={{position:"relative", width:"100%", height: "100%"}}>
                    <NetworkMap network={study.network}
                                geoData={study.geoData}
                                labelsZoomThreshold={8}
                                initialPosition={[2.5, 46.6]}
                                initialZoom={6}
                                onSubstationClick={ id => showVoltageLevelDiagram(id) } />
                    {
                        voltageLevelId &&
                        svg &&
                        <div style={{ position: "absolute", left: 10, top: 10, zIndex: 1 }}>
                            <SingleLineDiagram onClose={() => closeVoltageLevelDiagram()}
                                               diagramTitle={getDiagramTitle()}
                                               svg={ svg } />
                        </div>
                    }
                </div>
            </Grid>
        </Grid>
    );
};

export default StudyPane;
