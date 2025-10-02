/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import ShortCircuitAnalysisResultTable from './shortcircuit-analysis-result-table';
import { useSelector } from 'react-redux';
import {
    SCAFaultResult,
    SCAFeederResult,
    SCAPagedResults,
    ShortCircuitAnalysisType,
} from './shortcircuit-analysis-result.type';
import { AppState } from 'redux/reducer';
import { RunningStatus } from 'components/utils/running-status';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { fetchShortCircuitAnalysisPagedResults } from '../../../services/study/short-circuit-analysis';
import {
    convertFilterValues,
    FROM_COLUMN_TO_FIELD,
    FROM_COLUMN_TO_FIELD_ONE_BUS,
    mappingTabs,
    PAGE_OPTIONS,
} from './shortcircuit-analysis-result-content';
import CustomTablePagination from '../../utils/custom-table-pagination';
import { useSnackMessage, ComputingType } from '@gridsuite/commons-ui';
import { useIntl } from 'react-intl';
import { Box, LinearProgress } from '@mui/material';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import { GridReadyEvent, RowDataUpdatedEvent } from 'ag-grid-community';
import { SHORTCIRCUIT_ANALYSIS_RESULT_SORT_STORE } from 'utils/store-sort-filter-fields';
import { fetchAvailableFilterEnumValues } from '../../../services/study';
import { useFilterSelector } from '../../../hooks/use-filter-selector';
import { FilterType, PaginationType, ShortcircuitAnalysisTab } from '../../../types/custom-aggrid-types';
import { mapFieldsToColumnsFilter } from '../../../utils/aggrid-headers-utils';
import { FilterEnumsType } from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { usePaginationSelector } from 'hooks/use-pagination-selector';
import type { GlobalFilters } from '../../../services/study/analysis.types';

interface IShortCircuitAnalysisGlobalResultProps {
    analysisType: ShortCircuitAnalysisType;
    analysisStatus: RunningStatus;
    result: SCAFaultResult[];
    updateResult: (result: SCAFaultResult[] | SCAFeederResult[] | null) => void;
    customTablePaginationProps: any;
    onGridColumnsChanged: (params: GridReadyEvent) => void;
    onRowDataUpdated: (event: RowDataUpdatedEvent) => void;
    globalFilters?: GlobalFilters;
    openVoltageLevelDiagram: (id: string) => void;
}

export const ShortCircuitAnalysisResult: FunctionComponent<IShortCircuitAnalysisGlobalResultProps> = ({
    analysisType,
    analysisStatus,
    result,
    updateResult,
    customTablePaginationProps,
    onGridColumnsChanged,
    onRowDataUpdated,
    globalFilters,
    openVoltageLevelDiagram,
}) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();

    const [count, setCount] = useState<number>(0);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [filterEnums, setFilterEnums] = useState<FilterEnumsType>({});

    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);

    const isOneBusShortCircuitAnalysisType = analysisType === ShortCircuitAnalysisType.ONE_BUS;

    const fromFrontColumnToBackKeys = isOneBusShortCircuitAnalysisType
        ? FROM_COLUMN_TO_FIELD_ONE_BUS
        : FROM_COLUMN_TO_FIELD;

    const sortConfig = useSelector(
        (state: AppState) => state.tableSort[SHORTCIRCUIT_ANALYSIS_RESULT_SORT_STORE][mappingTabs(analysisType)]
    );

    const { filters } = useFilterSelector(FilterType.ShortcircuitAnalysis, mappingTabs(analysisType));
    const { pagination, dispatchPagination } = usePaginationSelector(
        PaginationType.ShortcircuitAnalysis,
        mappingTabs(analysisType) as ShortcircuitAnalysisTab
    );
    const { page, rowsPerPage } = pagination;

    const handleChangePage = useCallback(
        (_: any, newPage: number) => {
            dispatchPagination({ ...pagination, page: newPage });
        },
        [pagination, dispatchPagination]
    );

    const handleChangeRowsPerPage = useCallback(
        (event: any) => {
            const newRowsPerPage = parseInt(event.target.value, 10);
            dispatchPagination({ page: 0, rowsPerPage: newRowsPerPage });
        },
        [dispatchPagination]
    );

    const memoizedSetPageCallback = useCallback(() => {
        dispatchPagination({ ...pagination, page: 0 });
    }, [pagination, dispatchPagination]);

    // Effects
    useEffect(() => {
        if (analysisStatus !== RunningStatus.SUCCEED) {
            return;
        }
        if (!currentRootNetworkUuid) {
            return;
        }
        let active = true; // to manage race condition
        setIsFetching(true);
        updateResult(null);

        const backSortConfig = sortConfig?.map((sort) => ({
            ...sort,
            colId: fromFrontColumnToBackKeys[sort.colId],
        }));

        const updatedFilters = filters ? convertFilterValues(filters) : null;

        const selector = {
            page,
            size: rowsPerPage as number,
            filter: updatedFilters ? mapFieldsToColumnsFilter(updatedFilters, fromFrontColumnToBackKeys) : null,
            sort: backSortConfig,
        };

        fetchShortCircuitAnalysisPagedResults({
            studyUuid,
            currentNodeUuid: currentNode?.id,
            currentRootNetworkUuid,
            type: analysisType,
            selector,
            globalFilters,
        })
            .then((result: SCAPagedResults | null) => {
                if (active) {
                    const { content = [], totalElements = 0 } = result || {};
                    updateResult(content);
                    setCount(totalElements);
                }
            })
            .catch((error) =>
                snackError({
                    messageTxt: error.message,
                    headerId: 'ShortCircuitAnalysisResultsError',
                })
            )
            .finally(() => {
                if (active) {
                    setIsFetching(false);
                }
            });

        return () => {
            active = false;
        };
    }, [
        page,
        rowsPerPage,
        snackError,
        analysisType,
        analysisStatus,
        updateResult,
        studyUuid,
        currentNode?.id,
        currentRootNetworkUuid,
        intl,
        filters,
        sortConfig,
        fromFrontColumnToBackKeys,
        globalFilters,
    ]);

    useEffect(() => {
        if (analysisStatus !== RunningStatus.SUCCEED || !studyUuid || !currentNode?.id || !currentRootNetworkUuid) {
            return;
        }

        const allBusesFilterTypes = ['fault-types', 'limit-violation-types'];
        const oneBusFilterTypes = ['branch-sides'];
        const currentComputingType = isOneBusShortCircuitAnalysisType
            ? ComputingType.SHORT_CIRCUIT_ONE_BUS
            : ComputingType.SHORT_CIRCUIT;

        const filterTypes = isOneBusShortCircuitAnalysisType ? oneBusFilterTypes : allBusesFilterTypes;

        const promises = filterTypes.map((filter) =>
            fetchAvailableFilterEnumValues(
                studyUuid,
                currentNode.id,
                currentRootNetworkUuid,
                currentComputingType,
                filter
            )
        );

        Promise.all(promises)
            .then((results) => {
                if (isOneBusShortCircuitAnalysisType) {
                    const [branchSidesResult] = results;
                    setFilterEnums({
                        side: branchSidesResult,
                    });
                } else {
                    const [faultTypesResult, limitViolationTypesResult] = results;
                    setFilterEnums({
                        limitType: limitViolationTypesResult,
                        faultType: faultTypesResult,
                    });
                }
            })
            .catch((err) =>
                snackError({
                    messageTxt: err.message,
                    headerId: 'ShortCircuitAnalysisResultsError',
                })
            );
    }, [
        analysisStatus,
        intl,
        snackError,
        isOneBusShortCircuitAnalysisType,
        studyUuid,
        currentNode?.id,
        currentRootNetworkUuid,
    ]);

    const openLoader = useOpenLoaderShortWait({
        isLoading: analysisStatus === RunningStatus.RUNNING || isFetching,
        delay: RESULTS_LOADING_DELAY,
    });

    return (
        <>
            <Box sx={{ height: '4px' }}>{openLoader && <LinearProgress />}</Box>
            <ShortCircuitAnalysisResultTable
                result={result}
                analysisType={analysisType}
                isFetching={isFetching}
                filterEnums={filterEnums}
                onFilter={memoizedSetPageCallback}
                onGridColumnsChanged={onGridColumnsChanged}
                onRowDataUpdated={onRowDataUpdated}
                filters={filters}
                openVoltageLevelDiagram={openVoltageLevelDiagram}
            />
            <CustomTablePagination
                rowsPerPageOptions={PAGE_OPTIONS}
                count={count}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                {...customTablePaginationProps}
            />
        </>
    );
};
