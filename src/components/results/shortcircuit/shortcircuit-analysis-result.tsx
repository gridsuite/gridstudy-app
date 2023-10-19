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
import { fetchShortCircuitAnalysisPagedResults } from '../../../services/study/short-circuit-analysis';
import {
    PAGE_OPTIONS,
    DEFAULT_PAGE_COUNT,
} from './shortcircuit-analysis-result-content';
import CustomTablePagination from '../../utils/custom-table-pagination';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useIntl } from 'react-intl';
import { Box, LinearProgress } from '@mui/material';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RESULTS_LOADING_DELAY } from '../../network/constants';

interface IShortCircuitAnalysisGlobalResultProps {
    analysisType: ShortCircuitAnalysisType;
    analysisStatus: RunningStatus;
    result: SCAFaultResult[];
    updateResult: (result: SCAFaultResult[] | SCAFeederResult[]) => void;
    shortCircuitNotif: boolean;
}

export const ShortCircuitAnalysisResult: FunctionComponent<
    IShortCircuitAnalysisGlobalResultProps
> = ({
    analysisType,
    analysisStatus,
    result,
    updateResult,
    shortCircuitNotif,
}) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();

    const [rowsPerPage, setRowsPerPage] = useState<number>(
        DEFAULT_PAGE_COUNT as number
    );
    const [count, setCount] = useState<number>(0);
    const [page, setPage] = useState<number>(0);
    const [filter, setFilter] = useState([]);
    const [sort, setSort] = useState([]);
    const [isFetching, setIsFetching] = useState<boolean>(false);

    const studyUuid = useSelector((state: ReduxState) => state.studyUuid);
    const currentNode = useSelector(
        (state: ReduxState) => state.currentTreeNode
    );

    const updateFilter = useCallback((newFilter: any) => {
        setFilter(newFilter);
        setPage(0); // we need to reset the page after updating the filter
    }, []);

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
        let active = true; // to manage race condition
        setIsFetching(true);
        updateResult([]);

        const selector = {
            page,
            size: rowsPerPage,
            filter: filter,
            sort: sort,
        };

        fetchShortCircuitAnalysisPagedResults({
            studyUuid,
            currentNodeUuid: currentNode?.id,
            type: analysisType,
            selector,
        })
            .then((result: SCAPagedResults) => {
                if (active) {
                    const { content, totalElements } = result;
                    updateResult(content);
                    if (totalElements && content.length) {
                        setCount(totalElements);
                    }
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
        filter,
        sort,
        page,
        rowsPerPage,
        snackError,
        analysisType,
        updateResult,
        studyUuid,
        currentNode?.id,
        intl,
        shortCircuitNotif,
    ]);

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
                updateFilter={updateFilter}
                updateSort={setSort}
                isFetching={isFetching}
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
