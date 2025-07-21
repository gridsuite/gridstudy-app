/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    EquipmentType,
    equipmentTypesForPredefinedPropertiesMapper,
    LANG_FRENCH,
    MODIFICATION_TYPES,
    PredefinedProperties,
} from '@gridsuite/commons-ui';
import {
    BUS_OR_BUSBAR_SECTION_ID,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    DROOP,
    ENERGY_SOURCE,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    FORCED_OUTAGE_RATE,
    LOAD_TYPE,
    MARGINAL_COST,
    MAX_P,
    MAX_Q,
    MAX_Q_AT_NOMINAL_V,
    MAX_SUSCEPTANCE,
    MAXIMUM_SECTION_COUNT,
    MIN_P,
    MIN_Q,
    P0,
    PARTICIPATE,
    PLANNED_ACTIVE_POWER_SET_POINT,
    PLANNED_OUTAGE_RATE,
    Q0,
    Q_PERCENT,
    RATED_S,
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
    VOLTAGE_LEVEL_ID,
    VOLTAGE_REGULATION_ON,
} from 'components/utils/field-constants';
import { IntlShape } from 'react-intl';
import { ReactiveCapabilityCurvePoints } from '../../reactive-limits/reactive-limits.type';
import {
    BOOLEAN,
    CONNECTION_DIRECTIONS,
    ENERGY_SOURCES,
    ENUM,
    LOAD_TYPES,
    NUMBER,
    REGULATING_TERMINAL_TYPES,
    SHUNT_COMPENSATOR_TYPES,
} from '../../../network/constants';
import { Property } from '../tabular-modification/properties/property-utils';

export interface TabularCreationField {
    id: string;
    required?: boolean;
    requiredIf?: { id: string };
    type?: string;
    options?: string[];
}

export interface TabularCreationFields {
    [key: string]: TabularCreationField[];
}

const REACTIVE_CAPABILITY_CURVE_FIELDS: TabularCreationField[] = [
    { id: REACTIVE_CAPABILITY_CURVE, required: true, type: BOOLEAN },
    { id: REACTIVE_CAPABILITY_CURVE_P_MIN, required: false, type: NUMBER },
    { id: REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MIN, required: false, type: NUMBER },
    { id: REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MIN, required: false, type: NUMBER },
    { id: REACTIVE_CAPABILITY_CURVE_P_0, required: false, type: NUMBER },
    { id: REACTIVE_CAPABILITY_CURVE_Q_MIN_P_0, required: false, type: NUMBER },
    { id: REACTIVE_CAPABILITY_CURVE_Q_MAX_P_0, required: false, type: NUMBER },
    { id: REACTIVE_CAPABILITY_CURVE_P_MAX, required: false, type: NUMBER },
    { id: REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MAX, required: false, type: NUMBER },
    { id: REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MAX, required: false, type: NUMBER },
];

export const TABULAR_CREATION_FIELDS: TabularCreationFields = {
    GENERATOR: [
        { id: EQUIPMENT_ID, required: true },
        { id: EQUIPMENT_NAME, required: false },
        { id: ENERGY_SOURCE, required: true, type: ENUM, options: ENERGY_SOURCES.map((energy) => energy.id) },
        { id: VOLTAGE_LEVEL_ID, required: true },
        { id: BUS_OR_BUSBAR_SECTION_ID, required: true },
        { id: CONNECTED, required: true, type: BOOLEAN },
        { id: CONNECTION_NAME, required: false },
        {
            id: CONNECTION_DIRECTION,
            required: false,
            type: ENUM,
            options: CONNECTION_DIRECTIONS.map((direction) => direction.id),
        },
        { id: CONNECTION_POSITION, required: false, type: NUMBER },
        { id: MIN_P, required: true, type: NUMBER },
        { id: MAX_P, required: true, type: NUMBER },
        { id: RATED_S, required: false, type: NUMBER },
        { id: MIN_Q, required: false, type: NUMBER },
        { id: MAX_Q, required: false, type: NUMBER },
        ...REACTIVE_CAPABILITY_CURVE_FIELDS,
        { id: TARGET_P, required: true, type: NUMBER },
        { id: TARGET_Q, required: true, type: NUMBER },
        { id: VOLTAGE_REGULATION_ON, required: true, type: BOOLEAN },
        { id: TARGET_V, required: false, type: NUMBER },
        { id: REGULATING_TERMINAL_ID, required: false },
        { id: REGULATING_TERMINAL_TYPE, required: false, type: ENUM, options: REGULATING_TERMINAL_TYPES },
        { id: REGULATING_TERMINAL_VOLTAGE_LEVEL_ID, required: false },
        { id: Q_PERCENT, required: false, type: NUMBER },
        { id: PARTICIPATE, required: true, type: BOOLEAN },
        { id: DROOP, required: false, type: NUMBER },
        { id: TRANSIENT_REACTANCE, required: false, type: NUMBER },
        { id: STEP_UP_TRANSFORMER_REACTANCE, required: false, type: NUMBER },
        { id: PLANNED_ACTIVE_POWER_SET_POINT, required: false, type: NUMBER },
        { id: MARGINAL_COST, required: false, type: NUMBER },
        { id: PLANNED_OUTAGE_RATE, required: false, type: NUMBER },
        { id: FORCED_OUTAGE_RATE, required: false, type: NUMBER },
    ],
    LOAD: [
        { id: EQUIPMENT_ID, required: true },
        { id: EQUIPMENT_NAME, required: false },
        { id: LOAD_TYPE, required: false, type: ENUM, options: LOAD_TYPES.map((load) => load.id) },
        { id: VOLTAGE_LEVEL_ID, required: true },
        { id: BUS_OR_BUSBAR_SECTION_ID, required: true },
        { id: CONNECTED, required: true, type: BOOLEAN },
        { id: CONNECTION_NAME, required: false },
        {
            id: CONNECTION_DIRECTION,
            required: false,
            type: ENUM,
            options: CONNECTION_DIRECTIONS.map((direction) => direction.id),
        },
        { id: CONNECTION_POSITION, required: false, type: NUMBER },
        { id: P0, required: true, type: NUMBER },
        { id: Q0, required: true, type: NUMBER },
    ],
    BATTERY: [
        { id: EQUIPMENT_ID, required: true },
        { id: EQUIPMENT_NAME, required: false },
        { id: VOLTAGE_LEVEL_ID, required: true },
        { id: BUS_OR_BUSBAR_SECTION_ID, required: true },
        { id: CONNECTED, required: true, type: BOOLEAN },
        { id: CONNECTION_NAME, required: false },
        {
            id: CONNECTION_DIRECTION,
            required: false,
            type: ENUM,
            options: CONNECTION_DIRECTIONS.map((direction) => direction.id),
        },
        { id: CONNECTION_POSITION, required: false, type: NUMBER },
        { id: MIN_P, required: true, type: NUMBER },
        { id: MAX_P, required: true, type: NUMBER },
        { id: MIN_Q, required: false, type: NUMBER },
        { id: MAX_Q, required: false, type: NUMBER },
        ...REACTIVE_CAPABILITY_CURVE_FIELDS,
        { id: TARGET_P, required: true, type: NUMBER },
        { id: TARGET_Q, required: true, type: NUMBER },
        { id: PARTICIPATE, required: true, type: BOOLEAN },
        { id: DROOP, required: false, type: NUMBER },
    ],
    SHUNT_COMPENSATOR: [
        { id: EQUIPMENT_ID, required: true },
        { id: EQUIPMENT_NAME, required: false },
        { id: VOLTAGE_LEVEL_ID, required: true },
        { id: BUS_OR_BUSBAR_SECTION_ID, required: true },
        { id: CONNECTED, required: true, type: BOOLEAN },
        { id: CONNECTION_NAME, required: false },
        {
            id: CONNECTION_DIRECTION,
            required: false,
            type: ENUM,
            options: CONNECTION_DIRECTIONS.map((direction) => direction.id),
        },
        { id: CONNECTION_POSITION, required: false, type: NUMBER },
        { id: MAXIMUM_SECTION_COUNT, required: true, type: NUMBER },
        { id: SECTION_COUNT, required: true, type: NUMBER },
        {
            id: SHUNT_COMPENSATOR_TYPE,
            requiredIf: { id: MAX_Q_AT_NOMINAL_V },
            type: ENUM,
            options: Object.keys(SHUNT_COMPENSATOR_TYPES),
        },
        { id: MAX_Q_AT_NOMINAL_V, requiredIf: { id: SHUNT_COMPENSATOR_TYPE }, type: NUMBER },
        { id: MAX_SUSCEPTANCE, required: false, type: NUMBER },
    ],
};

export const TABULAR_CREATION_TYPES: { [key: string]: string } = {
    GENERATOR: MODIFICATION_TYPES.GENERATOR_CREATION.type,
    BATTERY: MODIFICATION_TYPES.BATTERY_CREATION.type,
    LOAD: MODIFICATION_TYPES.LOAD_CREATION.type,
    SHUNT_COMPENSATOR: MODIFICATION_TYPES.SHUNT_COMPENSATOR_CREATION.type,
};

export const convertReactiveCapabilityCurvePointsFromBackToFront = (value: ReactiveCapabilityCurvePoints[]) => {
    const curvePoint1 = value[0];
    const curvePoint2 = value[1];
    const curvePoint3 = value[2];

    if (!curvePoint1) {
        return [];
    }

    const result = [
        {
            key: REACTIVE_CAPABILITY_CURVE_P_MIN,
            value: curvePoint1.p,
        },
        {
            key: REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MIN,
            value: curvePoint1.maxQ,
        },
        {
            key: REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MIN,
            value: curvePoint1.minQ,
        },
    ];

    if (curvePoint2) {
        const isLastPoint = !curvePoint3;

        result.push(
            {
                key: isLastPoint ? REACTIVE_CAPABILITY_CURVE_P_MAX : REACTIVE_CAPABILITY_CURVE_P_0,
                value: curvePoint2.p,
            },
            {
                key: isLastPoint ? REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MAX : REACTIVE_CAPABILITY_CURVE_Q_MAX_P_0,
                value: curvePoint2.maxQ,
            },
            {
                key: isLastPoint ? REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MAX : REACTIVE_CAPABILITY_CURVE_Q_MIN_P_0,
                value: curvePoint2.minQ,
            }
        );
    }

    if (curvePoint3) {
        result.push(
            { key: REACTIVE_CAPABILITY_CURVE_P_MAX, value: curvePoint3.p },
            { key: REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MAX, value: curvePoint3.maxQ },
            { key: REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MAX, value: curvePoint3.minQ }
        );
    }

    return result;
};

export const convertReactiveCapabilityCurvePointsFromFrontToBack = (creation: Record<string, unknown>) => {
    if (creation[REACTIVE_CAPABILITY_CURVE]) {
        //Convert list data to matrix
        const rccPoints = [];
        if (creation[REACTIVE_CAPABILITY_CURVE_P_MIN] !== null) {
            rccPoints.push({
                p: creation[REACTIVE_CAPABILITY_CURVE_P_MIN],
                maxQ: creation[REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MIN],
                minQ: creation[REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MIN],
            });
        }
        if (creation[REACTIVE_CAPABILITY_CURVE_P_0] !== null) {
            rccPoints.push({
                p: creation[REACTIVE_CAPABILITY_CURVE_P_0],
                maxQ: creation[REACTIVE_CAPABILITY_CURVE_Q_MAX_P_0],
                minQ: creation[REACTIVE_CAPABILITY_CURVE_Q_MIN_P_0],
            });
        }
        if (creation[REACTIVE_CAPABILITY_CURVE_P_MAX] !== null) {
            rccPoints.push({
                p: creation[REACTIVE_CAPABILITY_CURVE_P_MAX],
                maxQ: creation[REACTIVE_CAPABILITY_CURVE_Q_MAX_P_MAX],
                minQ: creation[REACTIVE_CAPABILITY_CURVE_Q_MIN_P_MAX],
            });
        }
        creation[REACTIVE_CAPABILITY_CURVE_POINTS] = rccPoints;
    }
};

export const convertCreationFieldFromBackToFront = (
    key: string,
    value:
        | {
              value: string | number | boolean;
          }
        | unknown
) => {
    if (key === REACTIVE_CAPABILITY_CURVE_POINTS) {
        return convertReactiveCapabilityCurvePointsFromBackToFront(value as ReactiveCapabilityCurvePoints[]);
    } else {
        return { key: key, value: value };
    }
};

export const convertCreationFieldFromFrontToBack = (key: string, value: string | number | boolean) => {
    if (key === CONNECTION_DIRECTION) {
        return { key: key, value: value ?? 'UNDEFINED' };
    } else {
        return { key: key, value: value };
    }
};

export const getEquipmentTypeFromCreationType = (type: string) => {
    return Object.keys(TABULAR_CREATION_TYPES).find((key) => TABULAR_CREATION_TYPES[key] === type);
};

export const styles = {
    grid: { height: 500, width: '100%' },
};

export type PredefinedEquipmentProperties = {
    [p: string]: PredefinedProperties;
};

interface CommentLinesConfig {
    csvTranslatedColumns?: string[];
    intl: IntlShape;
    equipmentType: string;
    language: string;
    formType: 'Creation' | 'Modification';
    currentProperties?: Property[];
    predefinedEquipmentProperties?: PredefinedEquipmentProperties;
}

export const generateCommentLines = ({
    csvTranslatedColumns,
    intl,
    equipmentType,
    language,
    formType,
    currentProperties,
    predefinedEquipmentProperties,
}: CommentLinesConfig): string[][] => {
    let commentData: string[][] = [];
    if (csvTranslatedColumns) {
        const separator = language === LANG_FRENCH ? ';' : ',';
        // First comment line contains header translation
        commentData.push(['#' + csvTranslatedColumns.join(separator)]);

        // Check for optional second comment line from the translation file
        let secondCommentLine: string = '';
        const commentKey = `Tabular${formType}SkeletonComment.${equipmentType}`;
        if (!!intl.messages[commentKey]) {
            secondCommentLine = intl.formatMessage({ id: commentKey });
        }
        const activeProperties = currentProperties?.filter((p) => p.selected).map((p) => p.name);
        if (activeProperties) {
            const networkEquipmentType = equipmentTypesForPredefinedPropertiesMapper(equipmentType as EquipmentType);
            if (networkEquipmentType && predefinedEquipmentProperties?.[networkEquipmentType]) {
                if (secondCommentLine.length === 0) {
                    // create an empty row without property columns
                    const nbSepatator = csvTranslatedColumns.length - 1 - activeProperties.length;
                    secondCommentLine = separator.repeat(nbSepatator);
                }
                activeProperties.forEach((propertyName) => {
                    const possibleValues =
                        predefinedEquipmentProperties[networkEquipmentType]?.[propertyName]?.sort((a, b) =>
                            a.localeCompare(b)
                        ) ?? [];
                    secondCommentLine = secondCommentLine + separator;
                    if (possibleValues.length > 1) {
                        secondCommentLine = secondCommentLine + possibleValues.join(' | ');
                    }
                });
            }
        }
        if (secondCommentLine.length > 0) {
            commentData.push([secondCommentLine]);
        }
    }
    return commentData;
};

export const transformIfFrenchNumber = (value: string, language: string): string => {
    value = value.trim();
    // Only transform if we're in French mode and the value is a number that has a comma
    if (language === LANG_FRENCH && value.includes(',') && !isNaN(Number(value.replace(',', '.')))) {
        return value.replace(',', '.');
    }
    return value;
};

export const isFieldTypeOk = (value: any, fieldDefinition: { type?: string; options?: any[] } | undefined): boolean => {
    if (!fieldDefinition?.type || value === null || value === undefined) {
        return true;
    }

    switch (fieldDefinition.type) {
        case BOOLEAN:
            if (typeof value !== 'boolean') {
                return false;
            }
            break;

        case NUMBER: {
            const parsedNumber = parseFloat(value);
            if (isNaN(parsedNumber)) {
                return false;
            }
            break;
        }

        case ENUM:
            if (!fieldDefinition?.options?.includes(value)) {
                return false;
            }
            break;

        default:
            console.warn(`Unknown type "${fieldDefinition.type}" for value "${value}". Value will be returned as-is.`);
            break;
    }
    return true;
};

export const setFieldTypeError = (
    fieldTypeInError: string,
    expectedTypeForFieldInError: string,
    tableName: string,
    setError: (tableName: string, error: { type: string; message?: string }) => void,
    intl: IntlShape,
    expectedValues?: string[]
) => {
    if (expectedTypeForFieldInError === ENUM) {
        setError(tableName, {
            type: 'custom',
            message: intl.formatMessage(
                { id: 'WrongEnumValue' },
                {
                    field: intl.formatMessage({ id: fieldTypeInError }),
                    expectedValues: expectedValues?.join(', ') ?? '',
                }
            ),
        });
    } else {
        setError(tableName, {
            type: 'custom',
            message: intl.formatMessage(
                { id: 'WrongFieldType' },
                {
                    field: intl.formatMessage({ id: fieldTypeInError }),
                    type: intl.formatMessage({ id: `fieldType.${expectedTypeForFieldInError}` }),
                }
            ),
        });
    }
};
