/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Box, useTheme } from '@mui/material';
import { GridReadyEvent, RowClassParams } from 'ag-grid-community';

import { ComputingType } from '../../computing-status/computing-type';
import { AppState } from '../../../redux/reducer';

import { LimitViolationResultProps } from './load-flow-result.type';
import { getNoRowsMessage, getRows, useIntlResultStatusMessages } from '../../utils/aggrid-rows-handler';
import { DefaultCellRenderer } from '../../spreadsheet/utils/cell-renderers';

import LinearProgress from '@mui/material/LinearProgress';
import { RunningStatus } from '../../utils/running-status';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import { RenderTableAndExportCsv } from '../../utils/renderTable-ExportCsv';
import { AgGridReact } from 'ag-grid-react';

export const LimitViolationResult: FunctionComponent<LimitViolationResultProps> = ({
    result,
    isLoadingResult,
    columnDefs,
    tableName,
}) => {
    const theme = useTheme();
    const intl = useIntl();
    const gridRef = useRef<AgGridReact>(null);

    const loadFlowStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.LOAD_FLOW]);

    const [isOverloadedEquipmentsReady, setIsOverloadedEquipmentsReady] = useState(false);

    //We give each tab its own loader so we don't have a loader spinning because another tab is still doing some work
    const openLoaderTab = useOpenLoaderShortWait({
        isLoading:
            // We want the loader to start when the loadflow begins
            loadFlowStatus === RunningStatus.RUNNING ||
            // We still want the loader to be displayed for the remaining time there is between "the loadflow is over"
            // and "the data is post processed and can be displayed"
            (!isOverloadedEquipmentsReady && loadFlowStatus === RunningStatus.SUCCEED) ||
            isLoadingResult,
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
    const messages = useIntlResultStatusMessages(intl);

    const renderLoadFlowLimitViolations = () => {
        const message = getNoRowsMessage(messages, result, loadFlowStatus, !isLoadingResult);
        const rowsToShow = getRows(result, loadFlowStatus);

        return (
            <>
                <Box sx={{ height: '4px' }}>{openLoaderTab && <LinearProgress />}</Box>
                <RenderTableAndExportCsv
                    gridRef={gridRef}
                    columns={columnDefs}
                    defaultColDef={defaultColDef}
                    tableName={tableName}
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

    useEffect(() => {
        //reset everything at initial state
        if (loadFlowStatus === RunningStatus.FAILED || loadFlowStatus === RunningStatus.IDLE) {
            setIsOverloadedEquipmentsReady(false);
        }
    }, [loadFlowStatus]);

    return renderLoadFlowLimitViolations();
};
