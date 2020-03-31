/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {useEffect, useState, useCallback} from "react";

import {useDispatch, useSelector} from "react-redux";

import {useHistory, useLocation, useParams} from 'react-router-dom';

import {FormattedMessage} from "react-intl";

import {parse, stringify} from "qs";

import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import {makeStyles} from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

import NetworkExplorer from "./network/network-explorer";
import NetworkMap from "./network/network-map";
import SingleLineDiagram from "./single-line-diagram";
import {
    fetchLinePositions,
    fetchLines,
    fetchSubstationPositions,
    fetchSubstations,
    getVoltageLevelSingleLineDiagram
} from "../utils/rest-api";
import {closeStudy, loadGeoDataSuccess, loadNetworkSuccess, openStudy} from "../redux/actions";
import Network from "./network/network";
import GeoData from "./network/geo-data";
import NominalVoltageFilter from "./network/nominal-voltage-filter";

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
    },
    error: {
        padding: theme.spacing(2)
    },
}));

const StudyNotFound = (props) => {

    const classes = useStyles();

    return (
        <Container maxWidth="sm" className={classes.error}>
            <Typography variant="h5">
                <FormattedMessage id="studyNotFound" values={ {"studyName": props.studyName} }/>
            </Typography>
        </Container>
    );
};

const INITIAL_POSITION = [2.5, 46.6];

const StudyPane = () => {

    const { studyName } = useParams();

    const network = useSelector(state => state.network);

    const geoData = useSelector(state => state.geoData);

    const useName = useSelector(state => state.useName);

    const [studyNotFound, setStudyNotFound] = useState(false);

    const [voltageLevelId, setVoltageLevelId] = useState(null);

    const [filteredNominalVoltages, setFilteredNominalVoltages] = useState([]);

    const dispatch = useDispatch();

    const classes = useStyles();

    const location = useLocation();

    const history = useHistory();

    // study creation, network and geo data loading: will be called only one time at creation mount event because
    // studyName won't change
    useEffect(() => {
        dispatch(openStudy(studyName));

        loadNetwork(studyName);
        loadGeoData(studyName);

        // study cleanup at unmount event
        return function () {
            dispatch(closeStudy());
        }
    }, [studyName]);

    // set single line diagram voltage level id, contained in url query parameters
    useEffect(() => {
        // parse query parameter
        const queryParams = parse(location.search, { ignoreQueryPrefix: true });
        const newVoltageLevelId = queryParams["voltageLevelId"];
        setVoltageLevelId(newVoltageLevelId ? newVoltageLevelId : null);
    }, [location.search]);

    useEffect(() => {
        if (network) {
            setFilteredNominalVoltages(network.getNominalVoltages());
        } else {
            setFilteredNominalVoltages([]);
        }
    }, [network]);

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
            })
            .catch(function(error) {
                console.error(error.message);
                setStudyNotFound(true);
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
            })
            .catch(function(error) {
                console.error(error.message);
                setStudyNotFound(true);
            });
    }

    const showVoltageLevelDiagram = useCallback((voltageLevelId) => {
        history.replace("/studies/" + studyName + stringify({ voltageLevelId: voltageLevelId }, { addQueryPrefix: true }));
    }, []);

    function closeVoltageLevelDiagram() {
        history.replace("/studies/" + studyName)
    }

    const filterNominalVoltage = useCallback((vnom) => {
        // filter on nominal voltage
        const currentIndex = filteredNominalVoltages.indexOf(vnom);
        const newFiltered = [...filteredNominalVoltages];
        if (currentIndex === -1) {
            newFiltered.push(vnom);
        } else {
            newFiltered.splice(currentIndex, 1);
        }
        setFilteredNominalVoltages(newFiltered);
    }, [filteredNominalVoltages, setFilteredNominalVoltages]);

    if (studyNotFound) {
        return <StudyNotFound studyName={studyName}/>;
    } else {
        let voltageLevel = null;
        if (voltageLevelId && network) {
            voltageLevel = network.getVoltageLevel(voltageLevelId);
        }
        return (
            <Grid container className={classes.main}>
                <Grid item xs={12} md={2} key="explorer">
                    <NetworkExplorer network={network}
                                     onVoltageLevelClick={showVoltageLevelDiagram}/>
                </Grid>
                <Grid item xs={12} md={10} key="map">
                    <div style={{position:"relative", width:"100%", height: "100%"}}>
                        <NetworkMap network={network}
                                    geoData={geoData}
                                    labelsZoomThreshold={8}
                                    initialPosition={INITIAL_POSITION}
                                    initialZoom={6}
                                    filteredNominalVoltages={filteredNominalVoltages}
                                    onSubstationClick={showVoltageLevelDiagram} />
                        {
                            voltageLevelId &&
                            <div style={{ position: "absolute", left: 10, top: 10, zIndex: 1 }}>
                                <SingleLineDiagram onClose={() => closeVoltageLevelDiagram()}
                                                   onNextVoltageLevelClick={showVoltageLevelDiagram}
                                                   diagramTitle={useName && voltageLevel ? voltageLevel.name : voltageLevelId}
                                                   svgUrl={getVoltageLevelSingleLineDiagram(studyName, voltageLevelId, useName)} />
                            </div>
                        }
                        {
                            network &&
                            <div style={{position: "absolute", right: 10, bottom: 30, zIndex: 1}}>
                                <NominalVoltageFilter nominalVoltages={network.getNominalVoltages()}
                                                      filteredNominalVoltages={filteredNominalVoltages}
                                                      onNominalVoltageFilter={filterNominalVoltage} />
                            </div>
                        }
                </div>
            </Grid>
        </Grid>
        );
    }
};

export default StudyPane;
