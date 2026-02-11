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
import {
    SensiKind,
    SensiTab,
    SENSITIVITY_AT_NODE,
    SENSITIVITY_IN_DELTA_A,
    SENSITIVITY_IN_DELTA_MW,
} from './sensitivity-analysis-result.type';
import { SensitivityAnalysisTab } from '../../../types/custom-aggrid-types';

export const SensitivityResultTabs = [
    { id: 'N', label: 'N' },
    { id: 'N_K', label: 'N-K' },
];

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

export const PAGE_OPTIONS = [25, 100, 500, 1000];
export const DEFAULT_PAGE_COUNT = PAGE_OPTIONS[0];
export const DATA_KEY_TO_FILTER_KEY_N = {
    funcId: 'functionId',
    varId: 'variableId',
    value: 'rawSensitivityResult.value', // value column in table rawSensitivityResult in db
    functionReference: 'rawSensitivityResult.functionReference', // functionReference column in table rawSensitivityResult in db
};
export const DATA_KEY_TO_FILTER_KEY_NK = {
    funcId: 'functionId',
    varId: 'variableId',
    contingencyId: 'contingencyResult.contingencyId', // contingencyId column in table contingencyResult
    value: 'preContingencySensitivityResult.rawSensitivityResult.value', // value column in table rawSensitivityResult which has relation to table preContingencySensitivityResult in db
    functionReference: 'preContingencySensitivityResult.rawSensitivityResult.functionReference', // functionReference column in table rawSensitivityResult which has relation to table preContingencySensitivityResult in db
    valueAfter: 'rawSensitivityResult.value', // value column in table rawSensitivityResult in db
    functionReferenceAfter: 'rawSensitivityResult.functionReference', // functionReference column in table rawSensitivityResult in db
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
export const mappingTabs = (sensiResultKind: SensiKind, nOrNkIndex: number) : SensitivityAnalysisTab => {
    switch (sensiResultKind) {
        case SENSITIVITY_IN_DELTA_MW:
            return nOrNkIndex === 0 ? SENSITIVITY_IN_DELTA_MW_N : SENSITIVITY_IN_DELTA_MW_N_K;
        case SENSITIVITY_IN_DELTA_A:
            return nOrNkIndex === 0 ? SENSITIVITY_IN_DELTA_A_N : SENSITIVITY_IN_DELTA_A_N_K;
        case SENSITIVITY_AT_NODE:
            return nOrNkIndex === 0 ? SENSITIVITY_AT_NODE_N : SENSITIVITY_AT_NODE_N_K;
    }
};

// utility to type guard SensiKind from SensiTab
export const SENSI_KINDS = [SENSITIVITY_IN_DELTA_MW, SENSITIVITY_IN_DELTA_A, SENSITIVITY_AT_NODE] as const;

export function isSensiKind(sensiTab: SensiTab): sensiTab is SensiKind {
    return SENSI_KINDS.includes(sensiTab as SensiKind);
}
