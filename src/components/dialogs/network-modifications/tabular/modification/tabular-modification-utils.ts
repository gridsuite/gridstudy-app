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
    TEMPORARY_LIMIT_MODIFICATION_TYPE,
    LIMIT_SETS_MODIFICATION_TYPE,
} from 'components/utils/field-constants';
import { toModificationOperation } from '../../../../utils/utils';
import { ReactiveCapabilityCurvePoints } from 'components/dialogs/reactive-limits/reactive-limits.type';
import {
    BOOLEAN,
    CONNECTION_DIRECTIONS,
    ENERGY_SOURCES,
    ENUM,
    LOAD_TYPES_FOR_LOAD_TABULAR_CREATION_MODIFICATION,
    NUMBER,
    REGULATING_TERMINAL_TYPES,
    SHUNT_COMPENSATOR_TYPES,
} from '../../../../network/constants';
import { BranchSide } from '../../../utils/constants';
import { PROPERTY_CSV_COLUMN_PREFIX } from '../properties/property-utils';
import {
    convertReactiveCapabilityCurvePointsFromBackToFront,
    convertReactiveCapabilityCurvePointsFromFrontToBack,
    Modification,
    TabularField,
    TabularFields,
} from '../tabular-common';

const REACTIVE_CAPABILITY_CURVE_FIELDS: TabularField[] = [
    { id: REACTIVE_CAPABILITY_CURVE, type: BOOLEAN },
    { id: REACTIVE_CAPABILITY_CURVE_P_MIN, type: NUMBER },
    { id: REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MIN, type: NUMBER },
    { id: REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MIN, type: NUMBER },
    { id: REACTIVE_CAPABILITY_CURVE_P_0, type: NUMBER },
    { id: REACTIVE_CAPABILITY_CURVE_Q_MIN_P_0, type: NUMBER },
    { id: REACTIVE_CAPABILITY_CURVE_Q_MAX_P_0, type: NUMBER },
    { id: REACTIVE_CAPABILITY_CURVE_P_MAX, type: NUMBER },
    { id: REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MAX, type: NUMBER },
    { id: REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MAX, type: NUMBER },
];

export const LIMIT_SETS_TABULAR_MODIFICATION_EQUIPMENTS: { [key: string]: string } = {
    LINE: MODIFICATION_TYPES.LINE_MODIFICATION.type,
    TWO_WINDINGS_TRANSFORMER: MODIFICATION_TYPES.TWO_WINDINGS_TRANSFORMER_MODIFICATION.type,
};

export const LIMIT_SETS_TABULAR_MODIFICATION_FIXED_FIELDS: TabularField[] = [
    { id: EQUIPMENT_ID, required: true },
    { id: SIDE, required: true, type: ENUM, options: Object.values(BranchSide) },
    { id: LIMIT_GROUP_NAME, required: true },
    { id: PERMANENT_LIMIT, required: false, type: NUMBER },
    {
        id: MODIFICATION_TYPE,
        required: true,
        type: ENUM,
        options: Object.values(LIMIT_SETS_MODIFICATION_TYPE),
    },
    {
        id: TEMPORARY_LIMITS_MODIFICATION_TYPE,
        required: false,
        type: ENUM,
        options: Object.values(TEMPORARY_LIMIT_MODIFICATION_TYPE),
    },
];

export const LIMIT_SETS_TABULAR_MODIFICATION_REPEATABLE_FIELDS: TabularField[] = [
    { id: TEMPORARY_LIMIT_NAME, required: false },
    { id: TEMPORARY_LIMIT_DURATION, required: false, type: NUMBER },
    { id: TEMPORARY_LIMIT_VALUE, required: false, type: NUMBER },
];

export const TABULAR_MODIFICATION_FIELDS: TabularFields = {
    SUBSTATION: [{ id: EQUIPMENT_ID }, { id: EQUIPMENT_NAME }, { id: COUNTRY }],
    VOLTAGE_LEVEL: [
        { id: EQUIPMENT_ID },
        { id: EQUIPMENT_NAME },
        { id: NOMINAL_V, type: NUMBER },
        { id: LOW_VOLTAGE_LIMIT, type: NUMBER },
        { id: HIGH_VOLTAGE_LIMIT, type: NUMBER },
        { id: IP_MIN, type: NUMBER },
        { id: IP_MAX, type: NUMBER },
    ],
    LINE: [
        { id: EQUIPMENT_ID },
        { id: EQUIPMENT_NAME },
        { id: R, type: NUMBER },
        { id: X, type: NUMBER },
        { id: G1, type: NUMBER },
        { id: G2, type: NUMBER },
        { id: B1, type: NUMBER },
        { id: B2, type: NUMBER },
        { id: CONNECTED1, type: BOOLEAN },
        { id: CONNECTION_NAME1 },
        { id: CONNECTION_DIRECTION1, type: ENUM, options: CONNECTION_DIRECTIONS.map((direction) => direction.id) },
        { id: CONNECTION_POSITION1, type: NUMBER },
        { id: CONNECTED2, type: BOOLEAN },
        { id: CONNECTION_NAME2 },
        { id: CONNECTION_DIRECTION2, type: ENUM, options: CONNECTION_DIRECTIONS.map((direction) => direction.id) },
        { id: CONNECTION_POSITION2, type: NUMBER },
    ],
    TWO_WINDINGS_TRANSFORMER: [
        { id: EQUIPMENT_ID },
        { id: EQUIPMENT_NAME },
        { id: R, type: NUMBER },
        { id: X, type: NUMBER },
        { id: G, type: NUMBER },
        { id: B, type: NUMBER },
        { id: RATED_U1, type: NUMBER },
        { id: RATED_U2, type: NUMBER },
        { id: RATED_S, type: NUMBER },
        { id: CONNECTED1, type: BOOLEAN },
        { id: CONNECTION_NAME1 },
        { id: CONNECTION_DIRECTION1, type: ENUM, options: CONNECTION_DIRECTIONS.map((direction) => direction.id) },
        { id: CONNECTION_POSITION1, type: NUMBER },
        { id: CONNECTED2, type: BOOLEAN },
        { id: CONNECTION_NAME2 },
        { id: CONNECTION_DIRECTION2, type: ENUM, options: CONNECTION_DIRECTIONS.map((direction) => direction.id) },
        { id: CONNECTION_POSITION2, type: NUMBER },
    ],
    GENERATOR: [
        { id: EQUIPMENT_ID },
        { id: EQUIPMENT_NAME },
        { id: ENERGY_SOURCE, type: ENUM, options: ENERGY_SOURCES.map((energy) => energy.id) },
        { id: CONNECTED, type: BOOLEAN },
        { id: CONNECTION_NAME },
        { id: CONNECTION_DIRECTION, type: ENUM, options: CONNECTION_DIRECTIONS.map((direction) => direction.id) },
        { id: CONNECTION_POSITION, type: NUMBER },
        { id: MIN_P, type: NUMBER },
        { id: MAX_P, type: NUMBER },
        { id: RATED_S, type: NUMBER },
        { id: MIN_Q, type: NUMBER },
        { id: MAX_Q, type: NUMBER },
        ...REACTIVE_CAPABILITY_CURVE_FIELDS,
        { id: TARGET_P, type: NUMBER },
        { id: TARGET_Q, type: NUMBER },
        { id: VOLTAGE_REGULATION_ON, type: BOOLEAN },
        { id: TARGET_V, type: NUMBER },
        { id: REGULATING_TERMINAL_ID },
        { id: REGULATING_TERMINAL_TYPE, type: ENUM, options: REGULATING_TERMINAL_TYPES },
        { id: REGULATING_TERMINAL_VOLTAGE_LEVEL_ID },
        { id: Q_PERCENT, type: NUMBER },
        { id: PARTICIPATE, type: BOOLEAN },
        { id: DROOP, type: NUMBER },
        { id: TRANSIENT_REACTANCE, type: NUMBER },
        { id: STEP_UP_TRANSFORMER_REACTANCE, type: NUMBER },
        { id: PLANNED_ACTIVE_POWER_SET_POINT, type: NUMBER },
        { id: MARGINAL_COST, type: NUMBER },
        { id: PLANNED_OUTAGE_RATE, type: NUMBER },
        { id: FORCED_OUTAGE_RATE, type: NUMBER },
    ],
    LOAD: [
        { id: EQUIPMENT_ID },
        { id: EQUIPMENT_NAME },
        {
            id: LOAD_TYPE,
            type: ENUM,
            options: LOAD_TYPES_FOR_LOAD_TABULAR_CREATION_MODIFICATION.map((load) => load.id),
        },
        { id: CONNECTED, type: BOOLEAN },
        { id: CONNECTION_NAME },
        { id: CONNECTION_DIRECTION, type: ENUM, options: CONNECTION_DIRECTIONS.map((direction) => direction.id) },
        { id: CONNECTION_POSITION, type: NUMBER },
        { id: P0, type: NUMBER },
        { id: Q0, type: NUMBER },
    ],
    BATTERY: [
        { id: EQUIPMENT_ID },
        { id: EQUIPMENT_NAME },
        { id: CONNECTED, type: BOOLEAN },
        { id: CONNECTION_NAME },
        { id: CONNECTION_DIRECTION, type: ENUM, options: CONNECTION_DIRECTIONS.map((direction) => direction.id) },
        { id: CONNECTION_POSITION, type: NUMBER },
        { id: MIN_P, type: NUMBER },
        { id: MAX_P, type: NUMBER },
        { id: MIN_Q, type: NUMBER },
        { id: MAX_Q, type: NUMBER },
        ...REACTIVE_CAPABILITY_CURVE_FIELDS,
        { id: TARGET_P, type: NUMBER },
        { id: TARGET_Q, type: NUMBER },
        { id: PARTICIPATE, type: BOOLEAN },
        { id: DROOP, type: NUMBER },
    ],
    SHUNT_COMPENSATOR: [
        { id: EQUIPMENT_ID },
        { id: EQUIPMENT_NAME },
        { id: CONNECTED, type: BOOLEAN },
        { id: CONNECTION_NAME },
        { id: CONNECTION_DIRECTION, type: ENUM, options: CONNECTION_DIRECTIONS.map((direction) => direction.id) },
        { id: CONNECTION_POSITION, type: NUMBER },
        { id: MAXIMUM_SECTION_COUNT, type: NUMBER },
        { id: SECTION_COUNT, type: NUMBER },
        { id: SHUNT_COMPENSATOR_TYPE, type: ENUM, options: Object.keys(SHUNT_COMPENSATOR_TYPES) },
        { id: MAX_Q_AT_NOMINAL_V, type: NUMBER },
        { id: MAX_SUSCEPTANCE, type: NUMBER },
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

export const getEquipmentTypeFromModificationType = (type: string) => {
    return Object.keys(TABULAR_MODIFICATION_TYPES).find((key) => TABULAR_MODIFICATION_TYPES[key] === type);
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
        if (field.id !== REACTIVE_CAPABILITY_CURVE) {
            delete formattedModification[field.id];
        }
    });
    Object.keys(formattedModification).forEach((key) => {
        if (key !== REACTIVE_CAPABILITY_CURVE_POINTS && !key.startsWith(PROPERTY_CSV_COLUMN_PREFIX)) {
            formattedModification[key] = convertOutputValues(key, formattedModification[key]);
        }
    });
    return formattedModification;
};
