/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useComputingStatus } from './use-computing-status';
import {
    getDynamicSecurityAnalysisRunningStatus,
    getDynamicSimulationRunningStatus,
    getLoadFlowRunningStatus,
    getNonEvacuatedEnergyRunningStatus,
    getSecurityAnalysisRunningStatus,
    getSensitivityAnalysisRunningStatus,
    getShortCircuitAnalysisRunningStatus,
    getStateEstimationRunningStatus,
    getVoltageInitRunningStatus,
} from '../utils/running-status';

import { UUID } from 'crypto';
import { ComputingType } from './computing-type';
import { fetchSensitivityAnalysisStatus } from '../../services/study/sensitivity-analysis';
import { fetchSecurityAnalysisStatus } from '../../services/study/security-analysis';
import { fetchDynamicSimulationStatus } from '../../services/study/dynamic-simulation';
import {
    fetchOneBusShortCircuitAnalysisStatus,
    fetchShortCircuitAnalysisStatus,
} from '../../services/study/short-circuit-analysis';
import { fetchVoltageInitStatus } from '../../services/study/voltage-init';
import { fetchLoadFlowStatus } from '../../services/study/loadflow';
import { OptionalServicesNames } from '../utils/optional-services';
import { useOptionalServiceStatus } from '../../hooks/use-optional-service-status';
import { fetchNonEvacuatedEnergyStatus } from '../../services/study/non-evacuated-energy';
import { fetchStateEstimationStatus } from '../../services/study/state-estimation';
import { fetchDynamicSecurityAnalysisStatus } from '../../services/study/dynamic-security-analysis';

// status invalidations
const loadFlowStatusInvalidations = ['loadflow_status', 'loadflow_failed'];
const securityAnalysisStatusInvalidations = ['securityAnalysis_status', 'securityAnalysis_failed'];
const sensitivityAnalysisStatusInvalidations = ['sensitivityAnalysis_status', 'sensitivityAnalysis_failed'];
const nonEvacuatedEnergyStatusInvalidations = ['nonEvacuatedEnergy_status', 'nonEvacuatedEnergy_failed'];
const shortCircuitAnalysisStatusInvalidations = ['shortCircuitAnalysis_status', 'shortCircuitAnalysis_failed'];
const oneBusShortCircuitAnalysisStatusInvalidations = [
    'oneBusShortCircuitAnalysis_status',
    'oneBusShortCircuitAnalysis_failed',
];
const dynamicSimulationStatusInvalidations = ['dynamicSimulation_status', 'dynamicSimulation_failed'];
const dynamicSecurityAnalysisStatusInvalidations = ['dynamicSecurityAnalysis_status', 'dynamicSecurityAnalysis_failed'];
const voltageInitStatusInvalidations = ['voltageInit_status', 'voltageInit_failed'];
const stateEstimationStatusInvalidations = ['stateEstimation_status', 'stateEstimation_failed'];

// status completions
const loadFlowStatusCompletions = ['loadflowResult', 'loadflow_failed'];
const securityAnalysisStatusCompletions = ['securityAnalysisResult', 'securityAnalysis_failed'];
const sensitivityAnalysisStatusCompletions = ['sensitivityAnalysisResult', 'sensitivityAnalysis_failed'];
const nonEvacuatedEnergyStatusCompletions = ['nonEvacuatedEnergyResult', 'nonEvacuatedEnergy_failed'];
const shortCircuitAnalysisStatusCompletions = ['shortCircuitAnalysisResult', 'shortCircuitAnalysis_failed'];
const oneBusShortCircuitAnalysisStatusCompletions = [
    'oneBusShortCircuitAnalysisResult',
    'oneBusShortCircuitAnalysis_failed',
];
const dynamicSimulationStatusCompletions = ['dynamicSimulationResult', 'dynamicSimulation_failed'];
const dynamicSecurityAnalysisStatusCompletions = ['dynamicSecurityAnalysisResult', 'dynamicSecurityAnalysis_failed'];
const voltageInitStatusCompletions = ['voltageInitResult', 'voltageInit_failed'];
const stateEstimationStatusCompletions = ['stateEstimationResult', 'stateEstimation_failed'];

// result invalidations
export const loadflowResultInvalidations = ['loadflowResult'];
export const securityAnalysisResultInvalidations = ['securityAnalysisResult'];
export const nonEvacuatedEnergyResultInvalidations = ['nonEvacuatedEnergyResult'];
export const dynamicSimulationResultInvalidations = ['dynamicSimulationResult'];
export const dynamicSecurityAnalysisResultInvalidations = ['dynamicSecurityAnalysisResult'];
export const voltageInitResultInvalidations = ['voltageInitResult'];
export const stateEstimationResultInvalidations = ['stateEstimationResult'];

// this hook loads all current computation status into redux then keeps them up to date according to notifications
export const useAllComputingStatus = (studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID): void => {
    const securityAnalysisAvailability = useOptionalServiceStatus(OptionalServicesNames.SecurityAnalysis);
    const sensitivityAnalysisAvailability = useOptionalServiceStatus(OptionalServicesNames.SensitivityAnalysis);
    const nonEvacuatedEnergyAvailability = useOptionalServiceStatus(OptionalServicesNames.SensitivityAnalysis);
    const dynamicSimulationAvailability = useOptionalServiceStatus(OptionalServicesNames.DynamicSimulation);
    const dynamicSecurityAnalysisAvailability = useOptionalServiceStatus(OptionalServicesNames.DynamicSecurityAnalysis);
    const voltageInitAvailability = useOptionalServiceStatus(OptionalServicesNames.VoltageInit);
    const shortCircuitAvailability = useOptionalServiceStatus(OptionalServicesNames.ShortCircuit);
    const stateEstimationAvailability = useOptionalServiceStatus(OptionalServicesNames.StateEstimation);

    useComputingStatus(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid,
        fetchLoadFlowStatus,
        loadFlowStatusInvalidations,
        loadFlowStatusCompletions,
        getLoadFlowRunningStatus,
        ComputingType.LOAD_FLOW
    );

    useComputingStatus(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid,
        fetchSecurityAnalysisStatus,
        securityAnalysisStatusInvalidations,
        securityAnalysisStatusCompletions,
        getSecurityAnalysisRunningStatus,
        ComputingType.SECURITY_ANALYSIS,
        securityAnalysisAvailability
    );

    useComputingStatus(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid,
        fetchSensitivityAnalysisStatus,
        sensitivityAnalysisStatusInvalidations,
        sensitivityAnalysisStatusCompletions,
        getSensitivityAnalysisRunningStatus,
        ComputingType.SENSITIVITY_ANALYSIS,
        sensitivityAnalysisAvailability
    );

    useComputingStatus(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid,
        fetchNonEvacuatedEnergyStatus,
        nonEvacuatedEnergyStatusInvalidations,
        nonEvacuatedEnergyStatusCompletions,
        getNonEvacuatedEnergyRunningStatus,
        ComputingType.NON_EVACUATED_ENERGY_ANALYSIS,
        nonEvacuatedEnergyAvailability
    );

    useComputingStatus(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid,
        fetchShortCircuitAnalysisStatus,
        shortCircuitAnalysisStatusInvalidations,
        shortCircuitAnalysisStatusCompletions,
        getShortCircuitAnalysisRunningStatus,
        ComputingType.SHORT_CIRCUIT,
        shortCircuitAvailability
    );

    useComputingStatus(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid,
        fetchOneBusShortCircuitAnalysisStatus,
        oneBusShortCircuitAnalysisStatusInvalidations,
        oneBusShortCircuitAnalysisStatusCompletions,
        getShortCircuitAnalysisRunningStatus,
        ComputingType.SHORT_CIRCUIT_ONE_BUS,
        shortCircuitAvailability
    );

    useComputingStatus(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid,
        fetchDynamicSimulationStatus,
        dynamicSimulationStatusInvalidations,
        dynamicSimulationStatusCompletions,
        getDynamicSimulationRunningStatus,
        ComputingType.DYNAMIC_SIMULATION,
        dynamicSimulationAvailability
    );

    useComputingStatus(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid,
        fetchDynamicSecurityAnalysisStatus,
        dynamicSecurityAnalysisStatusInvalidations,
        dynamicSecurityAnalysisStatusCompletions,
        getDynamicSecurityAnalysisRunningStatus,
        ComputingType.DYNAMIC_SECURITY_ANALYSIS,
        dynamicSecurityAnalysisAvailability
    );

    useComputingStatus(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid,
        fetchVoltageInitStatus,
        voltageInitStatusInvalidations,
        voltageInitStatusCompletions,
        getVoltageInitRunningStatus,
        ComputingType.VOLTAGE_INITIALIZATION,
        voltageInitAvailability
    );

    useComputingStatus(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid,
        fetchStateEstimationStatus,
        stateEstimationStatusInvalidations,
        stateEstimationStatusCompletions,
        getStateEstimationRunningStatus,
        ComputingType.STATE_ESTIMATION,
        stateEstimationAvailability
    );
};
