/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useDispatch, useSelector } from 'react-redux';
import type { AppState } from '../redux/reducer.type';
import { DEFAULT_PAGINATION } from '../redux/reducer';
import {
    PaginationConfig,
    PaginationTab,
    PaginationType,
    PccminTab,
    SecurityAnalysisTab,
    SensitivityAnalysisTab,
    ShortcircuitAnalysisTab,
} from '../types/custom-aggrid-types';
import {
    resetPccminAnalysisPagination,
    resetSecurityAnalysisPagination,
    resetSensitivityAnalysisPagination,
    resetShortcircuitAnalysisPagination,
    setPccminAnalysisResultPagination,
    setSecurityAnalysisResultPagination,
    setSensitivityAnalysisResultPagination,
    setShortcircuitAnalysisResultPagination,
} from '../redux/actions';
import {
    PCCMIN_ANALYSIS_PAGINATION_STORE_FIELD,
    SECURITY_ANALYSIS_PAGINATION_STORE_FIELD,
    SENSITIVITY_ANALYSIS_PAGINATION_STORE_FIELD,
    SHORTCIRCUIT_ANALYSIS_PAGINATION_STORE_FIELD,
} from 'utils/store-sort-filter-fields';
import { useCallback } from 'react';

function createPaginationSelector(paginationType: PaginationType, paginationTab: PaginationTab) {
    return (state: AppState): PaginationConfig => {
        switch (paginationType) {
            case PaginationType.SecurityAnalysis: {
                const paginationState = state[SECURITY_ANALYSIS_PAGINATION_STORE_FIELD];
                return paginationState[paginationTab as SecurityAnalysisTab] || DEFAULT_PAGINATION;
            }
            case PaginationType.SensitivityAnalysis: {
                const paginationState = state[SENSITIVITY_ANALYSIS_PAGINATION_STORE_FIELD];
                return paginationState[paginationTab as SensitivityAnalysisTab] || DEFAULT_PAGINATION;
            }
            case PaginationType.ShortcircuitAnalysis: {
                const paginationState = state[SHORTCIRCUIT_ANALYSIS_PAGINATION_STORE_FIELD];
                return paginationState[paginationTab as ShortcircuitAnalysisTab] || DEFAULT_PAGINATION;
            }
            case PaginationType.PccMin: {
                const paginationState = state[PCCMIN_ANALYSIS_PAGINATION_STORE_FIELD];
                return paginationState[paginationTab as PccminTab] || DEFAULT_PAGINATION;
            }
            default:
                return DEFAULT_PAGINATION;
        }
    };
}

function createPaginationDispatcher(
    paginationType: PaginationType,
    paginationTab: PaginationTab,
    paginationConfig: PaginationConfig
) {
    switch (paginationType) {
        case PaginationType.SecurityAnalysis:
            return setSecurityAnalysisResultPagination(paginationTab as SecurityAnalysisTab, paginationConfig);
        case PaginationType.SensitivityAnalysis:
            return setSensitivityAnalysisResultPagination(paginationTab as SensitivityAnalysisTab, paginationConfig);
        case PaginationType.ShortcircuitAnalysis:
            return setShortcircuitAnalysisResultPagination(paginationTab as ShortcircuitAnalysisTab, paginationConfig);
        case PaginationType.PccMin:
            return setPccminAnalysisResultPagination(paginationTab as PccminTab, paginationConfig);
        default:
            throw new Error(`Unknown pagination type: ${paginationType}`);
    }
}

export const usePaginationSelector = (paginationType: PaginationType, paginationTab: PaginationTab) => {
    const selector = createPaginationSelector(paginationType, paginationTab);
    const pagination = useSelector(selector);

    const dispatch = useDispatch();

    const dispatchPagination = useCallback(
        (newPagination: PaginationConfig) => {
            dispatch(createPaginationDispatcher(paginationType, paginationTab, newPagination));
        },
        [dispatch, paginationType, paginationTab]
    );

    return { pagination, dispatchPagination };
};

const PAGINATION_RESET_DISPATCHERS = {
    [PaginationType.SecurityAnalysis]: resetSecurityAnalysisPagination,
    [PaginationType.SensitivityAnalysis]: resetSensitivityAnalysisPagination,
    [PaginationType.ShortcircuitAnalysis]: resetShortcircuitAnalysisPagination,
    [PaginationType.PccMin]: resetPccminAnalysisPagination,
} as const;

export const usePaginationReset = (paginationType: PaginationType) => {
    const dispatch = useDispatch();

    const resetPagination = useCallback(() => {
        const resetAction = PAGINATION_RESET_DISPATCHERS[paginationType]();
        dispatch(resetAction);
    }, [dispatch, paginationType]);

    return resetPagination;
};
