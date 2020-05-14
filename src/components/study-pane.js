/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {useEffect, useRef, useState, useCallback} from "react";

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
    fetchSubstations, fetchSvg,
    getVoltageLevelSingleLineDiagram,
    updateSwitchState
} from "../utils/rest-api";
import {closeStudy, loadGeoDataSuccess, loadNetworkSuccess, openStudy} from "../redux/actions";
import Network from "./network/network";
import GeoData from "./network/geo-data";
import NominalVoltageFilter from "./network/nominal-voltage-filter";
import Button from "@material-ui/core/Button";
import PlayIcon from "@material-ui/icons/PlayArrow";

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

const INITIAL_POSITION = [0, 0];

const StudyPane = () => {

    const { studyName } = useParams();

    const network = useSelector(state => state.network);

    const geoData = useSelector(state => state.geoData);

    const useName = useSelector(state => state.useName);

    const centerName = useSelector( state => state.centerLabel);

    const diagonalName = useSelector( state => state.diagonalLabel);

    const topologicalColoring = useSelector( state => state.topologicalColoring);

    const lineFullPath = useSelector( state => state.lineFullPath);

    const lineFlowMode = useSelector( state => state.lineFlowMode);

    const [studyNotFound, setStudyNotFound] = useState(false);

    const [displayedVoltageLevelId, setDisplayedVoltageLevelId] = useState(null);

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
        setDisplayedVoltageLevelId(newVoltageLevelId ? newVoltageLevelId : null);
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

    const sldRef = useRef();
    const handleUpdateSwitchState = useCallback( (breakerId, open) => {
        updateSwitchState(studyName, breakerId, open).then( response => {
            if (response.ok) {
                sldRef.current.reloadSvg();
            }
            else {
                console.error(response);
            }
        });
    }, [studyName]);

    const updateFilteredNominalVoltages = (vnoms, isToggle) => {
        // filter on nominal voltage
        let newFiltered;
        if (isToggle) {
            newFiltered = [...filteredNominalVoltages];
            vnoms.map((vnom) => {
                const currentIndex = filteredNominalVoltages.indexOf(vnom);
                if (currentIndex === -1) {
                    newFiltered.push(vnom);
                } else {
                    newFiltered.splice(currentIndex, 1);
                }
            });
        } else {
            newFiltered = [...vnoms];
        }
        setFilteredNominalVoltages(newFiltered);
    };

    const mapRef = useRef();
    const centerSubstation = useCallback((id)=> {
        mapRef.current.centerSubstation(network.getVoltageLevel(id).substationId);
    }, [mapRef, network]);

    if (studyNotFound) {
        return <StudyNotFound studyName={studyName}/>;
    } else {
        let displayedVoltageLevel, focusedVoltageLevel = null;
        if (network) {
            if (displayedVoltageLevelId) {
                displayedVoltageLevel = network.getVoltageLevel(displayedVoltageLevelId);
            }
        }
        return (
            <Grid container className={classes.main}>
                <Grid container direction='column' xs={12} md={2} >
                    <Grid item key="loadFlowButton">
                        <Button
                            variant="contained"
                            fullWidth={true}
                            color="secondary"
                            className={classes.button}
                            startIcon={<PlayIcon />}
                        >
                            Start LoadFlow
                        </Button>
                    </Grid>
                    <Grid item key="explorer">
                        <NetworkExplorer network={network}
                                         onVoltageLevelDisplayClick={showVoltageLevelDiagram}
                                         onVoltageLevelFocusClick={centerSubstation} />
                    </Grid>
                </Grid>
                <Grid item xs={12} md={10} key="map">
                    <div style={{position:"relative", width:"100%", height: "100%"}}>
                        <NetworkMap network={network}
                                    geoData={geoData}
                                    labelsZoomThreshold={9}
                                    arrowZoomThreshold={6}
                                    initialPosition={INITIAL_POSITION}
                                    initialZoom={1}
                                    filteredNominalVoltages={filteredNominalVoltages}
                                    lineFullPath={lineFullPath}
                                    lineFlowMode={lineFlowMode}
                                    ref={mapRef}
                                    onSubstationClick={showVoltageLevelDiagram} />
                        {
                            displayedVoltageLevelId &&
                            <div style={{ position: "absolute", left: 10, top: 10, zIndex: 1 }}>
                                <SingleLineDiagram onClose={() => closeVoltageLevelDiagram()}
                                                   onNextVoltageLevelClick={showVoltageLevelDiagram}
                                                   onBreakerClick={handleUpdateSwitchState}
                                                   diagramTitle={useName && displayedVoltageLevel ? displayedVoltageLevel.name : displayedVoltageLevelId}
                                                   svgUrl={getVoltageLevelSingleLineDiagram(studyName, displayedVoltageLevelId, useName, centerName, diagonalName, topologicalColoring)}
                                                   ref={sldRef} />

                            </div>
                        }
                        {
                            network &&
                            <div style={{position: "absolute", right: 10, bottom: 30, zIndex: 1}}>
                                <NominalVoltageFilter nominalVoltages={network.getNominalVoltages()}
                                                      filteredNominalVoltages={filteredNominalVoltages}
                                                      onNominalVoltageFilterChange={updateFilteredNominalVoltages}/>
                            </div>
                        }
                </div>
            </Grid>
        </Grid>
        );
    }
};

export default StudyPane;
