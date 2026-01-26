/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, RefObject, useCallback } from 'react';
import { ColDef, GridReadyEvent, RowClassParams, RowStyle } from 'ag-grid-community';
import { CustomAGGrid, CsvExport, type MuiStyles } from '@gridsuite/commons-ui';
import { AgGridReact } from 'ag-grid-react';
import { Box, LinearProgress } from '@mui/material';
import { AGGRID_LOCALES } from '../../translations/not-intl/aggrid-locales';
import { useSelector } from 'react-redux';
import { AppState } from '../../redux/reducer';
import { updateAgGridFilters } from '../custom-aggrid/custom-aggrid-filters/utils/aggrid-filters-utils';
import { FilterType as AgGridFilterType } from '../../types/custom-aggrid-types';

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
} as const satisfies MuiStyles;

interface RenderTableAndExportCsvProps {
    gridRef: RefObject<AgGridReact | null>;
    columns: any[];
    defaultColDef: ColDef;
    tableName: string;
    rows: any[];
    showLinearProgress?: boolean;
    getRowStyle?: (params: RowClassParams) => RowStyle | undefined;
    overlayNoRowsTemplate: string | undefined;
    skipColumnHeaders: boolean;
    computationType: AgGridFilterType;
    computationSubType: string;
}

export const RenderTableAndExportCsv: FunctionComponent<RenderTableAndExportCsvProps> = ({
    gridRef,
    columns,
    defaultColDef,
    tableName,
    rows,
    getRowStyle,
    overlayNoRowsTemplate,
    computationType,
    computationSubType,
    skipColumnHeaders = false,
    showLinearProgress = false,
}) => {
    const isRowsEmpty = !rows || rows.length === 0;
    const language = useSelector((state: AppState) => state.computedLanguage);
    const filters = useSelector(
        (state: AppState) => state.computationFilters?.[computationType]?.columnsFilters?.[computationSubType].columns
    );
    const onRowDataUpdated = useCallback((params: any) => {
        if (params.api) {
            params.api.sizeColumnsToFit();
        }
    }, []);
    const onGridReady = useCallback(
        ({ api }: GridReadyEvent) => {
            if (!api || !filters) return;
            updateAgGridFilters(api, filters);
            api?.sizeColumnsToFit();
        },
        [filters]
    );
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
                    getData={(params: any) => gridRef.current?.api?.exportDataAsCsv(params)}
                />
            </Box>

            {showLinearProgress && <LinearProgress sx={{ height: 4 }} />}

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
