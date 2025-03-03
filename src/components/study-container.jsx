/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import StudyPane from './study-pane';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { PARAMS_LOADED } from '../utils/config-params';
import {
    closeStudy,
    loadNetworkModificationTreeSuccess,
    openStudy,
    resetEquipments,
    resetEquipmentsPostLoadflow,
    setCurrentRootNetworkUuid,
    setCurrentTreeNode,
    setStudyIndexationStatus,
    studyUpdated,
} from '../redux/actions';
import { fetchRootNetworks } from 'services/root-network';

import WaitingLoader from './utils/waiting-loader';
import { fetchDirectoryElementPath, useIntlRef, usePrevious, useSnackMessage } from '@gridsuite/commons-ui';
import NetworkModificationTreeModel from './graph/network-modification-tree-model';
import { getFirstNodeOfType, isNodeBuilt, isNodeRenamed, isSameNode } from './graph/util/model-functions';
import { computeFullPath, computePageTitle } from '../utils/compute-title';
import { directoriesNotificationType } from '../utils/directories-notification-type';
import { BUILD_STATUS } from './network/constants';
import { connectNotificationsWebsocket } from '../services/study-notification';
import {
    connectDeletedStudyNotificationsWebsocket,
    connectNotificationsWsUpdateDirectories,
} from '../services/directory-notification';
import { useAllComputingStatus } from './computing-status/use-all-computing-status';
import { fetchCaseName, fetchStudyExists } from '../services/study/index';
import { fetchNetworkModificationTree } from '../services/study/tree-subtree';
import { fetchNetworkExistence, fetchStudyIndexationStatus } from '../services/study/network';
import { recreateStudyNetwork, reindexAllStudy } from 'services/study/study';

import { HttpStatusCode } from 'utils/http-status-code';
import { StudyIndexationStatus } from 'redux/reducer';
import { NodeType } from './graph/tree-node.type';
import { UPDATE_TYPE_HEADER } from './use-node-data';

function useStudy(studyUuidRequest) {
    const dispatch = useDispatch();
    const [studyUuid, setStudyUuid] = useState(undefined);
    const [pending, setPending] = useState(true);
    const [errMessage, setErrMessage] = useState(undefined);
    const intlRef = useIntlRef();

    useEffect(() => {
        fetchStudyExists(studyUuidRequest)
            .then(() => {
                setStudyUuid(studyUuidRequest);

                // Fetch root networks and set the first one as the current root network
                fetchRootNetworks(studyUuidRequest)
                    .then((rootNetworks) => {
                        if (rootNetworks && rootNetworks.length > 0) {
                            // Validate that currentRootNetworkUuid is set
                            dispatch(setCurrentRootNetworkUuid(rootNetworks[0].rootNetworkUuid));
                        } else {
                            // Handle case where no root networks are available
                            setErrMessage(
                                intlRef.current.formatMessage(
                                    { id: 'rootNetworkNotFound' },
                                    { studyUuid: studyUuidRequest }
                                )
                            );
                        }
                    })
                    .catch((error) => {
                        // Handle errors when fetching root networks
                        setErrMessage(
                            intlRef.current.formatMessage(
                                { id: 'rootNetworkNotFound' },
                                { studyUuid: studyUuidRequest }
                            )
                        );
                    });
            })
            .catch((error) => {
                // Handle errors when fetching study existence
                if (error.status === HttpStatusCode.NOT_FOUND) {
                    setErrMessage(
                        intlRef.current.formatMessage({ id: 'studyNotFound' }, { studyUuid: studyUuidRequest })
                    );
                } else {
                    setErrMessage(error.message);
                }
            })
            .finally(() => setPending(false));
    }, [studyUuidRequest, dispatch, intlRef]);

    return [studyUuid, pending, errMessage];
}

const UPDATE_TYPE_STUDY_NETWORK_RECREATION_DONE = 'study_network_recreation_done';
const UPDATE_TYPE_INDEXATION_STATUS = 'indexation_status_updated';
const HEADER_INDEXATION_STATUS = 'indexation_status';

const ERROR_HEADER = 'error';
const USER_HEADER = 'userId';
// the delay before we consider the WS truly connected
const DELAY_BEFORE_WEBSOCKET_CONNECTED = 12000;

export function StudyContainer({ view, onChangeTab }) {
    const websocketExpectedCloseRef = useRef();
    const intlRef = useIntlRef();

    const [studyUuid, studyPending, studyErrorMessage] = useStudy(decodeURIComponent(useParams().studyUuid));

    const [studyName, setStudyName] = useState();
    const prevStudyName = usePrevious(studyName);
    const [studyPath, setStudyPath] = useState();
    const prevStudyPath = usePrevious(studyPath);

    // using a ref because this is not used for rendering, it is used in the websocket onMessage()
    const studyParentDirectoriesUuidsRef = useRef([]);

    const userName = useSelector((state) => state.user.profile.sub);
    const paramsLoaded = useSelector((state) => state[PARAMS_LOADED]);

    const [errorMessage, setErrorMessage] = useState(undefined);

    // For the first network existence check and indexation check StudyPane is not rendered until network is found
    // then those states will be true even after root network change
    const [isFirstStudyNetworkFound, setIsFirstStudyNetworkFound] = useState(false);
    const [isFirstStudyIndexationFound, setIsFirstStudyIndexationFound] = useState(false);

    const studyIndexationStatus = useSelector((state) => state.studyIndexationStatus);
    const studyIndexationStatusRef = useRef();
    studyIndexationStatusRef.current = studyIndexationStatus;

    const [initialTitle] = useState(document.title);

    const dispatch = useDispatch();

    const currentNode = useSelector((state) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state) => state.currentRootNetworkUuid);

    const currentNodeRef = useRef();
    const currentRootNetworkUuidRef = useRef();

    useAllComputingStatus(studyUuid, currentNode?.id, currentRootNetworkUuid);

    const studyUpdatedForce = useSelector((state) => state.studyUpdated);

    const [wsConnected, setWsConnected] = useState(false);

    const { snackError, snackWarning, snackInfo } = useSnackMessage();

    const wsRef = useRef();

    const displayErrorNotifications = useCallback(
        (eventData) => {
            const updateTypeHeader = eventData.headers[UPDATE_TYPE_HEADER];
            const errorMessage = eventData.headers[ERROR_HEADER];
            const rootNetworkUuidFromNotif = eventData.headers['rootNetwork'];

            const userId = eventData.headers[USER_HEADER];
            if (userId != null && userId !== userName) {
                return;
            }
            if (rootNetworkUuidFromNotif !== currentRootNetworkUuidRef.current) {
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
            if (updateTypeHeader === 'nonEvacuatedEnergy_failed') {
                snackError({
                    headerId: 'nonEvacuatedEnergyAnalysisError',
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
                    headerId: 'DynamicSimulationRunError',
                    messageTxt: errorMessage,
                });
            }
            if (updateTypeHeader === 'dynamicSecurityAnalysis_failed') {
                snackError({
                    headerId: 'DynamicSecurityAnalysisRunError',
                    messageTxt: errorMessage,
                });
            }
            if (updateTypeHeader === 'voltageInit_failed') {
                snackError({
                    headerId: 'voltageInitError',
                    messageTxt: errorMessage,
                });
            }
            if (updateTypeHeader === 'voltageInit_cancel_failed') {
                snackError({
                    headerId: 'voltageInitCancelError',
                });
            }
            if (updateTypeHeader === 'stateEstimation_failed') {
                snackError({
                    headerId: 'stateEstimationError',
                    messageTxt: errorMessage,
                });
            }
        },
        [snackError, userName]
    );

    const sendAlert = useCallback(
        (eventData) => {
            const userId = eventData.headers[USER_HEADER];
            const rootNetworkUuidFromNotif = eventData.headers['rootNetwork'];
            if (currentRootNetworkUuidRef.current !== rootNetworkUuidFromNotif && rootNetworkUuidFromNotif) {
                return;
            }
            if (userId !== userName) {
                return;
            }
            const payload = JSON.parse(eventData.payload);
            let snackMethod;
            if (payload.alertLevel === 'WARNING') {
                snackMethod = snackWarning;
            } else if (payload.alertLevel === 'ERROR') {
                snackMethod = snackError;
            } else {
                snackMethod = snackInfo;
            }
            snackMethod({
                messageId: payload.messageId,
                messageValues: payload.attributes,
            });
        },
        [snackInfo, snackWarning, snackError, userName]
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
                const updateTypeHeader = eventData.headers[UPDATE_TYPE_HEADER];
                if (updateTypeHeader === 'STUDY_ALERT') {
                    sendAlert(eventData);
                    return; // here, we do not want to update the redux state
                }
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
        [dispatch, displayErrorNotifications, sendAlert]
    );

    const fetchStudyPath = useCallback(() => {
        fetchDirectoryElementPath(studyUuid)
            .then((response) => {
                const parentDirectoriesNames = response
                    .slice(0, response.length - 1)
                    .map((parent) => parent.elementName);
                const parentDirectoriesUuid = response
                    .slice(0, response.length - 1)
                    .map((parent) => parent.elementUuid);
                studyParentDirectoriesUuidsRef.current = parentDirectoriesUuid;

                const studyName = response[response.length - 1]?.elementName;
                const path = computeFullPath(parentDirectoriesNames);
                setStudyName(studyName);
                setStudyPath(path);

                document.title = computePageTitle(initialTitle, studyName, parentDirectoriesNames);
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
                if (eventData.headers['notificationType'] === directoriesNotificationType.UPDATE_DIRECTORY) {
                    // TODO: this receives notifications for all the public directories and all the user's private directories
                    // At least we don't fetch everytime a notification is received, but we should instead limit the
                    // number of notifications (they are sent to all the clients every time). Here we are only
                    // interested in changes in parent directories of the study (study is moved, or any parent is moved
                    // or renamed)
                    if (studyParentDirectoriesUuidsRef.current.includes(eventData.headers['directoryUuid'])) {
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

    const loadTree = useCallback(
        (initIndexationStatus) => {
            console.info(`Loading network modification tree of study '${studyUuid}'...`);

            const networkModificationTree = fetchNetworkModificationTree(studyUuid, currentRootNetworkUuid);

            networkModificationTree
                .then((tree) => {
                    const networkModificationTreeModel = new NetworkModificationTreeModel();
                    networkModificationTreeModel.setTreeElements(tree);

                    fetchCaseName(studyUuid, currentRootNetworkUuid)
                        .then((res) => {
                            if (res) {
                                networkModificationTreeModel.setCaseName(res);
                                dispatch(loadNetworkModificationTreeSuccess(networkModificationTreeModel));
                            }
                        })
                        .catch((err) => {
                            snackWarning({
                                headerId: 'CaseNameLoadError',
                            });
                        });
                    // If a current node is already defined then override it cause it could have diferent status in different root networks
                    if (currentNodeRef.current) {
                        // Find the updated current node in the tree model
                        const ModelLastSelectedNode = {
                            ...networkModificationTreeModel.treeNodes.find(
                                (node) => node.id === currentNodeRef.current?.id
                            ),
                        };
                        // then override it
                        dispatch(setCurrentTreeNode(ModelLastSelectedNode));
                        return;
                    }

                    // Select root node by default
                    let firstSelectedNode = getFirstNodeOfType(tree, NodeType.ROOT);
                    // if reindexation is ongoing then stay on root node, all variants will be removed
                    // if indexation is done then look for the next built node.
                    // This is to avoid future fetch on variants removed during reindexation process
                    if (initIndexationStatus === StudyIndexationStatus.INDEXED) {
                        firstSelectedNode =
                            getFirstNodeOfType(tree, NodeType.NETWORK_MODIFICATION, [
                                BUILD_STATUS.BUILT,
                                BUILD_STATUS.BUILT_WITH_WARNING,
                                BUILD_STATUS.BUILT_WITH_ERROR,
                            ]) || firstSelectedNode;
                    }

                    // To get positions we must get the node from the model class
                    const ModelFirstSelectedNode = {
                        ...networkModificationTreeModel.treeNodes.find((node) => node.id === firstSelectedNode.id),
                    };
                    dispatch(setCurrentTreeNode(ModelFirstSelectedNode));
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'NetworkModificationTreeLoadError',
                    });
                })
                .finally(() => console.debug('Network modification tree loading finished'));
            // Note: studyUuid and dispatch don't change
        },
        [studyUuid, currentRootNetworkUuid, dispatch, snackError, snackWarning]
    );

    const checkStudyIndexation = useCallback(() => {
        return fetchStudyIndexationStatus(studyUuid, currentRootNetworkUuid)
            .then((status) => {
                switch (status) {
                    case StudyIndexationStatus.INDEXED: {
                        dispatch(setStudyIndexationStatus(status));
                        setIsFirstStudyIndexationFound(true);
                        break;
                    }
                    case StudyIndexationStatus.INDEXING_ONGOING: {
                        dispatch(setStudyIndexationStatus(status));
                        break;
                    }
                    case StudyIndexationStatus.NOT_INDEXED: {
                        dispatch(setStudyIndexationStatus(status));
                        reindexAllStudy(studyUuid, currentRootNetworkUuid)
                            .then(() => setIsFirstStudyIndexationFound(true))
                            .catch((error) => {
                                // unknown error when trying to reindex study
                                snackError({
                                    headerId: 'studyIndexationError',
                                    messageTxt: error,
                                });
                            });
                        break;
                    }
                    default: {
                        snackError({
                            headerId: 'studyIndexationStatusUnknown',
                            headerValues: { status: status },
                        });
                        break;
                    }
                }
                return status;
            })
            .catch(() => {
                // unknown error when checking study indexation status
                snackError({
                    headerId: 'checkstudyIndexationError',
                });
            });
    }, [studyUuid, currentRootNetworkUuid, dispatch, snackError]);

    const checkNetworkExistenceAndRecreateIfNotFound = useCallback(
        (successCallback) => {
            fetchNetworkExistence(studyUuid, currentRootNetworkUuid)
                .then((response) => {
                    if (response.status === HttpStatusCode.OK) {
                        successCallback && successCallback();
                        setIsFirstStudyNetworkFound(true);
                        checkStudyIndexation().then(loadTree);
                    } else {
                        // response.state === NO_CONTENT
                        // if network is not found, we try to recreate study network from existing case
                        setIsFirstStudyNetworkFound(false);
                        recreateStudyNetwork(studyUuid, currentRootNetworkUuid)
                            .then(() => {
                                snackWarning({
                                    headerId: 'recreatingNetworkStudy',
                                });
                            })
                            .catch((error) => {
                                if (error.status === HttpStatusCode.FAILED_DEPENDENCY) {
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
        [studyUuid, currentRootNetworkUuid, checkStudyIndexation, loadTree, snackWarning, intlRef]
    );

    useEffect(() => {
        if (!studyUuid || !currentRootNetworkUuid) {
            return;
        }
        if (
            !isFirstStudyNetworkFound ||
            (currentRootNetworkUuidRef.current && currentRootNetworkUuidRef.current !== currentRootNetworkUuid)
        ) {
            checkNetworkExistenceAndRecreateIfNotFound();
        }
    }, [currentRootNetworkUuid, checkNetworkExistenceAndRecreateIfNotFound, studyUuid, isFirstStudyNetworkFound]);

    // study_network_recreation_done notification
    // checking another time if we can find network, if we do, we display a snackbar info
    useEffect(() => {
        if (studyUpdatedForce.eventData.headers?.[UPDATE_TYPE_HEADER] === UPDATE_TYPE_STUDY_NETWORK_RECREATION_DONE) {
            const successCallback = () =>
                snackInfo({
                    headerId: 'studyNetworkRecovered',
                });

            checkNetworkExistenceAndRecreateIfNotFound(successCallback);
        } else if (studyUpdatedForce.eventData.headers?.[UPDATE_TYPE_HEADER] === UPDATE_TYPE_INDEXATION_STATUS) {
            dispatch(setStudyIndexationStatus(studyUpdatedForce.eventData.headers?.[HEADER_INDEXATION_STATUS]));
            if (studyUpdatedForce.eventData.headers?.[HEADER_INDEXATION_STATUS] === StudyIndexationStatus.INDEXED) {
                snackInfo({
                    headerId: 'studyIndexationDone',
                });
            }
            // notification that the study is not indexed anymore then ask to refresh
            if (studyUpdatedForce.eventData.headers?.[HEADER_INDEXATION_STATUS] === StudyIndexationStatus.NOT_INDEXED) {
                snackWarning({
                    headerId: 'studyIndexationNotIndexed',
                });
            }
        }
    }, [studyUpdatedForce, checkNetworkExistenceAndRecreateIfNotFound, snackInfo, snackWarning, dispatch]);

    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            const rootNetworkUuidFromNotif = studyUpdatedForce.eventData.headers['rootNetwork'];
            if (
                studyUpdatedForce.eventData.headers[UPDATE_TYPE_HEADER] === 'loadflowResult' &&
                rootNetworkUuidFromNotif === currentRootNetworkUuidRef.current
            ) {
                dispatch(resetEquipmentsPostLoadflow());
            }
        }
    }, [studyUpdatedForce, dispatch]);

    //handles map automatic mode network reload
    useEffect(() => {
        if (!wsConnected) {
            return;
        }
        let previousCurrentNode = currentNodeRef.current;
        currentNodeRef.current = currentNode;
        let previousCurrentRootNetworkUuid = currentRootNetworkUuidRef.current;
        // this is the last effect to compare currentRootNetworkUuid and currentRootNetworkUuidRef.current
        // then we can update the currentRootNetworkUuidRef.current
        currentRootNetworkUuidRef.current = currentRootNetworkUuid;
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
            previousCurrentRootNetworkUuid === currentRootNetworkUuid &&
            isSameNode(previousCurrentNode, currentNode) &&
            isNodeBuilt(previousCurrentNode)
        ) {
            return;
        }
        dispatch(resetEquipments());
    }, [currentNode, currentRootNetworkUuid, wsConnected, dispatch]);

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
                studyUpdatedForce.eventData.headers[UPDATE_TYPE_HEADER] === 'metadata_updated'
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
    }, [dispatch, studyUuid, connectNotifications, connectDeletedStudyNotifications]);

    return (
        <WaitingLoader
            errMessage={studyErrorMessage || errorMessage}
            loading={studyPending || !paramsLoaded || !isFirstStudyNetworkFound || !isFirstStudyIndexationFound} // we wait for the user params to be loaded because it can cause some bugs (e.g. with lineFullPath for the map)
            message={'LoadingRemoteData'}
        >
            <StudyPane
                studyUuid={studyUuid}
                currentNode={currentNode}
                view={view}
                currentRootNetworkUuid={currentRootNetworkUuid}
                onChangeTab={onChangeTab}
            />
        </WaitingLoader>
    );
}

StudyContainer.propTypes = {
    view: PropTypes.any,
    onChangeTab: PropTypes.func,
};
