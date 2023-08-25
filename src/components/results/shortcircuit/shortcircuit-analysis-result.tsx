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
    SCAResultFault,
    ShortCircuitAnalysisFetch,
    ShortcircuitAnalysisResult,
    ShortcircuitAnalysisType,
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
import {
    fetchOneBusShortCircuitAnalysisResult,
    fetchShortCircuitAnalysisResult,
} from '../../../services/study/short-circuit-analysis';
import {
    PAGE_OPTIONS,
    DEFAULT_PAGE_COUNT,
    DATA_KEY_TO_SORT_KEY,
} from './shortcircuit-analysis-result-content';
import CustomTablePagination from '../../utils/custom-table-pagination';
import { useAgGridSort } from '../../../hooks/use-aggrid-sort';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useIntl } from 'react-intl';

interface IShortCircuitAnalysisGlobalResultProps {
    analysisType: ShortcircuitAnalysisType;
}

export const ShortCircuitAnalysisResult: FunctionComponent<
    IShortCircuitAnalysisGlobalResultProps
> = ({ analysisType }) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();

    const [rowsPerPage, setRowsPerPage] = useState<number>(
        DEFAULT_PAGE_COUNT as number
    );
    const [count, setCount] = useState<number>(0);
    const [page, setPage] = useState<number>(0);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [result, setResult] = useState<SCAResultFault[]>([]);

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

    const isLoading =
        analysisType === ShortcircuitAnalysisType.ALL_BUSES
            ? isFetching
            : oneBusShortCircuitAnalysisState === RunningStatus.RUNNING ||
              isFetching;

    const isAllBusesType = analysisType === ShortcircuitAnalysisType.ALL_BUSES;

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

        const fetchAnalysisResult = (
            fetchFunction: ShortCircuitAnalysisFetch
        ) => {
            fetchFunction(studyUuid, currentNode?.id)
                .then((result: ShortcircuitAnalysisResult) => {
                    const { content = [], totalElements } = result || {};

                    setResult(content);
                    if (totalElements && content.length) {
                        setCount(totalElements);
                    }
                })
                .catch((error) =>
                    snackError({
                        messageTxt: error.message,
                        headerId: intl.formatMessage({
                            id: 'ShortCircuitAnalysisError',
                        }),
                    })
                )
                .finally(() => setIsFetching(false));
        };

        if (isAllBusesType) {
            fetchAnalysisResult(
                fetchShortCircuitAnalysisResult.bind(null, {
                    studyUuid,
                    currentNodeUuid: currentNode?.id,
                    selector,
                })
            );
        } else {
            fetchAnalysisResult(
                fetchOneBusShortCircuitAnalysisResult.bind(null, {
                    studyUuid,
                    currentNodeUuid: currentNode?.id,
                })
            );
        }
    }, [
        page,
        rowsPerPage,
        snackError,
        isAllBusesType,
        sortConfig,
        studyUuid,
        currentNode?.id,
        intl,
        shortCircuitNotif,
    ]);

    return (
        <>
            <WaitingLoader message={'LoadingRemoteData'} loading={isLoading}>
                <ShortCircuitAnalysisResultTable
                    result={result}
                    onSortChanged={onSortChanged}
                    sortConfig={sortConfig}
                />
            </WaitingLoader>
            {isAllBusesType && (
                <CustomTablePagination
                    rowsPerPageOptions={PAGE_OPTIONS}
                    count={count}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            )}
        </>
    );
};
