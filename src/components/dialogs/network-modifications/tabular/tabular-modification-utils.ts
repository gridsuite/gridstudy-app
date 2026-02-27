/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    convertInputValue,
    convertOutputValue,
    FieldConstants,
    FieldType,
    MODIFICATION_TYPES,
    toModificationOperation,
} from '@gridsuite/commons-ui';
import {
    B,
    B1,
    B2,
    CONNECTED,
    CONNECTED1,
    CONNECTED2,
    CONNECTION_DIRECTION,
    CONNECTION_DIRECTION1,
    CONNECTION_DIRECTION2,
    CONNECTION_NAME,
    CONNECTION_NAME1,
    CONNECTION_NAME2,
    CONNECTION_POSITION,
    CONNECTION_POSITION1,
    CONNECTION_POSITION2,
    DROOP,
    ENERGY_SOURCE,
    EQUIPMENT_ID,
    FORCED_OUTAGE_RATE,
    G,
    G1,
    G2,
    HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
    HIGH_VOLTAGE_LIMIT,
    IP_MAX,
    IP_MIN,
    IS_ACTIVE,
    LIMIT_GROUP_NAME,
    LIMIT_SETS_MODIFICATION_TYPE,
    LOAD_TAP_CHANGING_CAPABILITIES,
    LOAD_TYPE,
    LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
    LOW_VOLTAGE_LIMIT,
    MARGINAL_COST,
    MAX_P,
    MAX_Q,
    MAX_Q_AT_NOMINAL_V,
    MAX_SUSCEPTANCE,
    MAXIMUM_SECTION_COUNT,
    MIN_P,
    MIN_Q,
    MODIFICATION_TYPE,
    NOMINAL_V,
    P0,
    PARTICIPATE,
    PERMANENT_LIMIT,
    PLANNED_ACTIVE_POWER_SET_POINT,
    PLANNED_OUTAGE_RATE,
    Q0,
    Q_PERCENT,
    R,
    RATED_S,
    RATED_U1,
    RATED_U2,
    RATIO_TAP_CHANGER,
    RATIO_TAP_CHANGER_LOAD_TAP_CHANGING_CAPABILITIES,
    RATIO_TAP_CHANGER_REGULATION_SIDE,
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
    REGULATION_SIDE,
    SECTION_COUNT,
    SHUNT_COMPENSATOR_TYPE,
    SIDE,
    STEP_UP_TRANSFORMER_REACTANCE,
    TABULAR_PROPERTIES,
    TARGET_P,
    TARGET_Q,
    TARGET_V,
    TEMPORARY_LIMIT_DURATION,
    TEMPORARY_LIMIT_MODIFICATION_TYPE,
    TEMPORARY_LIMIT_NAME,
    TEMPORARY_LIMIT_VALUE,
    TEMPORARY_LIMITS_MODIFICATION_TYPE,
    TRANSIENT_REACTANCE,
    VOLTAGE_REGULATION_ON,
    X,
} from 'components/utils/field-constants';
import { ReactiveCapabilityCurvePoints } from 'components/dialogs/reactive-limits/reactive-limits.type';
import {
    APPLICABILITY,
    BOOLEAN,
    CONNECTION_DIRECTIONS,
    ENERGY_SOURCES,
    ENUM,
    LOAD_TYPES_FOR_LOAD_TABULAR_CREATION_MODIFICATION,
    NUMBER,
    REGULATING_TERMINAL_TYPES,
    SHUNT_COMPENSATOR_TYPES,
    SIDE as SIDE_CONSTANTS,
} from '../../../network/constants';
import {
    convertReactiveCapabilityCurvePointsFromBackToFront,
    convertReactiveCapabilityCurvePointsFromFrontToBack,
    Modification,
    TabularField,
    TabularFields,
    transformProperties,
} from './tabular-common';

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

const CONNECTION_FIELDS: TabularField[] = [
    { id: CONNECTED, type: BOOLEAN },
    { id: CONNECTION_NAME },
    { id: CONNECTION_DIRECTION, type: ENUM, options: CONNECTION_DIRECTIONS.map((direction) => direction.id) },
    { id: CONNECTION_POSITION, type: NUMBER },
];

const TWO_SIDES_CONNECTION_FIELDS: TabularField[] = [
    { id: CONNECTED1, type: BOOLEAN },
    { id: CONNECTION_NAME1 },
    { id: CONNECTION_DIRECTION1, type: ENUM, options: CONNECTION_DIRECTIONS.map((direction) => direction.id) },
    { id: CONNECTION_POSITION1, type: NUMBER },
    { id: CONNECTED2, type: BOOLEAN },
    { id: CONNECTION_NAME2 },
    { id: CONNECTION_DIRECTION2, type: ENUM, options: CONNECTION_DIRECTIONS.map((direction) => direction.id) },
    { id: CONNECTION_POSITION2, type: NUMBER },
];

export const LIMIT_SETS_TABULAR_MODIFICATION_EQUIPMENTS: { [key: string]: string } = {
    LINE: MODIFICATION_TYPES.LINE_MODIFICATION.type,
    TWO_WINDINGS_TRANSFORMER: MODIFICATION_TYPES.TWO_WINDINGS_TRANSFORMER_MODIFICATION.type,
};

export const LIMIT_SETS_TABULAR_MODIFICATION_FIXED_FIELDS: TabularField[] = [
    { id: EQUIPMENT_ID, required: true },
    {
        id: SIDE,
        required: true,
        type: ENUM,
        options: Object.values(APPLICABILITY).map((applicability) => applicability.id),
    },
    { id: LIMIT_GROUP_NAME, required: true },
    { id: IS_ACTIVE, required: false, type: BOOLEAN },
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
    SUBSTATION: [{ id: EQUIPMENT_ID }, { id: FieldConstants.EQUIPMENT_NAME }, { id: FieldConstants.COUNTRY }],
    VOLTAGE_LEVEL: [
        { id: EQUIPMENT_ID },
        { id: FieldConstants.EQUIPMENT_NAME },
        { id: NOMINAL_V, type: NUMBER },
        { id: LOW_VOLTAGE_LIMIT, type: NUMBER },
        { id: HIGH_VOLTAGE_LIMIT, type: NUMBER },
        { id: IP_MIN, type: NUMBER },
        { id: IP_MAX, type: NUMBER },
    ],
    LINE: [
        { id: EQUIPMENT_ID },
        { id: FieldConstants.EQUIPMENT_NAME },
        { id: R, type: NUMBER },
        { id: X, type: NUMBER },
        { id: G1, type: NUMBER },
        { id: G2, type: NUMBER },
        { id: B1, type: NUMBER },
        { id: B2, type: NUMBER },
        ...TWO_SIDES_CONNECTION_FIELDS,
    ],
    TWO_WINDINGS_TRANSFORMER: [
        { id: EQUIPMENT_ID },
        { id: FieldConstants.EQUIPMENT_NAME },
        { id: R, type: NUMBER },
        { id: X, type: NUMBER },
        { id: G, type: NUMBER },
        { id: B, type: NUMBER },
        { id: RATED_U1, type: NUMBER },
        { id: RATED_U2, type: NUMBER },
        { id: RATED_S, type: NUMBER },
        ...TWO_SIDES_CONNECTION_FIELDS,
        { id: RATIO_TAP_CHANGER_LOAD_TAP_CHANGING_CAPABILITIES, type: BOOLEAN },
        {
            id: RATIO_TAP_CHANGER_REGULATION_SIDE,
            type: ENUM,
            options: Object.values(SIDE_CONSTANTS).map((side) => side.id),
        },
    ],
    GENERATOR: [
        { id: EQUIPMENT_ID },
        { id: FieldConstants.EQUIPMENT_NAME },
        { id: ENERGY_SOURCE, type: ENUM, options: ENERGY_SOURCES.map((energy) => energy.id) },
        ...CONNECTION_FIELDS,
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
        { id: FieldConstants.EQUIPMENT_NAME },
        {
            id: LOAD_TYPE,
            type: ENUM,
            options: LOAD_TYPES_FOR_LOAD_TABULAR_CREATION_MODIFICATION.map((load) => load.id),
        },
        ...CONNECTION_FIELDS,
        { id: P0, type: NUMBER },
        { id: Q0, type: NUMBER },
    ],
    BATTERY: [
        { id: EQUIPMENT_ID },
        { id: FieldConstants.EQUIPMENT_NAME },
        ...CONNECTION_FIELDS,
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
        { id: FieldConstants.EQUIPMENT_NAME },
        ...CONNECTION_FIELDS,
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
        if (key !== REACTIVE_CAPABILITY_CURVE_POINTS) {
            formattedModification[key] = convertOutputValues(key, formattedModification[key]);
        }
    });
    return formattedModification;
};

export const TWT_TAP_CHANGER_FIELDS = [
    RATIO_TAP_CHANGER_LOAD_TAP_CHANGING_CAPABILITIES,
    RATIO_TAP_CHANGER_REGULATION_SIDE,
];

export const convertTWTTapChangerModificationFromFrontToBack = (modification: Modification) => {
    if (!modification) {
        return {};
    }
    let formattedModification = { ...modification };

    // Check if we have tap changer fields and restructure if needed
    if (TWT_TAP_CHANGER_FIELDS.some((field) => field in formattedModification)) {
        formattedModification[RATIO_TAP_CHANGER] = {
            [LOAD_TAP_CHANGING_CAPABILITIES]: formattedModification[RATIO_TAP_CHANGER_LOAD_TAP_CHANGING_CAPABILITIES],
            [REGULATION_SIDE]: formattedModification[RATIO_TAP_CHANGER_REGULATION_SIDE],
        };

        // Remove the flat tap changer fields
        TWT_TAP_CHANGER_FIELDS.forEach((field) => {
            delete formattedModification[field];
        });
    }
    // Convert all fields to output format
    Object.keys(formattedModification).forEach((key) => {
        if (key === RATIO_TAP_CHANGER) {
            // Convert nested tap changer fields
            Object.keys(formattedModification[RATIO_TAP_CHANGER]).forEach((ratioKey) => {
                formattedModification[RATIO_TAP_CHANGER][ratioKey] = convertOutputValues(
                    ratioKey,
                    formattedModification[RATIO_TAP_CHANGER][ratioKey]
                );
            });
        } else {
            // Convert regular fields
            formattedModification[key] = convertOutputValues(key, formattedModification[key]);
        }
    });
    return formattedModification;
};

/**
 * Type definition for modification transformation strategies
 */
export type ModificationTransformationStrategy = {
    [key: string]: (row: Record<string, any>, modificationType: string) => Record<string, any>;
};

/**
 * Transformation strategies from front-end to back-end for different modification types
 */
export const MODIFICATION_TRANSFORMATION_STRATEGIES: ModificationTransformationStrategy = {
    [TABULAR_MODIFICATION_TYPES.GENERATOR]: (row) => convertGeneratorOrBatteryModificationFromFrontToBack(row),

    [TABULAR_MODIFICATION_TYPES.BATTERY]: (row) => convertGeneratorOrBatteryModificationFromFrontToBack(row),

    [TABULAR_MODIFICATION_TYPES.TWO_WINDINGS_TRANSFORMER]: (row) =>
        convertTWTTapChangerModificationFromFrontToBack(row),

    // Default strategy for other modification types
    default: (row, modificationType) => {
        const transformedRow: Record<string, any> = {};

        Object.keys(row).forEach((key) => {
            transformedRow[key] = convertOutputValues(getFieldType(modificationType, key), row[key]);
        });

        return transformedRow;
    },
};

/**
 * Transforms a single row of form data into a modification object for the back-end
 * @param row - The form data row to transform
 * @param modificationType - The type of modification being performed
 * @returns The transformed modification object
 */
export const transformRowToBackEndModification = (
    row: Record<string, any>,
    modificationType: string
): Record<string, any> => {
    // first transform and clean "property_*" fields
    const propertiesModifications = transformProperties(row);

    // then transform all fields according to the type
    const transformationStrategy =
        MODIFICATION_TRANSFORMATION_STRATEGIES[modificationType] ?? MODIFICATION_TRANSFORMATION_STRATEGIES.default;
    const transformedData = transformationStrategy(row, modificationType);

    if (propertiesModifications.length > 0) {
        transformedData[TABULAR_PROPERTIES] = propertiesModifications;
    }

    return {
        type: modificationType,
        ...transformedData,
    };
};

/**
 * Transforms form data modifications table into an array of back-end modification objects
 * @param modificationsTable - Array of form data rows
 * @param modificationType - The type of modification being performed
 * @returns Array of transformed modification objects
 */
export const transformModificationsTable = (
    modificationType: string,
    modificationsTable: Record<string, any>[] = []
): Record<string, any>[] => {
    if (!modificationsTable?.length) {
        return [];
    }

    return modificationsTable.map((row) => transformRowToBackEndModification(row, modificationType));
};
