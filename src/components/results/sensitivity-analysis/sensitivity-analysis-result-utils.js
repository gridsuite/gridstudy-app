/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    SENSITIVITY_AT_NODE_N,
    SENSITIVITY_AT_NODE_N_K,
    SENSITIVITY_IN_DELTA_A_N,
    SENSITIVITY_IN_DELTA_A_N_K,
    SENSITIVITY_IN_DELTA_MW_N,
    SENSITIVITY_IN_DELTA_MW_N_K,
} from 'utils/store-sort-filter-fields';

export const SensitivityResultTabs = [
    { id: 'N', label: 'N' },
    { id: 'N_K', label: 'N-K' },
];

export const SENSITIVITY_IN_DELTA_MW = 'SensitivityInDeltaMW';
export const SENSITIVITY_IN_DELTA_A = 'SensitivityInDeltaA';
export const SENSITIVITY_AT_NODE = 'SensitivityAtNode';
export const COMPUTATION_RESULTS_LOGS = 'ComputationResultsLogs';

export const FUNCTION_TYPES = {
    [SENSITIVITY_IN_DELTA_MW]: 'BRANCH_ACTIVE_POWER_1',
    [SENSITIVITY_IN_DELTA_A]: 'BRANCH_CURRENT_1',
    [SENSITIVITY_AT_NODE]: 'BUS_VOLTAGE',
};
export const SUFFIX_TYPES = {
    [SENSITIVITY_IN_DELTA_MW]: 'kW',
    [SENSITIVITY_IN_DELTA_A]: 'kA',
    [SENSITIVITY_AT_NODE]: 'kV',
};

export const PAGE_OPTIONS = [10, 25, 100, { label: 'All', value: -1 }];
export const DEFAULT_PAGE_COUNT = PAGE_OPTIONS[1];
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
export const mappingTabs = (sensiResultKind, nOrNkIndex) => {
    switch (sensiResultKind) {
        case SENSITIVITY_IN_DELTA_MW:
            return nOrNkIndex === 0 ? SENSITIVITY_IN_DELTA_MW_N : SENSITIVITY_IN_DELTA_MW_N_K;
        case SENSITIVITY_IN_DELTA_A:
            return nOrNkIndex === 0 ? SENSITIVITY_IN_DELTA_A_N : SENSITIVITY_IN_DELTA_A_N_K;
        case SENSITIVITY_AT_NODE:
            return nOrNkIndex === 0 ? SENSITIVITY_AT_NODE_N : SENSITIVITY_AT_NODE_N_K;
        default:
            return '';
    }
};
