/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer.type';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import {
    ComputingType,
    CustomTablePagination,
    MuiStyles,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { ManagedExportCsvButton } from '../common/csvDownloader';
import { downloadZipFile } from '../../../services/utils';
import { PARAM_COMPUTED_LANGUAGE } from '../../../utils/config-params';
import { exportPccMinResultsAsCsv } from 'services/study/pcc-min';
import { FROM_COLUMN_TO_FIELD_PCC_MIN, PagedPccMinResults, SinglePccMinResultInfos } from './pcc-min-result.type';
import { useIntl } from 'react-intl';
import { usePaginationSelector } from 'hooks/use-pagination-selector';
import RunningStatus from 'components/utils/running-status';
import { mapFieldsToColumnsFilter } from 'utils/aggrid-headers-utils';
import { Box } from '@mui/material';
import { PAGE_OPTIONS } from '../securityanalysis/security-analysis-result-utils';
import PccMinResultTable from './pcc-min-result-table';
import { PaginationType, TableType } from 'types/custom-aggrid-types';
import { PCCMIN_ANALYSIS_RESULT_SORT_STORE, PCCMIN_RESULT } from 'utils/store-sort-filter-fields';
import { fetchPccMinPagedResults } from 'services/study/pcc-min';
import { UUID } from 'node:crypto';
import { buildValidGlobalFilters } from '../common/global-filter/build-valid-global-filters';
import { useSelectedGlobalFilters } from '../common/global-filter/use-selected-global-filters';
import { useComputationColumnFilters } from '../common/column-filter/use-computation-column-filters';

interface PccMinResultProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
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
}) => {
    const pccMinStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.PCC_MIN]);
    const { snackError } = useSnackMessage();
    const intl = useIntl();

    const [result, setResult] = useState<SinglePccMinResultInfos[] | undefined>(undefined);

    const updateResult = useCallback((results: SinglePccMinResultInfos[] | null) => {
        setResult(results ?? undefined);
    }, []);

    const [count, setCount] = useState<number>(0);
    const [isFetching, setIsFetching] = useState<boolean>(false);

    const sortConfig = useSelector(
        (state: AppState) => state.tableSort[PCCMIN_ANALYSIS_RESULT_SORT_STORE][PCCMIN_RESULT]
    );

    const language = useSelector((state: AppState) => state[PARAM_COMPUTED_LANGUAGE]);

    const { filters } = useComputationColumnFilters(TableType.PccMin, PCCMIN_RESULT);
    const globalFiltersFromState = useSelectedGlobalFilters(TableType.PccMin);
    const { pagination, dispatchPagination } = usePaginationSelector(PaginationType.PccMin, PCCMIN_RESULT);
    const { page, rowsPerPage } = pagination;
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [isCsvButtonDisabled, setIsCsvButtonDisabled] = useState(true);

    const resetKey = `${studyUuid}-${nodeUuid}-${currentRootNetworkUuid}-${page}-${rowsPerPage}`;
    const exportCsv = useCallback(async () => {
        const filter = filters ? mapFieldsToColumnsFilter(filters, FROM_COLUMN_TO_FIELD_PCC_MIN) : null;
        const globalFilters = buildValidGlobalFilters(globalFiltersFromState);

        const response = await exportPccMinResultsAsCsv(
            studyUuid,
            nodeUuid,
            currentRootNetworkUuid,
            sortConfig,
            filter,
            globalFilters,
            csvHeaders,
            language
        );

        const blob = await response.blob();
        downloadZipFile(blob, 'pccmin_results.zip');
    }, [
        studyUuid,
        nodeUuid,
        currentRootNetworkUuid,
        sortConfig,
        filters,
        globalFiltersFromState,
        csvHeaders,
        language,
    ]);

    const handleError = useCallback(
        (error: unknown) => {
            snackWithFallback(snackError, error, { headerId: 'csvExportPccMinResultError' });
        },
        [snackError]
    );

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
        const globalFilters = buildValidGlobalFilters(globalFiltersFromState);
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
        globalFiltersFromState,
    ]);

    return (
        <Box sx={styles.gridContainer}>
            <Box sx={styles.csvExport}>
                <Box style={styles.grid}></Box>
                <ManagedExportCsvButton
                    exportCsv={exportCsv}
                    resetKey={resetKey}
                    disabled={isCsvButtonDisabled}
                    onError={handleError}
                />
            </Box>

            <PccMinResultTable
                result={result}
                isFetching={isFetching}
                setCsvHeaders={setCsvHeaders}
                setIsCsvButtonDisabled={setIsCsvButtonDisabled}
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
