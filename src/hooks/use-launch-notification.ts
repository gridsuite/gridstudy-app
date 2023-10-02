/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../redux/reducer.type';
import { ComputingType } from '../components/computing-status/computing-type';
import { useEffect } from 'react';
import { isNodeBuilt } from '../components/graph/util/model-functions';
import { RunningStatus } from '../components/utils/running-status';
import {
    addDynamicSimulationNotif,
    addLoadflowNotif,
    addOneBusShortCircuitNotif,
    addSANotif,
    addSensiNotif,
    addShortCircuitNotif,
    addVoltageInitNotif,
    resetDynamicSimulationNotif,
    resetLoadflowNotif,
    resetOneBusShortCircuitNotif,
    resetSANotif,
    resetSensiNotif,
    resetShortCircuitNotif,
    resetVoltageInitNotif,
} from '../redux/actions';

export const useLaunchNotification = (tabIndex: number) => {
    const dispatch = useDispatch();
    const user = useSelector((state: ReduxState) => state.user);

    const currentNode = useSelector(
        (state: ReduxState) => state.currentTreeNode
    );

    const loadFlowStatus = useSelector(
        (state: ReduxState) => state.computingStatus[ComputingType.LOADFLOW]
    );

    const securityAnalysisStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.SECURITY_ANALYSIS]
    );

    const sensitivityAnalysisStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.SENSITIVITY_ANALYSIS]
    );

    const shortCircuitAnalysisStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.SHORTCIRCUIT_ANALYSIS]
    );

    const oneBusShortCircuitAnalysisStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.ONE_BUS_SHORTCIRCUIT_ANALYSIS]
    );

    const dynamicSimulationStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.DYNAMIC_SIMULATION]
    );

    const voltageInitStatus = useSelector(
        (state: ReduxState) => state.computingStatus[ComputingType.VOLTAGE_INIT]
    );

    useEffect(() => {
        if (
            isNodeBuilt(currentNode) &&
            (loadFlowStatus === RunningStatus.SUCCEED ||
                loadFlowStatus === RunningStatus.FAILED)
        ) {
            dispatch(addLoadflowNotif());
        } else {
            dispatch(resetLoadflowNotif());
        }
    }, [currentNode, dispatch, loadFlowStatus, tabIndex, user]);

    useEffect(() => {
        if (
            isNodeBuilt(currentNode) &&
            (securityAnalysisStatus === RunningStatus.SUCCEED ||
                securityAnalysisStatus === RunningStatus.FAILED)
        ) {
            dispatch(addSANotif());
        } else {
            dispatch(resetSANotif());
        }
    }, [currentNode, dispatch, securityAnalysisStatus, tabIndex, user]);

    useEffect(() => {
        if (
            isNodeBuilt(currentNode) &&
            sensitivityAnalysisStatus === RunningStatus.SUCCEED
        ) {
            dispatch(addSensiNotif());
        } else {
            dispatch(resetSensiNotif());
        }
    }, [currentNode, dispatch, sensitivityAnalysisStatus, tabIndex, user]);

    useEffect(() => {
        if (
            isNodeBuilt(currentNode) &&
            shortCircuitAnalysisStatus === RunningStatus.SUCCEED
        ) {
            dispatch(addShortCircuitNotif());
        } else {
            dispatch(resetShortCircuitNotif());
        }
    }, [currentNode, dispatch, shortCircuitAnalysisStatus, tabIndex, user]);

    useEffect(() => {
        if (
            isNodeBuilt(currentNode) &&
            oneBusShortCircuitAnalysisStatus === RunningStatus.SUCCEED
        ) {
            dispatch(addOneBusShortCircuitNotif());
        } else {
            dispatch(resetOneBusShortCircuitNotif());
        }
    }, [
        currentNode,
        dispatch,
        oneBusShortCircuitAnalysisStatus,
        tabIndex,
        user,
    ]);

    useEffect(() => {
        if (
            isNodeBuilt(currentNode) &&
            (dynamicSimulationStatus === RunningStatus.SUCCEED ||
                dynamicSimulationStatus === RunningStatus.FAILED)
        ) {
            dispatch(addDynamicSimulationNotif());
        } else {
            dispatch(resetDynamicSimulationNotif());
        }
    }, [currentNode, dispatch, dynamicSimulationStatus, tabIndex, user]);

    useEffect(() => {
        if (
            isNodeBuilt(currentNode) &&
            (voltageInitStatus === RunningStatus.SUCCEED ||
                voltageInitStatus === RunningStatus.FAILED)
        ) {
            dispatch(addVoltageInitNotif());
        } else {
            dispatch(resetVoltageInitNotif());
        }
    }, [currentNode, dispatch, voltageInitStatus, tabIndex, user]);
};
