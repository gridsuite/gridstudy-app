/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useMemo, useRef } from 'react';
import { useCustomColumn } from './custom-columns/use-custom-column';
import { CustomColDef } from 'components/custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { rowIndexColumnDefinition } from './config/common-column-definitions';
import { SpreadsheetTabDefinition } from './config/spreadsheet.type';
import { CurrentTreeNode } from 'components/graph/tree-node.type';
import { AgGridReact } from 'ag-grid-react';
import { SpreadsheetTabContent } from './spreadsheet-tab-content';
import { SpreadsheetTabToolbar } from './spreadsheet-tab-toolbar';
import { NodeAlias } from './custom-columns/node-alias.type';

interface SpreadsheetTabProps {
    currentNode: CurrentTreeNode;
    tableDefinition: SpreadsheetTabDefinition;
    shouldDisableButtons: boolean;
    disabled: boolean;
    nodeAliases: NodeAlias[] | undefined;
    updateNodeAliases: (nodeAliases: NodeAlias[]) => void;
    equipmentId: string | null;
    onEquipmentScrolled: () => void;
    active: boolean;
}

export const SpreadsheetTab = React.memo(
    ({
        currentNode,
        tableDefinition,
        shouldDisableButtons,
        disabled,
        nodeAliases,
        updateNodeAliases,
        equipmentId,
        onEquipmentScrolled,
        active,
    }: SpreadsheetTabProps) => {
        const gridRef = useRef<AgGridReact>(null);

        const columnsDefinitions = useCustomColumn(tableDefinition);

        const displayedColsDefs = useMemo(() => {
            const columns = tableDefinition?.columns?.filter((column) => column.visible);
            const visibleColDefs =
                columns?.map((column) => {
                    const colDef = columnsDefinitions.reduce((acc, curr) => {
                        if (curr.colId === column.id) {
                            return curr;
                        }
                        return acc;
                    }, {} as CustomColDef);
                    return colDef;
                }) || [];

            // Return row index column first, followed by visible columns
            // Pass the table UUID to the rowIndexColumnDefinition
            return [rowIndexColumnDefinition(tableDefinition?.uuid || ''), ...visibleColDefs];
        }, [columnsDefinitions, tableDefinition?.columns, tableDefinition?.uuid]);

        return (
            <>
                <SpreadsheetTabToolbar
                    gridRef={gridRef}
                    tableDefinition={tableDefinition}
                    columns={displayedColsDefs}
                    nodeAliases={nodeAliases}
                    updateNodeAliases={updateNodeAliases}
                    shouldDisableButtons={shouldDisableButtons}
                    disabled={disabled}
                />

                <SpreadsheetTabContent
                    gridRef={gridRef}
                    currentNode={currentNode}
                    tableDefinition={tableDefinition}
                    columns={displayedColsDefs}
                    nodeAliases={nodeAliases}
                    shouldDisableButtons={shouldDisableButtons}
                    disabled={disabled}
                    equipmentId={equipmentId}
                    onEquipmentScrolled={onEquipmentScrolled}
                    active={active}
                />
            </>
        );
    }
);
