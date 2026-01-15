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
import GridSection from '../../dialogs/commons/grid-section';

const styles = {
    gridContainer: {
        display: 'flex' as const,
        flexDirection: 'column' as const,
        gap: '8px',
        overflowY: 'auto' as const,
        overflowX: 'auto' as const,
        height: '100%',
        padding: '8px',
        paddingBottom: '64px',
    },
};

export const LoadFlowResult: FunctionComponent<LoadflowResultProps> = ({
    result,
    isLoadingResult,
    componentColumnDefs,
    countryAdequaciesColumnDefs,
    exchangesColumnDefs,
    filters,
}) => {
    const theme = useTheme();
    const intl = useIntl();

    const loadFlowStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.LOAD_FLOW]);

    const connectedComponentsGridRef = useRef<AgGridReact>(null);
    const countryAdequaciesGridRef = useRef<AgGridReact>(null);
    const exchangesGridRef = useRef<AgGridReact>(null);

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
            <div style={styles.gridContainer}>
                <Box sx={{ height: '4px' }}>{openLoaderStatusTab && <LinearProgress />}</Box>
                <GridSection title={'LoadFlowResultsConnectedComponents'} customStyle={{ paddingLeft: '4px' }} />
                <div style={{ minHeight: '300px', height: '100%' }}>
                    <RenderTableAndExportCsv
                        gridRef={connectedComponentsGridRef}
                        columns={componentColumnDefs}
                        defaultColDef={defaultColDef}
                        tableName={intl.formatMessage({
                            id: 'LoadFlowResultsConnectedComponents',
                        })}
                        rows={componentResultRowsToShow}
                        getRowStyle={getRowStyle}
                        overlayNoRowsTemplate={message}
                        skipColumnHeaders={false}
                        filters={filters}
                    />
                </div>
                <GridSection
                    title={'LoadFlowResultsCountryAdequacies'}
                    tooltipEnabled={true}
                    tooltipMessage={'LoadFlowResultsMainComponentToolTip'}
                    customStyle={{ paddingLeft: '4px' }}
                />
                <div style={{ minHeight: '300px', height: '100%' }}>
                    <RenderTableAndExportCsv
                        gridRef={countryAdequaciesGridRef}
                        columns={countryAdequaciesColumnDefs}
                        defaultColDef={defaultColDef}
                        tableName={intl.formatMessage({
                            id: 'LoadFlowResultsCountryAdequacies',
                        })}
                        rows={countryAdequaciesResultRowsToShow}
                        getRowStyle={getRowStyle}
                        overlayNoRowsTemplate={message}
                        skipColumnHeaders={false}
                        filters={filters}
                    />
                </div>
                <GridSection
                    title={'LoadFlowResultsExchanges'}
                    tooltipEnabled={true}
                    tooltipMessage={'LoadFlowResultsMainComponentToolTip'}
                    customStyle={{ paddingLeft: '4px' }}
                />
                <div style={{ minHeight: '300px', height: '100%' }}>
                    <RenderTableAndExportCsv
                        gridRef={exchangesGridRef}
                        columns={exchangesColumnDefs}
                        defaultColDef={defaultColDef}
                        tableName={intl.formatMessage({
                            id: 'LoadFlowResultsExchanges',
                        })}
                        rows={exchangesResultRowsToShow}
                        getRowStyle={getRowStyle}
                        overlayNoRowsTemplate={message}
                        skipColumnHeaders={false}
                        filters={filters}
                    />
                </div>
            </div>
        );
    };

    return <>{renderLoadFlowResult()}</>;
};
