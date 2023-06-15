import { useNodeData } from './use-node-data';
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

export const useRunButtonStatus = (studyUuid, currentNodeUuid) => {
    useNodeData(
        studyUuid,
        currentNodeUuid,
        fetchLoadFlowStatus,
        loadFlowStatusInvalidations,
        getLoadFlowRunningStatus,
        RunButtonType.LOADFLOW
    );

    useNodeData(
        studyUuid,
        currentNodeUuid,
        fetchSecurityAnalysisStatus,
        securityAnalysisStatusInvalidations,
        getSecurityAnalysisRunningStatus,
        RunButtonType.SECURITY_ANALYSIS
    );

    useNodeData(
        studyUuid,
        currentNodeUuid,
        fetchSensitivityAnalysisStatus,
        sensiStatusInvalidations,
        getSensiRunningStatus,
        RunButtonType.SENSI
    );

    useNodeData(
        studyUuid,
        currentNodeUuid,
        fetchShortCircuitAnalysisStatus,
        shortCircuitStatusInvalidations,
        getShortCircuitRunningStatus,
        RunButtonType.SHORTCIRCUIT
    );

    useNodeData(
        studyUuid,
        currentNodeUuid,
        fetchDynamicSimulationStatus,
        dynamicSimulationStatusInvalidations,
        getDynamicSimulationRunningStatus,
        RunButtonType.DYNAMIC_SIMULATION
    );

    useNodeData(
        studyUuid,
        currentNodeUuid,
        fetchVoltageInitStatus,
        voltageInitStatusInvalidations,
        getVoltageInitRunningStatus,
        RunButtonType.VOLTAGE_INIT
    );
};
