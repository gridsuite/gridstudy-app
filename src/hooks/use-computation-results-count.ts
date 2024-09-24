/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useSelector } from 'react-redux';
import { AppState } from '../redux/reducer';
import ComputationType from 'components/computing-status/computation-type';
import RunningStatus from 'components/utils/running-status';

/**
 * Custom hook that calculates the number of computation notifications.
 * It checks the status of various computations and determines if a notification should be displayed.
 * @returns the number of computation results accessible.
 */
export const useComputationResultsCount = () => {
    const loadFlowStatus = useSelector((state: AppState) => state.computingStatus[ComputationType.LOAD_FLOW]);

    const securityAnalysisStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputationType.SECURITY_ANALYSIS]
    );

    const sensitivityAnalysisStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputationType.SENSITIVITY_ANALYSIS]
    );

    const nonEvacuateEnergyAnalysisStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputationType.NON_EVACUATED_ENERGY_ANALYSIS]
    );

    const oneBusallBusesShortCircuitStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputationType.SHORT_CIRCUIT_ONE_BUS]
    );

    const allBusesShortCircuitStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputationType.SHORT_CIRCUIT]
    );

    const dynamicSimulationStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputationType.DYNAMIC_SIMULATION]
    );

    const voltageInitStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputationType.VOLTAGE_INITIALIZATION]
    );

    // Can be failed for technical reasons (e.g., server not responding or computation divergence)
    // we dont distinguish between technical errors and computation errors
    // TODO FIX : separate technical errors from computation errors
    // see running-status.ts for more details

    const loadflowResultPresent = loadFlowStatus === RunningStatus.SUCCEED || loadFlowStatus === RunningStatus.FAILED; // Can be failed for technical reasons (e.g., server not responding or computation divergence)
    const saResutPresent =
        securityAnalysisStatus === RunningStatus.SUCCEED || securityAnalysisStatus === RunningStatus.FAILED; // Can be failed for technical reasons (e.g., server not responding or computation divergence)
    const sensiResultPresent = sensitivityAnalysisStatus === RunningStatus.SUCCEED;
    const nonEvacuatedEnergyResultPresent = nonEvacuateEnergyAnalysisStatus === RunningStatus.SUCCEED;
    const allBusesshortCircuitResultPresent = allBusesShortCircuitStatus === RunningStatus.SUCCEED;

    const oneBusShortCircuitResultPresent = oneBusallBusesShortCircuitStatus === RunningStatus.SUCCEED;
    const voltageInitResultPresent =
        voltageInitStatus === RunningStatus.SUCCEED || voltageInitStatus === RunningStatus.FAILED; // Can be failed for technical reasons (e.g., server not responding or computation divergence)

    const dynamicSimulationResultPresent =
        dynamicSimulationStatus === RunningStatus.SUCCEED || dynamicSimulationStatus === RunningStatus.FAILED; // Can be failed for technical reasons (e.g., server not responding or computation divergence)

    return [
        loadflowResultPresent,
        saResutPresent,
        sensiResultPresent,
        nonEvacuatedEnergyResultPresent,
        allBusesshortCircuitResultPresent,
        oneBusShortCircuitResultPresent,
        voltageInitResultPresent,
        dynamicSimulationResultPresent,
    ].filter(Boolean).length;
};
