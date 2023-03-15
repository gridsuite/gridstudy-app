/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Network from '../network/network';
import { FormattedMessage, useIntl } from 'react-intl';
import { Grid, Alert } from '@mui/material';
import {
    modifyGenerator,
    modifyLoad,
    requestNetworkChange,
    updateConfigParameter,
} from '../../utils/rest-api';
import {
    REORDERED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE,
    TABLES_DEFINITION_INDEXES,
    TABLES_DEFINITIONS,
    TABLES_NAMES,
    MIN_COLUMN_WIDTH,
} from './utils/config-tables';
import { EquipmentTable } from './equipment-table';
import makeStyles from '@mui/styles/makeStyles';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { PARAM_FLUX_CONVENTION } from '../../utils/config-params';
import { RunningStatus } from '../util/running-status';
import {
    EditableCellRenderer,
    EditingCellRenderer,
    ReferenceLineCellRenderer,
} from './utils/cell-renderers';
import { ColumnsConfig } from './columns-config';
import { EQUIPMENT_TYPES } from 'components/util/equipment-types';
import { CsvExport } from './export-csv';
import { GlobalFilter } from './global-filter';
import { EquipmentTabs } from './equipment-tabs';

const useEditBuffer = () => {
    const [data, setData] = useState({});

    const addDataToBuffer = useCallback(
        (field, value) => {
            data[field] = value;
            setData(data);
        },
        [data]
    );

    const resetBuffer = useCallback(() => {
        setData({});
    }, []);

    return [data, addDataToBuffer, resetBuffer];
};

const useStyles = makeStyles((theme) => ({
    table: {
        marginTop: theme.spacing(2.5),
        lineHeight: 'unset',
        flexGrow: 1,
    },
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
    disabledLabel: {
        color: theme.palette.text.disabled,
    },
    invalidNode: {
        position: 'absolute',
        top: '30%',
        left: '43%',
    },
}));

const TableWrapper = (props) => {
    const gridRef = useRef();

    const intl = useIntl();
    const classes = useStyles();

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
    const [scrollToIndex, setScrollToIndex] = useState();
    const [manualTabSwitch, setManualTabSwitch] = useState(true);

    const [priorValuesBuffer, addDataToBuffer, resetBuffer] = useEditBuffer();
    const [editingData, setEditingData] = useState();
    const [isValidatingData, setIsValidatingData] = useState(false);

    const globalFilterRef = useRef(null);

    const [rowData, setRowData] = useState([]);
    const [columnData, setColumnData] = useState([]);

    const startEditing = useCallback(() => {
        const topRow = gridRef.current?.api?.getPinnedTopRow(0);
        if (topRow) {
            gridRef.current.api?.startEditingCell({
                rowIndex: topRow.rowIndex,
                colKey: 'edit',
                rowPinned: topRow.rowPinned,
            });
        }
    }, [gridRef]);

    const rollbackEdit = useCallback(() => {
        //system to undo last edits if they are invalidated
        Object.entries(priorValuesBuffer).forEach(() => {
            gridRef.current.api.undoCellEditing();
        });
        resetBuffer();
        setEditingData();
        setIsValidatingData(false);
    }, [priorValuesBuffer, resetBuffer]);

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
            TABLES_DEFINITION_INDEXES.get(tabIndex).modifiableEquipmentType &&
            TABLES_DEFINITION_INDEXES.get(tabIndex)
                .columns.filter((c) => c.editable)
                .filter((c) => selectedColumnsNames.has(c.id)).length > 0
        );
    }, [props.disabled, selectedColumnsNames, tabIndex]);

    const enrichColumn = useCallback(
        (column) => {
            column.headerName = intl.formatMessage({ id: column.id });

            if (column.numeric) {
                column.cellRendererParams = {
                    loadFlowStatus: props.loadFlowStatus,
                    network: props.network,
                };

                if (column.normed) {
                    column.cellRendererParams.fluxConvention = fluxConvention;
                }
            }

            column.width = column.columnWidth || MIN_COLUMN_WIDTH;
            column.pinned = lockedColumnsNames.has(column.id)
                ? 'left'
                : undefined;

            return column;
        },
        [
            fluxConvention,
            intl,
            lockedColumnsNames,
            props.loadFlowStatus,
            props.network,
        ]
    );

    const addEditColumn = useCallback(
        (columns) => {
            columns.unshift({
                field: 'edit',
                locked: true,
                pinned: 'left',
                lockPosition: 'left',
                sortable: false,
                filter: false,
                resizable: false,
                width: 100,
                headerName: '',
                cellRendererSelector: (params) => {
                    if (params.node.rowPinned) {
                        return {
                            component: EditingCellRenderer,
                            params: {
                                setEditingData: setEditingData,
                                setIsValidatingData: setIsValidatingData,
                                startEditing: startEditing,
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
                                        .modifiableEquipmentType,
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
                if (reorderedTableDefinitionIndexes) {
                    if (
                        reorderedTableDefinitionIndexes.indexOf(a.id) <
                        reorderedTableDefinitionIndexes.indexOf(b.id)
                    ) {
                        return -1;
                    }
                    if (
                        reorderedTableDefinitionIndexes.indexOf(a.id) >
                        reorderedTableDefinitionIndexes.indexOf(b.id)
                    )
                        return 1;
                }
                return 0;
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

    const getRows = useCallback(
        (index) => {
            if (props.disabled || !props.network) {
                return [];
            }
            const tableDefinition = TABLES_DEFINITION_INDEXES.get(index);
            const datasourceRows = tableDefinition.getter
                ? tableDefinition.getter(props.network)
                : props.network[TABLES_DEFINITION_INDEXES.get(index).resource];

            if (!datasourceRows) return [];
            return datasourceRows;
        },
        [props.disabled, props.network]
    );

    useEffect(() => {
        setColumnData(generateTableColumns(tabIndex));
        setRowData(getRows(tabIndex));
    }, [generateTableColumns, getRows, tabIndex]);

    const handleSwitchTab = useCallback(
        (value) => {
            setManualTabSwitch(true);
            setTabIndex(value);
            cleanTableState();
        },
        [cleanTableState]
    );

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
        const resource = TABLES_DEFINITION_INDEXES.get(tabIndex).resource;
        if (!props.network || props.disabled) return;
        props.network.useEquipment(resource);
    }, [props.network, props.disabled, tabIndex]);

    useEffect(() => {
        setManualTabSwitch(false);
    }, [props.equipmentChanged]);

    function getTabIndexFromEquipementType(equipmentType) {
        const definition = Object.values(TABLES_DEFINITIONS).find(
            (d) => d.name.toLowerCase() === equipmentType.toLowerCase()
        );
        return definition ? definition.index : 0;
    }

    useEffect(() => {
        if (
            props.equipmentId !== null &&
            props.equipmentType !== null &&
            !manualTabSwitch
        ) {
            const newIndex = getTabIndexFromEquipementType(props.equipmentType);
            setTabIndex(newIndex); // select the right table type
            // calculate row index to scroll to
            const rows = getRows(newIndex);
            let index = rows.findIndex((r) => r.id === props.equipmentId);
            setScrollToIndex(index ? index : undefined);
        } else if (manualTabSwitch) {
            setScrollToIndex();
        }
    }, [
        props.network,
        props.equipmentId,
        props.equipmentType,
        props.equipmentChanged,
        getRows,
        manualTabSwitch,
    ]);

    useEffect(() => {
        if (scrollToIndex) {
            gridRef.current.api?.ensureIndexVisible(scrollToIndex, 'top');
        }
    }, [gridRef, scrollToIndex]);

    useEffect(() => {
        const lockedColumnsConfig = TABLES_DEFINITION_INDEXES.get(tabIndex)
            .columns.filter((column) => lockedColumnsNames.has(column.id))
            .map((column) => {
                return { colId: column.field, pinned: 'left' };
            });

        if (isEditColumnVisible()) {
            lockedColumnsConfig.unshift({ colId: 'edit', pinned: 'left' });
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
                    columnData.indexOf(
                        columnData.find((obj) => {
                            return obj.id === event.column.colDef.id;
                        })
                    ),
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

    const buildEditPromise = useCallback(
        (editingData, groovyCr) => {
            switch (editingData?.metadata.equipmentType) {
                case EQUIPMENT_TYPES.LOAD.type:
                    return modifyLoad(
                        props.studyUuid,
                        props.currentNode?.id,
                        editingData.id,
                        editingData.name,
                        editingData.type,
                        editingData.p0,
                        editingData.q0,
                        undefined,
                        undefined,
                        false,
                        undefined
                    );
                case EQUIPMENT_TYPES.GENERATOR.type:
                    return modifyGenerator(
                        props.studyUuid,
                        props.currentNode?.id,
                        editingData.id,
                        editingData.name,
                        editingData.energySource,
                        editingData.minP,
                        editingData.maxP,
                        undefined,
                        editingData.targetP,
                        editingData.targetQ,
                        editingData.voltageRegulatorOn,
                        editingData.targetV,
                        undefined,
                        undefined,
                        undefined
                    );
                default:
                    return requestNetworkChange(
                        props.studyUuid,
                        props.currentNode?.id,
                        groovyCr
                    );
            }
        },
        [props.currentNode?.id, props.studyUuid]
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

            console.log(groovyCr);
            const editPromise = buildEditPromise(editingData, groovyCr);
            Promise.resolve(editPromise)
                .then(() => {
                    const transaction = {
                        update: [editingData],
                    };
                    gridRef.current.api.applyTransaction(transaction);
                    setEditingData();
                    setIsValidatingData(false);
                })
                .catch((promiseErrorMsg) => {
                    console.error(promiseErrorMsg);
                    rollbackEdit();
                    let message = intl.formatMessage({
                        id: 'paramsChangingDenied',
                    });
                    snackError({
                        messageTxt: message,
                        headerId: 'paramsChangingError',
                    });
                });
        },
        [
            buildEditPromise,
            editingData,
            intl,
            priorValuesBuffer,
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
            if (isValidatingData) {
                //we call stopEditing again to prevent editors flickering
                //gridRef.current.api.stopEditing();

                if (Object.values(priorValuesBuffer).length === 0) {
                    setEditingData();
                    return;
                }
                validateEdit(params);
            }
        },
        [isValidatingData, priorValuesBuffer, validateEdit]
    );

    const handleEditingStopped = useCallback(
        (params) => {
            if (!isValidatingData) {
                rollbackEdit();
            }
            params.context.dynamicValidation = {};
        },
        [isValidatingData, rollbackEdit]
    );

    return (
        <>
            <Grid container justifyContent={'space-between'}>
                <EquipmentTabs
                    disabled={!!(props.disabled || editingData)}
                    tabIndex={tabIndex}
                    handleSwitchTab={handleSwitchTab}
                />
                <Grid container>
                    <GlobalFilter
                        disabled={!!(props.disabled || editingData)}
                        gridRef={gridRef}
                        ref={globalFilterRef}
                    />
                    <ColumnsConfig
                        tabIndex={tabIndex}
                        disabled={!!(props.disabled || editingData)}
                        reorderedTableDefinitionIndexes={
                            reorderedTableDefinitionIndexes
                        }
                        selectedColumnsNames={selectedColumnsNames}
                        setSelectedColumnsNames={setSelectedColumnsNames}
                        lockedColumnsNames={lockedColumnsNames}
                        setLockedColumnsNames={setLockedColumnsNames}
                    />
                    <CsvExport
                        gridRef={gridRef}
                        tableName={TABLES_DEFINITION_INDEXES.get(tabIndex).name}
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
            {props.disabled ? (
                <Alert className={classes.invalidNode} severity="warning">
                    <FormattedMessage id="InvalidNode" />
                </Alert>
            ) : (
                <div className={classes.table}>
                    <EquipmentTable
                        gridRef={gridRef}
                        currentNode={props.currentNode}
                        rows={rowData}
                        columns={columnData}
                        editingData={editingData ? [editingData] : undefined}
                        fetched={props.network?.isResourceFetched(
                            TABLES_DEFINITION_INDEXES.get(tabIndex).resource
                        )}
                        scrollToIndex={scrollToIndex}
                        visible={props.visible}
                        network={props.network}
                        handleColumnDrag={handleColumnDrag}
                        handleRowEditing={handleRowEditing}
                        handleCellEditing={handleCellEditing}
                        handleEditingStopped={handleEditingStopped}
                    />
                </div>
            )}
        </>
    );
};

TableWrapper.defaultProps = {
    network: null,
    studyUuid: '',
    currentNode: null,
    equipmentId: null,
    equipmentType: null,
    equipmentChanged: false,
    loadFlowStatus: RunningStatus.IDLE,
    disabled: false,
};

TableWrapper.propTypes = {
    network: PropTypes.instanceOf(Network),
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    equipmentId: PropTypes.string,
    equipmentType: PropTypes.string,
    equipmentChanged: PropTypes.bool,
    loadFlowStatus: PropTypes.any,
    disabled: PropTypes.bool,
};

export default TableWrapper;
