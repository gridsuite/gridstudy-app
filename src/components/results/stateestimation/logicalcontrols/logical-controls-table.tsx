/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, Key, useEffect, useMemo, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { AgGridReact } from 'ag-grid-react';
import {
    DefaultCellRenderer,
    getNoRowsMessage,
    RESULTS_LOADING_DELAY,
    RunningStatus,
    useIntlResultStatusMessages,
    useOpenLoaderShortWait,
} from '@gridsuite/commons-ui';
import { RenderTableAndExportCsv } from 'components/utils/renderTable-ExportCsv';
import { TableType } from 'types/custom-aggrid-types';
import { PARAM_COMPUTED_LANGUAGE } from 'utils/config-params';
import { AppState } from 'redux/reducer.type';
import { ColDef } from 'ag-grid-community';

interface LogicalControlsTableProps {
    resultAvailable: boolean;
    rows: unknown[];
    isLoadingResult: boolean;
    columnDefs: ColDef[];
    tableName: string;
    exportCsvResetKey: Key;
}

export const LogicalControlsTable: FunctionComponent<LogicalControlsTableProps> = ({
    resultAvailable,
    rows,
    isLoadingResult,
    columnDefs,
    tableName,
    exportCsvResetKey,
}) => {
    const intl = useIntl();
    const gridRef = useRef<AgGridReact>(null);
    const language = useSelector((state: AppState) => state[PARAM_COMPUTED_LANGUAGE]);

    const tableNameFormatted = intl.formatMessage({ id: tableName });

    const openLoaderTab = useOpenLoaderShortWait({
        isLoading: isLoadingResult,
        delay: RESULTS_LOADING_DELAY,
    });

    const messages = useIntlResultStatusMessages(intl, true);

    const defaultColDef = useMemo(
        () => ({
            filter: false,
            sortable: false,
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

    let status = RunningStatus.IDLE;
    if (isLoadingResult) {
        status = RunningStatus.RUNNING;
    } else if (resultAvailable) {
        status = RunningStatus.SUCCEED;
    }
    const overlayNoRowsTemplate = getNoRowsMessage(messages, rows, status, !isLoadingResult);

    // The grid only re-evaluates the no-rows overlay on row data changes. Let's force it
    // to have a correct updated msg on the tab where the computation starts.
    useEffect(() => {
        const api = gridRef.current?.api;
        if (api?.getDisplayedRowCount() === 0) {
            api.showNoRowsOverlay();
        }
    }, [overlayNoRowsTemplate]);

    return (
        <>
            <Box sx={{ height: '4px', position: 'relative', zIndex: 1 }}>{openLoaderTab && <LinearProgress />}</Box>
            <RenderTableAndExportCsv
                gridRef={gridRef}
                columns={columnDefs}
                defaultColDef={defaultColDef}
                tableName={tableNameFormatted}
                rows={rows}
                overlayNoRowsTemplate={overlayNoRowsTemplate}
                skipColumnHeaders={false}
                computationType={TableType.StateEstimation}
                computationSubType={tableName}
                exportCsvResetKey={exportCsvResetKey}
                language={language}
            />
        </>
    );
};
