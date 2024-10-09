/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { memo, useCallback, useEffect, useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { CustomAGGrid } from '@gridsuite/commons-ui';
import { useTheme } from '@mui/material/styles';
import { setLogsFilter } from '../../redux/actions';
import { makeAgGridCustomHeaderColumn } from 'components/custom-aggrid/custom-aggrid-header-utils';
import { FILTER_DATA_TYPES, FILTER_TEXT_COMPARATORS } from 'components/custom-aggrid/custom-aggrid-header.type';
import { DefaultCellRenderer } from 'components/spreadsheet/utils/cell-renderers';
import { getColumnValue, useAggridRowFilter } from 'hooks/use-aggrid-row-filter';
import { LOGS_STORE_FIELD } from 'utils/store-sort-filter-fields';
import { useReportFetcher } from 'hooks/use-report-fetcher';
import { useDispatch } from 'react-redux';
import { getDefaultSeverityFilter } from 'utils/report-severity.utils';

// WARNING this file has been copied from commons-ui, and updated here. Putting it back to commons-ui has to be discussed.

const SEVERITY_COLUMN_FIXED_WIDTH = 115;

const LogTable = ({ selectedReportId, reportType, reportNature, severities, onRowClick }) => {
    const intl = useIntl();

    const theme = useTheme();

    const [logs, setLogs] = useState([]);

    const dispatch = useDispatch();

    const [, , fetchReportLogs] = useReportFetcher(reportType);
    const { updateFilter, filterSelector } = useAggridRowFilter({
        filterType: LOGS_STORE_FIELD,
        filterTab: reportType,
        filterStoreAction: setLogsFilter,
    });

    const [selectedRowIndex, setSelectedRowIndex] = useState(-1);
    const [rowData, setRowData] = useState(null);

    // initialize the filter with the severities
    useEffect(() => {
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
    }, [dispatch, filterSelector.length, reportType, severities]);

    const severityList = useMemo(() => getColumnValue(filterSelector, 'severity') ?? [], [filterSelector]);
    const messageFilter = useMemo(() => getColumnValue(filterSelector, 'message'), [filterSelector]);

    const refreshLogsOnSelectedReport = useCallback(() => {
        if (severityList?.length === 0) {
            setLogs([]);
            return;
        }
        fetchReportLogs(selectedReportId, severityList, reportNature, messageFilter).then((reportLogs) => {
            setLogs(reportLogs);
        });
    }, [fetchReportLogs, messageFilter, reportNature, severityList, selectedReportId]);

    useEffect(() => {
        if (selectedReportId && reportNature) {
            refreshLogsOnSelectedReport();
        }
    }, [selectedReportId, refreshLogsOnSelectedReport, reportNature]);

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
                cellRenderer: DefaultCellRenderer,
            }),
        ],
        [intl, updateFilter, filterSelector, severities]
    );

    const generateTableRows = useCallback(() => {
        return logs
            ? logs.map((log) => ({
                  severity: log.severity.name,
                  message: log.message,
                  parentId: log.parentId,
                  backgroundColor: log.severity.colorName,
              }))
            : [];
    }, [logs]);

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
        [selectedRowIndex, theme]
    );

    useEffect(() => {
        setSelectedRowIndex(-1);
        setRowData(generateTableRows());
    }, [generateTableRows, logs]);

    const onGridReady = ({ api }) => {
        api?.sizeColumnsToFit();
    };

    const defaultColumnDefinition = {
        sortable: false,
        resizable: false,
        suppressMovable: true,
    };

    return (
        <CustomAGGrid
            columnDefs={COLUMNS_DEFINITIONS}
            rowData={rowData}
            onCellClicked={handleRowClick}
            getRowStyle={rowStyleFormat}
            onGridReady={onGridReady}
            defaultColDef={defaultColumnDefinition}
        />
    );
};

export default memo(LogTable);
