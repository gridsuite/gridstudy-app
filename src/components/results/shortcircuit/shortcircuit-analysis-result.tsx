/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import ShortCircuitAnalysisResultTable from './shortcircuit-analysis-result-table';
import { useSelector } from 'react-redux';
import {
    Option,
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
} from './shortcircuit-analysis-result-content';
import CustomTablePagination from '../../utils/custom-table-pagination';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useIntl } from 'react-intl';
import { Box, LinearProgress } from '@mui/material';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import { getSortValue, useAgGridSort } from '../../../hooks/use-aggrid-sort';
import { useAggridRowFilter } from '../../../hooks/use-aggrid-row-filter';
import { FILTER_TEXT_COMPARATORS } from '../../custom-aggrid/custom-aggrid-header';

interface IShortCircuitAnalysisGlobalResultProps {
    analysisType: ShortCircuitAnalysisType;
    analysisStatus: RunningStatus;
    result: SCAFaultResult[];
    updateResult: (result: SCAFaultResult[] | SCAFeederResult[] | null) => void;
    shortCircuitNotif: boolean;
    customTablePaginationProps: any;
}

export const ShortCircuitAnalysisResult: FunctionComponent<
    IShortCircuitAnalysisGlobalResultProps
> = ({
    analysisType,
    analysisStatus,
    result,
    updateResult,
    shortCircuitNotif,
    customTablePaginationProps,
}) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();

    const [rowsPerPage, setRowsPerPage] = useState<number>(
        DEFAULT_PAGE_COUNT as number
    );
    const [count, setCount] = useState<number>(0);
    const [page, setPage] = useState<number>(0);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [faultTypeOptions, setFaultTypeOptions] = useState<Option[]>([]);
    const [limitViolationTypeOptions, setLimitViolationTypeOptions] = useState<
        Option[]
    >([]);

    const studyUuid = useSelector((state: ReduxState) => state.studyUuid);
    const currentNode = useSelector(
        (state: ReduxState) => state.currentTreeNode
    );

    const fromFrontColumnToBack = useCallback(
        (column: string) => {
            if (
                analysisType === ShortCircuitAnalysisType.ONE_BUS &&
                column === 'current'
            ) {
                return 'fortescueCurrent.positiveMagnitude';
            }
            return FROM_COLUMN_TO_FIELD[column];
        },
        [analysisType]
    );

    const { onSortChanged, sortConfig } = useAgGridSort();

    const { updateFilter, filterSelector } = useAggridRowFilter(
        FROM_COLUMN_TO_FIELD,
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
        if (!shortCircuitNotif || analysisStatus !== RunningStatus.SUCCEED) {
            return;
        }

        let active = true; // to manage race condition
        setIsFetching(true);
        updateResult(null);

        const { sortWay, colKey } = sortConfig;

        const selector = {
            page,
            size: rowsPerPage,
            filter:
                filterSelector &&
                Object.keys(filterSelector).map((field: string) => {
                    const selectedValue =
                        filterSelector[field as keyof typeof filterSelector];

                    const { text, type } = selectedValue?.[0];

                    const isTextFilter = !!text;

                    return {
                        dataType: 'text',
                        field,
                        type: isTextFilter
                            ? type
                            : FILTER_TEXT_COMPARATORS.EQUALS,
                        value: isTextFilter ? text : selectedValue,
                    };
                }),
            sort: {
                colKey: fromFrontColumnToBack(colKey),
                sortValue: getSortValue(sortWay),
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
        filterSelector,
        sortConfig,
        page,
        rowsPerPage,
        snackError,
        analysisType,
        analysisStatus,
        updateResult,
        studyUuid,
        currentNode?.id,
        intl,
        shortCircuitNotif,
        fromFrontColumnToBack,
    ]);

    useEffect(() => {
        fetchShortCircuitFaultTypes()
            .then((values) => {
                setFaultTypeOptions(values);
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
                setLimitViolationTypeOptions(values);
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
                faultTypeOptions={faultTypeOptions}
                limitViolationTypeOptions={limitViolationTypeOptions}
                sortProps={{
                    onSortChanged,
                    sortConfig,
                }}
                filterProps={{
                    updateFilter,
                    filterSelector,
                }}
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
