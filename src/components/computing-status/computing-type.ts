/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export enum ComputingType {
    LOADFLOW = 'LOADFLOW',
    SECURITY_ANALYSIS = 'SECURITY_ANALYSIS',
    SENSITIVITY_ANALYSIS = 'SENSITIVITY_ANALYSIS',
    NON_EVACUATED_ENERGY_ANALYSIS = 'NON_EVACUATED_ENERGY_ANALYSIS',
    ALL_BUSES_SHORTCIRCUIT_ANALYSIS = 'ALL_BUSES_SHORTCIRCUIT_ANALYSIS',
    ONE_BUS_SHORTCIRCUIT_ANALYSIS = 'ONE_BUS_SHORTCIRCUIT_ANALYSIS',
    DYNAMIC_SIMULATION = 'DYNAMIC_SIMULATION',
    VOLTAGE_INIT = 'VOLTAGE_INIT',
}

export default ComputingType;
