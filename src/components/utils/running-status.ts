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

export function getLoadFlowRunningStatus(status: string): RunningStatus {
    switch (status) {
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

export function getSecurityAnalysisRunningStatus(
    securityAnalysisStatus: string
): RunningStatus {
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

export function getSensiRunningStatus(sensiStatus: string): RunningStatus {
    switch (sensiStatus) {
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

export function getShortCircuitRunningStatus(
    shortCircuitStatus: string
): RunningStatus {
    switch (shortCircuitStatus) {
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

export function getDynamicSimulationRunningStatus(
    dynamicSimulationStatus: string
): RunningStatus {
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

export function getVoltageInitRunningStatus(
    voltageInitStatus: string
): RunningStatus {
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
