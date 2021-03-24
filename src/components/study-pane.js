/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useHistory, useLocation, useParams } from 'react-router-dom';

import { FormattedMessage, useIntl } from 'react-intl';

import { parse, stringify } from 'qs';
import { makeStyles } from '@material-ui/core/styles';

import NetworkExplorer from './network/network-explorer';
import NetworkMap from './network/network-map';
import SingleLineDiagram, { SvgType } from './single-line-diagram';
import {
    connectNotificationsWebsocket,
    fetchAllEquipments,
    fetchGenerators,
    fetchLinePositions,
    fetchLines,
    fetchSecurityAnalysisResult,
    fetchSecurityAnalysisStatus,
    fetchStudy,
    fetchSubstationPositions,
    fetchSubstations,
    fetchThreeWindingsTransformers,
    fetchTwoWindingsTransformers,
    fetchLoads,
    fetchDanglingLines,
    fetchBatteries,
    fetchHvdcLines,
    fetchLccConverterStations,
    fetchVscConverterStations,
    fetchShuntCompensators,
    fetchStaticVarCompensators,
    getSubstationSingleLineDiagram,
    getVoltageLevelSingleLineDiagram,
    startLoadFlow,
    startSecurityAnalysis,
    stopSecurityAnalysis,
    updateSwitchState,
} from '../utils/rest-api';
import {
    closeStudy,
    filteredNominalVoltagesUpdated,
    increaseResultCount,
    loadGeoDataSuccess,
    loadNetworkSuccess,
    openStudy,
    selectItemNetwork,
    studyUpdated,
} from '../redux/actions';
import Network from './network/network';
import GeoData from './network/geo-data';
import NominalVoltageFilter from './network/nominal-voltage-filter';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import PageNotFound from './page-not-found';
import LoaderWithOverlay from './loader-with-overlay';
import PropTypes from 'prop-types';
import OverloadedLinesView from './network/overloaded-lines-view';
import NetworkTable from './network/network-table';
import VoltageLevelChoice from './voltage-level-choice';
import RunButton, { RunningStatus } from './run-button';
import ContingencyListSelector from './contingency-list-selector';
import PlayIcon from '@material-ui/icons/PlayArrow';
import DoneIcon from '@material-ui/icons/Done';
import LoopIcon from '@material-ui/icons/Loop';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import SecurityAnalysisResult from './security-analysis-result';
import LoadFlowResult from './loadflow-result';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import clsx from 'clsx';
import Divider from '@material-ui/core/Divider';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { RemoteRessourceHandler } from './util/remote-ressource-handler';

const drawerWidth = 300;

const useStyles = makeStyles((theme) => ({
    map: {
        display: 'flex',
        flexDirection: 'row',
    },
    table: {
        display: 'flex',
        flexDirection: 'column',
    },
    error: {
        padding: theme.spacing(2),
    },
    rotate: {
        animation: 'spin 1000ms infinite',
    },
    '@global': {
        '@keyframes spin': {
            '0%': {
                transform: 'rotate(0deg)',
            },
            '100%': {
                transform: 'rotate(-360deg)',
            },
        },
    },
    drawer: {
        width: drawerWidth,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    drawerPaper: {
        position: 'static',
        overflow: 'hidden',
    },
    drawerShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: -drawerWidth,
    },
    mapCtrlBottomLeft: {
        '& .mapboxgl-ctrl-bottom-left': {
            transition: theme.transitions.create('left', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
        },
    },
    mapCtrlBottomLeftShift: {
        '& .mapboxgl-ctrl-bottom-left': {
            transition: theme.transitions.create('left', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            left: drawerWidth,
        },
    },
}));

const INITIAL_POSITION = [0, 0];

export const StudyView = {
    MAP: 'Map',
    SPREADSHEET: 'Spreadsheet',
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
    const [substationsLoaded, setSubstationsLoaded] = useState(false);

    const lineFlowAlertThreshold = useSelector((state) =>
        Number(state.lineFlowAlertThreshold)
    );

    const substationLayout = useSelector((state) => state.substationLayout);

    const studyUpdatedForce = useSelector((state) => state.studyUpdated);

    const displayOverloadTable = useSelector(
        (state) => state.displayOverloadTable
    );

    const [studyNotFound, setStudyNotFound] = useState(false);

    const [updatedLines, setUpdatedLines] = useState([]);

    const [displayedVoltageLevelId, setDisplayedVoltageLevelId] = useState(
        null
    );

    const filteredNominalVoltages = useSelector(
        (state) => state.filteredNominalVoltages
    );

    const [displayedSubstationId, setDisplayedSubstationId] = useState(null);

    const [loadFlowStatus, setLoadFlowStatus] = useState(RunningStatus.IDLE);

    const [loadFlowResult, setLoadFlowResult] = useState(null);

    const [securityAnalysisStatus, setSecurityAnalysisStatus] = useState(
        RunningStatus.IDLE
    );

    const [securityAnalysisResult, setSecurityAnalysisResult] = useState(null);

    const [computationStopped, setComputationStopped] = useState(false);

    const [updateSwitchMsg, setUpdateSwitchMsg] = useState('');

    const [waitingLoadGeoData, setWaitingLoadGeoData] = useState(true);

    const [drawerOpen, setDrawerOpen] = useState(true);

    const [
        choiceVoltageLevelsSubstationId,
        setChoiceVoltageLevelsSubstationId,
    ] = useState(null);

    const [tabIndex, setTabIndex] = React.useState(0);

    const [
        showContingencyListSelector,
        setShowContingencyListSelector,
    ] = useState(false);

    const [visibleSubstation, setVisibleSubstation] = useState(null);

    const dispatch = useDispatch();

    const classes = useStyles();

    const location = useLocation();

    const history = useHistory();

    const websocketExpectedCloseRef = useRef();

    const intl = useIntl();

    const Runnable = {
        LOADFLOW: intl.formatMessage({ id: 'LoadFlow' }),
        SECURITY_ANALYSIS: intl.formatMessage({ id: 'SecurityAnalysis' }),
    };

    const RUNNABLES = [Runnable.LOADFLOW, Runnable.SECURITY_ANALYSIS];

    function getLoadFlowRunningStatus(lfStatus) {
        switch (lfStatus) {
            case 'CONVERGED':
                return RunningStatus.SUCCEED;
            case 'DIVERGED':
                return RunningStatus.FAILED;
            case 'RUNNING':
                return RunningStatus.RUNNING;
            case 'NOT_DONE':
                return RunningStatus.IDLE;
            default:
                return RunningStatus.IDLE;
        }
    }

    const updateLoadFlowResult = useCallback(() => {
        fetchStudy(studyName, userId).then((study) => {
            setLoadFlowStatus(getLoadFlowRunningStatus(study.loadFlowStatus));
            setLoadFlowResult(study.loadFlowResult);
        });
    }, [studyName, userId]);

    function getSecurityAnalysisRunningStatus(securityAnalysisStatus) {
        switch (securityAnalysisStatus) {
            case 'COMPLETED':
                return RunningStatus.SUCCEED;
            case 'RUNNING':
                return RunningStatus.RUNNING;
            case 'NOT_DONE':
                return RunningStatus.IDLE;
            default:
                return RunningStatus.IDLE;
        }
    }

    const updateSecurityAnalysisStatus = useCallback(() => {
        fetchSecurityAnalysisStatus(studyName, userId).then((status) => {
            setSecurityAnalysisStatus(getSecurityAnalysisRunningStatus(status));
        });
    }, [studyName, userId]);

    const updateSecurityAnalysisResult = useCallback(() => {
        setSecurityAnalysisResult(
            new RemoteRessourceHandler(() =>
                fetchSecurityAnalysisResult(studyName, userId)
            )
        );
    }, [studyName, userId]);

    const handleStartSecurityAnalysis = (contingencyListNames) => {
        // close the contingency list selection window
        setShowContingencyListSelector(false);

        setComputationStopped(false);

        // start server side security analysis
        startSecurityAnalysis(studyName, userId, contingencyListNames);

        // clean result
        setSecurityAnalysisResult(null);
    };

    const startComputation = (runnable) => {
        if (runnable === Runnable.LOADFLOW) {
            startLoadFlow(studyName, userId);
        } else if (runnable === Runnable.SECURITY_ANALYSIS) {
            setShowContingencyListSelector(true);
        }
    };

    const ACTION_ON_RUNNABLES = {
        text: intl.formatMessage({ id: 'StopComputation' }),
        action: (runnable) => {
            if (runnable === Runnable.SECURITY_ANALYSIS) {
                stopSecurityAnalysis(studyName, userId);
                setComputationStopped(!computationStopped);
            }
        },
    };

    const getRunningStatus = (runnable) => {
        if (runnable === Runnable.LOADFLOW) {
            return loadFlowStatus;
        } else if (runnable === Runnable.SECURITY_ANALYSIS) {
            return securityAnalysisStatus;
        }
    };

    const isComputationRunning = () => {
        return RUNNABLES.some(function (runnable) {
            return getRunningStatus(runnable) === RunningStatus.RUNNING;
        });
    };

    const getRunningText = (runnable, status) => {
        return runnable;
    };

    const getRunningIcon = (status) => {
        switch (status) {
            case RunningStatus.RUNNING:
                return <LoopIcon className={classes.rotate} />;
            case RunningStatus.SUCCEED:
                return <DoneIcon />;
            case RunningStatus.FAILED:
                return <ErrorOutlineIcon />;
            case RunningStatus.IDLE:
            default:
                return <PlayIcon />;
        }
    };

    const [position, setPosition] = useState([-1, -1]);

    const loadNetwork = useCallback(
        (isUpdate) => {
            console.info(`Loading network of study '${studyName}'...`);
            updateLoadFlowResult();
            updateSecurityAnalysisResult();
            updateSecurityAnalysisStatus();
            if (!isUpdate) {
                const network = new Network(
                    () => fetchSubstations(studyName, userId),
                    () => fetchLines(studyName, userId),
                    () => fetchTwoWindingsTransformers(studyName, userId),
                    () => fetchThreeWindingsTransformers(studyName, userId),
                    () => fetchGenerators(studyName, userId),
                    () => fetchLoads(studyName, userId),
                    () => fetchBatteries(studyName, userId),
                    () => fetchDanglingLines(studyName, userId),
                    () => fetchHvdcLines(studyName, userId),
                    () => fetchLccConverterStations(studyName, userId),
                    () => fetchVscConverterStations(studyName, userId),
                    () => fetchShuntCompensators(studyName, userId),
                    () => fetchStaticVarCompensators(studyName, userId),
                    (error) => {
                        console.error(error.message);
                        setStudyNotFound(true);
                    }
                );
                dispatch(loadNetworkSuccess(network));
            }
        },
        [
            studyName,
            userId,
            dispatch,
            updateLoadFlowResult,
            updateSecurityAnalysisResult,
            updateSecurityAnalysisStatus,
        ]
    );

    const updateNetwork = useCallback(
        (substationsIds) => {
            const updatedEquipments = fetchAllEquipments(
                studyName,
                userId,
                substationsIds
            );
            console.info('network update');
            Promise.all([updatedEquipments])
                .then((values) => {
                    network.updateSubstations(values[0].substations);
                    network.updateLines(values[0].lines);
                    network.updateTwoWindingsTransformers(
                        values[0].twoWindingsTransformers
                    );
                    network.updateThreeWindingsTransformers(
                        values[0].threeWindingsTransformers
                    );
                    network.updateGenerators(values[0].generators);
                    network.updateLoads(values[0].loads);
                    network.updateBatteries(values[0].batteries);
                    network.updateDanglingLines(values[0].danglingLines);
                    network.updateLccConverterStations(
                        values[0].lccConverterStations
                    );
                    network.updateVscConverterStations(
                        values[0].vscConverterStations
                    );
                    network.updateHvdcLines(values[0].hvdcLines);
                    network.updateShuntCompensators(
                        values[0].shuntCompensators
                    );
                    network.updateStaticVarCompensators(
                        values[0].staticVarCompensators
                    );

                    setUpdatedLines(values[0].lines);
                })
                .catch(function (error) {
                    console.error(error.message);
                    setStudyNotFound(true);
                });
            // Note: studyName don't change
        },
        [studyName, userId, network]
    );

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
            dispatch(filteredNominalVoltagesUpdated(null));
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
        const newSubstationId = queryParams['substationId'];
        setDisplayedSubstationId(newSubstationId ? newSubstationId : null);
    }, [location.search]);

    useEffect(() => {
        if (network && !substationsLoaded)
            network.substations.getOrFetch(() => setSubstationsLoaded(true));
    }, [substationsLoaded, network]);

    useEffect(() => {
        if (network && substationsLoaded && !filteredNominalVoltages) {
            dispatch(
                filteredNominalVoltagesUpdated(network.getNominalVoltages())
            );
        }
    }, [network, filteredNominalVoltages, dispatch, substationsLoaded]);

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

    const showSubstationDiagram = useCallback(
        (substationId) => {
            dispatch(selectItemNetwork(substationId));
            setUpdateSwitchMsg('');
            history.replace(
                '/' +
                    encodeURIComponent(userId) +
                    '/studies/' +
                    encodeURIComponent(studyName) +
                    stringify(
                        { substationId: substationId },
                        { addQueryPrefix: true }
                    )
            );
        },
        // Note: studyName and history don't change
        [studyName, userId, history, dispatch]
    );

    const chooseVoltageLevelForSubstation = useCallback(
        (idSubstation, x, y) => {
            setChoiceVoltageLevelsSubstationId(idSubstation);
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

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

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

    const updateSld = () => {
        if (sldRef.current) {
            setUpdateSwitchMsg('');
            sldRef.current.reloadSvg();
        }
    };

    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            if (
                studyUpdatedForce.eventData.headers['updateType'] === 'loadflow'
            ) {
                //TODO reload data more intelligently
                updateSld();
                loadNetwork(true);
                updateNetwork();
            } else if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                'loadflow_status'
            ) {
                updateLoadFlowResult();
            } else if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                'securityAnalysis_status'
            ) {
                updateSecurityAnalysisStatus();
            } else if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                'securityAnalysisResult'
            ) {
                updateSecurityAnalysisResult();

                // update badge
                dispatch(increaseResultCount());
            }
        }
        // Note: studyName, and loadNetwork don't change
    }, [
        studyUpdatedForce,
        studyName,
        loadNetwork,
        updateNetwork,
        updateLoadFlowResult,
        updateSecurityAnalysisStatus,
        updateSecurityAnalysisResult,
        dispatch,
    ]);

    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            if (studyUpdatedForce.eventData.headers['updateType'] === 'study') {
                updateSld();

                // study partial update : loading equipments involved in the study modification and updating the network
                const ids =
                    studyUpdatedForce.eventData.headers['substationsIds'];
                const tmp = ids.substring(1, ids.length - 1); // removing square brackets
                if (tmp && tmp.length > 0) {
                    const substationsIds = tmp.split(',');
                    updateNetwork(substationsIds);
                }
            }
        }
    }, [studyUpdatedForce, updateNetwork]);

    const mapRef = useRef();
    const centerSubstation = useCallback(
        (id) => {
            mapRef.current.centerSubstation(id);
        },
        [mapRef]
    );

    function closeChoiceVoltageLevelMenu() {
        setChoiceVoltageLevelsSubstationId(null);
    }

    function choiceVoltageLevel(voltageLevelId) {
        openVoltageLevel(voltageLevelId);
        closeChoiceVoltageLevelMenu();
    }

    function onClickNmKConstraint(row, column) {
        if (network) {
            if (column.dataKey === 'subjectId') {
                let vlId;
                let substationId;

                let equipment = network.getLineOrTransformer(row.subjectId);
                if (equipment) {
                    if (row.side) {
                        vlId =
                            row.side === 'ONE'
                                ? equipment.voltageLevelId1
                                : row.side === 'TWO'
                                ? equipment.voltageLevelId2
                                : equipment.voltageLevelId3;
                    } else {
                        vlId = equipment.voltageLevelId1;
                    }
                    const vl = network.getVoltageLevel(vlId);
                    substationId = vl.substationId;
                } else {
                    equipment = network.getVoltageLevel(row.subjectId);
                    if (equipment) {
                        vlId = equipment.id;
                        substationId = equipment.substationId;
                    }
                }

                if (vlId) {
                    setDisplayedVoltageLevelId(null);
                    setDisplayedSubstationId(null);
                    dispatch(selectItemNetwork(vlId));
                    props.onChangeTab(0); // switch to map view
                    showVoltageLevelDiagram(vlId); // show voltage level
                    setVisibleSubstation(substationId);
                    setDisplayedVoltageLevelId(vlId);
                }
            }
        }
    }

    const openVoltageLevel = useCallback(
        (vlId) => {
            if (!network) return;
            showVoltageLevelDiagram(vlId);
            dispatch(selectItemNetwork(vlId));
        },
        [network, showVoltageLevelDiagram, dispatch]
    );

    function renderMapView() {
        let displayedVoltageLevel;
        if (network) {
            if (displayedVoltageLevelId) {
                displayedVoltageLevel = network.getVoltageLevel(
                    displayedVoltageLevelId
                );
            }
        }

        let choiceVoltageLevelsSubstation = null;
        if (network) {
            if (choiceVoltageLevelsSubstationId) {
                choiceVoltageLevelsSubstation = network.getSubstation(
                    choiceVoltageLevelsSubstationId
                );
            }
        }

        let displayedSubstation;
        if (network) {
            if (displayedSubstationId) {
                displayedSubstation = network.getSubstation(
                    displayedSubstationId
                );
            }
        }

        let sldTitle;
        let svgUrl;
        if (displayedVoltageLevel) {
            sldTitle = useName
                ? displayedVoltageLevel.name
                : displayedVoltageLevel.id;
            if (
                network.getSubstation(displayedVoltageLevel.substationId)
                    .countryName !== undefined
            ) {
                sldTitle +=
                    ' \u002D ' +
                    network.getSubstation(displayedVoltageLevel.substationId)
                        .countryName;
            }

            svgUrl = getVoltageLevelSingleLineDiagram(
                studyName,
                userId,
                displayedVoltageLevelId,
                useName,
                centerName,
                diagonalName
            );
        } else if (displayedSubstation) {
            sldTitle = useName
                ? displayedSubstation.name
                : displayedSubstation.id;
            if (
                network.getSubstation(displayedSubstation.id).countryName !==
                undefined
            ) {
                sldTitle +=
                    ' \u002D ' +
                    network.getSubstation(displayedSubstation.id).countryName;
            }

            svgUrl = getSubstationSingleLineDiagram(
                studyName,
                userId,
                displayedSubstationId,
                useName,
                centerName,
                diagonalName,
                substationLayout
            );
        }
        const sldShowing = displayedVoltageLevelId || displayedSubstationId;
        let openDrawerComponent = null;
        if (!drawerOpen) {
            if (sldShowing) {
                openDrawerComponent = (
                    <>
                        <IconButton
                            style={{ padding: 0 }}
                            onClick={toggleDrawer}
                        >
                            <ChevronRightIcon />
                        </IconButton>
                        <Divider
                            orientation="vertical"
                            flexItem
                            variant="middle"
                        />
                    </>
                );
            } else {
                openDrawerComponent = (
                    <IconButton
                        style={{ alignSelf: 'flex-start' }}
                        onClick={toggleDrawer}
                    >
                        <ChevronRightIcon />
                    </IconButton>
                );
            }
        }

        return (
            <div className={clsx('relative singlestretch-child', classes.map)}>
                <div
                    className={
                        drawerOpen
                            ? classes.mapCtrlBottomLeftShift
                            : classes.mapCtrlBottomLeft
                    }
                    style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                    }}
                >
                    <NetworkMap
                        network={network}
                        updatedLines={updatedLines}
                        geoData={geoData}
                        useName={useName}
                        filteredNominalVoltages={filteredNominalVoltages}
                        labelsZoomThreshold={9}
                        arrowsZoomThreshold={7}
                        initialPosition={INITIAL_POSITION}
                        initialZoom={1}
                        lineFullPath={lineFullPath}
                        lineParallelPath={lineParallelPath}
                        lineFlowMode={lineFlowMode}
                        lineFlowColorMode={lineFlowColorMode}
                        lineFlowAlertThreshold={lineFlowAlertThreshold}
                        ref={mapRef}
                        onSubstationClick={openVoltageLevel}
                        visible={props.view === StudyView.MAP}
                        onSubstationClickChooseVoltageLevel={
                            chooseVoltageLevelForSubstation
                        }
                    />
                    {network && displayOverloadTable && (
                        <div
                            style={{
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
                                lineFlowAlertThreshold={lineFlowAlertThreshold}
                                network={network}
                            />
                        </div>
                    )}
                    {choiceVoltageLevelsSubstationId && (
                        <VoltageLevelChoice
                            handleClose={closeChoiceVoltageLevelMenu}
                            onClickHandler={choiceVoltageLevel}
                            substation={choiceVoltageLevelsSubstation}
                            position={[position[0] + 200, position[1]]}
                        />
                    )}
                    {network && (
                        <div
                            style={{
                                position: 'absolute',
                                right: 10,
                                bottom: 30,
                            }}
                        >
                            <NominalVoltageFilter />
                        </div>
                    )}
                    <div
                        style={{
                            position: 'absolute',
                            right: 100,
                            bottom: 30,
                            marginLeft: 8,
                            marginRight: 8,
                            marginTop: 8,
                        }}
                    >
                        <RunButton
                            runnables={RUNNABLES}
                            actionOnRunnable={ACTION_ON_RUNNABLES}
                            getStatus={getRunningStatus}
                            onStartClick={startComputation}
                            getText={getRunningText}
                            getStartIcon={getRunningIcon}
                            computationStopped={computationStopped}
                        />
                    </div>
                </div>
                <Drawer
                    variant={'persistent'}
                    className={clsx(classes.drawer, {
                        [classes.drawerShift]: !drawerOpen,
                    })}
                    anchor="left"
                    style={{
                        position: 'relative',
                        flexShrink: 1,
                        overflowY: 'hidden',
                        overflowX: 'hidden',
                    }}
                    open={drawerOpen}
                    classes={{
                        paper: classes.drawerPaper,
                    }}
                >
                    <div
                        style={{
                            flex: '1 1 auto',
                            overflowY: 'none',
                            overflowX: 'none',
                        }}
                        className={classes.drawerDiv}
                    >
                        <NetworkExplorer
                            network={network}
                            onVoltageLevelDisplayClick={showVoltageLevelDiagram}
                            onSubstationDisplayClick={showSubstationDiagram}
                            onSubstationFocus={centerSubstation}
                            hideExplorer={toggleDrawer}
                            visibleSubstation={visibleSubstation}
                        />
                    </div>
                </Drawer>
                {!sldShowing && openDrawerComponent}
                {/*
                Rendering single line diagram only in map view and if
                displayed voltage level or substation id has been set
                */}
                {props.view === StudyView.MAP &&
                    (displayedVoltageLevelId || displayedSubstationId) && (
                        <div
                            style={{
                                flexGrow: 1,
                                position: 'relative',
                                display: 'flex',
                                pointerEvents: 'none',
                                flexDirection: 'column',
                            }}
                        >
                            <SingleLineDiagram
                                onClose={() => closeVoltageLevelDiagram()}
                                onNextVoltageLevelClick={openVoltageLevel}
                                onBreakerClick={handleUpdateSwitchState}
                                diagramTitle={sldTitle}
                                diagramAction={openDrawerComponent}
                                svgUrl={svgUrl}
                                ref={sldRef}
                                updateSwitchMsg={updateSwitchMsg}
                                isComputationRunning={isComputationRunning()}
                                svgType={
                                    displayedVoltageLevelId
                                        ? SvgType.VOLTAGE_LEVEL
                                        : SvgType.SUBSTATION
                                }
                            />
                        </div>
                    )}
                <ContingencyListSelector
                    open={showContingencyListSelector}
                    onClose={() => setShowContingencyListSelector(false)}
                    onStart={handleStartSecurityAnalysis}
                />
            </div>
        );
    }

    function renderTableView() {
        return (
            <Paper className={clsx('singlestretch-child', classes.table)}>
                <NetworkTable
                    network={network}
                    studyName={studyName}
                    userId={userId}
                />
            </Paper>
        );
    }

    function renderResultsView() {
        return (
            <div className={clsx('singlestretch-child', classes.table)}>
                <Tabs
                    value={tabIndex}
                    indicatorColor="primary"
                    onChange={(event, newTabIndex) => setTabIndex(newTabIndex)}
                >
                    <Tab
                        label={intl.formatMessage({
                            id: 'loadFlowResults',
                        })}
                    />
                    <Tab
                        label={intl.formatMessage({
                            id: 'securityAnalysisResults',
                        })}
                    />
                </Tabs>
                {tabIndex === 0 && renderLoadFlowResult()}
                {tabIndex === 1 && renderSecurityAnalysisResult()}
            </div>
        );
    }

    function renderSecurityAnalysisResult() {
        return (
            <Paper
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                }}
            >
                <SecurityAnalysisResult
                    resultFetcher={securityAnalysisResult}
                    onClickNmKConstraint={onClickNmKConstraint}
                />
            </Paper>
        );
    }

    function renderLoadFlowResult() {
        return (
            <Paper style={{ flexGrow: 1 }} className={classes.table}>
                <LoadFlowResult result={loadFlowResult} />
            </Paper>
        );
    }

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
            <>
                {waitingLoadGeoData && (
                    <LoaderWithOverlay
                        color="inherit"
                        loaderSize={70}
                        isFixed={true}
                        loadingMessageText="loadingGeoData"
                    />
                )}
                {/*Rendering the map is slow, do it once and keep it display:none*/}
                <div
                    className="singlestretch-parent singlestretch-child"
                    style={{
                        display: props.view === StudyView.MAP ? null : 'none',
                    }}
                >
                    {renderMapView()}
                </div>
                <div
                    className="singlestretch-parent singlestretch-child"
                    style={{
                        display:
                            props.view === StudyView.SPREADSHEET
                                ? null
                                : 'none',
                    }}
                >
                    {renderTableView()}
                </div>
                <div
                    className="singlestretch-parent singlestretch-child"
                    style={{
                        display:
                            props.view === StudyView.RESULTS ? null : 'none',
                    }}
                >
                    {renderResultsView()}
                </div>
            </>
        );
    }
};

StudyPane.defaultProps = {
    view: StudyView.MAP,
    lineFlowAlertThreshold: 100,
};

StudyPane.propTypes = {
    view: PropTypes.oneOf(Object.values(StudyView)).isRequired,
    lineFlowAlertThreshold: PropTypes.number.isRequired,
    onChangeTab: PropTypes.func,
};

export default StudyPane;
