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
import { EquipmentTabs } from './equipment-tabs';
import { useSpreadsheetEquipments } from './use-spreadsheet-equipments';
import { formatFetchedEquipments } from './utils/equipment-table-utils';
import { SPREADSHEET_SORT_STORE } from 'utils/store-sort-filter-fields';
import { useCustomColumn } from './custom-columns/use-custom-column';
import CustomColumnsConfig from './custom-columns/custom-columns-config';
import { AppState, CurrentTreeNode } from '../../redux/reducer';
import { AgGridReact } from 'ag-grid-react';
import { ColumnMovedEvent, ColumnState, RowClickedEvent } from 'ag-grid-community';
import { mergeSx } from '../utils/functions';
import { CustomColDef } from '../custom-aggrid/custom-aggrid-header.type';
import { SpreadsheetEquipmentType } from './config/spreadsheet.type';
import SpreadsheetSave from './spreadsheet-save';
import CustomColumnsNodesConfig from './custom-columns/custom-columns-nodes-config';
import { SpreadsheetGsFilter } from './spreadsheet-gs-filter';
import { useFilterSelector } from '../../hooks/use-filter-selector';
import { FilterType } from '../../types/custom-aggrid-types';
import { updateFilters } from '../custom-aggrid/custom-aggrid-filters/utils/aggrid-filters-utils';
import { useEquipmentModification } from './equipment-modification/use-equipment-modification';
import { useSpreadsheetGsFilter } from './use-spreadsheet-gs-filter';
import { changeDisplayedColumns } from '../../redux/actions';

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

interface TableWrapperProps {
    studyUuid: string;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: string;
    equipmentId: string;
    equipmentType: SpreadsheetEquipmentType;
    equipmentChanged: boolean;
    disabled: boolean;
}

interface RecursiveIdentifiable extends Identifiable {
    [alias: string]: Identifiable | string | undefined;
}

export const TableWrapper: FunctionComponent<TableWrapperProps> = ({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    equipmentId,
    equipmentType,
    equipmentChanged,
    disabled,
}) => {
    const dispatch = useDispatch();
    const gridRef = useRef<AgGridReact>(null);
    const { snackError } = useSnackMessage();
    const [tabIndex, setTabIndex] = useState<number>(0);

    const allDisplayedColumnsNames = useSelector((state: AppState) => state.tables.columnsNames);
    const formattedDisplayedColumnsNames = useMemo(
        () => allDisplayedColumnsNames[tabIndex],
        [allDisplayedColumnsNames, tabIndex]
    );
    const allLockedColumnsNames = useSelector((state: AppState) => state.allLockedColumnsNames);
    const formattedLockedColumnsNames = useMemo(
        () => new Set(allLockedColumnsNames[tabIndex] ? JSON.parse(allLockedColumnsNames[tabIndex]) : []),
        [allLockedColumnsNames, tabIndex]
    );
    const tablesDefinitions = useSelector((state: AppState) => state.tables.definitions);
    const additionalEquipmentsByNodesForCustomColumns = useSelector(
        (state: AppState) => state.additionalEquipmentsByNodesForCustomColumns
    );
    const developerMode = useSelector((state: AppState) => state[PARAM_DEVELOPER_MODE]);

    const [manualTabSwitch, setManualTabSwitch] = useState<boolean>(true);

    const [rowData, setRowData] = useState<Identifiable[]>([]);

    const isLockedColumnNamesEmpty = useMemo(
        () => formattedLockedColumnsNames.size === 0,
        [formattedLockedColumnsNames.size]
    );

    const tableDefinition = useMemo(() => tablesDefinitions[tabIndex], [tabIndex, tablesDefinitions]);
    const columnData = useMemo(() => {
        const selectedColumns = formattedDisplayedColumnsNames.filter((col) => col.visible).map((col) => col.colId);
        const columns = tableDefinition.columns.reduce((acc, item) => {
            acc[item.colId] = item;
            return acc;
        }, {} as Record<string, CustomColDef>);
        return selectedColumns.map((name) => columns[name]);
    }, [formattedDisplayedColumnsNames, tableDefinition.columns]);
    const customColumns = useCustomColumn(tabIndex);
    const mergedColumnData = useMemo(() => [...columnData, ...customColumns], [columnData, customColumns]);
    const sortConfig = useSelector((state: AppState) => state.tableSort[SPREADSHEET_SORT_STORE][tableDefinition.name]);
    const { filters } = useFilterSelector(FilterType.Spreadsheet, tableDefinition.name);

    const updateSortConfig = useCallback(() => {
        gridRef.current?.api?.applyColumnState({
            state: sortConfig,
            defaultState: { sort: null },
        });
    }, [sortConfig]);

    const updateLockedColumnsConfig = useCallback(() => {
        const lockedColumnsConfig = tableDefinition.columns
            .filter((column) => formattedLockedColumnsNames.has(column.colId!))
            .map((column) => {
                const s: ColumnState = {
                    colId: column.colId ?? '',
                    pinned: 'left',
                };
                return s;
            });
        gridRef.current?.api?.applyColumnState({
            state: lockedColumnsConfig,
            defaultState: { pinned: null },
        });
    }, [formattedLockedColumnsNames, tableDefinition.columns]);

    useEffect(() => {
        gridRef.current?.api?.setGridOption('columnDefs', mergedColumnData);
        updateSortConfig();
        updateLockedColumnsConfig();
        updateFilters(gridRef.current?.api, filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columnData, customColumns]);

    useEffect(() => {
        updateSortConfig();
    }, [updateSortConfig]);

    useEffect(() => {
        updateLockedColumnsConfig();
    }, [updateLockedColumnsConfig]);

    const cleanTableState = useCallback(() => {
        gridRef?.current?.api.setFilterModel(null);
        // reset aggrid column definitions
        gridRef.current?.api.setGridOption('columnDefs', []);
        gridRef?.current?.api.applyColumnState({
            defaultState: { sort: null },
        });
    }, []);

    const { isExternalFilterPresent, doesFormulaFilteringPass } = useSpreadsheetGsFilter(tableDefinition.type);

    const formatFetchedEquipmentsHandler = useCallback(
        (fetchedEquipments: any) => {
            //Format the equipments data to set calculated fields, so that the edition validation is consistent with the displayed data
            return formatFetchedEquipments(tableDefinition.type, fetchedEquipments);
        },
        [tableDefinition.type]
    );

    const { equipments, errorMessage } = useSpreadsheetEquipments(
        tableDefinition.type,
        tableDefinition.fetchers,
        formatFetchedEquipmentsHandler
    );

    useEffect(() => {
        if (errorMessage) {
            snackError({
                messageTxt: errorMessage,
                headerId: 'SpreadsheetFetchError',
            });
        }
    }, [errorMessage, snackError]);

    useEffect(() => {
        if (disabled || !equipments) {
            return;
        }

        let equipmentsWithCustomColumnInfo = [...equipments];
        if (tableDefinition.type) {
            Object.entries(additionalEquipmentsByNodesForCustomColumns).forEach(([nodeAlias, equipments]) => {
                const equipmentsToAdd = equipments[tableDefinition.type];
                if (equipmentsToAdd) {
                    equipmentsToAdd.forEach((equipmentToAdd) => {
                        let matchingEquipmentIndex = equipmentsWithCustomColumnInfo.findIndex(
                            (equipmentWithCustomColumnInfo) => equipmentWithCustomColumnInfo.id === equipmentToAdd.id
                        );
                        let matchingEquipment = equipmentsWithCustomColumnInfo[matchingEquipmentIndex];
                        if (matchingEquipment) {
                            let equipmentWithAddedInfo: RecursiveIdentifiable = { ...matchingEquipment };
                            equipmentWithAddedInfo[nodeAlias] = equipmentToAdd;
                            equipmentsWithCustomColumnInfo[matchingEquipmentIndex] = equipmentWithAddedInfo;
                        }
                    });
                }
            });
        }
        setRowData(equipmentsWithCustomColumnInfo);

        // To handle cases where a "customSpreadsheet" tab is opened.
        // This ensures that the grid correctly displays data specific to the custom tab.
        if (gridRef.current?.api) {
            gridRef.current.api.setGridOption('rowData', equipmentsWithCustomColumnInfo);
        }
    }, [tabIndex, disabled, equipments, additionalEquipmentsByNodesForCustomColumns, tableDefinition.type]);

    const handleSwitchTab = useCallback(
        (value: number) => {
            setManualTabSwitch(true);
            setTabIndex(value);
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
            }
        }
    }, [manualTabSwitch, equipmentId, equipmentType]);

    useEffect(() => {
        if (equipmentId !== null && equipmentType !== null && !manualTabSwitch) {
            const definition = tablesDefinitions.filter((def) => def.type === equipmentType)[0];
            if (definition) {
                if (tabIndex === definition.index) {
                    // already in expected tab => explicit call to scroll to expected row
                    scrollToEquipmentIndex();
                } else {
                    // select the right table type. This will trigger handleRowDataUpdated + scrollToEquipmentIndex
                    setTabIndex(definition.index);
                }
            }
        }
    }, [
        equipmentId,
        equipmentType,
        equipmentChanged,
        manualTabSwitch,
        tabIndex,
        scrollToEquipmentIndex,
        tablesDefinitions,
    ]);

    const handleColumnDrag = useCallback(
        (event: ColumnMovedEvent) => {
            const colId = event.column?.getColId();
            if (colId && event.finished && event.toIndex !== undefined) {
                let reorderedTableDefinitionIndexesTemp = [...formattedDisplayedColumnsNames];
                const sourceIndex = reorderedTableDefinitionIndexesTemp.findIndex((col) => col.colId === colId);
                const [reorderedItem] = reorderedTableDefinitionIndexesTemp.splice(sourceIndex, 1);
                reorderedTableDefinitionIndexesTemp.splice(event.toIndex, 0, reorderedItem);
                dispatch(changeDisplayedColumns({ index: tabIndex, value: reorderedTableDefinitionIndexesTemp }));
            }
        },
        [dispatch, formattedDisplayedColumnsNames, tabIndex]
    );

    const { modificationDialog, handleOpenModificationDialog } = useEquipmentModification({
        studyUuid,
        equipmentType: tableDefinition.type,
    });

    const onRowClicked = useCallback(
        (event: RowClickedEvent) => {
            const equipmentId = event.data.id;
            handleOpenModificationDialog(equipmentId);
        },
        [handleOpenModificationDialog]
    );

    return (
        <>
            <Grid container justifyContent={'space-between'}>
                <EquipmentTabs disabled={disabled} tabIndex={tabIndex} handleSwitchTab={handleSwitchTab} />
                <Grid container columnSpacing={2} sx={styles.toolbar}>
                    <Grid item sx={styles.selectColumns}>
                        <SpreadsheetGsFilter equipmentType={tableDefinition.type} />
                    </Grid>
                    <Grid item>
                        <ColumnsConfig
                            tabIndex={tabIndex}
                            disabled={disabled || tableDefinition.columns.length === 0}
                        />
                    </Grid>
                    {developerMode && (
                        <Grid item>
                            <CustomColumnsConfig tabIndex={tabIndex} />
                        </Grid>
                    )}
                    {developerMode && (
                        <Grid item>
                            <CustomColumnsNodesConfig />
                        </Grid>
                    )}
                    <Grid item style={{ flexGrow: 1 }}></Grid>
                    <Grid item sx={styles.save}>
                        <SpreadsheetSave
                            tabIndex={tabIndex}
                            gridRef={gridRef}
                            columns={columnData}
                            tableName={tableDefinition.name}
                            disabled={disabled || rowData.length === 0}
                        />
                    </Grid>
                </Grid>
            </Grid>
            {disabled ? (
                <Alert sx={styles.invalidNode} severity="warning">
                    <FormattedMessage id="InvalidNode" />
                </Alert>
            ) : (
                <Box sx={mergeSx(styles.table)}>
                    <EquipmentTable
                        gridRef={gridRef}
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        rowData={rowData}
                        columnData={mergedColumnData}
                        fetched={!!equipments || !!errorMessage}
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
