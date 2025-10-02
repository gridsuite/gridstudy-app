/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import SensitivityAnalysisResult from './sensitivity-analysis-result';
import {
    DATA_KEY_TO_FILTER_KEY_N,
    DATA_KEY_TO_FILTER_KEY_NK,
    DATA_KEY_TO_SORT_KEY,
    FUNCTION_TYPES,
    mappingTabs,
    PAGE_OPTIONS,
    SensitivityResultTabs,
} from './sensitivity-analysis-result-utils';
import { ChangeEvent, MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSnackMessage, ComputingType } from '@gridsuite/commons-ui';
import CustomTablePagination from '../../utils/custom-table-pagination';
import {
    fetchSensitivityAnalysisFilterOptions,
    fetchSensitivityAnalysisResult,
} from '../../../services/study/sensitivity-analysis';
import { useSelector } from 'react-redux';
import { RunningStatus } from '../../utils/running-status';
import { SENSITIVITY_ANALYSIS_RESULT_SORT_STORE } from '../../../utils/store-sort-filter-fields';
import { useFilterSelector } from '../../../hooks/use-filter-selector';
import {
    FilterType as AgGridFilterType,
    PaginationType,
    SensitivityAnalysisTab,
    SortWay,
} from '../../../types/custom-aggrid-types';
import { UUID } from 'crypto';
import { SensiKind, SENSITIVITY_AT_NODE } from './sensitivity-analysis-result.type';
import { AppState } from '../../../redux/reducer';
import { SensitivityResult, SensitivityResultFilterOptions } from '../../../services/study/sensitivity-analysis.type';
import { type GlobalFilters } from '../common/types';
import { usePaginationSelector } from 'hooks/use-pagination-selector';

export type PagedSensitivityAnalysisResultProps = {
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
    nOrNkIndex: number;
    sensiKind: SensiKind;
    setCsvHeaders: (newHeaders: string[]) => void;
    setIsCsvButtonDisabled: (newIsCsv: boolean) => void;
    globalFilters?: GlobalFilters;
};

function PagedSensitivityAnalysisResult({
    nOrNkIndex,
    sensiKind,
    studyUuid,
    nodeUuid,
    currentRootNetworkUuid,
    setCsvHeaders,
    setIsCsvButtonDisabled,
    globalFilters,
}: Readonly<PagedSensitivityAnalysisResultProps>) {
    const intl = useIntl();

    const [count, setCount] = useState<number>(0);
    const [result, setResult] = useState<SensitivityResult | null>(null);
    const [options, setOptions] = useState<SensitivityResultFilterOptions | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const sensiStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.SENSITIVITY_ANALYSIS]);

    const sortConfig = useSelector(
        (state: AppState) => state.tableSort[SENSITIVITY_ANALYSIS_RESULT_SORT_STORE][mappingTabs(sensiKind, nOrNkIndex)]
    );

    const { filters } = useFilterSelector(AgGridFilterType.SensitivityAnalysis, mappingTabs(sensiKind, nOrNkIndex));
    const { pagination, dispatchPagination } = usePaginationSelector(
        PaginationType.SensitivityAnalysis,
        mappingTabs(sensiKind, nOrNkIndex) as SensitivityAnalysisTab
    );
    const { page, rowsPerPage } = pagination;

    const filtersDef = useMemo(() => {
        const baseFilters = [
            {
                field: 'funcId',
                label: intl.formatMessage({
                    id: sensiKind === SENSITIVITY_AT_NODE ? 'BusBarBus' : 'SupervisedBranches',
                }),
                options: options?.allFunctionIds || [],
            },
            {
                field: 'varId',
                label: intl.formatMessage({ id: 'VariablesToSimulate' }),
                options: options?.allVariableIds || [],
            },
        ];

        if (nOrNkIndex > 0) {
            baseFilters.push({
                field: 'contingencyId',
                label: intl.formatMessage({ id: 'ContingencyId' }),
                options: options?.allContingencyIds || [],
            });
        }

        return baseFilters;
    }, [intl, sensiKind, nOrNkIndex, options]);

    const { snackError } = useSnackMessage();

    const handleChangePage = useCallback(
        (_: MouseEvent<HTMLButtonElement> | null, newPage: number) => {
            dispatchPagination({ ...pagination, page: newPage });
        },
        [pagination, dispatchPagination]
    );

    const handleChangeRowsPerPage = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const newRowsPerPage = parseInt(event.target.value, 10);
            dispatchPagination({ page: 0, rowsPerPage: newRowsPerPage });
        },
        [dispatchPagination]
    );

    const onFilter = useCallback(() => {
        dispatchPagination({ ...pagination, page: 0 });
    }, [pagination, dispatchPagination]);

    const fetchFilterOptions = useCallback(() => {
        const selector = {
            tabSelection: SensitivityResultTabs[nOrNkIndex].id,
            functionType: FUNCTION_TYPES[sensiKind],
        };

        fetchSensitivityAnalysisFilterOptions(studyUuid, nodeUuid, currentRootNetworkUuid, selector)
            .then((res) => {
                setOptions(res);
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: intl.formatMessage({
                        id: 'SensitivityAnalysisResultsError',
                    }),
                });
            });
    }, [nOrNkIndex, sensiKind, studyUuid, nodeUuid, currentRootNetworkUuid, snackError, intl]);

    const fetchResult = useCallback(() => {
        const sortSelector = sortConfig?.length
            ? {
                  sortKeysWithWeightAndDirection: Object.fromEntries(
                      sortConfig.map((value) => [
                          DATA_KEY_TO_SORT_KEY[value.colId as keyof typeof DATA_KEY_TO_SORT_KEY],
                          value.sort === SortWay.DESC ? -1 : 1,
                      ])
                  ),
              }
            : {};

        const selector = {
            tabSelection: SensitivityResultTabs[nOrNkIndex].id,
            functionType: FUNCTION_TYPES[sensiKind],
            offset: typeof rowsPerPage === 'number' ? page * rowsPerPage : rowsPerPage.value,
            pageSize: typeof rowsPerPage === 'number' ? rowsPerPage : rowsPerPage.value,
            pageNumber: page,
            ...sortSelector,
        };
        const mappedFilters = filters?.map((elem) => {
            const keyMap = nOrNkIndex === 0 ? DATA_KEY_TO_FILTER_KEY_N : DATA_KEY_TO_FILTER_KEY_NK;
            const newColumn = keyMap[elem.column as keyof typeof keyMap];
            return { ...elem, column: newColumn };
        });
        setIsLoading(true);
        fetchSensitivityAnalysisResult(
            studyUuid,
            nodeUuid,
            currentRootNetworkUuid,
            selector,
            mappedFilters,
            globalFilters
        )
            .then((res) => {
                const { filteredSensitivitiesCount = 0 } = res || {};

                setResult(res);
                setCount(filteredSensitivitiesCount);
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: intl.formatMessage({
                        id: 'SensitivityAnalysisResultsError',
                    }),
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [
        sortConfig,
        nOrNkIndex,
        sensiKind,
        rowsPerPage,
        page,
        filters,
        globalFilters,
        studyUuid,
        nodeUuid,
        currentRootNetworkUuid,
        snackError,
        intl,
    ]);

    useEffect(() => {
        if (sensiStatus === RunningStatus.RUNNING) {
            setResult(null);
        }
        if (sensiStatus === RunningStatus.SUCCEED) {
            fetchFilterOptions();
            fetchResult();
        }
    }, [sensiStatus, fetchResult, fetchFilterOptions, globalFilters]);

    return (
        <>
            <SensitivityAnalysisResult
                result={result?.sensitivities || []}
                nOrNkIndex={nOrNkIndex}
                sensiKind={sensiKind}
                onFilter={onFilter}
                filtersDef={filtersDef}
                isLoading={isLoading}
                setCsvHeaders={setCsvHeaders}
                setIsCsvButtonDisabled={setIsCsvButtonDisabled}
            />
            <CustomTablePagination
                rowsPerPageOptions={PAGE_OPTIONS}
                count={count}
                rowsPerPage={typeof rowsPerPage === 'number' ? rowsPerPage : rowsPerPage.value}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </>
    );
}

export default PagedSensitivityAnalysisResult;
