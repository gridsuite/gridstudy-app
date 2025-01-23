/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';

import { Alert, Box, Grid } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { EDIT_COLUMN, MIN_COLUMN_WIDTH, REORDERED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE } from './utils/constants';
import { EquipmentTable } from './equipment-table';
import { Identifiable, useSnackMessage } from '@gridsuite/commons-ui';
import { PARAM_DEVELOPER_MODE, PARAM_FLUX_CONVENTION } from '../../utils/config-params';
import { RunningStatus } from '../utils/running-status';
import {
    DefaultCellRenderer,
    EditableCellRenderer,
    EditingCellRenderer,
    ReferenceLineCellRenderer,
} from './utils/cell-renderers';
import { ColumnsConfig } from './columns-config';
import { EQUIPMENT_INFOS_TYPES, EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { GlobalFilter } from './global-filter';
import { EquipmentTabs } from './equipment-tabs';
import { EquipmentProps, useSpreadsheetEquipments } from './use-spreadsheet-equipments';
import { updateConfigParameter } from '../../services/config';
import {
    formatPropertiesForBackend,
    modifyBattery,
    modifyGenerator,
    modifyLoad,
    modifyShuntCompensator,
    modifySubstation,
    modifyTwoWindingsTransformer,
    modifyVoltageLevel,
    requestNetworkChange,
} from '../../services/study/network-modifications';
import {
    LOAD_TAP_CHANGING_CAPABILITIES,
    LOW_TAP_POSITION,
    REGULATING,
    REGULATION_MODE,
    REGULATION_SIDE,
    REGULATION_TYPE,
    TAP_POSITION,
    TARGET_DEADBAND,
    TARGET_V,
} from 'components/utils/field-constants';
import {
    checkValidationsAndRefreshCells,
    deepFindValue,
    formatFetchedEquipment,
    formatFetchedEquipments,
    updateGeneratorCells,
    updateShuntCompensatorCells,
    updateTwtCells,
} from './utils/equipment-table-utils';
import { fetchNetworkElementInfos } from 'services/study/network';
import { toModificationOperation } from 'components/utils/utils';
import { sanitizeString } from 'components/dialogs/dialog-utils';
import { REGULATION_TYPES, SHUNT_COMPENSATOR_TYPES } from 'components/network/constants';
import ComputingType from 'components/computing-status/computing-type';
import { makeAgGridCustomHeaderColumn } from 'components/custom-aggrid/custom-aggrid-header-utils';
import { useAggridLocalRowFilter } from 'hooks/use-aggrid-local-row-filter';
import { useAgGridSort } from 'hooks/use-aggrid-sort';
import { setSpreadsheetFilter, updateEquipments } from 'redux/actions';
import { useLocalizedCountries } from 'components/utils/localized-countries-hook';
import { SPREADSHEET_SORT_STORE, SPREADSHEET_STORE_FIELD } from 'utils/store-sort-filter-fields';
import { useCustomColumn } from './custom-columns/use-custom-column';
import CustomColumnsConfig from './custom-columns/custom-columns-config';
import { AppState, CurrentTreeNode, EquipmentUpdateType, getUpdateTypeFromEquipmentType } from '../../redux/reducer';
import { AgGridReact } from 'ag-grid-react';
import {
    CellEditingStartedEvent,
    CellEditingStoppedEvent,
    ColDef,
    ColumnMovedEvent,
    ColumnState,
    ICellRendererParams,
} from 'ag-grid-community';
import { mergeSx } from '../utils/functions';
import {
    CustomAggridFilterParams,
    CustomColDef,
    FILTER_NUMBER_COMPARATORS,
    FilterEnumsType,
} from '../custom-aggrid/custom-aggrid-header.type';
import { FluxConventions } from '../dialogs/parameters/network-parameters';
import { SpreadsheetEquipmentType } from './config/spreadsheet.type';
import SpreadsheetSave from './spreadsheet-save';
import CustomColumnsNodesConfig from './custom-columns/custom-columns-nodes-config';
import { CustomAggridAutocompleteFilterParams } from '../custom-aggrid/custom-aggrid-filters/custom-aggrid-autocomplete-filter';

const useEditBuffer = (): [Record<string, unknown>, (field: string, value: unknown) => void, () => void] => {
    //the data is fed and read during the edition validation process so we don't need to rerender after a call to one of available methods thus useRef is more suited
    const data = useRef<Record<string, unknown>>({});

    const addDataToBuffer = useCallback(
        (field: string, value: unknown) => {
            data.current[field] = value;
        },
        [data]
    );

    const resetBuffer = useCallback(() => {
        data.current = {};
    }, [data]);

    return [data.current, addDataToBuffer, resetBuffer];
};

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
    currentRootNetworkUuid: string;
    equipmentId: string;
    equipmentType: SpreadsheetEquipmentType;
    equipmentChanged: boolean;
    disabled: boolean;
}

interface RecursiveIdentifiable extends Identifiable {
    [alias: string]: Identifiable | string | undefined;
}

const TableWrapper: FunctionComponent<TableWrapperProps> = ({
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
    const intl = useIntl();
    const { translate } = useLocalizedCountries();
    const { snackError } = useSnackMessage();
    const dispatch = useDispatch();
    const [tabIndex, setTabIndex] = useState<number>(0);

    const loadFlowStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.LOAD_FLOW]);

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

    const fluxConvention = useSelector((state: AppState) => state[PARAM_FLUX_CONVENTION]);
    const studyUpdatedForce = useSelector((state: AppState) => state.studyUpdated);

    const [lastModifiedEquipment, setLastModifiedEquipment] = useState<any>();

    const [manualTabSwitch, setManualTabSwitch] = useState<boolean>(true);

    const [rowData, setRowData] = useState<Identifiable[]>([]);

    const [priorValuesBuffer, addDataToBuffer, resetBuffer] = useEditBuffer();
    const [editingData, setEditingData] = useState<any>();
    const editingDataRef = useRef(editingData);

    const isLockedColumnNamesEmpty = useMemo(() => lockedColumnsNames.size === 0, [lockedColumnsNames.size]);

    const [columnData, setColumnData] = useState<CustomColDef[]>([]);
    const [customColumnData, setCustomColumnData] = useState<CustomColDef[]>([]);
    const [mergedColumnData, setMergedColumnData] = useState<ColDef[]>([]);

    const { createCustomColumn } = useCustomColumn(tabIndex);

    const globalFilterRef = useRef<any>();

    useEffect(() => {
        setCustomColumnData(createCustomColumn());
    }, [tabIndex, customColumnsDefinitions, createCustomColumn]);

    useEffect(() => {
        const mergedColumns = [...columnData, ...customColumnData];
        setMergedColumnData(mergedColumns);
        gridRef.current?.api?.setGridOption('columnDefs', mergedColumns);
    }, [columnData, customColumnData]);

    const rollbackEdit = useCallback(() => {
        resetBuffer();
        setEditingData(undefined);
        editingDataRef.current = editingData;
    }, [resetBuffer, editingData]);

    const cleanTableState = useCallback(() => {
        globalFilterRef.current?.resetFilter();
        gridRef?.current?.api.setFilterModel(null);
        // reset aggrid column definitions
        gridRef.current?.api.setGridOption('columnDefs', []);
        gridRef?.current?.api.applyColumnState({
            defaultState: { sort: null },
        });
        rollbackEdit();
    }, [rollbackEdit]);

    const applyFluxConvention = useCallback(
        (val: number) => {
            return fluxConvention === FluxConventions.TARGET && val !== undefined ? -val : val;
        },
        [fluxConvention]
    );

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

    const isEditColumnVisible = useCallback(() => {
        return (
            !disabled &&
            currentTabType() &&
            currentColumns()
                .filter((c) => c.editable)
                .filter((c) => selectedColumnsNames.has(c.colId)).length > 0
        );
    }, [disabled, selectedColumnsNames, currentTabType, currentColumns]);

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

    const formatFetchedEquipmentHandler = useCallback(
        (fetchedEquipment: any) => {
            return formatFetchedEquipment(equipmentDefinition.type, fetchedEquipment);
        },
        [equipmentDefinition.type]
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
        formatFetchedEquipmentsHandler,
        tabIndex
    );

    // Function to get the columns that have isEnum filter set to true in customFilterParams
    const getEnumFilterColumns = useCallback(() => {
        return currentColumns().filter((c) => c?.context?.isEnum);
    }, [currentColumns]);

    const generateEquipmentsFilterEnums = useCallback(() => {
        if (!equipments) {
            return {};
        }
        const filterEnums: FilterEnumsType = {};
        getEnumFilterColumns().forEach((column) => {
            filterEnums[column.colId ?? ''] = [
                ...new Set(
                    equipments
                        .map((equipment: any) => deepFindValue(equipment, column.field))
                        .filter((value: any) => value != null)
                ),
            ];
        });
        return filterEnums;
    }, [getEnumFilterColumns, equipments]);

    const filterEnums = useMemo(() => generateEquipmentsFilterEnums(), [generateEquipmentsFilterEnums]);

    const enrichColumn = useCallback(
        (column: CustomColDef<any, any, CustomAggridAutocompleteFilterParams & CustomAggridFilterParams>) => {
            const columnExtended = { ...column };
            columnExtended.headerName = intl.formatMessage({ id: columnExtended.colId });

            if (columnExtended?.context?.numeric) {
                //numeric columns need the loadflow status in order to apply a specific css class in case the loadflow is invalid to highlight the value has not been computed
                const isValueInvalid =
                    loadFlowStatus !== RunningStatus.SUCCEED && columnExtended?.context?.canBeInvalidated;

                columnExtended.cellRendererParams = {
                    isValueInvalid: isValueInvalid,
                };
                if (columnExtended?.context?.withFluxConvention) {
                    // We enrich "flux convention" properties here (and not in config-tables) because we use a hook
                    // to get the convention, which requires a component context.
                    columnExtended.cellRendererParams.applyFluxConvention = applyFluxConvention;
                    columnExtended.comparator = (valueA: number, valueB: number) => {
                        const normedValueA = valueA !== undefined ? applyFluxConvention(valueA) : undefined;
                        const normedValueB = valueB !== undefined ? applyFluxConvention(valueB) : undefined;
                        if (normedValueA !== undefined && normedValueB !== undefined) {
                            return normedValueA - normedValueB;
                        } else if (normedValueA === undefined && normedValueB === undefined) {
                            return 0;
                        } else if (normedValueA === undefined) {
                            return -1;
                        } else if (normedValueB === undefined) {
                            return 1;
                        }
                        return 0;
                    };
                    // redefine agGrid predicates to possibly invert sign depending on flux convention (called when we use useAggridLocalRowFilter).
                    columnExtended.context = {
                        ...columnExtended.context,
                        agGridFilterParams: {
                            filterOptions: [
                                {
                                    displayKey: FILTER_NUMBER_COMPARATORS.GREATER_THAN_OR_EQUAL,
                                    displayName: FILTER_NUMBER_COMPARATORS.GREATER_THAN_OR_EQUAL,
                                    predicate: (filterValues: number[], cellValue: number) => {
                                        const filterValue = filterValues.at(0);
                                        if (filterValue === undefined) {
                                            return false;
                                        }
                                        const transformedValue = applyFluxConvention(cellValue);
                                        return transformedValue != null ? transformedValue >= filterValue : false;
                                    },
                                },
                                {
                                    displayKey: FILTER_NUMBER_COMPARATORS.LESS_THAN_OR_EQUAL,
                                    displayName: FILTER_NUMBER_COMPARATORS.LESS_THAN_OR_EQUAL,
                                    predicate: (filterValues: number[], cellValue: number) => {
                                        const filterValue = filterValues.at(0);
                                        if (filterValue === undefined) {
                                            return false;
                                        }
                                        const transformedValue = applyFluxConvention(cellValue);
                                        return transformedValue != null ? transformedValue <= filterValue : false;
                                    },
                                },
                            ],
                        },
                    };
                }
            }

            if (columnExtended.cellRenderer == null) {
                columnExtended.cellRenderer = DefaultCellRenderer;
            }

            columnExtended.width = columnExtended?.context?.columnWidth || MIN_COLUMN_WIDTH;

            //if it is not the first render the column might already have a pinned value so we need to handle the case where it needs to be reseted to undefined
            //we reuse and mutate the column objects so we need to clear to undefined
            columnExtended.pinned = lockedColumnsNames.has(columnExtended.colId) ? 'left' : undefined;

            columnExtended.context = {
                ...columnExtended?.context,
                filterComponentParams: {
                    filterParams: {
                        updateFilter,
                        filterSelector,
                        ...columnExtended?.context?.filterComponentParams?.filterParams,
                    },
                },
            };

            //Set sorting comparator for enum columns so it sorts the translated values instead of the enum values
            if (columnExtended?.context?.isEnum) {
                const getTranslatedOrOriginalValue = (value: string): string => {
                    if (value === undefined || value === null) {
                        return '';
                    }
                    if (columnExtended?.context?.isCountry) {
                        return translate(value);
                    } else if (columnExtended?.context?.getEnumLabel) {
                        const labelId = columnExtended?.context?.getEnumLabel(value);
                        return intl.formatMessage({
                            id: labelId || value,
                            defaultMessage: value,
                        });
                    }
                    return value;
                };

                columnExtended.comparator = (valueA: string, valueB: string) => {
                    const translatedValueA = getTranslatedOrOriginalValue(valueA);
                    const translatedValueB = getTranslatedOrOriginalValue(valueB);

                    return translatedValueA.localeCompare(translatedValueB);
                };

                columnExtended.context.filterComponentParams = {
                    ...(columnExtended.context?.filterComponentParams as CustomAggridFilterParams),
                    filterEnums: filterEnums,
                    getEnumLabel: getTranslatedOrOriginalValue,
                };
            }
            return makeAgGridCustomHeaderColumn({
                headerName: columnExtended.headerName,
                field: columnExtended.field,
                ...columnExtended,
                context: {
                    ...columnExtended.context,
                    sortProps: {
                        onSortChanged,
                        sortConfig,
                    },
                },
            });
        },
        [
            intl,
            lockedColumnsNames,
            updateFilter,
            filterSelector,
            filterEnums,
            translate,
            onSortChanged,
            sortConfig,
            loadFlowStatus,
            applyFluxConvention,
        ]
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

    const handleGridReady = useCallback(() => {
        if (globalFilterRef.current) {
            gridRef.current?.api?.setGridOption('quickFilterText', globalFilterRef.current.getFilterValue().value);
        }
        scrollToEquipmentIndex();
    }, [scrollToEquipmentIndex]);

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
            .filter((column) => lockedColumnsNames.has(column.colId))
            .map((column) => {
                const s: ColumnState = {
                    colId: column.field ?? '',
                    pinned: 'left',
                };
                return s;
            });
        if (isEditColumnVisible() && lockedColumnsConfig) {
            lockedColumnsConfig.unshift({
                colId: EDIT_COLUMN,
                pinned: 'left',
            });
        }
        gridRef.current?.api?.applyColumnState({
            state: lockedColumnsConfig,
            defaultState: { pinned: null },
        });
    }, [isEditColumnVisible, lockedColumnsNames, currentColumns]);

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
                    const destinationIndex: number = isEditColumnVisible() ? event.toIndex - 1 : event.toIndex;
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
        [columnData, isEditColumnVisible, reorderedTableDefinitionIndexes, snackError, tabIndex, tablesNames]
    );

    const getFieldValue = useCallback((newField: any, oldField: any) => {
        return newField !== oldField ? newField : null;
    }, []);

    const updateSubstation = useCallback(
        (editingData: any, propertiesForBackend: any) => {
            return modifySubstation({
                studyUuid: studyUuid,
                nodeUuid: currentNode?.id,
                id: editingData.id,
                name: editingData.name,
                country: editingData.country,
                properties: propertiesForBackend,
            });
        },
        [currentNode?.id, studyUuid]
    );

    const updateLoad = useCallback(
        (editingData: any, propertiesForBackend: any) => {
            return modifyLoad({
                studyUuid: studyUuid,
                nodeUuid: currentNode?.id,
                id: editingData.id,
                name: getFieldValue(editingData.name, editingDataRef.current.name),
                loadType: getFieldValue(editingData.type, editingDataRef.current.type),
                p0: getFieldValue(editingData.p0, editingDataRef.current.p0),
                q0: getFieldValue(editingData.q0, editingDataRef.current.q0),
                properties: propertiesForBackend,
            });
        },
        [currentNode?.id, studyUuid, getFieldValue]
    );

    const updateTwoWindingsTransformer = useCallback(
        (editingData: any, propertiesForBackend: any) => {
            let ratioTap = null;
            if (editingData?.ratioTapChanger) {
                ratioTap = {
                    [LOAD_TAP_CHANGING_CAPABILITIES]: toModificationOperation(
                        getFieldValue(
                            editingData.ratioTapChanger?.[LOAD_TAP_CHANGING_CAPABILITIES],
                            editingDataRef.current.ratioTapChanger?.[LOAD_TAP_CHANGING_CAPABILITIES]
                        )
                    ),
                    [TAP_POSITION]: toModificationOperation(
                        getFieldValue(
                            editingData.ratioTapChanger?.[TAP_POSITION],
                            editingDataRef.current.ratioTapChanger?.[TAP_POSITION]
                        )
                    ),
                    [LOW_TAP_POSITION]: toModificationOperation(
                        getFieldValue(
                            editingData.ratioTapChanger?.[LOW_TAP_POSITION],
                            editingDataRef.current.ratioTapChanger?.[LOW_TAP_POSITION]
                        )
                    ),
                    [REGULATING]: toModificationOperation(
                        getFieldValue(
                            editingData.ratioTapChanger?.[REGULATING],
                            editingDataRef.current.ratioTapChanger?.[REGULATING]
                        )
                    ),
                    [REGULATION_TYPE]: toModificationOperation(
                        getFieldValue(
                            editingData.ratioTapChanger?.[REGULATION_TYPE],
                            editingDataRef.current.ratioTapChanger?.[REGULATION_TYPE]
                        )
                    ),
                    [REGULATION_SIDE]: toModificationOperation(
                        getFieldValue(
                            editingData.ratioTapChanger?.[REGULATION_SIDE],
                            editingDataRef.current.ratioTapChanger?.[REGULATION_SIDE]
                        )
                    ),
                    regulatingTerminalId: toModificationOperation(
                        getFieldValue(
                            editingData.ratioTapChanger?.regulatingTerminalConnectableId,
                            editingDataRef.current.ratioTapChanger?.['regulatingTerminalConnectableId']
                        )
                    ),
                    regulatingTerminalType: toModificationOperation(
                        getFieldValue(
                            editingData.ratioTapChanger?.regulatingTerminalConnectableType,
                            editingDataRef.current.ratioTapChanger?.['regulatingTerminalConnectableType']
                        )
                    ),
                    regulatingTerminalVlId: toModificationOperation(
                        getFieldValue(
                            editingData.ratioTapChanger?.regulatingTerminalVlId,
                            editingDataRef.current.ratioTapChanger?.['regulatingTerminalVlId']
                        )
                    ),
                    [TARGET_V]: toModificationOperation(
                        getFieldValue(
                            editingData.ratioTapChanger?.[TARGET_V],
                            editingDataRef.current.ratioTapChanger?.[TARGET_V]
                        )
                    ),
                    [TARGET_DEADBAND]: toModificationOperation(
                        getFieldValue(
                            editingData.ratioTapChanger?.[TARGET_DEADBAND],
                            editingDataRef.current.ratioTapChanger?.[TARGET_DEADBAND]
                        )
                    ),
                    steps: null,
                };
            }
            let phaseTap = null;
            if (editingData?.phaseTapChanger) {
                phaseTap = {
                    [REGULATION_MODE]: toModificationOperation(
                        getFieldValue(
                            editingData.phaseTapChanger?.[REGULATION_MODE],
                            editingDataRef.current.phaseTapChanger?.[REGULATION_MODE]
                        )
                    ),
                    [TAP_POSITION]: toModificationOperation(
                        getFieldValue(
                            editingData.phaseTapChanger?.[TAP_POSITION],
                            editingDataRef.current.phaseTapChanger?.[TAP_POSITION]
                        )
                    ),
                    [LOW_TAP_POSITION]: toModificationOperation(
                        getFieldValue(
                            editingData.phaseTapChanger?.[LOW_TAP_POSITION],
                            editingDataRef.current.phaseTapChanger?.[LOW_TAP_POSITION]
                        )
                    ),
                    [REGULATION_TYPE]: toModificationOperation(
                        getFieldValue(
                            editingData.phaseTapChanger?.[REGULATION_TYPE],
                            editingDataRef.current.phaseTapChanger?.[REGULATION_TYPE]
                        )
                    ),
                    [REGULATION_SIDE]: toModificationOperation(
                        getFieldValue(
                            editingData.phaseTapChanger?.[REGULATION_SIDE],
                            editingDataRef.current.phaseTapChanger?.[REGULATION_SIDE]
                        )
                    ),
                    regulatingTerminalId: toModificationOperation(
                        getFieldValue(
                            editingData.phaseTapChanger?.regulatingTerminalConnectableId,
                            editingDataRef.current.phaseTapChanger?.['regulatingTerminalConnectableId']
                        )
                    ),
                    regulatingTerminalType: toModificationOperation(
                        getFieldValue(
                            editingData.phaseTapChanger?.regulatingTerminalConnectableType,
                            editingDataRef.current.phaseTapChanger?.['regulatingTerminalConnectableType']
                        )
                    ),
                    regulatingTerminalVlId: toModificationOperation(
                        getFieldValue(
                            editingData.phaseTapChanger?.regulatingTerminalVlId,
                            editingDataRef.current.phaseTapChanger?.['regulatingTerminalVlId']
                        )
                    ),
                    regulationValue: toModificationOperation(
                        getFieldValue(
                            editingData.phaseTapChanger?.regulationValue,
                            editingDataRef.current.phaseTapChanger?.regulationValue
                        )
                    ),
                    [TARGET_DEADBAND]: toModificationOperation(
                        getFieldValue(
                            editingData.phaseTapChanger?.[TARGET_DEADBAND],
                            editingDataRef.current.phaseTapChanger?.[TARGET_DEADBAND]
                        )
                    ),
                };
            }
            return modifyTwoWindingsTransformer({
                studyUuid: studyUuid,
                nodeUuid: currentNode?.id,
                twoWindingsTransformerId: editingData.id,
                twoWindingsTransformerName: toModificationOperation(
                    sanitizeString(getFieldValue(editingData?.name, editingDataRef.current?.name))
                ),
                r: toModificationOperation(getFieldValue(editingData.r, editingDataRef.current.r)),
                x: toModificationOperation(getFieldValue(editingData.x, editingDataRef.current.x)),
                g: toModificationOperation(getFieldValue(editingData.g, editingDataRef.current.g)),
                b: toModificationOperation(getFieldValue(editingData.b, editingDataRef.current.b)),
                ratedS: toModificationOperation(getFieldValue(editingData.ratedS, editingDataRef.current.ratedS)),
                ratedU1: toModificationOperation(getFieldValue(editingData.ratedU1, editingDataRef.current.ratedU1)),
                ratedU2: toModificationOperation(getFieldValue(editingData.ratedU2, editingDataRef.current.ratedU2)),
                ratioTapChanger: ratioTap,
                phaseTapChanger: phaseTap,
                properties: propertiesForBackend,
            });
        },
        [currentNode?.id, studyUuid, getFieldValue]
    );

    const updateGenerator = useCallback(
        (editingData: any, propertiesForBackend: any) => {
            const regulatingTerminalConnectableIdFieldValue = getFieldValue(
                editingData.regulatingTerminalConnectableId,
                editingDataRef.current?.regulatingTerminalConnectableId
            );
            const regulatingTerminalConnectableTypeFieldValue = getFieldValue(
                editingData.regulatingTerminalConnectableType,
                editingDataRef.current?.regulatingTerminalConnectableType
            );
            const regulatingTerminalVlIdFieldValue =
                regulatingTerminalConnectableIdFieldValue !== null ||
                regulatingTerminalConnectableTypeFieldValue !== null
                    ? editingData.regulatingTerminalVlId
                    : null;
            return modifyGenerator({
                studyUuid: studyUuid,
                nodeUuid: currentNode?.id,
                generatorId: editingData.id,
                name: getFieldValue(editingData.name, editingDataRef.current.name),
                energySource: getFieldValue(editingData.energySource, editingDataRef.current.energySource),
                minP: getFieldValue(editingData.minP, editingDataRef.current.minP),
                maxP: getFieldValue(editingData.maxP, editingDataRef.current.maxP),
                targetP: getFieldValue(editingData.targetP, editingDataRef.current.targetP),
                targetQ: getFieldValue(editingData.targetQ, editingDataRef.current.targetQ),
                voltageRegulation: getFieldValue(
                    editingData.voltageRegulatorOn,
                    editingDataRef.current.voltageRegulatorOn
                ),
                targetV: getFieldValue(editingData.targetV, editingDataRef.current.targetV),
                qPercent: getFieldValue(
                    editingData?.coordinatedReactiveControl?.qPercent,
                    editingDataRef.current?.coordinatedReactiveControl?.qPercent
                ),
                plannedActivePowerSetPoint: getFieldValue(
                    editingData?.generatorStartup?.plannedActivePowerSetPoint,
                    editingDataRef.current?.generatorStartup?.plannedActivePowerSetPoint
                ),
                marginalCost: getFieldValue(
                    editingData?.generatorStartup?.marginalCost,
                    editingDataRef.current?.generatorStartup?.marginalCost
                ),
                plannedOutageRate: getFieldValue(
                    editingData?.generatorStartup?.plannedOutageRate,
                    editingDataRef.current?.generatorStartup?.plannedOutageRate
                ),
                forcedOutageRate: getFieldValue(
                    editingData?.generatorStartup?.forcedOutageRate,
                    editingDataRef.current?.generatorStartup?.forcedOutageRate
                ),
                directTransX: getFieldValue(
                    editingData?.generatorShortCircuit?.directTransX,
                    editingDataRef.current?.generatorShortCircuit?.directTransX
                ),
                stepUpTransformerX: getFieldValue(
                    editingData?.generatorShortCircuit?.stepUpTransformerX,
                    editingDataRef.current?.generatorShortCircuit?.stepUpTransformerX
                ),
                voltageRegulationType: getFieldValue(
                    editingData?.regulatingTerminalVlId || editingData?.regulatingTerminalConnectableId
                        ? REGULATION_TYPES.DISTANT.id
                        : REGULATION_TYPES.LOCAL.id,
                    editingDataRef.current?.regulatingTerminalVlId ||
                        editingDataRef.current?.regulatingTerminalConnectableId
                        ? REGULATION_TYPES.DISTANT.id
                        : REGULATION_TYPES.LOCAL.id
                ),
                regulatingTerminalId: regulatingTerminalConnectableIdFieldValue,
                regulatingTerminalType: regulatingTerminalConnectableTypeFieldValue,
                regulatingTerminalVlId: regulatingTerminalVlIdFieldValue,
                participate: getFieldValue(
                    editingData?.activePowerControl?.participate,
                    editingDataRef.current?.activePowerControl?.participate
                ),
                droop: getFieldValue(
                    editingData?.activePowerControl?.droop,
                    editingDataRef.current?.activePowerControl?.droop
                ),
                properties: propertiesForBackend,
            });
        },
        [currentNode?.id, studyUuid, getFieldValue]
    );

    const updateVoltageLevel = useCallback(
        (editingData: any, propertiesForBackend: any) => {
            return modifyVoltageLevel({
                studyUuid: studyUuid,
                nodeUuid: currentNode?.id,
                voltageLevelId: editingData.id,
                voltageLevelName: getFieldValue(editingData.name, editingDataRef.current.name),
                nominalV: getFieldValue(editingData.nominalV, editingDataRef.current.nominalV),
                lowVoltageLimit: getFieldValue(editingData.lowVoltageLimit, editingDataRef.current.lowVoltageLimit),
                highVoltageLimit: getFieldValue(editingData.highVoltageLimit, editingDataRef.current.highVoltageLimit),
                lowShortCircuitCurrentLimit: getFieldValue(
                    editingData.identifiableShortCircuit?.ipMin,
                    editingDataRef.current.identifiableShortCircuit?.ipMin
                ),
                highShortCircuitCurrentLimit: getFieldValue(
                    editingData.identifiableShortCircuit?.ipMax,
                    editingDataRef.current.identifiableShortCircuit?.ipMax
                ),
                properties: propertiesForBackend,
            });
        },
        [currentNode?.id, studyUuid, getFieldValue]
    );

    const updateBattery = useCallback(
        (editingData: any, propertiesForBackend: any) => {
            return modifyBattery({
                studyUuid: studyUuid,
                nodeUuid: currentNode?.id,
                batteryId: editingData.id,
                name: getFieldValue(editingData.name, editingDataRef.current.name),
                minP: getFieldValue(editingData.minP, editingDataRef.current.minP),
                maxP: getFieldValue(editingData.maxP, editingDataRef.current.maxP),
                targetP: getFieldValue(editingData.targetP, editingDataRef.current.targetP),
                targetQ: getFieldValue(editingData.targetQ, editingDataRef.current.targetQ),
                participate: getFieldValue(
                    editingData.activePowerControl?.participate,
                    editingDataRef.current.activePowerControl?.participate != null
                        ? +editingDataRef.current.activePowerControl.participate
                        : editingDataRef.current.activePowerControl?.participate
                ),
                droop: getFieldValue(
                    editingData.activePowerControl?.droop,
                    editingDataRef.current.activePowerControl?.droop
                ),
                properties: propertiesForBackend,
            });
        },
        [currentNode?.id, studyUuid, getFieldValue]
    );

    const updateShuntCompensator = useCallback(
        (editingData: any, propertiesForBackend: any, context: any) => {
            return modifyShuntCompensator({
                studyUuid: studyUuid,
                nodeUuid: currentNode?.id,
                shuntCompensatorId: editingData.id,
                shuntCompensatorName: getFieldValue(editingData.name, editingDataRef.current.name),
                maximumSectionCount: getFieldValue(
                    editingData.maximumSectionCount,
                    editingDataRef.current.maximumSectionCount
                ),
                sectionCount: getFieldValue(editingData.sectionCount, editingDataRef.current.sectionCount),
                maxSusceptance:
                    context.lastEditedField === 'maxSusceptance'
                        ? getFieldValue(editingData.maxSusceptance, editingDataRef.current.maxSusceptance)
                        : null,
                maxQAtNominalV:
                    context.lastEditedField === 'maxQAtNominalV'
                        ? getFieldValue(editingData.maxQAtNominalV, editingDataRef.current.maxQAtNominalV)
                        : null,
                shuntCompensatorType: getFieldValue(
                    editingData.type,
                    editingDataRef.current.maxSusceptance > 0
                        ? SHUNT_COMPENSATOR_TYPES.CAPACITOR.id
                        : SHUNT_COMPENSATOR_TYPES.REACTOR.id
                ),
                voltageLevelId: editingData.voltageLevelId,
                properties: propertiesForBackend,
            });
        },
        [currentNode?.id, studyUuid, getFieldValue]
    );

    // TODO: when 3WT update will use a network modification, remove everything dealing with groovyEquipmentGetter/changeCmd
    const groovyUpdate = useCallback(
        (params: any) => {
            const equipment = tablesDefinitionIndexes.get(tabIndex);
            if (equipment && equipment.groovyEquipmentGetter) {
                let groovyScript =
                    'equipment = network.' +
                    equipment.groovyEquipmentGetter +
                    "('" +
                    params.data.id.replace(/'/g, "\\'") +
                    "')\n";
                const wrappedEditedData = {
                    data: editingData,
                };
                const columns = equipment.columns;
                Object.entries(priorValuesBuffer).forEach(([field, _value]) => {
                    const column: any = columns.find((c: any) => c.field === field);
                    if (column && column.changeCmd) {
                        const val = column.valueGetter ? column.valueGetter(wrappedEditedData) : editingData?.[field];
                        groovyScript += column.changeCmd.replace(/\{\}/g, val) + '\n';
                    }
                });
                return requestNetworkChange(studyUuid, currentNode?.id, groovyScript);
            }
        },
        [tablesDefinitionIndexes, tabIndex, editingData, priorValuesBuffer, studyUuid, currentNode?.id]
    );

    const buildEditPromise = useCallback(
        (editingData: any, params: any) => {
            const propertiesForBackend = formatPropertiesForBackend(
                editingDataRef.current.properties ?? {},
                editingData.properties ?? {}
            );
            switch (editingData?.metadata.equipmentType) {
                case EQUIPMENT_TYPES.SUBSTATION:
                    return updateSubstation(editingData, propertiesForBackend);
                case EQUIPMENT_TYPES.LOAD:
                    return updateLoad(editingData, propertiesForBackend);
                case EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER:
                    return updateTwoWindingsTransformer(editingData, propertiesForBackend);
                case EQUIPMENT_TYPES.GENERATOR:
                    return updateGenerator(editingData, propertiesForBackend);
                case EQUIPMENT_TYPES.VOLTAGE_LEVEL:
                    return updateVoltageLevel(editingData, propertiesForBackend);
                case EQUIPMENT_TYPES.BATTERY:
                    return updateBattery(editingData, propertiesForBackend);
                case EQUIPMENT_TYPES.SHUNT_COMPENSATOR:
                    return updateShuntCompensator(editingData, propertiesForBackend, params.context);
                default:
                    return groovyUpdate(params);
            }
        },
        [
            updateSubstation,
            updateLoad,
            updateTwoWindingsTransformer,
            updateGenerator,
            updateVoltageLevel,
            updateBattery,
            updateShuntCompensator,
            groovyUpdate,
        ]
    );

    const validateEdit = useCallback(
        (params: any) => {
            const editPromise = buildEditPromise(editingData, params);
            Promise.resolve(editPromise)
                .then(() => {
                    const transaction = {
                        update: [editingData],
                    };
                    gridRef.current?.api.applyTransaction(transaction);
                    setEditingData(undefined);
                    resetBuffer();
                    editingDataRef.current = editingData;
                    setLastModifiedEquipment(editingData);
                })
                .catch((promiseErrorMsg) => {
                    console.error(promiseErrorMsg);
                    rollbackEdit();
                    snackError({
                        messageTxt: promiseErrorMsg,
                        headerId: 'tableChangingError',
                    });
                });
        },
        [buildEditPromise, editingData, resetBuffer, rollbackEdit, snackError]
    );

    // After the modification has been applied, we need to update the equipment data in the grid
    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            if (
                studyUpdatedForce.eventData.headers['updateType'] === 'UPDATE_FINISHED' &&
                studyUpdatedForce.eventData.headers['parentNode'] === currentNode.id &&
                lastModifiedEquipment
            ) {
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNode.id,
                    currentRootNetworkUuid,
                    lastModifiedEquipment.metadata.equipmentType,
                    EQUIPMENT_INFOS_TYPES.TAB.type,
                    lastModifiedEquipment.id,
                    true
                )
                    .then((updatedEquipment) => {
                        const equipmentTypeToUpdate = getUpdateTypeFromEquipmentType(
                            lastModifiedEquipment.metadata.equipmentType
                        ) as EquipmentUpdateType;
                        const equipmentToUpdate = {
                            [equipmentTypeToUpdate]: [updatedEquipment],
                        } as Record<EquipmentUpdateType, Identifiable[]>;
                        dispatch(updateEquipments(equipmentToUpdate));
                    })
                    .catch((error) => {
                        console.error('equipment data update failed', error);
                    });
            }
        }
    }, [
        lastModifiedEquipment,
        currentNode.id,
        studyUuid,
        currentRootNetworkUuid,
        studyUpdatedForce,
        formatFetchedEquipmentHandler,
        dispatch,
    ]);

    //this listener is called for each cell modified
    const handleCellEditingStopped = useCallback(
        (params: CellEditingStoppedEvent) => {
            if (params.colDef.field != null && params.oldValue !== params.newValue) {
                if (params.data.metadata.equipmentType === EQUIPMENT_TYPES.SHUNT_COMPENSATOR) {
                    updateShuntCompensatorCells(params);
                } else if (params.data.metadata?.equipmentType === EQUIPMENT_TYPES.GENERATOR) {
                    updateGeneratorCells(params);
                } else if (params.data.metadata.equipmentType === EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER) {
                    updateTwtCells(params);
                }
                addDataToBuffer(params.colDef.field, params.oldValue);
                params.context.dynamicValidation = params.data;
                checkValidationsAndRefreshCells(params.api, params.context);
            }
        },
        [addDataToBuffer]
    );

    const handleCellEditingStarted = useCallback((params: CellEditingStartedEvent) => {
        // we initialize the dynamicValidation with the initial data
        params.context.dynamicValidation = params.data;
    }, []);

    const handleSubmitEditing = useCallback(
        (params: any) => {
            if (Object.values(priorValuesBuffer).length === 0) {
                rollbackEdit();
            } else {
                params.context.dynamicValidation = {};
                validateEdit(params);
            }
        },
        [priorValuesBuffer, rollbackEdit, validateEdit]
    );

    const addEditColumn = useCallback(
        (equipmentType: EQUIPMENT_TYPES, columns: CustomColDef[]) => {
            columns.unshift({
                colId: EDIT_COLUMN,
                field: EDIT_COLUMN,
                pinned: 'left',
                lockPosition: 'left',
                sortable: false,
                filter: false,
                resizable: false,
                width: 100,
                headerName: '',
                cellStyle: { border: 'none' },
                cellRendererSelector: (params: ICellRendererParams) => {
                    if (params.node.rowPinned) {
                        return {
                            component: EditingCellRenderer,
                            params: {
                                rollbackEdit: rollbackEdit,
                                handleSubmitEditing: handleSubmitEditing,
                            },
                        };
                    } else if (editingData?.id === params.data.id) {
                        return {
                            component: ReferenceLineCellRenderer,
                        };
                    } else {
                        return {
                            component: EditableCellRenderer,
                            params: {
                                setEditingData: setEditingData,
                                equipmentType: equipmentType,
                            },
                        };
                    }
                },
            });
        },
        [editingData?.id, handleSubmitEditing, rollbackEdit]
    );

    const generateTableColumns = useCallback(() => {
        let selectedTableColumns = currentColumns()
            .filter((c) => {
                return selectedColumnsNames.has(c.colId);
            })
            .map((column) => enrichColumn(column))
            .sort(
                (a, b) =>
                    reorderedTableDefinitionIndexes.indexOf(a.colId) - reorderedTableDefinitionIndexes.indexOf(b.colId)
            );

        if (isEditColumnVisible()) {
            addEditColumn(currentTabType(), selectedTableColumns);
        }
        return selectedTableColumns;
    }, [
        addEditColumn,
        enrichColumn,
        isEditColumnVisible,
        reorderedTableDefinitionIndexes,
        selectedColumnsNames,
        currentTabType,
        currentColumns,
    ]);

    useEffect(() => {
        setColumnData(generateTableColumns());
    }, [generateTableColumns]);

    const topPinnedData = useMemo((): any[] | undefined => {
        if (editingData) {
            editingDataRef.current = { ...editingData };
            return [editingData];
        } else {
            return undefined;
        }
    }, [editingData]);

    return (
        <>
            <Grid container justifyContent={'space-between'}>
                <EquipmentTabs
                    disabled={!!(disabled || editingData)}
                    tabIndex={tabIndex}
                    handleSwitchTab={handleSwitchTab}
                />
                <Grid container columnSpacing={2} sx={styles.toolbar}>
                    <Grid item sx={styles.filter}>
                        <GlobalFilter disabled={!!(disabled || editingData)} gridRef={gridRef} ref={globalFilterRef} />
                    </Grid>
                    <Grid item sx={styles.selectColumns}>
                        <ColumnsConfig
                            tabIndex={tabIndex}
                            disabled={!!(disabled || editingData || currentColumns().length === 0)}
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
                            disabled={!!(disabled || rowData.length === 0 || editingData)}
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
                        topPinnedData={topPinnedData}
                        fetched={!!equipments || !!errorMessage}
                        handleColumnDrag={handleColumnDrag}
                        handleCellEditingStarted={handleCellEditingStarted}
                        handleCellEditingStopped={handleCellEditingStopped}
                        handleGridReady={handleGridReady}
                        handleRowDataUpdated={handleRowDataUpdated}
                        shouldHidePinnedHeaderRightBorder={isLockedColumnNamesEmpty}
                    />
                </Box>
            )}
        </>
    );
};
export default TableWrapper;
