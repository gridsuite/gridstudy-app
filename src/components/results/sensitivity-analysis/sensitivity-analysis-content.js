/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const FUNCTION_TYPES = [
    'BRANCH_ACTIVE_POWER_1',
    'BRANCH_CURRENT_1',
    'BUS_VOLTAGE',
];
export const PAGE_OPTIONS = [10, 25, 100, { label: 'All', value: -1 }];
export const DEFAULT_PAGE_COUNT = 10;
export const DATA_KEY_TO_FILTER_KEY = {
    funcId: 'functionIds',
    varId: 'variableIds',
    contingencyId: 'contingencyIds',
};
export const DATA_KEY_TO_SORT_KEY = {
    funcId: 'FUNCTION',
    varId: 'VARIABLE',
    contingencyId: 'CONTINGENCY',
    functionReference: 'REFERENCE',
    value: 'SENSITIVITY',
    functionReferenceAfter: 'POST_REFERENCE',
    valueAfter: 'POST_SENSITIVITY',
};
