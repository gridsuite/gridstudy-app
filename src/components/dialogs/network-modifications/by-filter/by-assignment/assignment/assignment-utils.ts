/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    EDITED_FIELD,
    FILTERS,
    ID,
    NAME,
    PROPERTY_NAME_FIELD,
    VALUE_FIELD,
} from '../../../../../utils/field-constants';
import yup from 'components/utils/yup-config';
import { Schema } from 'yup';
import { Assignment, DataType, FieldOptionType, FieldValue } from './assignment.type';
import { FIELD_OPTIONS } from './assignment-constants';

export const getDataType = (fieldName?: string | null) => {
    return getFieldOption(fieldName)?.dataType;
};
export const getUnsettable = (fieldName?: string | null) => {
    return getFieldOption(fieldName)?.settableToNone;
};

export const getFieldOption = (fieldName?: string | null): FieldOptionType | undefined => {
    return Object.values(FIELD_OPTIONS).find((fieldOption) => fieldOption.id === fieldName);
};

// ("undefined" is accepted here in RHF, but it conflicts with MUI behaviour which does not like undefined values)
export const getAssignmentInitialValue = () => ({
    [FILTERS]: [],
    [EDITED_FIELD]: null,
    [PROPERTY_NAME_FIELD]: null,
    [VALUE_FIELD]: null,
});

export function getAssignmentsSchema(emptyValueStr: string) {
    return yup
        .array()
        .of(
            yup.object().shape({
                [FILTERS]: yup
                    .array()
                    .of(
                        yup.object().shape({
                            [ID]: yup.string().required(),
                            [NAME]: yup.string().required(),
                        })
                    )
                    .required()
                    .min(1, 'YupRequired'),
                [EDITED_FIELD]: yup.string().required(),
                [PROPERTY_NAME_FIELD]: yup.string().when([EDITED_FIELD], ([editedField], schema) => {
                    const dataType = getDataType(editedField);
                    if (dataType === DataType.PROPERTY) {
                        return schema.required();
                    }
                    return schema.nullable();
                }),
                [VALUE_FIELD]: yup
                    .mixed<FieldValue>()
                    .when([EDITED_FIELD], ([editedField]) => {
                        const dataType = getDataType(editedField);
                        const unsettable = getUnsettable(editedField);
                        return getValueSchema(emptyValueStr, dataType, unsettable);
                    })
                    .required(),
            })
        )
        .required();
}

function getValueSchema(emptyValueStr: string, dataType?: DataType, settable_to_none?: boolean) {
    let schema: Schema;
    // set type
    switch (dataType) {
        case DataType.DOUBLE:
            schema = settable_to_none
                ? yup.string().test('is-number-or-none', 'NumericValueOrEmptyField', (value) => {
                      return value === emptyValueStr || !isNaN(Number(value));
                  })
                : yup.number();
            break;
        case DataType.INTEGER:
            schema = yup.number().integer();
            break;
        case DataType.ENUM:
        case DataType.PROPERTY:
            schema = yup.string();
            break;
        case DataType.BOOLEAN:
            schema = yup.boolean();
            break;
        case DataType.STRING:
            schema = yup.string();
            break;
        default:
            schema = yup.number();
    }

    return schema.required();
}

export function getAssignmentFromEditData(assignment: Assignment): Assignment {
    return {
        ...assignment,
        [FILTERS]: assignment.filters.map((filter) => ({ ...filter })),
    };
}
