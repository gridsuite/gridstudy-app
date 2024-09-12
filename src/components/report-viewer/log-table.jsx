/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { memo, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import TableCell from '@mui/material/TableCell';
import { styled } from '@mui/system';
import { MuiVirtualizedTable } from '@gridsuite/commons-ui';
import { useTheme } from '@mui/material/styles';
import { FilterButton } from './filter-button';
import { TextFilterButton } from './text-filter-button.jsx';

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
            paddingRight: theme.direction === 'rtl' ? '0 !important' : undefined,
        },
    }),
    header: { variant: 'header' },
};

const VirtualizedTable = styled(MuiVirtualizedTable)(styles);

const LogTable = ({ logs, onRowClick, selectedSeverity, setSelectedSeverity, messageFilter, setMessageFilter }) => {
    const intl = useIntl();

    const theme = useTheme();

    const [selectedRowIndex, setSelectedRowIndex] = useState(-1);

    const severityCellRender = (cellData) => {
        return (
            <TableCell
                component="div"
                variant="body"
                style={{
                    display: 'flex',
                    flex: '1',
                    backgroundColor: cellData.rowData.backgroundColor,
                }}
                align="center"
            >
                {cellData.rowData.severity}
            </TableCell>
        );
    };

    const COLUMNS_DEFINITIONS = [
        {
            label: intl.formatMessage({ id: 'report_viewer/severity' }).toUpperCase(),
            id: 'severity',
            dataKey: 'severity',
            maxWidth: SEVERITY_COLUMN_FIXED_WIDTH,
            minWidth: SEVERITY_COLUMN_FIXED_WIDTH,
            cellRenderer: severityCellRender,
            extra: <FilterButton selectedItems={selectedSeverity} setSelectedItems={setSelectedSeverity} />,
        },
        {
            label: intl.formatMessage({ id: 'report_viewer/message' }).toUpperCase(),
            id: 'message',
            dataKey: 'message',
            extra: <TextFilterButton filterText={messageFilter} setFilterText={setMessageFilter} />,
        },
    ];

    const generateTableColumns = () => {
        return Object.values(COLUMNS_DEFINITIONS).map((c) => {
            return c;
        });
    };

    const generateTableRows = () => {
        return !logs
            ? []
            : logs.map((log) => {
                  return {
                      severity: log.severity.name,
                      message: log.message,
                      parentId: log.parentId,
                      backgroundColor: log.severity.colorName,
                  };
              });
    };

    const handleRowClick = (event) => {
        setSelectedRowIndex(event.index);
        onRowClick(event.rowData);
    };

    const rowStyleFormat = (row) => {
        if (row.index < 0) {
            return;
        }
        if (selectedRowIndex === row.index) {
            return {
                backgroundColor: theme.palette.action.selected,
            };
        }
    };

    useEffect(() => {
        setSelectedRowIndex(-1);
    }, [logs]);

    return (
        //TODO do we need to useMemo/useCallback these props to avoid rerenders ?
        <VirtualizedTable
            columns={generateTableColumns()}
            rows={generateTableRows()}
            sortable={false}
            onRowClick={handleRowClick}
            rowStyle={rowStyleFormat}
        />
    );
};

export default memo(LogTable);
