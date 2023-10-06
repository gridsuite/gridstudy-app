/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import PropTypes from 'prop-types';
import SensitivityAnalysisResult from './sensitivity-analysis-result';
import {
    DATA_KEY_TO_SORT_KEY,
    DEFAULT_PAGE_COUNT,
    FUNCTION_TYPES,
    PAGE_OPTIONS,
} from './sensitivity-analysis-content';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { SensitivityResultTabs } from './sensitivity-analysis-result-tab';

const PagedSensitivityAnalysisResult = ({
    nOrNkIndex,
    sensiKindIndex,
    studyUuid,
    nodeUuid,
    updateFilter,
    filterSelector,
    page,
    setPage,
    onSortChanged,
    sortConfig,
}) => {
    const intl = useIntl();

    const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_COUNT);
    const [count, setCount] = useState(0);
    const [result, setResult] = useState(null);
    const [options, setOptions] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const sensiStatus = useSelector(
        (state) => state.computingStatus[ComputingType.SENSITIVITY_ANALYSIS]
    );

    const filtersDef = useMemo(() => {
        const baseFilters = [
            {
                field: 'funcId',
                label: intl.formatMessage({
                    id: sensiKindIndex < 2 ? 'SupervisedBranches' : 'BusBarBus',
                }),
                options: options?.allFunctionIds || [],
            },
            {
                field: 'varId',
                label: intl.formatMessage({ id: 'VariablesToSimulate' }),
                options: options?.allVariableIds || [],
            },
        ];

        if (nOrNkIndex === 1) {
            baseFilters.push({
                field: 'contingencyId',
                label: intl.formatMessage({ id: 'ContingencyId' }),
                options: options?.allContingencyIds || [],
            });
        }

        return baseFilters;
    }, [intl, sensiKindIndex, nOrNkIndex, options]);

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

    const handleUpdateFilter = useCallback(
        (field, value) => {
            setPage(0);
            updateFilter(field, value);
        },
        [setPage, updateFilter]
    );

    const fetchFilterOptions = useCallback(() => {
        const selector = {
            tabSelection: SensitivityResultTabs[nOrNkIndex].id,
            functionType: FUNCTION_TYPES[sensiKindIndex],
        };

        fetchSensitivityAnalysisFilterOptions(studyUuid, nodeUuid, selector)
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
    }, [nOrNkIndex, sensiKindIndex, studyUuid, nodeUuid, snackError, intl]);

    useEffect(() => {
        fetchFilterOptions();
    }, [fetchFilterOptions]);

    const fetchResult = useCallback(() => {
        const { colKey, sortWay } = sortConfig || {};

        const sortSelector =
            colKey && sortWay
                ? {
                      sortKeysWithWeightAndDirection: {
                          [DATA_KEY_TO_SORT_KEY[colKey]]: sortWay,
                      },
                  }
                : {};

        const selector = {
            tabSelection: SensitivityResultTabs[nOrNkIndex].id,
            functionType: FUNCTION_TYPES[sensiKindIndex],
            offset: page * rowsPerPage,
            pageSize: rowsPerPage,
            pageNumber: page,
            ...filterSelector,
            ...sortSelector,
        };
        setIsLoading(true);
        fetchSensitivityAnalysisResult(studyUuid, nodeUuid, selector)
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
        sensiKindIndex,
        page,
        rowsPerPage,
        filterSelector,
        sortConfig,
        studyUuid,
        nodeUuid,
        snackError,
        intl,
    ]);

    useEffect(() => {
        if (sensiStatus === RunningStatus.RUNNING) {
            setResult(null);
        }
        if (sensiStatus === RunningStatus.SUCCEED) {
            fetchResult();
        }
    }, [sensiStatus, fetchResult]);

    return (
        <>
            <SensitivityAnalysisResult
                result={result?.sensitivities || []}
                nOrNkIndex={nOrNkIndex}
                sensiToIndex={sensiKindIndex}
                onSortChanged={onSortChanged}
                sortConfig={sortConfig}
                updateFilter={handleUpdateFilter}
                filterSelector={filterSelector}
                filtersDef={filtersDef}
                isLoading={isLoading}
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
    sensiKindIndex: PropTypes.number.isRequired,
    studyUuid: PropTypes.string.isRequired,
    nodeUuid: PropTypes.string.isRequired,
    updateFilter: PropTypes.func,
    onSortChanged: PropTypes.func,
    filterSelector: PropTypes.object,
    sortConfig: PropTypes.object,
    page: PropTypes.number.isRequired,
    setPage: PropTypes.func.isRequired,
};

export default PagedSensitivityAnalysisResult;
