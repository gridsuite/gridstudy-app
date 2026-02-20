/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { CustomAGGrid, MessageLogCellRenderer, type MuiStyles, type SxStyle } from '@gridsuite/commons-ui';
import { alpha, useTheme } from '@mui/material/styles';
import { setLogsFilter } from '../../redux/actions';
import { makeAgGridCustomHeaderColumn } from 'components/custom-aggrid/utils/custom-aggrid-header-utils';
import { useReportFetcher } from 'hooks/use-report-fetcher';
import { useDispatch } from 'react-redux';
import { getDefaultSeverityFilter, REPORT_SEVERITY } from '../../utils/report/report-severity';
import { QuickSearch } from './QuickSearch';
import { Box, Chip, Theme } from '@mui/material';
import {
    CellClassParams,
    CellClickedEvent,
    GridApi,
    ICellRendererParams,
    RowClassParams,
    RowStyle,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { ComputingAndNetworkModificationType, Log, SelectedReportLog, SeverityLevel } from 'utils/report/report.type';
import { COMPUTING_AND_NETWORK_MODIFICATION_TYPE } from 'utils/report/report.constant';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { CustomAggridComparatorFilter } from '../custom-aggrid/custom-aggrid-filters/custom-aggrid-comparator-filter';
import { useFilterSelector } from '../../hooks/use-filter-selector';
import { FilterConfig, TableType } from '../../types/custom-aggrid-types';
import {
    FILTER_DATA_TYPES,
    FILTER_TEXT_COMPARATORS,
} from '../custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { AGGRID_LOCALES } from '../../translations/not-intl/aggrid-locales';
import CustomTablePagination from 'components/utils/custom-table-pagination';
import { reportStyles } from './report.styles';
import { useLogsPagination } from './use-logs-pagination';
import { useStableComputedArray } from '../../hooks/use-stable-computed-array';

const getColumnFilterValue = (array: FilterConfig[] | null, columnName: string): any => {
    return array?.find((item) => item.column === columnName)?.value ?? null;
};

const chipStyle = (severity: string, severityFilter: string[], theme: Theme) =>
    ({
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
    }) as const satisfies SxStyle;

const styles = {
    chipContainer: (theme) => ({
        display: 'flex',
        flexWrap: 'wrap',
        gap: theme.spacing(1),
    }),
    toolContainer: (theme) => ({
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1),
        mb: theme.spacing(2),
    }),
} as const satisfies MuiStyles;

const SEVERITY_COLUMN_FIXED_WIDTH = 115;
const PAGE_OPTIONS = [15, 30, 50, 100];

type LogTableProps = {
    selectedReport: SelectedReportLog;
    reportType: ComputingAndNetworkModificationType;
    severities: SeverityLevel[] | undefined;
    onRowClick: (data: Log | undefined) => void;
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

    const [, , , fetchLogs, fetchLogMatches] = useReportFetcher(
        reportType as keyof typeof COMPUTING_AND_NETWORK_MODIFICATION_TYPE
    );
    const { filters } = useFilterSelector(TableType.Logs, reportType);
    const { pagination, setPagination } = useLogsPagination(reportType);

    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(-1);
    const [rowData, setRowData] = useState<Log[] | null>(null);
    const [searchMatches, setSearchMatches] = useState<{ rowIndex: number; page: number }[]>([]);
    const [searchResults, setSearchResults] = useState<number[]>([]);
    const [currentResultIndex, setCurrentResultIndex] = useState(-1);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const gridRef = useRef<AgGridReact>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [filtersInitialized, setFiltersInitialized] = useState(false);
    const [count, setCount] = useState<number>(0);

    const { page, rowsPerPage } = pagination;

    // Reset filtersInitialized when reportType or severities change
    useEffect(() => {
        setFiltersInitialized(false);
    }, [reportType, severities]);

    const severityFilter = useStableComputedArray<string>(
        () => getColumnFilterValue(filters, 'severity') ?? [],
        [filters]
    );
    const messageFilter = useMemo(() => getColumnFilterValue(filters, 'message'), [filters]);

    const resetSearch = useCallback(() => {
        setSearchMatches([]);
        setSearchResults([]);
        setCurrentResultIndex(-1);
        setSearchTerm('');
    }, []);

    const refreshLogsOnSelectedReport = useCallback(() => {
        if (severityFilter.length === 0) {
            setRowData([]);
            return;
        }
        fetchLogs(selectedReport.id, severityFilter, messageFilter, selectedReport.type, page, rowsPerPage)?.then(
            (pagedLogs) => {
                const { content, totalElements, totalPages } = pagedLogs;
                if (totalPages - 1 < page) {
                    setPagination({ page: 0, rowsPerPage });
                }
                setCount(totalElements);
                setSelectedRowIndex(-1);
                setRowData(content);
            }
        );
    }, [
        severityFilter,
        fetchLogs,
        selectedReport.id,
        selectedReport.type,
        messageFilter,
        page,
        rowsPerPage,
        setPagination,
    ]);

    useEffect(() => {
        if (severities && severities.length > 0) {
            // Reset filters will trigger initialization regardless of current filter state
            // Otherwise, only initialize if not already done and no filters present, or if not already done
            // and severity not already in current filter state
            // This is to avoid overwriting filters when user unchecks all severities manually
            const severityNotAlreadyInFilter = severities.some((severity) => !severityFilter.includes(severity));
            const needsInitialization =
                resetFilters ||
                (!filtersInitialized && severityFilter.length === 0) ||
                (!filtersInitialized && severityNotAlreadyInFilter);

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
    }, [severities, dispatch, reportType, resetFilters, filtersInitialized, severityFilter]);

    useEffect(() => {
        if (selectedReport.id && selectedReport.type) {
            refreshLogsOnSelectedReport();
        }
    }, [refreshLogsOnSelectedReport, selectedReport]);

    useEffect(() => {
        onFiltersChanged();
    }, [filters, onFiltersChanged]);

    const COLUMNS_DEFINITIONS = useMemo(
        () => [
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'report_viewer/severity' }),
                width: SEVERITY_COLUMN_FIXED_WIDTH,
                colId: 'severity',
                field: 'severity',
                cellStyle: (params: CellClassParams<Log>) => ({
                    backgroundColor: params.data?.backgroundColor ?? theme.palette.background.default,
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
                            type: TableType.Logs,
                            tab: reportType,
                            dataType: FILTER_DATA_TYPES.TEXT,
                            comparators: [FILTER_TEXT_COMPARATORS.CONTAINS],
                        },
                    },
                    forceDisplayFilterIcon: true,
                },
                flex: 1,
                cellRenderer: (param: ICellRendererParams<Log>) =>
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
            theme.palette.background.default,
            theme.searchedText.highlightColor,
            theme.searchedText.currentHighlightColor,
            searchTerm,
            currentResultIndex,
            searchResults,
        ]
    );

    const handleRowClick = useCallback(
        (row: CellClickedEvent<Log>) => {
            setSelectedRowIndex(row.rowIndex);
            onRowClick(row.data);
        },
        [onRowClick]
    );

    const rowStyleFormat = useCallback(
        (row: RowClassParams<Log>): RowStyle => {
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

            fetchLogMatches(
                selectedReport.id,
                severityFilter,
                messageFilter,
                selectedReport.type,
                searchTerm,
                rowsPerPage
            )?.then((matchesPositions) => {
                setSearchMatches(matchesPositions);
                const matches = matchesPositions.map((match: { rowIndex: number; page: number }) => match.rowIndex);
                if (matches.length > 0) {
                    setPagination({ page: matchesPositions[0].page, rowsPerPage });
                }
                handleSearchResults(matches);
            });
        },
        [
            fetchLogMatches,
            handleSearchResults,
            messageFilter,
            resetSearch,
            rowsPerPage,
            selectedReport.id,
            selectedReport.type,
            setPagination,
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

            setPagination({ page: searchMatches[newIndex].page, rowsPerPage });
            setCurrentResultIndex(newIndex);
            highlightAndScrollToMatch(newIndex, searchResults);
        },
        [searchResults, setPagination, searchMatches, rowsPerPage, highlightAndScrollToMatch, currentResultIndex]
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
            setPagination({ page: newPage, rowsPerPage });
            // find index of the first element in searchMatches
            const firstMatchIndex = searchMatches.findIndex((match) => match.page === newPage);
            setCurrentResultIndex(firstMatchIndex);
        },
        [searchMatches, rowsPerPage, setPagination]
    );

    const handleChangeRowsPerPage = useCallback(
        (event: any) => {
            setPagination({ page: 0, rowsPerPage: parseInt(event.target.value, 10) });
        },
        [setPagination]
    );

    // This effect enables to recompute the research when selected node, filters or page size change for example
    useEffect(() => {
        handleSearch(searchTerm);
        // We don't want to trigger the effect on searchTerm change because it is already done in QuickSearch component
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handleSearch]);

    return (
        <Box sx={reportStyles.mainContainer}>
            <Box sx={styles.toolContainer}>
                <QuickSearch
                    currentResultIndex={currentResultIndex}
                    onSearch={handleSearch}
                    onNavigate={handleNavigate}
                    resultCount={searchResults.length}
                    resetSearch={resetSearch}
                    placeholder="searchPlaceholderLog"
                    inputRef={inputRef}
                />
                <Box sx={styles.chipContainer}>
                    {severities?.map((severity) => (
                        <Chip
                            key={severity}
                            label={severity}
                            deleteIcon={severityFilter.includes(severity) ? <VisibilityIcon /> : <VisibilityOffIcon />}
                            onClick={() => handleChipClick(severity)}
                            onDelete={() => handleChipClick(severity)}
                            sx={chipStyle(severity, severityFilter, theme) /*TODO memoize that*/}
                        />
                    ))}
                </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
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
            <CustomTablePagination
                rowsPerPageOptions={PAGE_OPTIONS}
                count={count}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPageId="reportLogsPerPage"
            />
        </Box>
    );
};

export default memo(LogTable);
