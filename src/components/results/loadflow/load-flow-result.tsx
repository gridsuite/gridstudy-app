/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useTheme } from '@mui/material';
import { Lens } from '@mui/icons-material';
import { green, red } from '@mui/material/colors';
import {
    GridReadyEvent,
    ICellRendererParams,
    RowClassParams,
} from 'ag-grid-community';
import { useSnackMessage } from '@gridsuite/commons-ui';

import { ComputingType } from '../../computing-status/computing-type';
import { ReduxState } from '../../../redux/reducer.type';

import {
    FROM_COLUMN_TO_FIELD_LOADFLOW_RESULT,
    loadFlowResultColumnsDefinition,
    useFetchFiltersEnums,
} from './load-flow-result-utils';
import { LoadflowResultProps } from './load-flow-result.type';
import {
    getNoRowsMessage,
    getRows,
    useIntlResultStatusMessages,
} from '../../utils/aggrid-rows-handler';
import { DefaultCellRenderer } from '../../spreadsheet/utils/cell-renderers';
import { Box } from '@mui/system';
import LinearProgress from '@mui/material/LinearProgress';
import { RunningStatus } from '../../utils/running-status';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import { RenderTableAndExportCsv } from '../../utils/renderTable-ExportCsv';
import { SORT_WAYS, useAgGridSort } from 'hooks/use-aggrid-sort';
import { useAggridRowFilter } from 'hooks/use-aggrid-row-filter';
import { fetchLoadFlowResult } from 'services/study/loadflow';

export const LoadFlowResult: FunctionComponent<LoadflowResultProps> = ({
    result,
    studyUuid,
    nodeUuid,
    tabIndex,
    isWaiting,
}) => {
    const styles = {
        cell: {
            display: 'flex',
            alignItems: 'center',
            textAlign: 'center',
            boxSizing: 'border-box',
            flex: 1,
            cursor: 'initial',
        },
        succeed: {
            color: green[500],
        },
        fail: {
            color: red[500],
        },
    };
    const theme = useTheme();
    const intl = useIntl();

    const loadFlowStatus = useSelector(
        (state: ReduxState) => state.computingStatus[ComputingType.LOADFLOW]
    );

    const [loadflowResult, setLoadflowResult] = useState(result);
    const [isFetchComplete, setIsFetchComplete] = useState(false);

    const [hasFilter, setHasFilter] = useState<boolean>(false);
    const gridRef = useRef();

    const { onSortChanged, sortConfig, initSort } = useAgGridSort({
        colKey: 'slackBusId',
        sortWay: SORT_WAYS.asc,
    });

    const { updateFilter, filterSelector, initFilters } = useAggridRowFilter(
        FROM_COLUMN_TO_FIELD_LOADFLOW_RESULT,
        () => {}
    );

    const { loading: filterEnumsLoading, result: filterEnums } =
        useFetchFiltersEnums(hasFilter, setHasFilter);

    const openLoaderStatusTab = useOpenLoaderShortWait({
        isLoading:
            loadFlowStatus === RunningStatus.RUNNING ||
            isWaiting ||
            !isFetchComplete ||
            filterEnumsLoading,
        delay: RESULTS_LOADING_DELAY,
    });

    const { snackError } = useSnackMessage();

    const defaultColDef = useMemo(
        () => ({
            filter: true,
            sortable: true,
            resizable: true,
            lockPinned: true,
            suppressMovable: true,
            wrapHeaderText: true,
            autoHeaderHeight: true,
            flex: 1,
            cellRenderer: DefaultCellRenderer,
        }),
        []
    );

    const onRowDataUpdated = useCallback((params: any) => {
        if (params.api) {
            params.api.sizeColumnsToFit();
        }
    }, []);

    const StatusCellRender = useCallback(
        (cellData: ICellRendererParams) => {
            const status = cellData.value;
            const color = status === 'CONVERGED' ? styles.succeed : styles.fail;
            return (
                <Box sx={styles.cell}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Lens fontSize={'medium'} sx={color} />
                        <span style={{ marginLeft: '4px' }}>{status}</span>
                    </div>
                </Box>
            );
        },
        [styles.cell, styles.fail, styles.succeed]
    );

    const NumberRenderer = useCallback(
        (cellData: ICellRendererParams) => {
            const value = cellData.value;
            return (
                <Box sx={styles.cell}>
                    {!isNaN(value) ? value.toFixed(2) : ''}
                </Box>
            );
        },
        [styles.cell]
    );

    const loadFlowResultColumns = useMemo(() => {
        return loadFlowResultColumnsDefinition(
            intl,
            { onSortChanged, sortConfig },
            { updateFilter, filterSelector },
            filterEnums,
            StatusCellRender,
            NumberRenderer
        );
    }, [
        intl,
        NumberRenderer,
        StatusCellRender,
        filterEnums,
        filterSelector,
        onSortChanged,
        sortConfig,
        updateFilter,
    ]);

    const messages = useIntlResultStatusMessages(intl);

    useEffect(() => {
        if (result) {
            if (result) {
                fetchLoadFlowResult(studyUuid, nodeUuid, {
                    sort: sortConfig,
                    filters: filterSelector,
                })
                    .then((loadFlowResult) => {
                        setLoadflowResult(loadFlowResult);
                    })
                    .catch((error) => {
                        snackError({
                            messageTxt: error.message,
                            headerId: 'ErrFetchViolationsMsg',
                        });
                    })
                    .finally(() => {
                        setIsFetchComplete(true);
                    });
            }
        }
    }, [
        studyUuid,
        nodeUuid,
        intl,
        result,
        filterSelector,
        sortConfig,
        snackError,
    ]);

    useEffect(() => {
        initFilters();
        if (initSort) {
            initSort('slackBusId');
        }
    }, [tabIndex, initFilters, initSort]);

    const getRowStyle = useCallback(
        (params: RowClassParams) => {
            if (params?.data?.elementId) {
                return {
                    backgroundColor: theme.selectedRow.background,
                };
            }
        },
        [theme.selectedRow.background]
    );

    const onGridReady = useCallback(({ api }: GridReadyEvent) => {
        api?.sizeColumnsToFit();
    }, []);

    useEffect(() => {
        //reset everything at initial state
        if (
            loadFlowStatus === RunningStatus.FAILED ||
            loadFlowStatus === RunningStatus.IDLE
        ) {
            setIsFetchComplete(false);
        }
    }, [loadFlowStatus]);

    const renderLoadFlowResult = () => {
        const message = getNoRowsMessage(
            messages,
            result?.componentResults,
            loadFlowStatus,
            result?.componentResults ? true : false
        );

        const rowsToShow = getRows(
            loadflowResult?.componentResults,
            loadFlowStatus
        );
        return (
            <>
                <Box sx={{ height: '4px' }}>
                    {openLoaderStatusTab && <LinearProgress />}
                </Box>
                <RenderTableAndExportCsv
                    gridRef={gridRef}
                    columns={loadFlowResultColumns}
                    defaultColDef={defaultColDef}
                    tableName={intl.formatMessage({
                        id: 'LoadFlowResultsStatus',
                    })}
                    rows={rowsToShow}
                    onRowDataUpdated={onRowDataUpdated}
                    onGridReady={onGridReady}
                    getRowStyle={getRowStyle}
                    overlayNoRowsTemplate={message}
                    enableCellTextSelection={true}
                    skipColumnHeaders={false}
                />
            </>
        );
    };

    return <>{renderLoadFlowResult()}</>;
};
