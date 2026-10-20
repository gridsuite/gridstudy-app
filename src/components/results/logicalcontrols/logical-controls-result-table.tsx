/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useMemo, useRef } from 'react';
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
    RunningStatus,
    TableType,
    useIntlResultStatusMessages,
    useOpenLoaderShortWait,
} from '@gridsuite/commons-ui';
import { RenderTableAndExportCsv } from 'components/utils/renderTable-ExportCsv';
import { PARAM_COMPUTED_LANGUAGE } from 'utils/config-params';
import { AppState } from 'redux/reducer.type';
import { LogicalControlsResultTableProps } from './logical-controls-result.type';

const LogicalControlsResultTable: FunctionComponent<LogicalControlsResultTableProps> = ({
    result,
    isLoadingResult,
    columnDefs,
    tableName,
    exportCsvResetKey,
}) => {
    const intl = useIntl();
    const gridRef = useRef<AgGridReact>(null);
    const language = useSelector((state: AppState) => state[PARAM_COMPUTED_LANGUAGE]);
    const logicalControlsStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.LOGICAL_CONTROLS]
    );

    const tableNameFormatted = intl.formatMessage({ id: tableName });

    const openLoaderTab = useOpenLoaderShortWait({
        isLoading:
            logicalControlsStatus === RunningStatus.RUNNING ||
            logicalControlsStatus === RunningStatus.PRELOADING ||
            isLoadingResult,
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
    const rowsToShow = (() => {
        switch (tableName) {
            case 'CsvNameBalances':
                return result.balances ?? [];
            case 'CsvNameNonZeroMeasurementsOnDisconnected':
                return result.nonZeroMeasurementsOnDisconnected ?? [];
            case 'CsvNameZeroMeasurementsOnConnected':
                return result.zeroMeasurementsOnConnected ?? [];
            case 'CsvNameOriginExtremityDeviations':
                return result.originExtremityDeviations ?? [];
            case 'CsvNameOutOfBoundsMeasurements':
                return result.outOfBoundsMeasurements ?? [];
            case 'CsvNameVoltageDeviations':
                return result.voltageDeviations ?? [];
            default:
                return [];
        }
    })();

    const message = getNoRowsMessage(messages, rowsToShow, logicalControlsStatus, !isLoadingResult);

    return (
        <>
            <Box sx={{ height: '4px', position: 'relative', zIndex: 1 }}>{openLoaderTab && <LinearProgress />}</Box>
            <RenderTableAndExportCsv
                gridRef={gridRef}
                columns={columnDefs}
                defaultColDef={defaultColDef}
                tableName={tableNameFormatted}
                rows={rowsToShow}
                overlayNoRowsTemplate={message}
                skipColumnHeaders={false}
                computationType={TableType.LogicalControls}
                computationSubType={tableName}
                exportCsvResetKey={exportCsvResetKey}
                language={language}
                withTooltip
            />
        </>
    );
};

export default LogicalControlsResultTable;
