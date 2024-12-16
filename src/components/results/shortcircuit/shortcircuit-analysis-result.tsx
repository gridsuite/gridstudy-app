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
    PAGE_OPTIONS,
    DEFAULT_PAGE_COUNT,
    FROM_COLUMN_TO_FIELD,
    FROM_COLUMN_TO_FIELD_ONE_BUS,
    mappingTabs,
    convertFilterValues,
} from './shortcircuit-analysis-result-content';
import CustomTablePagination from '../../utils/custom-table-pagination';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useIntl } from 'react-intl';
import { Box, LinearProgress } from '@mui/material';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import { useAgGridSort } from '../../../hooks/use-aggrid-sort';
import { FilterEnumsType } from '../../custom-aggrid/custom-aggrid-header.type';
import { useAggridRowFilter } from '../../../hooks/use-aggrid-row-filter';
import { GridReadyEvent } from 'ag-grid-community';
import { setShortcircuitAnalysisResultFilter } from 'redux/actions';
import { mapFieldsToColumnsFilter } from 'components/custom-aggrid/custom-aggrid-header-utils';
import {
    SHORTCIRCUIT_ANALYSIS_RESULT_SORT_STORE,
    SHORTCIRCUIT_ANALYSIS_RESULT_STORE_FIELD,
} from 'utils/store-sort-filter-fields';
import { fetchAvailableFilterEnumValues } from '../../../services/study';
import computingType from '../../computing-status/computing-type';

interface IShortCircuitAnalysisGlobalResultProps {
    analysisType: ShortCircuitAnalysisType;
    analysisStatus: RunningStatus;
    result: SCAFaultResult[];
    updateResult: (result: SCAFaultResult[] | SCAFeederResult[] | null) => void;
    customTablePaginationProps: any;
    onGridColumnsChanged: (params: GridReadyEvent) => void;
    onRowDataUpdated: (params: GridReadyEvent) => void;
}

export const ShortCircuitAnalysisResult: FunctionComponent<IShortCircuitAnalysisGlobalResultProps> = ({
    analysisType,
    analysisStatus,
    result,
    updateResult,
    customTablePaginationProps,
    onGridColumnsChanged,
    onRowDataUpdated,
}) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();

    const [rowsPerPage, setRowsPerPage] = useState<number>(DEFAULT_PAGE_COUNT as number);
    const [count, setCount] = useState<number>(0);
    const [page, setPage] = useState<number>(0);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [filterEnums, setFilterEnums] = useState<FilterEnumsType>({});

    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);

    const isOneBusShortCircuitAnalysisType = analysisType === ShortCircuitAnalysisType.ONE_BUS;

    const fromFrontColumnToBackKeys = isOneBusShortCircuitAnalysisType
        ? FROM_COLUMN_TO_FIELD_ONE_BUS
        : FROM_COLUMN_TO_FIELD;

    const { onSortChanged, sortConfig } = useAgGridSort(
        SHORTCIRCUIT_ANALYSIS_RESULT_SORT_STORE,
        mappingTabs(analysisType)
    );
    const memoizedSetPageCallback = useCallback(() => {
        setPage(0);
    }, []);

    const { updateFilter, filterSelector } = useAggridRowFilter(
        {
            filterType: SHORTCIRCUIT_ANALYSIS_RESULT_STORE_FIELD,
            filterTab: mappingTabs(analysisType),
            // @ts-expect-error TODO: found how to have Action type in props type
            filterStoreAction: setShortcircuitAnalysisResultFilter,
        },
        memoizedSetPageCallback
    );

    const handleChangePage = useCallback(
        (_: any, newPage: number) => {
            setPage(newPage);
        },
        [setPage]
    );

    const handleChangeRowsPerPage = useCallback(
        (event: any) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
        },
        [setPage]
    );

    // Effects
    useEffect(() => {
        if (analysisStatus !== RunningStatus.SUCCEED) {
            return;
        }

        let active = true; // to manage race condition
        setIsFetching(true);
        updateResult(null);

        const backSortConfig = sortConfig?.map((sort) => ({
            ...sort,
            colId: fromFrontColumnToBackKeys[sort.colId],
        }));

        const updatedFilters = filterSelector ? convertFilterValues(filterSelector) : null;

        const selector = {
            page,
            size: rowsPerPage,
            filter: updatedFilters ? mapFieldsToColumnsFilter(updatedFilters, fromFrontColumnToBackKeys) : null,
            sort: backSortConfig,
        };

        fetchShortCircuitAnalysisPagedResults({
            studyUuid,
            currentNodeUuid: currentNode?.id,
            type: analysisType,
            selector,
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
        intl,
        filterSelector,
        sortConfig,
        fromFrontColumnToBackKeys,
    ]);

    useEffect(() => {
        if (analysisStatus !== RunningStatus.SUCCEED || !studyUuid || !currentNode?.id) {
            return;
        }

        const allBusesFilterTypes = ['fault-types', 'limit-violation-types'];
        const oneBusFilterTypes = ['branch-sides'];
        const currentComputingType = isOneBusShortCircuitAnalysisType
            ? computingType.SHORT_CIRCUIT_ONE_BUS
            : computingType.SHORT_CIRCUIT;

        const filterTypes = isOneBusShortCircuitAnalysisType ? oneBusFilterTypes : allBusesFilterTypes;

        const promises = filterTypes.map((filter) =>
            fetchAvailableFilterEnumValues(studyUuid, currentNode.id, currentComputingType, filter)
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
    }, [analysisStatus, intl, snackError, isOneBusShortCircuitAnalysisType, studyUuid, currentNode?.id]);

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
                sortProps={{
                    onSortChanged,
                    sortConfig,
                }}
                filterProps={{
                    updateFilter,
                    filterSelector,
                }}
                filterEnums={filterEnums}
                onGridColumnsChanged={onGridColumnsChanged}
                onRowDataUpdated={onRowDataUpdated}
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
