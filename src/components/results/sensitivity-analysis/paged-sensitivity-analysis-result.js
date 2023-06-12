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
    PAGE_OPTIONS,
} from './sensitivity-analysis-content';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchSensitivityAnalysisResult } from '../../../utils/rest-api';
import { useRowFilter } from '../../../hooks/use-row-filter';
import { useIntl } from 'react-intl';
import FilterPanel from '../../spreadsheet/filter-panel/filter-panel';
import { SORT_WAYS, useAgGridSort } from '../../../hooks/use-aggrid-sort';
import { useSnackMessage } from '@gridsuite/commons-ui';
import LoaderWithOverlay from '../../utils/loader-with-overlay';
import CustomTablePagination from '../../utils/custom-table-pagination';

const PagedSensitivityResult = ({
    nOrNkIndex,
    sensiKindIndex,
    studyUuid,
    nodeUuid,
}) => {
    const intl = useIntl();

    const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_COUNT);
    const [page, setPage] = useState(0);
    const [count, setCount] = useState(0);
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [prevSensiKindIndex, setPrevSensiKindIndex] =
        useState(sensiKindIndex);

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

    const { updateFilter, getFilterSelector, initFilters } = useRowFilter(
        DATA_KEY_TO_FILTER_KEY
    );

    // Add default sort on sensitivity col
    const defaultSortColumn = DATA_KEY_TO_SORT_KEY.value;
    const defaultSortOrder = SORT_WAYS.desc;
    const { onSortChanged, sortSelector } = useAgGridSort(
        DATA_KEY_TO_SORT_KEY,
        { colKey: defaultSortColumn, defaultSortOrder }
    );

    const { snackError } = useSnackMessage();

    const handleChangePage = useCallback((_, newPage) => {
        setPage(newPage);
    }, []);

    const handleChangeRowsPerPage = useCallback((event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }, []);

    const handleUpdateFilter = useCallback(
        (field, value) => {
            setPage(0);
            updateFilter(field, value);
        },
        [updateFilter]
    );

    const fetchResult = useCallback(() => {
        setIsLoading(true);

        const selector = {
            isJustBefore: !nOrNkIndex,
            functionType: FUNCTION_TYPES[sensiKindIndex],
            offset: page * rowsPerPage,
            chunkSize: rowsPerPage,
            ...getFilterSelector(),
            ...sortSelector,
        };

        fetchSensitivityAnalysisResult(studyUuid, nodeUuid, selector)
            .then((res) => {
                setResult(res);
                const { filteredSensitivitiesCount = 0 } = res || {};
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
        getFilterSelector,
        sortSelector,
        studyUuid,
        nodeUuid,
        snackError,
        intl,
    ]);

    useEffect(() => {
        if (prevSensiKindIndex !== sensiKindIndex) {
            setPrevSensiKindIndex(sensiKindIndex);
            setPage(0);
            return;
        }

        fetchResult();
    }, [fetchResult, sensiKindIndex, prevSensiKindIndex]);

    useEffect(() => {
        initFilters();
    }, [initFilters, sensiKindIndex]);

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
            <FilterPanel
                filtersDef={filtersDef}
                updateFilter={handleUpdateFilter}
            />
            <SensitivityAnalysisResult
                result={result?.sensitivities || []}
                nOrNkIndex={nOrNkIndex}
                sensiToIndex={sensiKindIndex}
                onSortChanged={onSortChanged}
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

PagedSensitivityResult.propTypes = {
    nOrNkIndex: PropTypes.number.isRequired,
    sensiKindIndex: PropTypes.number.isRequired,
    studyUuid: PropTypes.string.isRequired,
    nodeUuid: PropTypes.string.isRequired,
};

export default PagedSensitivityResult;
