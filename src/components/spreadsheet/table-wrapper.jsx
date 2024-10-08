/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { Box } from '@mui/system';
import { Alert, Grid } from '@mui/material';
import {
    EDIT_COLUMN,
    MIN_COLUMN_WIDTH,
    REORDERED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE,
    TABLES_DEFINITION_INDEXES,
    TABLES_DEFINITION_TYPES,
    TABLES_NAMES,
} from './utils/config-tables';
import { EquipmentTable } from './equipment-table';
import { useSnackMessage } from '@gridsuite/commons-ui';
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
import { CsvExport } from './export-csv';
import { GlobalFilter } from './global-filter';
import { EquipmentTabs } from './equipment-tabs';
import { useSpreadsheetEquipments } from 'components/network/use-spreadsheet-equipments';
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
import { sanitizeString } from 'components/dialogs/dialogUtils';
import { REGULATION_TYPES, SHUNT_COMPENSATOR_TYPES } from 'components/network/constants';
import ComputingType from 'components/computing-status/computing-type';
import { makeAgGridCustomHeaderColumn } from 'components/custom-aggrid/custom-aggrid-header-utils';
import { useAggridLocalRowFilter } from 'hooks/use-aggrid-local-row-filter';
import { useAgGridSort } from 'hooks/use-aggrid-sort';
import { setSpreadsheetFilter } from 'redux/actions';
import { useLocalizedCountries } from 'components/utils/localized-countries-hook';
import { SPREADSHEET_SORT_STORE, SPREADSHEET_STORE_FIELD } from 'utils/store-sort-filter-fields';
import { useCustomColumn } from './custom-columns/use-custom-column';
import CustomColumnsConfig from './custom-columns/custom-columns-config';

const useEditBuffer = () => {
    //the data is feeded and read during the edition validation process so we don't need to rerender after a call to one of available methods thus useRef is more suited
    const data = useRef({});

    const addDataToBuffer = useCallback(
        (field, value) => {
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
    table: (theme) => ({
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
    toolbar: (theme) => ({
        marginTop: theme.spacing(2),
    }),
    filter: (theme) => ({
        marginLeft: theme.spacing(1),
    }),
    selectColumns: (theme) => ({
        marginLeft: theme.spacing(6),
    }),
};

const TableWrapper = (props) => {
    const gridRef = useRef();
    const timerRef = useRef(null);
    const intl = useIntl();
    const { translate } = useLocalizedCountries();

    const { snackError } = useSnackMessage();
    const [tabIndex, setTabIndex] = useState(0);

    const loadFlowStatus = useSelector((state) => state.computingStatus[ComputingType.LOAD_FLOW]);

    const allDisplayedColumnsNames = useSelector((state) => state.allDisplayedColumnsNames);
    const allLockedColumnsNames = useSelector((state) => state.allLockedColumnsNames);
    const allReorderedTableDefinitionIndexes = useSelector((state) => state.allReorderedTableDefinitionIndexes);
    const customColumnsDefinitions = useSelector((state) => state.allCustomColumnsDefinitions[TABLES_NAMES[tabIndex]]);
    const developerMode = useSelector((state) => state[PARAM_DEVELOPER_MODE]);

    const [selectedColumnsNames, setSelectedColumnsNames] = useState(new Set());
    const [lockedColumnsNames, setLockedColumnsNames] = useState(new Set());
    const [reorderedTableDefinitionIndexes, setReorderedTableDefinitionIndexes] = useState([]);

    const fluxConvention = useSelector((state) => state[PARAM_FLUX_CONVENTION]);
    const studyUpdatedForce = useSelector((state) => state.studyUpdated);

    const [lastModifiedEquipment, setLastModifiedEquipment] = useState();

    const [manualTabSwitch, setManualTabSwitch] = useState(true);

    const [priorValuesBuffer, addDataToBuffer, resetBuffer] = useEditBuffer();
    const [editingData, setEditingData] = useState();
    const editingDataRef = useRef(editingData);

    const isLockedColumnNamesEmpty = useMemo(() => lockedColumnsNames.size === 0, [lockedColumnsNames.size]);
    const [customColumnData, setCustomColumnData] = useState([]);
    const [mergedColumnData, setMergedColumnData] = useState([]);
    const { createCustomColumn } = useCustomColumn(tabIndex, gridRef);

    useEffect(() => {
        setCustomColumnData(createCustomColumn());
    }, [tabIndex, customColumnsDefinitions, createCustomColumn]);

    const globalFilterRef = useRef();

    const [columnData, setColumnData] = useState([]);

    useEffect(() => {
        setMergedColumnData([...columnData, ...customColumnData]);
    }, [columnData, customColumnData]);

    const rollbackEdit = useCallback(() => {
        resetBuffer();
        setEditingData();
        editingDataRef.current = editingData;
    }, [resetBuffer, editingData]);

    const cleanTableState = useCallback(() => {
        globalFilterRef.current.resetFilter();
        gridRef?.current?.api.setFilterModel(null);
        gridRef?.current?.columnApi.applyColumnState({
            defaultState: { sort: null },
        });
        rollbackEdit();
    }, [rollbackEdit]);

    const isEditColumnVisible = useCallback(() => {
        return (
            !props.disabled &&
            TABLES_DEFINITION_INDEXES.get(tabIndex).type &&
            TABLES_DEFINITION_INDEXES.get(tabIndex)
                .columns.filter((c) => c.editable)
                .filter((c) => selectedColumnsNames.has(c.id)).length > 0
        );
    }, [props.disabled, selectedColumnsNames, tabIndex]);

    const { onSortChanged, sortConfig } = useAgGridSort(
        SPREADSHEET_SORT_STORE,
        TABLES_DEFINITION_INDEXES.get(tabIndex).type
    );

    const { updateFilter, filterSelector } = useAggridLocalRowFilter(gridRef, {
        filterType: SPREADSHEET_STORE_FIELD,
        filterTab: TABLES_DEFINITION_INDEXES.get(tabIndex).type,
        filterStoreAction: setSpreadsheetFilter,
    });

    const equipmentDefinition = useMemo(
        () => ({
            type: TABLES_DEFINITION_INDEXES.get(tabIndex).type,
            fetchers: TABLES_DEFINITION_INDEXES.get(tabIndex).fetchers,
        }),
        [tabIndex]
    );

    const formatFetchedEquipmentHandler = useCallback(
        (fetchedEquipment) => {
            return formatFetchedEquipment(equipmentDefinition.type, fetchedEquipment);
        },
        [equipmentDefinition.type]
    );

    const formatFetchedEquipmentsHandler = useCallback(
        (fetchedEquipments) => {
            //Format the equipments data to set calculated fields, so that the edition validation is consistent with the displayed data
            return formatFetchedEquipments(equipmentDefinition.type, fetchedEquipments);
        },
        [equipmentDefinition.type]
    );

    const { equipments, errorMessage, isFetching } = useSpreadsheetEquipments(
        equipmentDefinition,
        formatFetchedEquipmentsHandler
    );

    // Function to get the columns that have isEnum filter set to true in customFilterParams
    const getEnumFilterColumns = useCallback(() => {
        const generatedTableColumns = TABLES_DEFINITION_INDEXES.get(tabIndex).columns;
        return generatedTableColumns.filter(({ isEnum }) => isEnum === true);
    }, [tabIndex]);

    const generateEquipmentsFilterEnums = useCallback(() => {
        if (!equipments) {
            return {};
        }
        const filterEnums = {};
        getEnumFilterColumns().forEach((column) => {
            filterEnums[column.field] = [
                ...new Set(
                    equipments
                        .map((equipment) => deepFindValue(equipment, column.field))
                        .filter((value) => value != null)
                ),
            ];
        });
        return filterEnums;
    }, [getEnumFilterColumns, equipments]);

    const filterEnums = useMemo(() => generateEquipmentsFilterEnums(), [generateEquipmentsFilterEnums]);

    const enrichColumn = useCallback(
        (column) => {
            column.headerName = intl.formatMessage({ id: column.id });

            if (column.numeric) {
                //numeric columns need the loadflow status in order to apply a specific css class in case the loadflow is invalid to highlight the value has not been computed
                const isValueInvalid = loadFlowStatus !== RunningStatus.SUCCEED && column.canBeInvalidated;

                column.cellRendererParams = {
                    isValueInvalid: isValueInvalid,
                };

                if (column.normed) {
                    column.cellRendererParams.fluxConvention = fluxConvention;
                    column.comparator = (valueA, valueB) => {
                        const normedValueA = valueA !== undefined ? column.normed(fluxConvention, valueA) : undefined;
                        const normedValueB = valueB !== undefined ? column.normed(fluxConvention, valueB) : undefined;
                        if (normedValueA !== undefined && normedValueB !== undefined) {
                            return normedValueA - normedValueB;
                        } else if (normedValueA === undefined && normedValueB === undefined) {
                            return 0;
                        } else if (normedValueA === undefined) {
                            return -1;
                        } else if (normedValueB === undefined) {
                            return 1;
                        }
                    };
                }
            }

            if (column.cellRenderer == null) {
                column.cellRenderer = DefaultCellRenderer;
            }

            column.width = column.columnWidth || MIN_COLUMN_WIDTH;

            //if it is not the first render the column might already have a pinned value so we need to handle the case where it needs to be reseted to undefined
            //we reuse and mutate the column objects so we need to clear to undefined
            column.pinned = lockedColumnsNames.has(column.id) ? 'left' : undefined;

            //Set sorting comparator for enum columns so it sorts the translated values instead of the enum values
            if (column?.isEnum) {
                column.comparator = (valueA, valueB) => {
                    const getTranslatedOrOriginalValue = (value) => {
                        if (value === undefined || value === null) {
                            return '';
                        }
                        if (column.isCountry) {
                            return translate(value);
                        } else if (column.getEnumLabel) {
                            const labelId = column.getEnumLabel(value);
                            return intl.formatMessage({
                                id: labelId || value,
                                defaultMessage: value,
                            });
                        }
                        return value;
                    };

                    const translatedValueA = getTranslatedOrOriginalValue(valueA);
                    const translatedValueB = getTranslatedOrOriginalValue(valueB);

                    return translatedValueA.localeCompare(translatedValueB);
                };
            }

            return makeAgGridCustomHeaderColumn({
                headerName: column.headerName,
                field: column.field,
                sortProps: {
                    onSortChanged,
                    sortConfig,
                },
                filterProps: {
                    updateFilter,
                    filterSelector,
                },
                filterParams: {
                    ...column?.customFilterParams,
                    filterEnums,
                },
                ...column,
            });
        },
        [
            intl,
            lockedColumnsNames,
            onSortChanged,
            sortConfig,
            updateFilter,
            filterSelector,
            loadFlowStatus,
            fluxConvention,
            filterEnums,
            translate,
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

    // Ensure initial sort is applied by including columnData in dependencies
    useEffect(() => {
        gridRef.current?.api?.applyColumnState({
            state: sortConfig,
            defaultState: { sort: null },
        });
    }, [sortConfig, columnData]);

    const getRows = useCallback(() => {
        if (props.disabled || !equipments) {
            return [];
        }

        return equipments;
    }, [equipments, props.disabled]);

    //TODO fix network.js update methods so that when an existing entry is modified or removed the whole collection
    //is reinstanciated in order to notify components using it.
    //this variable is regenerated on every renders in order to gather latest external updates done to the dataset,
    //it is necessary since we curently lack the system to detect changes done to it after receiving a notification
    const rowData = getRows();

    const handleSwitchTab = useCallback(
        (value) => {
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
        const newSelectedColumns = new Set(allDisplayedTemp ? JSON.parse(allDisplayedTemp) : []);
        setSelectedColumnsNames(newSelectedColumns);
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
                : TABLES_DEFINITION_INDEXES.get(tabIndex).columns.map((item) => item.id)
        );
    }, [allReorderedTableDefinitionIndexes, tabIndex]);

    useEffect(() => {
        setManualTabSwitch(false);
    }, [props.equipmentChanged]);

    const scrollToEquipmentIndex = useCallback(() => {
        if (props.equipmentId !== null && props.equipmentType !== null && !manualTabSwitch) {
            //calculate row index to scroll to
            //since all sorting and filtering is done by aggrid, we need to use their APIs to get the actual index
            const selectedRow = gridRef.current?.api?.getRowNode(props.equipmentId);
            if (selectedRow) {
                gridRef.current.api?.ensureNodeVisible(selectedRow, 'top');
                selectedRow.setSelected(true, true);
            }
        }
    }, [manualTabSwitch, props.equipmentId, props.equipmentType]);

    useEffect(() => {
        if (props.equipmentId !== null && props.equipmentType !== null && !manualTabSwitch) {
            const definition = TABLES_DEFINITION_TYPES.get(props.equipmentType);
            if (tabIndex === definition.index) {
                // already in expected tab => explicit call to scroll to expected row
                scrollToEquipmentIndex();
            } else {
                // select the right table type. This will trigger handleRowDataUpdated + scrollToEquipmentIndex
                setTabIndex(definition.index);
            }
        }
    }, [
        props.equipmentId,
        props.equipmentType,
        props.equipmentChanged,
        manualTabSwitch,
        tabIndex,
        scrollToEquipmentIndex,
    ]);

    const handleGridReady = useCallback(() => {
        if (globalFilterRef.current) {
            gridRef.current?.api?.setQuickFilter(globalFilterRef.current.getFilterValue());
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
        const lockedColumnsConfig = TABLES_DEFINITION_INDEXES.get(tabIndex)
            .columns.filter((column) => lockedColumnsNames.has(column.id))
            .map((column) => {
                return { colId: column.field, pinned: 'left' };
            });

        if (isEditColumnVisible()) {
            lockedColumnsConfig.unshift({
                colId: EDIT_COLUMN,
                pinned: 'left',
            });
        }

        gridRef.current?.columnApi?.applyColumnState({
            state: lockedColumnsConfig,
            defaultState: { pinned: null },
        });
    }, [isEditColumnVisible, lockedColumnsNames, tabIndex]);

    const handleColumnDrag = useCallback(
        (event) => {
            if (event.finished && event.column) {
                const [reorderedItem] = reorderedTableDefinitionIndexes.splice(
                    reorderedTableDefinitionIndexes.indexOf(event.column.colDef.id),
                    1
                );
                const destinationIndex = isEditColumnVisible() ? event.toIndex - 1 : event.toIndex;

                reorderedTableDefinitionIndexes.splice(destinationIndex, 0, reorderedItem);
                setReorderedTableDefinitionIndexes(reorderedTableDefinitionIndexes);

                updateConfigParameter(
                    REORDERED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE + TABLES_NAMES[tabIndex],
                    JSON.stringify(reorderedTableDefinitionIndexes)
                ).catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'paramsChangingError',
                    });
                });

                const [reorderedColDef] = columnData.splice(
                    columnData.findIndex((obj) => {
                        return obj.id === event.column.colDef.id;
                    }),
                    1
                );
                columnData.splice(event.toIndex, 0, reorderedColDef);
                setColumnData(columnData);
            }
        },
        [columnData, isEditColumnVisible, reorderedTableDefinitionIndexes, snackError, tabIndex]
    );

    const getFieldValue = useCallback((newField, oldField) => {
        return newField !== oldField ? newField : null;
    }, []);

    const buildEditPromise = useCallback(
        (editingData, groovyCr, context) => {
            const propertiesForBackend = formatPropertiesForBackend(
                editingDataRef.current.properties ?? {},
                editingData.properties ?? {}
            );
            switch (editingData?.metadata.equipmentType) {
                case EQUIPMENT_TYPES.SUBSTATION:
                    return modifySubstation({
                        studyUuid: props.studyUuid,
                        nodeUuid: props.currentNode?.id,
                        id: editingData.id,
                        name: editingData.name,
                        country: editingData.country,
                        isUpdate: false,
                        properties: propertiesForBackend,
                    });
                case EQUIPMENT_TYPES.LOAD:
                    return modifyLoad({
                        studyUuid: props.studyUuid,
                        nodeUuid: props.currentNode?.id,
                        id: editingData.id,
                        name: getFieldValue(editingData.name, editingDataRef.current.name),
                        loadType: getFieldValue(editingData.type, editingDataRef.current.type),
                        p0: getFieldValue(editingData.p0, editingDataRef.current.p0),
                        q0: getFieldValue(editingData.q0, editingDataRef.current.q0),
                        isUpdate: false,
                        properties: propertiesForBackend,
                    });
                case EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER:
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
                        studyUuid: props.studyUuid,
                        nodeUuid: props.currentNode?.id,
                        twoWindingsTransformerId: editingData.id,
                        twoWindingsTransformerName: toModificationOperation(
                            sanitizeString(getFieldValue(editingData?.name, editingDataRef.current?.name))
                        ),
                        r: toModificationOperation(getFieldValue(editingData.r, editingDataRef.current.r)),
                        x: toModificationOperation(getFieldValue(editingData.x, editingDataRef.current.x)),
                        g: toModificationOperation(getFieldValue(editingData.g, editingDataRef.current.g)),
                        b: toModificationOperation(getFieldValue(editingData.b, editingDataRef.current.b)),
                        ratedS: toModificationOperation(
                            getFieldValue(editingData.ratedS, editingDataRef.current.ratedS)
                        ),
                        ratedU1: toModificationOperation(
                            getFieldValue(editingData.ratedU1, editingDataRef.current.ratedU1)
                        ),
                        ratedU2: toModificationOperation(
                            getFieldValue(editingData.ratedU2, editingDataRef.current.ratedU2)
                        ),
                        ratioTapChanger: ratioTap,
                        phaseTapChanger: phaseTap,
                        isUpdate: false,
                        properties: propertiesForBackend,
                    });
                case EQUIPMENT_TYPES.GENERATOR:
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
                        studyUuid: props.studyUuid,
                        nodeUuid: props.currentNode?.id,
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
                case EQUIPMENT_TYPES.VOLTAGE_LEVEL:
                    return modifyVoltageLevel({
                        studyUuid: props.studyUuid,
                        nodeUuid: props.currentNode?.id,
                        voltageLevelId: editingData.id,
                        voltageLevelName: getFieldValue(editingData.name, editingDataRef.current.name),
                        nominalV: getFieldValue(editingData.nominalV, editingDataRef.current.nominalV),
                        lowVoltageLimit: getFieldValue(
                            editingData.lowVoltageLimit,
                            editingDataRef.current.lowVoltageLimit
                        ),
                        highVoltageLimit: getFieldValue(
                            editingData.highVoltageLimit,
                            editingDataRef.current.highVoltageLimit
                        ),
                        lowShortCircuitCurrentLimit: getFieldValue(
                            editingData.identifiableShortCircuit?.ipMin,
                            editingDataRef.current.identifiableShortCircuit?.ipMin
                        ),
                        highShortCircuitCurrentLimit: getFieldValue(
                            editingData.identifiableShortCircuit?.ipMax,
                            editingDataRef.current.identifiableShortCircuit?.ipMax
                        ),
                        isUpdate: false,
                        properties: propertiesForBackend,
                    });
                case EQUIPMENT_TYPES.BATTERY:
                    return modifyBattery({
                        studyUuid: props.studyUuid,
                        nodeUuid: props.currentNode?.id,
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
                case EQUIPMENT_TYPES.SHUNT_COMPENSATOR:
                    return modifyShuntCompensator({
                        studyUuid: props.studyUuid,
                        nodeUuid: props.currentNode?.id,
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
                        isUpdate: false,
                        properties: propertiesForBackend,
                    });
                default:
                    return requestNetworkChange(props.studyUuid, props.currentNode?.id, groovyCr);
            }
        },
        [props.currentNode?.id, props.studyUuid, getFieldValue]
    );

    const validateEdit = useCallback(
        (params) => {
            // TODO: generic groovy updates should be replaced by specific hypothesis creations, like modifyLoad() below
            // TODO: when no more groovy, remove changeCmd everywhere, remove requestNetworkChange()
            let groovyCr =
                'equipment = network.' +
                TABLES_DEFINITION_INDEXES.get(tabIndex).groovyEquipmentGetter +
                "('" +
                params.data.id.replace(/'/g, "\\'") +
                "')\n";

            const wrappedEditedData = {
                data: editingData,
            };
            Object.entries(priorValuesBuffer).forEach(([field, value]) => {
                const column = gridRef.current.columnApi.getColumn(field);
                const val = column.colDef.valueGetter
                    ? column.colDef.valueGetter(wrappedEditedData)
                    : editingData?.[field];

                groovyCr += column.colDef.changeCmd?.replace(/\{\}/g, val) + '\n';
            });

            const editPromise = buildEditPromise(editingData, groovyCr, params.context);
            Promise.resolve(editPromise)
                .then(() => {
                    const transaction = {
                        update: [editingData],
                    };
                    gridRef.current.api.applyTransaction(transaction);
                    setEditingData();
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
        [buildEditPromise, editingData, priorValuesBuffer, resetBuffer, rollbackEdit, snackError, tabIndex]
    );

    // After the modification has been applied, we need to update the equipment data in the grid
    useEffect(() => {
        if (studyUpdatedForce.eventData.headers) {
            if (
                studyUpdatedForce.eventData.headers['updateType'] === 'UPDATE_FINISHED' &&
                studyUpdatedForce.eventData.headers['parentNode'] === props.currentNode.id &&
                lastModifiedEquipment
            ) {
                fetchNetworkElementInfos(
                    props.studyUuid,
                    props.currentNode.id,
                    lastModifiedEquipment.metadata.equipmentType,
                    EQUIPMENT_INFOS_TYPES.TAB.type,
                    lastModifiedEquipment.id,
                    true
                )
                    .then((updatedEquipment) => {
                        const formattedData = formatFetchedEquipmentHandler(updatedEquipment);
                        const transaction = {
                            update: [formattedData],
                        };
                        gridRef.current.api.applyTransaction(transaction);
                        setLastModifiedEquipment();
                        gridRef.current.api.refreshCells({
                            force: true,
                            rowNodes: [gridRef.current.api.getRowNode(formattedData.id)],
                        });
                    })
                    .catch((error) => {
                        console.error('equipment data update failed', error);
                    });
            }
        }
    }, [
        lastModifiedEquipment,
        props.currentNode.id,
        props.studyUuid,
        studyUpdatedForce,
        formatFetchedEquipmentHandler,
    ]);

    //this listener is called for each cell modified
    const handleCellEditingStopped = useCallback(
        (params) => {
            if (params.oldValue !== params.newValue) {
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

    const handleCellEditingStarted = useCallback((params) => {
        // we initialize the dynamicValidation with the initial data
        params.context.dynamicValidation = params.data;
    }, []);

    const handleSubmitEditing = useCallback(
        (params) => {
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
        (columns) => {
            columns.unshift({
                field: EDIT_COLUMN,
                locked: true,
                pinned: 'left',
                lockPosition: 'left',
                sortable: false,
                filter: false,
                resizable: false,
                width: 100,
                headerName: '',
                cellStyle: { border: 'none' },
                cellRendererSelector: (params) => {
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
                                equipmentType: TABLES_DEFINITION_INDEXES.get(tabIndex).type,
                            },
                        };
                    }
                },
            });
        },
        [editingData?.id, handleSubmitEditing, rollbackEdit, tabIndex]
    );

    const generateTableColumns = useCallback(
        (tabIndex) => {
            const generatedTableColumns = TABLES_DEFINITION_INDEXES.get(tabIndex)
                .columns.filter((c) => {
                    return selectedColumnsNames.has(c.id);
                })
                .map((column) => enrichColumn(column));

            function sortByIndex(a, b) {
                return reorderedTableDefinitionIndexes.indexOf(a.id) - reorderedTableDefinitionIndexes.indexOf(b.id);
            }

            generatedTableColumns.sort(sortByIndex);

            if (isEditColumnVisible()) {
                addEditColumn(generatedTableColumns);
            }
            return generatedTableColumns;
        },
        [addEditColumn, enrichColumn, isEditColumnVisible, reorderedTableDefinitionIndexes, selectedColumnsNames]
    );

    useEffect(() => {
        setColumnData(generateTableColumns(tabIndex));
    }, [generateTableColumns, tabIndex]);

    const topPinnedData = useMemo(() => {
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
                    disabled={!!(props.disabled || editingData)}
                    tabIndex={tabIndex}
                    handleSwitchTab={handleSwitchTab}
                />
                <Grid container sx={styles.toolbar}>
                    <Grid item sx={styles.filter}>
                        <GlobalFilter
                            disabled={!!(props.disabled || editingData)}
                            visible={props.visible}
                            gridRef={gridRef}
                            ref={globalFilterRef}
                        />
                    </Grid>
                    <Grid item sx={styles.selectColumns}>
                        <ColumnsConfig
                            tabIndex={tabIndex}
                            disabled={!!(props.disabled || editingData)}
                            reorderedTableDefinitionIndexes={reorderedTableDefinitionIndexes}
                            setReorderedTableDefinitionIndexes={setReorderedTableDefinitionIndexes}
                            selectedColumnsNames={selectedColumnsNames}
                            setSelectedColumnsNames={setSelectedColumnsNames}
                            lockedColumnsNames={lockedColumnsNames}
                            setLockedColumnsNames={setLockedColumnsNames}
                        />
                    </Grid>
                    {developerMode && (
                        <Grid item sx={{ marginLeft: '15px' }}>
                            <CustomColumnsConfig indexTab={tabIndex} />
                        </Grid>
                    )}
                    <Grid item style={{ flexGrow: 1 }}></Grid>
                    <Grid item>
                        <CsvExport
                            gridRef={gridRef}
                            columns={columnData}
                            tableName={TABLES_DEFINITION_INDEXES.get(tabIndex).name}
                            disabled={!!(props.disabled || rowData.length === 0 || editingData)}
                        />
                    </Grid>
                </Grid>
            </Grid>
            {props.disabled ? (
                <Alert sx={styles.invalidNode} severity="warning">
                    <FormattedMessage id="InvalidNode" />
                </Alert>
            ) : (
                <Box sx={styles.table}>
                    <EquipmentTable
                        gridRef={gridRef}
                        studyUuid={props.studyUuid}
                        currentNode={props.currentNode}
                        rowData={rowData}
                        columnData={mergedColumnData}
                        topPinnedData={topPinnedData}
                        fetched={equipments || errorMessage}
                        visible={props.visible}
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

TableWrapper.defaultProps = {
    studyUuid: '',
    currentNode: null,
    equipmentId: null,
    equipmentType: null,
    equipmentChanged: false,
    disabled: false,
};

TableWrapper.propTypes = {
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    equipmentId: PropTypes.string,
    equipmentType: PropTypes.string,
    equipmentChanged: PropTypes.bool,
    disabled: PropTypes.bool,
};

export default TableWrapper;
