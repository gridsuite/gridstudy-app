/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useSelector } from 'react-redux';
import { ReduxState } from '../redux/reducer.type';
import ComputingType from 'components/computing-status/computing-type';
import RunningStatus from 'components/utils/running-status';
import { isNodeBuilt } from 'components/graph/util/model-functions';

/**
 * Custom hook that calculates the number of computation notifications.
 * It checks the status of various computations and determines if a notification should be displayed.
 * @returns The count of computation notifications.
 */
export const useComputationNotificationCount = () => {
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

    const oneBusallBusesShortCircuitStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.ONE_BUS_SHORTCIRCUIT_ANALYSIS]
    );

    const allBusesShortCircuitStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.ALL_BUSES_SHORTCIRCUIT_ANALYSIS]
    );

    const dynamicSimulationStatus = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.DYNAMIC_SIMULATION]
    );

    const voltageInitStatus = useSelector(
        (state: ReduxState) => state.computingStatus[ComputingType.VOLTAGE_INIT]
    );

    // Can be failed for technical reasons (e.g., server not responding or computation divergence)
    // we dont distinguish between technical errors and computation errors
    // TODO FIX : separate technical errors from computation errors
    // see running-status.ts for more details

    const loadflowNotif =
        isNodeBuilt(currentNode) &&
        (loadFlowStatus === RunningStatus.SUCCEED ||
            loadFlowStatus === RunningStatus.FAILED); // Can be failed for technical reasons (e.g., server not responding or computation divergence)
    const saNotif =
        isNodeBuilt(currentNode) &&
        (securityAnalysisStatus === RunningStatus.SUCCEED ||
            securityAnalysisStatus === RunningStatus.FAILED); // Can be failed for technical reasons (e.g., server not responding or computation divergence)
    const sensiNotif =
        isNodeBuilt(currentNode) &&
        sensitivityAnalysisStatus === RunningStatus.SUCCEED;
    const allBusesshortCircuitNotif =
        isNodeBuilt(currentNode) &&
        allBusesShortCircuitStatus === RunningStatus.SUCCEED;

    const oneBusShortCircuitNotif =
        isNodeBuilt(currentNode) &&
        oneBusallBusesShortCircuitStatus === RunningStatus.SUCCEED;
    const voltageInitNotif =
        (isNodeBuilt(currentNode) &&
            voltageInitStatus === RunningStatus.SUCCEED) ||
        voltageInitStatus === RunningStatus.FAILED; // Can be failed for technical reasons (e.g., server not responding or computation divergence)

    const dynamicSimulationNotif =
        (isNodeBuilt(currentNode) &&
            dynamicSimulationStatus === RunningStatus.SUCCEED) ||
        dynamicSimulationStatus === RunningStatus.FAILED; // Can be failed for technical reasons (e.g., server not responding or computation divergence)

    return [
        loadflowNotif,
        saNotif,
        sensiNotif,
        allBusesshortCircuitNotif,
        oneBusShortCircuitNotif,
        voltageInitNotif,
        dynamicSimulationNotif,
    ].filter(Boolean).length;
};
