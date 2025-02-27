/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import PropTypes from 'prop-types';
import SensitivityAnalysisResult from './sensitivity-analysis-result';
import {
    DATA_KEY_TO_FILTER_KEY,
    DATA_KEY_TO_SORT_KEY,
    DEFAULT_PAGE_COUNT,
    FUNCTION_TYPES,
    mappingTabs,
    PAGE_OPTIONS,
    SENSITIVITY_AT_NODE,
    SensitivityResultTabs,
} from './sensitivity-analysis-result-utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSnackMessage } from '@gridsuite/commons-ui';
import CustomTablePagination from '../../utils/custom-table-pagination';
import {
    fetchSensitivityAnalysisFilterOptions,
    fetchSensitivityAnalysisResult,
} from '../../../services/study/sensitivity-analysis';
import { useSelector } from 'react-redux';
import { ComputingType } from 'components/computing-status/computing-type';
import { RunningStatus } from '../../utils/running-status';
import { SENSITIVITY_ANALYSIS_RESULT_SORT_STORE } from '../../../utils/store-sort-filter-fields';
import { useFilterSelector } from '../../../hooks/use-filter-selector';
import { FilterType as AgGridFilterType, SortWay } from '../../../types/custom-aggrid-types';

const PagedSensitivityAnalysisResult = ({
    nOrNkIndex,
    sensiKind,
    studyUuid,
    nodeUuid,
    currentRootNetworkUuid,
    page,
    setPage,
    ...props
}) => {
    const intl = useIntl();

    const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_COUNT);
    const [count, setCount] = useState(0);
    const [result, setResult] = useState(null);
    const [options, setOptions] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const sensiStatus = useSelector((state) => state.computingStatus[ComputingType.SENSITIVITY_ANALYSIS]);

    const sortConfig = useSelector(
        (state) => state.tableSort[SENSITIVITY_ANALYSIS_RESULT_SORT_STORE][mappingTabs(sensiKind, nOrNkIndex)]
    );

    const { filters } = useFilterSelector(AgGridFilterType.SensitivityAnalysis, mappingTabs(sensiKind, nOrNkIndex));

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
        (_, newPage) => {
            setPage(newPage);
        },
        [setPage]
    );

    const handleChangeRowsPerPage = useCallback(
        (event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
        },
        [setPage]
    );

    const onFilter = useCallback(() => {
        setPage(0);
    }, [setPage]);

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
    }, [nOrNkIndex, sensiKind, studyUuid, currentRootNetworkUuid, nodeUuid, snackError, intl]);

    const fetchResult = useCallback(() => {
        const sortSelector = sortConfig?.length
            ? {
                  sortKeysWithWeightAndDirection: sortConfig.reduce(
                      (acc, value) => ({
                          ...acc,
                          [DATA_KEY_TO_SORT_KEY[value.colId]]: value.sort === SortWay.DESC ? -1 : 1,
                      }),
                      {}
                  ),
              }
            : {};

        const selector = {
            tabSelection: SensitivityResultTabs[nOrNkIndex].id,
            functionType: FUNCTION_TYPES[sensiKind],
            offset: page * rowsPerPage,
            pageSize: rowsPerPage,
            pageNumber: page,
            ...filters?.reduce((acc, curr) => {
                acc[DATA_KEY_TO_FILTER_KEY[curr.column]] = curr.value;
                return acc;
            }, {}),
            ...sortSelector,
        };
        setIsLoading(true);
        fetchSensitivityAnalysisResult(studyUuid, nodeUuid, currentRootNetworkUuid, selector)
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
        nOrNkIndex,
        sensiKind,
        page,
        rowsPerPage,
        filters,
        sortConfig,
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
    }, [sensiStatus, fetchResult, fetchFilterOptions]);

    return (
        <>
            <SensitivityAnalysisResult
                result={result?.sensitivities || []}
                nOrNkIndex={nOrNkIndex}
                sensiKind={sensiKind}
                onFilter={onFilter}
                filtersDef={filtersDef}
                isLoading={isLoading}
                {...props}
            />
            <CustomTablePagination
                rowsPerPageOptions={PAGE_OPTIONS}
                count={count}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </>
    );
};

PagedSensitivityAnalysisResult.propTypes = {
    nOrNkIndex: PropTypes.number.isRequired,
    sensiKind: PropTypes.string.isRequired,
    studyUuid: PropTypes.string.isRequired,
    nodeUuid: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired,
    setPage: PropTypes.func.isRequired,
};

export default PagedSensitivityAnalysisResult;
