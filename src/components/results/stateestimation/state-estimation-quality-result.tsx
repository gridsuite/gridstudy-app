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
import { GridReadyEvent, RowClassParams } from 'ag-grid-community';

import { ComputingType } from '../../computing-status/computing-type';
import { AppState } from '../../../redux/reducer';

import { getNoRowsMessage, getRows, useIntlResultStatusMessages } from '../../utils/aggrid-rows-handler';
import { DefaultCellRenderer } from '../../spreadsheet/utils/cell-renderers';

import LinearProgress from '@mui/material/LinearProgress';
import { RunningStatus } from '../../utils/running-status';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import { RenderTableAndExportCsv } from '../../utils/renderTable-ExportCsv';
import { AgGridReact } from 'ag-grid-react';
import { StateEstimationResultProps } from './state-estimation-result.type';

export const StateEstimationQualityResult: FunctionComponent<StateEstimationResultProps> = ({
    result,
    isLoadingResult,
    columnDefs,
    tableName,
}) => {
    const theme = useTheme();
    const intl = useIntl();
    const gridRef = useRef<AgGridReact>(null);

    const tableNameFormatted = intl.formatMessage({ id: tableName });

    const stateEstimationStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.STATE_ESTIMATION]
    );

    //We give each tab its own loader, so we don't have a loader spinning because another tab is still doing some work
    const openLoaderTab = useOpenLoaderShortWait({
        isLoading:
            // We want the loader to start when the state estimation begins
            stateEstimationStatus === RunningStatus.RUNNING ||
            // We still want the loader to be displayed for the remaining time there is between "the state estimation is over"
            // and "the data is post processed and can be displayed"
            stateEstimationStatus === RunningStatus.SUCCEED ||
            isLoadingResult,
        delay: RESULTS_LOADING_DELAY,
    });

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

    const onRowDataUpdated = useCallback((params: any) => {
        if (params.api) {
            params.api.sizeColumnsToFit();
        }
    }, []);

    const onGridReady = useCallback(({ api }: GridReadyEvent) => {
        api?.sizeColumnsToFit();
    }, []);
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

    const renderStateEstimationQualities = () => {
        const message = getNoRowsMessage(
            messages,
            tableName === 'qualityCriterionResults' ? result.qualityCriterionResults : result.qualityPerRegionResults,
            stateEstimationStatus,
            !isLoadingResult
        );
        const rowsToShow = getRows(
            tableName === 'qualityCriterionResults' ? result.qualityCriterionResults : result.qualityPerRegionResults,
            stateEstimationStatus
        );

        return (
            <>
                <Box sx={{ height: '4px' }}>{openLoaderTab && <LinearProgress />}</Box>
                <RenderTableAndExportCsv
                    gridRef={gridRef}
                    columns={columnDefs}
                    defaultColDef={defaultColDef}
                    tableName={tableNameFormatted}
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

    return renderStateEstimationQualities();
};
