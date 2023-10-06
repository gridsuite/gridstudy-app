/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import WaitingLoader from 'components/utils/waiting-loader';
import ShortCircuitAnalysisResultTable from './shortcircuit-analysis-result-table';
import { useSelector } from 'react-redux';
import {
    SCAFaultResult,
    SCAResult,
    ShortCircuitAnalysisType,
} from './shortcircuit-analysis-result.type';
import { ReduxState } from 'redux/reducer.type';
import { ComputingType } from 'components/computing-status/computing-type';
import { RunningStatus } from 'components/utils/running-status';
import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useState,
} from 'react';
import { fetchShortCircuitAnalysisResult } from '../../../services/study/short-circuit-analysis';
import {
    DATA_KEY_TO_SORT_KEY,
    DEFAULT_PAGE_COUNT,
    PAGE_OPTIONS,
} from './shortcircuit-analysis-result-content';
import CustomTablePagination from '../../utils/custom-table-pagination';
import { useAgGridSort } from '../../../hooks/use-aggrid-sort';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useIntl } from 'react-intl';

interface IShortCircuitAnalysisGlobalResultProps {
    analysisType: ShortCircuitAnalysisType;
    formatResult: (result: SCAResult) => SCAFaultResult[];
}

export const ShortCircuitAnalysisResult: FunctionComponent<
    IShortCircuitAnalysisGlobalResultProps
> = ({ analysisType, formatResult }) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();

    const [rowsPerPage, setRowsPerPage] = useState<number>(
        DEFAULT_PAGE_COUNT as number
    );
    const [count, setCount] = useState<number>(0);
    const [page, setPage] = useState<number>(0);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [result, setResult] = useState<SCAFaultResult[]>([]);

    const studyUuid = useSelector((state: ReduxState) => state.studyUuid);
    const currentNode = useSelector(
        (state: ReduxState) => state.currentTreeNode
    );
    const oneBusShortCircuitAnalysisState = useSelector(
        (state: ReduxState) =>
            state.computingStatus[ComputingType.ONE_BUS_SHORTCIRCUIT_ANALYSIS]
    );
    const shortCircuitNotif = useSelector(
        (state: ReduxState) => state.shortCircuitNotif
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

    const { onSortChanged, sortConfig } = useAgGridSort();

    // Effects
    useEffect(() => {
        setIsFetching(true);

        const { colKey, sortWay } = sortConfig;

        const sortKey = DATA_KEY_TO_SORT_KEY[colKey];
        const sortWayValue = sortWay && (sortWay > 0 ? 'ASC' : 'DESC');

        const parsedSortConfig =
            sortKey && sortWayValue ? `${sortKey},${sortWayValue}` : '';

        const selector = {
            page,
            size: rowsPerPage,
            sort: parsedSortConfig,
        };

        if (
            analysisType === ShortCircuitAnalysisType.ALL_BUSES ||
            oneBusShortCircuitAnalysisState !== RunningStatus.RUNNING
        ) {
            setResult([]);

            fetchShortCircuitAnalysisResult({
                studyUuid,
                currentNodeUuid: currentNode?.id,
                type: analysisType,
                selector,
            })
                .then((result: SCAResult) => {
                    const {
                        page: { content, totalElements },
                    } = result;

                    const formattedResults = formatResult(result);
                    setResult(formattedResults);
                    if (totalElements && content.length) {
                        setCount(totalElements);
                    }
                })
                .catch((error) =>
                    snackError({
                        messageTxt: error.message,
                        headerId: intl.formatMessage({
                            id: 'ShortCircuitAnalysisResultsError',
                        }),
                    })
                )
                .finally(() => setIsFetching(false));
        }
    }, [
        page,
        rowsPerPage,
        snackError,
        analysisType,
        formatResult,
        sortConfig,
        studyUuid,
        currentNode?.id,
        intl,
        shortCircuitNotif,
        oneBusShortCircuitAnalysisState,
    ]);

    return (
        <>
            <WaitingLoader message={'LoadingRemoteData'} loading={isFetching}>
                <ShortCircuitAnalysisResultTable
                    result={result}
                    onSortChanged={onSortChanged}
                    sortConfig={sortConfig}
                    analysisType={analysisType}
                />
            </WaitingLoader>
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
