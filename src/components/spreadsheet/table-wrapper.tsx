/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import { Alert, Box, Grid } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { REORDERED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE } from './utils/constants';
import { EquipmentTable } from './equipment-table';
import { Identifiable, useSnackMessage } from '@gridsuite/commons-ui';
import { PARAM_DEVELOPER_MODE } from '../../utils/config-params';
import { ColumnsConfig } from './columns-config';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { EquipmentTabs } from './equipment-tabs';
import { EquipmentProps, useSpreadsheetEquipments } from './use-spreadsheet-equipments';
import { updateConfigParameter } from '../../services/config';
import { formatFetchedEquipments } from './utils/equipment-table-utils';
import { SPREADSHEET_SORT_STORE } from 'utils/store-sort-filter-fields';
import { useCustomColumn } from './custom-columns/use-custom-column';
import CustomColumnsConfig from './custom-columns/custom-columns-config';
import { AppState, CurrentTreeNode } from '../../redux/reducer';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ColumnMovedEvent, ColumnState, RowClickedEvent } from 'ag-grid-community';
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
    const gridRef = useRef<AgGridReact>(null);
    const timerRef = useRef<NodeJS.Timeout>();
    const { snackError } = useSnackMessage();
    const [tabIndex, setTabIndex] = useState<number>(0);

    const allDisplayedColumnsNames = useSelector((state: AppState) => state.tables.columnsNamesJson);
    const allLockedColumnsNames = useSelector((state: AppState) => state.allLockedColumnsNames);
    const allReorderedTableDefinitionIndexes = useSelector(
        (state: AppState) => state.allReorderedTableDefinitionIndexes
    );
    const tablesNames = useSelector((state: AppState) => state.tables.names);
    const customColumnsDefinitions = useSelector(
        (state: AppState) => state.tables.allCustomColumnsDefinitions[tablesNames[tabIndex]].columns
    );
    const additionalEquipmentsByNodesForCustomColumns = useSelector(
        (state: AppState) => state.additionalEquipmentsByNodesForCustomColumns
    );
    const tablesDefinitionIndexes = useSelector((state: AppState) => state.tables.definitionIndexes);
    const tablesDefinitionTypes = useSelector((state: AppState) => state.tables.definitionTypes);
    const developerMode = useSelector((state: AppState) => state[PARAM_DEVELOPER_MODE]);

    const [selectedColumnsNames, setSelectedColumnsNames] = useState<Set<string>>(new Set());
    const [lockedColumnsNames, setLockedColumnsNames] = useState<Set<string>>(new Set());
    const [reorderedTableDefinitionIndexes, setReorderedTableDefinitionIndexes] = useState<string[]>([]);

    const [manualTabSwitch, setManualTabSwitch] = useState<boolean>(true);

    const [rowData, setRowData] = useState<Identifiable[]>([]);

    const isLockedColumnNamesEmpty = useMemo(() => lockedColumnsNames.size === 0, [lockedColumnsNames.size]);

    const [columnData, setColumnData] = useState<CustomColDef[]>([]);
    const [customColumnData, setCustomColumnData] = useState<CustomColDef[]>([]);
    const [mergedColumnData, setMergedColumnData] = useState<ColDef[]>([]);

    const { createCustomColumn } = useCustomColumn(tabIndex);

    const currentColumns = useCallback(() => {
        const equipment = tablesDefinitionIndexes.get(tabIndex);
        return equipment ? equipment.columns : [];
    }, [tabIndex, tablesDefinitionIndexes]);

    const currentTabName = useCallback(() => {
        const equipment = tablesDefinitionIndexes.get(tabIndex);
        return equipment ? equipment.name : '';
    }, [tabIndex, tablesDefinitionIndexes]);

    const currentTabType = useCallback(() => {
        const equipment = tablesDefinitionIndexes.get(tabIndex);
        return equipment ? equipment.type : EQUIPMENT_TYPES.SUBSTATION;
    }, [tabIndex, tablesDefinitionIndexes]);
    const sortConfig = useSelector((state: AppState) => state.tableSort[SPREADSHEET_SORT_STORE][currentTabName()]);

    const updateSortConfig = useCallback(() => {
        gridRef.current?.api?.applyColumnState({
            state: sortConfig,
            defaultState: { sort: null },
        });
    }, [sortConfig]);

    const updateLockedColumnsConfig = useCallback(() => {
        const lockedColumnsConfig = currentColumns()
            .filter((column) => lockedColumnsNames.has(column.colId!))
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
    }, [currentColumns, lockedColumnsNames]);

    useEffect(() => {
        setCustomColumnData(createCustomColumn());
    }, [tabIndex, customColumnsDefinitions, createCustomColumn]);

    useEffect(() => {
        const mergedColumns = [...columnData, ...customColumnData];
        setMergedColumnData(mergedColumns);
        gridRef.current?.api?.setGridOption('columnDefs', mergedColumns);
        updateSortConfig();
        updateLockedColumnsConfig();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columnData, customColumnData]);

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

    const { filters } = useFilterSelector(FilterType.Spreadsheet, currentTabName());

    useEffect(() => {
        updateFilters(gridRef.current?.api, filters);
    });

    const equipmentDefinition = useMemo(
        () => ({
            type: currentTabType(),
            fetchers: tablesDefinitionIndexes.get(tabIndex)?.fetchers,
        }),
        [currentTabType, tablesDefinitionIndexes, tabIndex]
    );

    const { isExternalFilterPresent, doesFormulaFilteringPass } = useSpreadsheetGsFilter(equipmentDefinition.type);

    const formatFetchedEquipmentsHandler = useCallback(
        (fetchedEquipments: any) => {
            //Format the equipments data to set calculated fields, so that the edition validation is consistent with the displayed data
            return formatFetchedEquipments(equipmentDefinition.type, fetchedEquipments);
        },
        [equipmentDefinition.type]
    );

    const { equipments, errorMessage, isFetching } = useSpreadsheetEquipments(
        equipmentDefinition as EquipmentProps,
        formatFetchedEquipmentsHandler,
        tabIndex
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
        if (equipmentDefinition.type) {
            Object.entries(additionalEquipmentsByNodesForCustomColumns).forEach(([nodeAlias, equipments]) => {
                const equipmentsToAdd = equipments[equipmentDefinition.type];
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
    }, [
        tabIndex,
        disabled,
        equipments,
        tablesNames,
        additionalEquipmentsByNodesForCustomColumns,
        equipmentDefinition.type,
    ]);

    const handleSwitchTab = useCallback(
        (value: number) => {
            setManualTabSwitch(true);
            setTabIndex(value);
            cleanTableState();
        },
        [cleanTableState]
    );

    useEffect(() => {
        return () => clearTimeout(timerRef.current);
    }, [tabIndex]);

    useEffect(() => {
        const allDisplayedTemp = allDisplayedColumnsNames[tabIndex];
        setSelectedColumnsNames(new Set(allDisplayedTemp ? JSON.parse(allDisplayedTemp) : []));
    }, [tabIndex, allDisplayedColumnsNames]);

    useEffect(() => {
        const allLockedTemp = allLockedColumnsNames[tabIndex];
        setLockedColumnsNames(new Set(allLockedTemp ? JSON.parse(allLockedTemp) : []));
    }, [tabIndex, allLockedColumnsNames]);

    useEffect(() => {
        const allReorderedTemp = allReorderedTableDefinitionIndexes[tabIndex];
        setReorderedTableDefinitionIndexes(
            allReorderedTemp
                ? JSON.parse(allReorderedTemp)
                : tablesDefinitionIndexes.get(tabIndex)?.columns.map((item) => item.colId)
        );
    }, [allReorderedTableDefinitionIndexes, tabIndex, tablesDefinitionIndexes]);

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
            const definition = tablesDefinitionTypes.get(equipmentType);
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
        tablesDefinitionTypes,
    ]);

    const handleRowDataUpdated = useCallback(() => {
        scrollToEquipmentIndex();
        // wait a moment  before removing the loading message.
        timerRef.current = setTimeout(() => {
            gridRef.current?.api?.hideOverlay();
            if (rowData.length === 0 && !isFetching) {
                // we need to call showNoRowsOverlay in order to show message when rowData is empty
                gridRef.current?.api?.showNoRowsOverlay();
            }
        }, 50);
    }, [scrollToEquipmentIndex, isFetching, rowData]);

    const handleColumnDrag = useCallback(
        (event: ColumnMovedEvent) => {
            // @ts-ignore FIXME how to properly retrieve column id here ?
            const colId = event.column?.getUserProvidedColDef()?.colId ?? '';
            if (event.finished && colId !== '' && event.toIndex !== undefined) {
                let tmpIndexes = Object.assign([], reorderedTableDefinitionIndexes);
                const colIdx = tmpIndexes.indexOf(colId);
                if (colIdx === -1) {
                    console.warn(`handleColumnDrag: cannot find colId "${colId}" in ${tmpIndexes}`);
                } else {
                    const [reorderedItem] = tmpIndexes.splice(colIdx, 1);
                    const destinationIndex: number = event.toIndex;
                    tmpIndexes.splice(destinationIndex, 0, reorderedItem);
                    if (reorderedTableDefinitionIndexes.toString() !== tmpIndexes.toString()) {
                        setReorderedTableDefinitionIndexes(tmpIndexes);
                        updateConfigParameter(
                            REORDERED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE + tablesNames[tabIndex],
                            JSON.stringify(tmpIndexes)
                        ).catch((error) => {
                            snackError({
                                messageTxt: error.message,
                                headerId: 'paramsChangingError',
                            });
                        });

                        let tmpData = Object.assign([], columnData);
                        const [reorderedColDef] = tmpData.splice(
                            tmpData.findIndex((obj: any) => {
                                return obj.colId === colId;
                            }),
                            1
                        );
                        tmpData.splice(event.toIndex, 0, reorderedColDef);
                        setColumnData(tmpData);
                    }
                }
            }
        },
        [columnData, reorderedTableDefinitionIndexes, snackError, tabIndex, tablesNames]
    );

    const generateTableColumns = useCallback(() => {
        return currentColumns()
            .filter((c) => {
                return selectedColumnsNames.has(c.colId!);
            })
            .sort(
                (a, b) =>
                    reorderedTableDefinitionIndexes.indexOf(a.colId!) -
                    reorderedTableDefinitionIndexes.indexOf(b.colId!)
            );
    }, [reorderedTableDefinitionIndexes, selectedColumnsNames, currentColumns]);

    useEffect(() => {
        setColumnData(generateTableColumns());
    }, [generateTableColumns]);

    const { modificationDialog, handleOpenModificationDialog } = useEquipmentModification({ studyUuid, tabIndex });

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
                        <SpreadsheetGsFilter equipmentType={equipmentDefinition.type} />
                    </Grid>
                    <Grid item>
                        <ColumnsConfig
                            tabIndex={tabIndex}
                            disabled={disabled || currentColumns().length === 0}
                            reorderedTableDefinitionIndexes={reorderedTableDefinitionIndexes}
                            setReorderedTableDefinitionIndexes={setReorderedTableDefinitionIndexes}
                            selectedColumnsNames={selectedColumnsNames}
                            setSelectedColumnsNames={setSelectedColumnsNames}
                            lockedColumnsNames={lockedColumnsNames}
                            setLockedColumnsNames={setLockedColumnsNames}
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
                            tableName={currentTabName()}
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
                        handleRowDataUpdated={handleRowDataUpdated}
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
