/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export enum FILTER_DATA_TYPES {
    TEXT = 'text',
    NUMBER = 'number',
}

export enum FILTER_TEXT_COMPARATORS {
    EQUALS = 'equals',
    CONTAINS = 'contains',
    STARTS_WITH = 'startsWith',
}
export enum FILTER_NUMBER_COMPARATORS {
    NOT_EQUAL = 'notEqual',
    LESS_THAN_OR_EQUAL = 'lessThanOrEqual',
    GREATER_THAN_OR_EQUAL = 'greaterThanOrEqual',
}
