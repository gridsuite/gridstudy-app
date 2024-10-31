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
import { getDefaultSeverityFilter } from 'utils/report-severity.utils';
import PropTypes from 'prop-types';
import { QuickSearch } from './QuickSearch';
import { Box } from '@mui/material';

const SEVERITY_COLUMN_FIXED_WIDTH = 115;

const LogTable = ({ selectedReportId, reportType, reportNature, severities, onRowClick }) => {
    const intl = useIntl();

    const theme = useTheme();

    const dispatch = useDispatch();

    const [, , fetchReportLogs] = useReportFetcher(reportType);
    const { updateFilter, filterSelector } = useAggridRowFilter({
        filterType: LOGS_STORE_FIELD,
        filterTab: reportType,
        filterStoreAction: setLogsFilter,
    });

    const [selectedRowIndex, setSelectedRowIndex] = useState(-1);
    const [rowData, setRowData] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [currentResultIndex, setCurrentResultIndex] = useState(-1);
    const gridRef = useRef(null);

    const severityFilter = useMemo(() => getColumnFilterValue(filterSelector, 'severity') ?? [], [filterSelector]);
    const messageFilter = useMemo(() => getColumnFilterValue(filterSelector, 'message'), [filterSelector]);

    const resetSearch = useCallback(() => {
        setSearchResults([]);
        setCurrentResultIndex(-1);
    }, []);

    const refreshLogsOnSelectedReport = useCallback(() => {
        if (severityFilter?.length === 0) {
            setRowData([]);
            resetSearch();
            return;
        }
        fetchReportLogs(selectedReportId, severityFilter, reportNature, messageFilter).then((reportLogs) => {
            const transformedLogs = reportLogs.map((log) => ({
                severity: log.severity.name,
                message: log.message,
                parentId: log.parentId,
                backgroundColor: log.severity.colorName,
            }));
            setSelectedRowIndex(-1);
            setRowData(transformedLogs);
            resetSearch();
        });
    }, [fetchReportLogs, messageFilter, reportNature, severityFilter, selectedReportId, resetSearch]);

    useEffect(() => {
        // initialize the filter with the severities
        if (filterSelector.length === 0 && severities?.length > 0) {
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
        filterSelector.length,
        refreshLogsOnSelectedReport,
        reportNature,
        reportType,
        selectedReportId,
        severities,
        updateFilter,
    ]);

    const shouldDisplayFilterBadge = useMemo(() => {
        const defaultSeverityFilter = getDefaultSeverityFilter(severities);

        const severitySet = new Set(severityFilter);
        const defaultSeveritySet = new Set(defaultSeverityFilter);

        if (severitySet.size !== defaultSeveritySet.size) {
            return true;
        }

        return ![...severitySet].every((severity) => defaultSeveritySet.has(severity));
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
                cellRenderer: (param) =>
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
        (row) => {
            setSelectedRowIndex(row.rowIndex);
            onRowClick(row.data);
        },
        [onRowClick]
    );

    const rowStyleFormat = useCallback(
        (row) => {
            if (row.index < 0) {
                return {};
            }
            return selectedRowIndex === row.rowIndex ? { backgroundColor: theme.palette.action.selected } : {};
        },
        [selectedRowIndex, theme.palette.action.selected]
    );

    const onGridReady = ({ api }) => {
        api?.sizeColumnsToFit();
    };

    const defaultColumnDefinition = {
        sortable: false,
        resizable: false,
        suppressMovable: true,
    };

    // Function to scroll to the current match
    const highlightAndScrollToMatch = useCallback((index, matches) => {
        if (!gridRef.current || matches.length === 0) {
            return;
        }

        const api = gridRef.current.api;
        // First, scroll to the row
        api.ensureIndexVisible(matches[index], 'middle');
    }, []);

    const handleSearch = useCallback(
        (searchTerm) => {
            if (!gridRef.current || !searchTerm) {
                resetSearch();
                return;
            }

            const api = gridRef.current.api;
            const matches = [];
            const searchTermLower = searchTerm.toLowerCase();
            api.forEachNode((node) => {
                const { message } = node.data;
                if (message?.toLowerCase().includes(searchTermLower)) {
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
        (direction) => {
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
