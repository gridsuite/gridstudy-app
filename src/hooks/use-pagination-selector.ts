/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useDispatch, useSelector } from 'react-redux';
import { AppState, DEFAULT_PAGINATION } from '../redux/reducer';
import {
    PaginationConfig,
    PaginationTab,
    PaginationType,
    SecurityAnalysisTab,
    SensitivityAnalysisTab,
    ShortcircuitAnalysisTab,
} from '../types/custom-aggrid-types';
import {
    resetSecurityAnalysisPagination,
    resetSensitivityAnalysisPagination,
    resetShortcircuitAnalysisPagination,
    setSecurityAnalysisResultPagination,
    setSensitivityAnalysisResultPagination,
    setShortcircuitAnalysisResultPagination,
} from '../redux/actions';
import {
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
            default:
                return DEFAULT_PAGINATION;
        }
    };
}

function createPaginationDispatcher(paginationType: PaginationType, paginationTab: PaginationTab) {
    switch (paginationType) {
        case PaginationType.SecurityAnalysis:
            return (pagination: PaginationConfig) =>
                setSecurityAnalysisResultPagination(paginationTab as SecurityAnalysisTab, pagination);
        case PaginationType.SensitivityAnalysis:
            return (pagination: PaginationConfig) =>
                setSensitivityAnalysisResultPagination(paginationTab as SensitivityAnalysisTab, pagination);
        case PaginationType.ShortcircuitAnalysis:
            return (pagination: PaginationConfig) =>
                setShortcircuitAnalysisResultPagination(paginationTab as ShortcircuitAnalysisTab, pagination);
        default:
            throw new Error(`Unknown pagination type: ${paginationType}`);
    }
}

export const usePaginationSelector = (paginationType: PaginationType, paginationTab: PaginationTab) => {
    const selector = createPaginationSelector(paginationType, paginationTab);
    const pagination = useSelector(selector);

    const dispatch = useDispatch();
    const actionCreator = createPaginationDispatcher(paginationType, paginationTab);

    const dispatchPagination = useCallback(
        (newPagination: PaginationConfig) => {
            dispatch(actionCreator(newPagination));
        },
        [dispatch, actionCreator]
    );

    return { pagination, dispatchPagination };
};

const PAGINATION_RESET_DISPATCHERS = {
    [PaginationType.SecurityAnalysis]: resetSecurityAnalysisPagination,
    [PaginationType.SensitivityAnalysis]: resetSensitivityAnalysisPagination,
    [PaginationType.ShortcircuitAnalysis]: resetShortcircuitAnalysisPagination,
} as const;

export const usePaginationReset = (paginationType: PaginationType) => {
    const dispatch = useDispatch();

    const resetPagination = useCallback(() => {
        const resetAction = PAGINATION_RESET_DISPATCHERS[paginationType]();
        dispatch(resetAction);
    }, [dispatch, paginationType]);

    return resetPagination;
};
