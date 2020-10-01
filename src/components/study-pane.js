/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useHistory, useLocation, useParams } from 'react-router-dom';

import { FormattedMessage } from 'react-intl';

import { parse, stringify } from 'qs';

import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import NetworkExplorer from './network/network-explorer';
import NetworkMap from './network/network-map';
import SingleLineDiagram from './single-line-diagram';
import {
    connectNotificationsWebsocket,
    fetchGenerators,
    fetchLinePositions,
    fetchLines,
    fetchSubstationPositions,
    fetchSubstations,
    fetchThreeWindingsTransformers,
    fetchTwoWindingsTransformers,
    getVoltageLevelSingleLineDiagram,
    startLoadFlow,
    updateSwitchState,
} from '../utils/rest-api';
import {
    closeStudy,
    loadGeoDataSuccess,
    loadNetworkSuccess,
    openStudy,
    studyUpdated,
} from '../redux/actions';
import Network from './network/network';
import GeoData from './network/geo-data';
import NominalVoltageFilter from './network/nominal-voltage-filter';
import Button from '@material-ui/core/Button';
import PlayIcon from '@material-ui/icons/PlayArrow';
import { green } from '@material-ui/core/colors';
import Paper from '@material-ui/core/Paper';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import PageNotFound from './page-not-found';
import LoaderWithOverlay from './loader-with-overlay';
import PropTypes from 'prop-types';
import OverloadedLinesView from './network/overloadedLinesView';
import { LineFlowColorMode } from './network/line-layer';
import NetworkTable from './network/network-table';
import VoltageLevelChoice from './voltage_level_choice';

const useStyles = makeStyles((theme) => ({
    main: {
        position: 'absolute',
        width: '100%',
        height: 'calc(100vh - 56px)',
        [`${theme.breakpoints.up('xs')} and (orientation: landscape)`]: {
            height: 'calc(100vh - 48px)',
        },
        [theme.breakpoints.up('sm')]: {
            height: 'calc(100vh - 64px)',
        },
    },
    error: {
        padding: theme.spacing(2),
    },
}));

const loadFlowButtonStyles = makeStyles({
    root: {
        backgroundColor: green[500],
        '&:hover': {
            backgroundColor: green[700],
        },
    },
    label: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
});

const RunLoadFlowButton = (props) => {
    const loadFlowButtonClasses = loadFlowButtonStyles();

    const { loadFlowRunning, setLoadFlowRunning, studyName, userId } = props;

    useEffect(() => {
        if (loadFlowRunning) {
            startLoadFlow(studyName, userId)
                .then(() => {})
                .then(() => {
                    setLoadFlowRunning(false);
                });
        }
        // Note: setLoadFlowRunning, studyName and userId don't change
    }, [loadFlowRunning, setLoadFlowRunning, studyName, userId]);

    const handleClick = () => setLoadFlowRunning(true);

    return (
        <Button
            variant="contained"
            fullWidth={true}
            className={loadFlowButtonClasses.root}
            startIcon={<PlayIcon />}
            disabled={loadFlowRunning}
            onClick={!loadFlowRunning ? handleClick : null}
        >
            <div className={loadFlowButtonClasses.label}>
                <Typography noWrap>
                    {loadFlowRunning ? 'LoadFlow running…' : 'Start LoadFlow'}
                </Typography>
            </div>
        </Button>
    );
};

const INITIAL_POSITION = [0, 0];

export const StudyView = {
    MAP: 'Map',
    TABLE: 'Table',
    RESULTS: 'Results',
};

const StudyPane = (props) => {
    const studyName = decodeURIComponent(useParams().studyName);

    const userId = decodeURIComponent(useParams().userId);

    const network = useSelector((state) => state.network);

    const geoData = useSelector((state) => state.geoData);

    const useName = useSelector((state) => state.useName);

    const centerName = useSelector((state) => state.centerLabel);

    const diagonalName = useSelector((state) => state.diagonalLabel);

    const lineFullPath = useSelector((state) => state.lineFullPath);

    const lineParallelPath = useSelector((state) => state.lineParallelPath);

    const lineFlowMode = useSelector((state) => state.lineFlowMode);

    const lineFlowColorMode = useSelector((state) => state.lineFlowColorMode);

    const lineFlowAlertThreshold = useSelector((state) =>
        Number(state.lineFlowAlertThreshold)
    );

    const studyUpdatedForce = useSelector((state) => state.studyUpdated);

    const [studyNotFound, setStudyNotFound] = useState(false);

    const [displayedVoltageLevelId, setDisplayedVoltageLevelId] = useState(
        null
    );

    const [filteredNominalVoltages, setFilteredNominalVoltages] = useState([]);

    const [loadFlowRunning, setLoadFlowRunning] = useState(false);

    const [updateSwitchMsg, setUpdateSwitchMsg] = useState('');

    const [waitingLoadGeoData, setWaitingLoadGeoData] = useState(true);

    const [displayedSubstationId, setDisplayedSubstationId] = useState(null);

    const dispatch = useDispatch();

    const classes = useStyles();

    const location = useLocation();

    const history = useHistory();

    const websocketExpectedCloseRef = useRef();

    const [position, setPosition] = useState([-1, -1]);

    const loadNetwork = useCallback(() => {
        console.info(`Loading network of study '${studyName}'...`);

        const substations = fetchSubstations(studyName, userId);
        const lines = fetchLines(studyName, userId);
        const twoWindingsTransformers = fetchTwoWindingsTransformers(
            studyName,
            userId
        );
        const threeWindingsTransformers = fetchThreeWindingsTransformers(
            studyName,
            userId
        );
        const generators = fetchGenerators(studyName, userId);

        Promise.all([
            substations,
            lines,
            twoWindingsTransformers,
            threeWindingsTransformers,
            generators,
        ])
            .then((values) => {
                const network = new Network();
                network.setSubstations(values[0]);
                network.setLines(values[1]);
                network.setTwoWindingsTransformers(values[2]);
                network.setThreeWindingsTransformers(values[3]);
                network.setGenerators(values[4]);
                dispatch(loadNetworkSuccess(network));
            })
            .catch(function (error) {
                console.error(error.message);
                setStudyNotFound(true);
            });
        // Note: studyName and dispatch don't change
    }, [studyName, userId, dispatch]);

    const loadGeoData = useCallback(() => {
        console.info(`Loading geo data of study '${studyName}'...`);

        const substationPositions = fetchSubstationPositions(studyName, userId);

        const linePositions = fetchLinePositions(studyName, userId);

        Promise.all([substationPositions, linePositions])
            .then((values) => {
                const geoData = new GeoData();
                geoData.setSubstationPositions(values[0]);
                geoData.setLinePositions(values[1]);
                dispatch(loadGeoDataSuccess(geoData));
                setWaitingLoadGeoData(false);
            })
            .catch(function (error) {
                console.error(error.message);
                setStudyNotFound(true);
            });
        // Note: studyName and dispatch don't change
    }, [studyName, userId, dispatch]);

    const connectNotifications = useCallback(
        (studyName) => {
            console.info(`Connecting to notifications '${studyName}'...`);

            const ws = connectNotificationsWebsocket(studyName);
            ws.onmessage = function (event) {
                dispatch(studyUpdated(JSON.parse(event.data)));
            };
            ws.onclose = function (event) {
                if (!websocketExpectedCloseRef.current) {
                    console.error('Unexpected Notification WebSocket closed');
                }
            };
            ws.onerror = function (event) {
                console.error('Unexpected Notification WebSocket error', event);
            };
            return ws;
        },
        // Note: dispatch doesn't change
        [dispatch]
    );

    useEffect(() => {
        websocketExpectedCloseRef.current = false;
        dispatch(openStudy(studyName, userId));

        loadNetwork();
        loadGeoData();
        const ws = connectNotifications(studyName);

        // study cleanup at unmount event
        return function () {
            websocketExpectedCloseRef.current = true;
            ws.close();
            dispatch(closeStudy());
        };
        // Note: dispach, studyName, loadNetwork, loadGeoData,
        // connectNotifications don't change
    }, [
        dispatch,
        studyName,
        userId,
        loadNetwork,
        loadGeoData,
        connectNotifications,
    ]);

    // set single line diagram voltage level id, contained in url query parameters
    useEffect(() => {
        // parse query parameter
        const queryParams = parse(location.search, { ignoreQueryPrefix: true });
        const newVoltageLevelId = queryParams['voltageLevelId'];
        setDisplayedVoltageLevelId(
            newVoltageLevelId ? newVoltageLevelId : null
        );
    }, [location.search]);

    useEffect(() => {
        if (network) {
            setFilteredNominalVoltages(network.getNominalVoltages());
        } else {
            setFilteredNominalVoltages([]);
        }
    }, [network]);

    const showVoltageLevelDiagram = useCallback(
        (voltageLevelId) => {
            setUpdateSwitchMsg('');
            history.replace(
                '/' +
                    encodeURIComponent(userId) +
                    '/studies/' +
                    encodeURIComponent(studyName) +
                    stringify(
                        { voltageLevelId: voltageLevelId },
                        { addQueryPrefix: true }
                    )
            );
        },
        // Note: studyName and history don't change
        [studyName, userId, history]
    );

    const chooseVoltageLevelForSubstation = useCallback(
        (idSubstation, x, y) => {
            setDisplayedSubstationId(idSubstation);
            setPosition([x, y]);
        },
        []
    );

    function closeVoltageLevelDiagram() {
        history.replace(
            '/' +
                encodeURIComponent(userId) +
                '/studies/' +
                encodeURIComponent(studyName)
        );
    }

    const sldRef = useRef();
    const handleUpdateSwitchState = useCallback(
        (breakerId, open, switchElement) => {
            let eltOpen = switchElement.querySelector('.open');
            let eltClose = switchElement.querySelector('.closed');

            eltOpen.style.visibility = open ? 'visible' : 'hidden';
            eltClose.style.visibility = open ? 'hidden' : 'visible';

            updateSwitchState(studyName, userId, breakerId, open).then(
                (response) => {
                    if (!response.ok) {
                        console.error(response);
                        eltOpen.style.visibility = open ? 'hidden' : 'visible';
                        eltClose.style.visibility = open ? 'visible' : 'hidden';
                        setUpdateSwitchMsg(
                            response.status + ' : ' + response.statusText
                        );
                    }
                }
            );
        },
        [studyName, userId]
    );

    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            if (sldRef.current) {
                setUpdateSwitchMsg('');
                sldRef.current.reloadSvg();
            }
            if (
                studyUpdatedForce.eventData.headers['updateType'] === 'loadflow'
            ) {
                //TODO reload data more intelligently
                loadNetwork(studyName);
            }
        }
        // Note: studyName and loadNetwork don't change
    }, [studyUpdatedForce, studyName, loadNetwork]);

    const updateFilteredNominalVoltages = (vnoms, isToggle) => {
        // filter on nominal voltage
        let newFiltered;
        if (isToggle) {
            newFiltered = [...filteredNominalVoltages];
            vnoms.forEach((vnom) => {
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
    const centerSubstation = useCallback(
        (id) => {
            mapRef.current.centerSubstation(
                network.getVoltageLevel(id).substationId
            );
        },
        [mapRef, network]
    );

    function closeChoiceVoltageLevelMenu() {
        setDisplayedSubstationId(null);
    }

    function choiceVoltageLevel(voltageLevelId) {
        showVoltageLevelDiagram(voltageLevelId);
        closeChoiceVoltageLevelMenu();
    }

    function renderMapView() {
        let displayedVoltageLevel;
        if (network) {
            if (displayedVoltageLevelId) {
                displayedVoltageLevel = network.getVoltageLevel(
                    displayedVoltageLevelId
                );
            }
        }

        let displayedSubstation = null;
        if (network) {
            if (displayedSubstationId) {
                displayedSubstation = network.getSubstation(
                    displayedSubstationId
                );
            }
        }

        return (
            <Grid container direction="row" className={classes.main}>
                <Grid item xs={12} md={2}>
                    <AutoSizer>
                        {({ width, height }) => (
                            <div style={{ width: width, height: height }}>
                                <Grid container direction="column">
                                    <Grid item key="loadFlowButton">
                                        <div
                                            style={{
                                                position: 'relative',
                                                marginLeft: 8,
                                                marginRight: 8,
                                                marginTop: 8,
                                            }}
                                        >
                                            <RunLoadFlowButton
                                                studyName={studyName}
                                                userId={userId}
                                                loadFlowRunning={
                                                    loadFlowRunning
                                                }
                                                setLoadFlowRunning={
                                                    setLoadFlowRunning
                                                }
                                            />
                                        </div>
                                    </Grid>
                                    <Grid item key="explorer">
                                        <div
                                            style={{
                                                position: 'relative',
                                                height: height - 44,
                                            }}
                                        >
                                            <NetworkExplorer
                                                network={network}
                                                onVoltageLevelDisplayClick={
                                                    showVoltageLevelDiagram
                                                }
                                                onVoltageLevelFocusClick={
                                                    centerSubstation
                                                }
                                            />
                                        </div>
                                    </Grid>
                                </Grid>
                            </div>
                        )}
                    </AutoSizer>
                </Grid>
                <Grid item xs={12} md={10} key="map">
                    <div
                        style={{
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                        }}
                    >
                        <NetworkMap
                            network={network}
                            geoData={geoData}
                            labelsZoomThreshold={9}
                            arrowsZoomThreshold={7}
                            initialPosition={INITIAL_POSITION}
                            initialZoom={1}
                            filteredNominalVoltages={filteredNominalVoltages}
                            lineFullPath={lineFullPath}
                            lineParallelPath={lineParallelPath}
                            lineFlowMode={lineFlowMode}
                            lineFlowColorMode={lineFlowColorMode}
                            lineFlowAlertThreshold={lineFlowAlertThreshold}
                            ref={mapRef}
                            onSubstationClick={showVoltageLevelDiagram}
                            visible={props.view === StudyView.MAP}
                            onSubstationClickChooseVoltageLevel={
                                chooseVoltageLevelForSubstation
                            }
                        />
                        {displayedVoltageLevelId && (
                            <div
                                style={{
                                    position: 'absolute',
                                    left: 10,
                                    top: 10,
                                    zIndex: 1,
                                }}
                            >
                                <SingleLineDiagram
                                    onClose={() => closeVoltageLevelDiagram()}
                                    onNextVoltageLevelClick={
                                        showVoltageLevelDiagram
                                    }
                                    onBreakerClick={handleUpdateSwitchState}
                                    diagramTitle={
                                        useName && displayedVoltageLevel
                                            ? displayedVoltageLevel.name
                                            : displayedVoltageLevelId
                                    }
                                    svgUrl={getVoltageLevelSingleLineDiagram(
                                        studyName,
                                        userId,
                                        displayedVoltageLevelId,
                                        useName,
                                        centerName,
                                        diagonalName
                                    )}
                                    ref={sldRef}
                                    updateSwitchMsg={updateSwitchMsg}
                                />
                            </div>
                        )}

                        {network &&
                            lineFlowColorMode ===
                                LineFlowColorMode.OVERLOADS && (
                                <div
                                    style={{
                                        zIndex: 0,
                                        right: 45,
                                        top: 10,
                                        minWidth: '500px',
                                        position: 'absolute',
                                        height: '70%',
                                        opacity: '1',
                                        flex: 1,
                                        pointerEvents: 'none',
                                    }}
                                >
                                    <OverloadedLinesView
                                        lines={network.lines}
                                        lineFlowAlertThreshold={
                                            lineFlowAlertThreshold
                                        }
                                        network={network}
                                    />
                                </div>
                            )}

                        {displayedSubstationId && (
                            <VoltageLevelChoice
                                handleClose={closeChoiceVoltageLevelMenu}
                                onClickHandler={choiceVoltageLevel}
                                substation={displayedSubstation}
                                position={[position[0] + 200, position[1]]}
                            />
                        )}

                        {network && (
                            <div
                                style={{
                                    position: 'absolute',
                                    right: 10,
                                    bottom: 30,
                                    zIndex: 1,
                                }}
                            >
                                <NominalVoltageFilter
                                    nominalVoltages={network.getNominalVoltages()}
                                    filteredNominalVoltages={
                                        filteredNominalVoltages
                                    }
                                    onNominalVoltageFilterChange={
                                        updateFilteredNominalVoltages
                                    }
                                />
                            </div>
                        )}
                    </div>
                </Grid>
            </Grid>
        );
    }

    function renderTableView() {
        return (
            <Paper className={classes.main}>
                <NetworkTable network={network} />
            </Paper>
        );
    }

    function renderResultsView() {}

    if (studyNotFound) {
        return (
            <PageNotFound
                message={
                    <FormattedMessage
                        id="studyNotFound"
                        values={{ studyName: studyName }}
                    />
                }
            />
        );
    } else {
        return (
            <div>
                {waitingLoadGeoData && (
                    <LoaderWithOverlay
                        color="inherit"
                        loaderSize={70}
                        loadingMessageText="loadingGeoData"
                        loadingMessageSize={25}
                    />
                )}
                {/*Rendering the map is slow, do it once and keep it display:none*/}
                <div
                    style={{
                        display:
                            props.view === StudyView.MAP ? 'block' : 'none',
                    }}
                >
                    {renderMapView()}
                </div>
                <div
                    style={{
                        display:
                            props.view === StudyView.TABLE ? 'block' : 'none',
                    }}
                >
                    {renderTableView()}
                </div>
                <div
                    style={{
                        display:
                            props.view === StudyView.RESULTS ? 'block' : 'none',
                    }}
                >
                    {renderResultsView()}
                </div>
            </div>
        );
    }
};

StudyPane.defaultProps = {
    view: StudyView.MAP,
    lineFlowAlertThreshold: 100,
};

StudyPane.propTypes = {
    view: PropTypes.instanceOf(StudyView),
    lineFlowAlertThreshold: PropTypes.number.isRequired,
};

export default StudyPane;
