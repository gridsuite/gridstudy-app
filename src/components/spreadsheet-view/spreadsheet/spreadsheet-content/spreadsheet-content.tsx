/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { memo, type RefObject, useCallback, useEffect, useMemo, useState } from 'react';
import { EquipmentTable } from './equipment-table';
import { type Identifiable, type MuiStyles } from '@gridsuite/commons-ui';
import { type CustomColDef } from 'components/custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { SpreadsheetEquipmentType, type SpreadsheetTabDefinition } from '../../types/spreadsheet.type';
import { type CurrentTreeNode } from 'components/graph/tree-node.type';
import { type AgGridReact } from 'ag-grid-react';
import { Alert, Box } from '@mui/material';
import { useEquipmentModification } from './hooks/use-equipment-modification';
import { FormattedMessage } from 'react-intl';
import { useSpreadsheetGlobalFilter } from './hooks/use-spreadsheet-gs-filter';
import { FilterType } from 'types/custom-aggrid-types';
import { updateFilters } from 'components/custom-aggrid/custom-aggrid-filters/utils/aggrid-filters-utils';
import { useGridCalculations } from 'components/spreadsheet-view/spreadsheet/spreadsheet-content/hooks/use-grid-calculations';
import { useColumnManagement } from './hooks/use-column-management';
import { DiagramType } from 'components/grid-layout/cards/diagrams/diagram.type';
import { type RowDataUpdatedEvent } from 'ag-grid-community';
import { useNodeAliases } from '../../hooks/use-node-aliases';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from '../../../../redux/reducer';
import { useFetchEquipment } from '../../hooks/use-fetch-equipment';
import { openSLD, updatePanelMetadata } from '../../../../redux/slices/workspace-slice';
import type { UUID } from 'node:crypto';
import { useComputationFilters } from '../../../../hooks/use-computation-result-filters';

const styles = {
    table: (theme) => ({
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
} as const satisfies MuiStyles;

interface SpreadsheetContentProps {
    panelId: UUID;
    gridRef: RefObject<AgGridReact>;
    currentNode: CurrentTreeNode;
    tableDefinition: SpreadsheetTabDefinition;
    columns: CustomColDef[];
    disabled: boolean;
    equipmentId: string | null;
    registerRowCounterEvents: (params: RowDataUpdatedEvent) => void;
    active: boolean;
}

export const SpreadsheetContent = memo(
    ({
        panelId,
        gridRef,
        currentNode,
        tableDefinition,
        columns,
        disabled,
        equipmentId,
        registerRowCounterEvents,
        active,
    }: SpreadsheetContentProps) => {
        const [isGridReady, setIsGridReady] = useState(false);
        const { nodeAliases } = useNodeAliases();
        const equipments = useSelector((state: AppState) => state.spreadsheetNetwork.equipments[tableDefinition?.type]);
        const nodesIds = useSelector((state: AppState) => state.spreadsheetNetwork.nodesIds);
        const { fetchNodesEquipmentData } = useFetchEquipment();

        // Initial data loading for this type when the tab is opened
        useEffect(() => {
            if (active && nodesIds.length > 0 && Object.keys(equipments.equipmentsByNodeId).length === 0) {
                fetchNodesEquipmentData(tableDefinition?.type, new Set(nodesIds));
            }
        }, [active, nodesIds, equipments.equipmentsByNodeId, fetchNodesEquipmentData, tableDefinition?.type]);

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

        const dispatch = useDispatch();

        const handleEquipmentScroll = useCallback(() => {
            if (equipmentId && gridRef.current?.api && isGridReady) {
                const selectedRow = gridRef.current.api.getRowNode(equipmentId);
                if (selectedRow) {
                    gridRef.current.api.ensureNodeVisible(selectedRow, 'top');
                    selectedRow.setSelected(true, true);
                    // Clear the metadata after successfully scrolling to equipment
                    dispatch(
                        updatePanelMetadata({
                            panelId,
                            metadata: {
                                targetEquipmentId: undefined,
                                targetEquipmentType: undefined,
                            },
                        })
                    );
                }
            }
        }, [equipmentId, gridRef, isGridReady, dispatch, panelId]);

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
            const currentNodeData: Record<string, Identifiable> = equipments.equipmentsByNodeId[currentNode.id];
            return Object.values(
                Object.entries(equipments.equipmentsByNodeId).reduce(
                    (prev, [nodeId, nodeEquipments]) => {
                        const nodeAlias = nodeAliases.find((value) => value.id === nodeId);
                        if (nodeAlias) {
                            Object.values(nodeEquipments).forEach((eq) => {
                                // To avoid empty lines in case of deleted equipments in current node but defined in another one
                                if (prev[eq.id] !== undefined) {
                                    prev[eq.id] = {
                                        ...prev[eq.id],
                                        [nodeAlias.alias]: eq,
                                    };
                                }
                            });
                        }
                        return prev;
                    },
                    { ...currentNodeData }
                )
            );
        }, [equipments, currentNode.id, nodeAliases]);

        useEffect(() => {
            if (gridRef.current?.api) {
                gridRef.current.api.setGridOption('rowData', transformedRowData);
            }
        }, [transformedRowData, gridRef, isGridReady]);

        const { columnFilters } = useComputationFilters(FilterType.Spreadsheet, tableDefinition?.uuid);

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
            updateFilters(api, columnFilters);
        }, [columnFilters, gridRef, isGridReady, equipments, tableDefinition?.columns]);

        const handleModify = useCallback(
            (equipmentId: string) => {
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
                dispatch(openSLD({ id: equipmentId, diagramType }));
            },
            [dispatch, tableDefinition?.type]
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
                            isFetching={equipments.isFetching}
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
