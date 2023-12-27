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
import { Grid } from '@mui/material';

const styles = {
    csvExport: {
        display: 'flex',
        alignItems: 'center',
    },
};

interface RenderTableAndExportCsvProps {
    gridRef: Ref<any> | undefined;
    columns: any[];
    defaultColDef: ColDef<any>;
    tableName: string;
    rows: any[];
    onRowDataUpdated: (event: RowDataUpdatedEvent<any, any>) => void;
    headerHeight: number;
    onGridReady: ((event: GridReadyEvent<any, any>) => void) | undefined;
    getRowStyle: (params: RowClassParams<any, any>) => RowStyle | undefined;
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
    headerHeight,
    onGridReady,
    getRowStyle,
    enableCellTextSelection,
    overlayNoRowsTemplate,
    skipColumnHeaders = false,
}) => {
    return (
        <Grid>
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
                <Grid>
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
                </Grid>
            )}
        </Grid>
    );
};
