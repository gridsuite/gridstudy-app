/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useSelector } from 'react-redux';
import { AppState } from '../redux/reducer';
import ComputingType from 'components/computing-status/computing-type';
import RunningStatus from 'components/utils/running-status';
import { PARAM_DEVELOPER_MODE } from '../utils/config-params';
import { useParameterState } from 'components/dialogs/parameters/use-parameters-state';

/**
 * Custom hook that calculates the number of computation notifications.
 * It checks the status of various computations and determines if a notification should be displayed.
 * @returns the number of computation results accessible.
 */
export const useComputationResultsCount = () => {
    const loadFlowStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.LOAD_FLOW]);

    const securityAnalysisStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.SECURITY_ANALYSIS]
    );

    const sensitivityAnalysisStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.SENSITIVITY_ANALYSIS]
    );

    const nonEvacuateEnergyAnalysisStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.NON_EVACUATED_ENERGY_ANALYSIS]
    );

    const oneBusallBusesShortCircuitStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.SHORT_CIRCUIT_ONE_BUS]
    );

    const allBusesShortCircuitStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.SHORT_CIRCUIT]
    );

    const dynamicSimulationStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.DYNAMIC_SIMULATION]
    );

    const dynamicSecurityAnalysisStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.DYNAMIC_SECURITY_ANALYSIS]
    );

    const voltageInitStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.VOLTAGE_INITIALIZATION]
    );

    const stateEstimationStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.STATE_ESTIMATION]
    );

    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

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

    const dynamicSecurityAnalysisResultPresent =
        dynamicSecurityAnalysisStatus === RunningStatus.SUCCEED ||
        dynamicSecurityAnalysisStatus === RunningStatus.FAILED; // Can be failed for technical reasons (e.g., server not responding or computation divergence)

    const stateEstimationResultPresent =
        enableDeveloperMode &&
        (stateEstimationStatus === RunningStatus.SUCCEED || voltageInitStatus === RunningStatus.FAILED); // Can be failed for technical reasons (e.g., server not responding or computation divergence)

    return [
        loadflowResultPresent,
        saResutPresent,
        sensiResultPresent,
        nonEvacuatedEnergyResultPresent,
        allBusesshortCircuitResultPresent,
        oneBusShortCircuitResultPresent,
        voltageInitResultPresent,
        dynamicSimulationResultPresent,
        dynamicSecurityAnalysisResultPresent,
        stateEstimationResultPresent,
    ].filter(Boolean).length;
};
