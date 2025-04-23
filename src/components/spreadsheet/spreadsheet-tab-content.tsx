/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useSpreadsheetEquipments } from './data-fetching/use-spreadsheet-equipments';
import { EquipmentTable } from './equipment-table';
import { Identifiable } from '@gridsuite/commons-ui';
import { CustomColDef } from 'components/custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { SpreadsheetEquipmentsByNodes, SpreadsheetTabDefinition } from './config/spreadsheet.type';
import { CurrentTreeNode, NodeType } from 'components/graph/tree-node.type';
import { AgGridReact } from 'ag-grid-react';
import { Alert, Box, Theme } from '@mui/material';
import { useEquipmentModification } from './equipment-modification/use-equipment-modification';
import { RowClickedEvent } from 'ag-grid-community';
import { NodeAlias } from './custom-columns/node-alias.type';
import { FormattedMessage } from 'react-intl';
import { useSpreadsheetGsFilter } from './use-spreadsheet-gs-filter';
import { useFilterSelector } from 'hooks/use-filter-selector';
import { FilterType } from 'types/custom-aggrid-types';
import { updateFilters } from 'components/custom-aggrid/custom-aggrid-filters/utils/aggrid-filters-utils';
import { useGridCalculations } from 'hooks/use-grid-calculations';
import { UUID } from 'crypto';
import { useColumnManagement } from './hooks/use-column-management';

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

interface SpreadsheetTabContentProps {
    gridRef: React.RefObject<AgGridReact>;
    currentNode: CurrentTreeNode;
    tableDefinition: SpreadsheetTabDefinition;
    columns: CustomColDef[];
    nodeAliases: NodeAlias[] | undefined;
    disabled: boolean;
    shouldDisableButtons: boolean;
    equipmentId: string | null;
    onEquipmentScrolled: () => void;
}

export const SpreadsheetTabContent = React.memo(
    ({
        gridRef,
        currentNode,
        tableDefinition,
        columns,
        nodeAliases,
        shouldDisableButtons,
        disabled,
        equipmentId,
        onEquipmentScrolled,
    }: SpreadsheetTabContentProps) => {
        const [equipmentToUpdateId, setEquipmentToUpdateId] = useState<string | null>(null);

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
            }

            setEquipmentToUpdateId(null);
        }, [equipmentToUpdateId, gridRef]);

        const { equipments, isFetching } = useSpreadsheetEquipments(
            tableDefinition?.type,
            highlightUpdatedEquipment,
            nodeAliases
        );

        const { onModelUpdated } = useGridCalculations(gridRef, tableDefinition.uuid, columns);

        const { updateSortConfig, updateLockedColumnsConfig, isLockedColumnNamesEmpty, handleColumnDrag } =
            useColumnManagement(gridRef, tableDefinition);

        const { isExternalFilterPresent, doesFormulaFilteringPass } = useSpreadsheetGsFilter(tableDefinition?.uuid);

        const { modificationDialog, handleOpenModificationDialog, isModificationDialogForEquipmentType } =
            useEquipmentModification({
                equipmentType: tableDefinition?.type,
            });

        const onRowClicked = useCallback(
            (event: RowClickedEvent) => {
                if (currentNode?.type !== NodeType.ROOT) {
                    const equipmentId = event.data.id;
                    setEquipmentToUpdateId(equipmentId);
                    handleOpenModificationDialog(equipmentId);
                }
            },
            [currentNode?.type, handleOpenModificationDialog]
        );

        const handleEquipmentScroll = useCallback(() => {
            if (equipmentId && gridRef.current?.api) {
                // a small timeout is needed to ensure the grid is fully rendered
                // before trying to scroll to the selected row to avoid glitches
                setTimeout(() => {
                    const selectedRow = gridRef.current?.api?.getRowNode(equipmentId);
                    if (selectedRow) {
                        gridRef.current?.api?.ensureNodeVisible(selectedRow, 'top');
                        selectedRow.setSelected(true, true);
                        onEquipmentScrolled();
                    }
                }, 300);
            }
        }, [equipmentId, gridRef, onEquipmentScrolled]);

        useEffect(() => {
            handleEquipmentScroll();
        }, [handleEquipmentScroll]);

        // used to scroll to the selected row when the data is first rendered
        // and the grid is fully loaded
        const onFirstDataRendered = useCallback(() => {
            handleEquipmentScroll();
        }, [handleEquipmentScroll]);

        const transformRowData = useCallback(
            (equipments: SpreadsheetEquipmentsByNodes, currentNodeId: UUID, nodeAliases: NodeAlias[]) => {
                if (!equipments?.equipmentsByNodeId[currentNodeId] || !nodeAliases) {
                    return [];
                }

                return equipments.equipmentsByNodeId[currentNodeId].map((equipment) => {
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
            },
            []
        );

        const [rowData, setRowData] = useState<RecursiveIdentifiable[]>([]);
        const [shouldSetRowData, setShouldSetRowData] = useState(false);

        useEffect(() => {
            if (equipments?.nodesId.find((nodeId) => nodeId === currentNode.id) === undefined || !nodeAliases) {
                return;
            }
            const localRowData = transformRowData(equipments, currentNode.id, nodeAliases);
            setRowData(localRowData);
            // Set the row data in the grid if it is already initialized
            // Otherwise, wait for the grid to be initialized
            // before setting the row data
            // This is needed to avoid crashes when equipments are already fetched
            // and the grid is not yet initialized
            if (gridRef.current?.api) {
                gridRef.current.api.setGridOption('rowData', localRowData);
            } else {
                setShouldSetRowData(true);
            }
        }, [equipments, nodeAliases, currentNode.id, transformRowData, gridRef]);

        useEffect(() => {
            if (gridRef.current?.api && shouldSetRowData) {
                setTimeout(() => {
                    gridRef.current?.api.setGridOption('rowData', rowData);
                }, 300);
            }
        }, [gridRef, rowData, shouldSetRowData]);

        const { filters } = useFilterSelector(FilterType.Spreadsheet, tableDefinition?.uuid);

        useEffect(() => {
            const api = gridRef.current?.api;
            if (!api) {
                return;
            }

            updateSortConfig();
            updateLockedColumnsConfig();

            if (filters.length > 0) {
                updateFilters(api, filters);
            }
        }, [updateSortConfig, updateLockedColumnsConfig, filters, equipments, gridRef, shouldSetRowData]);

        return (
            <>
                {disabled || shouldDisableButtons ? (
                    <Alert sx={styles.invalidNode} severity="warning">
                        <FormattedMessage id={disabled ? 'InvalidNode' : 'NoSpreadsheets'} />
                    </Alert>
                ) : (
                    <Box sx={styles.table}>
                        <EquipmentTable
                            gridRef={gridRef}
                            currentNode={currentNode}
                            columnData={columns}
                            isFetching={isFetching}
                            onRowClicked={onRowClicked}
                            isDataEditable={isModificationDialogForEquipmentType}
                            handleColumnDrag={handleColumnDrag}
                            isExternalFilterPresent={isExternalFilterPresent}
                            doesExternalFilterPass={doesFormulaFilteringPass}
                            shouldHidePinnedHeaderRightBorder={isLockedColumnNamesEmpty}
                            onModelUpdated={onModelUpdated}
                            onFirstDataRendered={onFirstDataRendered}
                        />
                    </Box>
                )}
                {modificationDialog}
            </>
        );
    }
);
