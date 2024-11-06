/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { memo, useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { useIntl } from 'react-intl';
import { CustomAGGrid } from '@gridsuite/commons-ui';
import { useTheme } from '@mui/material/styles';
import { setLogsFilter } from '../../redux/actions';
import { makeAgGridCustomHeaderColumn } from 'components/custom-aggrid/custom-aggrid-header-utils';
import { FILTER_DATA_TYPES, FILTER_TEXT_COMPARATORS } from 'components/custom-aggrid/custom-aggrid-header.type';
import { EllipsisCellRenderer } from 'components/spreadsheet/utils/cell-renderers';
import { getColumnFilterValue, useAggridRowFilter } from 'hooks/use-aggrid-row-filter';
import { LOGS_STORE_FIELD } from 'utils/store-sort-filter-fields';
import { useReportFetcher } from 'hooks/use-report-fetcher';
import { useDispatch } from 'react-redux';
import { getDefaultSeverityFilter } from '../../utils/report/report-severity';
import PropTypes from 'prop-types';
import { QuickSearch } from './QuickSearch';
import { Box, Theme } from '@mui/material';
import { CellClickedEvent, GridApi, ICellRendererParams, IRowNode, RowClassParams, RowStyle } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { ReportLog, ReportType } from 'utils/report/report.type';
import { COMPUTING_AND_NETWORK_MODIFICATION_TYPE } from 'utils/report/report.constant';

const SEVERITY_COLUMN_FIXED_WIDTH = 115;

type LogTableProps = {
    selectedReportId: string;
    reportType: string;
    reportNature: ReportType;
    severities: string[];
    onRowClick: (data: ReportLog) => void;
};

const LogTable = ({ selectedReportId, reportType, reportNature, severities, onRowClick }: LogTableProps) => {
    const intl = useIntl();

    const theme = useTheme<Theme>();

    const dispatch = useDispatch();

    const [, , fetchReportLogs] = useReportFetcher(reportType as keyof typeof COMPUTING_AND_NETWORK_MODIFICATION_TYPE);
    const { updateFilter, filterSelector } = useAggridRowFilter({
        filterType: LOGS_STORE_FIELD,
        filterTab: reportType,
        filterStoreAction: setLogsFilter,
    });

    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(-1);
    const [rowData, setRowData] = useState<ReportLog[] | null>(null);
    const [searchResults, setSearchResults] = useState<number[]>([]);
    const [currentResultIndex, setCurrentResultIndex] = useState(-1);
    const gridRef = useRef<AgGridReact>(null);

    const severityFilter = useMemo(() => getColumnFilterValue(filterSelector, 'severity') ?? [], [filterSelector]);
    const messageFilter = useMemo(() => getColumnFilterValue(filterSelector, 'message'), [filterSelector]);

    const resetSearch = useCallback(() => {
        setSearchResults([]);
        setCurrentResultIndex(-1);
    }, []);

    const refreshLogsOnSelectedReport = useCallback(() => {
        if (severityFilter === 0) {
            setRowData([]);
            resetSearch();
            return;
        }
        fetchReportLogs(selectedReportId, severityFilter, reportNature, messageFilter).then((reportLogs) => {
            const transformedLogs = reportLogs.map(
                (log) =>
                    ({
                        severity: log.severity.name,
                        message: log.message,
                        parentId: log.parentId,
                        backgroundColor: log.severity.colorName,
                    } as unknown as ReportLog)
            );
            setSelectedRowIndex(-1);
            setRowData(transformedLogs);
            resetSearch();
        });
    }, [fetchReportLogs, messageFilter, reportNature, severityFilter, selectedReportId, resetSearch]);

    useEffect(() => {
        // initialize the filter with the severities
        if (filterSelector?.length === 0 && severities?.length > 0) {
            dispatch(
                setLogsFilter(reportType, [
                    {
                        column: 'severity',
                        dataType: FILTER_DATA_TYPES.TEXT,
                        type: FILTER_TEXT_COMPARATORS.EQUALS,
                        value: getDefaultSeverityFilter(severities),
                    },
                ])
            );
        }
        if (selectedReportId && reportNature) {
            refreshLogsOnSelectedReport();
        }
    }, [
        dispatch,
        filterSelector?.length,
        refreshLogsOnSelectedReport,
        reportNature,
        reportType,
        selectedReportId,
        severities,
        updateFilter,
    ]);

    const shouldDisplayFilterBadge = useMemo(() => {
        const defaultSeverityFilter = getDefaultSeverityFilter(severities);

        const severitySet: Set<string> = new Set(severityFilter);
        const defaultSeveritySet = new Set(defaultSeverityFilter);

        if (severitySet.size !== defaultSeveritySet.size) {
            return true;
        }

        return ![...severitySet].every((severity: string) => defaultSeveritySet.has(severity));
    }, [severityFilter, severities]);

    const COLUMNS_DEFINITIONS = useMemo(
        () => [
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'report_viewer/severity' }),
                width: SEVERITY_COLUMN_FIXED_WIDTH,
                field: 'severity',
                filterProps: {
                    updateFilter,
                    filterSelector,
                },
                filterParams: {
                    filterDataType: FILTER_DATA_TYPES.TEXT,
                    filterEnums: {
                        severity: severities,
                    },
                },
                shouldDisplayFilterBadge: shouldDisplayFilterBadge,
                cellStyle: (params) => ({
                    backgroundColor: params.data.backgroundColor,
                    textAlign: 'center',
                }),
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'report_viewer/message' }),
                field: 'message',
                filterProps: {
                    updateFilter,
                    filterSelector,
                },
                filterParams: {
                    filterDataType: FILTER_DATA_TYPES.TEXT,
                    filterComparators: [FILTER_TEXT_COMPARATORS.CONTAINS],
                },
                flex: 1,
                cellRenderer: (param: ICellRendererParams) =>
                    EllipsisCellRenderer({
                        param: param,
                        indexTextToHighlight: searchResults[currentResultIndex],
                        highlightColor: theme.searchedText.highlightColor,
                    }),
            }),
        ],
        [
            intl,
            updateFilter,
            filterSelector,
            severities,
            shouldDisplayFilterBadge,
            searchResults,
            currentResultIndex,
            theme.searchedText.highlightColor,
        ]
    );

    const handleRowClick = useCallback(
        (row: CellClickedEvent) => {
            setSelectedRowIndex(row.rowIndex);
            onRowClick(row.data);
        },
        [onRowClick]
    );

    const rowStyleFormat = useCallback(
        (row: RowClassParams): RowStyle => {
            if (row.rowIndex && row.rowIndex < 0) {
                return {};
            }
            return selectedRowIndex === row.rowIndex ? { backgroundColor: theme.palette.action.selected } : {};
        },
        [selectedRowIndex, theme.palette.action.selected]
    );

    const onGridReady = ({ api }: { api: GridApi }) => {
        api?.sizeColumnsToFit();
    };

    const defaultColumnDefinition = {
        sortable: false,
        resizable: false,
        suppressMovable: true,
    };

    // Function to highlight the current match and scroll to it
    const highlightAndScrollToMatch = useCallback((index: number, matches: number[]) => {
        if (!gridRef.current || matches.length === 0) {
            return;
        }

        const api = gridRef.current.api;
        // First, scroll to the row
        api.ensureIndexVisible(matches[index], 'middle');
    }, []);

    const handleSearch = useCallback(
        (searchTerm: string) => {
            if (!gridRef.current || !searchTerm) {
                resetSearch();
                return;
            }

            const api = gridRef.current.api;
            const matches: number[] = [];
            const searchTermLower = searchTerm.toLowerCase();
            api.forEachNode((node: IRowNode) => {
                const { message } = node.data;
                if (node.rowIndex !== null && message?.toLowerCase().includes(searchTermLower)) {
                    matches.push(node.rowIndex);
                }
            });
            setSearchResults(matches);
            setCurrentResultIndex(matches.length > 0 ? 0 : -1);

            if (matches.length > 0) {
                highlightAndScrollToMatch(0, matches);
            }
        },
        [highlightAndScrollToMatch, resetSearch]
    );

    const handleNavigate = useCallback(
        (direction: 'next' | 'previous') => {
            if (!gridRef.current || searchResults.length === 0) {
                return;
            }

            let newIndex;

            if (direction === 'next') {
                newIndex = (currentResultIndex + 1) % searchResults.length;
            } else {
                newIndex = (currentResultIndex - 1 + searchResults.length) % searchResults.length;
            }

            setCurrentResultIndex(newIndex);
            highlightAndScrollToMatch(newIndex, searchResults);
        },
        [currentResultIndex, searchResults, highlightAndScrollToMatch]
    );

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
            }}
        >
            <Box sx={{ flexShrink: 0 }}>
                <QuickSearch
                    currentResultIndex={currentResultIndex}
                    selectedReportId={selectedReportId}
                    onSearch={handleSearch}
                    onNavigate={handleNavigate}
                    resultCount={searchResults.length}
                    setSearchResults={setSearchResults}
                />
            </Box>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <CustomAGGrid
                    ref={gridRef}
                    columnDefs={COLUMNS_DEFINITIONS}
                    rowData={rowData}
                    onCellClicked={handleRowClick}
                    getRowStyle={rowStyleFormat}
                    onGridReady={onGridReady}
                    defaultColDef={defaultColumnDefinition}
                />
            </Box>
        </Box>
    );
};

LogTable.propTypes = {
    selectedReportId: PropTypes.string,
    reportType: PropTypes.string,
    reportNature: PropTypes.string,
    severities: PropTypes.arrayOf(PropTypes.string),
    onRowClick: PropTypes.func,
};

export default memo(LogTable);
