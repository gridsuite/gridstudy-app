/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { convertInputValue, convertOutputValue, FieldType, MODIFICATION_TYPES } from '@gridsuite/commons-ui';
import {
    B,
    B1,
    B2,
    CONNECTED,
    CONNECTED1,
    CONNECTED2,
    COUNTRY,
    ENERGY_SOURCE,
    EQUIPMENT_ID,
    FORCED_OUTAGE_RATE,
    G,
    G1,
    G2,
    HIGH_VOLTAGE_LIMIT,
    LOAD_TYPE,
    LOW_VOLTAGE_LIMIT,
    MARGINAL_COST,
    MAX_P,
    MAX_Q_AT_NOMINAL_V,
    MAX_SUSCEPTANCE,
    MAXIMUM_SECTION_COUNT,
    MIN_P,
    NOMINAL_V,
    P0,
    PLANNED_ACTIVE_POWER_SET_POINT,
    PLANNED_OUTAGE_RATE,
    Q0,
    R,
    RATED_S,
    RATED_U1,
    RATED_U2,
    SECTION_COUNT,
    SHUNT_COMPENSATOR_TYPE,
    STEP_UP_TRANSFORMER_REACTANCE,
    TARGET_P,
    TARGET_Q,
    TARGET_V,
    TRANSIENT_REACTANCE,
    VOLTAGE_REGULATION_ON,
    X,
} from 'components/utils/field-constants';
import { toModificationOperation } from '../../../utils/utils';

export interface TabularModificationFields {
    [key: string]: string[];
}

export const TABULAR_MODIFICATION_FIELDS: TabularModificationFields = {
    GENERATOR: [
        EQUIPMENT_ID,
        ENERGY_SOURCE,
        MIN_P,
        MAX_P,
        TARGET_P,
        RATED_S,
        TARGET_Q,
        VOLTAGE_REGULATION_ON,
        TARGET_V,
        CONNECTED,
        TRANSIENT_REACTANCE,
        STEP_UP_TRANSFORMER_REACTANCE,
        PLANNED_ACTIVE_POWER_SET_POINT,
        MARGINAL_COST,
        PLANNED_OUTAGE_RATE,
        FORCED_OUTAGE_RATE,
    ],
    BATTERY: [EQUIPMENT_ID, MIN_P, TARGET_P, MAX_P, TARGET_Q, CONNECTED],
    VOLTAGE_LEVEL: [EQUIPMENT_ID, NOMINAL_V, LOW_VOLTAGE_LIMIT, HIGH_VOLTAGE_LIMIT],
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
    TWO_WINDINGS_TRANSFORMER: [EQUIPMENT_ID, R, X, G, B, RATED_U1, RATED_U2, RATED_S, CONNECTED1, CONNECTED2],
    SUBSTATION: [EQUIPMENT_ID, COUNTRY],
};

export const TABULAR_MODIFICATION_TYPES: { [key: string]: string } = {
    GENERATOR: MODIFICATION_TYPES.GENERATOR_MODIFICATION.type,
    LOAD: MODIFICATION_TYPES.LOAD_MODIFICATION.type,
    BATTERY: MODIFICATION_TYPES.BATTERY_MODIFICATION.type,
    VOLTAGE_LEVEL: MODIFICATION_TYPES.VOLTAGE_LEVEL_MODIFICATION.type,
    SHUNT_COMPENSATOR: MODIFICATION_TYPES.SHUNT_COMPENSATOR_MODIFICATION.type,
    LINE: MODIFICATION_TYPES.LINE_MODIFICATION.type,
    TWO_WINDINGS_TRANSFORMER: MODIFICATION_TYPES.TWO_WINDINGS_TRANSFORMER_MODIFICATION.type,
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

export const getEquipmentTypeFromModificationType = (type: string) => {
    return Object.keys(TABULAR_MODIFICATION_TYPES).find((key) => TABULAR_MODIFICATION_TYPES[key] === type);
};

export const styles = {
    grid: { height: 500, width: '100%' },
};

/**
 * Convert a camelCase string to SNAKE_CASE format and map it to a key in the FieldType enum.
 * @param key - The camelCase string to be converted.
 * @returns The corresponding value from the FieldType enum.
 */
const convertCamelToSnake = (key: string) =>
    FieldType[
        key
            .split(/\.?(?=[A-Z])/)
            .join('_')
            .toUpperCase() as keyof typeof FieldType
    ];

export const convertInputValues = (key: string, value: { value: string | number }) => {
    if (key === EQUIPMENT_ID) {
        return value;
    }
    return convertInputValue(convertCamelToSnake(key), value?.value);
};

export const convertOutputValues = (key: string, value: string | number) => {
    if (key === EQUIPMENT_ID) {
        return value;
    }
    return toModificationOperation(convertOutputValue(convertCamelToSnake(key), value));
};
