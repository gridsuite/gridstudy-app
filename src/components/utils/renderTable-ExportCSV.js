/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box } from '@mui/system';
import { CsvExport } from '../spreadsheet/export-csv';
import { CustomAGGrid } from '../custom-aggrid/custom-aggrid';
import React from 'react';

const styles = {
    gridContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    csvExport: {
        display: 'flex',
        alignItems: 'baseline',
    },
    grid: {
        flexGrow: '1',
    },
};

export const RenderTableAndExportCSV = ({
    gridRef,
    columns,
    defaultColDef,
    tableName,
    rows,
    onRowDataUpdated,
    headerHeight,
    onGridReady,
    getRowStyle,
    enableCellTextSelection,
    overlayNoRowsTemplate,
    skipColumnHeaders,
}) => {
    return (
        <Box sx={styles.gridContainer}>
            <Box sx={styles.csvExport}>
                <Box style={{ flexGrow: 1 }}></Box>
                <CsvExport
                    gridRef={gridRef}
                    columns={columns}
                    tableName={tableName}
                    disabled={!rows || rows.length === 0}
                    skipColumnHeaders={skipColumnHeaders}
                />
            </Box>
            {rows && (
                <Box sx={styles.grid}>
                    <CustomAGGrid
                        ref={gridRef}
                        rowData={rows}
                        headerHeight={headerHeight}
                        defaultColDef={defaultColDef}
                        columnDefs={columns}
                        onRowDataUpdated={onRowDataUpdated}
                        onGridReady={onGridReady}
                        getRowStyle={getRowStyle}
                        overlayNoRowsTemplate={overlayNoRowsTemplate}
                        enableCellTextSelection={enableCellTextSelection}
                    />
                </Box>
            )}
        </Box>
    );
};
