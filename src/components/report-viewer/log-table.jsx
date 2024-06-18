/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { memo, useEffect, useState, useCallback } from 'react';
import { useIntl } from 'react-intl';
import TableCell from '@mui/material/TableCell';
import { useTheme } from '@mui/material/styles';
import { CustomAGGrid } from '../custom-aggrid/custom-aggrid';
import { makeAgGridCustomHeaderColumn } from '../custom-aggrid/custom-aggrid-header-utils';
import { FILTER_DATA_TYPES } from '../custom-aggrid/custom-aggrid-header.type';

// WARNING this file has been copied from commons-ui, and updated here. Putting it back to commons-ui has to be discussed.

const SEVERITY_COLUMN_FIXED_WIDTH = 115;

const styles = {
    flexContainer: {
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
    },
    table: (theme) => ({
        // temporary right-to-left patch, waiting for
        // https://github.com/bvaughn/react-virtualized/issues/454
        '& .ReactVirtualized__Table__headerRow': {
            flip: false,
            paddingRight:
                theme.direction === 'rtl' ? '0 !important' : undefined,
        },
    }),
    header: { variant: 'header' },
};

const LogTable = ({
    logs,
    onRowClick,
    selectedSeverity,
    setSelectedSeverity,
}) => {
    const intl = useIntl();

    const theme = useTheme();

    const [selectedRowIndex, setSelectedRowIndex] = useState(-1);
    const [rowData, setRowData] = useState(null);

    const [filterWrapperData, setFilterWrapperData] = useState([
        ...Object.keys(selectedSeverity),
    ]);

    useEffect(() => {
        setFilterWrapperData([...Object.keys(selectedSeverity)]);
    }, [selectedSeverity]);

    //TODO Externalize and tweak renderer to fit TableCell to cell borders
    const severityCellRender = (cellData) => {
        return (
            <TableCell
                component="div"
                variant="body"
                style={{
                    display: 'flex',
                    flex: '1',
                    backgroundColor: cellData.data.backgroundColor,
                }}
                align="center"
            >
                {cellData.data.severity}
            </TableCell>
        );
    };

    const formatUpdateFilter = useCallback(
        (field, data) => {
            setSelectedSeverity(
                data.value.reduce((a, v) => ({ ...a, [v]: true }), {})
            );
        },
        [setSelectedSeverity]
    );

    const COLUMNS_DEFINITIONS = [
        /*
<FilterButton
selectedItems={selectedSeverity}
setSelectedItems={setSelectedSeverity}
/>
*/
        makeAgGridCustomHeaderColumn({
            headerName: intl.formatMessage({ id: 'report_viewer/severity' }),
            width: SEVERITY_COLUMN_FIXED_WIDTH,
            field: 'severity',
            filterProps: {
                updateFilter: formatUpdateFilter,
                filterSelector: filterWrapperData,
            },
            filterParams: {
                filterDataType: FILTER_DATA_TYPES.TEXT,
                filterEnums: {
                    severity: filterWrapperData,
                },
            },
            cellRenderer: severityCellRender,
        }),
        {
            label: intl
                .formatMessage({ id: 'report_viewer/message' })
                .toUpperCase(),
            field: 'message',
        },
    ];

    const generateTableColumns = () => {
        return Object.values(COLUMNS_DEFINITIONS).map((c) => {
            return c;
        });
    };

    const generateTableRows = useCallback(() => {
        return !logs
            ? []
            : logs.map((log) => {
                  return {
                      severity: log.getSeverityName(),
                      message: log.getLog(),
                      backgroundColor: log.getColorName(),
                      reportId: log.getReportId(),
                  };
              });
    }, [logs]);

    const handleRowClick = (row) => {
        setSelectedRowIndex(row.rowIndex);
        onRowClick(row.data);
    };

    const rowStyleFormat = (row) => {
        const styles = {};
        if (row.rowIndex < 0) {
            return styles;
        }
        if (selectedRowIndex === row.rowIndex) {
            return {
                backgroundColor: theme.palette.action.selected,
            };
        }
        return styles;
    };

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
        //TODO do we need to useMemo/useCallback these props to avoid rerenders ?
        <CustomAGGrid
            columnDefs={generateTableColumns()}
            rowData={rowData}
            onCellClicked={handleRowClick}
            getRowStyle={rowStyleFormat}
            onGridReady={onGridReady}
            defaultColDef={defaultColumnDefinition}
        />
    );
};

export default memo(LogTable);
