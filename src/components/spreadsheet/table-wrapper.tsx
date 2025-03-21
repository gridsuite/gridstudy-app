/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';

import { Alert, Box, Button, Grid } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { EquipmentTable } from './equipment-table';
import { Identifiable, PopupConfirmationDialog, useSnackMessage } from '@gridsuite/commons-ui';
import { PARAM_DEVELOPER_MODE } from '../../utils/config-params';
import { ColumnsConfig } from './columns-config';
import { EquipmentTabs } from './equipment-tabs';
import { useSpreadsheetEquipments } from './data-fetching/use-spreadsheet-equipments';
import { SPREADSHEET_SORT_STORE } from 'utils/store-sort-filter-fields';
import { useCustomColumn } from './custom-columns/use-custom-column';
import CustomColumnsConfig from './custom-columns/custom-columns-config';
import { AppState, CurrentTreeNode } from '../../redux/reducer';
import { AgGridReact } from 'ag-grid-react';
import { ColumnMovedEvent, ColumnState, RowClickedEvent } from 'ag-grid-community';
import { SpreadsheetCollectionDto, SpreadsheetEquipmentType } from './config/spreadsheet.type';
import SpreadsheetSave from './spreadsheet-save';
import CustomColumnsNodesConfig from './custom-columns/custom-columns-nodes-config';
import SpreadsheetGsFilter from './spreadsheet-gs-filter';
import { useFilterSelector } from '../../hooks/use-filter-selector';
import { FilterType } from '../../types/custom-aggrid-types';
import { updateFilters } from '../custom-aggrid/custom-aggrid-filters/utils/aggrid-filters-utils';
import { useEquipmentModification } from './equipment-modification/use-equipment-modification';
import { useSpreadsheetGsFilter } from './use-spreadsheet-gs-filter';
import { initTableDefinitions, resetAllSpreadsheetGsFilters, updateTableDefinition } from 'redux/actions';
import { NodeType } from '../graph/tree-node.type';
import { CustomColDef } from '../custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { reorderSpreadsheetColumns } from 'services/study-config';
import { UUID } from 'crypto';
import { useNodeAliases } from './custom-columns/use-node-aliases';
import { rowIndexColumnDefinition } from './config/common-column-definitions';
import { useGridCalculations } from '../../hooks/use-grid-calculations';
import { spreadsheetStyles } from './utils/style';
import RestoreIcon from '@mui/icons-material/Restore';
import { getSpreadsheetConfigCollection, setSpreadsheetConfigCollection } from 'services/study/study-config';
import { mapColumnsDto } from './custom-spreadsheet/custom-spreadsheet-utils';

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

interface TableWrapperProps {
    currentNode: CurrentTreeNode;
    equipmentId: string;
    equipmentType: SpreadsheetEquipmentType;
    equipmentChanged: boolean;
    disabled: boolean;
    onEquipmentScrolled: () => void;
}

interface RecursiveIdentifiable extends Identifiable {
    [alias: string]: Identifiable | string | undefined;
}

export const TableWrapper: FunctionComponent<TableWrapperProps> = ({
    currentNode,
    equipmentId,
    equipmentType,
    equipmentChanged,
    disabled,
    onEquipmentScrolled,
}) => {
    const dispatch = useDispatch();
    const intl = useIntl();
    const gridRef = useRef<AgGridReact>(null);
    const timerRef = useRef<NodeJS.Timeout>();
    const { snackError } = useSnackMessage();

    const [activeTabUuid, setActiveTabUuid] = useState<UUID | null>(null);

    const { nodeAliases, updateNodeAliases } = useNodeAliases();
    const tablesDefinitions = useSelector((state: AppState) => state.tables.definitions);
    const developerMode = useSelector((state: AppState) => state[PARAM_DEVELOPER_MODE]);
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const [manualTabSwitch, setManualTabSwitch] = useState<boolean>(true);
    const [resetConfirmationDialogOpen, setResetConfirmationDialogOpen] = useState(false);

    const [rowData, setRowData] = useState<Identifiable[]>();
    const [equipmentToUpdateId, setEquipmentToUpdateId] = useState<string | null>(null);

    // Initialize activeTabUuid with the first tab's UUID if not already set
    useEffect(() => {
        if (!activeTabUuid && tablesDefinitions.length > 0) {
            setActiveTabUuid(tablesDefinitions[0].uuid);
        }
    }, [activeTabUuid, tablesDefinitions]);

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

    const sortConfig = useSelector(
        (state: AppState) => state.tableSort[SPREADSHEET_SORT_STORE]?.[tableDefinition?.uuid]
    );
    const { filters } = useFilterSelector(FilterType.Spreadsheet, tableDefinition?.uuid);

    const updateSortConfig = useCallback(() => {
        gridRef.current?.api?.applyColumnState({
            state: sortConfig,
            defaultState: { sort: null },
        });
    }, [sortConfig]);

    const updateLockedColumnsConfig = useCallback(() => {
        // Start with the row index column which should always be pinned left
        const lockedColumnsConfig: ColumnState[] = [
            {
                colId: 'rowIndex',
                pinned: 'left',
            },
        ];

        // Add any other locked columns from the table definition
        const userLockedColumns =
            tableDefinition?.columns
                ?.filter((column) => column.visible && column.locked)
                ?.map((column) => {
                    const s: ColumnState = {
                        colId: column.id ?? '',
                        pinned: 'left',
                    };
                    return s;
                }) || [];

        // Apply column state with the specified default
        gridRef.current?.api?.applyColumnState({
            state: [...lockedColumnsConfig, ...userLockedColumns],
            defaultState: { pinned: null },
        });
    }, [tableDefinition]);

    useEffect(() => {
        gridRef.current?.api?.setGridOption('columnDefs', reorderedColsDefs);
        updateSortConfig();
        updateLockedColumnsConfig();
        updateFilters(gridRef.current?.api, filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reorderedColsDefs]);

    useEffect(() => {
        updateSortConfig();
    }, [updateSortConfig]);

    useEffect(() => {
        updateLockedColumnsConfig();
    }, [updateLockedColumnsConfig]);

    const cleanTableState = useCallback(() => {
        if (gridRef.current?.api) {
            const api = gridRef.current.api;
            api.setFilterModel(null);
            // reset aggrid column definitions
            api.setGridOption('columnDefs', []);
            api.applyColumnState({
                defaultState: { sort: null },
            });
        }
    }, []);

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

    useEffect(() => {
        if (disabled || equipments?.nodesId.find((nodeId) => nodeId === currentNode.id) === undefined || !nodeAliases) {
            return;
        }
        let localRowData: Identifiable[] = [];
        if (tableDefinition?.type) {
            equipments?.equipmentsByNodeId[currentNode.id].forEach((equipment) => {
                let equipmentToAdd: RecursiveIdentifiable = { ...equipment };
                Object.entries(equipments?.equipmentsByNodeId).forEach(([nodeId, equipments]) => {
                    let matchingEquipment = equipments.find((eq) => eq.id === equipment.id);
                    let nodeAlias = nodeAliases.find((value) => value.id === nodeId);
                    if (nodeAlias !== undefined && matchingEquipment !== undefined) {
                        equipmentToAdd[nodeAlias.alias] = matchingEquipment;
                    }
                });
                localRowData.push(equipmentToAdd);
            });
        }

        // To handle cases where a "customSpreadsheet" tab is opened.
        // This ensures that the grid correctly displays data specific to the custom tab.
        if (gridRef.current?.api) {
            gridRef.current.api.setGridOption('rowData', localRowData);
            updateSortConfig();
            updateFilters(gridRef.current?.api, filters);
            updateLockedColumnsConfig();
        }
        setRowData(localRowData);
    }, [
        activeTabUuid,
        disabled,
        equipments,
        tableDefinition?.type,
        nodeAliases,
        currentNode.id,
        updateSortConfig,
        filters,
        updateLockedColumnsConfig,
    ]);

    const handleSwitchTab = useCallback(
        (tabUuid: UUID) => {
            setManualTabSwitch(true);
            setActiveTabUuid(tabUuid);
            cleanTableState();
        },
        [cleanTableState]
    );

    useEffect(() => {
        setManualTabSwitch(false);
    }, [equipmentChanged]);

    const scrollToEquipmentIndex = useCallback(() => {
        if (equipmentId !== null && equipmentType !== null && !manualTabSwitch) {
            //calculate row index to scroll to
            //since all sorting and filtering is done by aggrid, we need to use their APIs to get the actual index
            const selectedRow = gridRef.current?.api?.getRowNode(equipmentId);
            if (selectedRow) {
                gridRef.current?.api?.ensureNodeVisible(selectedRow, 'top');
                selectedRow.setSelected(true, true);
                onEquipmentScrolled();
            }
        }
    }, [equipmentId, equipmentType, manualTabSwitch, onEquipmentScrolled]);

    useEffect(() => {
        if (equipmentId !== null && equipmentType !== null && !manualTabSwitch) {
            const matchingTab = tablesDefinitions.find((def) => def.type === equipmentType);
            if (matchingTab) {
                if (matchingTab.uuid === activeTabUuid) {
                    // Already on the right tab, just scroll to equipment
                    scrollToEquipmentIndex();
                } else {
                    // Need to switch to the tab with this equipment type
                    setActiveTabUuid(matchingTab.uuid);
                }
            }
        }
    }, [
        equipmentId,
        equipmentType,
        equipmentChanged,
        manualTabSwitch,
        activeTabUuid,
        scrollToEquipmentIndex,
        tablesDefinitions,
    ]);

    const handleRowDataUpdated = useCallback(() => {
        scrollToEquipmentIndex();
        // wait a moment  before removing the loading message.
        timerRef.current = setTimeout(() => {
            gridRef.current?.api?.hideOverlay();
            if (rowData?.length === 0 && !isFetching) {
                // we need to call showNoRowsOverlay in order to show message when rowData is empty
                gridRef.current?.api?.showNoRowsOverlay();
            }
        }, 50);
    }, [scrollToEquipmentIndex, isFetching, rowData]);

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
                // Adjust toIndex to account for the row index column which is always first
                // When moving a column, we need to subtract 1 from AG Grid's toIndex
                // because our tableDefinition doesn't include the row index column
                const adjustedToIndex = Math.max(0, event.toIndex - 1);

                let reorderedTableDefinitionIndexesTemp = [...tableDefinition.columns.filter((col) => col.visible)];
                const sourceIndex = reorderedTableDefinitionIndexesTemp.findIndex((col) => col.id === colId);
                const [reorderedItem] = reorderedTableDefinitionIndexesTemp.splice(sourceIndex, 1);
                reorderedTableDefinitionIndexesTemp.splice(adjustedToIndex, 0, reorderedItem);

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

    const { onModelUpdated } = useGridCalculations(
        gridRef,
        activeTabUuid,
        reorderedColsDefs,
        rowData !== undefined && rowData.length > 0
    );

    const getStudySpreadsheetConfigCollection = useCallback(() => {
        if (!studyUuid) {
            return;
        }

        getSpreadsheetConfigCollection(studyUuid).then((collectionData: SpreadsheetCollectionDto) => {
            const tableDefinitions = collectionData.spreadsheetConfigs.map((spreadsheetConfig, index) => {
                return {
                    uuid: spreadsheetConfig.id,
                    index: index,
                    name: spreadsheetConfig.name,
                    columns: mapColumnsDto(spreadsheetConfig.columns),
                    type: spreadsheetConfig.sheetType,
                };
            });
            dispatch(initTableDefinitions(collectionData.id, tableDefinitions));
            if (tableDefinitions.length > 0) {
                handleSwitchTab(tableDefinitions[0].uuid);
                dispatch(resetAllSpreadsheetGsFilters());
            }
        });
    }, [studyUuid, dispatch, handleSwitchTab]);

    // Reset the collection to the default one defined in the user profile
    const resetSpreadsheetCollection = useCallback(() => {
        if (!studyUuid) {
            return;
        }

        setSpreadsheetConfigCollection(studyUuid)
            .then(() => {
                getStudySpreadsheetConfigCollection();
            })
            .catch((error) => {
                snackError({
                    messageTxt: error,
                    headerId: 'spreadsheet/reset_spreadsheet_collection/error_resetting_collection',
                });
            });
        setResetConfirmationDialogOpen(false);
    }, [studyUuid, getStudySpreadsheetConfigCollection, snackError]);

    const handleResetCollectionClick = useCallback(() => {
        if (tablesDefinitions.length > 0) {
            setResetConfirmationDialogOpen(true);
        } else {
            // reset the collection directly if no tables exist
            resetSpreadsheetCollection();
        }
    }, [tablesDefinitions, resetSpreadsheetCollection]);

    return (
        <>
            <Grid container justifyContent={'space-between'}>
                <EquipmentTabs disabled={disabled} selectedTabUuid={activeTabUuid} handleSwitchTab={handleSwitchTab} />
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
                    <Grid item>
                        <Button
                            sx={spreadsheetStyles.spreadsheetButton}
                            size={'small'}
                            onClick={handleResetCollectionClick}
                            disabled={disabled}
                        >
                            <RestoreIcon />
                            <FormattedMessage id="spreadsheet/reset/button" />
                        </Button>
                    </Grid>
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
                        gridRef={gridRef}
                        currentNode={currentNode}
                        rowData={rowData}
                        columnData={reorderedColsDefs}
                        isFetching={isFetching}
                        handleColumnDrag={handleColumnDrag}
                        handleRowDataUpdated={handleRowDataUpdated}
                        shouldHidePinnedHeaderRightBorder={isLockedColumnNamesEmpty}
                        onRowClicked={onRowClicked}
                        isExternalFilterPresent={isExternalFilterPresent}
                        doesExternalFilterPass={doesFormulaFilteringPass}
                        onModelUpdated={onModelUpdated}
                        isDataEditable={isModificationDialogForEquipmentType()}
                    />
                </Box>
            )}
            {modificationDialog}
            {resetConfirmationDialogOpen && (
                <PopupConfirmationDialog
                    message={intl.formatMessage({
                        id: 'spreadsheet/create_new_spreadsheet/replace_collection_confirmation',
                    })}
                    openConfirmationPopup={resetConfirmationDialogOpen}
                    setOpenConfirmationPopup={setResetConfirmationDialogOpen}
                    handlePopupConfirmation={resetSpreadsheetCollection}
                />
            )}
        </>
    );
};
