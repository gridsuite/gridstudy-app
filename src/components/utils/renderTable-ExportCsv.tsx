/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, RefObject } from 'react';
import { ColDef, GridReadyEvent, RowClassParams, RowDataUpdatedEvent, RowStyle } from 'ag-grid-community';
import { CustomAGGrid, CsvExport } from '@gridsuite/commons-ui';
import { AgGridReact } from 'ag-grid-react';
import { Box } from '@mui/material';
import { AGGRID_LOCALES } from '../../translations/not-intl/aggrid-locales';
import { useSelector } from 'react-redux';
import { AppState } from '../../redux/reducer';

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
    gridRef: RefObject<AgGridReact>;
    columns: any[];
    defaultColDef: ColDef;
    tableName: string;
    rows: any[];
    onRowDataUpdated: (event: RowDataUpdatedEvent) => void;
    onGridReady: ((event: GridReadyEvent) => void) | undefined;
    getRowStyle: (params: RowClassParams) => RowStyle | undefined;
    overlayNoRowsTemplate: string | undefined;
    skipColumnHeaders: boolean;
}

export const RenderTableAndExportCsv: FunctionComponent<RenderTableAndExportCsvProps> = ({
    gridRef,
    columns,
    defaultColDef,
    tableName,
    rows,
    onRowDataUpdated,
    onGridReady,
    getRowStyle,
    overlayNoRowsTemplate,
    skipColumnHeaders = false,
}) => {
    const isRowsEmpty = !rows || rows.length === 0;
    const language = useSelector((state: AppState) => state.computedLanguage);

    return (
        <Box sx={styles.gridContainer}>
            <Box sx={styles.csvExport}>
                <Box style={{ flexGrow: 1 }}></Box>
                <CsvExport
                    columns={columns}
                    tableName={tableName}
                    disabled={isRowsEmpty}
                    skipColumnHeaders={skipColumnHeaders}
                    language={language}
                    exportDataAsCsv={(params) => gridRef.current?.api?.exportDataAsCsv(params)}
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
                        onModelUpdated={({ api }) => {
                            if (api.getDisplayedRowCount()) {
                                api.hideOverlay();
                            } else {
                                api.showNoRowsOverlay();
                            }
                        }}
                        overrideLocales={AGGRID_LOCALES}
                    />
                </Box>
            )}
        </Box>
    );
};
