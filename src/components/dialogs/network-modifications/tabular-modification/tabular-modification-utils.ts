/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MODIFICATION_TYPES } from 'components/utils/modification-type';
import {
    ACTIVE_POWER_SET_POINT,
    CONNECTED,
    CONNECTED1,
    CONNECTED2,
    ENERGY_SOURCE,
    EQUIPMENT_ID,
    FORCED_OUTAGE_RATE,
    HIGH_VOLTAGE_LIMIT,
    LOAD_TYPE,
    LOW_VOLTAGE_LIMIT,
    G,
    B,
    MARGINAL_COST,
    MAX_ACTIVE_POWER,
    MAX_Q_AT_NOMINAL_V,
    MAX_SUSCEPTANCE,
    MAXIMUM_SECTION_COUNT,
    MIN_ACTIVE_POWER,
    NOMINAL_VOLTAGE,
    P0,
    PLANNED_ACTIVE_POWER_SET_POINT,
    PLANNED_OUTAGE_RATE,
    Q0,
    RATED_NOMINAL_POWER,
    RATED_S,
    RATED_U1,
    RATED_U2,
    REACTIVE_POWER_SET_POINT,
    SECTION_COUNT,
    R,
    X,
    SHUNT_COMPENSATOR_TYPE,
    G1,
    B1,
    G2,
    B2,
    STEP_UP_TRANSFORMER_REACTANCE,
    SUBSTATION_COUNTRY,
    TRANSIENT_REACTANCE,
    VOLTAGE_REGULATION_ON,
    VOLTAGE_SET_POINT,
} from 'components/utils/field-constants';
import { microUnitToUnit, unitToMicroUnit } from 'utils/unit-converter';
import { toModificationOperation } from 'components/utils/utils';

export interface TabularModificationFields {
    [key: string]: string[];
}

export const TABULAR_MODIFICATION_FIELDS: TabularModificationFields = {
    GENERATOR: [
        EQUIPMENT_ID,
        ENERGY_SOURCE,
        MIN_ACTIVE_POWER,
        MAX_ACTIVE_POWER,
        ACTIVE_POWER_SET_POINT,
        RATED_NOMINAL_POWER,
        REACTIVE_POWER_SET_POINT,
        VOLTAGE_REGULATION_ON,
        VOLTAGE_SET_POINT,
        CONNECTED,
        TRANSIENT_REACTANCE,
        STEP_UP_TRANSFORMER_REACTANCE,
        PLANNED_ACTIVE_POWER_SET_POINT,
        MARGINAL_COST,
        PLANNED_OUTAGE_RATE,
        FORCED_OUTAGE_RATE,
    ],
    BATTERY: [
        EQUIPMENT_ID,
        MIN_ACTIVE_POWER,
        ACTIVE_POWER_SET_POINT,
        MAX_ACTIVE_POWER,
        REACTIVE_POWER_SET_POINT,
        CONNECTED,
    ],
    VOLTAGE_LEVEL: [
        EQUIPMENT_ID,
        NOMINAL_VOLTAGE,
        LOW_VOLTAGE_LIMIT,
        HIGH_VOLTAGE_LIMIT,
    ],
    SHUNT_COMPENSATOR: [
        EQUIPMENT_ID,
        MAXIMUM_SECTION_COUNT,
        SECTION_COUNT,
        SHUNT_COMPENSATOR_TYPE,
        MAX_Q_AT_NOMINAL_V,
        MAX_SUSCEPTANCE,
        CONNECTED,
    ],
    LINE: [EQUIPMENT_ID, R, X, G1, G2, B1, B2, CONNECTED1, CONNECTED2],
    LOAD: [EQUIPMENT_ID, LOAD_TYPE, P0, Q0, CONNECTED],
    TWO_WINDINGS_TRANSFORMER: [
        EQUIPMENT_ID,
        R,
        X,
        G,
        B,
        RATED_U1,
        RATED_U2,
        RATED_S,
        CONNECTED1,
        CONNECTED2,
    ],
    SUBSTATION: [EQUIPMENT_ID, SUBSTATION_COUNTRY],
};

export const TABULAR_MODIFICATION_TYPES: { [key: string]: string } = {
    GENERATOR: MODIFICATION_TYPES.GENERATOR_MODIFICATION.type,
    LOAD: MODIFICATION_TYPES.LOAD_MODIFICATION.type,
    BATTERY: MODIFICATION_TYPES.BATTERY_MODIFICATION.type,
    VOLTAGE_LEVEL: MODIFICATION_TYPES.VOLTAGE_LEVEL_MODIFICATION.type,
    SHUNT_COMPENSATOR: MODIFICATION_TYPES.SHUNT_COMPENSATOR_MODIFICATION.type,
    LINE: MODIFICATION_TYPES.LINE_MODIFICATION.type,
    TWO_WINDINGS_TRANSFORMER:
        MODIFICATION_TYPES.TWO_WINDINGS_TRANSFORMER_MODIFICATION.type,
    SUBSTATION: MODIFICATION_TYPES.SUBSTATION_MODIFICATION.type,
};

export interface Modification {
    [key: string]: any;
}

export const formatModification = (modification: Modification) => {
    //exclude type, date and uuid from modification object
    const { type, date, uuid, ...rest } = modification;
    return rest;
};

export const convertValueFromBackToFront = (
    key: string,
    value: { value: string | number }
) => {
    switch (key) {
        case EQUIPMENT_ID:
            return value;
        case G:
        case B:
        case G1:
        case G2:
        case B1:
        case B2:
            return unitToMicroUnit(value?.value);
        default:
            return value?.value;
    }
};

export const convertValueFromFrontToBack = (
    key: string,
    value: string | number
) => {
    switch (key) {
        case EQUIPMENT_ID:
            return value;
        case G:
        case B:
        case G1:
        case G2:
        case B1:
        case B2:
            return toModificationOperation(microUnitToUnit(value));
        default:
            return toModificationOperation(value);
    }
};

export const getEquipmentTypeFromModificationType = (type: string) => {
    return Object.keys(TABULAR_MODIFICATION_TYPES).find(
        (key) => TABULAR_MODIFICATION_TYPES[key] === type
    );
};

export const styles = {
    grid: { height: 500, width: '100%' },
};
