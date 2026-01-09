/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo, useMemo, useRef } from 'react';
import { CustomColDef } from 'components/custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { rowIndexColumnDefinition } from '../columns/common-column-definitions';
import { SpreadsheetTabDefinition } from '../types/spreadsheet.type';
import { CurrentTreeNode } from 'components/graph/tree-node.type';
import { AgGridReact } from 'ag-grid-react';
import { SpreadsheetContent } from './spreadsheet-content/spreadsheet-content';
import { SpreadsheetToolbar } from './spreadsheet-toolbar/spreadsheet-toolbar';
import { mapColumns } from '../columns/utils/column-mapper';
import { useFilteredRowCounterInfo } from './spreadsheet-toolbar/row-counter/use-filtered-row-counter';
import type { UUID } from 'node:crypto';
import { useSnackMessage } from '@gridsuite/commons-ui';

interface SpreadsheetProps {
    panelId: UUID;
    currentNode: CurrentTreeNode;
    tableDefinition: SpreadsheetTabDefinition;
    disabled: boolean;
    active: boolean;
}

export const Spreadsheet = memo(({ panelId, currentNode, tableDefinition, disabled, active }: SpreadsheetProps) => {
    const gridRef = useRef<AgGridReact>(null);
    const { snackError } = useSnackMessage();

    const columnsDefinitions = useMemo(() => mapColumns(tableDefinition, snackError), [tableDefinition, snackError]);
    const rowCounterInfos = useFilteredRowCounterInfo({
        gridRef,
        tableDefinition,
        disabled,
    });

    const displayedColsDefs = useMemo(() => {
        const columns = tableDefinition?.columns;
        const visibleColDefs =
            columns?.map((column) => {
                return columnsDefinitions.reduce((acc, curr) => {
                    if (curr.colId === column.id) {
                        return curr;
                    }
                    return acc;
                }, {} as CustomColDef);
            }) || [];

        // Return row index column first, followed by visible columns
        // Pass the table UUID to the rowIndexColumnDefinition
        return [rowIndexColumnDefinition(tableDefinition?.uuid || ''), ...visibleColDefs];
    }, [columnsDefinitions, tableDefinition?.columns, tableDefinition?.uuid]);

    return (
        <>
            <SpreadsheetToolbar
                gridRef={gridRef}
                tableDefinition={tableDefinition}
                rowCounterInfos={rowCounterInfos}
                columns={displayedColsDefs}
                disabled={disabled}
            />

            <SpreadsheetContent
                panelId={panelId}
                gridRef={gridRef}
                currentNode={currentNode}
                tableDefinition={tableDefinition}
                columns={displayedColsDefs}
                disabled={disabled}
                registerRowCounterEvents={rowCounterInfos.registerRowCounterEvents}
                active={active}
            />
        </>
    );
});
