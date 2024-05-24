/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useIntlRef, useSnackMessage } from '@gridsuite/commons-ui';
import * as PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { invalidateLoadFlowStatus } from 'services/study/loadflow';
import { recreateStudyNetwork, reindexAllStudy } from 'services/study/study';
import {
    STUDY_INDEXATION_STATUS,
    limitReductionModified,
    loadNetworkModificationTreeSuccess,
    resetEquipments,
    resetEquipmentsPostLoadflow,
    setCurrentTreeNode,
    setStudyIndexationStatus,
    studyUpdated,
} from '../../redux/actions';
import { fetchPath } from '../../services/directory';
import { connectNotificationsWsUpdateDirectories } from '../../services/directory-notification';
import { fetchCaseName } from '../../services/study';
import {
    fetchNetworkExistence,
    fetchStudyIndexationStatus,
} from '../../services/study/network';
import { fetchNetworkModificationTree } from '../../services/study/tree-subtree';
import { computeFullPath, computePageTitle } from '../../utils/compute-title';
import { PARAMS_LOADED } from '../../utils/config-params';
import { directoriesNotificationType } from '../../utils/directories-notification-type';
import { useAllComputingStatus } from '../computing-status/use-all-computing-status';
import NetworkModificationTreeModel from '../graph/network-modification-tree-model';
import {
    getFirstNodeOfType,
    isNodeBuilt,
    isNodeRenamed,
    isSameNode,
} from '../graph/util/model-functions';
import { BUILD_STATUS } from '../network/constants';

import { UUID } from 'crypto';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { ReduxState, StudyUpdatedEventData } from 'redux/reducer.type';
import { HttpStatusCode } from 'utils/http-status-code';
import StudyPane from '../study-pane';
import WaitingLoader from '../utils/waiting-loader';
import usePrevious from './hooks/usePrevious';
import useStudy from './hooks/useStudy';
import useWsConnection from './hooks/useWsConnection';
import { PathType } from './type/path.type';
import { ValueOf } from './type/utils.type';

export const UPDATE_TYPE_HEADER = 'updateType';
const UPDATE_TYPE_STUDY_NETWORK_RECREATION_DONE =
    'study_network_recreation_done';
const UPDATE_TYPE_INDEXATION_STATUS = 'indexation_status_updated';
const HEADER_INDEXATION_STATUS = 'indexation_status';

type StudyContainerProps = { view: unknown; onChangeTab: () => void };
export function StudyContainer({ view, onChangeTab }: StudyContainerProps) {
    const intlRef = useIntlRef();

    const [studyUuid, studyPending, studyErrorMessage] = useStudy(
        decodeURIComponent(useParams().studyUuid ?? '') as UUID
    );
    const wsConnected = useWsConnection(studyUuid);
    const [studyName, setStudyName] = useState<string>();
    const prevStudyName = usePrevious(studyName);
    const [studyPath, setStudyPath] = useState<string>();
    const prevStudyPath = usePrevious(studyPath);

    // using a ref because this is not used for rendering, it is used in the websocket onMessage()
    const studyParentDirectoriesUuidsRef = useRef<UUID[]>([]);

    const paramsLoaded = useSelector(
        (state: ReduxState) => state[PARAMS_LOADED]
    );

    const [errorMessage, setErrorMessage] = useState<string>();

    const [isStudyNetworkFound, setIsStudyNetworkFound] = useState(false);
    const studyIndexationStatus = useSelector(
        (state: ReduxState) => state.studyIndexationStatus
    );

    const [isStudyIndexationPending, setIsStudyIndexationPending] =
        useState(false);

    const [initialTitle] = useState(document.title);

    const dispatch = useDispatch();

    const currentNode = useSelector(
        (state: ReduxState) => state.currentTreeNode
    );
    const previousNode = usePrevious(currentNode);

    useAllComputingStatus(studyUuid, currentNode?.id);

    const studyUpdatedForce = useSelector(
        (state: ReduxState) => state.studyUpdated
    );

    const { snackError, snackWarning, snackInfo } = useSnackMessage();
    const wsRef = useRef<ReconnectingWebSocket>();

    const isLimitReductionModified = useSelector(
        (state: ReduxState) => state.limitReductionModified
    );

    const fetchStudyPath = useCallback(() => {
        (fetchPath(studyUuid) as Promise<PathType[]>)
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

    useEffect(() => {
        // create ws at mount event
        wsRef.current = connectNotificationsWsUpdateDirectories();

        wsRef.current.onmessage = function (event) {
            const eventData: StudyUpdatedEventData = JSON.parse(event.data);
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
                        eventData.headers.directoryUuid &&
                        studyParentDirectoriesUuidsRef.current.includes(
                            eventData.headers.directoryUuid
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

    const loadTree = useCallback(
        (initIndexationStatus: ValueOf<typeof STUDY_INDEXATION_STATUS>) => {
            console.info(
                `Loading network modification tree of study '${studyUuid}'...`
            );

            const networkModificationTree =
                fetchNetworkModificationTree(studyUuid);

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
                        initIndexationStatus === STUDY_INDEXATION_STATUS.INDEXED
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
        },
        [studyUuid, dispatch, snackError, snackWarning]
    );

    const checkStudyIndexation = useCallback(() => {
        setIsStudyIndexationPending(true);
        return fetchStudyIndexationStatus(studyUuid)
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
                return status;
            })
            .catch(() => {
                // unknown error when checking study indexation status
                setIsStudyIndexationPending(false);
                snackError({
                    headerId: 'checkstudyIndexationError',
                });
            });
    }, [studyUuid, dispatch, snackError]);

    const checkNetworkExistenceAndRecreateIfNotFound = useCallback(
        (successCallback?: () => void) => {
            fetchNetworkExistence(studyUuid)
                .then((response) => {
                    if (response.status === HttpStatusCode.OK) {
                        successCallback && successCallback();
                        setIsStudyNetworkFound(true);
                        checkStudyIndexation().then(loadTree);
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
        [studyUuid, checkStudyIndexation, loadTree, snackWarning, intlRef]
    );

    useEffect(() => {
        if (studyUuid && !isStudyNetworkFound) {
            checkNetworkExistenceAndRecreateIfNotFound();
        }
    }, [
        isStudyNetworkFound,
        checkNetworkExistenceAndRecreateIfNotFound,
        studyUuid,
    ]);

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
    ]);

    //handles map automatic mode network reload
    useEffect(() => {
        if (!wsConnected) {
            return;
        }

        // if only node renaming, do not reload network
        if (isNodeRenamed(previousNode, currentNode)) {
            return;
        }
        if (!isNodeBuilt(currentNode)) {
            return;
        }
        // A modification has been added to the currentNode and this one has been built incrementally.
        // No need to load the network because reloadImpactedSubstationsEquipments will be executed in the notification useEffect.
        if (
            isSameNode(previousNode, currentNode) &&
            isNodeBuilt(previousNode)
        ) {
            return;
        }
        dispatch(resetEquipments());
    }, [currentNode, wsConnected, dispatch, previousNode]);

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
                    studyPath: studyPath ?? '',
                },
            });
        }
    }, [snackInfo, studyPath, prevStudyPath]);

    useEffect(() => {
        if (prevStudyName && prevStudyName !== studyName) {
            snackInfo({
                headerId: 'renameStudyNotification',
                headerValues: {
                    oldStudyName: prevStudyName,
                    studyName: studyName ?? '',
                },
            });
        }
    }, [snackInfo, studyName, prevStudyName]);

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
