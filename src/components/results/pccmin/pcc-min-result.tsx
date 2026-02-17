/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { ComputingType, MuiStyles, snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import { FROM_COLUMN_TO_FIELD_PCC_MIN, PagedPccMinResults, SinglePccMinResultInfos } from './pcc-min-result.type';
import { useIntl } from 'react-intl';
import { usePaginationSelector } from 'hooks/use-pagination-selector';
import RunningStatus from 'components/utils/running-status';
import { mapFieldsToColumnsFilter } from 'utils/aggrid-headers-utils';
import { Box } from '@mui/material';
import { PAGE_OPTIONS } from '../securityanalysis/security-analysis-result-utils';
import CustomTablePagination from 'components/utils/custom-table-pagination';
import PccMinResultTable from './pcc-min-result-table';
import { FilterType, PaginationType } from 'types/custom-aggrid-types';
import { PCCMIN_ANALYSIS_RESULT_SORT_STORE, PCCMIN_RESULT } from 'utils/store-sort-filter-fields';
import { fetchPccMinPagedResults } from 'services/study/pcc-min';
import { UUID } from 'node:crypto';
import { PccMinExportButton } from './pcc-min-export-button';
import { buildValidGlobalFilters } from '../common/global-filter/build-valid-global-filters';
import { GlobalFilter } from '../common/global-filter/global-filter-types';
import { useComputationColumnFilters } from '../common/column-filter/use-computation-column-filters';

interface PccMinResultProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
    globalFilter: GlobalFilter[];
    customTablePaginationProps: any;
}

const styles = {
    gridContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    csvExport: {
        display: 'flex',
        alignItems: 'baseline',
        marginTop: '-45px',
    },
    grid: {
        flexGrow: '1',
    },
} as const satisfies MuiStyles;

export const PccMinResult: FunctionComponent<PccMinResultProps> = ({
    studyUuid,
    nodeUuid,
    currentRootNetworkUuid,
    customTablePaginationProps,
    globalFilter,
}) => {
    const pccMinStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.PCC_MIN]);
    const { snackError } = useSnackMessage();
    const intl = useIntl();

    const [result, setResult] = useState<SinglePccMinResultInfos[]>([]);

    const updateResult = useCallback((results: SinglePccMinResultInfos[] | null) => {
        setResult(results ?? []);
    }, []);

    const [count, setCount] = useState<number>(0);
    const [isFetching, setIsFetching] = useState<boolean>(false);

    const sortConfig = useSelector(
        (state: AppState) => state.tableSort[PCCMIN_ANALYSIS_RESULT_SORT_STORE][PCCMIN_RESULT]
    );

    const { filters } = useComputationColumnFilters(FilterType.PccMin, PCCMIN_RESULT);
    const { pagination, dispatchPagination } = usePaginationSelector(PaginationType.PccMin, PCCMIN_RESULT);
    const { page, rowsPerPage } = pagination;
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [isCsvButtonDisabled, setIsCsvButtonDisabled] = useState(true);

    const handleChangePage = useCallback(
        (_: any, newPage: number) => {
            dispatchPagination({ ...pagination, page: newPage });
        },
        [pagination, dispatchPagination]
    );

    const handleChangeRowsPerPage = useCallback(
        (event: any) => {
            const newRowsPerPage = Number.parseInt(event.target.value, 10);
            dispatchPagination({ page: 0, rowsPerPage: newRowsPerPage });
        },
        [dispatchPagination]
    );

    const goToFirstPage = useCallback(() => {
        dispatchPagination({ ...pagination, page: 0 });
    }, [pagination, dispatchPagination]);

    useEffect(() => {
        if (pccMinStatus !== RunningStatus.SUCCEED) {
            return;
        }
        if (!currentRootNetworkUuid) {
            return;
        }
        let isMounted = true; // prevents state updates if the component has unmounted
        setIsFetching(true);
        updateResult(null);

        const selector = {
            page,
            size: rowsPerPage as number,
            filter: filters ? mapFieldsToColumnsFilter(filters, FROM_COLUMN_TO_FIELD_PCC_MIN) : null,
            sort: sortConfig,
        };
        const globalFilters = buildValidGlobalFilters(globalFilter);
        fetchPccMinPagedResults({
            studyUuid,
            currentNodeUuid: nodeUuid,
            currentRootNetworkUuid,
            selector,
            globalFilters,
        })
            .then((result: PagedPccMinResults | null) => {
                if (isMounted) {
                    const { content = [], totalElements = 0 } = result || {};
                    updateResult(content);
                    setCount(totalElements);
                }
            })
            .catch((error) => snackWithFallback(snackError, error, { headerId: 'PccMinResultsError' }))
            .finally(() => {
                if (isMounted) {
                    setIsFetching(false);
                }
            });

        return () => {
            isMounted = false;
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
        globalFilter,
    ]);

    return (
        <Box sx={styles.gridContainer}>
            <Box sx={styles.csvExport}>
                <Box style={styles.grid}></Box>
                <PccMinExportButton
                    studyUuid={studyUuid}
                    nodeUuid={nodeUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    csvHeaders={csvHeaders}
                    disabled={isCsvButtonDisabled}
                />
            </Box>

            <PccMinResultTable
                result={result}
                isFetching={isFetching}
                setCsvHeaders={setCsvHeaders}
                setIsCsvButtonDisabled={setIsCsvButtonDisabled}
                goToFirstPage={goToFirstPage}
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
