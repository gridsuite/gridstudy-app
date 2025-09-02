/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo, type RefObject, useCallback, useEffect, useMemo, useState } from 'react';
import { useSpreadsheetEquipments } from './hooks/use-spreadsheet-equipments';
import { EquipmentTable } from './equipment-table';
import { type Identifiable } from '@gridsuite/commons-ui';
import { type CustomColDef } from 'components/custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { SpreadsheetEquipmentType, type SpreadsheetTabDefinition } from '../../types/spreadsheet.type';
import { type CurrentTreeNode } from 'components/graph/tree-node.type';
import { type AgGridReact } from 'ag-grid-react';
import { Alert, Box, type Theme } from '@mui/material';
import { useEquipmentModification } from './hooks/use-equipment-modification';
import { type NodeAlias } from '../../types/node-alias.type';
import { FormattedMessage } from 'react-intl';
import { useSpreadsheetGlobalFilter } from './hooks/use-spreadsheet-gs-filter';
import { useFilterSelector } from 'hooks/use-filter-selector';
import { FilterType } from 'types/custom-aggrid-types';
import { updateFilters } from 'components/custom-aggrid/custom-aggrid-filters/utils/aggrid-filters-utils';
import { useGridCalculations } from 'components/spreadsheet-view/spreadsheet/spreadsheet-content/hooks/use-grid-calculations';
import { useColumnManagement } from './hooks/use-column-management';
import { DiagramType } from 'components/grid-layout/cards/diagrams/diagram.type';
import { type RowDataUpdatedEvent } from 'ag-grid-community';

const styles = {
    table: (theme: Theme) => ({
        marginTop: theme.spacing(2.5),
        lineHeight: 'unset',
        flexGrow: 1,
        // Hide the vertical scrollbar for pinned bottom rows
        '.ag-floating-bottom.ag-selectable': {
            overflowY: 'hidden !important',
        },
    }),
    invalidNode: {
        position: 'absolute',
        top: '30%',
        left: '43%',
    },
};

interface RecursiveIdentifiable extends Identifiable {
    [alias: string]: Identifiable | string | undefined;
}

interface SpreadsheetContentProps {
    gridRef: RefObject<AgGridReact>;
    currentNode: CurrentTreeNode;
    tableDefinition: SpreadsheetTabDefinition;
    columns: CustomColDef[];
    nodeAliases: NodeAlias[] | undefined;
    disabled: boolean;
    equipmentId: string | null;
    onEquipmentScrolled: () => void;
    registerRowCounterEvents: (params: RowDataUpdatedEvent) => void;
    openDiagram?: (equipmentId: string, diagramType?: DiagramType.SUBSTATION | DiagramType.VOLTAGE_LEVEL) => void;
    active: boolean;
}

export const SpreadsheetContent = memo(
    ({
        gridRef,
        currentNode,
        tableDefinition,
        columns,
        nodeAliases,
        disabled,
        equipmentId,
        onEquipmentScrolled,
        registerRowCounterEvents,
        openDiagram,
        active,
    }: SpreadsheetContentProps) => {
        const [equipmentToUpdateId, setEquipmentToUpdateId] = useState<string | null>(null);
        const [isGridReady, setIsGridReady] = useState(false);

        const highlightUpdatedEquipment = useCallback(() => {
            if (!equipmentToUpdateId) {
                return;
            }

            const api = gridRef.current?.api;
            const rowNode = api?.getRowNode(equipmentToUpdateId);

            if (rowNode && api) {
                api.flashCells({
                    rowNodes: [rowNode],
                    flashDuration: 1000,
                });
                api.setNodesSelected({ nodes: [rowNode], newValue: false });
            }

            setEquipmentToUpdateId(null);
        }, [equipmentToUpdateId, gridRef]);

        // Only fetch when active
        const { equipments, isFetching } = useSpreadsheetEquipments(
            tableDefinition?.type,
            equipmentToUpdateId,
            highlightUpdatedEquipment,
            nodeAliases,
            active
        );

        const { onModelUpdated } = useGridCalculations(gridRef, tableDefinition.uuid, columns);

        const { updateSortConfig, updateLockedColumnsConfig, handleColumnDrag } = useColumnManagement(
            gridRef,
            tableDefinition
        );

        const { isExternalFilterPresent, doesFormulaFilteringPass } = useSpreadsheetGlobalFilter(
            gridRef,
            tableDefinition?.uuid,
            tableDefinition?.type
        );

        const { modificationDialog, handleOpenModificationDialog, isModificationDialogForEquipmentType } =
            useEquipmentModification({
                equipmentType: tableDefinition?.type,
            });

        const handleEquipmentScroll = useCallback(() => {
            if (equipmentId && gridRef.current?.api && isGridReady) {
                const selectedRow = gridRef.current.api.getRowNode(equipmentId);
                if (selectedRow) {
                    gridRef.current.api.ensureNodeVisible(selectedRow, 'top');
                    selectedRow.setSelected(true, true);
                    onEquipmentScrolled();
                }
            }
        }, [equipmentId, gridRef, isGridReady, onEquipmentScrolled]);

        useEffect(() => {
            handleEquipmentScroll();
        }, [handleEquipmentScroll, equipmentId]);

        const onFirstDataRendered = useCallback(() => {
            handleEquipmentScroll();
        }, [handleEquipmentScroll]);

        const onGridReady = useCallback(() => {
            updateLockedColumnsConfig();
            setIsGridReady(true);
        }, [updateLockedColumnsConfig]);

        const onRowDataUpdated = useCallback(
            (params: RowDataUpdatedEvent) => {
                registerRowCounterEvents(params);
            },
            [registerRowCounterEvents]
        );

        const transformedRowData = useMemo(() => {
            if (
                !nodeAliases ||
                !equipments?.nodesId.includes(currentNode.id) ||
                !equipments.equipmentsByNodeId[currentNode.id]
            ) {
                return undefined;
            }

            return equipments.equipmentsByNodeId[currentNode.id].map((equipment) => {
                let equipmentToAdd: RecursiveIdentifiable = { ...equipment };
                Object.entries(equipments.equipmentsByNodeId).forEach(([nodeId, nodeEquipments]) => {
                    let matchingEquipment = nodeEquipments.find((eq) => eq.id === equipment.id);
                    let nodeAlias = nodeAliases.find((value) => value.id === nodeId);
                    if (nodeAlias && matchingEquipment) {
                        equipmentToAdd[nodeAlias.alias] = matchingEquipment;
                    }
                });
                return equipmentToAdd;
            });
        }, [equipments, currentNode.id, nodeAliases]);

        useEffect(() => {
            if (gridRef.current?.api) {
                gridRef.current.api.setGridOption('rowData', transformedRowData);
            }
        }, [transformedRowData, gridRef, isGridReady]);

        const { filters } = useFilterSelector(FilterType.Spreadsheet, tableDefinition?.uuid);

        useEffect(() => {
            const api = gridRef.current?.api;
            if (!api || !isGridReady) {
                return;
            }

            updateSortConfig();
        }, [updateSortConfig, equipments, gridRef, isGridReady]);

        useEffect(() => {
            const api = gridRef.current?.api;
            if (!api || !isGridReady) {
                return;
            }
            updateFilters(api, filters);
        }, [filters, gridRef, isGridReady, equipments, tableDefinition?.columns]);

        const handleModify = useCallback(
            (equipmentId: string) => {
                setEquipmentToUpdateId(equipmentId);
                handleOpenModificationDialog(equipmentId);
            },
            [handleOpenModificationDialog]
        );

        const handleOpenDiagram = useCallback(
            (equipmentId: string) => {
                const diagramType =
                    tableDefinition?.type === SpreadsheetEquipmentType.SUBSTATION
                        ? DiagramType.SUBSTATION
                        : DiagramType.VOLTAGE_LEVEL;
                openDiagram?.(equipmentId, diagramType);
            },
            [openDiagram, tableDefinition?.type]
        );

        return (
            <>
                {disabled ? (
                    <Alert sx={styles.invalidNode} severity="warning">
                        <FormattedMessage id={'InvalidNode'} />
                    </Alert>
                ) : (
                    <Box sx={styles.table}>
                        <EquipmentTable
                            gridRef={gridRef}
                            rowData={transformedRowData}
                            currentNode={currentNode}
                            columnData={columns}
                            isFetching={isFetching}
                            isDataEditable={isModificationDialogForEquipmentType}
                            handleColumnDrag={handleColumnDrag}
                            isExternalFilterPresent={isExternalFilterPresent}
                            doesExternalFilterPass={doesFormulaFilteringPass}
                            onModelUpdated={onModelUpdated}
                            onFirstDataRendered={onFirstDataRendered}
                            onGridReady={onGridReady}
                            onRowDataUpdated={onRowDataUpdated}
                            handleModify={handleModify}
                            handleOpenDiagram={handleOpenDiagram}
                            equipmentType={tableDefinition?.type}
                        />
                    </Box>
                )}
                {modificationDialog}
            </>
        );
    }
);
