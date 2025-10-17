/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export enum RunningStatus {
    SUCCEED = 'SUCCEED',
    FAILED = 'FAILED',
    IDLE = 'IDLE',
    RUNNING = 'RUNNING',
}

export default RunningStatus;

export function getLoadFlowRunningStatus(loadFlowStatus: string | null): RunningStatus {
    switch (loadFlowStatus) {
        case 'CONVERGED':
            return RunningStatus.SUCCEED;
        case 'DIVERGED':
            return RunningStatus.FAILED;
        case 'RUNNING':
            return RunningStatus.RUNNING;
        case 'NOT_DONE':
            return RunningStatus.IDLE;
        case 'FAILED':
            return RunningStatus.FAILED;
        default:
            return RunningStatus.IDLE;
    }
}

export function getSecurityAnalysisRunningStatus(securityAnalysisStatus: string | null): RunningStatus {
    switch (securityAnalysisStatus) {
        case 'CONVERGED':
            return RunningStatus.SUCCEED;
        case 'DIVERGED':
            return RunningStatus.FAILED;
        case 'RUNNING':
            return RunningStatus.RUNNING;
        case 'NOT_DONE':
            return RunningStatus.IDLE;
        default:
            return RunningStatus.IDLE;
    }
}

export function getSensitivityAnalysisRunningStatus(sensitivityAnalysisStatus: string | null): RunningStatus {
    switch (sensitivityAnalysisStatus) {
        case 'COMPLETED':
            return RunningStatus.SUCCEED;
        case 'RUNNING':
            return RunningStatus.RUNNING;
        case 'NOT_DONE':
            return RunningStatus.IDLE;
        default:
            return RunningStatus.IDLE;
    }
}

export function getShortCircuitAnalysisRunningStatus(shortCircuitAnalysisStatus: string | null): RunningStatus {
    switch (shortCircuitAnalysisStatus) {
        case 'COMPLETED':
            return RunningStatus.SUCCEED;
        case 'RUNNING':
            return RunningStatus.RUNNING;
        case 'NOT_DONE':
            return RunningStatus.IDLE;
        case 'FAILED':
            return RunningStatus.FAILED;
        default:
            return RunningStatus.IDLE;
    }
}

export function getDynamicSimulationRunningStatus(dynamicSimulationStatus: string | null): RunningStatus {
    switch (dynamicSimulationStatus) {
        case 'CONVERGED':
            return RunningStatus.SUCCEED;
        case 'DIVERGED':
            return RunningStatus.FAILED;
        case 'RUNNING':
            return RunningStatus.RUNNING;
        case 'NOT_DONE':
            return RunningStatus.IDLE;
        default:
            return RunningStatus.IDLE;
    }
}

export function getDynamicSecurityAnalysisRunningStatus(dynamicSecurityAnalysisStatus: string | null): RunningStatus {
    switch (dynamicSecurityAnalysisStatus) {
        case 'SUCCEED':
            return RunningStatus.SUCCEED;
        case 'FAILED':
            return RunningStatus.FAILED;
        case 'RUNNING':
            return RunningStatus.RUNNING;
        case 'NOT_DONE':
            return RunningStatus.IDLE;
        default:
            return RunningStatus.IDLE;
    }
}

export function getVoltageInitRunningStatus(voltageInitStatus: string | null): RunningStatus {
    switch (voltageInitStatus) {
        case 'OK':
            return RunningStatus.SUCCEED;
        case 'NOT_OK':
            return RunningStatus.FAILED;
        case 'RUNNING':
            return RunningStatus.RUNNING;
        case 'NOT_DONE':
            return RunningStatus.IDLE;
        default:
            return RunningStatus.IDLE;
    }
}

export function getStateEstimationRunningStatus(stateEstimationStatus: string | null): RunningStatus {
    switch (stateEstimationStatus) {
        case 'COMPLETED':
            return RunningStatus.SUCCEED;
        case 'RUNNING':
            return RunningStatus.RUNNING;
        case 'NOT_DONE':
            return RunningStatus.IDLE;
        default:
            return RunningStatus.IDLE;
    }
}

export function getPccMinRunningStatus(pccMinStatus: string | null): RunningStatus {
    switch (pccMinStatus) {
        case 'COMPLETED':
            return RunningStatus.SUCCEED;
        case 'RUNNING':
            return RunningStatus.RUNNING;
        case 'NOT_DONE':
            return RunningStatus.IDLE;
        default:
            return RunningStatus.IDLE;
    }
}
