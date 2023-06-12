/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import PropTypes from 'prop-types';
import { TablePagination } from '@mui/material';
import SensitivityAnalysisResult from './sensitivity-analysis-result';
import LinearProgress from '@mui/material/LinearProgress';
import {
    DATA_KEY_TO_FILTER_KEY,
    DATA_KEY_TO_SORT_KEY,
    DEFAULT_PAGE_COUNT,
    FUNCTION_TYPES,
    PAGE_OPTIONS,
} from './sensitivity-analysis-content';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchSensitivityAnalysisResult } from '../../../utils/rest-api';
import TablePaginationActions from '@mui/material/TablePagination/TablePaginationActions';
import { useRowFilter } from '../../../hooks/use-row-filter';
import { useIntl } from 'react-intl';
import FilterPanel from '../../spreadsheet/filter-panel/filter-panel';
import { SORT_WAYS, useAgGridSort } from '../../../hooks/use-aggrid-sort';
import { useSnackMessage } from '@gridsuite/commons-ui';

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

    const { updateFilter, getFilterSelector } = useRowFilter(
        DATA_KEY_TO_FILTER_KEY
    );

    // Add default sort on sensitivity col
    const colKey = 'SENSITIVITY';
    const sortWay = SORT_WAYS.desc;
    const { onSortChanged, sortSelector } = useAgGridSort(
        DATA_KEY_TO_SORT_KEY,
        { colKey: colKey, sortWay }
    );

    const { snackError } = useSnackMessage();

    const handleChangePage = useCallback((_, newPage) => {
        setPage(newPage);
    }, []);

    const handleChangeRowsPerPage = useCallback((event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }, []);

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

                const { filteredSensitivitiesCount = 0 } = res;
                setCount(filteredSensitivitiesCount);
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'PagedSensitivityResult',
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [
        snackError,
        nOrNkIndex,
        sensiKindIndex,
        studyUuid,
        nodeUuid,
        page,
        rowsPerPage,
        getFilterSelector,
        sortSelector,
    ]);

    useEffect(() => {
        fetchResult();
    }, [fetchResult]);

    return (
        <>
            {isLoading && <LinearProgress />}
            <FilterPanel filtersDef={filtersDef} updateFilter={updateFilter} />
            <SensitivityAnalysisResult
                result={result?.sensitivities || []}
                nOrNkIndex={nOrNkIndex}
                sensiToIndex={sensiKindIndex}
                onSortChanged={onSortChanged}
            />
            <TablePagination
                component="div"
                rowsPerPageOptions={PAGE_OPTIONS}
                colSpan={3}
                count={count}
                rowsPerPage={rowsPerPage}
                page={page}
                showFirstButton={true}
                showLastButton={true}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
            >
                <span>{isLoading ? 'waiting' : 'finished'}</span>
            </TablePagination>
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
