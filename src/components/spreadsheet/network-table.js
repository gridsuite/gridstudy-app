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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { FormattedMessage, useIntl } from 'react-intl';
import InputAdornment from '@mui/material/InputAdornment';
import { IconButton, TextField, Grid, Alert } from '@mui/material';
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
} from './config-tables';
import { EquipmentTable } from './equipment-table';
import makeStyles from '@mui/styles/makeStyles';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { PARAM_FLUX_CONVENTION } from '../../utils/config-params';
import SearchIcon from '@mui/icons-material/Search';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import GetAppIcon from '@mui/icons-material/GetApp';
import clsx from 'clsx';
import { RunningStatus } from '../util/running-status';
import {
    DisabledEditCellRenderer,
    EditableCellRenderer,
    EditedLineCellRenderer,
    EditingCellRenderer,
} from './cell-renderers';
import { ColumnsSettingsDialog } from './columns-settings-dialog';
import { EQUIPMENT_TYPES } from 'components/util/equipment-types';

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
    searchSection: {
        paddingRight: theme.spacing(1),
        alignItems: 'center',
    },
    table: {
        marginTop: theme.spacing(2.5),
        lineHeight: 'unset',
    },
    containerInputSearch: {
        marginTop: theme.spacing(2),
        marginLeft: theme.spacing(1),
    },
    selectColumns: {
        marginTop: theme.spacing(2),
        marginLeft: theme.spacing(6),
    },
    exportCsv: {
        marginTop: theme.spacing(2),
        marginLeft: theme.spacing(6),
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'baseline',
        position: 'absolute',
        right: 0,
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

const NetworkTable = (props) => {
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

    const [popupSelectColumnNames, setPopupSelectColumnNames] = useState(false);

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

    const searchTextInput = useRef(null);

    const [previousValuesBuffer, addDataToBuffer, resetBuffer] =
        useEditBuffer();
    const [editingData, setEditingData] = useState();
    const [isValidatingData, setIsValidatingData] = useState(false);

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

            column.width = column.columnWidth
                ? column.columnWidth
                : MIN_COLUMN_WIDTH;

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
                            },
                        };
                    } else if (editingData?.id === params.data.id) {
                        return {
                            component: EditedLineCellRenderer,
                        };
                    } else if (editingData) {
                        return {
                            component: DisabledEditCellRenderer,
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
        [editingData, tabIndex]
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

    useEffect(() => {
        setColumnData(generateTableColumns(tabIndex));
    }, [tabIndex, generateTableColumns]);

    const getRows = useCallback(
        (index) => {
            if (props.disabled) {
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

    const [rowData, setRowData] = useState(getRows(tabIndex));
    const [columnData, setColumnData] = useState(
        generateTableColumns(tabIndex)
    );

    const rollbackEdit = useCallback(() => {
        //mecanism to undo last edits if it is invalidated
        Object.entries(previousValuesBuffer).forEach(() => {
            gridRef.current.api.undoCellEditing();
        });
        resetBuffer();
        setEditingData();
        setIsValidatingData(false);
    }, [previousValuesBuffer, resetBuffer]);

    const onSwitchTab = useCallback(() => {
        // when we switch tab, we dont want to keep/apply the search criteria
        if (
            !searchTextInput.current.value ||
            searchTextInput.current.value !== ''
        ) {
            searchTextInput.current.value = '';
        }
        gridRef?.current?.api.setFilterModel(null);
        gridRef?.current?.columnApi.applyColumnState({
            defaultState: { sort: null },
        });
        rollbackEdit();
    }, [rollbackEdit]);

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

    function setFilter(event) {
        gridRef.current.api.setQuickFilter(event.target.value);
    }

    useEffect(() => {
        const tmpDataKeySet = new Set();
        TABLES_DEFINITION_INDEXES.get(tabIndex)
            .columns.filter((col) => selectedColumnsNames.has(col.id))
            .forEach((col) => tmpDataKeySet.add(col.dataKey));
        setRowData(getRows(tabIndex));
    }, [tabIndex, selectedColumnsNames, getRows]);

    useEffect(() => {
        const resource = TABLES_DEFINITION_INDEXES.get(tabIndex).resource;
        if (props.network.isResourceFetched(resource)) {
            const rows = props.network[resource];
            rows.forEach((row, index) => {
                if (!row.id) row.id = index;
            });

            setRowData(rows);
        }
    }, [props.network, tabIndex]);

    const handleOpenPopupSelectColumnNames = () => {
        setPopupSelectColumnNames(true);
    };

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

    const getCSVFilename = useCallback(() => {
        const tabName = TABLES_DEFINITION_INDEXES.get(tabIndex).name;
        const localisedTabName = intl.formatMessage({ id: tabName });
        return localisedTabName
            .trim()
            .replace(/[\\/:"*?<>|\s]/g, '-') // Removes the filesystem sensible characters
            .substring(0, 27); // Best practice : limits the filename size to 31 characters (27+'.csv')
    }, [intl, tabIndex]);

    const downloadCSVData = useCallback(() => {
        gridRef?.current?.api?.exportDataAsCsv({
            suppressQuotes: true,
            fileName: getCSVFilename(),
        });
    }, [getCSVFilename]);

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

            const isTransformer =
                editingData?.metadata.equipmentType ===
                    TABLES_DEFINITIONS.TWO_WINDINGS_TRANSFORMERS
                        .modifiableEquipmentType ||
                editingData?.metadata.equipmentType ===
                    TABLES_DEFINITIONS.THREE_WINDINGS_TRANSFORMERS
                        .modifiableEquipmentType;

            Object.entries(previousValuesBuffer).forEach(([field, value]) => {
                //TODO this is when we change transformer, in case we want to change the tap position from spreadsheet, we set it inside
                // tapChanger object. so we extract the value from the object before registering a change request.
                // this part should be removed if we don't pass tapPosition inside another Object anymore
                const column = gridRef.current.columnApi.getColumn(field);
                const val =
                    isTransformer && field
                        ? editingData[field].tapPosition
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
            previousValuesBuffer,
            rollbackEdit,
            snackError,
            tabIndex,
        ]
    );

    const handleCellEditing = useCallback(
        (event) => {
            addDataToBuffer(event.colDef.field, event.oldValue);
        },
        [addDataToBuffer]
    );

    const handleRowEditing = useCallback(
        (params) => {
            if (isValidatingData) {
                //we call stopEditing again to prevent editors flickering
                gridRef.current.api.stopEditing();

                if (Object.values(previousValuesBuffer).length === 0) {
                    setEditingData();
                    return;
                }
                validateEdit(params);
            }
        },
        [isValidatingData, previousValuesBuffer, validateEdit]
    );

    const handleEditingStopped = useCallback(() => {
        if (!isValidatingData) {
            rollbackEdit();
        }
    }, [isValidatingData, rollbackEdit]);

    const handleCloseColumnsSettingDialog = useCallback(() => {
        setPopupSelectColumnNames(false);
    }, []);

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

    const renderTabs = useCallback(() => {
        return TABLES_NAMES.map((table) => (
            <Tab
                key={table}
                label={intl.formatMessage({
                    id: table,
                })}
                disabled={props.disabled}
            />
        ));
    }, [intl, props.disabled]);

    return (
        <>
            <Grid container justifyContent={'space-between'}>
                <Grid container justifyContent={'space-between'} item>
                    <Tabs
                        value={tabIndex}
                        variant="scrollable"
                        onChange={(event, newValue) => {
                            setTabIndex(newValue);
                            setManualTabSwitch(true);
                            onSwitchTab(newValue);
                        }}
                        aria-label="tables"
                    >
                        {renderTabs()}
                    </Tabs>
                </Grid>
                <Grid container>
                    <Grid item className={classes.containerInputSearch}>
                        <TextField
                            disabled={props.disabled}
                            className={classes.textField}
                            size="small"
                            placeholder={
                                intl.formatMessage({ id: 'filter' }) + '...'
                            }
                            onChange={setFilter}
                            inputRef={searchTextInput}
                            fullWidth
                            InputProps={{
                                classes: {
                                    input: classes.searchSection,
                                },
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon
                                            color={
                                                props.disabled
                                                    ? 'disabled'
                                                    : 'inherit'
                                            }
                                        />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item className={classes.selectColumns}>
                        <span
                            className={clsx({
                                [classes.disabledLabel]: props.disabled,
                            })}
                        >
                            <FormattedMessage id="LabelSelectList" />
                        </span>
                        <IconButton
                            disabled={props.disabled}
                            className={clsx({
                                [classes.blink]:
                                    selectedColumnsNames.size === 0,
                            })}
                            aria-label="dialog"
                            onClick={handleOpenPopupSelectColumnNames}
                        >
                            <ViewColumnIcon />
                        </IconButton>
                    </Grid>
                    {props.disabled && (
                        <Alert
                            className={classes.invalidNode}
                            severity="warning"
                        >
                            <FormattedMessage id="InvalidNode" />
                        </Alert>
                    )}
                    <Grid item className={classes.exportCsv}>
                        <span
                            className={clsx({
                                [classes.disabledLabel]:
                                    props.disabled || rowData.length === 0,
                            })}
                        >
                            <FormattedMessage id="MuiVirtualizedTable/exportCSV" />
                        </span>
                        <span>
                            <IconButton
                                disabled={
                                    props.disabled || rowData.length === 0
                                }
                                aria-label="exportCSVButton"
                                onClick={downloadCSVData}
                            >
                                <GetAppIcon />
                            </IconButton>
                        </span>
                    </Grid>
                </Grid>
            </Grid>
            <div className={classes.table} style={{ flexGrow: 1 }}>
                <EquipmentTable
                    gridRef={gridRef}
                    currentNode={props.currentNode}
                    rows={rowData}
                    columns={columnData}
                    fetched={props.network.isResourceFetched(
                        TABLES_DEFINITION_INDEXES.get(tabIndex).resource
                    )}
                    scrollTop={scrollToIndex}
                    visible={props.visible}
                    editingData={editingData}
                    startEditing={startEditing}
                    network={props.network}
                    handleColumnDrag={handleColumnDrag}
                    handleRowEditing={handleRowEditing}
                    handleCellEditing={handleCellEditing}
                    handleEditingStopped={handleEditingStopped}
                />
            </div>

            <ColumnsSettingsDialog
                popupSelectColumnNames={popupSelectColumnNames}
                tabIndex={tabIndex}
                handleClose={handleCloseColumnsSettingDialog}
                reorderedTableDefinitionIndexes={
                    reorderedTableDefinitionIndexes
                }
                selectedColumnsNames={selectedColumnsNames}
                setSelectedColumnsNames={setSelectedColumnsNames}
                lockedColumnsNames={lockedColumnsNames}
                setLockedColumnsNames={setLockedColumnsNames}
            />
        </>
    );
};

NetworkTable.defaultProps = {
    network: null,
    studyUuid: '',
    currentNode: null,
    equipmentId: null,
    equipmentType: null,
    equipmentChanged: false,
    loadFlowStatus: RunningStatus.IDLE,
    disabled: false,
};

NetworkTable.propTypes = {
    network: PropTypes.instanceOf(Network),
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    equipmentId: PropTypes.string,
    equipmentType: PropTypes.string,
    equipmentChanged: PropTypes.bool,
    loadFlowStatus: PropTypes.any,
    disabled: PropTypes.bool,
};

export default NetworkTable;
