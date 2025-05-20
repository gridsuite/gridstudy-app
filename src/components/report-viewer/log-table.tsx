/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { CustomAGGrid } from '@gridsuite/commons-ui';
import { alpha, useTheme } from '@mui/material/styles';
import { setLogsFilter } from '../../redux/actions';
import { makeAgGridCustomHeaderColumn } from 'components/custom-aggrid/utils/custom-aggrid-header-utils';
import { useReportFetcher } from 'hooks/use-report-fetcher';
import { useDispatch } from 'react-redux';
import { getDefaultSeverityFilter, REPORT_SEVERITY } from '../../utils/report/report-severity';
import { QuickSearch } from './QuickSearch';
import { Box, Chip, Theme } from '@mui/material';
import { CellClickedEvent, GridApi, ICellRendererParams, IRowNode, RowClassParams, RowStyle } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import {
    ComputingAndNetworkModificationType,
    ReportLog,
    ReportType,
    SelectedReportLog,
    SeverityLevel,
} from 'utils/report/report.type';
import { COMPUTING_AND_NETWORK_MODIFICATION_TYPE } from 'utils/report/report.constant';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { MessageLogCellRenderer } from 'components/custom-aggrid/cell-renderers';
import { CustomAggridComparatorFilter } from '../custom-aggrid/custom-aggrid-filters/custom-aggrid-comparator-filter';
import { useFilterSelector } from '../../hooks/use-filter-selector';
import { FilterConfig, FilterType } from '../../types/custom-aggrid-types';
import {
    FILTER_DATA_TYPES,
    FILTER_TEXT_COMPARATORS,
} from '../custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { AGGRID_LOCALES } from '../../translations/not-intl/aggrid-locales';
import CustomTablePagination from 'components/utils/custom-table-pagination';

const getColumnFilterValue = (array: FilterConfig[] | null, columnName: string): any => {
    return array?.find((item) => item.column === columnName)?.value ?? null;
};

const styles = {
    chip: (severity: string, severityFilter: string[], theme: Theme) => ({
        backgroundColor: severityFilter.includes(severity)
            ? REPORT_SEVERITY[severity as keyof typeof REPORT_SEVERITY].colorHexCode
            : theme.severityChip.disabledColor,
        cursor: 'pointer',
        border: `1px solid ${theme.palette.divider}`,
        '&:hover': {
            backgroundColor: alpha(REPORT_SEVERITY[severity as keyof typeof REPORT_SEVERITY].colorHexCode, 0.5),
        },
        '& .MuiChip-deleteIcon': {
            color: theme.palette.text.primary,
            fontSize: '1rem',
        },
        '& .MuiChip-deleteIcon:hover': {
            color: theme.palette.text.primary,
        },
        padding: 0.5,
    }),
    chipContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        p: 1,
        marginBottom: 3,
    },
    quickSearch: { width: '100%', flexShrink: 0, marginLeft: 1 },
};

const SEVERITY_COLUMN_FIXED_WIDTH = 115;
const PAGE_OPTIONS = [15, 30, 50, 100];
const DEFAULT_PAGE_COUNT = 15;

type LogTableProps = {
    selectedReport: SelectedReportLog;
    reportType: ComputingAndNetworkModificationType;
    severities: SeverityLevel[] | undefined;
    onRowClick: (data: ReportLog) => void;
    onFiltersChanged: () => void;
    resetFilters?: boolean;
};

const LogTable = ({
    selectedReport,
    reportType,
    severities,
    onRowClick,
    onFiltersChanged,
    resetFilters = false,
}: LogTableProps) => {
    const intl = useIntl();

    const theme = useTheme<Theme>();

    const dispatch = useDispatch();

    const [, , fetchReportLogs, , fetchPagedReportLogs, fetchLogMatches] = useReportFetcher(
        reportType as keyof typeof COMPUTING_AND_NETWORK_MODIFICATION_TYPE
    );
    const { filters } = useFilterSelector(FilterType.Logs, reportType);

    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(-1);
    const [rowData, setRowData] = useState<ReportLog[] | null>(null);
    const [searchMatches, setSearchMatches] = useState<{ rowIndex: number; page: number }[]>([]);
    const [searchResults, setSearchResults] = useState<number[]>([]);
    const [currentResultIndex, setCurrentResultIndex] = useState(-1);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const gridRef = useRef<AgGridReact>(null);

    const [filtersInitialized, setFiltersInitialized] = useState(false);
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(DEFAULT_PAGE_COUNT);
    const [count, setCount] = useState<number>(0);

    // Reset filtersInitialized when reportType changes
    useEffect(() => {
        setFiltersInitialized(false);
    }, [reportType]);

    const severityFilter = useMemo(() => getColumnFilterValue(filters, 'severity') ?? [], [filters]);
    const messageFilter = useMemo(() => getColumnFilterValue(filters, 'message'), [filters]);

    const resetSearch = useCallback(() => {
        setSearchMatches([]);
        setSearchResults([]);
        setCurrentResultIndex(-1);
        setSearchTerm('');
    }, []);

    const getReportLogs = useCallback(() => {
        fetchReportLogs(selectedReport.id, severityFilter, selectedReport.type, messageFilter)?.then((reportLogs) => {
            const minDepth = Math.min(...reportLogs.map((log) => log.depth ?? 0));
            const transformedLogs = reportLogs.map(
                (log) =>
                    ({
                        severity: log.severity.name,
                        depth: (log.depth ?? 0) - minDepth,
                        message: log.message,
                        parentId: log.parentId,
                        backgroundColor: log.severity.colorName,
                    }) as unknown as ReportLog
            );
            setSelectedRowIndex(-1);
            setRowData(transformedLogs);
            resetSearch();
        });
    }, [fetchReportLogs, messageFilter, resetSearch, selectedReport.id, selectedReport.type, severityFilter]);

    const getPagedReportLogs = useCallback(() => {
        fetchPagedReportLogs(selectedReport.id, severityFilter, messageFilter, page, rowsPerPage)?.then((pagedLogs) => {
            const { content, totalElements, totalPages } = pagedLogs;
            if (totalPages < page) {
                setPage(0);
            }
            setCount(totalElements);
            const minDepth = Math.min(...content.map((log) => log.depth ?? 0));
            const transformedLogs = content.map(
                (log) =>
                    ({
                        severity: log.severity.name,
                        depth: (log.depth ?? 0) - minDepth,
                        message: log.message,
                        parentId: log.parentId,
                        backgroundColor: log.severity.colorName,
                    }) as unknown as ReportLog
            );
            setSelectedRowIndex(-1);
            setRowData(transformedLogs);
        });
    }, [fetchPagedReportLogs, messageFilter, page, rowsPerPage, selectedReport.id, severityFilter]);

    const refreshLogsOnSelectedReport = useCallback(() => {
        if (severityFilter.length === 0) {
            setRowData([]);
            resetSearch();
            return;
        }
        if (selectedReport.type === ReportType.GLOBAL) {
            getReportLogs();
        } else {
            getPagedReportLogs();
        }
    }, [severityFilter.length, selectedReport.type, resetSearch, getReportLogs, getPagedReportLogs]);

    useEffect(() => {
        if (severities && severities.length > 0) {
            // Reset filters will trigger initialization regardless of current filter state
            // Otherwise, only initialize if not already done and no filters present :
            // This is to avoid overwriting filters when user unchecks all severities manually
            const needsInitialization = resetFilters || (!filtersInitialized && severityFilter.length === 0);

            if (needsInitialization) {
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
                setFiltersInitialized(true);
            }
        }
    }, [severities, dispatch, reportType, resetFilters, filtersInitialized, severityFilter.length]);

    useEffect(() => {
        if (selectedReport.id && selectedReport.type) {
            refreshLogsOnSelectedReport();
        }
    }, [refreshLogsOnSelectedReport, selectedReport]);

    useEffect(() => {
        onFiltersChanged();
        resetSearch();
    }, [filters, onFiltersChanged, resetSearch]);

    const COLUMNS_DEFINITIONS = useMemo(
        () => [
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'report_viewer/severity' }),
                width: SEVERITY_COLUMN_FIXED_WIDTH,
                colId: 'severity',
                field: 'severity',
                cellStyle: (params) => ({
                    backgroundColor: params.data.backgroundColor,
                    textAlign: 'center',
                }),
            }),
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'report_viewer/message' }),
                colId: 'message',
                field: 'message',
                context: {
                    filterComponent: CustomAggridComparatorFilter,
                    filterComponentParams: {
                        filterParams: {
                            type: FilterType.Logs,
                            tab: reportType,
                            dataType: FILTER_DATA_TYPES.TEXT,
                            comparators: [FILTER_TEXT_COMPARATORS.CONTAINS],
                        },
                    },
                    forceDisplayFilterIcon: true,
                },
                flex: 1,
                cellRenderer: (param: ICellRendererParams) =>
                    MessageLogCellRenderer({
                        param: param,
                        highlightColor: theme.searchedText.highlightColor,
                        currentHighlightColor: theme.searchedText.currentHighlightColor,
                        searchTerm: searchTerm,
                        currentResultIndex: currentResultIndex,
                        searchResults: searchResults,
                    }),
            }),
        ],
        [
            intl,
            reportType,
            theme.searchedText.highlightColor,
            theme.searchedText.currentHighlightColor,
            searchTerm,
            currentResultIndex,
            searchResults,
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

    const handleSearchResults = useCallback(
        (matches: number[]) => {
            setSearchResults(matches);
            setCurrentResultIndex(matches.length > 0 ? 0 : -1);

            if (matches.length > 0) {
                highlightAndScrollToMatch(0, matches);
            }
        },
        [highlightAndScrollToMatch]
    );

    const handleSearch = useCallback(
        (searchTerm: string) => {
            if (!gridRef.current || !searchTerm) {
                resetSearch();
                return;
            }
            setSearchTerm(searchTerm);
            const api = gridRef.current.api;
            let matches: number[] = [];
            const searchTermLower = searchTerm.toLowerCase();

            if (selectedReport.type === ReportType.GLOBAL) {
                api.forEachNode((node: IRowNode) => {
                    const { message } = node.data;
                    if (node.rowIndex !== null && message?.toLowerCase().includes(searchTermLower)) {
                        matches.push(node.rowIndex);
                    }
                });
                handleSearchResults(matches);
            } else {
                fetchLogMatches(selectedReport.id, severityFilter, messageFilter, searchTerm, rowsPerPage)?.then(
                    (matchesPositions) => {
                        setSearchMatches(matchesPositions);
                        matches = matchesPositions.map((match: { rowIndex: number; page: number }) => match.rowIndex);
                        if (matches.length > 0) {
                            setPage(matchesPositions[0].page);
                        }
                        handleSearchResults(matches);
                    }
                );
            }
        },
        [
            fetchLogMatches,
            handleSearchResults,
            messageFilter,
            resetSearch,
            rowsPerPage,
            selectedReport.id,
            selectedReport.type,
            severityFilter,
        ]
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

            if (selectedReport.type === ReportType.NODE) {
                setPage(searchMatches[newIndex].page);
            }

            setCurrentResultIndex(newIndex);
            highlightAndScrollToMatch(newIndex, searchResults);
        },
        [searchResults, selectedReport.type, highlightAndScrollToMatch, currentResultIndex, searchMatches]
    );

    const handleChipClick = useCallback(
        (severity: string) => {
            const updatedFilter = severityFilter.includes(severity)
                ? severityFilter.filter((s: any) => s !== severity)
                : [...severityFilter, severity];

            dispatch(
                setLogsFilter(reportType, [
                    {
                        column: 'severity',
                        dataType: FILTER_DATA_TYPES.TEXT,
                        type: FILTER_TEXT_COMPARATORS.EQUALS,
                        value: updatedFilter,
                    },
                    {
                        column: 'message',
                        dataType: FILTER_DATA_TYPES.TEXT,
                        type: FILTER_TEXT_COMPARATORS.CONTAINS,
                        value: messageFilter,
                    },
                ])
            );
        },
        [dispatch, reportType, severityFilter, messageFilter]
    );

    const handleChangePage = useCallback(
        (_: any, newPage: number) => {
            setPage(newPage);
            // find index of the first element in searchMatches
            const firstMatchIndex = searchMatches.findIndex((match) => match.page === newPage);
            setCurrentResultIndex(firstMatchIndex);
        },
        [searchMatches]
    );

    const handleChangeRowsPerPage = useCallback(
        (event: any) => {
            resetSearch();
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
        },
        [resetSearch]
    );

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
            }}
        >
            <Box sx={styles.quickSearch}>
                <QuickSearch
                    currentResultIndex={currentResultIndex}
                    selectedReportId={selectedReport.id}
                    onSearch={handleSearch}
                    onNavigate={handleNavigate}
                    resultCount={searchResults.length}
                    resetSearch={resetSearch}
                    placeholder="searchPlaceholderLog"
                />
            </Box>
            <Box sx={styles.chipContainer}>
                {severities?.map((severity, index) => (
                    <Chip
                        key={severity}
                        label={severity}
                        deleteIcon={severityFilter.includes(severity) ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        onClick={() => handleChipClick(severity)}
                        onDelete={() => handleChipClick(severity)}
                        sx={styles.chip(severity, severityFilter, theme)}
                    />
                ))}
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
                    overrideLocales={AGGRID_LOCALES}
                />
            </Box>
            {selectedReport.type === ReportType.NODE && (
                <CustomTablePagination
                    rowsPerPageOptions={PAGE_OPTIONS}
                    count={count}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPageId="reportLogsPerPage"
                />
            )}
        </Box>
    );
};

export default memo(LogTable);
