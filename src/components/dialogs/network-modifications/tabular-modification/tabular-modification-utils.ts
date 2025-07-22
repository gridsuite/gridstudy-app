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
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    COUNTRY,
    DROOP,
    ENERGY_SOURCE,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    FORCED_OUTAGE_RATE,
    G,
    G1,
    G2,
    HIGH_VOLTAGE_LIMIT,
    IP_MIN,
    IP_MAX,
    LOAD_TYPE,
    LOW_VOLTAGE_LIMIT,
    MARGINAL_COST,
    MAX_P,
    MAX_Q,
    MAX_Q_AT_NOMINAL_V,
    MAX_SUSCEPTANCE,
    MAXIMUM_SECTION_COUNT,
    MIN_P,
    MIN_Q,
    NOMINAL_V,
    P0,
    PARTICIPATE,
    PLANNED_ACTIVE_POWER_SET_POINT,
    PLANNED_OUTAGE_RATE,
    Q0,
    Q_PERCENT,
    R,
    RATED_S,
    RATED_U1,
    RATED_U2,
    REACTIVE_CAPABILITY_CURVE,
    REACTIVE_CAPABILITY_CURVE_P_0,
    REACTIVE_CAPABILITY_CURVE_P_MAX,
    REACTIVE_CAPABILITY_CURVE_P_MIN,
    REACTIVE_CAPABILITY_CURVE_POINTS,
    REACTIVE_CAPABILITY_CURVE_Q_MAX_P_0,
    REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MAX,
    REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MIN,
    REACTIVE_CAPABILITY_CURVE_Q_MIN_P_0,
    REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MAX,
    REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MIN,
    REGULATING_TERMINAL_ID,
    REGULATING_TERMINAL_TYPE,
    REGULATING_TERMINAL_VOLTAGE_LEVEL_ID,
    SECTION_COUNT,
    SHUNT_COMPENSATOR_TYPE,
    STEP_UP_TRANSFORMER_REACTANCE,
    TARGET_P,
    TARGET_Q,
    TARGET_V,
    TRANSIENT_REACTANCE,
    VOLTAGE_REGULATION_ON,
    X,
    LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
    HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
    CONNECTION_NAME1,
    CONNECTION_DIRECTION1,
    CONNECTION_POSITION1,
    CONNECTION_NAME2,
    CONNECTION_DIRECTION2,
    CONNECTION_POSITION2,
    PERMANENT_LIMIT,
    TEMPORARY_LIMIT_NAME,
    TEMPORARY_LIMIT_DURATION,
    TEMPORARY_LIMIT_VALUE,
    MODIFICATION_TYPE,
    SIDE,
    LIMIT_GROUP_NAME,
    TEMPORARY_LIMITS_MODIFICATION_TYPE,
} from 'components/utils/field-constants';
import { toModificationOperation } from '../../../utils/utils';
import { ReactiveCapabilityCurvePoints } from 'components/dialogs/reactive-limits/reactive-limits.type';
import { convertReactiveCapabilityCurvePointsFromBackToFront } from '../tabular-creation/tabular-creation-utils';

export interface TabularModificationFields {
    [key: string]: string[];
}

const REACTIVE_CAPABILITY_CURVE_FIELDS = [
    REACTIVE_CAPABILITY_CURVE,
    REACTIVE_CAPABILITY_CURVE_P_MIN,
    REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MIN,
    REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MIN,
    REACTIVE_CAPABILITY_CURVE_P_0,
    REACTIVE_CAPABILITY_CURVE_Q_MIN_P_0,
    REACTIVE_CAPABILITY_CURVE_Q_MAX_P_0,
    REACTIVE_CAPABILITY_CURVE_P_MAX,
    REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MAX,
    REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MAX,
];

export const LIMIT_SETS_TABULAR_MODIFICATION_EQUIPMENTS: { [key: string]: string } = {
    LINE: MODIFICATION_TYPES.LINE_MODIFICATION.type,
    TWO_WINDINGS_TRANSFORMER: MODIFICATION_TYPES.TWO_WINDINGS_TRANSFORMER_MODIFICATION.type,
};

export const LIMIT_SETS_TABULAR_MODIFICATION_FIXED_FIELDS = [
    EQUIPMENT_ID,
    SIDE,
    LIMIT_GROUP_NAME,
    PERMANENT_LIMIT,
    MODIFICATION_TYPE,
    TEMPORARY_LIMITS_MODIFICATION_TYPE,
];

export const LIMIT_SETS_TABULAR_MODIFICATION_REPEATABLE_FIELDS = [
    TEMPORARY_LIMIT_NAME,
    TEMPORARY_LIMIT_DURATION,
    TEMPORARY_LIMIT_VALUE,
];

export const TABULAR_MODIFICATION_FIELDS: TabularModificationFields = {
    SUBSTATION: [EQUIPMENT_ID, EQUIPMENT_NAME, COUNTRY],
    VOLTAGE_LEVEL: [EQUIPMENT_ID, EQUIPMENT_NAME, NOMINAL_V, LOW_VOLTAGE_LIMIT, HIGH_VOLTAGE_LIMIT, IP_MIN, IP_MAX],
    LINE: [
        EQUIPMENT_ID,
        EQUIPMENT_NAME,
        R,
        X,
        G1,
        G2,
        B1,
        B2,
        CONNECTED1,
        CONNECTION_NAME1,
        CONNECTION_DIRECTION1,
        CONNECTION_POSITION1,
        CONNECTED2,
        CONNECTION_NAME2,
        CONNECTION_DIRECTION2,
        CONNECTION_POSITION2,
    ],
    TWO_WINDINGS_TRANSFORMER: [
        EQUIPMENT_ID,
        EQUIPMENT_NAME,
        R,
        X,
        G,
        B,
        RATED_U1,
        RATED_U2,
        RATED_S,
        CONNECTED1,
        CONNECTION_NAME1,
        CONNECTION_DIRECTION1,
        CONNECTION_POSITION1,
        CONNECTED2,
        CONNECTION_NAME2,
        CONNECTION_DIRECTION2,
        CONNECTION_POSITION2,
    ],
    GENERATOR: [
        EQUIPMENT_ID,
        EQUIPMENT_NAME,
        ENERGY_SOURCE,
        CONNECTED,
        CONNECTION_NAME,
        CONNECTION_DIRECTION,
        CONNECTION_POSITION,
        MIN_P,
        MAX_P,
        RATED_S,
        MIN_Q,
        MAX_Q,
        ...REACTIVE_CAPABILITY_CURVE_FIELDS,
        TARGET_P,
        TARGET_Q,
        VOLTAGE_REGULATION_ON,
        TARGET_V,
        REGULATING_TERMINAL_ID,
        REGULATING_TERMINAL_TYPE,
        REGULATING_TERMINAL_VOLTAGE_LEVEL_ID,
        Q_PERCENT,
        PARTICIPATE,
        DROOP,
        TRANSIENT_REACTANCE,
        STEP_UP_TRANSFORMER_REACTANCE,
        PLANNED_ACTIVE_POWER_SET_POINT,
        MARGINAL_COST,
        PLANNED_OUTAGE_RATE,
        FORCED_OUTAGE_RATE,
    ],
    LOAD: [
        EQUIPMENT_ID,
        EQUIPMENT_NAME,
        LOAD_TYPE,
        CONNECTED,
        CONNECTION_NAME,
        CONNECTION_DIRECTION,
        CONNECTION_POSITION,
        P0,
        Q0,
    ],
    BATTERY: [
        EQUIPMENT_ID,
        EQUIPMENT_NAME,
        CONNECTED,
        CONNECTION_NAME,
        CONNECTION_DIRECTION,
        CONNECTION_POSITION,
        MIN_P,
        MAX_P,
        MIN_Q,
        MAX_Q,
        ...REACTIVE_CAPABILITY_CURVE_FIELDS,
        TARGET_P,
        TARGET_Q,
        PARTICIPATE,
        DROOP,
    ],
    SHUNT_COMPENSATOR: [
        EQUIPMENT_ID,
        EQUIPMENT_NAME,
        CONNECTED,
        CONNECTION_NAME,
        CONNECTION_DIRECTION,
        CONNECTION_POSITION,
        MAXIMUM_SECTION_COUNT,
        SECTION_COUNT,
        SHUNT_COMPENSATOR_TYPE,
        MAX_Q_AT_NOMINAL_V,
        MAX_SUSCEPTANCE,
    ],
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

export const convertReactiveCapabilityCurvePointsFromFrontToBack = (modification: Record<string, unknown>) => {
    if (modification[REACTIVE_CAPABILITY_CURVE]) {
        //Convert list data to matrix
        const rccPoints = [];
        if (modification[REACTIVE_CAPABILITY_CURVE_P_MIN] !== null) {
            rccPoints.push({
                p: modification[REACTIVE_CAPABILITY_CURVE_P_MIN],
                maxQ: modification[REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MIN],
                minQ: modification[REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MIN],
            });
        }
        if (modification[REACTIVE_CAPABILITY_CURVE_P_0] !== null) {
            rccPoints.push({
                p: modification[REACTIVE_CAPABILITY_CURVE_P_0],
                maxQ: modification[REACTIVE_CAPABILITY_CURVE_Q_MAX_P_0],
                minQ: modification[REACTIVE_CAPABILITY_CURVE_Q_MIN_P_0],
            });
        }
        if (modification[REACTIVE_CAPABILITY_CURVE_P_MAX] !== null) {
            rccPoints.push({
                p: modification[REACTIVE_CAPABILITY_CURVE_P_MAX],
                maxQ: modification[REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MAX],
                minQ: modification[REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MAX],
            });
        }
        modification[REACTIVE_CAPABILITY_CURVE_POINTS] = rccPoints;
    }
};

export const getFieldType = (modificationType: string, key: string) => {
    let fieldType = key;
    // In some cases, the key used in tabular modification does not match the key used in atomic modification,
    // criteria filters, and commons-ui convert functions.
    if (modificationType === TABULAR_MODIFICATION_TYPES.VOLTAGE_LEVEL) {
        if (key === IP_MIN) {
            fieldType = LOW_SHORT_CIRCUIT_CURRENT_LIMIT;
        } else if (key === IP_MAX) {
            fieldType = HIGH_SHORT_CIRCUIT_CURRENT_LIMIT;
        }
    }
    return fieldType;
};

export const convertGeneratorOrBatteryModificationFromBackToFront = (modification: Modification) => {
    const formattedModification: Modification = {};
    Object.keys(modification).forEach((key) => {
        if (key === REACTIVE_CAPABILITY_CURVE_POINTS) {
            convertReactiveCapabilityCurvePointsFromBackToFront(
                modification[key] as ReactiveCapabilityCurvePoints[]
            ).forEach((point) => {
                formattedModification[point.key] = point.value;
            });
        } else {
            formattedModification[key] = convertInputValues(key, modification[key]);
        }
    });
    return formattedModification;
};

export const convertGeneratorOrBatteryModificationFromFrontToBack = (modification: Modification) => {
    const formattedModification: Modification = { ...modification };
    convertReactiveCapabilityCurvePointsFromFrontToBack(formattedModification);
    // Remove the individual reactive capability curve fields
    REACTIVE_CAPABILITY_CURVE_FIELDS.forEach((field) => {
        if (field !== REACTIVE_CAPABILITY_CURVE) {
            delete formattedModification[field];
        }
    });
    Object.keys(formattedModification).forEach((key) => {
        if (key !== REACTIVE_CAPABILITY_CURVE_POINTS) {
            formattedModification[key] = convertOutputValues(key, formattedModification[key]);
        }
    });
    return formattedModification;
};
