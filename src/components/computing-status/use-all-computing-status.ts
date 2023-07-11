/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useComputingStatus } from './use-computing-status';
import {
    getSecurityAnalysisRunningStatus,
    getSensitivityAnalysisRunningStatus,
    getShortCircuitAnalysisRunningStatus,
    getDynamicSimulationRunningStatus,
    getVoltageInitRunningStatus,
} from '../utils/running-status';

import {
    fetchShortCircuitAnalysisStatus,
    fetchVoltageInitStatus,
} from '../../utils/rest-api';
import { UUID } from 'crypto';
import { ComputingType } from './computing-type';
import { fetchSensitivityAnalysisStatus } from '../../services/study/sensitivity-analysis';
import { fetchSecurityAnalysisStatus } from '../../services/study/security-analysis';
import { fetchDynamicSimulationStatus } from '../../services/study/dynamic-simulation';

const securityAnalysisStatusInvalidations = [
    'securityAnalysis_status',
    'securityAnalysis_failed',
];
const sensitivityAnalysisStatusInvalidations = [
    'sensitivityAnalysis_status',
    'sensitivityAnalysis_failed',
];
const shortCircuitAnalysisStatusInvalidations = [
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
        sensitivityAnalysisStatusInvalidations,
        getSensitivityAnalysisRunningStatus,
        ComputingType.SENSITIVITY_ANALYSIS
    );

    useComputingStatus(
        studyUuid,
        currentNodeUuid,
        fetchShortCircuitAnalysisStatus,
        shortCircuitAnalysisStatusInvalidations,
        getShortCircuitAnalysisRunningStatus,
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
