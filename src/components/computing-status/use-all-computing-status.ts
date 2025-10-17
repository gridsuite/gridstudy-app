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
    getPccMinRunningStatus,
    getSecurityAnalysisRunningStatus,
    getSensitivityAnalysisRunningStatus,
    getShortCircuitAnalysisRunningStatus,
    getStateEstimationRunningStatus,
    getVoltageInitRunningStatus,
} from '../utils/running-status';

import type { UUID } from 'node:crypto';
import { ComputingType } from '@gridsuite/commons-ui';
import { fetchSensitivityAnalysisStatus } from '../../services/study/sensitivity-analysis';
import { fetchSecurityAnalysisStatus } from '../../services/study/security-analysis';
import { fetchDynamicSimulationStatus } from '../../services/study/dynamic-simulation';
import {
    fetchOneBusShortCircuitAnalysisStatus,
    fetchShortCircuitAnalysisStatus,
} from '../../services/study/short-circuit-analysis';
import { fetchVoltageInitStatus } from '../../services/study/voltage-init';
import { fetchLoadFlowStatus, fetchLoadFlowComputationInfos } from '../../services/study/loadflow';
import { OptionalServicesNames } from '../utils/optional-services';
import { useOptionalServiceStatus } from '../../hooks/use-optional-service-status';
import { fetchStateEstimationStatus } from '../../services/study/state-estimation';
import { fetchDynamicSecurityAnalysisStatus } from '../../services/study/dynamic-security-analysis';
import { NotificationType } from 'types/notification-types';
import { fetchPccMinStatus } from 'services/study/pcc-min';

// status invalidations
const loadFlowStatusInvalidations = [NotificationType.LOADFLOW_STATUS, NotificationType.LOADFLOW_FAILED];
const securityAnalysisStatusInvalidations = [
    NotificationType.SECURITY_ANALYSIS_STATUS,
    NotificationType.SECURITY_ANALYSIS_FAILED,
];
const sensitivityAnalysisStatusInvalidations = [
    NotificationType.SENSITIVITY_ANALYSIS_STATUS,
    NotificationType.SENSITIVITY_ANALYSIS_FAILED,
];
const shortCircuitAnalysisStatusInvalidations = [
    NotificationType.SHORTCIRCUIT_ANALYSIS_STATUS,
    NotificationType.SHORTCIRCUIT_ANALYSIS_FAILED,
];
const oneBusShortCircuitAnalysisStatusInvalidations = [
    NotificationType.ONE_BUS_SC_ANALYSIS_STATUS,
    NotificationType.ONE_BUS_SC_ANALYSIS_FAILED,
];
const dynamicSimulationStatusInvalidations = [
    NotificationType.DYNAMIC_SIMULATION_STATUS,
    NotificationType.DYNAMIC_SIMULATION_FAILED,
];
const dynamicSecurityAnalysisStatusInvalidations = [
    NotificationType.DYNAMIC_SECURITY_ANALYSIS_STATUS,
    NotificationType.DYNAMIC_SECURITY_ANALYSIS_FAILED,
];
const voltageInitStatusInvalidations = [NotificationType.VOLTAGE_INIT_STATUS, NotificationType.VOLTAGE_INIT_FAILED];
const stateEstimationStatusInvalidations = [
    NotificationType.STATE_ESTIMATION_STATUS,
    NotificationType.STATE_ESTIMATION_FAILED,
];
const pccMinStatusInvalidations = [NotificationType.PCC_MIN_STATUS, NotificationType.PCC_MIN_FAILED];

// status completions
const loadFlowStatusCompletions = [NotificationType.LOADFLOW_RESULT, NotificationType.LOADFLOW_FAILED];
const securityAnalysisStatusCompletions = [
    NotificationType.SECURITY_ANALYSIS_RESULT,
    NotificationType.SECURITY_ANALYSIS_FAILED,
];
const sensitivityAnalysisStatusCompletions = [
    NotificationType.SENSITIVITY_ANALYSIS_RESULT,
    NotificationType.SENSITIVITY_ANALYSIS_FAILED,
];
const shortCircuitAnalysisStatusCompletions = [
    NotificationType.SHORTCIRCUIT_ANALYSIS_RESULT,
    NotificationType.SHORTCIRCUIT_ANALYSIS_FAILED,
];
const oneBusShortCircuitAnalysisStatusCompletions = [
    NotificationType.ONE_BUS_SC_ANALYSIS_RESULT,
    NotificationType.ONE_BUS_SC_ANALYSIS_FAILED,
];
const dynamicSimulationStatusCompletions = [
    NotificationType.DYNAMIC_SIMULATION_RESULT,
    NotificationType.DYNAMIC_SIMULATION_FAILED,
];
const dynamicSecurityAnalysisStatusCompletions = [
    NotificationType.DYNAMIC_SECURITY_ANALYSIS_RESULT,
    NotificationType.DYNAMIC_SECURITY_ANALYSIS_FAILED,
];
const voltageInitStatusCompletions = [NotificationType.VOLTAGE_INIT_RESULT, NotificationType.VOLTAGE_INIT_FAILED];
const stateEstimationStatusCompletions = [
    NotificationType.STATE_ESTIMATION_RESULT,
    NotificationType.STATE_ESTIMATION_FAILED,
];
const pccMinStatusCompletions = [NotificationType.PCC_MIN_RESULT, NotificationType.PCC_MIN_FAILED];

// result invalidations
export const loadflowResultInvalidations = [NotificationType.LOADFLOW_RESULT];
export const securityAnalysisResultInvalidations = [NotificationType.SECURITY_ANALYSIS_RESULT];
export const dynamicSimulationResultInvalidations = [NotificationType.DYNAMIC_SIMULATION_RESULT];
export const dynamicSecurityAnalysisResultInvalidations = [NotificationType.DYNAMIC_SECURITY_ANALYSIS_RESULT];
export const voltageInitResultInvalidations = [NotificationType.VOLTAGE_INIT_RESULT];
export const stateEstimationResultInvalidations = [NotificationType.STATE_ESTIMATION_RESULT];

// this hook loads all current computation status into redux then keeps them up to date according to notifications
export const useAllComputingStatus = (studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID): void => {
    const securityAnalysisAvailability = useOptionalServiceStatus(OptionalServicesNames.SecurityAnalysis);
    const sensitivityAnalysisAvailability = useOptionalServiceStatus(OptionalServicesNames.SensitivityAnalysis);
    const dynamicSimulationAvailability = useOptionalServiceStatus(OptionalServicesNames.DynamicSimulation);
    const dynamicSecurityAnalysisAvailability = useOptionalServiceStatus(OptionalServicesNames.DynamicSecurityAnalysis);
    const voltageInitAvailability = useOptionalServiceStatus(OptionalServicesNames.VoltageInit);
    const shortCircuitAvailability = useOptionalServiceStatus(OptionalServicesNames.ShortCircuit);
    const stateEstimationAvailability = useOptionalServiceStatus(OptionalServicesNames.StateEstimation);
    const pccMinAvailability = useOptionalServiceStatus(OptionalServicesNames.PccMin);

    useComputingStatus(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid,
        fetchLoadFlowStatus,
        loadFlowStatusInvalidations,
        loadFlowStatusCompletions,
        getLoadFlowRunningStatus,
        ComputingType.LOAD_FLOW,
        fetchLoadFlowComputationInfos
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
        undefined,
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
        undefined,
        sensitivityAnalysisAvailability
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
        undefined,
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
        undefined,
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
        undefined,
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
        undefined,
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
        undefined,
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
        undefined,
        stateEstimationAvailability
    );

    useComputingStatus(
        studyUuid,
        currentNodeUuid,
        currentRootNetworkUuid,
        fetchPccMinStatus,
        pccMinStatusInvalidations,
        pccMinStatusCompletions,
        getPccMinRunningStatus,
        ComputingType.PCC_MIN,
        undefined,
        pccMinAvailability
    );
};
