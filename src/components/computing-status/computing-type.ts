/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export enum ComputingType {
    LOAD_FLOW = 'LOAD_FLOW',
    SECURITY_ANALYSIS = 'SECURITY_ANALYSIS',
    SENSITIVITY_ANALYSIS = 'SENSITIVITY_ANALYSIS',
    NON_EVACUATED_ENERGY_ANALYSIS = 'NON_EVACUATED_ENERGY_ANALYSIS',
    SHORT_CIRCUIT = 'SHORT_CIRCUIT',
    SHORT_CIRCUIT_ONE_BUS = 'SHORT_CIRCUIT_ONE_BUS',
    DYNAMIC_SIMULATION = 'DYNAMIC_SIMULATION',
    VOLTAGE_INITIALIZATION = 'VOLTAGE_INITIALIZATION',
    STATE_ESTIMATION = 'STATE_ESTIMATION',
}

export const isValidComputingType = (value: string | undefined): boolean => {
    return Object.values(ComputingType).includes(value as ComputingType);
};

export default ComputingType;
