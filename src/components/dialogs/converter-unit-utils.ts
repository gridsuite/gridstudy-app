/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { kiloUnitToUnit, microUnitToUnit, unitToKiloUnit, unitToMicroUnit } from '@gridsuite/commons-ui';

export enum FieldType {
    ID = 'ID',
    NAME = 'NAME',
    NOMINAL_VOLTAGE = 'NOMINAL_VOLTAGE',
    TARGET_V = 'TARGET_V',
    TARGET_P = 'TARGET_P',
    COUNTRY = 'COUNTRY',
    PLANNED_ACTIVE_POWER_SET_POINT = 'PLANNED_ACTIVE_POWER_SET_POINT',
    MARGINAL_COST = 'MARGINAL_COST',
    PLANNED_OUTAGE_RATE = 'PLANNED_OUTAGE_RATE',
    FORCED_OUTAGE_RATE = 'FORCED_OUTAGE_RATE',
    P0 = 'P0',
    Q0 = 'Q0',
    LOW_VOLTAGE_LIMIT = 'LOW_VOLTAGE_LIMIT',
    HIGH_VOLTAGE_LIMIT = 'HIGH_VOLTAGE_LIMIT',
    SECTION_COUNT = 'SECTION_COUNT',
    MAXIMUM_SECTION_COUNT = 'MAXIMUM_SECTION_COUNT',
    CONNECTED = 'CONNECTED',
    MAX_Q_AT_NOMINAL_V = 'MAX_Q_AT_NOMINAL_V',
    SHUNT_CONDUCTANCE_1 = 'SHUNT_CONDUCTANCE_1',
    SHUNT_CONDUCTANCE_2 = 'SHUNT_CONDUCTANCE_2',
    SHUNT_SUSCEPTANCE = 'SHUNT_SUSCEPTANCE',
    SHUNT_SUSCEPTANCE_1 = 'SHUNT_SUSCEPTANCE_1',
    SHUNT_SUSCEPTANCE_2 = 'SHUNT_SUSCEPTANCE_2',
    VOLTAGE_SET_POINT = 'VOLTAGE_SET_POINT',
    ACTIVE_POWER_SET_POINT = 'ACTIVE_POWER_SET_POINT',
    REACTIVE_POWER_SET_POINT = 'REACTIVE_POWER_SET_POINT',
    LOW_SHORT_CIRCUIT_CURRENT_LIMIT = 'LOW_SHORT_CIRCUIT_CURRENT_LIMIT',
    HIGH_SHORT_CIRCUIT_CURRENT_LIMIT = 'HIGH_SHORT_CIRCUIT_CURRENT_LIMIT',
    MAXIMUM_SUSCEPTANCE = 'MAXIMUM_SUSCEPTANCE',
    R = 'R',
    X = 'X',
    G = 'G',
    B = 'B',
    G1 = 'G1',
    B1 = 'B1',
    G2 = 'G2',
    B2 = 'B2',
}

const microUnits = [
    FieldType.SHUNT_CONDUCTANCE_1,
    FieldType.SHUNT_CONDUCTANCE_2,
    FieldType.SHUNT_SUSCEPTANCE_1,
    FieldType.SHUNT_SUSCEPTANCE_2,
    FieldType.G,
    FieldType.B,
    FieldType.G1,
    FieldType.B1,
    FieldType.G2,
    FieldType.B2,
];

const kiloUnits = [FieldType.HIGH_SHORT_CIRCUIT_CURRENT_LIMIT, FieldType.LOW_SHORT_CIRCUIT_CURRENT_LIMIT];
export function convertInputValues(field: FieldType, value: any) {
    if (microUnits.includes(field)) {
        if (!Array.isArray(value)) {
            return value ? unitToMicroUnit(value) : value;
        }
        return value.map((a: number) => unitToMicroUnit(a));
    }
    if (kiloUnits.includes(field)) {
        if (!Array.isArray(value)) {
            return value ? kiloUnitToUnit(value) : value;
        }
        return value.map((a: number) => kiloUnitToUnit(a));
    }
    return value;
}

export function convertOutputValues(field: FieldType, value: any) {
    if (microUnits.includes(field)) {
        if (!Array.isArray(value)) {
            return value ? microUnitToUnit(value) : value;
        }
        return value.map((a: number) => microUnitToUnit(a));
    }
    if (kiloUnits.includes(field)) {
        if (!Array.isArray(value)) {
            return value ? unitToKiloUnit(value) : value;
        }
        return value.map((a: number) => unitToKiloUnit(a));
    }
    return value;
}
