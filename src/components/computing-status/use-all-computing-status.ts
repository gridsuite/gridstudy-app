/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    getDynamicSimulationRunningStatus,
    getLoadFlowRunningStatus,
    getNonEvacuatedEnergyRunningStatus,
    getSecurityAnalysisRunningStatus,
    getSensitivityAnalysisRunningStatus,
    getShortCircuitAnalysisRunningStatus,
    getStateEstimationRunningStatus,
    getVoltageInitRunningStatus,
} from '../utils/running-status';
import { useComputingStatus } from './use-computing-status';

import { useOptionalServiceStatus } from '../../hooks/use-optional-service-status';
import { fetchDynamicSimulationStatus } from '../../services/study/dynamic-simulation';
import { fetchLoadFlowStatus } from '../../services/study/loadflow';
import { fetchNonEvacuatedEnergyStatus } from '../../services/study/non-evacuated-energy';
import { fetchSecurityAnalysisStatus } from '../../services/study/security-analysis';
import { fetchSensitivityAnalysisStatus } from '../../services/study/sensitivity-analysis';
import {
    fetchOneBusShortCircuitAnalysisStatus,
    fetchShortCircuitAnalysisStatus,
} from '../../services/study/short-circuit-analysis';
import { fetchStateEstimationStatus } from '../../services/study/state-estimation';
import { fetchVoltageInitStatus } from '../../services/study/voltage-init';
import { OptionalServicesNames } from '../utils/optional-services';
import { ComputingType } from './computing-type';

// this hook loads all current computation status into redux then keeps them up to date according to notifications
export const useAllComputingStatus = (): void => {
    const securityAnalysisAvailability = useOptionalServiceStatus(OptionalServicesNames.SecurityAnalysis);
    const sensitivityAnalysisAvailability = useOptionalServiceStatus(OptionalServicesNames.SensitivityAnalysis);
    const nonEvacuatedEnergyAvailability = useOptionalServiceStatus(OptionalServicesNames.SensitivityAnalysis);
    const dynamicSimulationAvailability = useOptionalServiceStatus(OptionalServicesNames.DynamicSimulation);
    const voltageInitAvailability = useOptionalServiceStatus(OptionalServicesNames.VoltageInit);
    const shortCircuitAvailability = useOptionalServiceStatus(OptionalServicesNames.ShortCircuit);
    const stateEstimationAvailability = useOptionalServiceStatus(OptionalServicesNames.StateEstimation);

    useComputingStatus(fetchLoadFlowStatus, getLoadFlowRunningStatus, ComputingType.LOAD_FLOW);

    useComputingStatus(
        fetchSecurityAnalysisStatus,
        getSecurityAnalysisRunningStatus,
        ComputingType.SECURITY_ANALYSIS,
        securityAnalysisAvailability
    );

    useComputingStatus(
        fetchSensitivityAnalysisStatus,
        getSensitivityAnalysisRunningStatus,
        ComputingType.SENSITIVITY_ANALYSIS,
        sensitivityAnalysisAvailability
    );

    useComputingStatus(
        fetchNonEvacuatedEnergyStatus,
        getNonEvacuatedEnergyRunningStatus,
        ComputingType.NON_EVACUATED_ENERGY_ANALYSIS,
        nonEvacuatedEnergyAvailability
    );

    useComputingStatus(
        fetchShortCircuitAnalysisStatus,
        getShortCircuitAnalysisRunningStatus,
        ComputingType.SHORT_CIRCUIT,
        shortCircuitAvailability
    );

    useComputingStatus(
        fetchOneBusShortCircuitAnalysisStatus,
        getShortCircuitAnalysisRunningStatus,
        ComputingType.SHORT_CIRCUIT_ONE_BUS,
        shortCircuitAvailability
    );

    useComputingStatus(
        fetchDynamicSimulationStatus,
        getDynamicSimulationRunningStatus,
        ComputingType.DYNAMIC_SIMULATION,
        dynamicSimulationAvailability
    );

    useComputingStatus(
        fetchVoltageInitStatus,
        getVoltageInitRunningStatus,
        ComputingType.VOLTAGE_INITIALIZATION,
        voltageInitAvailability
    );

    useComputingStatus(
        fetchStateEstimationStatus,
        getStateEstimationRunningStatus,
        ComputingType.STATE_ESTIMATION,
        stateEstimationAvailability
    );
};
