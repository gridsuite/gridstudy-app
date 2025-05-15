/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useMemo, useRef } from 'react';
import { CustomColDef } from 'components/custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { rowIndexColumnDefinition } from '../columns/common-column-definitions';
import { SpreadsheetTabDefinition } from '../types/spreadsheet.type';
import { CurrentTreeNode } from 'components/graph/tree-node.type';
import { AgGridReact } from 'ag-grid-react';
import { SpreadsheetContent } from './spreadsheet-content/spreadsheet-content';
import { SpreadsheetToolbar } from './spreadsheet-toolbar/spreadsheet-toolbar';
import { NodeAlias } from '../types/node-alias.type';
import { mapColumns } from '../columns/utils/column-mapper';

interface SpreadsheetProps {
    currentNode: CurrentTreeNode;
    tableDefinition: SpreadsheetTabDefinition;
    disabled: boolean;
    nodeAliases: NodeAlias[] | undefined;
    updateNodeAliases: (nodeAliases: NodeAlias[]) => void;
    equipmentId: string | null;
    onEquipmentScrolled: () => void;
    active: boolean;
}

export const Spreadsheet = React.memo(
    ({
        currentNode,
        tableDefinition,
        disabled,
        nodeAliases,
        updateNodeAliases,
        equipmentId,
        onEquipmentScrolled,
        active,
    }: SpreadsheetProps) => {
        const gridRef = useRef<AgGridReact>(null);

        const columnsDefinitions = useMemo(() => mapColumns(tableDefinition), [tableDefinition]);

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
                    columns={displayedColsDefs}
                    nodeAliases={nodeAliases}
                    updateNodeAliases={updateNodeAliases}
                    disabled={disabled}
                />

                <SpreadsheetContent
                    gridRef={gridRef}
                    currentNode={currentNode}
                    tableDefinition={tableDefinition}
                    columns={displayedColsDefs}
                    nodeAliases={nodeAliases}
                    disabled={disabled}
                    equipmentId={equipmentId}
                    onEquipmentScrolled={onEquipmentScrolled}
                    active={active}
                />
            </>
        );
    }
);
