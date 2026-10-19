/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, Key, useMemo, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { AgGridReact } from 'ag-grid-react';
import {
    ComputingType,
    DefaultCellRenderer,
    getNoRowsMessage,
    RESULTS_LOADING_DELAY,
    TableType,
    useIntlResultStatusMessages,
    useOpenLoaderShortWait,
} from '@gridsuite/commons-ui';
import { RenderTableAndExportCsv } from 'components/utils/renderTable-ExportCsv';
import { PARAM_COMPUTED_LANGUAGE } from 'utils/config-params';
import { AppState } from 'redux/reducer.type';
import { ColDef } from 'ag-grid-community';

interface LogicalControlsTableProps {
    rows: unknown[];
    isLoadingResult: boolean;
    columnDefs: ColDef[];
    tableName: string;
    exportCsvResetKey: Key;
}

export const LogicalControlsTable: FunctionComponent<LogicalControlsTableProps> = ({
    rows,
    isLoadingResult,
    columnDefs,
    tableName,
    exportCsvResetKey,
}) => {
    const intl = useIntl();
    const gridRef = useRef<AgGridReact>(null);
    const language = useSelector((state: AppState) => state[PARAM_COMPUTED_LANGUAGE]);
    const computationStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.LOGICAL_CONTROLS]);

    const tableNameFormatted = intl.formatMessage({ id: tableName });

    const openLoaderTab = useOpenLoaderShortWait({
        isLoading: isLoadingResult,
        delay: RESULTS_LOADING_DELAY,
    });

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

    const messages = useIntlResultStatusMessages(intl, true);
    const overlayNoRowsTemplate = getNoRowsMessage(messages, rows, computationStatus, !isLoadingResult);

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
                withTooltip
            />
        </>
    );
};
