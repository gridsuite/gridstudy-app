/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { memo, useCallback, useEffect, useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { CustomAGGrid } from '@gridsuite/commons-ui';
import { useTheme } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { useDebounce } from 'use-debounce';
import { setReportFilters } from '../../redux/actions';
import { makeAgGridCustomHeaderColumn } from 'components/custom-aggrid/custom-aggrid-header-utils';
import { FILTER_DATA_TYPES, FILTER_TEXT_COMPARATORS } from 'components/custom-aggrid/custom-aggrid-header.type';
import { DefaultCellRenderer } from 'components/spreadsheet/utils/cell-renderers';

// WARNING this file has been copied from commons-ui, and updated here. Putting it back to commons-ui has to be discussed.

const SEVERITY_COLUMN_FIXED_WIDTH = 115;

const LogTable = ({ logs, onRowClick }) => {
    const intl = useIntl();

    const theme = useTheme();

    const dispatch = useDispatch();

    const [selectedRowIndex, setSelectedRowIndex] = useState(-1);
    const [rowData, setRowData] = useState(null);

    const severityFilter = useSelector((state) => state.reportSeverityFilter);
    const messageFilter = useSelector((state) => state.reportMessageFilter);
    const resetFilters = useSelector((state) => state.reportResetFilters);

    const [resetSeverityFilter, setResetSeverityFilter] = useState(null);
    const [resetMessageFilter, setResetMessageFilter] = useState(null);

    const [debouncedMessageFilter] = useDebounce(messageFilter, 500);

    const filterWrapperData = useMemo(() => Object.keys(severityFilter), [severityFilter]);

    const defaultSeverityFilter = useMemo(() => {
        // return only severity that have true as value
        return Object.keys(severityFilter).filter((severity) => severityFilter[severity]);
    }, [severityFilter]);

    const handleResetFilter = useCallback(() => {
        if (resetFilters) {
            if (resetSeverityFilter) {
                resetSeverityFilter(defaultSeverityFilter);
            }
            if (resetMessageFilter) {
                resetMessageFilter('');
            }
            dispatch(setReportFilters(undefined, undefined, undefined, false));
        }
    }, [defaultSeverityFilter, resetFilters, resetSeverityFilter, resetMessageFilter, dispatch]);

    useEffect(() => {
        handleResetFilter();
    }, [handleResetFilter]);

    useEffect(() => {
        dispatch(setReportFilters(undefined, debouncedMessageFilter, undefined));
    }, [debouncedMessageFilter, dispatch]);

    const setSeverityFilter = useCallback(
        (selectedSeverity) => {
            dispatch(setReportFilters(undefined, undefined, selectedSeverity));
        },
        [dispatch]
    );

    const formatUpdateFilter = useCallback(
        (field, data) => {
            const filterConfig = {};
            Object.keys(severityFilter).forEach((severity) => {
                filterConfig[severity] = !!data.value.includes(severity);
            });
            setSeverityFilter(filterConfig);
        },
        [severityFilter, setSeverityFilter]
    );

    const updateMessageFilter = useCallback(
        (field, data) => {
            dispatch(setReportFilters(undefined, data.value, undefined));
        },
        [dispatch]
    );

    const COLUMNS_DEFINITIONS = useMemo(
        () => [
            makeAgGridCustomHeaderColumn({
                headerName: intl.formatMessage({ id: 'report_viewer/severity' }),
                width: SEVERITY_COLUMN_FIXED_WIDTH,
                field: 'severity',
                filterProps: {
                    updateFilter: formatUpdateFilter,
                },
                filterParams: {
                    filterDataType: FILTER_DATA_TYPES.TEXT,
                    filterEnums: {
                        severity: filterWrapperData,
                    },
                },
                defaultFilterValue: defaultSeverityFilter,
                onResetFilter: (resetFilter) => {
                    setResetSeverityFilter(() => resetFilter);
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
                    updateFilter: updateMessageFilter,
                },
                filterParams: {
                    filterDataType: FILTER_DATA_TYPES.TEXT,
                    filterComparators: [FILTER_TEXT_COMPARATORS.CONTAINS],
                },
                defaultFilterValue: '',
                onResetFilter: (resetFilter) => {
                    setResetMessageFilter(() => resetFilter);
                },
                flex: 1,
                cellRenderer: DefaultCellRenderer,
            }),
        ],
        [intl, formatUpdateFilter, filterWrapperData, defaultSeverityFilter, updateMessageFilter]
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
