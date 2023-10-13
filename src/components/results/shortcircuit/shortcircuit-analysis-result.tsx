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
import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { fetchShortCircuitAnalysisPagedResults } from '../../../services/study/short-circuit-analysis';
import {
    DEFAULT_PAGE_COUNT,
    PAGE_OPTIONS,
} from './shortcircuit-analysis-result-content';
import CustomTablePagination from '../../utils/custom-table-pagination';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useIntl } from 'react-intl';
import { AgGridReact } from 'ag-grid-react';

interface IShortCircuitAnalysisGlobalResultProps {
    analysisType: ShortCircuitAnalysisType;
    result: SCAFaultResult[];
    handleFetchResultPage: (
        result: SCAFaultResult[] | SCAFeederResult[]
    ) => void;
    shortCircuitNotif: boolean;
}

export const ShortCircuitAnalysisResult: FunctionComponent<
    IShortCircuitAnalysisGlobalResultProps
> = ({ analysisType, result, handleFetchResultPage, shortCircuitNotif }) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();
    const gridRef = useRef<AgGridReact>(null);

    const [rowsPerPage, setRowsPerPage] = useState<number>(
        DEFAULT_PAGE_COUNT as number
    );
    const [count, setCount] = useState<number>(0);
    const [page, setPage] = useState<number>(0);
    const [filter, setFilter] = useState([]);
    const [sort, setSort] = useState([]);
    const studyUuid = useSelector((state: ReduxState) => state.studyUuid);
    const currentNode = useSelector(
        (state: ReduxState) => state.currentTreeNode
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

    // Effects
    useEffect(() => {
        let active = true; // to manage race condition
        gridRef.current?.api?.showLoadingOverlay();

        const selector = {
            page,
            size: rowsPerPage,
            filter: filter,
            sort: sort,
        };

        //TODO FM fix bad glitch one bus
        fetchShortCircuitAnalysisPagedResults({
            studyUuid,
            currentNodeUuid: currentNode?.id,
            type: analysisType,
            selector,
        })
            .then((result: SCAPagedResults) => {
                if (active) {
                    const { content, totalElements } = result;
                    handleFetchResultPage(content);
                    if (totalElements && content.length) {
                        setCount(totalElements);
                    }
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
            .finally(() => {
                if (active) {
                    gridRef.current?.api?.hideOverlay();
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
        handleFetchResultPage,
        studyUuid,
        currentNode?.id,
        intl,
        shortCircuitNotif,
    ]);

    return (
        <>
            <ShortCircuitAnalysisResultTable
                gridRef={gridRef}
                result={result}
                analysisType={analysisType}
                setFilter={setFilter}
                setSort={setSort}
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
