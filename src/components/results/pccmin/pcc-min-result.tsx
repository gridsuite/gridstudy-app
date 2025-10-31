/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { ComputingType, useSnackMessage } from '@gridsuite/commons-ui';
import { ColDef, GridReadyEvent, RowDataUpdatedEvent } from 'ag-grid-community';
import { GlobalFilters } from '../common/global-filter/global-filter-types';
import { FROM_COLUMN_TO_FIELD_PCC_MIN, PagedPccMinResults, SinglePccMinResultInfos } from './pcc-min-result.type';
import { useIntl } from 'react-intl';
import { useFilterSelector } from 'hooks/use-filter-selector';
import { usePaginationSelector } from 'hooks/use-pagination-selector';
import RunningStatus from 'components/utils/running-status';
import { mapFieldsToColumnsFilter } from 'utils/aggrid-headers-utils';
import { RESULTS_LOADING_DELAY } from 'components/network/constants';
import { useOpenLoaderShortWait } from 'components/dialogs/commons/handle-loader';
import { Box, LinearProgress } from '@mui/material';
import { PAGE_OPTIONS } from '../securityanalysis/security-analysis-result-utils';
import CustomTablePagination from 'components/utils/custom-table-pagination';
import PccMinResultTable from './pcc-min-result-table';
import { FilterType, PaginationType, PccminTab } from 'types/custom-aggrid-types';
import { PCCMIN_ANALYSIS_RESULT_SORT_STORE, PCCMIN_RESULT } from 'utils/store-sort-filter-fields';
import { fetchPccMinPagedResults } from 'services/study/pcc-min';
import { UUID } from 'crypto';

interface PccMinResultProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
    globalFilters?: GlobalFilters;
    customTablePaginationProps: any;
}

export const PccMinResult: FunctionComponent<PccMinResultProps> = ({
    studyUuid,
    nodeUuid,
    currentRootNetworkUuid,
    customTablePaginationProps,
    globalFilters,
}) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();

    const pccMinStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.PCC_MIN]);

    const [result, setResult] = useState<SinglePccMinResultInfos[]>([]);

    const updateResult = useCallback((results: SinglePccMinResultInfos[] | null) => {
        setResult(results ?? []);
    }, []);

    const [count, setCount] = useState<number>(0);
    const [isFetching, setIsFetching] = useState<boolean>(false);

    const sortConfig = useSelector(
        (state: AppState) => state.tableSort[PCCMIN_ANALYSIS_RESULT_SORT_STORE][PCCMIN_RESULT]
    );

    const { filters } = useFilterSelector(FilterType.PccMin, PCCMIN_RESULT);
    const { pagination, dispatchPagination } = usePaginationSelector(PaginationType.PccMin, PCCMIN_RESULT as PccminTab);
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

    useEffect(() => {
        if (pccMinStatus !== RunningStatus.SUCCEED) {
            return;
        }
        if (!currentRootNetworkUuid) {
            return;
        }
        let active = true;
        setIsFetching(true);
        updateResult(null);

        const updatedFilters = filters ? filters : null;

        const selector = {
            page,
            size: rowsPerPage as number,
            filter: updatedFilters ? mapFieldsToColumnsFilter(updatedFilters, FROM_COLUMN_TO_FIELD_PCC_MIN) : null,
            sort: sortConfig,
        };

        fetchPccMinPagedResults({
            studyUuid,
            currentNodeUuid: nodeUuid,
            currentRootNetworkUuid,
            selector,
            globalFilters,
        })
            .then((result: PagedPccMinResults | null) => {
                if (active) {
                    const { content = [], totalElements = 0 } = result || {};
                    updateResult(content);
                    setCount(totalElements);
                }
            })
            .catch((error) =>
                snackError({
                    messageTxt: error.message,
                    headerId: 'PccMinResultsError',
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
        pccMinStatus,
        updateResult,
        studyUuid,
        nodeUuid,
        currentRootNetworkUuid,
        intl,
        filters,
        sortConfig,
        globalFilters,
    ]);

    useEffect(() => {
        if (pccMinStatus !== RunningStatus.SUCCEED || !studyUuid || !nodeUuid || !currentRootNetworkUuid) {
            return;
        }
    }, [pccMinStatus, intl, snackError, studyUuid, nodeUuid, currentRootNetworkUuid]);
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <PccMinResultTable
                result={result}
                isFetching={isFetching}
                onFilter={memoizedSetPageCallback}
                filters={filters}
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
        </Box>
    );
};
