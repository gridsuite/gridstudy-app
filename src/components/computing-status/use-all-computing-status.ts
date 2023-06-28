import { useComputingStatus } from './use-computing-status';
import {
    getSecurityAnalysisRunningStatus,
    getSensiRunningStatus,
    getShortCircuitRunningStatus,
    getDynamicSimulationRunningStatus,
    getVoltageInitRunningStatus,
} from '../utils/running-status';

import {
    fetchSecurityAnalysisStatus,
    fetchSensitivityAnalysisStatus,
    fetchShortCircuitAnalysisStatus,
    fetchDynamicSimulationStatus,
    fetchVoltageInitStatus,
} from '../../utils/rest-api';
import { UUID } from 'crypto';
import { ComputingType } from './computing-type';

const securityAnalysisStatusInvalidations = [
    'securityAnalysis_status',
    'securityAnalysis_failed',
];
const sensiStatusInvalidations = [
    'sensitivityAnalysis_status',
    'sensitivityAnalysis_failed',
];
const shortCircuitStatusInvalidations = [
    'shortCircuitAnalysis_status',
    'shortCircuitAnalysis_failed',
];
const dynamicSimulationStatusInvalidations = [
    'dynamicSimulation_status',
    'dynamicSimulation_failed',
];
const voltageInitStatusInvalidations = [
    'voltageInit_status',
    'voltageInit_failed',
];

// this hook loads all current computation status into redux then keeps them up to date according to notifications
export const useAllComputingStatus = (
    studyUuid: UUID,
    currentNodeUuid: UUID
): void => {
    useComputingStatus(
        studyUuid,
        currentNodeUuid,
        fetchSecurityAnalysisStatus,
        securityAnalysisStatusInvalidations,
        getSecurityAnalysisRunningStatus,
        ComputingType.SECURITY_ANALYSIS
    );

    useComputingStatus(
        studyUuid,
        currentNodeUuid,
        fetchSensitivityAnalysisStatus,
        sensiStatusInvalidations,
        getSensiRunningStatus,
        ComputingType.SENSITIVITY_ANALYSIS
    );

    useComputingStatus(
        studyUuid,
        currentNodeUuid,
        fetchShortCircuitAnalysisStatus,
        shortCircuitStatusInvalidations,
        getShortCircuitRunningStatus,
        ComputingType.SHORTCIRCUIT_ANALYSIS
    );

    useComputingStatus(
        studyUuid,
        currentNodeUuid,
        fetchDynamicSimulationStatus,
        dynamicSimulationStatusInvalidations,
        getDynamicSimulationRunningStatus,
        ComputingType.DYNAMIC_SIMULATION
    );

    useComputingStatus(
        studyUuid,
        currentNodeUuid,
        fetchVoltageInitStatus,
        voltageInitStatusInvalidations,
        getVoltageInitRunningStatus,
        ComputingType.VOLTAGE_INIT
    );
};
