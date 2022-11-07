/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import StudyPane, { StudyView } from './study-pane';
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import * as PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    connectNotificationsWebsocket,
    fetchAllEquipments,
    fetchLoadFlowInfos,
    fetchNetworkModificationTree,
    fetchSecurityAnalysisStatus,
    fetchStudyExists,
    fetchPath,
    connectNotificationsWsUpdateDirectories,
    fetchCaseName,
    fetchSensitivityAnalysisStatus,
    connectDeletedStudyNotificationsWebsocket,
    fetchShortCircuitAnalysisStatus,
} from '../utils/rest-api';
import {
    closeStudy,
    filteredNominalVoltagesUpdated,
    loadNetworkModificationTreeSuccess,
    networkCreated,
    openStudy,
    studyUpdated,
    setCurrentTreeNode,
    setNetworkReloadNeeded,
    resetNetworkReload,
} from '../redux/actions';
import Network from './network/network';
import { equipments } from './network/network-equipments';
import WaitingLoader from './util/waiting-loader';
import { useIntlRef, useSnackMessage } from '../utils/messages';
import NetworkModificationTreeModel from './graph/network-modification-tree-model';
import {
    getFirstNodeOfType,
    isNodeBuilt,
    isNodeRenamed,
} from './graph/util/model-functions';
import {
    getSecurityAnalysisRunningStatus,
    getSensiRunningStatus,
    getShortCircuitRunningStatus,
    RunningStatus,
} from './util/running-status';
import { useIntl } from 'react-intl';
import { computePageTitle, computeFullPath } from '../utils/compute-title';
import { PARAM_MAP_MANUAL_REFRESH } from '../utils/config-params';

export function useNodeData(
    studyUuid,
    nodeUuid,
    fetcher,
    invalidations,
    defaultValue,
    resultConversion
) {
    const [result, setResult] = useState(defaultValue);
    const [isPending, setIsPending] = useState(false);
    const [errorMessage, setErrorMessage] = useState(undefined);
    const nodeUuidRef = useRef();
    const studyUpdatedForce = useSelector((state) => state.studyUpdated);
    const lastUpdateRef = useRef();

    const update = useCallback(() => {
        nodeUuidRef.current = nodeUuid;
        setIsPending(true);
        fetcher(studyUuid, nodeUuid)
            .then((res) => {
                if (nodeUuidRef.current === nodeUuid)
                    setResult(resultConversion ? resultConversion(res) : res);
            })
            .catch((err) => setErrorMessage(err.message))
            .finally(() => setIsPending(false));
    }, [nodeUuid, studyUuid, fetcher, resultConversion]);

    /* initial fetch and update */
    useEffect(() => {
        if (!studyUuid || !nodeUuid) return;
        const headers = studyUpdatedForce?.eventData?.headers;
        const updateType = headers && headers[UPDATE_TYPE_HEADER];
        const node = headers && headers['node'];
        const nodes = headers && headers['nodes'];
        const isUpdateForUs =
            lastUpdateRef.current !== studyUpdatedForce &&
            updateType &&
            ((node === undefined && nodes === undefined) ||
                node === nodeUuid ||
                nodes?.indexOf(nodeUuid) !== -1) &&
            invalidations.indexOf(updateType) !== -1;
        lastUpdateRef.current = studyUpdatedForce;
        if (nodeUuidRef.current !== nodeUuid || isUpdateForUs) {
            update();
        }
    }, [update, nodeUuid, invalidations, studyUpdatedForce, studyUuid]);

    return [result, isPending, errorMessage, update];
}

function useStudy(studyUuidRequest) {
    const [studyUuid, setStudyUuid] = useState(undefined);
    const [pending, setPending] = useState(true);
    const [errMessage, setErrMessage] = useState(undefined);
    const intlRef = useIntlRef();

    useEffect(() => {
        fetchStudyExists(studyUuidRequest)
            .then((response) => {
                if (response.status === 200) {
                    setStudyUuid(studyUuidRequest);
                } else {
                    setErrMessage(
                        intlRef.current.formatMessage(
                            { id: 'studyNotFound' },
                            { studyUuid: studyUuidRequest }
                        )
                    );
                }
            })
            .catch((e) => setErrMessage(e.message))
            .finally(() => setPending(false));
    }, [studyUuidRequest, intlRef]);

    return [studyUuid, pending, errMessage];
}

function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}

const loadFlowStatusInvalidations = ['loadflow_status', 'loadflow'];
const securityAnalysisStatusInvalidations = [
    'securityAnalysis_status',
    'securityAnalysis_failed',
];
const sensiStatusInvalidations = [
    'sensitivityAnalysis_status',
    'sensitivityAnalysis_failed',
];
const shortCircuitStatusInvalidations = [
    'shortCircuitAnalysis_status',
    'shortCircuitAnalysis_failed',
];
const UPDATE_TYPE_HEADER = 'updateType';

export function StudyContainer({ view, onChangeTab }) {
    const websocketExpectedCloseRef = useRef();

    const [studyUuid, studyPending, studyErrorMessage] = useStudy(
        decodeURIComponent(useParams().studyUuid)
    );

    const [studyName, setStudyName] = useState();
    const prevStudyName = usePrevious(studyName);
    const [studyPath, setStudyPath] = useState();
    const prevStudyPath = usePrevious(studyPath);

    const network = useSelector((state) => state.network);

    const [networkLoadingFailMessage, setNetworkLoadingFailMessage] =
        useState(undefined);

    const [errorMessage, setErrorMessage] = useState(undefined);

    const [initialTitle] = useState(document.title);

    const dispatch = useDispatch();

    const currentNode = useSelector((state) => state.currentTreeNode);

    const currentNodeRef = useRef();

    const [loadFlowInfos] = useNodeData(
        studyUuid,
        currentNode?.id,
        fetchLoadFlowInfos,
        loadFlowStatusInvalidations
    );

    const [securityAnalysisStatus] = useNodeData(
        studyUuid,
        currentNode?.id,
        fetchSecurityAnalysisStatus,
        securityAnalysisStatusInvalidations,
        RunningStatus.IDLE,
        getSecurityAnalysisRunningStatus
    );

    const [sensiStatus] = useNodeData(
        studyUuid,
        currentNode?.id,
        fetchSensitivityAnalysisStatus,
        sensiStatusInvalidations,
        RunningStatus.IDLE,
        getSensiRunningStatus
    );

    const [shortCircuitStatus] = useNodeData(
        studyUuid,
        currentNode?.id,
        fetchShortCircuitAnalysisStatus,
        shortCircuitStatusInvalidations,
        RunningStatus.IDLE,
        getShortCircuitRunningStatus
    );

    const mapManualRefresh = useSelector(
        (state) => state[PARAM_MAP_MANUAL_REFRESH]
    );

    const refIsNetworkRefreshNeeded = useRef();
    refIsNetworkRefreshNeeded.current =
        mapManualRefresh && view === StudyView.MAP;

    const [updatedLines, setUpdatedLines] = useState([]);

    const studyUpdatedForce = useSelector((state) => state.studyUpdated);

    const forceReloadNetwork = useSelector((state) => state.forceReloadNetwork);

    const loadNetworkRef = useRef();

    const { snackError, snackWarning, snackInfo } = useSnackMessage();

    const intl = useIntl();

    const wsRef = useRef();

    const checkFailNotifications = useCallback(
        (eventData) => {
            const updateTypeHeader = eventData.headers[UPDATE_TYPE_HEADER];
            if (updateTypeHeader === 'buildFailed') {
                snackError({
                    headerId: 'NodeBuildingError',
                });
            }
            if (updateTypeHeader === 'securityAnalysis_failed') {
                snackError({
                    headerId: 'securityAnalysisError',
                });
            }
            if (updateTypeHeader === 'sensitivityAnalysis_failed') {
                snackError({
                    headerId: 'sensitivityAnalysisError',
                });
            }
            if (updateTypeHeader === 'shortCircuitAnalysis_failed') {
                snackError({
                    headerId: 'shortCircuitAnalysisError',
                });
            }
        },
        [snackError]
    );

    const connectNotifications = useCallback(
        (studyUuid) => {
            console.info(`Connecting to notifications '${studyUuid}'...`);

            const ws = connectNotificationsWebsocket(studyUuid);
            ws.onmessage = function (event) {
                const eventData = JSON.parse(event.data);

                checkFailNotifications(eventData);
                dispatch(studyUpdated(eventData));
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
        [dispatch, checkFailNotifications]
    );

    const connectDeletedStudyNotifications = useCallback((studyUuid) => {
        console.info(`Connecting to directory notifications ...`);

        const ws = connectDeletedStudyNotificationsWebsocket(studyUuid);
        ws.onmessage = function () {
            window.close();
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
    }, []);

    useEffect(() => {
        // create ws at mount event
        wsRef.current = connectNotificationsWsUpdateDirectories();

        wsRef.current.onmessage = function (event) {
            const eventData = JSON.parse(event.data);
            dispatch(studyUpdated(eventData));
        };

        wsRef.current.onclose = function () {
            console.error('Unexpected Notification WebSocket closed');
        };
        wsRef.current.onerror = function (event) {
            console.error('Unexpected Notification WebSocket error', event);
        };
        // We must save wsRef.current in a variable to make sure that when close is called it refers to the same instance.
        // That's because wsRef.current could be modify outside of this scope.
        const wsToClose = wsRef.current;
        // cleanup at unmount event
        return () => {
            wsToClose.close();
        };
    }, [dispatch]);

    const displayNetworkLoadingFailMessage = useCallback((error) => {
        console.error(error.message);
        setNetworkLoadingFailMessage(error.message);
    }, []);

    const loadNetwork = useCallback(
        (isUpdate) => {
            if (!isNodeBuilt(currentNode) || !studyUuid) {
                return;
            }
            console.info(`Loading network of study '${studyUuid}'...`);

            if (isUpdate) {
                // After a load flow, network has to be recreated.
                // In order to avoid glitches during sld and map rendering,
                // lines and substations have to be prefetched and set before network creation event is dispatched
                // Network creation event is dispatched directly in the network constructor
                new Network(
                    studyUuid,
                    currentNode?.id,
                    displayNetworkLoadingFailMessage,
                    dispatch,
                    {
                        equipments: [equipments.lines, equipments.substations],
                    }
                );
            } else {
                const network = new Network(
                    studyUuid,
                    currentNode?.id,
                    displayNetworkLoadingFailMessage,
                    dispatch
                );
                // For initial network loading, no need to initialize lines and substations at first,
                // lazy loading will do the job (no glitches to avoid)
                dispatch(networkCreated(network));
            }
            dispatch(resetNetworkReload());
        },
        [currentNode, studyUuid, displayNetworkLoadingFailMessage, dispatch]
    );
    loadNetworkRef.current = loadNetwork;

    const loadTree = useCallback(() => {
        console.info(
            `Loading network modification tree of study '${studyUuid}'...`
        );

        const networkModificationTree = fetchNetworkModificationTree(studyUuid);

        networkModificationTree
            .then((tree) => {
                const networkModificationTreeModel =
                    new NetworkModificationTreeModel();
                networkModificationTreeModel.setTreeElements(tree);
                networkModificationTreeModel.updateLayout();

                fetchCaseName(studyUuid)
                    .then((res) => {
                        if (res) {
                            networkModificationTreeModel.setCaseName(res);
                        }
                    })
                    .catch((err) => {
                        snackWarning({
                            headerId: 'CaseNameLoadError',
                        });
                    });

                const firstSelectedNode =
                    getFirstNodeOfType(tree, 'NETWORK_MODIFICATION', 'BUILT') ||
                    getFirstNodeOfType(tree, 'ROOT');

                // To get positions we must get the node from the model class
                const ModelFirstSelectedNode = {
                    ...networkModificationTreeModel.treeNodes.find(
                        (node) => node.id === firstSelectedNode.id
                    ),
                };
                currentNodeRef.current = ModelFirstSelectedNode;
                dispatch(setCurrentTreeNode(ModelFirstSelectedNode));
                dispatch(
                    loadNetworkModificationTreeSuccess(
                        networkModificationTreeModel
                    )
                );
            })
            .catch((errorMessage) => {
                if (errorMessage.status === 404) {
                    snackError({
                        headerId: 'StudyUnrecoverableStateRecreate',
                    });
                } else {
                    snackError({
                        messageTxt: errorMessage,
                        headerId: 'NetworkModificationTreeLoadError',
                    });
                }
            })
            .finally(() =>
                console.debug('Network modification tree loading finished')
            );
        // Note: studyUuid and dispatch don't change
    }, [studyUuid, dispatch, snackError, snackWarning]);

    //handles map manual mode network reload
    useEffect(() => {
        if (mapManualRefresh && forceReloadNetwork) {
            loadNetwork(true);
        }
    }, [forceReloadNetwork, loadNetwork, mapManualRefresh]);

    useEffect(() => {
        if (studyUuid) {
            loadTree();
        }
    }, [studyUuid, loadTree]);

    //handles map automatic mode network reload
    useEffect(() => {
        let previousCurrentNode = currentNodeRef.current;
        currentNodeRef.current = currentNode;
        // if only node renaming, do not reload network
        if (mapManualRefresh) return;
        if (isNodeRenamed(previousCurrentNode, currentNode)) return;
        if (!isNodeBuilt(currentNode)) return;
        loadNetwork(true);
    }, [loadNetwork, currentNode, mapManualRefresh]);

    useEffect(() => {
        if (prevStudyPath && prevStudyPath !== studyPath) {
            snackInfo({
                headerId: 'moveStudyNotification',
                headerValues: {
                    oldStudyPath: prevStudyPath,
                    studyPath: studyPath,
                },
            });
        }

        if (prevStudyName && prevStudyName !== studyName) {
            snackInfo({
                headerId: 'renameStudyNotification',
                headerValues: {
                    oldStudyPath: prevStudyPath,
                    studyPath: studyPath,
                },
            });
        }
    }, [snackInfo, studyName, studyPath, prevStudyPath, prevStudyName]);

    const fetchStudyPath = useCallback(() => {
        fetchPath(studyUuid)
            .then((response) => {
                const parents = response
                    .slice(1)
                    .map((parent) => parent.elementName);

                const studyName = response[0]?.elementName;
                const path = computeFullPath(parents);
                setStudyName(studyName);
                setStudyPath(path);

                document.title = computePageTitle(
                    initialTitle,
                    studyName,
                    parents
                );
            })
            .catch((errorMessage) => {
                document.title = initialTitle;
                snackError({
                    messageTxt: errorMessage,
                    headerId: 'LoadStudyAndParentsInfoError',
                });
            });
    }, [studyUuid, initialTitle, snackError]);

    useEffect(() => {
        if (!studyUuid) {
            document.title = initialTitle;
            return;
        }
        fetchStudyPath();
    }, [studyUuid, initialTitle, fetchStudyPath]);

    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            if (
                studyUpdatedForce.eventData.headers.studyUuid === studyUuid &&
                studyUpdatedForce.eventData.headers[UPDATE_TYPE_HEADER] ===
                    'metadata_updated'
            ) {
                fetchStudyPath();
            }
        }
    }, [studyUuid, studyUpdatedForce, fetchStudyPath, snackInfo]);

    useEffect(() => {
        if (studyUuid) {
            websocketExpectedCloseRef.current = false;
            dispatch(openStudy(studyUuid));

            const ws = connectNotifications(studyUuid);
            const wsDirectory = connectDeletedStudyNotifications(studyUuid);

            loadNetworkRef.current();

            // study cleanup at unmount event
            return function () {
                websocketExpectedCloseRef.current = true;
                ws.close();
                wsDirectory.close();
                dispatch(closeStudy());
                dispatch(filteredNominalVoltagesUpdated(null));
            };
        }
        // Note: dispach, loadNetworkRef, loadGeoData
        // connectNotifications don't change
    }, [
        dispatch,
        studyUuid,
        connectNotifications,
        connectDeletedStudyNotifications,
    ]);

    function checkAndGetValues(values) {
        return values ? values : [];
    }

    const updateNetwork = useCallback(
        (substationsIds) => {
            const updatedEquipments = fetchAllEquipments(
                studyUuid,
                currentNode?.id,
                substationsIds
            );
            console.info('network partial update');
            Promise.all([updatedEquipments])
                .then((values) => {
                    network.updateSubstations(
                        checkAndGetValues(values[0].substations)
                    );
                    network.updateLines(checkAndGetValues(values[0].lines));
                    network.updateTwoWindingsTransformers(
                        checkAndGetValues(values[0].twoWindingsTransformers)
                    );
                    network.updateThreeWindingsTransformers(
                        checkAndGetValues(values[0].threeWindingsTransformers)
                    );
                    network.updateGenerators(
                        checkAndGetValues(values[0].generators)
                    );
                    network.updateLoads(checkAndGetValues(values[0].loads));
                    network.updateBatteries(
                        checkAndGetValues(values[0].batteries)
                    );
                    network.updateDanglingLines(
                        checkAndGetValues(values[0].danglingLines)
                    );
                    network.updateLccConverterStations(
                        checkAndGetValues(values[0].lccConverterStations)
                    );
                    network.updateVscConverterStations(
                        checkAndGetValues(values[0].vscConverterStations)
                    );
                    network.updateHvdcLines(
                        checkAndGetValues(values[0].hvdcLines)
                    );
                    network.updateShuntCompensators(
                        checkAndGetValues(values[0].shuntCompensators)
                    );
                    network.updateStaticVarCompensators(
                        checkAndGetValues(values[0].staticVarCompensators)
                    );

                    setUpdatedLines(checkAndGetValues(values[0].lines));
                })
                .catch(function (error) {
                    console.error(error.message);
                    setNetworkLoadingFailMessage(error.message);
                });
            //.finally(() => setIsNetworkPending(false));
            // Note: studyUuid don't change
        },
        [studyUuid, currentNode?.id, network]
    );

    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            if (
                studyUpdatedForce.eventData.headers[UPDATE_TYPE_HEADER] ===
                'loadflow'
            ) {
                //TODO reload data more intelligently
                loadNetwork(true);
            }
        }
        // Note: studyUuid, and loadNetwork don't change
    }, [studyUpdatedForce, loadNetwork, dispatch]);

    const runnable = useMemo(() => {
        return {
            LOADFLOW: intl.formatMessage({ id: 'LoadFlow' }),
            SECURITY_ANALYSIS: intl.formatMessage({
                id: 'SecurityAnalysis',
            }),
            SENSITIVITY_ANALYSIS: intl.formatMessage({
                id: 'SensitivityAnalysis',
            }),
            SHORT_CIRCUIT_ANALYSIS: intl.formatMessage({
                id: 'ShortCircuitAnalysis',
            }),
        };
    }, [intl]);

    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            if (
                studyUpdatedForce.eventData.headers[UPDATE_TYPE_HEADER] ===
                'study'
            ) {
                //when in manuel refresh mode the network is not partially updated
                if (refIsNetworkRefreshNeeded.current) {
                    dispatch(setNetworkReloadNeeded());
                } else {
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
                        studyUpdatedForce.eventData.headers[
                            'deletedEquipmentId'
                        ];
                    const deletedEquipmentType =
                        studyUpdatedForce.eventData.headers[
                            'deletedEquipmentType'
                        ];
                    if (deletedEquipmentId && deletedEquipmentType) {
                        console.info(
                            'removing equipment with id=',
                            deletedEquipmentId,
                            ' and type=',
                            deletedEquipmentType,
                            ' from the network'
                        );
                        network.removeEquipment(
                            deletedEquipmentType,
                            deletedEquipmentId
                        );
                    }
                }
            }
        }
    }, [studyUpdatedForce, updateNetwork, network, dispatch]);

    return (
        <WaitingLoader
            errMessage={
                studyErrorMessage || networkLoadingFailMessage || errorMessage
            }
            loading={studyPending || !network}
            message={'LoadingRemoteData'}
        >
            <StudyPane
                studyUuid={studyUuid}
                network={network}
                currentNode={currentNode}
                view={view}
                onChangeTab={onChangeTab}
                updatedLines={updatedLines}
                loadFlowInfos={loadFlowInfos}
                securityAnalysisStatus={securityAnalysisStatus}
                sensiStatus={sensiStatus}
                shortCircuitStatus={shortCircuitStatus}
                runnable={runnable}
                setErrorMessage={setErrorMessage}
            />
        </WaitingLoader>
    );
}

StudyContainer.propTypes = {
    view: PropTypes.any,
    onChangeTab: PropTypes.func,
};
