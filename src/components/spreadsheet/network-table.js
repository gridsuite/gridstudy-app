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
import { updateConfigParameter } from '../../utils/rest-api';
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
import { INVALID_LOADFLOW_OPACITY } from '../../utils/colors';
import {
    useDefaultCellRenderer,
    useNumericDefaultCellRenderer,
} from './cell-renderers';
import { ColumnsSettingsDialog } from './columns-settings-dialog';

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
    checkboxSelectAll: {
        padding: theme.spacing(0, 3, 2, 2),
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    checkboxItem: {
        cursor: 'pointer',
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
    tableCell: {
        fontSize: 'small',
        cursor: 'initial',
        display: 'flex',
        '&:before': {
            content: '""',
            position: 'absolute',
            left: theme.spacing(0.5),
            right: theme.spacing(0.5),
            bottom: 0,
        },
    },
    inlineEditionCell: {
        backgroundColor: theme.palette.action.hover,
        '& div': {
            height: '100%',
        },
    },
    tableHeader: {
        fontSize: 'small',
        textTransform: 'uppercase',
        margin: theme.spacing(0.5),
        padding: theme.spacing(1.25, 3, 1.25, 1.25),
        fontWeight: 'bold',
        '&:before': {
            content: '""',
            position: 'absolute',
            left: theme.spacing(0.5),
            right: theme.spacing(0.5),
            bottom: 0,
            borderBottom: '1px solid ' + theme.palette.divider,
        },
    },
    leftFade: {
        background:
            'linear-gradient(to right, ' +
            theme.palette.primary.main +
            ' 0%, ' +
            theme.palette.primary.main +
            ' 2%, rgba(0,0,0,0) 12%)',
        borderBottomLeftRadius: theme.spacing(0.5),
        borderTopLeftRadius: theme.spacing(0.5),
    },
    topEditRow: {
        borderTop: '1px solid ' + theme.palette.primary.main,
        borderBottom: '1px solid ' + theme.palette.primary.main,
    },
    referenceEditRow: {
        '& button': {
            color: theme.palette.primary.main,
            cursor: 'initial',
        },
    },
    editCell: {
        fontSize: 'small',
        cursor: 'initial',
        '& button': {
            margin: 0,
            padding: 0,
            position: 'absolute',
            textAlign: 'center',
            bottom: theme.spacing(0.5),
        },
        '& button:first-child': {
            // Only applies to the first child
            left: theme.spacing(1.25),
        },
        '& button:nth-child(2)': {
            // Only applies to the second child
            right: theme.spacing(0.5),
        },
        '& button:first-child:nth-last-child(1)': {
            // If only ONE child, redefines its posiiton
            left: theme.spacing(3),
        },
    },
    columnConfigClosedLock: {
        fontSize: '1.2em',
        color: theme.palette.action.active,
    },
    columnConfigOpenLock: {
        fontSize: '1.2em',
        color: theme.palette.action.disabled,
    },
    tableLock: {
        fontSize: 'medium',
        marginRight: theme.spacing(0.75),
        color: theme.palette.action.disabled,
    },
    clickable: {
        cursor: 'pointer',
    },
    activeSortArrow: {
        '& .arrow': {
            fontSize: '1.1em',
            display: 'block',
            position: 'absolute',
            top: theme.spacing(2),
            right: 0,
            color: theme.palette.action.active,
        },
    },
    inactiveSortArrow: {
        '& .arrow': {
            fontSize: '1.1em',
            display: 'block',
            position: 'absolute',
            top: theme.spacing(2),
            right: 0,
            opacity: 0,
        },
        '&:hover .arrow': {
            fontSize: '1.1em',
            display: 'block',
            position: 'absolute',
            top: theme.spacing(2),
            right: 0,
            color: theme.palette.action.disabled,
            opacity: 1,
        },
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
    valueInvalid: {
        opacity: INVALID_LOADFLOW_OPACITY,
    },
    numericValue: {
        marginLeft: 'inherit', // use 'auto' to align right (if display is flex)
    },
    checkbox: {
        margin: '-10%',
        cursor: 'initial',
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

    const fluxConvention = useSelector((state) => state[PARAM_FLUX_CONVENTION]);

    const [lineEdit, setLineEdit] = useState(undefined);
    const [popupSelectColumnNames, setPopupSelectColumnNames] = useState(false);
    const [rowFilter, setRowFilter] = useState(undefined);
    const [tabIndex, setTabIndex] = useState(0);
    const [selectedColumnsNames, setSelectedColumnsNames] = useState(new Set());
    const [lockedColumnsNames, setLockedColumnsNames] = useState(new Set());
    const [
        reorderedTableDefinitionIndexes,
        setReorderedTableDefinitionIndexes,
    ] = useState([]);
    const [scrollToIndex, setScrollToIndex] = useState(-1);
    const [manualTabSwitch, setManualTabSwitch] = useState(true);

    const searchTextInput = useRef(null);

    const intl = useIntl();

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

    const isModifyingRow = useCallback(() => {
        return lineEdit?.id !== undefined;
    }, [lineEdit]);

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

            let result = [];
            for (let i = 0; i < datasourceRows.length; i++) {
                const row = datasourceRows[i];
                if (!rowFilter) {
                    result.push(row);
                }
            }
            return result;
        },
        [props.disabled, props.network, rowFilter]
    );
    const getRowsRef = useRef();
    getRowsRef.current = getRows;

    const [rowData, setRowData] = useState(getRows(tabIndex));

    const onTabChange = useCallback(() => {
        // when we change Tab, we dont want to keep/apply the search criteria
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
    }, []);

    function getTabIndexFromEquipementType(equipmentType) {
        const definition = Object.values(TABLES_DEFINITIONS).find(
            (d) => d.name.toLowerCase() === equipmentType.toLowerCase()
        );
        return definition ? definition.index : 0;
    }

    useEffect(() => {
        setManualTabSwitch(false);
    }, [props.equipmentChanged]);

    useEffect(() => {
        if (
            props.equipmentId !== null && // TODO always equals to true. Maybe this function is broken ?
            props.equipmentType !== null &&
            !manualTabSwitch &&
            !isModifyingRow()
        ) {
            const newIndex = getTabIndexFromEquipementType(props.equipmentType);
            setTabIndex(newIndex); // select the right table type
            // calculate row index to scroll to
            const rows = getRows(newIndex);
            let index = rows.findIndex((r) => r.id === props.equipmentId);
            setScrollToIndex(index !== undefined ? index : -1);
        } else if (manualTabSwitch) {
            setScrollToIndex(-1);
        }
    }, [
        props.network,
        props.equipmentId,
        props.equipmentType,
        props.equipmentChanged,
        getRows,
        manualTabSwitch,
        isModifyingRow,
    ]);

    const downloadCSVData = useCallback((e) => {
        gridRef?.current?.api?.exportDataAsCsv();
    }, []);

    const generateTableColumns = useCallback(
        (tabIndex) => {
            let generatedTableColumns = TABLES_DEFINITION_INDEXES.get(tabIndex)
                .columns.filter((c) => {
                    return selectedColumnsNames.has(c.id);
                })
                .map((c) => {
                    let column = {
                        ...c,
                        headerName: intl.formatMessage({ id: c.id }),
                        width: c.columnWidth ? c.columnWidth : MIN_COLUMN_WIDTH,
                    };
                    if (!column.cellRenderer && column.numeric) {
                        column.cellRenderer = useNumericDefaultCellRenderer;
                        column.cellRendererParams = {
                            loadFlowStatus: props.loadFlowStatus,
                            network: props.network,
                        };

                        if (column.normed) {
                            column.cellRendererParams = {
                                ...column.cellRendererParams,
                                fluxConvention: fluxConvention,
                            };
                        }
                    } else if (!column.cellRenderer) {
                        column.cellRenderer = useDefaultCellRenderer;
                    }

                    if (lockedColumnsNames.has(c.id)) {
                        column = {
                            ...column,
                            pinned: 'left',
                            lockPinned: true,
                        };
                    }

                    return column;
                });

            if (generatedTableColumns.length > 0) {
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
            }
            return generatedTableColumns;
        },
        [
            intl,
            lockedColumnsNames,
            props.loadFlowStatus,
            props.network,
            reorderedTableDefinitionIndexes,
            selectedColumnsNames,
        ]
    );
    const [columnData, setColumnData] = useState(
        generateTableColumns(tabIndex)
    );

    const generatedTableColumnsRef = useRef();
    generatedTableColumnsRef.current = generateTableColumns;

    useEffect(() => {
        setColumnData(generatedTableColumnsRef.current(tabIndex));
    }, [
        tabIndex,
        selectedColumnsNames,
        lockedColumnsNames,
        reorderedTableDefinitionIndexes,
    ]);

    function renderTable() {
        const resource = TABLES_DEFINITION_INDEXES.get(tabIndex).resource;
        return (
            <EquipmentTable
                gridRef={gridRef}
                currentNode={props.currentNode}
                rows={rowData}
                columns={columnData}
                fetched={props.network.isResourceFetched(resource)}
                scrollTop={scrollToIndex}
                visible={props.visible}
                showEditRow={isModifyingRow()}
                handleColumnDrag={handleColumnDrag}
            />
        );
    }

    function setFilter(event) {
        gridRef.current.api.setQuickFilter(event.target.value); // Value from the user's input
    }

    useEffect(() => {
        let tmpDataKeySet = new Set();
        TABLES_DEFINITION_INDEXES.get(tabIndex)
            .columns.filter((col) => selectedColumnsNames.has(col.id))
            .forEach((col) => tmpDataKeySet.add(col.dataKey));
        setRowData(getRowsRef.current(tabIndex));
    }, [tabIndex, selectedColumnsNames]);

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
                console.log(event);

                let reorderedTableDefinitionIndexesTemp = [
                    ...reorderedTableDefinitionIndexes,
                ];
                const [reorderedItem] =
                    reorderedTableDefinitionIndexesTemp.splice(
                        reorderedTableDefinitionIndexesTemp.indexOf(
                            event.column.colDef.id
                        ),
                        1
                    );
                reorderedTableDefinitionIndexesTemp.splice(
                    event.toIndex,
                    0,
                    reorderedItem
                );

                setReorderedTableDefinitionIndexes(
                    reorderedTableDefinitionIndexesTemp
                );

                updateConfigParameter(
                    REORDERED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE +
                        TABLES_NAMES[tabIndex],
                    JSON.stringify(reorderedTableDefinitionIndexesTemp)
                ).catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'paramsChangingError',
                    });
                });

                const columnDataTemp = columnData;
                const [reorderedColDef] = columnData.splice(
                    columnData.indexOf(
                        columnData.find((obj) => {
                            return obj.id === event.column.colDef.id;
                        })
                    ),
                    1
                );
                columnDataTemp.splice(event.toIndex, 0, reorderedColDef);
                setColumnData(columnDataTemp);
            }
        },
        [columnData, reorderedTableDefinitionIndexes, snackError, tabIndex]
    );

    const getCSVFilename = useCallback(() => {
        const tabName = TABLES_DEFINITION_INDEXES.get(tabIndex).name;
        const localisedTabName = intl.formatMessage({ id: tabName });
        return localisedTabName
            .trim()
            .replace(/[\\/:"*?<>|\s]/g, '-') // Removes the filesystem sensible characters
            .substring(0, 27); // Best practice : limits the filename size to 31 characters (27+'.csv')
    }, [intl, tabIndex]);

    function renderAll() {
        return (
            props.network && (
                <>
                    <Grid container justifyContent={'space-between'}>
                        <Grid container justifyContent={'space-between'} item>
                            <Tabs
                                value={tabIndex}
                                variant="scrollable"
                                onChange={(event, newValue) => {
                                    setTabIndex(newValue);
                                    setManualTabSwitch(true);
                                    onTabChange(newValue);
                                }}
                                aria-label="tables"
                            >
                                {Object.values(TABLES_DEFINITIONS).map(
                                    (table) => (
                                        <Tab
                                            key={table.name}
                                            label={intl.formatMessage({
                                                id: table.name,
                                            })}
                                            disabled={
                                                isModifyingRow() ||
                                                props.disabled
                                            }
                                        />
                                    )
                                )}
                            </Tabs>
                        </Grid>
                        <Grid container>
                            <Grid item className={classes.containerInputSearch}>
                                <TextField
                                    disabled={
                                        isModifyingRow() || props.disabled
                                    }
                                    className={classes.textField}
                                    size="small"
                                    placeholder={
                                        intl.formatMessage({ id: 'filter' }) +
                                        '...'
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
                                                        isModifyingRow() ||
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
                                        [classes.disabledLabel]:
                                            isModifyingRow() || props.disabled,
                                    })}
                                >
                                    <FormattedMessage id="LabelSelectList" />
                                </span>
                                <IconButton
                                    disabled={
                                        isModifyingRow() || props.disabled
                                    }
                                    className={
                                        selectedColumnsNames.size === 0
                                            ? classes.blink
                                            : ''
                                    }
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
                                            isModifyingRow() ||
                                            props.disabled ||
                                            rowData.length === 0,
                                    })}
                                >
                                    <FormattedMessage id="MuiVirtualizedTable/exportCSV" />
                                </span>
                                <span>
                                    <IconButton
                                        disabled={
                                            isModifyingRow() ||
                                            props.disabled ||
                                            rowData.length === 0
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
                        {/*This render is fast, rerender full dom everytime */}
                        {renderTable()}
                    </div>

                    <ColumnsSettingsDialog
                        popupSelectColumnNames={popupSelectColumnNames}
                        tabIndex={tabIndex}
                        handleClose={() => {
                            setPopupSelectColumnNames(false);
                        }}
                        reorderedTableDefinitionIndexes={
                            reorderedTableDefinitionIndexes
                        }
                        selectedColumnsNames={selectedColumnsNames}
                        setSelectedColumnsNames={setSelectedColumnsNames}
                        lockedColumnsNames={lockedColumnsNames}
                        setLockedColumnsNames={setLockedColumnsNames}
                    />
                </>
            )
        );
    }

    return renderAll();
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
