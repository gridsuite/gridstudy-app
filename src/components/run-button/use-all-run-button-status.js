import { useRunButtonStatus } from './run-button-hooks';
import {
    getSecurityAnalysisRunningStatus,
    getSensiRunningStatus,
    getShortCircuitRunningStatus,
    getDynamicSimulationRunningStatus,
    getVoltageInitRunningStatus,
    getLoadFlowRunningStatus,
    RunButtonType,
} from '../utils/running-status';

import {
    fetchSecurityAnalysisStatus,
    fetchSensitivityAnalysisStatus,
    fetchShortCircuitAnalysisStatus,
    fetchDynamicSimulationStatus,
    fetchVoltageInitStatus,
    fetchLoadFlowStatus,
} from '../../utils/rest-api';

const loadFlowStatusInvalidations = ['loadflow_status', 'loadflow_failed'];
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

export const useAllRunButtonStatus = (studyUuid, currentNodeUuid) => {
    useRunButtonStatus(
        studyUuid,
        currentNodeUuid,
        fetchLoadFlowStatus,
        loadFlowStatusInvalidations,
        getLoadFlowRunningStatus,
        RunButtonType.LOADFLOW
    );

    useRunButtonStatus(
        studyUuid,
        currentNodeUuid,
        fetchSecurityAnalysisStatus,
        securityAnalysisStatusInvalidations,
        getSecurityAnalysisRunningStatus,
        RunButtonType.SECURITY_ANALYSIS
    );

    useRunButtonStatus(
        studyUuid,
        currentNodeUuid,
        fetchSensitivityAnalysisStatus,
        sensiStatusInvalidations,
        getSensiRunningStatus,
        RunButtonType.SENSI
    );

    useRunButtonStatus(
        studyUuid,
        currentNodeUuid,
        fetchShortCircuitAnalysisStatus,
        shortCircuitStatusInvalidations,
        getShortCircuitRunningStatus,
        RunButtonType.SHORTCIRCUIT
    );

    useRunButtonStatus(
        studyUuid,
        currentNodeUuid,
        fetchDynamicSimulationStatus,
        dynamicSimulationStatusInvalidations,
        getDynamicSimulationRunningStatus,
        RunButtonType.DYNAMIC_SIMULATION
    );

    useRunButtonStatus(
        studyUuid,
        currentNodeUuid,
        fetchVoltageInitStatus,
        voltageInitStatusInvalidations,
        getVoltageInitRunningStatus,
        RunButtonType.VOLTAGE_INIT
    );
};
