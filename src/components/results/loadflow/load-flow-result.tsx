/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FunctionComponent, useCallback, useMemo, useRef } from 'react';

import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Box, useTheme } from '@mui/material';
import { GridReadyEvent, RowClassParams } from 'ag-grid-community';
import { ComputingType } from '../../computing-status/computing-type';
import { AppState } from '../../../redux/reducer';

import { LoadflowResultProps } from './load-flow-result.type';
import { getNoRowsMessage, getRows, useIntlResultStatusMessages } from '../../utils/aggrid-rows-handler';
import { DefaultCellRenderer } from '../../spreadsheet/utils/cell-renderers';

import LinearProgress from '@mui/material/LinearProgress';
import { RunningStatus } from '../../utils/running-status';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import { RenderTableAndExportCsv } from '../../utils/renderTable-ExportCsv';
import { formatComponentResult } from './load-flow-result-utils';
import { AgGridReact } from 'ag-grid-react';

export const LoadFlowResult: FunctionComponent<LoadflowResultProps> = ({ result, isLoadingResult, columnDefs }) => {
    const theme = useTheme();
    const intl = useIntl();

    const loadFlowStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.LOAD_FLOW]);

    const gridRef = useRef<AgGridReact>(null);

    const openLoaderStatusTab = useOpenLoaderShortWait({
        isLoading:
            loadFlowStatus === RunningStatus.RUNNING || result?.componentResults?.length !== 0 || !isLoadingResult,
        delay: RESULTS_LOADING_DELAY,
    });

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

    const messages = useIntlResultStatusMessages(intl);

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

    const renderLoadFlowResult = () => {
        const message = getNoRowsMessage(
            messages,
            result?.componentResults,
            loadFlowStatus,
            result?.componentResults && !isLoadingResult
        );
        const formattedResult = formatComponentResult(result?.componentResults);
        const rowsToShow = getRows(formattedResult, loadFlowStatus);
        return (
            <>
                <Box sx={{ height: '4px' }}>{openLoaderStatusTab && <LinearProgress />}</Box>
                <RenderTableAndExportCsv
                    gridRef={gridRef}
                    columns={columnDefs}
                    defaultColDef={defaultColDef}
                    tableName={intl.formatMessage({
                        id: 'LoadFlowResultsStatus',
                    })}
                    rows={rowsToShow}
                    onRowDataUpdated={onRowDataUpdated}
                    onGridReady={onGridReady}
                    getRowStyle={getRowStyle}
                    overlayNoRowsTemplate={message}
                    skipColumnHeaders={false}
                />
            </>
        );
    };

    return <>{renderLoadFlowResult()}</>;
};
