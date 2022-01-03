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
    fetchLinePositions,
    fetchNetworkModificationTree,
    fetchNetworkModificationTreeNode,
    fetchReport,
    fetchSecurityAnalysisResult,
    fetchSecurityAnalysisStatus,
    fetchStudyExists,
    fetchSubstationPositions,
    getSubstationSingleLineDiagram,
    getVoltageLevelSingleLineDiagram,
    startLoadFlow,
    startSecurityAnalysis,
    stopSecurityAnalysis,
    updateSwitchState,
    fetchLoadFlowInfos,
} from '../utils/rest-api';
import {
    addLoadflowNotif,
    addSANotif,
    closeStudy,
    filteredNominalVoltagesUpdated,
    loadGeoDataSuccess,
    loadNetworkModificationTreeSuccess,
    networkCreated,
    networkModificationTreeNodeAdded,
    networkModificationTreeNodesRemoved,
    networkModificationTreeNodesUpdated,
    openStudy,
    resetLoadflowNotif,
    selectItemNetwork,
    studyUpdated,
    selectTreeNode,
} from '../redux/actions';
import Network from './network/network';
import { equipments } from './network/network-equipments';
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
import RunButton from './run-button';
import ContingencyListSelector from './contingency-list-selector';
import PlayIcon from '@material-ui/icons/PlayArrow';
import DoneIcon from '@material-ui/icons/Done';
import LoopIcon from '@material-ui/icons/Loop';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import SecurityAnalysisResult from './security-analysis-result';
import LoadFlowResult from './loadflow-result';
import withLineMenu from './line-menu';

import Drawer from '@material-ui/core/Drawer';
import clsx from 'clsx';
import { RemoteResourceHandler } from './util/remote-resource-handler';
import {
    PARAM_CENTER_LABEL,
    PARAM_DIAGONAL_LABEL,
    PARAM_DISPLAY_OVERLOAD_TABLE,
    PARAM_LINE_FLOW_ALERT_THRESHOLD,
    PARAM_LINE_FLOW_COLOR_MODE,
    PARAM_LINE_FLOW_MODE,
    PARAM_LINE_FULL_PATH,
    PARAM_LINE_PARALLEL_PATH,
    PARAM_SUBSTATION_LAYOUT,
    PARAM_COMPONENT_LIBRARY,
    PARAM_USE_NAME,
} from '../utils/config-params';
import BaseEquipmentMenu from './base-equipment-menu';
import LateralToolbar from './lateral-toolbar';
import { RunningStatus } from './util/running-status';
import { getLineLoadingZone, LineLoadingZone } from './network/line-layer';
import withEquipmentMenu from './equipment-menu';
import { ReportViewer } from '@gridsuite/commons-ui';
import { displayErrorMessageWithSnackbar, useIntlRef } from '../utils/messages';
import { useSnackbar } from 'notistack';
import NetworkModificationTree from './network-modification-tree';
import NetworkModificationTreeModel from './graph/network-modification-tree-model';
import NodeEditor from './graph/menus/node-editor';

const drawerExplorerWidth = 300;
const nodeEditorWidth = 400;
const drawerToolbarWidth = 48;
const drawerNetworkModificationTreeWidth = 400;

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
    drawerExplorer: {
        width: drawerExplorerWidth,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        // zIndex set to be below the loader with overlay
        // and above the network explorer, for mouse events on network modification tree
        // to be taken into account correctly
        zIndex: 51,
    },
    nodeEditor: {
        width: nodeEditorWidth,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        // zIndex set to be below the loader with overlay
        // and above the network explorer, for mouse events on network modification tree
        // to be taken into account correctly
        zIndex: 51,
    },
    drawerToolbar: {
        width: drawerToolbarWidth,
        // zIndex set to be below the loader with overlay
        // and above the network explorer drawer
        zIndex: 60,
    },
    drawerNetworkModificationTree: {
        width: drawerNetworkModificationTreeWidth,
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        // zIndex set to be below the loader with overlay
        zIndex: 50,
    },
    drawerPaper: {
        position: 'static',
        overflow: 'hidden',
    },
    drawerExplorerShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: -drawerExplorerWidth,
    },
    nodeEditorShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        pointerEvents: 'none',
        marginLeft: -nodeEditorWidth,
    },
    drawerNetworkModificationTreeShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: -drawerNetworkModificationTreeWidth,
    },
    mapCtrlBottomLeft: {
        '& .mapboxgl-ctrl-bottom-left': {
            transition: theme.transitions.create('left', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
        },
    },
}));

const INITIAL_POSITION = [0, 0];

export const StudyView = {
    MAP: 'Map',
    SPREADSHEET: 'Spreadsheet',
    RESULTS: 'Results',
    LOGS: 'Logs',
};

const StudyPane = (props) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const network = useSelector((state) => state.network);

    const geoData = useSelector((state) => state.geoData);

    const networkModificationTreeModel = useSelector(
        (state) => state.networkModificationTreeModel
    );

    const useName = useSelector((state) => state[PARAM_USE_NAME]);

    const centerName = useSelector((state) => state[PARAM_CENTER_LABEL]);

    const diagonalName = useSelector((state) => state[PARAM_DIAGONAL_LABEL]);

    const lineFullPath = useSelector((state) => state[PARAM_LINE_FULL_PATH]);

    const lineParallelPath = useSelector(
        (state) => state[PARAM_LINE_PARALLEL_PATH]
    );

    const lineFlowMode = useSelector((state) => state[PARAM_LINE_FLOW_MODE]);

    const lineFlowColorMode = useSelector(
        (state) => state[PARAM_LINE_FLOW_COLOR_MODE]
    );

    const lineFlowAlertThreshold = useSelector((state) =>
        Number(state[PARAM_LINE_FLOW_ALERT_THRESHOLD])
    );

    const substationLayout = useSelector(
        (state) => state[PARAM_SUBSTATION_LAYOUT]
    );

    const studyUpdatedForce = useSelector((state) => state.studyUpdated);

    const displayOverloadTable = useSelector(
        (state) => state[PARAM_DISPLAY_OVERLOAD_TABLE]
    );

    const componentLibrary = useSelector(
        (state) => state[PARAM_COMPONENT_LIBRARY]
    );

    const selectedNodeUuid = useSelector((state) => state.selectedTreeNode);

    const [studyNotFound, setStudyNotFound] = useState(false);

    const [networkLoadingFail, setNetworkLoadingFail] = useState(false);

    const [geoDataLoadingFail, setGeoDataLoadingFail] = useState(false);

    const [errorMsgId, setErrorMsgId] = useState('');

    const [studyExistsChecked, setStudyExistsChecked] = useState(false);

    const [isNetworkLoadingDone, setIsNetworkLoadingDone] = useState(false);

    const [updatedLines, setUpdatedLines] = useState([]);

    const [displayedVoltageLevelId, setDisplayedVoltageLevelId] =
        useState(null);

    const filteredNominalVoltages = useSelector(
        (state) => state.filteredNominalVoltages
    );

    const [equipmentMenu, setEquipmentMenu] = useState({
        position: [-1, -1],
        equipment: null,
        equipmentType: null,
        display: null,
    });

    const [displayedSubstationId, setDisplayedSubstationId] = useState(null);

    const [loadFlowStatus, setLoadFlowStatus] = useState(RunningStatus.IDLE);

    const [loadFlowResult, setLoadFlowResult] = useState(null);

    const [ranLoadflow, setRanLoadflow] = useState(false);

    const [ranSA, setRanSA] = useState(false);

    const [securityAnalysisStatus, setSecurityAnalysisStatus] = useState(
        RunningStatus.IDLE
    );

    const [securityAnalysisResultFetcher, setSecurityAnalysisResultFetcher] =
        useState(null);
    const [securityAnalysisResult, setSecurityAnalysisResult] = useState(null);
    const [securityAnalysisResultFetched, setSecurityAnalysisResultFetched] =
        useState(false);

    const [computationStopped, setComputationStopped] = useState(false);

    const [updateSwitchMsg, setUpdateSwitchMsg] = useState('');

    const [waitingLoadGeoData, setWaitingLoadGeoData] = useState(true);

    const [drawerExplorerOpen, setDrawerExplorerOpen] = useState(true);
    const [
        drawerNetworkModificationTreeOpen,
        setDrawerNetworkModificationTreeOpen,
    ] = useState(false);

    const [networkModificationsPaneOpen, setNetworkModificationsPaneOpen] =
        useState(false);

    const [
        choiceVoltageLevelsSubstationId,
        setChoiceVoltageLevelsSubstationId,
    ] = useState(null);

    const [tabIndex, setTabIndex] = React.useState(0);

    const [showContingencyListSelector, setShowContingencyListSelector] =
        useState(false);

    const [visibleSubstation, setVisibleSubstation] = useState(null);

    const [tableEquipment, setTableEquipment] = useState({
        id: null,
        type: null,
        changed: false,
    });

    const MenuLine = withLineMenu(BaseEquipmentMenu);

    const MenuSubstation = withEquipmentMenu(
        BaseEquipmentMenu,
        'substation-menu',
        equipments.substations
    );

    const MenuVoltageLevel = withEquipmentMenu(
        BaseEquipmentMenu,
        'voltage-level-menu',
        equipments.voltageLevels
    );

    const dispatch = useDispatch();

    const classes = useStyles();

    const location = useLocation();

    const history = useHistory();

    const websocketExpectedCloseRef = useRef();

    const intl = useIntl();

    const intlRef = useIntlRef();

    const { enqueueSnackbar } = useSnackbar();

    /**
     * Report dialog
     */
    const [report, setReport] = useState(null);
    const [waitingLoadReport, setWaitingLoadReport] = useState(false);

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
        if (selectedNodeUuid !== null) {
            fetchLoadFlowInfos(studyUuid, selectedNodeUuid).then(
                (loadflowInfos) => {
                    setLoadFlowStatus(
                        getLoadFlowRunningStatus(loadflowInfos.loadFlowStatus)
                    );
                    setLoadFlowResult(loadflowInfos.loadFlowResult);
                }
            );
        }
    }, [studyUuid, selectedNodeUuid]);

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
        if (selectedNodeUuid !== null) {
            fetchSecurityAnalysisStatus(studyUuid, selectedNodeUuid).then(
                (status) => {
                    setSecurityAnalysisStatus(
                        getSecurityAnalysisRunningStatus(status)
                    );
                }
            );
        }
    }, [studyUuid, selectedNodeUuid]);

    const updateSecurityAnalysisResult = useCallback(() => {
        setSecurityAnalysisResultFetcher(
            new RemoteResourceHandler(
                () => fetchSecurityAnalysisResult(studyUuid, selectedNodeUuid),
                (res) => {
                    setSecurityAnalysisResult(res);
                    setSecurityAnalysisResultFetched(true);
                },
                (e) => {
                    // produces 404 error when missing in the normal case, don't crash. TODO deal with other errors
                    setSecurityAnalysisResultFetched(true);
                }
            )
        );
    }, [
        studyUuid,
        selectedNodeUuid,
        setSecurityAnalysisResult,
        setSecurityAnalysisResultFetched,
    ]);

    const handleStartSecurityAnalysis = (contingencyListNames) => {
        // close the contingency list selection window
        setShowContingencyListSelector(false);

        setComputationStopped(false);

        // start server side security analysis
        startSecurityAnalysis(
            studyUuid,
            selectedNodeUuid,
            contingencyListNames
        );

        // clean result
        setSecurityAnalysisResult(null);
    };

    const startComputation = (runnable) => {
        if (runnable === Runnable.LOADFLOW) {
            startLoadFlow(studyUuid, selectedNodeUuid);
            setRanLoadflow(true);
        } else if (runnable === Runnable.SECURITY_ANALYSIS) {
            setShowContingencyListSelector(true);
            setRanSA(true);
        }
    };

    const ACTION_ON_RUNNABLES = {
        text: intl.formatMessage({ id: 'StopComputation' }),
        action: (runnable) => {
            if (runnable === Runnable.SECURITY_ANALYSIS) {
                stopSecurityAnalysis(studyUuid, selectedNodeUuid);
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
            console.info(`Loading network of study '${studyUuid}'...`);
            updateLoadFlowResult();
            updateSecurityAnalysisResult();
            updateSecurityAnalysisStatus();
            if (isUpdate) {
                // After a load flow, network has to be recreated.
                // In order to avoid glitches during sld and map rendering,
                // lines and substations have to be prefetched and set before network creation event is dispatched
                // Network creation event is dispatched directly in the network constructor
                new Network(
                    studyUuid,
                    selectedNodeUuid,
                    (error) => {
                        console.error(error.message);
                        setNetworkLoadingFail(true);
                    },
                    dispatch,
                    { equipments: [equipments.lines, equipments.substations] }
                );
            } else {
                if (selectedNodeUuid !== null) {
                    const network = new Network(
                        studyUuid,
                        selectedNodeUuid,
                        (error) => {
                            console.error(error.message);
                            setNetworkLoadingFail(true);
                        },
                        dispatch
                    );
                    // For initial network loading, no need to initialize lines and substations at first,
                    // lazy loading will do the job (no glitches to avoid)
                    dispatch(networkCreated(network));
                }
            }
            setIsNetworkLoadingDone(true);
        },
        [
            studyUuid,
            selectedNodeUuid,
            dispatch,
            updateLoadFlowResult,
            updateSecurityAnalysisResult,
            updateSecurityAnalysisStatus,
        ]
    );

    const updateNetwork = useCallback(
        (substationsIds) => {
            const updatedEquipments = fetchAllEquipments(
                studyUuid,
                selectedNodeUuid,
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
                    setNetworkLoadingFail(true);
                });
            // Note: studyUuid don't change
        },
        [studyUuid, selectedNodeUuid, network]
    );

    const removeEquipmentFromNetwork = useCallback(
        (equipmentType, equipmentId) => {
            console.info(
                'removing equipment with id=',
                equipmentId,
                ' and type=',
                equipmentType,
                ' from the network'
            );
            network.removeEquipment(equipmentType, equipmentId);
        },
        [network]
    );

    const loadGeoData = useCallback(() => {
        console.info(`Loading geo data of study '${studyUuid}'...`);

        const substationPositions = fetchSubstationPositions(studyUuid);

        const linePositions = fetchLinePositions(studyUuid);

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
                setWaitingLoadGeoData(false);
                setGeoDataLoadingFail(true);
            });
        // Note: studyUuid and dispatch don't change
    }, [studyUuid, dispatch]);

    const loadTree = useCallback(() => {
        console.info(
            `Loading network modification tree of study '${studyUuid}'...`
        );

        const networkModificationTree = fetchNetworkModificationTree(studyUuid);

        networkModificationTree
            .then((tree) => {
                dispatch(selectTreeNode(tree.id));

                const networkModificationTreeModel =
                    new NetworkModificationTreeModel();
                networkModificationTreeModel.setTreeElements(tree);
                networkModificationTreeModel.updateLayout();
                dispatch(
                    loadNetworkModificationTreeSuccess(
                        networkModificationTreeModel
                    )
                );
            })
            .catch((errorMessage) =>
                displayErrorMessageWithSnackbar({
                    errorMessage: errorMessage,
                    enqueueSnackbar: enqueueSnackbar,
                    headerMessage: {
                        headerMessageId: 'NetworkModificationTreeLoadError',
                        intlRef: intlRef,
                    },
                })
            )
            .finally(() =>
                console.debug('Network modification tree loading finished')
            );
        // Note: studyUuid and dispatch don't change
    }, [studyUuid, enqueueSnackbar, intlRef, dispatch]);

    const connectNotifications = useCallback(
        (studyUuid) => {
            console.info(`Connecting to notifications '${studyUuid}'...`);

            const ws = connectNotificationsWebsocket(studyUuid);
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
        dispatch(openStudy(studyUuid));

        fetchStudyExists(studyUuid).then((response) => {
            if (response.status === 400 || response.status === 404) {
                setStudyNotFound(true);
                //since the study is not found no need to try to load network and geoData
                setStudyExistsChecked(true);
                setIsNetworkLoadingDone(true);
                setWaitingLoadGeoData(false);
            } else {
                setStudyExistsChecked(true);
                loadNetwork();
                loadGeoData();
                loadTree();
            }
        });

        const ws = connectNotifications(studyUuid);

        // study cleanup at unmount event
        return function () {
            websocketExpectedCloseRef.current = true;
            ws.close();
            dispatch(closeStudy());
            dispatch(filteredNominalVoltagesUpdated(null));
        };
        // Note: dispach, studyUuid, loadNetwork, loadGeoData, loadTree
        // connectNotifications don't change
    }, [
        dispatch,
        studyUuid,
        loadNetwork,
        loadGeoData,
        loadTree,
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
        if (
            network &&
            network.substations.length > 0 &&
            !filteredNominalVoltages
        ) {
            dispatch(
                filteredNominalVoltagesUpdated(network.getNominalVoltages())
            );
        }
    }, [network, filteredNominalVoltages, dispatch]);

    useEffect(() => {
        if (props.view !== StudyView.LOGS) {
            setReport(null);
        } else if (!waitingLoadReport && !report) {
            setWaitingLoadReport(true);
            fetchReport(studyUuid)
                .then((report) => {
                    setReport(report);
                })
                .catch((errorMessage) =>
                    displayErrorMessageWithSnackbar({
                        errorMessage: errorMessage,
                        enqueueSnackbar: enqueueSnackbar,
                    })
                )
                .finally(() => {
                    setWaitingLoadReport(false);
                });
        }
    }, [props, report, waitingLoadReport, studyUuid, enqueueSnackbar]);

    const showVoltageLevelDiagram = useCallback(
        (voltageLevelId) => {
            setUpdateSwitchMsg('');
            history.replace(
                '/studies/' +
                    encodeURIComponent(studyUuid) +
                    stringify(
                        { voltageLevelId: voltageLevelId },
                        { addQueryPrefix: true }
                    )
            );
        },
        // Note: studyUuid and history don't change
        [studyUuid, history]
    );

    const showSubstationDiagram = useCallback(
        (substationId) => {
            dispatch(selectItemNetwork(substationId));
            setUpdateSwitchMsg('');
            history.replace(
                '/studies/' +
                    encodeURIComponent(studyUuid) +
                    stringify(
                        { substationId: substationId },
                        { addQueryPrefix: true }
                    )
            );
        },
        // Note: studyUuid and history don't change
        [studyUuid, history, dispatch]
    );

    const chooseVoltageLevelForSubstation = useCallback(
        (idSubstation, x, y) => {
            setChoiceVoltageLevelsSubstationId(idSubstation);
            setPosition([x, y]);
        },
        []
    );

    function closeVoltageLevelDiagram() {
        history.replace('/studies/' + encodeURIComponent(studyUuid));
    }

    const toggleExplorerDrawer = () => {
        setDrawerExplorerOpen(!drawerExplorerOpen);
        setDrawerNetworkModificationTreeOpen(false);
    };

    const toggleNetworkModificationTreeDrawer = () => {
        setDrawerNetworkModificationTreeOpen(
            !drawerNetworkModificationTreeOpen
        );
        setDrawerExplorerOpen(false);
    };

    const toggleNetworkModificationConfiguration = () => {
        setNetworkModificationsPaneOpen(!networkModificationsPaneOpen);
    };

    const closeNetworkModificationConfiguration = () => {
        setNetworkModificationsPaneOpen(false);
    };

    const sldRef = useRef();
    const handleUpdateSwitchState = useCallback(
        (breakerId, open, switchElement) => {
            if (open) {
                switchElement.classList.replace('sld-closed', 'sld-open');
            } else {
                switchElement.classList.replace('sld-open', 'sld-closed');
            }

            updateSwitchState(
                studyUuid,
                selectedNodeUuid,
                breakerId,
                open
            ).then((response) => {
                if (!response.ok) {
                    console.error(response);
                    // revert switch position change
                    if (open) {
                        switchElement.classList.replace(
                            'sld-open',
                            'sld-closed'
                        );
                    } else {
                        switchElement.classList.replace(
                            'sld-closed',
                            'sld-open'
                        );
                    }
                    setUpdateSwitchMsg(
                        response.status + ' : ' + response.statusText
                    );
                }
            });
        },
        [studyUuid, selectedNodeUuid]
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
                //add the loadflow notif (only if the user clicked on run loadflow)
                if (ranLoadflow) {
                    dispatch(addLoadflowNotif());
                }
            } else if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                'loadflow_status'
            ) {
                updateLoadFlowResult();
                //we reset the notif when the previous loadflow results are removed
                dispatch(resetLoadflowNotif());
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
                //add the SA notif (only if the user clicked on run SA)
                if (ranSA) {
                    dispatch(addSANotif());
                }
                // update badge
            }
        }
        // Note: studyUuid, and loadNetwork don't change
    }, [
        studyUpdatedForce,
        studyUuid,
        loadNetwork,
        updateLoadFlowResult,
        updateSecurityAnalysisStatus,
        updateSecurityAnalysisResult,
        ranLoadflow,
        ranSA,
        dispatch,
    ]);

    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            if (studyUpdatedForce.eventData.headers['updateType'] === 'study') {
                updateSld();

                // study partial update :
                // loading equipments involved in the study modification and updating the network
                const substationsIds =
                    studyUpdatedForce.eventData.headers['substationsIds'];
                const tmp = substationsIds.substring(
                    1,
                    substationsIds.length - 1
                ); // removing square brackets
                if (tmp && tmp.length > 0) {
                    updateNetwork(tmp.split(', '));
                }

                // removing deleted equipment from the network
                const deletedEquipmentId =
                    studyUpdatedForce.eventData.headers['deletedEquipmentId'];
                const deletedEquipmentType =
                    studyUpdatedForce.eventData.headers['deletedEquipmentType'];
                if (deletedEquipmentId && deletedEquipmentType) {
                    removeEquipmentFromNetwork(
                        deletedEquipmentType,
                        deletedEquipmentId
                    );
                }
            }
        }
    }, [studyUpdatedForce, updateNetwork, removeEquipmentFromNetwork]);

    const updateNodes = useCallback(
        (updatedNodesIds) => {
            Promise.all(
                updatedNodesIds.map((nodeId) =>
                    fetchNetworkModificationTreeNode(studyUuid, nodeId)
                )
            ).then((values) => {
                dispatch(networkModificationTreeNodesUpdated(values));
            });
        },
        [studyUuid, dispatch]
    );

    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                'nodeCreated'
            ) {
                fetchNetworkModificationTreeNode(
                    studyUuid,
                    studyUpdatedForce.eventData.headers['newNode']
                ).then((node) => {
                    dispatch(
                        networkModificationTreeNodeAdded(
                            node,
                            studyUpdatedForce.eventData.headers['node']
                        )
                    );
                });
            } else if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                'nodeDeleted'
            ) {
                dispatch(
                    networkModificationTreeNodesRemoved(
                        studyUpdatedForce.eventData.headers['nodes']
                    )
                );
            } else if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                'nodeUpdated'
            ) {
                updateNodes(studyUpdatedForce.eventData.headers['nodes']);
            }
        }
    }, [studyUuid, studyUpdatedForce, updateNodes, dispatch]);

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

                // TODO code factorization for displaying a VL via a hook
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

    const linesNearOverload = useCallback(() => {
        if (network) {
            return network.lines.some((l) => {
                const zone = getLineLoadingZone(l, lineFlowAlertThreshold);
                return (
                    zone === LineLoadingZone.WARNING ||
                    zone === LineLoadingZone.OVERLOAD
                );
            });
        }
        return false;
    }, [network, lineFlowAlertThreshold]);

    const openVoltageLevel = useCallback(
        (vlId) => {
            if (!network) return;
            showVoltageLevelDiagram(vlId);
            dispatch(selectItemNetwork(vlId));
        },
        [network, showVoltageLevelDiagram, dispatch]
    );

    useEffect(() => {
        if (!network) return;
        network.useEquipment(equipments.substations);
        network.useEquipment(equipments.lines);
    }, [network]);

    function showEquipmentMenu(equipment, x, y, type) {
        setEquipmentMenu({
            position: [x, y],
            equipment: equipment,
            equipmentType: type,
            display: true,
        });
    }

    function closeEquipmentMenu() {
        setEquipmentMenu({
            display: false,
        });
    }

    function handleViewInSpreadsheet(equipmentType, equipmentId) {
        showInSpreadsheet({
            equipmentType: equipmentType,
            equipmentId: equipmentId,
        });
        closeEquipmentMenu();
    }

    function showInSpreadsheet(equipment) {
        let newTableEquipment = {
            id: equipment.equipmentId,
            type: equipment.equipmentType,
            changed: !tableEquipment.changed,
        };
        setTableEquipment({ ...newTableEquipment });
        props.onChangeTab(1); // switch to spreadsheet view
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
                studyUuid,
                selectedNodeUuid,
                displayedVoltageLevelId,
                useName,
                centerName,
                diagonalName,
                componentLibrary
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
                studyUuid,
                selectedNodeUuid,
                displayedSubstationId,
                useName,
                centerName,
                diagonalName,
                substationLayout,
                componentLibrary
            );
        }

        function calculateShift() {
            let shift = drawerToolbarWidth;
            if (drawerExplorerOpen) shift += drawerExplorerWidth;
            if (drawerNetworkModificationTreeOpen)
                shift += drawerNetworkModificationTreeWidth;
            if (networkModificationsPaneOpen) {
                shift += nodeEditorWidth;
            }
            return shift;
        }
        return (
            <div className={clsx('relative singlestretch-child', classes.map)}>
                <div
                    className={classes.mapCtrlBottomLeft}
                    style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: calculateShift(),
                        right: 0,
                    }}
                >
                    <NetworkMap
                        network={network}
                        substations={network ? network.substations : []}
                        lines={network ? network.lines : []}
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
                        loadFlowStatus={loadFlowStatus}
                        ref={mapRef}
                        onSubstationClick={openVoltageLevel}
                        onLineMenuClick={(equipment, x, y) =>
                            showEquipmentMenu(equipment, x, y, equipments.lines)
                        }
                        visible={props.view === StudyView.MAP}
                        onSubstationClickChooseVoltageLevel={
                            chooseVoltageLevelForSubstation
                        }
                        onSubstationMenuClick={(equipment, x, y) =>
                            showEquipmentMenu(
                                equipment,
                                x,
                                y,
                                equipments.substations
                            )
                        }
                        onVoltageLevelMenuClick={(equipment, x, y) =>
                            showEquipmentMenu(
                                equipment,
                                x,
                                y,
                                equipments.voltageLevels
                            )
                        }
                    />
                    {network && displayOverloadTable && linesNearOverload() && (
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
                    {network && network.substations.length > 0 && (
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
                    {equipmentMenu.equipment !== null &&
                        equipmentMenu.display &&
                        equipmentMenu.equipmentType === equipments.lines && (
                            <MenuLine
                                id={equipmentMenu.equipment.id}
                                position={[
                                    equipmentMenu.position[0],
                                    equipmentMenu.position[1],
                                ]}
                                handleClose={closeEquipmentMenu}
                                handleViewInSpreadsheet={
                                    handleViewInSpreadsheet
                                }
                                selectedNodeUuid={selectedNodeUuid}
                            />
                        )}
                    {equipmentMenu.equipment !== null &&
                        equipmentMenu.display &&
                        equipmentMenu.equipmentType ===
                            equipments.substations && (
                            <MenuSubstation
                                id={equipmentMenu.equipment.id}
                                position={[
                                    equipmentMenu.position[0],
                                    equipmentMenu.position[1],
                                ]}
                                handleClose={closeEquipmentMenu}
                                handleViewInSpreadsheet={
                                    handleViewInSpreadsheet
                                }
                            />
                        )}
                    {equipmentMenu.equipment !== null &&
                        equipmentMenu.display &&
                        equipmentMenu.equipmentType ===
                            equipments.voltageLevels && (
                            <MenuVoltageLevel
                                id={equipmentMenu.equipment.id}
                                position={[
                                    equipmentMenu.position[0],
                                    equipmentMenu.position[1],
                                ]}
                                handleClose={closeEquipmentMenu}
                                handleViewInSpreadsheet={
                                    handleViewInSpreadsheet
                                }
                            />
                        )}
                </div>
                <Drawer
                    variant={'permanent'}
                    className={classes.drawerToolbar}
                    anchor="left"
                    style={{
                        position: 'relative',
                        flexShrink: 1,
                        overflowY: 'none',
                        overflowX: 'none',
                    }}
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
                        <LateralToolbar
                            handleDisplayNetworkExplorer={toggleExplorerDrawer}
                            handleDisplayNetworkModificationTree={
                                toggleNetworkModificationTreeDrawer
                            }
                            networkExplorerDisplayed={drawerExplorerOpen}
                            networkModificationTreeDisplayed={
                                drawerNetworkModificationTreeOpen
                            }
                            handleOpenNetworkModificationConfiguration={
                                toggleNetworkModificationConfiguration
                            }
                        />
                    </div>
                </Drawer>
                <Drawer
                    variant={'persistent'}
                    className={clsx(classes.drawerExplorer, {
                        [classes.drawerExplorerShift]: !drawerExplorerOpen,
                    })}
                    anchor="left"
                    style={{
                        position: 'relative',
                        flexShrink: 1,
                        overflowY: 'hidden',
                        overflowX: 'hidden',
                    }}
                    open={drawerExplorerOpen}
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
                            substations={network ? network.substations : []}
                            onVoltageLevelDisplayClick={showVoltageLevelDiagram}
                            onSubstationDisplayClick={showSubstationDiagram}
                            onSubstationFocus={centerSubstation}
                            visibleSubstation={visibleSubstation}
                            visible={props.view === StudyView.MAP}
                        />
                    </div>
                </Drawer>
                <Drawer
                    variant={'persistent'}
                    className={clsx(classes.drawerNetworkModificationTree, {
                        [classes.drawerNetworkModificationTreeShift]:
                            !drawerNetworkModificationTreeOpen,
                    })}
                    anchor="left"
                    style={{
                        position: 'relative',
                        flexShrink: 1,
                        overflowY: 'hidden',
                        overflowX: 'hidden',
                    }}
                    open={drawerNetworkModificationTreeOpen}
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
                        <NetworkModificationTree
                            treeModel={networkModificationTreeModel}
                        />
                    </div>
                </Drawer>
                <Drawer
                    variant={'persistent'}
                    className={clsx(classes.nodeEditor, {
                        [classes.nodeEditorShift]:
                            !networkModificationsPaneOpen,
                    })}
                    anchor="left"
                    style={{
                        position: 'relative',
                        flexShrink: 1,
                        overflowY: 'hidden',
                        overflowX: 'hidden',
                    }}
                    open={networkModificationsPaneOpen}
                    classes={{
                        paper: classes.drawerPaper,
                    }}
                >
                    <NodeEditor
                        className={classes.drawerPaper}
                        onClose={closeNetworkModificationConfiguration}
                    />
                </Drawer>

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
                                svgUrl={svgUrl}
                                ref={sldRef}
                                updateSwitchMsg={updateSwitchMsg}
                                isComputationRunning={isComputationRunning()}
                                svgType={
                                    displayedVoltageLevelId
                                        ? SvgType.VOLTAGE_LEVEL
                                        : SvgType.SUBSTATION
                                }
                                showInSpreadsheet={showInSpreadsheet}
                                loadFlowStatus={loadFlowStatus}
                                selectedNodeUuid={selectedNodeUuid}
                            />
                        </div>
                    )}
                <ContingencyListSelector
                    open={showContingencyListSelector}
                    onClose={() => setShowContingencyListSelector(false)}
                    onStart={handleStartSecurityAnalysis}
                    selectedNodeUuid={selectedNodeUuid}
                />
            </div>
        );
    }

    function renderTableView() {
        return (
            network && (
                <Paper className={clsx('singlestretch-child', classes.table)}>
                    <NetworkTable
                        network={network}
                        studyUuid={studyUuid}
                        selectedNodeUuid={selectedNodeUuid}
                        equipmentId={tableEquipment.id}
                        equipmentType={tableEquipment.type}
                        equipmentChanged={tableEquipment.changed}
                    />
                </Paper>
            )
        );
    }

    useEffect(() => {
        if (tabIndex === 1) securityAnalysisResultFetcher.fetch();
    }, [tabIndex, securityAnalysisResultFetcher]);

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
                    result={securityAnalysisResult}
                    fetched={securityAnalysisResultFetched}
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

    function renderLogsView() {
        return (
            report && (
                <Paper className={clsx('singlestretch-child')}>
                    <ReportViewer jsonReport={report} />
                </Paper>
            )
        );
    }

    const isWaitingLoading = useCallback(() => {
        return waitingLoadGeoData || waitingLoadReport;
    }, [waitingLoadGeoData, waitingLoadReport]);

    useEffect(() => {
        if (!waitingLoadGeoData && studyExistsChecked && isNetworkLoadingDone) {
            if (studyNotFound) {
                setErrorMsgId('studyNotFound');
            } else if (networkLoadingFail) {
                setErrorMsgId('networkLoadingFail');
            } else if (geoDataLoadingFail) {
                setErrorMsgId('geoDataLoadingFail');
            }
        }
    }, [
        studyNotFound,
        geoDataLoadingFail,
        networkLoadingFail,
        studyExistsChecked,
        waitingLoadGeoData,
        isNetworkLoadingDone,
    ]);

    if (errorMsgId) {
        return (
            <PageNotFound
                message={
                    <FormattedMessage
                        id={errorMsgId}
                        values={{ studyUuid: studyUuid }}
                    />
                }
            />
        );
    } else {
        return (
            <>
                {isWaitingLoading() && (
                    <LoaderWithOverlay
                        color="inherit"
                        loaderSize={70}
                        isFixed={true}
                        loadingMessageText={
                            waitingLoadGeoData
                                ? 'loadingGeoData'
                                : 'loadingReport'
                        }
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
                <div
                    className="singlestretch-parent singlestretch-child"
                    style={{
                        display: props.view === StudyView.LOGS ? null : 'none',
                    }}
                >
                    {renderLogsView()}
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
