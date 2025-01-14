/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Option } from '@gridsuite/commons-ui';
import {
    ASSIGNMENTS,
    EDITED_FIELD,
    EQUIPMENT_TYPE_FIELD,
    FILTERS,
    PROPERTY_NAME_FIELD,
    VALUE_FIELD,
} from '../../../../../utils/field-constants';
import { Filter } from '../../commons/by-filter.type';

// --- types for the configuration, see the constants file --- //

export enum DataType {
    ENUM = 'ENUM',
    BOOLEAN = 'BOOLEAN',
    INTEGER = 'INTEGER',
    DOUBLE = 'DOUBLE',
    PROPERTY = 'PROPERTY',
}

export type FieldOptionType = {
    id: string;
    label: string;
    unit?: string;
    dataType: DataType;
    values?: Option[];
    outputConverter?: (value: number) => number | undefined;
    inputConverter?: (value: number) => number | undefined;
};

// --- types for the form model --- //

export type Assignment = {
    [FILTERS]: Filter[];
    [EDITED_FIELD]: string;
    [VALUE_FIELD]: string | number | boolean;
    [PROPERTY_NAME_FIELD]?: string;
};

export type ModificationByAssignment = {
    [EQUIPMENT_TYPE_FIELD]: string;
    [ASSIGNMENTS]: Assignment[];
};

export type FieldValue = string | number | boolean;
