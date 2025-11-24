/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo, useMemo, useRef } from 'react';
import { CustomColDef } from '@gridsuite/commons-ui';
import { rowIndexColumnDefinition } from '../columns/common-column-definitions';
import { SpreadsheetTabDefinition } from '../types/spreadsheet.type';
import { CurrentTreeNode } from 'components/graph/tree-node.type';
import { AgGridReact } from 'ag-grid-react';
import { SpreadsheetContent } from './spreadsheet-content/spreadsheet-content';
import { SpreadsheetToolbar } from './spreadsheet-toolbar/spreadsheet-toolbar';
import { mapColumns } from '../columns/utils/column-mapper';
import { DiagramType } from 'components/grid-layout/cards/diagrams/diagram.type';
import { useFilteredRowCounterInfo } from './spreadsheet-toolbar/row-counter/use-filtered-row-counter';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import type { AppDispatch } from 'redux/store';
import { setCalculationSelections } from 'redux/actions';

interface SpreadsheetProps {
    currentNode: CurrentTreeNode;
    tableDefinition: SpreadsheetTabDefinition;
    disabled: boolean;
    equipmentId: string | null;
    onEquipmentScrolled: () => void;
    openDiagram?: (equipmentId: string, diagramType?: DiagramType.SUBSTATION | DiagramType.VOLTAGE_LEVEL) => void;
    active: boolean;
}

export const Spreadsheet = memo(
    ({
        currentNode,
        tableDefinition,
        disabled,
        equipmentId,
        onEquipmentScrolled,
        openDiagram,
        active,
    }: SpreadsheetProps) => {
        const gridRef = useRef<AgGridReact>(null);
        const dispatch = useDispatch<AppDispatch>();
        const calculationSelectionsMap = useSelector((state: AppState) => state.calculationSelections);

        const columnsDefinitions = useMemo(() => mapColumns(tableDefinition), [tableDefinition]);
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
            // Pass the table UUID and Redux-backed callbacks to the RowIndex renderer
            return [
                rowIndexColumnDefinition(tableDefinition?.uuid || '', {
                    getCalculationSelections: (tabUuid: string) => calculationSelectionsMap?.[tabUuid] || [],
                    setCalculationSelections: (tabUuid: string, selections: string[]) =>
                        dispatch(setCalculationSelections(tabUuid as any, selections)),
                }),
                ...visibleColDefs,
            ];
        }, [
            columnsDefinitions,
            tableDefinition?.columns,
            tableDefinition?.uuid,
            calculationSelectionsMap,
            dispatch,
        ]);

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
                    gridRef={gridRef}
                    currentNode={currentNode}
                    tableDefinition={tableDefinition}
                    columns={displayedColsDefs}
                    disabled={disabled}
                    equipmentId={equipmentId}
                    onEquipmentScrolled={onEquipmentScrolled}
                    registerRowCounterEvents={rowCounterInfos.registerRowCounterEvents}
                    openDiagram={openDiagram}
                    active={active}
                />
            </>
        );
    }
);
