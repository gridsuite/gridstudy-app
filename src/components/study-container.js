/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import StudyPane from './study-pane';
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
    setDeletedEquipment,
    setUpdatedSubstationsIds,
} from '../redux/actions';
import Network from './network/network';
import { equipments } from './network/network-equipments';
import WaitingLoader from './util/waiting-loader';
import { useIntlRef, useSnackMessage } from '@gridsuite/commons-ui';
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
import { directoriesNotificationType } from '../utils/directories-notification-type';

function isWorthUpdate(
    studyUpdatedForce,
    fetcher,
    lastUpdateRef,
    nodeUuidRef,
    nodeUuid,
    invalidations
) {
    const headers = studyUpdatedForce?.eventData?.headers;
    const updateType = headers?.[UPDATE_TYPE_HEADER];
    const node = headers?.['node'];
    const nodes = headers?.['nodes'];
    if (nodeUuidRef.current !== nodeUuid) {
        return true;
    }
    if (fetcher && lastUpdateRef.current?.fetcher !== fetcher) {
        return true;
    }
    if (
        studyUpdatedForce &&
        lastUpdateRef.current?.studyUpdatedForce === studyUpdatedForce
    ) {
        return false;
    }
    if (!updateType) {
        return false;
    }
    if (invalidations.indexOf(updateType) <= -1) {
        return false;
    }
    if (node === undefined && nodes === undefined) {
        return true;
    }
    if (node === nodeUuid || nodes?.indexOf(nodeUuid) !== -1) {
        return true;
    }

    return false;
}

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
        setErrorMessage(undefined);
        fetcher(studyUuid, nodeUuid)
            .then((res) => {
                if (nodeUuidRef.current === nodeUuid) {
                    setResult(resultConversion ? resultConversion(res) : res);
                }
            })
            .catch((err) => {
                setErrorMessage(err.message);
            })
            .finally(() => setIsPending(false));
    }, [nodeUuid, studyUuid, fetcher, resultConversion]);

    /* initial fetch and update */
    useEffect(() => {
        if (!studyUuid || !nodeUuid) return;
        const isUpdateForUs = isWorthUpdate(
            studyUpdatedForce,
            fetcher,
            lastUpdateRef,
            nodeUuidRef,
            nodeUuid,
            invalidations
        );
        lastUpdateRef.current = { studyUpdatedForce, fetcher };
        if (nodeUuidRef.current !== nodeUuid || isUpdateForUs) {
            update();
        }
    }, [
        update,
        fetcher,
        nodeUuid,
        invalidations,
        studyUpdatedForce,
        studyUuid,
    ]);

    return [result, isPending, errorMessage, update];
}

function useStudy(studyUuidRequest) {
    const [studyUuid, setStudyUuid] = useState(undefined);
    const [pending, setPending] = useState(true);
    const [errMessage, setErrMessage] = useState(undefined);
    const intlRef = useIntlRef();

    useEffect(() => {
        fetchStudyExists(studyUuidRequest)
            .then(() => {
                setStudyUuid(studyUuidRequest);
            })
            .catch((error) => {
                if (error.status === 404) {
                    setErrMessage(
                        intlRef.current.formatMessage(
                            { id: 'studyNotFound' },
                            { studyUuid: studyUuidRequest }
                        )
                    );
                } else {
                    setErrMessage(error.message);
                }
            })
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
export const UPDATE_TYPE_HEADER = 'updateType';
const ERROR_HEADER = 'error';
const USER_HEADER = 'userId';
// the delay before we consider the WS truly connected
const DELAY_BEFORE_WEBSOCKET_CONNECTED = 12000;

export function StudyContainer({ view, onChangeTab }) {
    const websocketExpectedCloseRef = useRef();

    const [studyUuid, studyPending, studyErrorMessage] = useStudy(
        decodeURIComponent(useParams().studyUuid)
    );

    const [studyName, setStudyName] = useState();
    const prevStudyName = usePrevious(studyName);
    const [studyPath, setStudyPath] = useState();
    const prevStudyPath = usePrevious(studyPath);

    // using a ref because this is not used for rendering, it is used in the websocket onMessage()
    const studyParentDirectoriesUuidsRef = useRef([]);

    const network = useSelector((state) => state.network);
    const userName = useSelector((state) => state.user.profile.sub);

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

    const studyUpdatedForce = useSelector((state) => state.studyUpdated);

    const [wsConnected, setWsConnected] = useState(false);

    const { snackError, snackWarning, snackInfo } = useSnackMessage();

    const intl = useIntl();

    const wsRef = useRef();

    const displayErrorNotifications = useCallback(
        (eventData) => {
            const updateTypeHeader = eventData.headers[UPDATE_TYPE_HEADER];
            const errorMessage = eventData.headers[ERROR_HEADER];
            const userId = eventData.headers[USER_HEADER];
            if (userId !== userName) return;
            if (updateTypeHeader === 'buildFailed') {
                snackError({
                    headerId: 'NodeBuildingError',
                    messageTxt: errorMessage,
                });
            }
            if (updateTypeHeader === 'securityAnalysis_failed') {
                snackError({
                    headerId: 'securityAnalysisError',
                    messageTxt: errorMessage,
                });
            }
            if (updateTypeHeader === 'sensitivityAnalysis_failed') {
                snackError({
                    headerId: 'sensitivityAnalysisError',
                    messageTxt: errorMessage,
                });
            }
            if (updateTypeHeader === 'shortCircuitAnalysis_failed') {
                snackError({
                    headerId: 'ShortCircuitAnalysisError',
                    messageTxt: errorMessage,
                });
            }
        },
        [snackError, userName]
    );

    const connectNotifications = useCallback(
        (studyUuid) => {
            console.info(`Connecting to notifications '${studyUuid}'...`);

            const ws = connectNotificationsWebsocket(studyUuid, {
                // this option set the minimum duration being connected before reset the retry count to 0
                minUptime: DELAY_BEFORE_WEBSOCKET_CONNECTED,
            });
            ws.onmessage = function (event) {
                const eventData = JSON.parse(event.data);
                displayErrorNotifications(eventData);
                dispatch(studyUpdated(eventData));
            };
            ws.onclose = function (event) {
                if (!websocketExpectedCloseRef.current) {
                    console.error('Unexpected Notification WebSocket closed');
                    setWsConnected(false);
                }
            };
            ws.onerror = function (event) {
                console.error('Unexpected Notification WebSocket error', event);
            };
            ws.onopen = function (event) {
                console.log('Notification WebSocket opened');
                // we want to reload the network when the websocket is (re)connected after loosing connection
                // but to prevent reload network loop, we added a delay before considering the WS truly connected
                if (ws.retryCount === 0) {
                    // first connection at startup
                    setWsConnected(true);
                } else {
                    setTimeout(() => {
                        if (ws.retryCount === 0) {
                            // we enter here only if the WS is up for more than DELAY_BEFORE_WEBSOCKET_CONNECTED
                            setWsConnected(true);
                        }
                    }, DELAY_BEFORE_WEBSOCKET_CONNECTED);
                }
            };
            return ws;
        },
        // Note: dispatch doesn't change
        [dispatch, displayErrorNotifications]
    );

    const fetchStudyPath = useCallback(() => {
        fetchPath(studyUuid)
            .then((response) => {
                const parentDirectoriesNames = response
                    .slice(1)
                    .map((parent) => parent.elementName);
                const parentDirectoriesUuid = response
                    .slice(1)
                    .map((parent) => parent.elementUuid);
                studyParentDirectoriesUuidsRef.current = parentDirectoriesUuid;

                const studyName = response[0]?.elementName;
                const path = computeFullPath(parentDirectoriesNames);
                setStudyName(studyName);
                setStudyPath(path);

                document.title = computePageTitle(
                    initialTitle,
                    studyName,
                    parentDirectoriesNames
                );
            })
            .catch((error) => {
                document.title = initialTitle;
                snackError({
                    messageTxt: error.message,
                    headerId: 'LoadStudyAndParentsInfoError',
                });
            });
    }, [initialTitle, snackError, studyUuid]);

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
            if (eventData.headers) {
                if (
                    eventData.headers['notificationType'] ===
                    directoriesNotificationType.UPDATE_DIRECTORY
                ) {
                    // TODO: this receives notifications for all the public directories and all the user's private directories
                    // At least we don't fetch everytime a notification is received, but we should instead limit the
                    // number of notifications (they are sent to all the clients every time). Here we are only
                    // interested in changes in parent directories of the study (study is moved, or any parent is moved
                    // or renamed)
                    if (
                        studyParentDirectoriesUuidsRef.current.includes(
                            eventData.headers['directoryUuid']
                        )
                    ) {
                        fetchStudyPath();
                    }
                }
            }
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
    }, [dispatch, fetchStudyPath]);

    const displayNetworkLoadingFailMessage = useCallback((error) => {
        console.error(error.message);
        setNetworkLoadingFailMessage(error.message);
    }, []);

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
            .catch((error) => {
                if (error.status === 404) {
                    snackError({
                        headerId: 'StudyUnrecoverableStateRecreate',
                    });
                } else {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'NetworkModificationTreeLoadError',
                    });
                }
            })
            .finally(() =>
                console.debug('Network modification tree loading finished')
            );
        // Note: studyUuid and dispatch don't change
    }, [studyUuid, dispatch, snackError, snackWarning]);

    useEffect(() => {
        if (studyUuid) {
            loadTree();
        }
    }, [studyUuid, loadTree]);

    function parseStudyNotification(studyUpdatedForce) {
        const substationsIds =
            studyUpdatedForce.eventData.headers['substationsIds'];
        const substationsIdsArray = substationsIds
            .substring(1, substationsIds.length - 1)
            .split(', ');

        const deletedEquipmentId =
            studyUpdatedForce.eventData.headers['deletedEquipmentId'];
        const deletedEquipmentType =
            studyUpdatedForce.eventData.headers['deletedEquipmentType'];

        return [
            substationsIdsArray,
            { id: deletedEquipmentId, type: deletedEquipmentType },
        ];
    }

    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            if (
                studyUpdatedForce.eventData.headers[UPDATE_TYPE_HEADER] ===
                'study'
            ) {
                // study partial update :
                // loading equipments involved in the study modification and updating the network
                const [substationsIds, deletedEquipment] =
                    parseStudyNotification(studyUpdatedForce);

                // updating data related to impacted substations
                if (substationsIds?.length > 0) {
                    console.info('Reload network equipments');
                    network.reloadImpactedSubstationsEquipments(
                        studyUuid,
                        currentNodeRef.current,
                        substationsIds
                    );
                    dispatch(setUpdatedSubstationsIds(substationsIds));
                }

                // removing deleted equipment from the network
                if (deletedEquipment?.id && deletedEquipment?.type) {
                    console.info(
                        'removing equipment with id=',
                        deletedEquipment?.id,
                        ' and type=',
                        deletedEquipment?.type,
                        ' from the network'
                    );
                    network.removeEquipment(
                        deletedEquipment?.type,
                        deletedEquipment?.id
                    );
                    dispatch(setDeletedEquipment(deletedEquipment));
                }
            }
        }
    }, [studyUpdatedForce, network, studyUuid, dispatch]);

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
        },
        [currentNode, studyUuid, displayNetworkLoadingFailMessage, dispatch]
    );

    //handles map automatic mode network reload
    useEffect(() => {
        if (!wsConnected) return;
        let previousCurrentNode = currentNodeRef.current;
        currentNodeRef.current = currentNode;
        // if only node renaming, do not reload network
        if (isNodeRenamed(previousCurrentNode, currentNode)) return;
        if (!isNodeBuilt(currentNode)) return;
        if (
            !network ||
            previousCurrentNode?.id !== currentNode?.id ||
            (!isNodeBuilt(previousCurrentNode) && isNodeBuilt(currentNode))
        ) {
            loadNetwork(true);
        }
    }, [loadNetwork, currentNode, network, wsConnected]);

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
                    oldStudyName: prevStudyName,
                    studyName: studyName,
                },
            });
        }
    }, [snackInfo, studyName, studyPath, prevStudyPath, prevStudyName]);

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

            // study cleanup at unmount event
            return function () {
                websocketExpectedCloseRef.current = true;
                ws.close();
                wsDirectory.close();
                dispatch(closeStudy());
                dispatch(filteredNominalVoltagesUpdated(null));
            };
        }
        // Note: dispach, loadGeoData
        // connectNotifications don't change
    }, [
        dispatch,
        studyUuid,
        connectNotifications,
        connectDeletedStudyNotifications,
    ]);

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
