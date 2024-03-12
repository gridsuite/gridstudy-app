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
    SENSITIVITY_AT_NODE,
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
    sensiKind,
    studyUuid,
    nodeUuid,
    page,
    setPage,
    sortProps,
    filterProps,
    ...props
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

    const { onSortChanged = () => {}, sortConfig } = sortProps || {};
    const { updateFilter, filterSelector } = filterProps || {};

    const filtersDef = useMemo(() => {
        const baseFilters = [
            {
                field: 'funcId',
                label: intl.formatMessage({
                    id:
                        sensiKind === SENSITIVITY_AT_NODE
                            ? 'BusBarBus'
                            : 'SupervisedBranches',
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
            functionType: FUNCTION_TYPES[sensiKind],
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
    }, [nOrNkIndex, sensiKind, studyUuid, nodeUuid, snackError, intl]);

    const fetchResult = useCallback(() => {
        const sortSelector = sortConfig?.length
            ? {
                  sortKeysWithWeightAndDirection: sortConfig.reduce(
                      (acc, value) => ({
                          ...acc,
                          [DATA_KEY_TO_SORT_KEY[value.colId]]:
                              value.sort === 'desc' ? -1 : 1,
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
            ...filterSelector?.reduce((acc, curr) => {
                acc[curr.column] = curr.value;
                return acc;
            }, {}),
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
        sensiKind,
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
                sortProps={{
                    onSortChanged,
                    sortConfig,
                }}
                filterProps={{
                    updateFilter: handleUpdateFilter,
                    filterSelector,
                }}
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
    filterProps: PropTypes.object,
    sortProps: PropTypes.object,
    page: PropTypes.number.isRequired,
    setPage: PropTypes.func.isRequired,
};

export default PagedSensitivityAnalysisResult;
