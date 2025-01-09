/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';

import { Alert, Box, Grid } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { MIN_COLUMN_WIDTH, REORDERED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE } from './utils/constants';
import { EquipmentTable } from './equipment-table';
import { Identifiable, useSnackMessage } from '@gridsuite/commons-ui';
import { PARAM_DEVELOPER_MODE } from '../../utils/config-params';
import { DefaultCellRenderer } from './utils/cell-renderers';
import { ColumnsConfig } from './columns-config';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { EquipmentTabs } from './equipment-tabs';
import { EquipmentProps, useSpreadsheetEquipments } from './use-spreadsheet-equipments';
import { updateConfigParameter } from '../../services/config';
import { formatFetchedEquipments } from './utils/equipment-table-utils';
import { makeAgGridCustomHeaderColumn } from 'components/custom-aggrid/custom-aggrid-header-utils';
import { useAggridLocalRowFilter } from 'hooks/use-aggrid-local-row-filter';
import { useAgGridSort } from 'hooks/use-aggrid-sort';
import { setSpreadsheetFilter } from 'redux/actions';
import { SPREADSHEET_SORT_STORE, SPREADSHEET_STORE_FIELD } from 'utils/store-sort-filter-fields';
import { useCustomColumn } from './custom-columns/use-custom-column';
import CustomColumnsConfig from './custom-columns/custom-columns-config';
import { AppState, CurrentTreeNode } from '../../redux/reducer';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ColumnMovedEvent, ColumnState } from 'ag-grid-community';
import { mergeSx } from '../utils/functions';
import { CustomAggridFilterParams, CustomColDef } from '../custom-aggrid/custom-aggrid-header.type';
import { SpreadsheetEquipmentType } from './config/spreadsheet.type';
import SpreadsheetSave from './spreadsheet-save';
import { CustomAggridAutocompleteFilterParams } from '../custom-aggrid/custom-aggrid-filters/custom-aggrid-autocomplete-filter';

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
    }),
    filter: (theme: Theme) => ({
        marginLeft: theme.spacing(1),
    }),
    selectColumns: (theme: Theme) => ({
        marginLeft: theme.spacing(4),
    }),
    save: (theme: Theme) => ({
        marginRight: theme.spacing(1),
    }),
};

interface TableWrapperProps {
    studyUuid: string;
    currentNode: CurrentTreeNode;
    equipmentId: string;
    equipmentType: SpreadsheetEquipmentType;
    equipmentChanged: boolean;
    disabled: boolean;
}

const TableWrapper: FunctionComponent<TableWrapperProps> = ({
    studyUuid,
    currentNode,
    equipmentId,
    equipmentType,
    equipmentChanged,
    disabled,
}) => {
    const gridRef = useRef<AgGridReact>(null);
    const timerRef = useRef<NodeJS.Timeout>();
    const intl = useIntl();
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

    useEffect(() => {
        setCustomColumnData(createCustomColumn());
    }, [tabIndex, customColumnsDefinitions, createCustomColumn]);

    useEffect(() => {
        const mergedColumns = [...columnData, ...customColumnData];
        setMergedColumnData(mergedColumns);
        gridRef.current?.api?.setGridOption('columnDefs', mergedColumns);
    }, [columnData, customColumnData]);

    const cleanTableState = useCallback(() => {
        gridRef?.current?.api.setFilterModel(null);
        // reset aggrid column definitions
        gridRef.current?.api.setGridOption('columnDefs', []);
        gridRef?.current?.api.applyColumnState({
            defaultState: { sort: null },
        });
    }, []);

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

    const { onSortChanged, sortConfig } = useAgGridSort(SPREADSHEET_SORT_STORE, currentTabName());

    const { updateFilter, filterSelector } = useAggridLocalRowFilter(gridRef, {
        filterType: SPREADSHEET_STORE_FIELD,
        filterTab: currentTabName(),
        filterStoreAction: setSpreadsheetFilter,
    });

    const equipmentDefinition = useMemo(
        () => ({
            type: currentTabType(),
            fetchers: tablesDefinitionIndexes.get(tabIndex)?.fetchers,
        }),
        [currentTabType, tablesDefinitionIndexes, tabIndex]
    );

    const formatFetchedEquipmentsHandler = useCallback(
        (fetchedEquipments: any) => {
            //Format the equipments data to set calculated fields, so that the edition validation is consistent with the displayed data
            return formatFetchedEquipments(equipmentDefinition.type, fetchedEquipments);
        },
        [equipmentDefinition.type]
    );

    const { equipments, errorMessage, isFetching } = useSpreadsheetEquipments(
        equipmentDefinition as EquipmentProps,
        formatFetchedEquipmentsHandler
    );

    const enrichColumn = useCallback(
        (column: CustomColDef<any, any, CustomAggridAutocompleteFilterParams & CustomAggridFilterParams>) => {
            const columnExtended = { ...column };
            columnExtended.headerName = intl.formatMessage({ id: columnExtended.id });

            if (columnExtended.cellRenderer == null) {
                columnExtended.cellRenderer = DefaultCellRenderer;
            }

            columnExtended.width = columnExtended.columnWidth || MIN_COLUMN_WIDTH;

            //if it is not the first render the column might already have a pinned value so we need to handle the case where it needs to be reseted to undefined
            //we reuse and mutate the column objects so we need to clear to undefined
            columnExtended.pinned = lockedColumnsNames.has(columnExtended.id) ? 'left' : undefined;

            columnExtended.filterComponentParams = {
                filterParams: {
                    updateFilter,
                    filterSelector,
                    ...columnExtended?.filterComponentParams?.filterParams,
                },
            };

            return makeAgGridCustomHeaderColumn({
                headerName: columnExtended.headerName,
                field: columnExtended.field,
                sortProps: {
                    onSortChanged,
                    sortConfig,
                },
                ...columnExtended,
            });
        },
        [intl, lockedColumnsNames, updateFilter, filterSelector, onSortChanged, sortConfig]
    );
    useEffect(() => {
        if (errorMessage) {
            snackError({
                messageTxt: errorMessage,
                headerId: 'SpreadsheetFetchError',
            });
        }
    }, [errorMessage, snackError]);

    // Ensure initial sort is applied by including mergedColumnData in dependencies
    useEffect(() => {
        gridRef.current?.api?.applyColumnState({
            state: sortConfig,
            defaultState: { sort: null },
        });
    }, [sortConfig, mergedColumnData]);

    useEffect(() => {
        if (disabled || !equipments) {
            return;
        }
        // To handle cases where a "customSpreadsheet" tab is opened.
        // This ensures that the grid correctly displays data specific to the custom tab.
        if (gridRef.current?.api) {
            gridRef.current.api.setGridOption('rowData', equipments);
        }
        setRowData(equipments);
    }, [tabIndex, disabled, equipments]);

    const handleSwitchTab = useCallback(
        (value: number) => {
            setManualTabSwitch(true);
            setTabIndex(value);
            cleanTableState();
        },
        [cleanTableState]
    );

    useEffect(() => {
        gridRef.current?.api?.showLoadingOverlay();
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
                : tablesDefinitionIndexes.get(tabIndex)?.columns.map((item) => item.id)
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

    useEffect(() => {
        const lockedColumnsConfig = currentColumns()
            .filter((column) => lockedColumnsNames.has(column.id))
            .map((column) => {
                const s: ColumnState = {
                    colId: column.field ?? '',
                    pinned: 'left',
                };
                return s;
            });
        gridRef.current?.api?.applyColumnState({
            state: lockedColumnsConfig,
            defaultState: { pinned: null },
        });
    }, [lockedColumnsNames, currentColumns]);

    const handleColumnDrag = useCallback(
        (event: ColumnMovedEvent) => {
            // @ts-ignore FIXME how to properly retrieve column id here ?
            const colId = event.column?.getUserProvidedColDef()?.id ?? '';
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
                                return obj.id === colId;
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
        let selectedTableColumns = currentColumns()
            .filter((c) => {
                return selectedColumnsNames.has(c.id);
            })
            .map((column) => enrichColumn(column));

        function sortByIndex(a: any, b: any) {
            return reorderedTableDefinitionIndexes.indexOf(a.id) - reorderedTableDefinitionIndexes.indexOf(b.id);
        }

        selectedTableColumns.sort(sortByIndex);

        return selectedTableColumns;
    }, [enrichColumn, reorderedTableDefinitionIndexes, selectedColumnsNames, currentColumns]);

    useEffect(() => {
        setColumnData(generateTableColumns());
    }, [generateTableColumns]);

    return (
        <>
            <Grid container justifyContent={'space-between'}>
                <EquipmentTabs disabled={disabled} tabIndex={tabIndex} handleSwitchTab={handleSwitchTab} />
                <Grid container columnSpacing={2} sx={styles.toolbar}>
                    <Grid item sx={styles.selectColumns}>
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
                    />
                </Box>
            )}
        </>
    );
};
export default TableWrapper;
