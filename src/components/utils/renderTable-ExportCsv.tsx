/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box } from '@mui/system';
import { CsvExport } from '../spreadsheet/export-csv';
import { CustomAGGrid } from '../custom-aggrid/custom-aggrid';
import React, { FunctionComponent, Ref } from 'react';
import {
    ColDef,
    RowDataUpdatedEvent,
    RowStyle,
} from 'ag-grid-community/dist/lib/main';
import { GridReadyEvent, RowClassParams } from 'ag-grid-community';

const styles = {
    gridContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    csvExport: {
        display: 'flex',
        alignItems: 'baseline',
        marginTop: '-45px',
    },
    grid: {
        flexGrow: '1',
    },
};

interface RenderTableAndExportCsvProps {
    gridRef: Ref<any> | undefined;
    columns: any[];
    defaultColDef: ColDef;
    tableName: string;
    rows: any[];
    onRowDataUpdated: (event: RowDataUpdatedEvent) => void;
    onGridReady: ((event: GridReadyEvent) => void) | undefined;
    getRowStyle: (params: RowClassParams) => RowStyle | undefined;
    enableCellTextSelection: boolean;
    overlayNoRowsTemplate: string | undefined;
    skipColumnHeaders: boolean;
}

export const RenderTableAndExportCsv: FunctionComponent<
    RenderTableAndExportCsvProps
> = ({
    gridRef,
    columns,
    defaultColDef,
    tableName,
    rows,
    onRowDataUpdated,
    onGridReady,
    getRowStyle,
    enableCellTextSelection,
    overlayNoRowsTemplate,
    skipColumnHeaders = false,
}) => {
    const isRowsEmpty = !rows || rows.length === 0;
    return (
        <Box sx={styles.gridContainer}>
            <Box sx={styles.csvExport}>
                <Box style={{ flexGrow: 1 }}></Box>
                <CsvExport
                    gridRef={gridRef}
                    columns={columns}
                    tableName={tableName}
                    disabled={isRowsEmpty}
                    skipColumnHeaders={skipColumnHeaders}
                />
            </Box>
            {rows && (
                <Box sx={styles.grid}>
                    <CustomAGGrid
                        ref={gridRef}
                        rowData={rows}
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
