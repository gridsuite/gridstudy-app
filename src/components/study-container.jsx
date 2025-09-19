/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import StudyPane from './study-pane';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { PARAMS_LOADED } from '../utils/config-params';
import {
    closeStudy,
    loadNetworkModificationTreeSuccess,
    openStudy,
    resetEquipmentsPostComputation,
    setCurrentRootNetworkUuid,
    setCurrentTreeNode,
    setMonoRootStudy,
    setRootNetworkIndexationStatus,
    setRootNetworks,
    studyUpdated,
} from '../redux/actions';
import { fetchRootNetworks } from 'services/root-network';

import WaitingLoader from './utils/waiting-loader';
import { NotificationsUrlKeys, useIntlRef, useNotificationsListener, useSnackMessage } from '@gridsuite/commons-ui';
import NetworkModificationTreeModel from './graph/network-modification-tree-model';
import { getFirstNodeOfType } from './graph/util/model-functions';
import { BUILD_STATUS } from './network/constants';
import { useAllComputingStatus } from './computing-status/use-all-computing-status';
import { fetchNetworkModificationTree } from '../services/study/tree-subtree';
import { fetchNetworkExistence, fetchRootNetworkIndexationStatus } from '../services/study/network';
import { fetchStudy, recreateStudyNetwork, reindexAllRootNetwork } from 'services/study/study';

import { HttpStatusCode } from 'utils/http-status-code';
import { NodeType } from './graph/tree-node.type';
import {
    isIndexationStatusNotification,
    isLoadflowResultNotification,
    isStateEstimationResultNotification,
    isStudyNetworkRecreationNotification,
    NotificationType,
    RootNetworkIndexationStatus,
} from 'types/notification-types';
import { useDiagramGridLayout } from 'hooks/use-diagram-grid-layout';

function useStudy(studyUuidRequest) {
    const dispatch = useDispatch();
    const [studyUuid, setStudyUuid] = useState(undefined);
    const [pending, setPending] = useState(true);
    const [errMessage, setErrMessage] = useState(undefined);
    const intlRef = useIntlRef();

    useEffect(() => {
        fetchStudy(studyUuidRequest)
            .then((res) => {
                setStudyUuid(studyUuidRequest);
                dispatch(setMonoRootStudy(res.monoRoot));

                // Fetch root networks and set the first one as the current root network
                fetchRootNetworks(studyUuidRequest)
                    .then((rootNetworks) => {
                        if (rootNetworks && rootNetworks.length > 0) {
                            // Validate that currentRootNetworkUuid is set
                            dispatch(setCurrentRootNetworkUuid(rootNetworks[0].rootNetworkUuid));
                            dispatch(setRootNetworks(rootNetworks));
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

const ERROR_HEADER = 'error';
const USER_HEADER = 'userId';

export function StudyContainer({ view, onChangeTab }) {
    const websocketExpectedCloseRef = useRef();
    const intlRef = useIntlRef();

    const [studyUuid, studyPending, studyErrorMessage] = useStudy(decodeURIComponent(useParams().studyUuid));

    const userName = useSelector((state) => state.user.profile.sub);
    const paramsLoaded = useSelector((state) => state[PARAMS_LOADED]);

    const [errorMessage, setErrorMessage] = useState(undefined);

    // For the first network existence check and indexation check StudyPane is not rendered until network is found
    // then those states will be true even after root network change
    const [isFirstStudyNetworkFound, setIsFirstStudyNetworkFound] = useState(false);
    const [isFirstRootNetworkIndexationFound, setIsFirstRootNetworkIndexationFound] = useState(false);

    const rootNetworkIndexationStatus = useSelector((state) => state.rootNetworkIndexationStatus);
    const rootNetworkIndexationStatusRef = useRef();
    rootNetworkIndexationStatusRef.current = rootNetworkIndexationStatus;

    const dispatch = useDispatch();

    const currentNode = useSelector((state) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state) => state.currentRootNetworkUuid);

    const currentNodeRef = useRef();
    const currentRootNetworkUuidRef = useRef();

    useAllComputingStatus(studyUuid, currentNode?.id, currentRootNetworkUuid);

    useDiagramGridLayout();

    const studyUpdatedForce = useSelector((state) => state.studyUpdated);

    const { snackError, snackWarning, snackInfo } = useSnackMessage();

    const displayErrorNotifications = useCallback(
        (eventData) => {
            const updateTypeHeader = eventData.headers.updateType;
            const errorMessage = eventData.headers[ERROR_HEADER];
            const rootNetworkUuidFromNotif = eventData.headers.rootNetworkUuid;

            const userId = eventData.headers[USER_HEADER];
            if (userId != null && userId !== userName) {
                return;
            }
            if (rootNetworkUuidFromNotif !== currentRootNetworkUuidRef.current) {
                return;
            }

            if (updateTypeHeader === NotificationType.LOADFLOW_FAILED) {
                snackError({
                    headerId: 'LoadFlowError',
                    messageTxt: errorMessage,
                });
            }
            if (updateTypeHeader === NotificationType.NODE_BUILD_FAILED) {
                snackError({
                    headerId: 'NodeBuildingError',
                    messageTxt: errorMessage,
                });
            }
            if (updateTypeHeader === NotificationType.SECURITY_ANALYSIS_FAILED) {
                snackError({
                    headerId: 'securityAnalysisError',
                    messageTxt: errorMessage,
                });
            }
            if (updateTypeHeader === NotificationType.SENSITIVITY_ANALYSIS_FAILED) {
                snackError({
                    headerId: 'sensitivityAnalysisError',
                    messageTxt: errorMessage,
                });
            }
            if (updateTypeHeader === NotificationType.NON_EVACUATED_ENERGY_ANALYSIS_FAILED) {
                snackError({
                    headerId: 'nonEvacuatedEnergyAnalysisError',
                    messageTxt: errorMessage,
                });
            }
            if (
                updateTypeHeader === NotificationType.SHORTCIRCUIT_ANALYSIS_FAILED ||
                updateTypeHeader === NotificationType.ONE_BUS_SC_ANALYSIS_FAILED
            ) {
                snackError({
                    headerId: 'ShortCircuitAnalysisError',
                    messageTxt: errorMessage,
                });
            }
            if (updateTypeHeader === NotificationType.DYNAMIC_SIMULATION_FAILED) {
                snackError({
                    headerId: 'DynamicSimulationRunError',
                    messageTxt: errorMessage,
                });
            }
            if (updateTypeHeader === NotificationType.DYNAMIC_SECURITY_ANALYSIS_FAILED) {
                snackError({
                    headerId: 'DynamicSecurityAnalysisRunError',
                    messageTxt: errorMessage,
                });
            }
            if (updateTypeHeader === NotificationType.VOLTAGE_INIT_FAILED) {
                snackError({
                    headerId: 'voltageInitError',
                    messageTxt: errorMessage,
                });
            }
            if (updateTypeHeader === NotificationType.VOLTAGE_INIT_CANCEL_FAILED) {
                snackError({
                    headerId: 'voltageInitCancelError',
                });
            }
            if (updateTypeHeader === NotificationType.STATE_ESTIMATION_FAILED) {
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
            const rootNetworkUuidFromNotif = eventData.headers.rootNetworkUuid;
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

    const handleStudyUpdate = useCallback(
        (event) => {
            const eventData = JSON.parse(event.data);
            const updateTypeHeader = eventData.headers.updateType;
            if (updateTypeHeader === NotificationType.STUDY_ALERT) {
                sendAlert(eventData);
                return; // here, we do not want to update the redux state
            }
            displayErrorNotifications(eventData);
            dispatch(studyUpdated(eventData));
        },
        // Note: dispatch doesn't change
        [dispatch, displayErrorNotifications, sendAlert]
    );

    useNotificationsListener(NotificationsUrlKeys.STUDY, { listenerCallbackMessage: handleStudyUpdate });

    const closeWindow = useCallback(() => {
        window.close();
    }, []);

    //Study deletion notification
    useNotificationsListener(NotificationsUrlKeys.DIRECTORY_DELETE_STUDY, {
        listenerCallbackMessage: closeWindow,
    });

    const loadTree = useCallback(
        (initIndexationStatus) => {
            console.info(`Loading network modification tree of study '${studyUuid}'...`);

            const networkModificationTree = fetchNetworkModificationTree(studyUuid, currentRootNetworkUuid);

            networkModificationTree
                .then((tree) => {
                    const networkModificationTreeModel = new NetworkModificationTreeModel();
                    networkModificationTreeModel.setTreeElements(tree);
                    dispatch(loadNetworkModificationTreeSuccess(networkModificationTreeModel));

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
                    if (initIndexationStatus === RootNetworkIndexationStatus.INDEXED) {
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
        [studyUuid, currentRootNetworkUuid, dispatch, snackError]
    );

    const checkRootNetworkIndexation = useCallback(() => {
        return fetchRootNetworkIndexationStatus(studyUuid, currentRootNetworkUuid)
            .then((status) => {
                switch (status) {
                    case RootNetworkIndexationStatus.INDEXED: {
                        dispatch(setRootNetworkIndexationStatus(status));
                        setIsFirstRootNetworkIndexationFound(true);
                        break;
                    }
                    case RootNetworkIndexationStatus.INDEXING_ONGOING: {
                        dispatch(setRootNetworkIndexationStatus(status));
                        break;
                    }
                    case RootNetworkIndexationStatus.NOT_INDEXED: {
                        dispatch(setRootNetworkIndexationStatus(status));
                        reindexAllRootNetwork(studyUuid, currentRootNetworkUuid)
                            .then(() => setIsFirstRootNetworkIndexationFound(true))
                            .catch((error) => {
                                // unknown error when trying to reindex root network
                                snackError({
                                    headerId: 'rootNetworkIndexationError',
                                    messageTxt: error,
                                });
                            });
                        break;
                    }
                    default: {
                        snackError({
                            headerId: 'rootNetworkIndexationStatusUnknown',
                            headerValues: { status: status },
                        });
                        break;
                    }
                }
                return status;
            })
            .catch(() => {
                // unknown error when checking root network indexation status
                snackError({
                    headerId: 'checkRootNetworkIndexationError',
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
                        checkRootNetworkIndexation().then(loadTree);
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
        [studyUuid, currentRootNetworkUuid, checkRootNetworkIndexation, loadTree, snackWarning, intlRef]
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

    // checking another time if we can find network, if we do, we display a snackbar info
    useEffect(() => {
        if (isIndexationStatusNotification(studyUpdatedForce.eventData)) {
            const rootNetworkUuidFromNotif = studyUpdatedForce.eventData.headers.rootNetworkUuid;
            if (currentRootNetworkUuidRef.current && rootNetworkUuidFromNotif !== currentRootNetworkUuidRef.current) {
                return;
            }
            dispatch(setRootNetworkIndexationStatus(studyUpdatedForce.eventData.headers.indexation_status));
            if (studyUpdatedForce.eventData.headers.indexation_status === RootNetworkIndexationStatus.INDEXED) {
                snackInfo({
                    headerId: 'rootNetworkIndexationDone',
                });
            }
            // notification that the study is not indexed anymore then ask to refresh
            if (studyUpdatedForce.eventData.headers.indexation_status === RootNetworkIndexationStatus.NOT_INDEXED) {
                snackWarning({
                    headerId: 'rootNetworkIndexationNotIndexed',
                });
            }
        }
        if (isStudyNetworkRecreationNotification(studyUpdatedForce.eventData)) {
            const successCallback = () =>
                snackInfo({
                    headerId: 'studyNetworkRecovered',
                });

            checkNetworkExistenceAndRecreateIfNotFound(successCallback);
        }
    }, [studyUpdatedForce, checkNetworkExistenceAndRecreateIfNotFound, snackInfo, snackWarning, dispatch]);

    useEffect(() => {
        if (
            isLoadflowResultNotification(studyUpdatedForce.eventData) ||
            isStateEstimationResultNotification(studyUpdatedForce.eventData)
        ) {
            const rootNetworkUuidFromNotif = studyUpdatedForce.eventData.headers.rootNetworkUuid;
            if (rootNetworkUuidFromNotif === currentRootNetworkUuidRef.current) {
                dispatch(resetEquipmentsPostComputation());
            }
        }
    }, [studyUpdatedForce, dispatch]);

    useEffect(() => {
        if (studyUuid) {
            websocketExpectedCloseRef.current = false;
            dispatch(openStudy(studyUuid));

            // study cleanup at unmount event
            return function () {
                websocketExpectedCloseRef.current = true;
                dispatch(closeStudy());
            };
        }
        // Note: dispach, loadGeoData
        // connectNotifications don't change
    }, [dispatch, studyUuid]);

    return (
        <WaitingLoader
            errMessage={studyErrorMessage || errorMessage}
            loading={studyPending || !paramsLoaded || !isFirstStudyNetworkFound || !isFirstRootNetworkIndexationFound} // we wait for the user params to be loaded because it can cause some bugs (e.g. with lineFullPath for the map)
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
