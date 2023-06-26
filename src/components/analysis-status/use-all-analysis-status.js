import { useAnalysisStatus } from './analysis-status-hooks';
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
import { AnalysisType } from './analysis-type';

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

export const useAllAnalysisStatus = (studyUuid, currentNodeUuid) => {
    useAnalysisStatus(
        studyUuid,
        currentNodeUuid,
        fetchSecurityAnalysisStatus,
        securityAnalysisStatusInvalidations,
        getSecurityAnalysisRunningStatus,
        AnalysisType.SECURITY
    );

    useAnalysisStatus(
        studyUuid,
        currentNodeUuid,
        fetchSensitivityAnalysisStatus,
        sensiStatusInvalidations,
        getSensiRunningStatus,
        AnalysisType.SENSITIVITY
    );

    useAnalysisStatus(
        studyUuid,
        currentNodeUuid,
        fetchShortCircuitAnalysisStatus,
        shortCircuitStatusInvalidations,
        getShortCircuitRunningStatus,
        AnalysisType.SHORTCIRCUIT
    );

    useAnalysisStatus(
        studyUuid,
        currentNodeUuid,
        fetchDynamicSimulationStatus,
        dynamicSimulationStatusInvalidations,
        getDynamicSimulationRunningStatus,
        AnalysisType.DYNAMIC_SIMULATION
    );

    useAnalysisStatus(
        studyUuid,
        currentNodeUuid,
        fetchVoltageInitStatus,
        voltageInitStatusInvalidations,
        getVoltageInitRunningStatus,
        AnalysisType.VOLTAGE_INIT
    );
};
