/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { EventPropertyDefinition, PrimitiveTypes } from '../types/event.type';
import { Schema } from 'yup';
import yup from '../../../../utils/yup-config';

export const getSchema = (eventPropertyDefinition: EventPropertyDefinition) => {
    let schema: Schema;

    // set type
    switch (eventPropertyDefinition.type) {
        case PrimitiveTypes.FLOAT:
            schema = yup.number();
            break;
        case PrimitiveTypes.INTEGER:
            schema = yup.number().integer();
            break;
        case PrimitiveTypes.ENUM:
        case PrimitiveTypes.STRING:
            schema = yup.string();
            break;
        case PrimitiveTypes.BOOL:
            schema = yup.boolean();
            break;
        default:
            schema = yup.number();
    }

    // set required
    if (eventPropertyDefinition.isRequired) {
        schema = schema.required();
    } else {
        schema = schema.nullable();
    }

    return schema;
};
