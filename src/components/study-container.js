/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import StudyPane from './study-pane';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { PARAMS_LOADED } from '../utils/config-params';
import {
    closeStudy,
    loadNetworkModificationTreeSuccess,
    openStudy,
    studyUpdated,
    setCurrentTreeNode,
    setDeletedEquipments,
    setUpdatedSubstationsIds,
    updateEquipments,
    deleteEquipment,
    resetEquipments,
    resetEquipmentsPostLoadflow,
    setStudyIndexationStatus,
    STUDY_INDEXATION_STATUS,
    limitReductionModified,
} from '../redux/actions';
import WaitingLoader from './utils/waiting-loader';
import { useIntlRef, useSnackMessage } from '@gridsuite/commons-ui';
import NetworkModificationTreeModel from './graph/network-modification-tree-model';
import {
    getFirstNodeOfType,
    isNodeBuilt,
    isNodeRenamed,
    isSameNode,
} from './graph/util/model-functions';
import { RunningStatus } from './utils/running-status';
import { computePageTitle, computeFullPath } from '../utils/compute-title';
import { directoriesNotificationType } from '../utils/directories-notification-type';
import {
    BUILD_STATUS,
    MAX_NUMBER_OF_IMPACTED_SUBSTATIONS,
} from './network/constants';
import { connectNotificationsWebsocket } from '../services/study-notification';
import {
    connectDeletedStudyNotificationsWebsocket,
    connectNotificationsWsUpdateDirectories,
} from '../services/directory-notification';
import { fetchPath } from '../services/directory';
import { useAllComputingStatus } from './computing-status/use-all-computing-status';
import { fetchAllEquipments } from '../services/study/network-map';
import { fetchCaseName, fetchStudyExists } from '../services/study';
import { fetchNetworkModificationTree } from '../services/study/tree-subtree';
import {
    fetchNetworkExistence,
    fetchStudyIndexationStatus,
} from '../services/study/network';
import { recreateStudyNetwork, reindexAllStudy } from 'services/study/study';
import { invalidateLoadFlowStatus } from 'services/study/loadflow';

import { HttpStatusCode } from 'utils/http-status-code';

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
                setResult(RunningStatus.FAILED);
            })
            .finally(() => setIsPending(false));
    }, [nodeUuid, fetcher, studyUuid, resultConversion]);

    /* initial fetch and update */
    useEffect(() => {
        if (!studyUuid || !nodeUuid) {
            return;
        }
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
                if (error.status === HttpStatusCode.NOT_FOUND) {
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

export const UPDATE_TYPE_HEADER = 'updateType';
const UPDATE_TYPE_STUDY_NETWORK_RECREATION_DONE =
    'study_network_recreation_done';
const UPDATE_TYPE_INDEXATION_STATUS = 'indexation_status_updated';
const HEADER_INDEXATION_STATUS = 'indexation_status';

const ERROR_HEADER = 'error';
const USER_HEADER = 'userId';
// the delay before we consider the WS truly connected
const DELAY_BEFORE_WEBSOCKET_CONNECTED = 12000;

export function StudyContainer({ view, onChangeTab }) {
    const websocketExpectedCloseRef = useRef();
    const intlRef = useIntlRef();

    const [studyUuid, studyPending, studyErrorMessage] = useStudy(
        decodeURIComponent(useParams().studyUuid)
    );

    const [studyName, setStudyName] = useState();
    const prevStudyName = usePrevious(studyName);
    const [studyPath, setStudyPath] = useState();
    const prevStudyPath = usePrevious(studyPath);

    // using a ref because this is not used for rendering, it is used in the websocket onMessage()
    const studyParentDirectoriesUuidsRef = useRef([]);

    const userName = useSelector((state) => state.user.profile.sub);
    const paramsLoaded = useSelector((state) => state[PARAMS_LOADED]);

    const [errorMessage, setErrorMessage] = useState(undefined);

    const [isStudyNetworkFound, setIsStudyNetworkFound] = useState(false);
    const studyIndexationStatus = useSelector(
        (state) => state.studyIndexationStatus
    );
    const studyIndexationStatusRef = useRef();
    studyIndexationStatusRef.current = studyIndexationStatus;
    const [isStudyIndexationPending, setIsStudyIndexationPending] =
        useState(false);

    const [initialTitle] = useState(document.title);

    const dispatch = useDispatch();

    const currentNode = useSelector((state) => state.currentTreeNode);

    const currentNodeRef = useRef();

    useAllComputingStatus(studyUuid, currentNode?.id);

    const studyUpdatedForce = useSelector((state) => state.studyUpdated);

    const [wsConnected, setWsConnected] = useState(false);

    const { snackError, snackWarning, snackInfo } = useSnackMessage();

    const wsRef = useRef();

    const isLimitReductionModified = useSelector(
        (state) => state.limitReductionModified
    );

    const displayErrorNotifications = useCallback(
        (eventData) => {
            const updateTypeHeader = eventData.headers[UPDATE_TYPE_HEADER];
            const errorMessage = eventData.headers[ERROR_HEADER];
            const userId = eventData.headers[USER_HEADER];
            if (userId !== userName) {
                return;
            }
            if (updateTypeHeader === 'loadflow_failed') {
                snackError({
                    headerId: 'LoadFlowError',
                    messageTxt: errorMessage,
                });
            }
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
            if (
                updateTypeHeader === 'shortCircuitAnalysis_failed' ||
                updateTypeHeader === 'oneBusShortCircuitAnalysis_failed'
            ) {
                snackError({
                    headerId: 'ShortCircuitAnalysisError',
                    messageTxt: errorMessage,
                });
            }
            if (updateTypeHeader === 'dynamicSimulation_failed') {
                snackError({
                    headerId: 'dynamicSimulationError',
                });
            }
            if (updateTypeHeader === 'voltageInit_failed') {
                snackError({
                    headerId: 'voltageInitError',
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
                            dispatch(
                                loadNetworkModificationTreeSuccess(
                                    networkModificationTreeModel
                                )
                            );
                        }
                    })
                    .catch((err) => {
                        snackWarning({
                            headerId: 'CaseNameLoadError',
                        });
                    });

                // Select root node by default
                let firstSelectedNode = getFirstNodeOfType(tree, 'ROOT');
                // if reindexation is ongoing then stay on root node, all variants will be removed
                // if indexation is done then look for the next built node.
                // This is to avoid future fetch on variants removed during reindexation process
                if (
                    studyIndexationStatusRef.current ===
                    STUDY_INDEXATION_STATUS.INDEXED
                ) {
                    firstSelectedNode =
                        getFirstNodeOfType(tree, 'NETWORK_MODIFICATION', [
                            BUILD_STATUS.BUILT,
                            BUILD_STATUS.BUILT_WITH_WARNING,
                            BUILD_STATUS.BUILT_WITH_ERROR,
                        ]) || firstSelectedNode;
                }

                // To get positions we must get the node from the model class
                const ModelFirstSelectedNode = {
                    ...networkModificationTreeModel.treeNodes.find(
                        (node) => node.id === firstSelectedNode.id
                    ),
                };
                dispatch(setCurrentTreeNode(ModelFirstSelectedNode));
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'NetworkModificationTreeLoadError',
                });
            })
            .finally(() =>
                console.debug('Network modification tree loading finished')
            );
        // Note: studyUuid and dispatch don't change
    }, [studyUuid, dispatch, snackError, snackWarning]);

    const checkNetworkExistenceAndRecreateIfNotFound = useCallback(
        (successCallback) => {
            fetchNetworkExistence(studyUuid)
                .then((response) => {
                    if (response.status === HttpStatusCode.OK) {
                        successCallback && successCallback();
                        setIsStudyNetworkFound(true);
                        loadTree();
                    } else {
                        // response.state === NO_CONTENT
                        // if network is not found, we try to recreate study network from existing case
                        setIsStudyNetworkFound(false);
                        recreateStudyNetwork(studyUuid)
                            .then(() => {
                                snackWarning({
                                    headerId: 'recreatingNetworkStudy',
                                });
                            })
                            .catch((error) => {
                                if (
                                    error.status ===
                                    HttpStatusCode.FAILED_DEPENDENCY
                                ) {
                                    // when trying to recreate study network, if case can't be found (424 error), we display an error
                                    setErrorMessage(
                                        intlRef.current.formatMessage({
                                            id: 'invalidStudyError',
                                        })
                                    );
                                } else {
                                    // unknown error when trying to recreate network from study case
                                    setErrorMessage(
                                        intlRef.current.formatMessage({
                                            id: 'networkRecreationError',
                                        })
                                    );
                                }
                            });
                    }
                })
                .catch(() => {
                    // unknown error when checking network existence
                    setErrorMessage(
                        intlRef.current.formatMessage({
                            id: 'checkNetworkExistenceError',
                        })
                    );
                });
        },
        [studyUuid, loadTree, snackWarning, intlRef]
    );

    const checkStudyIndexation = useCallback(() => {
        setIsStudyIndexationPending(true);
        fetchStudyIndexationStatus(studyUuid)
            .then((status) => {
                switch (status) {
                    case STUDY_INDEXATION_STATUS.INDEXED: {
                        dispatch(setStudyIndexationStatus(status));
                        setIsStudyIndexationPending(false);
                        break;
                    }
                    case STUDY_INDEXATION_STATUS.INDEXING_ONGOING: {
                        dispatch(setStudyIndexationStatus(status));
                        break;
                    }
                    case STUDY_INDEXATION_STATUS.NOT_INDEXED: {
                        dispatch(setStudyIndexationStatus(status));
                        reindexAllStudy(studyUuid)
                            .catch((error) => {
                                // unknown error when trying to reindex study
                                snackError({
                                    headerId: 'studyIndexationError',
                                    messageTxt: error,
                                });
                            })
                            .finally(() => {
                                setIsStudyIndexationPending(false);
                            });
                        break;
                    }
                    default: {
                        setIsStudyIndexationPending(false);
                        snackError({
                            headerId: 'studyIndexationStatusUnknown',
                            headerValues: { status: status },
                        });
                        break;
                    }
                }
            })
            .catch(() => {
                // unknown error when checking study indexation status
                setIsStudyIndexationPending(false);
                snackError({
                    headerId: 'checkstudyIndexationError',
                });
            });
    }, [studyUuid, dispatch, snackError]);

    useEffect(() => {
        if (studyUuid && !isStudyNetworkFound) {
            checkNetworkExistenceAndRecreateIfNotFound();
        }
    }, [
        isStudyNetworkFound,
        checkNetworkExistenceAndRecreateIfNotFound,
        studyUuid,
    ]);

    // first time we need to check indexation status by query
    // studyIndexationStatus = STUDY_INDEXATION_STATUS.NOT_INDEXED by default
    useEffect(() => {
        if (studyUuid) {
            checkStudyIndexation();
        }
    }, [checkStudyIndexation, studyUuid]);

    function parseStudyNotification(studyUpdatedForce) {
        const payload = studyUpdatedForce.eventData.payload;
        const substationsIds = payload?.impactedSubstationsIds;
        const deletedEquipments = payload?.deletedEquipments;

        return [substationsIds, deletedEquipments];
    }

    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            if (
                studyUpdatedForce.eventData.headers[UPDATE_TYPE_HEADER] ===
                'study'
            ) {
                // study partial update :
                // loading equipments involved in the study modification and updating the network
                const [substationsIds, deletedEquipments] =
                    parseStudyNotification(studyUpdatedForce);
                if (deletedEquipments?.length > 0) {
                    // removing deleted equipment from the network
                    deletedEquipments.forEach((deletedEquipment) => {
                        if (
                            deletedEquipment?.equipmentId &&
                            deletedEquipment?.equipmentType
                        ) {
                            console.info(
                                'removing equipment with id=',
                                deletedEquipment?.equipmentId,
                                ' and type=',
                                deletedEquipment?.equipmentType,
                                ' from the network'
                            );
                            dispatch(
                                deleteEquipment(
                                    deletedEquipment?.equipmentType,
                                    deletedEquipment?.equipmentId
                                )
                            );
                        }
                    });
                    dispatch(setDeletedEquipments(deletedEquipments));
                }
                // updating data related to impacted substations
                if (substationsIds?.length > 0) {
                    console.info('Reload network equipments');
                    const substationsIdsToFetch =
                        substationsIds?.length >
                        MAX_NUMBER_OF_IMPACTED_SUBSTATIONS
                            ? undefined
                            : substationsIds; // TODO : temporary to fix fetching request failing when number of impacted substations is too high
                    const updatedEquipments = fetchAllEquipments(
                        studyUuid,
                        currentNode?.id,
                        substationsIdsToFetch
                    );

                    updatedEquipments.then((values) => {
                        dispatch(updateEquipments(values));
                    });

                    dispatch(setUpdatedSubstationsIds(substationsIds));
                }
            }
        }
    }, [studyUpdatedForce, currentNode?.id, studyUuid, dispatch]);

    // study_network_recreation_done notification
    // checking another time if we can find network, if we do, we display a snackbar info
    useEffect(() => {
        if (
            studyUpdatedForce.eventData.headers?.[UPDATE_TYPE_HEADER] ===
            UPDATE_TYPE_STUDY_NETWORK_RECREATION_DONE
        ) {
            const successCallback = () =>
                snackInfo({
                    headerId: 'studyNetworkRecovered',
                });

            checkNetworkExistenceAndRecreateIfNotFound(successCallback);
        } else if (
            studyUpdatedForce.eventData.headers?.[UPDATE_TYPE_HEADER] ===
            UPDATE_TYPE_INDEXATION_STATUS
        ) {
            dispatch(
                setStudyIndexationStatus(
                    studyUpdatedForce.eventData.headers?.[
                        HEADER_INDEXATION_STATUS
                    ]
                )
            );
            if (
                studyUpdatedForce.eventData.headers?.[
                    HEADER_INDEXATION_STATUS
                ] === STUDY_INDEXATION_STATUS.INDEXED
            ) {
                snackInfo({
                    headerId: 'studyIndexationDone',
                });
            }
            // notification that the study is not indexed anymore then ask to refresh
            if (
                studyUpdatedForce.eventData.headers?.[
                    HEADER_INDEXATION_STATUS
                ] === STUDY_INDEXATION_STATUS.NOT_INDEXED
            ) {
                snackWarning({
                    headerId: 'studyIndexationNotIndexed',
                });
            }
        }
    }, [
        studyUpdatedForce,
        checkNetworkExistenceAndRecreateIfNotFound,
        snackInfo,
        snackWarning,
        dispatch,
        checkStudyIndexation,
    ]);

    //handles map automatic mode network reload
    useEffect(() => {
        if (!wsConnected) {
            return;
        }
        let previousCurrentNode = currentNodeRef.current;
        currentNodeRef.current = currentNode;
        // if only node renaming, do not reload network
        if (isNodeRenamed(previousCurrentNode, currentNode)) {
            return;
        }
        if (!isNodeBuilt(currentNode)) {
            return;
        }
        // A modification has been added to the currentNode and this one has been built incrementally.
        // No need to load the network because reloadImpactedSubstationsEquipments will be executed in the notification useEffect.
        if (
            isSameNode(previousCurrentNode, currentNode) &&
            isNodeBuilt(previousCurrentNode)
        ) {
            return;
        }
        dispatch(resetEquipments());
    }, [currentNode, wsConnected, dispatch]);

    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            if (
                studyUpdatedForce.eventData.headers[UPDATE_TYPE_HEADER] ===
                'loadflowResult'
            ) {
                dispatch(resetEquipmentsPostLoadflow());
            }
        }
    }, [studyUpdatedForce, dispatch]);

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

    useEffect(() => {
        if (studyUuid) {
            if (isLimitReductionModified) {
                // limit reduction param has changed : we invalidate the load flow status
                invalidateLoadFlowStatus(studyUuid).catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'invalidateLoadFlowStatusError',
                    });
                });
                dispatch(limitReductionModified(false));
            }
        }
    }, [studyUuid, isLimitReductionModified, snackError, dispatch]);

    return (
        <>
            <WaitingLoader
                errMessage={studyErrorMessage || errorMessage}
                loading={
                    studyPending ||
                    !paramsLoaded ||
                    !isStudyNetworkFound ||
                    (studyIndexationStatus !==
                        STUDY_INDEXATION_STATUS.INDEXED &&
                        isStudyIndexationPending)
                } // we wait for the user params to be loaded because it can cause some bugs (e.g. with lineFullPath for the map)
                message={'LoadingRemoteData'}
            >
                <StudyPane
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    view={view}
                    onChangeTab={onChangeTab}
                    setErrorMessage={setErrorMessage}
                />
            </WaitingLoader>
        </>
    );
}

StudyContainer.propTypes = {
    view: PropTypes.any,
    onChangeTab: PropTypes.func,
};
