/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {
    useCallback,
    useEffect,
    useState,
    useRef,
    useMemo,
} from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from 'react-intl';
import { Grid, Alert } from '@mui/material';
import {
    REORDERED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE,
    TABLES_DEFINITION_INDEXES,
    TABLES_NAMES,
    MIN_COLUMN_WIDTH,
    EDIT_COLUMN,
    TABLES_DEFINITION_TYPES,
} from './utils/config-tables';
import { EquipmentTable } from './equipment-table';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { PARAM_FLUX_CONVENTION } from '../../utils/config-params';
import { RunningStatus } from '../utils/running-status';
import {
    EditableCellRenderer,
    EditingCellRenderer,
    DefaultCellRenderer,
    ReferenceLineCellRenderer,
} from './utils/cell-renderers';
import { ColumnsConfig } from './columns-config';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { CsvExport } from './export-csv';
import { GlobalFilter } from './global-filter';
import { EquipmentTabs } from './equipment-tabs';
import { useSpreadsheetEquipments } from 'components/network/use-spreadsheet-equipments';
import { updateConfigParameter } from '../../services/config';
import {
    modifyBattery,
    modifyGenerator,
    modifyLoad,
    modifyVoltageLevel,
    requestNetworkChange,
} from '../../services/study/network-modifications';
import { Box } from '@mui/system';

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

    const { snackError } = useSnackMessage();

    const allDisplayedColumnsNames = useSelector(
        (state) => state.allDisplayedColumnsNames
    );
    const allLockedColumnsNames = useSelector(
        (state) => state.allLockedColumnsNames
    );
    const allReorderedTableDefinitionIndexes = useSelector(
        (state) => state.allReorderedTableDefinitionIndexes
    );

    const [selectedColumnsNames, setSelectedColumnsNames] = useState(new Set());
    const [lockedColumnsNames, setLockedColumnsNames] = useState(new Set());
    const [
        reorderedTableDefinitionIndexes,
        setReorderedTableDefinitionIndexes,
    ] = useState([]);

    const fluxConvention = useSelector((state) => state[PARAM_FLUX_CONVENTION]);

    const [tabIndex, setTabIndex] = useState(0);
    const [manualTabSwitch, setManualTabSwitch] = useState(true);

    const [priorValuesBuffer, addDataToBuffer, resetBuffer] = useEditBuffer();
    const [editingData, setEditingData] = useState();
    const editingDataRef = useRef(editingData);

    const isLockedColumnNamesEmpty = useMemo(
        () => lockedColumnsNames.size === 0,
        [lockedColumnsNames.size]
    );

    //the following variable needs to be a ref because its usage in EditingCellRenderer sets and reads
    //the value although it is not rerendered so storing it in a state wouldn't fill its purpose
    const isValidatingData = useRef(false);

    const globalFilterRef = useRef();

    const [columnData, setColumnData] = useState([]);

    const startEditing = useCallback(() => {
        const topRow = gridRef.current?.api?.getPinnedTopRow(0);
        if (topRow) {
            gridRef.current.api?.startEditingCell({
                rowIndex: topRow.rowIndex,
                colKey: EDIT_COLUMN,
                rowPinned: topRow.rowPinned,
            });
        }
    }, [gridRef]);

    const rollbackEdit = useCallback(() => {
        //system to undo last edits if they are invalidated
        //we need to call undoCellEditing for each field edited, the method only undo the last change to an individual cell
        Object.entries(priorValuesBuffer).forEach(() => {
            gridRef.current.api.undoCellEditing();
        });
        resetBuffer();
        setEditingData();
        editingDataRef.current = editingData;
        isValidatingData.current = false;
    }, [priorValuesBuffer, resetBuffer, editingData]);

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

    const enrichColumn = useCallback(
        (column) => {
            column.headerName = intl.formatMessage({ id: column.id });

            if (column.numeric) {
                //numeric columns need the loadflow status in order to apply a specific css class in case the loadflow is invalid to highlight the value has not been computed
                const isValueInvalid =
                    props.loadFlowStatus !== RunningStatus.SUCCEED &&
                    column.canBeInvalidated;

                column.cellRendererParams = {
                    isValueInvalid: isValueInvalid,
                };

                if (column.normed) {
                    column.cellRendererParams.fluxConvention = fluxConvention;
                }
            }

            if (column.cellRenderer == null) {
                column.cellRenderer = DefaultCellRenderer;
            }

            column.width = column.columnWidth || MIN_COLUMN_WIDTH;

            //if it is not the first render the column might already have a pinned value so we need to handle the case where it needs to be reseted to undefined
            //we reuse and mutate the column objects so we need to clear to undefined
            column.pinned = lockedColumnsNames.has(column.id)
                ? 'left'
                : undefined;

            return column;
        },
        [fluxConvention, intl, lockedColumnsNames, props.loadFlowStatus]
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
                                setEditingData: setEditingData,
                                startEditing: startEditing,
                                isValidatingData: isValidatingData,
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
                                equipmentType:
                                    TABLES_DEFINITION_INDEXES.get(tabIndex)
                                        .type,
                            },
                        };
                    }
                },
            });
        },
        [editingData?.id, startEditing, tabIndex]
    );

    const generateTableColumns = useCallback(
        (tabIndex) => {
            const generatedTableColumns = TABLES_DEFINITION_INDEXES.get(
                tabIndex
            )
                .columns.filter((c) => {
                    return selectedColumnsNames.has(c.id);
                })
                .map((column) => enrichColumn(column));

            function sortByIndex(a, b) {
                return (
                    reorderedTableDefinitionIndexes.indexOf(a.id) -
                    reorderedTableDefinitionIndexes.indexOf(b.id)
                );
            }

            generatedTableColumns.sort(sortByIndex);

            if (isEditColumnVisible()) {
                addEditColumn(generatedTableColumns);
            }
            return generatedTableColumns;
        },
        [
            addEditColumn,
            enrichColumn,
            isEditColumnVisible,
            reorderedTableDefinitionIndexes,
            selectedColumnsNames,
        ]
    );

    const equipmentDefinition = useMemo(
        () => ({
            type: TABLES_DEFINITION_INDEXES.get(tabIndex).type,
            fetchers: TABLES_DEFINITION_INDEXES.get(tabIndex).fetchers,
        }),
        [tabIndex]
    );

    const { equipments, errorMessage, isFetching } =
        useSpreadsheetEquipments(equipmentDefinition);

    useEffect(() => {
        if (errorMessage) {
            snackError({
                messageTxt: errorMessage,
                headerId: 'SpreadsheetFetchError',
            });
        }
    }, [errorMessage, snackError]);

    const getRows = useCallback(() => {
        if (props.disabled || !equipments) {
            return [];
        }

        return equipments;
    }, [equipments, props.disabled]);

    useEffect(() => {
        setColumnData(generateTableColumns(tabIndex));
    }, [generateTableColumns, tabIndex]);

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
        const newSelectedColumns = new Set(
            allDisplayedTemp ? JSON.parse(allDisplayedTemp) : []
        );
        setSelectedColumnsNames(newSelectedColumns);
    }, [tabIndex, allDisplayedColumnsNames]);

    useEffect(() => {
        const allLockedTemp = allLockedColumnsNames[tabIndex];
        setLockedColumnsNames(
            new Set(allLockedTemp ? JSON.parse(allLockedTemp) : [])
        );
    }, [tabIndex, allLockedColumnsNames]);

    useEffect(() => {
        const allReorderedTemp = allReorderedTableDefinitionIndexes[tabIndex];
        setReorderedTableDefinitionIndexes(
            allReorderedTemp
                ? JSON.parse(allReorderedTemp)
                : TABLES_DEFINITION_INDEXES.get(tabIndex).columns.map(
                      (item) => item.id
                  )
        );
    }, [allReorderedTableDefinitionIndexes, tabIndex]);

    useEffect(() => {
        setManualTabSwitch(false);
    }, [props.equipmentChanged]);

    const scrollToEquipmentIndex = useCallback(() => {
        if (
            props.equipmentId !== null &&
            props.equipmentType !== null &&
            !manualTabSwitch
        ) {
            //calculate row index to scroll to
            //since all sorting and filtering is done by aggrid, we need to use their APIs to get the actual index
            const selectedRow = gridRef.current?.api?.getRowNode(
                props.equipmentId
            );
            if (selectedRow) {
                gridRef.current.api?.ensureNodeVisible(selectedRow, 'top');
                selectedRow.setSelected(true, true);
            }
        }
    }, [manualTabSwitch, props.equipmentId, props.equipmentType]);

    useEffect(() => {
        if (
            props.equipmentId !== null &&
            props.equipmentType !== null &&
            !manualTabSwitch
        ) {
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
            gridRef.current?.api?.setQuickFilter(
                globalFilterRef.current.getFilterValue()
            );
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
                    reorderedTableDefinitionIndexes.indexOf(
                        event.column.colDef.id
                    ),
                    1
                );
                const destinationIndex = isEditColumnVisible()
                    ? event.toIndex - 1
                    : event.toIndex;

                reorderedTableDefinitionIndexes.splice(
                    destinationIndex,
                    0,
                    reorderedItem
                );
                setReorderedTableDefinitionIndexes(
                    reorderedTableDefinitionIndexes
                );

                updateConfigParameter(
                    REORDERED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE +
                        TABLES_NAMES[tabIndex],
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
        [
            columnData,
            isEditColumnVisible,
            reorderedTableDefinitionIndexes,
            snackError,
            tabIndex,
        ]
    );

    const getFieldValue = useCallback((newField, oldField) => {
        return newField !== oldField ? newField : null;
    }, []);

    const buildEditPromise = useCallback(
        (editingData, groovyCr) => {
            switch (editingData?.metadata.equipmentType) {
                case EQUIPMENT_TYPES.LOAD:
                    return modifyLoad(
                        props.studyUuid,
                        props.currentNode?.id,
                        editingData.id,
                        getFieldValue(
                            editingData.name,
                            editingDataRef.current.name
                        ),
                        getFieldValue(
                            editingData.type,
                            editingDataRef.current.type
                        ),
                        getFieldValue(
                            editingData.p0,
                            editingDataRef.current.p0
                        ),
                        getFieldValue(
                            editingData.q0,
                            editingDataRef.current.q0
                        ),
                        undefined,
                        undefined,
                        false,
                        undefined
                    );
                case EQUIPMENT_TYPES.GENERATOR:
                    return modifyGenerator(
                        props.studyUuid,
                        props.currentNode?.id,
                        editingData.id,
                        getFieldValue(
                            editingData.name,
                            editingDataRef.current.name
                        ),
                        getFieldValue(
                            editingData.energySource,
                            editingDataRef.current.energySource
                        ),
                        getFieldValue(
                            editingData.minP,
                            editingDataRef.current.minP
                        ),
                        getFieldValue(
                            editingData.maxP,
                            editingDataRef.current.maxP
                        ),
                        undefined,
                        getFieldValue(
                            editingData.targetP,
                            editingDataRef.current.targetP
                        ),
                        getFieldValue(
                            editingData.targetQ,
                            editingDataRef.current.targetQ
                        ),
                        getFieldValue(
                            editingData.voltageRegulatorOn,
                            editingDataRef.current.voltageRegulatorOn
                        ),
                        getFieldValue(
                            editingData.targetV,
                            editingDataRef.current.targetV
                        ),
                        undefined,
                        undefined,
                        undefined
                    );
                case EQUIPMENT_TYPES.VOLTAGE_LEVEL:
                    return modifyVoltageLevel(
                        props.studyUuid,
                        props.currentNode?.id,
                        editingData.id,
                        getFieldValue(
                            editingData.name,
                            editingDataRef.current.name
                        ),
                        getFieldValue(
                            editingData.nominalVoltage,
                            editingDataRef.current.nominalVoltage
                        ),
                        getFieldValue(
                            editingData.lowVoltageLimit,
                            editingDataRef.current.lowVoltageLimit
                        ),
                        getFieldValue(
                            editingData.highVoltageLimit,
                            editingDataRef.current.highVoltageLimit
                        ),
                        getFieldValue(
                            editingData.identifiableShortCircuit?.ipMin,
                            editingDataRef.current.identifiableShortCircuit
                                ?.ipMin
                        ),
                        getFieldValue(
                            editingData.identifiableShortCircuit?.ipMax,
                            editingDataRef.current.identifiableShortCircuit
                                ?.ipMax
                        ),
                        false,
                        undefined
                    );
                case EQUIPMENT_TYPES.BATTERY:
                    return modifyBattery(
                        props.studyUuid,
                        props.currentNode?.id,
                        editingData.id,
                        getFieldValue(
                            editingData.name,
                            editingDataRef.current.name
                        ),
                        getFieldValue(
                            editingData.minP,
                            editingDataRef.current.minP
                        ),
                        getFieldValue(
                            editingData.maxP,
                            editingDataRef.current.maxP
                        ),
                        getFieldValue(
                            editingData.targetP,
                            editingDataRef.current.targetP
                        ),
                        getFieldValue(
                            editingData.targetQ,
                            editingDataRef.current.targetQ
                        ),
                        undefined,
                        undefined,
                        undefined,
                        getFieldValue(
                            editingData.activePowerControl
                                ?.activePowerControlOn,
                            editingDataRef.current.activePowerControl
                                ?.activePowerControlOn
                        ),
                        getFieldValue(
                            editingData.activePowerControl?.droop,
                            editingDataRef.current.activePowerControl?.droop
                        )
                    );
                default:
                    return requestNetworkChange(
                        props.studyUuid,
                        props.currentNode?.id,
                        groovyCr
                    );
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
                    : editingData[field];

                groovyCr +=
                    column.colDef.changeCmd?.replace(/\{\}/g, val) + '\n';
            });

            const editPromise = buildEditPromise(editingData, groovyCr);
            Promise.resolve(editPromise)
                .then(() => {
                    const transaction = {
                        update: [editingData],
                    };
                    gridRef.current.api.applyTransaction(transaction);
                    setEditingData();
                    resetBuffer();
                    isValidatingData.current = false;
                    editingDataRef.current = editingData;
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
        [
            buildEditPromise,
            editingData,
            priorValuesBuffer,
            resetBuffer,
            rollbackEdit,
            snackError,
            tabIndex,
        ]
    );

    //this listener is called for each cell modified
    const handleCellEditing = useCallback(
        (params) => {
            addDataToBuffer(params.colDef.field, params.oldValue);
        },
        [addDataToBuffer]
    );

    //this listener is called once all cells listener have been called
    const handleRowEditing = useCallback(
        (params) => {
            if (isValidatingData.current) {
                validateEdit(params);
            }
        },
        [validateEdit]
    );

    const handleEditingStarted = useCallback((params) => {
        // we initialize the dynamicValidation with the initial data
        params.context.dynamicValidation = { ...params.data };
    }, []);

    const handleEditingStopped = useCallback(
        (params) => {
            if (
                !isValidatingData.current ||
                Object.values(priorValuesBuffer).length === 0
            ) {
                rollbackEdit();
            }
            params.context.dynamicValidation = {};
        },
        [priorValuesBuffer, rollbackEdit]
    );

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
                            reorderedTableDefinitionIndexes={
                                reorderedTableDefinitionIndexes
                            }
                            setReorderedTableDefinitionIndexes={
                                setReorderedTableDefinitionIndexes
                            }
                            selectedColumnsNames={selectedColumnsNames}
                            setSelectedColumnsNames={setSelectedColumnsNames}
                            lockedColumnsNames={lockedColumnsNames}
                            setLockedColumnsNames={setLockedColumnsNames}
                        />
                    </Grid>
                    <Grid item style={{ flexGrow: 1 }}></Grid>
                    <Grid item>
                        <CsvExport
                            gridRef={gridRef}
                            columns={columnData}
                            tableName={
                                TABLES_DEFINITION_INDEXES.get(tabIndex).name
                            }
                            disabled={
                                !!(
                                    props.disabled ||
                                    rowData.length === 0 ||
                                    editingData
                                )
                            }
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
                        currentNode={props.currentNode}
                        rowData={rowData}
                        columnData={columnData}
                        topPinnedData={topPinnedData}
                        fetched={equipments || errorMessage}
                        visible={props.visible}
                        handleColumnDrag={handleColumnDrag}
                        handleRowEditing={handleRowEditing}
                        handleCellEditing={handleCellEditing}
                        handleEditingStarted={handleEditingStarted}
                        handleEditingStopped={handleEditingStopped}
                        handleGridReady={handleGridReady}
                        handleRowDataUpdated={handleRowDataUpdated}
                        shouldHidePinnedHeaderRightBorder={
                            isLockedColumnNamesEmpty
                        }
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
    loadFlowStatus: RunningStatus.IDLE,
    disabled: false,
};

TableWrapper.propTypes = {
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    equipmentId: PropTypes.string,
    equipmentType: PropTypes.string,
    equipmentChanged: PropTypes.bool,
    loadFlowStatus: PropTypes.any,
    disabled: PropTypes.bool,
};

export default TableWrapper;
