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
} from '../utils/rest-api';
import {
    closeStudy,
    filteredNominalVoltagesUpdated,
    loadNetworkModificationTreeSuccess,
    networkCreated,
    openStudy,
    selectTreeNode,
    studyUpdated,
} from '../redux/actions';
import Network from './network/network';
import { equipments } from './network/network-equipments';
import WaitingLoader from './util/waiting-loader';
import { displayErrorMessageWithSnackbar, useIntlRef } from '../utils/messages';
import NetworkModificationTreeModel from './graph/network-modification-tree-model';
import { useSnackbar } from 'notistack';
import {
    getSecurityAnalysisRunningStatus,
    RunningStatus,
} from './util/running-status';

export function useNodeData(
    studyUuid,
    selectedNodeUuid,
    fetcher,
    invalidations,
    defaultValue,
    resultConversion
) {
    const [result, setResult] = useState(defaultValue);
    const [isPending, setIsPending] = useState(false);
    const [errorMessage, setErrorMessage] = useState(undefined);
    const selectedNodeUuidRef = useRef();
    const studyUpdatedForce = useSelector((state) => state.studyUpdated);
    const lastUpdateRef = useRef();

    const update = useCallback(() => {
        selectedNodeUuidRef.current = selectedNodeUuid;
        setIsPending(true);
        fetcher(studyUuid, selectedNodeUuid)
            .then((res) => {
                if (selectedNodeUuidRef.current === selectedNodeUuid)
                    setResult(resultConversion ? resultConversion(res) : res);
            })
            .catch((err) => setErrorMessage(err.message))
            .finally(() => setIsPending(false));
    }, [
        selectedNodeUuid,
        studyUuid,
        setResult,
        setErrorMessage,
        setIsPending,
        selectedNodeUuidRef,
        fetcher,
        resultConversion,
    ]);

    /* initial fetch and update */
    useEffect(() => {
        if (!studyUuid || !selectedNodeUuid) return;
        const headers = studyUpdatedForce?.eventData?.headers;
        const updateType = headers && headers['updateType'];
        const node = headers && headers['node'];
        const isUpdateForUs =
            lastUpdateRef.current !== studyUpdatedForce &&
            updateType &&
            node === selectedNodeUuid &&
            invalidations.find((e) => updateType === e) !== -1;
        lastUpdateRef.current = studyUpdatedForce;
        if (selectedNodeUuidRef.current !== selectedNodeUuid || isUpdateForUs) {
            update();
        }
    }, [
        update,
        selectedNodeUuidRef,
        selectedNodeUuid,
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
    }, [studyUuidRequest, setPending, setStudyUuid, intlRef]);

    return [studyUuid, pending, errMessage];
}

export function StudyContainer({ view, onChangeTab }) {
    const websocketExpectedCloseRef = useRef();

    const [studyUuid, studyPending, studyErrorMessage] = useStudy(
        decodeURIComponent(useParams().studyUuid)
    );

    const network = useSelector((state) => state.network);

    const [networkLoadingFailMessage, setNetworkLoadingFailMessage] =
        useState(undefined);

    const dispatch = useDispatch();

    const selectedNodeUuid = useSelector((state) => state.selectedTreeNode);

    const [loadFlowInfos] = useNodeData(
        studyUuid,
        selectedNodeUuid,
        fetchLoadFlowInfos,
        ['loadflow_status']
    );

    const [securityAnalysisStatus] = useNodeData(
        studyUuid,
        selectedNodeUuid,
        fetchSecurityAnalysisStatus,
        ['securityAnalysis_status'],
        RunningStatus.IDLE,
        getSecurityAnalysisRunningStatus
    );

    const sldRef = useRef();

    const [updatedLines, setUpdatedLines] = useState([]);

    const studyUpdatedForce = useSelector((state) => state.studyUpdated);

    const loadNetworkRef = useRef();

    const { enqueueSnackbar } = useSnackbar();

    const intlRef = useIntlRef();

    const [updateSwitchMsg, setUpdateSwitchMsg] = useState('');

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

    const loadNetwork = useCallback(
        (isUpdate) => {
            console.info(`Loading network of study '${studyUuid}'...`);

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
                        setNetworkLoadingFailMessage(error.message);
                        //setIsNetworkPending(false);
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
                            setNetworkLoadingFailMessage(error.message);
                            //setIsNetworkPending(false);
                        },
                        dispatch
                    );
                    // For initial network loading, no need to initialize lines and substations at first,
                    // lazy loading will do the job (no glitches to avoid)
                    dispatch(networkCreated(network));
                }
            }
        },
        [studyUuid, selectedNodeUuid, dispatch]
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

    useEffect(() => {
        if (studyUuid) {
            loadTree();
        }
    }, [studyUuid, selectedNodeUuid, loadNetwork, loadTree]);

    useEffect(() => {
        loadNetwork();
    }, [selectedNodeUuid, loadNetwork]);

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
    }, [dispatch, studyUuid, loadNetworkRef, connectNotifications]);

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
                    setNetworkLoadingFailMessage(error.message);
                });
            //.finally(() => setIsNetworkPending(false));
            // Note: studyUuid don't change
        },
        [studyUuid, selectedNodeUuid, network]
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
            }
        }
        // Note: studyUuid, and loadNetwork don't change
    }, [studyUpdatedForce, studyUuid, loadNetwork, dispatch]);

    const runnable = useMemo(() => {
        if (!intlRef?.current) return;
        return {
            LOADFLOW: intlRef.current.formatMessage({ id: 'LoadFlow' }),
            SECURITY_ANALYSIS: intlRef.current.formatMessage({
                id: 'SecurityAnalysis',
            }),
        };
    }, [intlRef]);

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

    return (
        <WaitingLoader
            errMessage={studyErrorMessage || networkLoadingFailMessage}
            loading={studyPending || !network}
            message={'LoadingRemoteData'}
        >
            <StudyPane
                studyUuid={studyUuid}
                network={network}
                selectedNodeUuid={selectedNodeUuid}
                view={view}
                onChangeTab={onChangeTab}
                updatedLines={updatedLines}
                loadFlowInfos={loadFlowInfos}
                securityAnalysisStatus={securityAnalysisStatus}
                runnable={runnable}
                sldRef={sldRef}
                setUpdateSwitchMsg={setUpdateSwitchMsg}
                updateSwitchMsg={updateSwitchMsg}
            />
        </WaitingLoader>
    );
}

StudyContainer.propTypes = {
    view: PropTypes.any,
    onChangeTab: PropTypes.func,
};
