/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { RefObject } from 'react';
import { CustomColDef } from 'components/custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { SpreadsheetEquipmentType, type SpreadsheetTabDefinition } from '../../types/spreadsheet.type';
import { AgGridReact } from 'ag-grid-react';
import { Grid, Theme } from '@mui/material';
import { ColumnsConfig } from './columns-config';
import ColumnCreationButton from './column-creation-button';
import { NodeAlias } from 'components/spreadsheet-view/types/node-alias.type';
import SaveSpreadsheetButton from './save/save-spreadsheet-button';
import SpreadsheetGlobalFilter from './global-filter/spreadsheet-global-filter';
import { FilteredRowCounter } from './row-counter/filtered-row-counter';
import { UseFilteredRowCounterInfoReturn } from './row-counter/use-filtered-row-counter';

const styles = {
    toolbar: (theme: Theme) => ({
        marginTop: theme.spacing(2),
        alignItems: 'center',
    }),
    filterContainer: (theme: Theme) => ({
        marginLeft: theme.spacing(1),
        display: 'flex',
    }),
    save: (theme: Theme) => ({
        marginRight: theme.spacing(1),
    }),
};

interface SpreadsheetToolbarProps {
    gridRef: RefObject<AgGridReact>;
    tableDefinition: SpreadsheetTabDefinition;
    rowCounterInfos: UseFilteredRowCounterInfoReturn;
    columns: CustomColDef[];
    nodeAliases: NodeAlias[] | undefined;
    disabled: boolean;
}

export const SpreadsheetToolbar = ({
    gridRef,
    tableDefinition,
    rowCounterInfos,
    columns,
    nodeAliases,
    disabled,
}: SpreadsheetToolbarProps) => {
    return (
        <Grid container columnSpacing={2} sx={styles.toolbar}>
            <Grid item sx={styles.filterContainer}>
                {tableDefinition.type !== SpreadsheetEquipmentType.BRANCH && (
                    <SpreadsheetGlobalFilter tableDefinition={tableDefinition} />
                )}
            </Grid>
            <Grid item>
                <FilteredRowCounter rowCounterInfos={rowCounterInfos} tableDefinition={tableDefinition} />
            </Grid>
            <Grid item>
                <ColumnsConfig
                    gridRef={gridRef}
                    tableDefinition={tableDefinition}
                    disabled={disabled || tableDefinition?.columns.length === 0}
                />
            </Grid>
            <Grid item>
                <ColumnCreationButton tableDefinition={tableDefinition} disabled={disabled} />
            </Grid>
            <Grid item sx={{ flexGrow: 1 }}></Grid>
            <Grid item sx={styles.save}>
                <SaveSpreadsheetButton
                    tableDefinition={tableDefinition}
                    gridRef={gridRef}
                    columns={columns}
                    disabled={disabled}
                    nodeAliases={nodeAliases}
                />
            </Grid>
        </Grid>
    );
};
