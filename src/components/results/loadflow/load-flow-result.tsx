/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { FunctionComponent, useCallback, useMemo, useRef } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Box, Typography, useTheme } from '@mui/material';
import { RowClassParams } from 'ag-grid-community';

import { LoadflowResultProps } from './load-flow-result.type';
import { getNoRowsMessage, getRows, useIntlResultStatusMessages } from '../../utils/aggrid-rows-handler';
import { ComputingType, DefaultCellRenderer } from '@gridsuite/commons-ui';
import { useLocalizedCountries } from '../../utils/localized-countries-hook';

import LinearProgress from '@mui/material/LinearProgress';
import { RunningStatus } from '../../utils/running-status';
import { useOpenLoaderShortWait } from '../../dialogs/commons/handle-loader';
import { RESULTS_LOADING_DELAY } from '../../network/constants';
import { RenderTableAndExportCsv } from '../../utils/renderTable-ExportCsv';
import { formatComponentResult, formatCountryAdequaciesResult, formatExchangesResult } from './load-flow-result-utils';
import { AgGridReact } from 'ag-grid-react';
import { AppState } from 'redux/reducer';

const styles = {
    gridContainer: {
        display: 'flex' as const,
        flexDirection: 'column' as const,
        gap: '8px',
        overflowY: 'auto' as const,
        overflowX: 'auto' as const,
        height: '100%',
        padding: '8px',
    },
};

export const LoadFlowResult: FunctionComponent<LoadflowResultProps> = ({
    result,
    isLoadingResult,
    componentColumnDefs,
    countryAdequaciesColumnDefs,
    exchangesColumnDefs,
}) => {
    const theme = useTheme();
    const intl = useIntl();

    const loadFlowStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.LOAD_FLOW]);

    const gridRef = useRef<AgGridReact>(null);
    const { translate } = useLocalizedCountries();

    const openLoaderStatusTab = useOpenLoaderShortWait({
        isLoading: loadFlowStatus === RunningStatus.RUNNING || isLoadingResult,
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

    const renderLoadFlowResult = () => {
        const message = getNoRowsMessage(
            messages,
            result?.componentResults,
            loadFlowStatus,
            result?.componentResults && !isLoadingResult
        );
        const formattedComponentResults = formatComponentResult(result?.componentResults);
        const componentResultRowsToShow = getRows(formattedComponentResults, loadFlowStatus);
        const formattedCountryAdequaciesResults = formatCountryAdequaciesResult(result?.countryAdequacies, translate);
        const countryAdequaciesResultRowsToShow = getRows(formattedCountryAdequaciesResults, loadFlowStatus);
        const formattedExchangesResults = formatExchangesResult(result?.exchanges, translate);
        const exchangesResultRowsToShow = getRows(formattedExchangesResults, loadFlowStatus);

        return (
            <>
                <div style={styles.gridContainer}>
                    <Box sx={{ height: '4px' }}>{openLoaderStatusTab && <LinearProgress />}</Box>
                    <h4 style={{ paddingLeft: '2px', marginBottom: '4px' }}>
                        <FormattedMessage id="LoadFlowResultsSynchronousComponents" />
                    </h4>
                    <div style={{ minHeight: '350px', height: '100%' }}>
                        <RenderTableAndExportCsv
                            gridRef={gridRef}
                            columns={componentColumnDefs}
                            defaultColDef={defaultColDef}
                            tableName={intl.formatMessage({
                                id: 'LoadFlowResultsSynchronousComponents',
                            })}
                            rows={componentResultRowsToShow}
                            getRowStyle={getRowStyle}
                            overlayNoRowsTemplate={message}
                            skipColumnHeaders={false}
                        />
                    </div>
                    <br />

                    <h4 style={{ paddingLeft: '2px', marginBottom: '4px' }}>
                        <FormattedMessage id="LoadFlowResultsCountryAdequacies" />
                    </h4>
                    <div style={{ minHeight: '350px', height: '100%' }}>
                        <RenderTableAndExportCsv
                            gridRef={gridRef}
                            columns={countryAdequaciesColumnDefs}
                            defaultColDef={defaultColDef}
                            tableName={intl.formatMessage({
                                id: 'LoadFlowResultsCountryAdequacies',
                            })}
                            rows={countryAdequaciesResultRowsToShow}
                            getRowStyle={getRowStyle}
                            overlayNoRowsTemplate={message}
                            skipColumnHeaders={false}
                        />
                    </div>
                    <br />

                    <h4 style={{ paddingLeft: '2px', marginBottom: '4px' }}>
                        <FormattedMessage id="LoadFlowResultsExchanges" />
                    </h4>
                    <div style={{ minHeight: '350px', height: '100%', paddingBottom: '32px' }}>
                        <RenderTableAndExportCsv
                            gridRef={gridRef}
                            columns={exchangesColumnDefs}
                            defaultColDef={defaultColDef}
                            tableName={intl.formatMessage({
                                id: 'LoadFlowResultsExchanges',
                            })}
                            rows={exchangesResultRowsToShow}
                            getRowStyle={getRowStyle}
                            overlayNoRowsTemplate={message}
                            skipColumnHeaders={false}
                        />
                    </div>
                </div>
            </>
        );
    };

    return <>{renderLoadFlowResult()}</>;
};
