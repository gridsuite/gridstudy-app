/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { type RefObject, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { type SpreadsheetTabDefinition } from '../../types/spreadsheet.type';
import { AgGridReact } from 'ag-grid-react';
import { Grid } from '@mui/material';
import { type MuiStyles, snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import { ColumnsConfig } from './columns-config';
import ColumnCreationButton from './column-creation-button';
import SaveSpreadsheetButton from './save/save-spreadsheet-button';
import SpreadsheetGlobalFilter from './global-filter/spreadsheet-global-filter';
import { FilteredRowCounter } from '../../../utils/row-counter/filtered-row-counter';
import { UseFilteredRowCounterInfoReturn } from '../../../utils/row-counter/use-filtered-row-counter';
import { CustomColDef } from '../../../../types/custom-aggrid-types';
import { AppState } from '../../../../redux/reducer.type';
import { resetSpreadsheetColumnsFilters } from '../../../../services/study/study-config';

const styles = {
    toolbar: (theme) => ({
        marginTop: theme.spacing(2),
        alignItems: 'center',
    }),
    filterContainer: (theme) => ({
        marginLeft: theme.spacing(1),
        display: 'flex',
    }),
    save: (theme) => ({
        marginRight: theme.spacing(1),
    }),
} as const satisfies MuiStyles;

interface SpreadsheetToolbarProps {
    gridRef: RefObject<AgGridReact | null>;
    tableDefinition: SpreadsheetTabDefinition;
    rowCounterInfos: UseFilteredRowCounterInfoReturn;
    columns: CustomColDef[];
    disabled: boolean;
}

export const SpreadsheetToolbar = ({
    gridRef,
    tableDefinition,
    rowCounterInfos,
    columns,
    disabled,
}: SpreadsheetToolbarProps) => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const { snackError } = useSnackMessage();

    const handleResetFilters = useCallback(() => {
        if (studyUuid) {
            resetSpreadsheetColumnsFilters(studyUuid, tableDefinition.uuid).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'spreadsheet/reset_filters_error' });
            });
        }
    }, [snackError, studyUuid, tableDefinition.uuid]);

    return (
        <Grid container columnSpacing={2} sx={styles.toolbar}>
            <Grid sx={styles.filterContainer}>
                <SpreadsheetGlobalFilter tableDefinition={tableDefinition} />
            </Grid>
            <Grid>
                <FilteredRowCounter rowCounterInfos={rowCounterInfos} onResetFilters={handleResetFilters} />
            </Grid>
            <Grid>
                <ColumnsConfig
                    gridRef={gridRef}
                    tableDefinition={tableDefinition}
                    disabled={disabled || tableDefinition?.columns.length === 0}
                />
            </Grid>
            <Grid>
                <ColumnCreationButton tableDefinition={tableDefinition} disabled={disabled} />
            </Grid>
            <Grid sx={{ flexGrow: 1 }}></Grid>
            <Grid sx={styles.save}>
                <SaveSpreadsheetButton
                    tableDefinition={tableDefinition}
                    gridRef={gridRef}
                    columns={columns}
                    disabled={disabled}
                    dataSize={rowCounterInfos.displayedRows ?? 0}
                />
            </Grid>
        </Grid>
    );
};
