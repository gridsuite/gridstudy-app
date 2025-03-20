/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import { Alert, Box, Grid } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { EquipmentTable } from './equipment-table';
import { Identifiable, useSnackMessage } from '@gridsuite/commons-ui';
import { PARAM_DEVELOPER_MODE } from '../../utils/config-params';
import { ColumnsConfig } from './columns-config';
import { useSpreadsheetEquipments } from './data-fetching/use-spreadsheet-equipments';
import { useCustomColumn } from './custom-columns/use-custom-column';
import CustomColumnsConfig from './custom-columns/custom-columns-config';
import { AppState } from '../../redux/reducer';
import { AgGridReact } from 'ag-grid-react';
import { ColumnMovedEvent, RowClickedEvent } from 'ag-grid-community';
import { SpreadsheetEquipmentType } from './config/spreadsheet.type';
import SpreadsheetSave from './spreadsheet-save';
import CustomColumnsNodesConfig from './custom-columns/custom-columns-nodes-config';
import SpreadsheetGsFilter from './spreadsheet-gs-filter';
import { useEquipmentModification } from './equipment-modification/use-equipment-modification';
import { useSpreadsheetGsFilter } from './use-spreadsheet-gs-filter';
import { updateTableDefinition } from 'redux/actions';
import { NodeType } from '../graph/tree-node.type';
import { CustomColDef } from '../custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { reorderSpreadsheetColumns } from 'services/study-config';
import { UUID } from 'crypto';
import { useNodeAliases } from './custom-columns/use-node-aliases';

const styles = {
    table: (theme: Theme) => ({
        marginTop: theme.spacing(2.5),
        lineHeight: 'unset',
        flexGrow: 1,
    }),
    blink: {
        animation: '$blink 2s infinite',
    },
    '@keyframes blink': {
        '0%': {
            opacity: 1,
        },
        '50%': {
            opacity: 0.1,
        },
    },
    invalidNode: {
        position: 'absolute',
        top: '30%',
        left: '43%',
    },
    toolbar: (theme: Theme) => ({
        marginTop: theme.spacing(2),
        alignItems: 'center',
    }),
    filter: (theme: Theme) => ({
        marginLeft: theme.spacing(1),
    }),
    selectColumns: (theme: Theme) => ({
        marginLeft: theme.spacing(1),
    }),
    save: (theme: Theme) => ({
        marginRight: theme.spacing(1),
    }),
};

interface TableProps {
    activeTabUuid: UUID | null;
    equipmentId: string | null;
    equipmentType: SpreadsheetEquipmentType | null;
    disabled: boolean;
}

interface RecursiveIdentifiable extends Identifiable {
    [alias: string]: Identifiable | string | undefined;
}

export const Table: FunctionComponent<TableProps> = ({ activeTabUuid, equipmentId, equipmentType, disabled }) => {
    const dispatch = useDispatch();
    const gridRef = useRef<AgGridReact>(null);
    const { snackError } = useSnackMessage();

    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);

    const { nodeAliases, updateNodeAliases } = useNodeAliases();
    const tablesDefinitions = useSelector((state: AppState) => state.tables.definitions);
    const developerMode = useSelector((state: AppState) => state[PARAM_DEVELOPER_MODE]);
    const [equipmentToUpdateId, setEquipmentToUpdateId] = useState<string | null>(null);

    // Calculate the visual index for compatibility with components that need numeric indices
    const activeTabIndex = useMemo(() => {
        if (!activeTabUuid) {
            return 0;
        }
        const index = tablesDefinitions.findIndex((tab) => tab.uuid === activeTabUuid);
        return index >= 0 ? index : 0;
    }, [activeTabUuid, tablesDefinitions]);

    const tableDefinition = useMemo(
        () => tablesDefinitions.find((def) => def.uuid === activeTabUuid) || tablesDefinitions[0],
        [activeTabUuid, tablesDefinitions]
    );
    const isLockedColumnNamesEmpty = useMemo(
        () => tableDefinition?.columns?.map((col) => col.locked).length === 0,
        [tableDefinition?.columns]
    );

    const shouldDisableButtons = useMemo(
        () => disabled || tablesDefinitions.length === 0,
        [disabled, tablesDefinitions]
    );
    const columnsDefinitions = useCustomColumn(activeTabIndex);

    const reorderedColsDefs = useMemo(() => {
        const columns = tableDefinition?.columns?.filter((column) => column.visible);
        return columns?.map((column) => {
            const colDef = columnsDefinitions.reduce((acc, curr) => {
                if (curr.colId === column.id) {
                    return curr;
                }
                return acc;
            }, {} as CustomColDef);
            return colDef;
        });
    }, [columnsDefinitions, tableDefinition?.columns]);

    const { isExternalFilterPresent, doesFormulaFilteringPass } = useSpreadsheetGsFilter(tableDefinition?.uuid);

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
    }, [equipmentToUpdateId]);

    const { equipments, isFetching } = useSpreadsheetEquipments(
        tableDefinition?.type,
        highlightUpdatedEquipment,
        nodeAliases
    );

    const rowData = useMemo(() => {
        let localRowData: Identifiable[] = [];
        if (currentNode && tableDefinition?.type) {
            equipments?.equipmentsByNodeId[currentNode.id]?.forEach((equipment) => {
                let equipmentToAdd: RecursiveIdentifiable = { ...equipment };
                Object.entries(equipments?.equipmentsByNodeId).forEach(([nodeId, equipments]) => {
                    let matchingEquipment = equipments.find((eq) => eq.id === equipment.id);
                    let nodeAlias = nodeAliases?.find((value) => value.id === nodeId);
                    if (nodeAlias !== undefined && matchingEquipment !== undefined) {
                        equipmentToAdd[nodeAlias.alias] = matchingEquipment;
                    }
                });
                localRowData.push(equipmentToAdd);
            });
        }
        return localRowData;
    }, [currentNode, equipments?.equipmentsByNodeId, nodeAliases, tableDefinition?.type]);

    useEffect(() => {
        if (equipmentId !== null && equipmentType !== null) {
            //calculate row index to scroll to
            //since all sorting and filtering is done by aggrid, we need to use their APIs to get the actual index
            const selectedRow = gridRef.current?.api?.getRowNode(equipmentId);
            if (selectedRow) {
                gridRef.current?.api?.ensureNodeVisible(selectedRow, 'top');
                selectedRow.setSelected(true, true);
            }
        }
    }, [equipmentId, equipmentType]);

    // Create a map to store the original positions of all columns
    const originalColumnPositions = useMemo(() => {
        const positions = new Map<string, number>();
        tableDefinition?.columns.forEach((col, index) => {
            positions.set(col.id, index);
        });
        return positions;
    }, [tableDefinition?.columns]);

    const handleColumnDrag = useCallback(
        (event: ColumnMovedEvent) => {
            const colId = event.column?.getColId();
            if (colId && event.finished && event.toIndex !== undefined) {
                let reorderedTableDefinitionIndexesTemp = [...tableDefinition.columns.filter((col) => col.visible)];
                const sourceIndex = reorderedTableDefinitionIndexesTemp.findIndex((col) => col.id === colId);
                const [reorderedItem] = reorderedTableDefinitionIndexesTemp.splice(sourceIndex, 1);
                reorderedTableDefinitionIndexesTemp.splice(event.toIndex, 0, reorderedItem);

                // Reinsert invisible columns in their original positions
                const updatedColumns = [...reorderedTableDefinitionIndexesTemp];
                tableDefinition.columns.forEach((col) => {
                    if (!col.visible) {
                        const originalIndex = originalColumnPositions.get(col.id);
                        if (originalIndex !== undefined) {
                            updatedColumns.splice(originalIndex, 0, col);
                        }
                    }
                });

                reorderSpreadsheetColumns(
                    tableDefinition.uuid,
                    updatedColumns.map((col) => col.uuid)
                )
                    .then(() => {
                        dispatch(
                            updateTableDefinition({
                                ...tableDefinition,
                                columns: updatedColumns,
                            })
                        );
                    })
                    .catch((error) => {
                        snackError({
                            messageTxt: error,
                            headerId: 'spreadsheet/reorder_columns/error',
                        });
                    });
            }
        },
        [tableDefinition, originalColumnPositions, dispatch, snackError]
    );

    const { modificationDialog, handleOpenModificationDialog } = useEquipmentModification({
        studyUuid: studyUuid ?? '',
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

    return (
        <>
            <Grid container justifyContent={'space-between'}>
                <Grid container columnSpacing={2} sx={styles.toolbar}>
                    <Grid item sx={styles.selectColumns}>
                        <SpreadsheetGsFilter
                            equipmentType={tableDefinition?.type}
                            uuid={tableDefinition?.uuid}
                            index={tableDefinition?.index}
                            name={tableDefinition?.name}
                        />
                    </Grid>
                    <Grid item>
                        <ColumnsConfig
                            tabIndex={activeTabIndex}
                            disabled={shouldDisableButtons || tableDefinition?.columns.length === 0}
                        />
                    </Grid>
                    {developerMode && (
                        <Grid item>
                            <CustomColumnsConfig tabIndex={activeTabIndex} disabled={shouldDisableButtons} />
                        </Grid>
                    )}
                    {developerMode && (
                        <Grid item>
                            <CustomColumnsNodesConfig
                                disabled={shouldDisableButtons}
                                tabIndex={activeTabIndex}
                                nodeAliases={nodeAliases}
                                updateNodeAliases={updateNodeAliases}
                            />
                        </Grid>
                    )}
                    <Grid item style={{ flexGrow: 1 }}></Grid>
                    <Grid item sx={styles.save}>
                        <SpreadsheetSave
                            tabIndex={activeTabIndex}
                            gridRef={gridRef}
                            columns={reorderedColsDefs}
                            tableName={tableDefinition?.name}
                            disabled={shouldDisableButtons}
                            dataSize={rowData ? rowData.length : 0}
                        />
                    </Grid>
                </Grid>
            </Grid>
            {disabled || shouldDisableButtons ? (
                <Alert sx={styles.invalidNode} severity="warning">
                    <FormattedMessage id={disabled ? 'InvalidNode' : 'NoSpreadsheets'} />
                </Alert>
            ) : (
                <Box sx={styles.table}>
                    <EquipmentTable
                        studyUuid={studyUuid!}
                        currentNode={currentNode!}
                        gridRef={gridRef}
                        rowData={rowData}
                        columnData={reorderedColsDefs}
                        isFetching={isFetching}
                        handleColumnDrag={handleColumnDrag}
                        shouldHidePinnedHeaderRightBorder={isLockedColumnNamesEmpty}
                        onRowClicked={onRowClicked}
                        isExternalFilterPresent={isExternalFilterPresent}
                        doesExternalFilterPass={doesFormulaFilteringPass}
                    />
                </Box>
            )}
            {modificationDialog}
        </>
    );
};
