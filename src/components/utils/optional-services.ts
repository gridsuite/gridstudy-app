/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export enum OptionalServicesNames {
    SecurityAnalysis = 'SecurityAnalysis',
    SensitivityAnalysis = 'SensitivityAnalysis',
    DynamicSimulation = 'DynamicSimulation',
    DynamicSecurityAnalysis = 'DynamicSecurityAnalysis',
    ShortCircuit = 'ShortCircuit',
    VoltageInit = 'VoltageInit',
    StateEstimation = 'StateEstimation',
}
export enum OptionalServicesStatus {
    Up = 'UP',
    Down = 'DOWN',
    Pending = 'PENDING',
}

export interface IOptionalService {
    name: OptionalServicesNames;
    status: OptionalServicesStatus;
}
export const getOptionalServiceByServerName = (serverName: string): OptionalServicesNames | undefined => {
    switch (serverName) {
        case 'security-analysis-server':
            return OptionalServicesNames.SecurityAnalysis;
        case 'sensitivity-analysis-server':
            return OptionalServicesNames.SensitivityAnalysis;
        case 'dynamic-simulation-server':
            return OptionalServicesNames.DynamicSimulation;
        case 'dynamic-security-analysis-server':
            return OptionalServicesNames.DynamicSecurityAnalysis;
        case 'shortcircuit-server':
            return OptionalServicesNames.ShortCircuit;
        case 'voltage-init-server':
            return OptionalServicesNames.VoltageInit;
        case 'state-estimation-server':
            return OptionalServicesNames.StateEstimation;
        default:
            return;
    }
};
