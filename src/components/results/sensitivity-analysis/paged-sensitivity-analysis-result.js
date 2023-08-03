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
import LoaderWithOverlay from '../../utils/loader-with-overlay';
import CustomTablePagination from '../../utils/custom-table-pagination';
import { fetchSensitivityAnalysisResult } from '../../../services/study/sensitivity-analysis';

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
    const [isLoading, setIsLoading] = useState(false);

    const filtersDef = useMemo(() => {
        const baseFilters = [
            {
                field: 'funcId',
                label: intl.formatMessage({
                    id: sensiKindIndex < 2 ? 'SupervisedBranches' : 'BusBarBus',
                }),
                options: result?.allFunctionIds || [],
            },
            {
                field: 'varId',
                label: intl.formatMessage({ id: 'VariablesToSimulate' }),
                options: result?.allVariableIds || [],
            },
        ];

        if (nOrNkIndex > 0) {
            baseFilters.push({
                field: 'contingencyId',
                label: intl.formatMessage({ id: 'ContingencyId' }),
                options: result?.allContingencyIds || [],
            });
        }

        return baseFilters;
    }, [intl, sensiKindIndex, nOrNkIndex, result]);

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

    const fetchResult = useCallback(() => {
        setIsLoading(true);

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
            isJustBefore: !nOrNkIndex,
            functionType: FUNCTION_TYPES[sensiKindIndex],
            offset: page * rowsPerPage,
            chunkSize: rowsPerPage,
            ...filterSelector,
            ...sortSelector,
        };

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
        fetchResult();
    }, [fetchResult]);

    useEffect(() => {}, [sensiKindIndex, nOrNkIndex]);

    return (
        <>
            {isLoading && (
                <div>
                    <LoaderWithOverlay
                        color="inherit"
                        loaderSize={70}
                        loadingMessageText={'LoadingRemoteData'}
                    />
                </div>
            )}
            <SensitivityAnalysisResult
                result={result?.sensitivities || []}
                nOrNkIndex={nOrNkIndex}
                sensiToIndex={sensiKindIndex}
                onSortChanged={onSortChanged}
                sortConfig={sortConfig}
                updateFilter={handleUpdateFilter}
                filterSelector={filterSelector}
                filtersDef={filtersDef}
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
