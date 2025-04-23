/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomColDef } from 'components/custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { SpreadsheetTabDefinition } from './config/spreadsheet.type';
import { AgGridReact } from 'ag-grid-react';
import { Grid, Theme } from '@mui/material';
import SpreadsheetSave from './spreadsheet-save';
import { NodeAlias } from './custom-columns/node-alias.type';
import SpreadsheetGsFilter from './spreadsheet-gs-filter';
import { ColumnsConfig } from './columns-config';
import CustomColumnsConfig from './custom-columns/custom-columns-config';
import CustomColumnsNodesConfig from './custom-columns/custom-columns-nodes-config';

const styles = {
    toolbar: (theme: Theme) => ({
        marginTop: theme.spacing(2),
        alignItems: 'center',
    }),
    selectColumns: (theme: Theme) => ({
        marginLeft: theme.spacing(1),
    }),
    save: (theme: Theme) => ({
        marginRight: theme.spacing(1),
    }),
};

interface SpreadsheetTabContentProps {
    gridRef: React.RefObject<AgGridReact>;
    tableDefinition: SpreadsheetTabDefinition;
    columns: CustomColDef[];
    nodeAliases: NodeAlias[] | undefined;
    updateNodeAliases: (nodeAliases: NodeAlias[]) => void;
    shouldDisableButtons: boolean;
    disabled: boolean;
}

export const SpreadsheetTabToolbar = ({
    gridRef,
    tableDefinition,
    columns,
    nodeAliases,
    updateNodeAliases,
    shouldDisableButtons,
    disabled,
}: SpreadsheetTabContentProps) => {
    return (
        <Grid container columnSpacing={2} sx={styles.toolbar}>
            <Grid item sx={styles.selectColumns}>
                <SpreadsheetGsFilter equipmentType={tableDefinition?.type} uuid={tableDefinition?.uuid} />
            </Grid>
            <Grid item>
                <ColumnsConfig
                    tableDefinition={tableDefinition}
                    disabled={shouldDisableButtons || tableDefinition?.columns.length === 0}
                />
            </Grid>
            <Grid item>
                <CustomColumnsConfig tableDefinition={tableDefinition} disabled={shouldDisableButtons} />
            </Grid>
            <Grid item>
                <CustomColumnsNodesConfig
                    disabled={disabled}
                    tableType={tableDefinition?.type}
                    nodeAliases={nodeAliases}
                    updateNodeAliases={updateNodeAliases}
                />
            </Grid>
            <Grid item sx={{ flexGrow: 1 }}></Grid>
            <Grid item sx={styles.save}>
                <SpreadsheetSave
                    tableDefinition={tableDefinition}
                    gridRef={gridRef}
                    columns={columns}
                    disabled={shouldDisableButtons}
                    nodeAliases={nodeAliases}
                />
            </Grid>
        </Grid>
    );
};
