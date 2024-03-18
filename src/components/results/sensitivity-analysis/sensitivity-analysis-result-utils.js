/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    setSensitivityAtNodeResultFilter,
    setSensitivityInDeltaAResultFilter,
    setSensitivityInDeltaMWResultFilter,
} from 'redux/actions';

export const SENSITIVITY_IN_DELTA_MW = 'SensitivityInDeltaMW';
export const SENSITIVITY_IN_DELTA_A = 'SensitivityInDeltaA';
export const SENSITIVITY_AT_NODE = 'SensitivityAtNode';
export const COMPUTATION_RESULTS_LOGS = 'ComputationResultsLogs';
export const SENSITIVITY_ANALYSIS_RESULT_FILTER =
    'sensitivityAnalysisResultFilter';

export const N = 'N';
export const NK = 'NK';

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
export const mappingFilters = (sensiResultKind) => {
    switch (sensiResultKind) {
        case 0:
            return SENSITIVITY_IN_DELTA_MW;
        case 1:
            return SENSITIVITY_IN_DELTA_A;
        case 2:
            return SENSITIVITY_AT_NODE;
        default:
            return SENSITIVITY_IN_DELTA_MW;
    }
};
export const mappingTabs = (nOrNkIndex) => {
    return nOrNkIndex === 0 ? N : NK;
};

export const mappingActions = (sensiResultKind) => {
    switch (sensiResultKind) {
        case 0:
            return setSensitivityInDeltaMWResultFilter;
        case 1:
            return setSensitivityInDeltaAResultFilter;
        case 2:
            return setSensitivityAtNodeResultFilter;
        default:
            return setSensitivityInDeltaMWResultFilter;
    }
};
