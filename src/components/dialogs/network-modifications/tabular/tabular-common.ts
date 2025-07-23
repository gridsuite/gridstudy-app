/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ReactiveCapabilityCurvePoints } from 'components/dialogs/reactive-limits/reactive-limits.type';
import { Property } from '../common/properties/property-utils';
import { propertiesSchema, PROPERTY_CSV_COLUMN_PREFIX } from './properties/property-utils';
import {
    MODIFICATIONS_TABLE,
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
    TABULAR_PROPERTIES,
    TYPE,
} from 'components/utils/field-constants';
import { BOOLEAN, ENUM, NUMBER } from '../../../network/constants';
import { IntlShape } from 'react-intl';
import {
    EquipmentType,
    equipmentTypesForPredefinedPropertiesMapper,
    LANG_FRENCH,
    PredefinedProperties,
} from '@gridsuite/commons-ui';
import yup from 'components/utils/yup-config';

export const tabularFormSchema = yup
    .object()
    .shape({
        [TYPE]: yup.string().nullable().required(),
        [MODIFICATIONS_TABLE]: yup.array().min(1, 'ModificationsRequiredTabError').required(),
    })
    .concat(propertiesSchema)
    .required();

export const emptyTabularFormData = {
    [TYPE]: null,
    [MODIFICATIONS_TABLE]: [],
    [TABULAR_PROPERTIES]: [],
};

export const dialogStyles = {
    grid: { height: 500, width: '100%' },
};

export interface Modification {
    [key: string]: any;
}

export interface TabularField {
    id: string;
    type?: string;
    options?: string[];
    required?: boolean;
    requiredIf?: { id: string };
}

export interface TabularFields {
    [key: string]: TabularField[];
}

export const formatModification = (modification: Modification) => {
    //exclude type, date and uuid from the modification object
    const { type, date, uuid, ...rest } = modification;
    return rest;
};

export const addPropertiesFromBack = (modification: Modification, tabularProperties: Property[] | null) => {
    const updatedModification: Modification = { ...modification };
    tabularProperties?.forEach((property: Property) => {
        updatedModification[PROPERTY_CSV_COLUMN_PREFIX + property.name] = property.value;
    });
    return updatedModification;
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

export const convertReactiveCapabilityCurvePointsFromFrontToBack = (modification: Modification) => {
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

export const transformIfFrenchNumber = (value: string, language: string): string => {
    value = value.trim();
    // Only transform if we're in French mode and the value is a number that has a comma
    if (language === LANG_FRENCH && value.includes(',') && !isNaN(Number(value.replace(',', '.')))) {
        return value.replace(',', '.');
    }
    return value;
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
    currentProperties?: string[];
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
        if (currentProperties?.length) {
            const networkEquipmentType = equipmentTypesForPredefinedPropertiesMapper(equipmentType as EquipmentType);
            if (networkEquipmentType && predefinedEquipmentProperties?.[networkEquipmentType]) {
                if (secondCommentLine.length === 0) {
                    // create an empty row without property columns
                    const nbSepatator = csvTranslatedColumns.length - 1 - currentProperties.length;
                    secondCommentLine = separator.repeat(nbSepatator);
                }
                currentProperties.forEach((propertyName) => {
                    const possibleValues =
                        predefinedEquipmentProperties[networkEquipmentType]?.[propertyName]?.toSorted((a, b) =>
                            a.localeCompare(b)
                        ) ?? [];
                    secondCommentLine = secondCommentLine + separator;
                    if (possibleValues.length > 0) {
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
