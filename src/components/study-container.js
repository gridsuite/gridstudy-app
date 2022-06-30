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
    fetchAllEquipments,
    fetchLoadFlowInfos,
    fetchNetworkModificationTree,
    fetchSecurityAnalysisStatus,
    fetchStudyExists,
    fetchPath,
    fetchCaseInfos,
} from '../utils/rest-api';
import {
    closeStudy,
    filteredNominalVoltagesUpdated,
    loadNetworkModificationTreeSuccess,
    networkCreated,
    openStudy,
    studyUpdated,
    setCurrentTreeNode,
} from '../redux/actions';
import Network from './network/network';
import { equipments } from './network/network-equipments';
import WaitingLoader from './util/waiting-loader';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
    useSnackMessage,
} from '../utils/messages';
import NetworkModificationTreeModel from './graph/network-modification-tree-model';
import { getFirstNodeOfType, isNodeBuilt } from './graph/util/model-functions';
import { useSnackbar } from 'notistack';
import {
    getSecurityAnalysisRunningStatus,
    RunningStatus,
} from './util/running-status';
import { useIntl } from 'react-intl';
import { computePageTitle } from '../utils/compute-title';

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
        const updateType = headers && headers['updateType'];
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

const loadFlowStatusInvalidations = ['loadflow_status', 'loadflow'];
const securityAnalysisStatusInvalidations = ['securityAnalysis_status'];

export function StudyContainer({ view, onChangeTab }) {
    const websocketExpectedCloseRef = useRef();

    const [studyUuid, studyPending, studyErrorMessage] = useStudy(
        decodeURIComponent(useParams().studyUuid)
    );

    const network = useSelector((state) => state.network);

    const [networkLoadingFailMessage, setNetworkLoadingFailMessage] =
        useState(undefined);

    const [errorMessage, setErrorMessage] = useState(undefined);

    const [initialTitle] = useState(document.title);

    const dispatch = useDispatch();

    const currentNode = useSelector((state) => state.currentTreeNode);

    const currentNodeIdRef = useRef();

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

    const [updatedLines, setUpdatedLines] = useState([]);

    const studyUpdatedForce = useSelector((state) => state.studyUpdated);

    const loadNetworkRef = useRef();

    const { enqueueSnackbar } = useSnackbar();
    const { snackError } = useSnackMessage();

    const intlRef = useIntlRef();
    const intl = useIntl();

    const checkBuildFailedNotifications = useCallback(
        (eventData) => {
            if (eventData.headers['updateType'] === 'buildFailed') {
                snackError('', 'NodeBuildingError');
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

                checkBuildFailedNotifications(eventData);
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
        [dispatch, checkBuildFailedNotifications]
    );

    const loadNetwork = useCallback(
        (isUpdate) => {
            if (!isNodeBuilt(currentNode)) {
                return;
            }
            console.info(`Loading network of study '${studyUuid}'...`);

            if (
                !currentNode ||
                !studyUuid ||
                currentNode.buildStatus === 'BUILDING'
            )
                return;

            if (isUpdate) {
                // After a load flow, network has to be recreated.
                // In order to avoid glitches during sld and map rendering,
                // lines and substations have to be prefetched and set before network creation event is dispatched
                // Network creation event is dispatched directly in the network constructor
                new Network(
                    studyUuid,
                    currentNode?.id,
                    (error) => {
                        console.error(error.message);
                        setNetworkLoadingFailMessage(error.message);
                        //setIsNetworkPending(false);
                    },
                    dispatch,
                    {
                        equipments: [equipments.lines, equipments.substations],
                    }
                );
            } else {
                const network = new Network(
                    studyUuid,
                    currentNode?.id,
                    (error) => {
                        console.error(error.message);
                        setNetworkLoadingFailMessage(error.message);
                        //setIsNetworkPending(false);
                    },
                    dispatch
                );
                // For initial network loading, no need to initialize lines and substations at first,
                // lazy loading will do the job (no glitches to avoid)
                dispatch(networkCreated(network));
            }
        },
        [studyUuid, currentNode, dispatch]
    );
    loadNetworkRef.current = loadNetwork;

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

                fetchCaseInfos(studyUuid)
                    .then((res) => {
                        if (res) {
                            networkModificationTreeModel.setCaseName(res);
                        }
                    })
                    .catch((err) => {
                        console.error(err.message);
                        displayErrorMessageWithSnackbar({
                            errorMessage: err.message,
                            enqueueSnackbar: enqueueSnackbar,
                            headerMessage: {
                                headerMessageId:
                                    'NetworkModificationTreeLoadError',
                                intlRef: intlRef,
                            },
                        });
                    });

                let firstBuiltNode = getFirstNodeOfType(
                    tree,
                    'NETWORK_MODIFICATION',
                    'BUILT'
                );

                dispatch(
                    setCurrentTreeNode(
                        firstBuiltNode
                            ? firstBuiltNode
                            : getFirstNodeOfType(tree, 'ROOT')
                    )
                );

                dispatch(
                    loadNetworkModificationTreeSuccess(
                        networkModificationTreeModel
                    )
                );
            })
            .catch((errorMessage) => {
                if (errorMessage.status === 404)
                    displayErrorMessageWithSnackbar({
                        errorMessage: '',
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId: 'StudyUnrecoverableStateRecreate',
                            intlRef: intlRef,
                        },
                    });
                else
                    displayErrorMessageWithSnackbar({
                        errorMessage: errorMessage,
                        enqueueSnackbar: enqueueSnackbar,
                        headerMessage: {
                            headerMessageId: 'NetworkModificationTreeLoadError',
                            intlRef: intlRef,
                        },
                    });
            })
            .finally(() =>
                console.debug('Network modification tree loading finished')
            );
        // Note: studyUuid and dispatch don't change
    }, [studyUuid, enqueueSnackbar, intlRef, dispatch]);

    useEffect(() => {
        if (studyUuid) {
            loadTree();
        }
    }, [studyUuid, loadTree]);

    useEffect(() => {
        if (!isNodeBuilt(currentNode)) return;
        loadNetwork(currentNode?.id === currentNodeIdRef.current);
    }, [loadNetwork, currentNode]);

    currentNodeIdRef.current = currentNode?.id;

    useEffect(() => {
        if (!studyUuid) {
            document.title = initialTitle;
            return;
        }

        fetchPath(studyUuid)
            .then((response) => {
                const study = response[0];
                const parents = response
                    .slice(1)
                    .map((parent) => parent.elementName);

                document.title = computePageTitle(
                    initialTitle,
                    study?.elementName,
                    parents
                );
            })
            .catch((errorMessage) => {
                document.title = initialTitle;
                displayErrorMessageWithSnackbar({
                    errorMessage: errorMessage,
                    enqueueSnackbar: enqueueSnackbar,
                    headerMessage: {
                        headerMessageId: 'LoadStudyAndParentsInfoError',
                        intlRef: intlRef,
                    },
                });
            });
    }, [studyUuid, initialTitle, enqueueSnackbar, intlRef]);

    useEffect(() => {
        if (studyUuid) {
            websocketExpectedCloseRef.current = false;
            dispatch(openStudy(studyUuid));

            const ws = connectNotifications(studyUuid);

            loadNetworkRef.current();

            // study cleanup at unmount event
            return function () {
                websocketExpectedCloseRef.current = true;
                ws.close();
                dispatch(closeStudy());
                dispatch(filteredNominalVoltagesUpdated(null));
            };
        }
        // Note: dispach, loadNetworkRef, loadGeoData
        // connectNotifications don't change
    }, [dispatch, studyUuid, connectNotifications]);

    const updateNetwork = useCallback(
        (substationsIds) => {
            const updatedEquipments = fetchAllEquipments(
                studyUuid,
                currentNode?.id,
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
                    setNetworkLoadingFailMessage(error.message);
                });
            //.finally(() => setIsNetworkPending(false));
            // Note: studyUuid don't change
        },
        [studyUuid, currentNode, network]
    );

    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            if (
                studyUpdatedForce.eventData.headers['updateType'] === 'loadflow'
            ) {
                //TODO reload data more intelligently
                loadNetwork(true);
            } else if (
                studyUpdatedForce.eventData.headers['updateType'] ===
                'deleteStudy'
            ) {
                // closing window on study deletion
                window.close();
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
        };
    }, [intl]);

    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            if (studyUpdatedForce.eventData.headers['updateType'] === 'study') {
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
