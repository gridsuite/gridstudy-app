/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { PropsWithChildren, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../redux/reducer.type';
import { updateColumnFiltersAction } from '../../redux/actions';
import { getColumnFiltersFromState } from '../../redux/selectors/filter-selectors';
import { useLogsPagination } from './use-logs-pagination';
import { useReportFetcher } from '../../hooks/use-report-fetcher';
import { ReportFetcherContext, ReportFilterContext, FilterConfig, LogsPaginationConfig } from '@gridsuite/commons-ui';
import { TableType } from '../../types/custom-aggrid-types';
import { ComputingAndNetworkModificationType } from '../../utils/report/report.type';
import { COMPUTING_AND_NETWORK_MODIFICATION_TYPE } from '../../utils/report/report.constant';

type ReportViewerProviderProps = PropsWithChildren<{
    reportType: ComputingAndNetworkModificationType;
}>;

export function ReportViewerProvider({ reportType, children }: ReportViewerProviderProps) {
    const dispatch = useDispatch();

    const [, , , fetchLogs, fetchLogMatches] = useReportFetcher(
        reportType as keyof typeof COMPUTING_AND_NETWORK_MODIFICATION_TYPE
    );

    const filters = useSelector<AppState, FilterConfig[] | undefined>((state) =>
        getColumnFiltersFromState(state, TableType.Logs, reportType)
    );

    const onFiltersUpdate = useCallback(
        (newFilters: FilterConfig[]) => {
            // Map from generic commons-ui FilterConfig to the app's typed action
            dispatch(updateColumnFiltersAction(TableType.Logs, reportType, newFilters as any));
        },
        [dispatch, reportType]
    );

    const { pagination, setPagination } = useLogsPagination(reportType);

    const onPaginationChange = useCallback(
        (config: LogsPaginationConfig) => {
            setPagination(config);
        },
        [setPagination]
    );

    return (
        <ReportFetcherContext.Provider value={{ fetchLogs, fetchLogMatches }}>
            <ReportFilterContext.Provider value={{ filters, onFiltersUpdate, pagination, onPaginationChange }}>
                {children}
            </ReportFilterContext.Provider>
        </ReportFetcherContext.Provider>
    );
}
