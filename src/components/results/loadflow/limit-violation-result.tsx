/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FunctionComponent, useCallback, useMemo, useRef } from 'react';

import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Box, useTheme } from '@mui/material';
import { RowClassParams } from 'ag-grid-community';

import { LimitViolationResultProps } from './load-flow-result.type';
import { getNoRowsMessage, getRows, useIntlResultStatusMessages } from '../../utils/aggrid-rows-handler';
import { ComputingType, DefaultCellRenderer } from '@gridsuite/commons-ui';

import LinearProgress from '@mui/material/LinearProgress';
import { RunningStatus } from '../../utils/running-status';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import { RenderTableAndExportCsv } from '../../utils/renderTable-ExportCsv';
import { AgGridReact } from 'ag-grid-react';
import { AppState } from 'redux/reducer';

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

    //We give each tab its own loader so we don't have a loader spinning because another tab is still doing some work
    const openLoaderTab = useOpenLoaderShortWait({
        isLoading:
            // We want the loader to start when the loadflow begins
            loadFlowStatus === RunningStatus.RUNNING || isLoadingResult,
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

    const messages = useIntlResultStatusMessages(intl);

    const renderLoadFlowLimitViolations = () => {
        const message = getNoRowsMessage(messages, result, loadFlowStatus, !isLoadingResult);
        const rowsToShow = getRows(result, loadFlowStatus);

        return (
            <>
                <Box sx={{ height: '12px', marginTop: '12px' }}>{openLoaderTab && <LinearProgress />}</Box>
                <RenderTableAndExportCsv
                    gridRef={gridRef}
                    columns={columnDefs}
                    defaultColDef={defaultColDef}
                    tableName={tableName}
                    rows={rowsToShow}
                    getRowStyle={getRowStyle}
                    overlayNoRowsTemplate={message}
                    skipColumnHeaders={false}
                />
            </>
        );
    };

    return renderLoadFlowLimitViolations();
};
