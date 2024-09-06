/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    DATA_TYPE,
    EDITED_FIELD,
    FILTERS,
    ID,
    NAME,
    PROPERTY_NAME_FIELD,
    VALUE_FIELD,
} from '../../../../utils/field-constants';
import yup from 'components/utils/yup-config';
import { Schema } from 'yup';
import { DataType, Filter, SimpleModification } from './simple-modification.type';
import { FIELD_OPTIONS } from './simple-modification-constants';

export const getDataType = (fieldName?: string | null) => {
    return Object.values(FIELD_OPTIONS).find((fieldOption) => fieldOption.id === fieldName)?.dataType;
};

export const getSimpleModificationInitialValue = () =>
    ({
        [FILTERS]: [] as Filter[],
        [DATA_TYPE]: null as any,
        [EDITED_FIELD]: null as any,
        [PROPERTY_NAME_FIELD]: null as any,
        [VALUE_FIELD]: null as any,
    } as SimpleModification);

export function getSimpleModificationsSchema() {
    return yup.array().of(
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
                .min(1, 'FieldIsRequired'),
            [EDITED_FIELD]: yup.string().required(),
            [PROPERTY_NAME_FIELD]: yup.string().when([EDITED_FIELD], ([editedField], schema) => {
                const dataType = getDataType(editedField);
                if (dataType === DataType.PROPERTY) {
                    return schema.required();
                }
                return schema.nullable();
            }),
            [VALUE_FIELD]: yup.mixed().when([EDITED_FIELD], ([editedField], schema) => {
                const dataType = getDataType(editedField);
                return getValueSchema(dataType);
            }),
        })
    );
}

function getValueSchema(dataType?: DataType) {
    let schema: Schema;
    // set type
    switch (dataType) {
        case DataType.DOUBLE:
            schema = yup.number();
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
        default:
            schema = yup.number();
    }

    // set required
    schema = schema.required();

    return schema;
}

export function getSimpleModificationFromEditData(simpleModification: SimpleModification): SimpleModification {
    return {
        ...simpleModification,
        [FILTERS]: simpleModification.filters.map((filter) => ({ ...filter })),
    };
}
