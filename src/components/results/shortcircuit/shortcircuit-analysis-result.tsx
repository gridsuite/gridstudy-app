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
import { ReduxState } from 'redux/reducer.type';
import { RunningStatus } from 'components/utils/running-status';
import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useState,
} from 'react';
import {
    fetchShortCircuitAnalysisPagedResults,
    fetchShortCircuitFaultTypes,
    fetchShortCircuitLimitViolationTypes,
} from '../../../services/study/short-circuit-analysis';
import {
    PAGE_OPTIONS,
    DEFAULT_PAGE_COUNT,
    FROM_COLUMN_TO_FIELD,
    FROM_COLUMN_TO_FIELD_ONE_BUS,
    mappingTabs,
} from './shortcircuit-analysis-result-content';
import CustomTablePagination from '../../utils/custom-table-pagination';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useIntl } from 'react-intl';
import { Box, LinearProgress } from '@mui/material';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import { SORT_WAYS, useAgGridSort } from '../../../hooks/use-aggrid-sort';
import {
    FilterEnumsType,
    useAggridRowFilter,
} from '../../../hooks/use-aggrid-row-filter';
import { GridReadyEvent } from 'ag-grid-community';
import { setShortcircuitAnalysisResultFilter } from 'redux/actions';
import { mapFieldsToColumnsFilter } from 'components/custom-aggrid/custom-aggrid-header-utils';
import { SHORTCIRCUIT_ANALYSIS_RESULT_STORE_FIELD } from 'utils/store-filter-fields';

interface IShortCircuitAnalysisGlobalResultProps {
    analysisType: ShortCircuitAnalysisType;
    analysisStatus: RunningStatus;
    result: SCAFaultResult[];
    updateResult: (result: SCAFaultResult[] | SCAFeederResult[] | null) => void;
    customTablePaginationProps: any;
    onGridColumnsChanged: (params: GridReadyEvent) => void;
    onRowDataUpdated: (params: GridReadyEvent) => void;
}

export const ShortCircuitAnalysisResult: FunctionComponent<
    IShortCircuitAnalysisGlobalResultProps
> = ({
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

    const [rowsPerPage, setRowsPerPage] = useState<number>(
        DEFAULT_PAGE_COUNT as number
    );
    const [count, setCount] = useState<number>(0);
    const [page, setPage] = useState<number>(0);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [filterEnums, setFilterEnums] = useState<FilterEnumsType>({});

    const studyUuid = useSelector((state: ReduxState) => state.studyUuid);
    const currentNode = useSelector(
        (state: ReduxState) => state.currentTreeNode
    );

    const isOneBusShortCircuitAnalysisType =
        analysisType === ShortCircuitAnalysisType.ONE_BUS;

    const fromFrontColumnToBackKeys = isOneBusShortCircuitAnalysisType
        ? FROM_COLUMN_TO_FIELD_ONE_BUS
        : FROM_COLUMN_TO_FIELD;

    const defaultSortKey = isOneBusShortCircuitAnalysisType
        ? 'current'
        : 'elementId';
    const defaultSortWay = isOneBusShortCircuitAnalysisType
        ? SORT_WAYS.desc
        : SORT_WAYS.asc;
    const { onSortChanged, sortConfig } = useAgGridSort({
        colKey: defaultSortKey,
        sortWay: defaultSortWay,
    });

    const { updateFilter, filterSelector } = useAggridRowFilter(
        {
            filterType: SHORTCIRCUIT_ANALYSIS_RESULT_STORE_FIELD,
            filterTab: mappingTabs(analysisType),
            filterStoreAction: setShortcircuitAnalysisResultFilter,
        },
        () => {
            setPage(0);
        }
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

        const { colKey, sortWay } = sortConfig || {};

        const selector = {
            page,
            size: rowsPerPage,
            filter: filterSelector
                ? mapFieldsToColumnsFilter(
                      filterSelector,
                      fromFrontColumnToBackKeys
                  )
                : null,
            sort: {
                colKey: fromFrontColumnToBackKeys[colKey],
                sortWay,
            },
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
        fetchShortCircuitFaultTypes()
            .then((values) => {
                setFilterEnums((prevFilterEnums) => ({
                    ...prevFilterEnums,
                    faultType: values,
                }));
            })
            .catch((error) =>
                snackError({
                    messageTxt: error.message,
                    headerId: 'ShortCircuitAnalysisResultsError',
                })
            );
    }, [intl, snackError]);

    useEffect(() => {
        fetchShortCircuitLimitViolationTypes()
            .then((values) => {
                setFilterEnums((prevFilterEnums) => ({
                    ...prevFilterEnums,
                    limitType: values,
                }));
            })
            .catch((error) =>
                snackError({
                    messageTxt: error.message,
                    headerId: 'ShortCircuitAnalysisResultsError',
                })
            );
    }, [intl, snackError]);

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
