/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLogsResultPagination } from 'redux/actions';
import type { AppState } from 'redux/reducer.type';
import { DEFAULT_LOGS_PAGE_COUNT } from 'redux/reducer';
import { LogsPaginationConfig } from 'types/custom-aggrid-types';
import { ComputingAndNetworkModificationType } from 'utils/report/report.type';
import { LOGS_PAGINATION_STORE_FIELD } from 'utils/store-sort-filter-fields';

export const useLogsPagination = (reportType: ComputingAndNetworkModificationType) => {
    const dispatch = useDispatch();

    const pagination = useSelector((state: AppState) => state[LOGS_PAGINATION_STORE_FIELD][reportType]);

    const setPagination = useCallback(
        (paginationConfig: LogsPaginationConfig) => {
            dispatch(setLogsResultPagination(reportType, paginationConfig));
        },
        [dispatch, reportType]
    );

    return {
        pagination,
        setPagination,
    };
};

export const useLogsPaginationResetByType = () => {
    const dispatch = useDispatch();
    const allLogsPagination = useSelector((state: AppState) => state[LOGS_PAGINATION_STORE_FIELD]);

    return useCallback(
        (computingType: ComputingAndNetworkModificationType) => {
            const currentPagination = allLogsPagination[computingType];
            dispatch(
                setLogsResultPagination(computingType, {
                    page: 0,
                    rowsPerPage: currentPagination?.rowsPerPage || DEFAULT_LOGS_PAGE_COUNT,
                })
            );
        },
        [dispatch, allLogsPagination]
    );
};
