/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Network from './network';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { FormattedMessage, useIntl } from 'react-intl';
import InputAdornment from '@mui/material/InputAdornment';
import { IconButton, TextField, Tooltip, Grid, Alert } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {
    requestNetworkChange,
    updateConfigParameter,
    modifyLoad,
    modifyGenerator,
} from '../../utils/rest-api';
import { SelectOptionsDialog } from '../../utils/dialogs';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import CsvDownloader from 'react-csv-downloader';
import ListItemText from '@mui/material/ListItemText';
import {
    DISPLAYED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE,
    LOCKED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE,
    REORDERED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE,
    TABLES_COLUMNS_NAMES,
    TABLES_DEFINITION_INDEXES,
    TABLES_DEFINITIONS,
    TABLES_NAMES,
    MIN_COLUMN_WIDTH,
    MAX_LOCKS_PER_TAB,
    EDIT_CELL_WIDTH,
} from './config-tables';
import { EquipmentTable } from './equipment-table';
import makeStyles from '@mui/styles/makeStyles';
import { useSnackMessage } from '../../utils/messages';
import { PARAM_FLUX_CONVENTION } from '../../utils/config-params';
import { OverflowableText } from '@gridsuite/commons-ui';
import SearchIcon from '@mui/icons-material/Search';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import LockIcon from '@mui/icons-material/Lock';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import GetAppIcon from '@mui/icons-material/GetApp';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import clsx from 'clsx';
import { RunningStatus } from '../util/running-status';
import { INVALID_LOADFLOW_OPACITY } from '../../utils/colors';
import { useIsAnyNodeBuilding } from '../util/is-any-node-building-hook';
import { isNodeReadOnly } from '../graph/util/model-functions';

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
        padding: theme.spacing(1.25),
        display: 'flex',
        '&:before': {
            content: '""',
            position: 'absolute',
            left: theme.spacing(0.5),
            right: theme.spacing(0.5),
            bottom: 0,
            borderBottom: '1px solid ' + theme.palette.divider,
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
    invalidData: {
        position: 'absolute',
        top: '30%',
        left: '43%',
    },
}));

const NetworkTable = (props) => {
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
    const [columnSort, setColumnSort] = useState(undefined);
    const [tabIndex, setTabIndex] = useState(0);
    const [selectedColumnsNames, setSelectedColumnsNames] = useState(new Set());
    const [lockedColumnsNames, setLockedColumnsNames] = useState(new Set());
    const [
        reorderedTableDefinitionIndexes,
        setReorderedTableDefinitionIndexes,
    ] = useState(new Set());
    const [scrollToIndex, setScrollToIndex] = useState(-1);
    const [manualTabSwitch, setManualTabSwitch] = useState(true);
    const [selectedDataKey, setSelectedDataKey] = useState(new Set());

    const searchTextInput = useRef(null);

    const isAnyNodeBuilding = useIsAnyNodeBuilding();

    const isLineOnEditMode = useCallback(
        (rowData) => {
            return lineEdit && rowData.id === lineEdit.id;
        },
        [lineEdit]
    );

    const intl = useIntl();

    useEffect(() => {
        const allDisplayedTemp = allDisplayedColumnsNames[tabIndex];
        const newSelectedColumns = new Set(
            allDisplayedTemp ? JSON.parse(allDisplayedTemp) : []
        );
        setSelectedColumnsNames(newSelectedColumns);
        setLineEdit({});

        // Sort ID column by default, if selected
        if (!newSelectedColumns.has('ID')) {
            setColumnSort(undefined);
        } else {
            const tableDef = TABLES_DEFINITION_INDEXES.get(tabIndex);
            const columnDef = tableDef.columns.find((c) => c.id === 'ID');
            if (!columnDef) {
                console.error(
                    'ID column selected, but no ID identifier in TABLES_DEFINITION'
                );
                setColumnSort(undefined);
            } else {
                setColumnSort({
                    key: columnDef.dataKey,
                    reverse: false, // default sort = ASC
                    numeric: columnDef.numeric,
                    colDef: columnDef,
                });
            }
        }
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

    const formatCell = useCallback(
        (rowData, columnDefinition) => {
            let value = rowData[columnDefinition.dataKey];
            let tooltipValue = undefined;
            if (columnDefinition.cellDataGetter) {
                value = columnDefinition.cellDataGetter(rowData, props.network);
            }
            if (columnDefinition.normed) {
                value = columnDefinition.normed(fluxConvention, value);
            }
            // Note: a data may be missing in the server response (ex: p1 from 2W-Transfo).
            // In this case, its value is undefined and nothing is displayed in the cell.
            if (
                value !== undefined &&
                columnDefinition.numeric &&
                columnDefinition.fractionDigits
            ) {
                // only numeric rounded cells have a tooltip (their raw numeric value)
                tooltipValue = value;
                value = parseFloat(value).toFixed(
                    columnDefinition.fractionDigits
                );
            }
            return { value: value, tooltip: tooltipValue };
        },
        [fluxConvention, props.network]
    );

    const filter = useCallback(
        (rowData, tabIndex) => {
            if (!rowFilter) return true;
            const tableDef = TABLES_DEFINITION_INDEXES.get(tabIndex);

            function filterMatch(colName) {
                const columnDef = tableDef.columns.find(
                    (c) => c.dataKey === colName
                );
                // we want to filter on formatted values
                let value = formatCell(rowData, columnDef).value;
                return value !== undefined && rowFilter.test(value);
            }

            return (
                [...selectedDataKey].find((colName) => filterMatch(colName)) !==
                undefined
            );
        },
        [rowFilter, selectedDataKey, formatCell]
    );

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
                if (!rowFilter || filter(row, index)) {
                    result.push(row);
                }
            }

            function compareValue(a, b, isNumeric, reverse) {
                const mult = reverse ? -1 : 1;
                if (a === b) return 0;
                else if (a === undefined) return mult;
                else if (b === undefined) return -mult;

                return isNumeric
                    ? (Number(a) < Number(b) ? -1 : 1) * mult
                    : ('' + a).localeCompare(b) * mult;
            }

            if (columnSort) {
                result = result.sort((a, b) => {
                    return compareValue(
                        formatCell(a, columnSort.colDef).value,
                        formatCell(b, columnSort.colDef).value,
                        columnSort.numeric,
                        columnSort.reverse
                    );
                });
            }

            if (isModifyingRow()) {
                // When modifying a row, a shallow copy of the edited row is created and put on top of the table.
                // The edition is then done on the copy, on top of the table, and not below, to prevent
                // bugs of rows changing position in the middle of modifications.
                let editRowPosition;
                for (
                    editRowPosition = 0;
                    editRowPosition < result.length;
                    editRowPosition++
                ) {
                    if (isLineOnEditMode(result[editRowPosition])) {
                        return [result[editRowPosition], ...result];
                    }
                }
            }
            return result;
        },
        [
            props.network,
            rowFilter,
            columnSort,
            filter,
            formatCell,
            props.disabled,
            isModifyingRow,
            isLineOnEditMode,
        ]
    );

    const onTabChange = useCallback(() => {
        // when we change Tab, we dont want to keep/apply the search criteria
        if (
            !searchTextInput.current.value ||
            searchTextInput.current.value !== ''
        ) {
            searchTextInput.current.value = '';
            setFilterValue('');
        }
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

    const renderTableLockIcon = useCallback(() => {
        return <LockIcon className={classes.tableLock} />;
    }, [classes.tableLock]);

    const isActiveSortArrow = (columnSort, dataKey) => {
        return columnSort && columnSort.key === dataKey;
    };

    const sortIconClassStyle = useCallback(
        (columnSort, dataKey) => {
            let isSortArrowActive = isActiveSortArrow(columnSort, dataKey);
            return clsx({
                [classes.activeSortArrow]: isSortArrowActive,
                [classes.inactiveSortArrow]: !isSortArrowActive,
                [classes.clickable]: !isModifyingRow(),
            });
        },
        [
            classes.activeSortArrow,
            classes.inactiveSortArrow,
            classes.clickable,
            isModifyingRow,
        ]
    );

    const renderSortArrowIcon = useCallback(
        (columnSort, dataKey) => {
            if (!isActiveSortArrow(columnSort, dataKey) && isModifyingRow()) {
                return null;
            }
            if (
                columnSort &&
                columnSort.key === dataKey &&
                columnSort.reverse
            ) {
                return <ArrowDownwardIcon className={'arrow'} />;
            }
            return <ArrowUpwardIcon className={'arrow'} />;
        },
        [isModifyingRow]
    );

    const renderColumnConfigLockIcon = (value) => {
        if (selectedColumnsNames.has(value)) {
            if (lockedColumnsNames.has(value)) {
                return <LockIcon className={classes.columnConfigClosedLock} />;
            } else {
                if (lockedColumnsNames.size < MAX_LOCKS_PER_TAB) {
                    return (
                        <LockOpenIcon
                            className={classes.columnConfigOpenLock}
                        />
                    );
                }
            }
        }
    };

    const setSort = useCallback(
        (columnDefinition) => {
            if (isModifyingRow()) {
                return;
            }
            // 1 clic : ASC, 2 clic : DESC, 3 clic : no sort
            if (!columnSort || columnSort.key !== columnDefinition.dataKey) {
                setColumnSort({
                    key: columnDefinition.dataKey,
                    reverse: false,
                    numeric: columnDefinition.numeric,
                    colDef: columnDefinition,
                });
            } else if (!columnSort.reverse) {
                setColumnSort({
                    key: columnDefinition.dataKey,
                    reverse: true,
                    numeric: columnDefinition.numeric,
                    colDef: columnDefinition,
                });
            } else {
                setColumnSort(undefined);
            }
        },
        [columnSort, isModifyingRow]
    );

    const headerCellRender = useCallback(
        (columnDefinition, key, style) => {
            if (columnDefinition.editColumn) {
                return <div key={key} style={style} />;
            }
            return (
                <div
                    key={key}
                    style={style}
                    align="left"
                    onClick={() => setSort(columnDefinition)}
                    className={sortIconClassStyle(
                        columnSort,
                        columnDefinition.dataKey
                    )}
                >
                    <div className={clsx(classes.tableHeader, {})}>
                        {columnDefinition.locked ? renderTableLockIcon() : ''}
                        {columnDefinition.label}
                    </div>
                    <span>
                        {renderSortArrowIcon(
                            columnSort,
                            columnDefinition.dataKey
                        )}
                    </span>
                </div>
            );
        },
        [
            classes.tableHeader,
            columnSort,
            renderTableLockIcon,
            setSort,
            sortIconClassStyle,
            renderSortArrowIcon,
        ]
    );

    const editCellRender = (
        rowData,
        columnDefinition,
        key,
        style,
        rowIndex
    ) => {
        function resetChanges(rowData) {
            Object.entries(lineEdit.oldValues).forEach(([key, oldValue]) => {
                rowData[key] = oldValue;
            });
            setLineEdit({});
        }
        function commitChanges(rowData) {
            function capitaliseFirst(str) {
                return str.charAt(0).toUpperCase() + str.slice(1);
            }

            if (Object.values(lineEdit.newValues).length === 0) {
                // nothing to commit => abort
                resetChanges();
                return;
            }
            // TODO: generic groovy updates should be replaced by specific hypothesis creations, like modifyLoad() below
            // TODO: when no more groovy, remove changeCmd everywhere, remove requestNetworkChange()
            let groovyCr =
                'equipment = network.get' +
                capitaliseFirst(
                    TABLES_DEFINITION_INDEXES.get(tabIndex)
                        .modifiableEquipmentType
                ) +
                "('" +
                lineEdit.id.replace(/'/g, "\\'") +
                "')\n";
            Object.values(lineEdit.newValues).forEach((cr) => {
                groovyCr += cr.changeCmd.replace(/\{\}/g, cr.value) + '\n';
            });

            Promise.resolve(
                lineEdit.equipmentType === 'load'
                    ? modifyLoad(
                          props.studyUuid,
                          props.currentNode?.id,
                          lineEdit.id,
                          lineEdit.newValues.name?.value,
                          lineEdit.newValues.type?.value,
                          lineEdit.newValues.p0?.value,
                          lineEdit.newValues.q0?.value,
                          undefined,
                          undefined,
                          false,
                          undefined
                      )
                    : lineEdit.equipmentType === 'generator'
                    ? modifyGenerator(
                          props.studyUuid,
                          props.currentNode?.id,
                          lineEdit.id,
                          lineEdit.newValues.name?.value,
                          lineEdit.newValues.energySource?.value,
                          lineEdit.newValues.minP?.value,
                          lineEdit.newValues.maxP?.value,
                          undefined,
                          lineEdit.newValues.targetP?.value,
                          lineEdit.newValues.targetQ?.value,
                          lineEdit.newValues.voltageRegulatorOn?.value,
                          lineEdit.newValues.targetV?.value,
                          undefined,
                          undefined,
                          undefined
                      )
                    : requestNetworkChange(
                          props.studyUuid,
                          props.currentNode?.id,
                          groovyCr
                      )
            )
                .then(() => {
                    Object.entries(lineEdit.newValues).forEach(([key, cr]) => {
                        rowData[key] = cr.value;
                    });
                    // TODO When the data is saved, we should force an update of the table's data. As is, it takes too long to update.
                    // And maybe add a visual clue that the save was successful ?
                })
                .catch((promiseErrorMsg) => {
                    console.error(promiseErrorMsg);
                    Object.entries(lineEdit.oldValues).forEach(
                        ([key, oldValue]) => {
                            rowData[key] = oldValue;
                        }
                    );
                    let message = intl.formatMessage({
                        id: 'paramsChangingDenied',
                    });
                    snackError({
                        messageTxt: message,
                        headerId: 'paramsChangingError',
                    });
                });
            setLineEdit({});
        }

        if (isLineOnEditMode(rowData)) {
            if (rowIndex === 1) {
                // The current line is in edit mode and is the top one.
                return (
                    <div
                        key={key}
                        style={style}
                        className={clsx(classes.topEditRow, classes.leftFade)}
                    >
                        <div className={classes.editCell}>
                            {lineEdit.errors.size === 0 && (
                                <IconButton
                                    size={'small'}
                                    onClick={() => commitChanges(rowData)}
                                >
                                    <CheckIcon />
                                </IconButton>
                            )}
                            <IconButton
                                size={'small'}
                                onClick={() => resetChanges(rowData)}
                            >
                                <ClearIcon />
                            </IconButton>
                        </div>
                    </div>
                );
            }
            // The current line is in edit mode, but is not the top one.
            return (
                <div
                    key={key}
                    style={style}
                    className={clsx(classes.referenceEditRow, classes.leftFade)}
                >
                    <div className={classes.editCell}>
                        <IconButton
                            size={'small'}
                            style={{ backgroundColor: 'transparent' }}
                            disableRipple
                        >
                            <MoreHorizIcon />
                        </IconButton>
                    </div>
                </div>
            );
        } else {
            return (
                <div key={key} style={style}>
                    <div className={classes.editCell}>
                        <IconButton
                            size={'small'}
                            disabled={
                                isModifyingRow() &&
                                !isAnyNodeBuilding &&
                                !isNodeReadOnly(props.currentNode)
                            }
                            onClick={() => {
                                setLineEdit({
                                    oldValues: {},
                                    newValues: {},
                                    id: rowData.id,
                                    errors: new Map(),
                                    equipmentType:
                                        TABLES_DEFINITION_INDEXES.get(tabIndex)
                                            .modifiableEquipmentType,
                                });
                            }}
                        >
                            {!isAnyNodeBuilding &&
                                !isNodeReadOnly(props.currentNode) && (
                                    <EditIcon />
                                )}
                        </IconButton>
                    </div>
                </div>
            );
        }
    };

    const defaultCellRender = useCallback(
        (rowData, columnDefinition, key, style, rowIndex) => {
            const cellValue = formatCell(rowData, columnDefinition);
            return (
                <div
                    key={key}
                    style={style}
                    className={clsx({
                        [classes.topEditRow]:
                            isLineOnEditMode(rowData) && rowIndex === 1,
                        [classes.referenceEditRow]:
                            isLineOnEditMode(rowData) && rowIndex > 1,
                    })}
                >
                    <div className={classes.tableCell}>
                        {cellValue.tooltip !== undefined ? (
                            <Tooltip
                                disableFocusListener
                                disableTouchListener
                                title={cellValue.tooltip}
                            >
                                <div
                                    children={cellValue.value}
                                    className={clsx({
                                        [classes.valueInvalid]:
                                            columnDefinition.canBeInvalidated &&
                                            props.loadFlowStatus !==
                                                RunningStatus.SUCCEED,
                                        [classes.numericValue]:
                                            columnDefinition.numeric,
                                    })}
                                />
                            </Tooltip>
                        ) : (
                            <OverflowableText
                                className={clsx({
                                    [classes.valueInvalid]:
                                        columnDefinition.canBeInvalidated &&
                                        props.loadFlowStatus !==
                                            RunningStatus.SUCCEED,
                                    [classes.numericValue]:
                                        columnDefinition.numeric,
                                })}
                                text={cellValue.value}
                            />
                        )}
                    </div>
                </div>
            );
        },
        [
            classes.tableCell,
            classes.valueInvalid,
            classes.numericValue,
            classes.topEditRow,
            classes.referenceEditRow,
            props.loadFlowStatus,
            formatCell,
            isLineOnEditMode,
        ]
    );

    /**
     * Used for boolean cell data value to render a checkbox
     * @param {any} rowData data of row
     * @param {any} columnDefinition definition of column
     * @param {any} key key of element
     * @param {any} style style for table cell element
     * @param {any} rowIndex rowIndex of element
     * @returns {JSX.Element} Component template
     */
    const booleanCellRender = useCallback(
        (rowData, columnDefinition, key, style, rowIndex) => {
            const isChecked = formatCell(rowData, columnDefinition).value;
            return (
                <div
                    key={key}
                    style={style}
                    className={clsx({
                        [classes.topEditRow]:
                            isLineOnEditMode(rowData) && rowIndex === 1,
                        [classes.referenceEditRow]:
                            isLineOnEditMode(rowData) && rowIndex > 1,
                    })}
                >
                    <div
                        className={clsx(classes.tableCell, {
                            [classes.valueInvalid]:
                                columnDefinition.canBeInvalidated &&
                                props.loadFlowStatus !== RunningStatus.SUCCEED,
                        })}
                    >
                        {isChecked !== undefined && (
                            <Checkbox
                                color="default"
                                className={classes.checkbox}
                                checked={isChecked}
                                // #TODO to change by using dynamic value when handling events (Ripple: its an annimation effect when hover/click on checkbox)
                                disableRipple={true}
                            />
                        )}
                    </div>
                </div>
            );
        },
        [
            formatCell,
            classes.tableCell,
            classes.valueInvalid,
            classes.checkbox,
            classes.topEditRow,
            classes.referenceEditRow,
            props.loadFlowStatus,
            isLineOnEditMode,
        ]
    );

    const setColumnInError = useCallback(
        (dataKey) => {
            if (!lineEdit.errors.has(dataKey)) {
                let newLineEdit = { ...lineEdit };
                newLineEdit.errors.set(dataKey, true);
                setLineEdit(newLineEdit);
            }
        },
        [lineEdit]
    );

    const resetColumnInError = useCallback(
        (dataKey) => {
            if (lineEdit.errors.has(dataKey)) {
                let newLineEdit = { ...lineEdit };
                newLineEdit.errors.delete(dataKey);
                setLineEdit(newLineEdit);
            }
        },
        [lineEdit]
    );

    const forceLineUpdate = useCallback(() => {
        let newLineEdit = { ...lineEdit };
        setLineEdit(newLineEdit);
    }, [lineEdit]);

    const registerChangeRequest = useCallback(
        (data, columnDefinition, value) => {
            const dataKey = columnDefinition.dataKey;
            const changeCmd = columnDefinition.changeCmd;

            // save original value, dont erase if exists
            if (!lineEdit.oldValues.hasOwnProperty(dataKey)) {
                lineEdit.oldValues[dataKey] = data[dataKey];
            }
            lineEdit.newValues[dataKey] = {
                changeCmd: changeCmd,
                value: value,
            };
            data[dataKey] = value;
        },
        [lineEdit]
    );

    const editableCellRender = useCallback(
        (rowData, columnDefinition, key, style, rowIndex) => {
            if (
                isLineOnEditMode(rowData) &&
                rowData[columnDefinition.dataKey] !== undefined &&
                rowIndex === 1
            ) {
                // when we edit a numeric field, we display the original un-rounded value
                const currentValue = columnDefinition.numeric
                    ? rowData[columnDefinition.dataKey]
                    : formatCell(rowData, columnDefinition).value;

                const changeRequest = (value) =>
                    registerChangeRequest(rowData, columnDefinition, value);
                const Editor = columnDefinition.editor;
                if (Editor) {
                    return (
                        <Editor
                            key={columnDefinition.dataKey + key}
                            className={clsx(
                                classes.tableCell,
                                classes.inlineEditionCell
                            )}
                            equipment={rowData}
                            defaultValue={currentValue}
                            setColumnError={(k) => setColumnInError(k)}
                            resetColumnError={(k) => resetColumnInError(k)}
                            forceLineUpdate={forceLineUpdate}
                            columnDefinition={columnDefinition}
                            setter={(val) => changeRequest(val)}
                            style={style}
                        />
                    );
                }
            }
            if (columnDefinition.boolean) {
                return booleanCellRender(
                    rowData,
                    columnDefinition,
                    key,
                    style,
                    rowIndex
                );
            }
            return defaultCellRender(
                rowData,
                columnDefinition,
                key,
                style,
                rowIndex
            );
        },
        [
            isLineOnEditMode,
            booleanCellRender,
            defaultCellRender,
            formatCell,
            registerChangeRequest,
            classes.tableCell,
            classes.inlineEditionCell,
            setColumnInError,
            resetColumnInError,
            forceLineUpdate,
        ]
    );

    function generateTableColumns(tabIndex) {
        let generatedTableColumns = TABLES_DEFINITION_INDEXES.get(tabIndex)
            .columns.filter((c) => {
                return selectedColumnsNames.has(c.id);
            })
            .map((c) => {
                let column = {
                    ...c,
                    label: intl.formatMessage({ id: c.id }),
                    locked: lockedColumnsNames.has(c.id),
                    columnWidth: c.columnWidth
                        ? c.columnWidth
                        : MIN_COLUMN_WIDTH,
                };
                if (c.editor !== undefined) {
                    column.cellRenderer = editableCellRender;
                } else if (column.boolean) {
                    column.cellRenderer = booleanCellRender;
                } else {
                    column.cellRenderer = defaultCellRender;
                }
                return column;
            });

        function isEditColumnVisible() {
            return (
                !props.disabled &&
                TABLES_DEFINITION_INDEXES.get(tabIndex)
                    .modifiableEquipmentType &&
                TABLES_DEFINITION_INDEXES.get(tabIndex)
                    .columns.filter((c) => c.editor)
                    .filter((c) => selectedColumnsNames.has(c.id)).length > 0
            );
        }
        if (generatedTableColumns.length > 0) {
            if (isEditColumnVisible()) {
                generatedTableColumns.unshift({
                    locked: true,
                    editColumn: true,
                    columnWidth: EDIT_CELL_WIDTH,
                    cellRenderer: (
                        rowData,
                        columnDefinition,
                        key,
                        style,
                        rowIndex
                    ) =>
                        editCellRender(
                            rowData,
                            columnDefinition,
                            key,
                            style,
                            rowIndex
                        ),
                });
            }

            function sortByIndex(a, b) {
                if (
                    reorderedTableDefinitionIndexes.indexOf(a.id) <
                    reorderedTableDefinitionIndexes.indexOf(b.id)
                )
                    return -1;
                if (
                    reorderedTableDefinitionIndexes.indexOf(a.id) >
                    reorderedTableDefinitionIndexes.indexOf(b.id)
                )
                    return 1;
                return 0;
            }
            generatedTableColumns.sort(sortByIndex);
        }
        generatedTableColumns.headerCellRender = headerCellRender;

        function sortByLock(a, b) {
            if (a.locked && !b.locked) return -1;
            if (!a.locked && b.locked) return 1;
            return 0;
        }
        generatedTableColumns.sort(sortByLock);
        return generatedTableColumns;
    }

    function renderTable(rows) {
        const resource = TABLES_DEFINITION_INDEXES.get(tabIndex).resource;
        const columns = generateTableColumns(tabIndex);
        return (
            <EquipmentTable
                currentNode={props.currentNode}
                rows={rows}
                columns={columns}
                fetched={props.network.isResourceFetched(resource)}
                scrollTop={scrollToIndex}
                visible={props.visible}
                showEditRow={isModifyingRow()}
            />
        );
    }

    function setFilter(event) {
        setFilterValue(event.target.value); // Value from the user's input
    }

    function setFilterValue(userInputValue) {
        if (!userInputValue || userInputValue === '') {
            setRowFilter(undefined);
        } else {
            const sanitizedValue = userInputValue
                .trim()
                .replace(/[#-.]|[[-^]|[?|{}]/g, '\\$&'); // No more Regexp sensible characters
            const everyWords = sanitizedValue.split(' ').filter((n) => n); // We split the user input by words
            const regExp = '(' + everyWords.join('|') + ')'; // For each word, we do a "OR" research
            setRowFilter(new RegExp(regExp, 'i'));
        }
    }

    useEffect(() => {
        let tmpDataKeySet = new Set();
        TABLES_DEFINITION_INDEXES.get(tabIndex)
            .columns.filter((col) => selectedColumnsNames.has(col.id))
            .forEach((col) => tmpDataKeySet.add(col.dataKey));
        setSelectedDataKey(tmpDataKeySet);
    }, [tabIndex, selectedColumnsNames]);

    const handleOpenPopupSelectColumnNames = () => {
        setPopupSelectColumnNames(true);
    };

    const handleCancelPopupSelectColumnNames = useCallback(() => {
        const allDisplayedTemp = allDisplayedColumnsNames[tabIndex];
        setSelectedColumnsNames(
            new Set(allDisplayedTemp ? JSON.parse(allDisplayedTemp) : [])
        );
        const allLockedTemp = allLockedColumnsNames[tabIndex];
        setLockedColumnsNames(
            new Set(allLockedTemp ? JSON.parse(allLockedTemp) : [])
        );
        setPopupSelectColumnNames(false);
    }, [tabIndex, allDisplayedColumnsNames, allLockedColumnsNames]);

    const handleSaveSelectedColumnNames = useCallback(() => {
        updateConfigParameter(
            DISPLAYED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE +
                TABLES_NAMES[tabIndex],
            JSON.stringify([...selectedColumnsNames])
        ).catch((errorMessage) => {
            const allDisplayedTemp = allDisplayedColumnsNames[tabIndex];
            setSelectedColumnsNames(
                new Set(allDisplayedTemp ? JSON.parse(allDisplayedTemp) : [])
            );
            snackError({
                messageTxt: errorMessage,
                headerId: 'paramsChangingError',
            });
        });
        let lockedColumnsToSave = [...lockedColumnsNames].filter((name) =>
            selectedColumnsNames.has(name)
        );
        updateConfigParameter(
            LOCKED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE +
                TABLES_NAMES[tabIndex],
            JSON.stringify(lockedColumnsToSave)
        ).catch((errorMessage) => {
            const allLockedTemp = allLockedColumnsNames[tabIndex];
            setLockedColumnsNames(
                new Set(allLockedTemp ? JSON.parse(allLockedTemp) : [])
            );
            snackError({
                messageTxt: errorMessage,
                headerId: 'paramsChangingError',
            });
        });
        setPopupSelectColumnNames(false);

        updateConfigParameter(
            REORDERED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE +
                TABLES_NAMES[tabIndex],
            JSON.stringify(reorderedTableDefinitionIndexes)
        ).catch((errorMessage) => {
            snackError({
                messageTxt: errorMessage,
                headerId: 'paramsChangingError',
            });
        });
    }, [
        tabIndex,
        selectedColumnsNames,
        lockedColumnsNames,
        reorderedTableDefinitionIndexes,
        allDisplayedColumnsNames,
        allLockedColumnsNames,
        snackError,
    ]);

    const handleToggle = (value) => () => {
        const newChecked = new Set(selectedColumnsNames.values());
        const newLocked = new Set(lockedColumnsNames.values());
        if (selectedColumnsNames.has(value)) {
            newChecked.delete(value);
            if (lockedColumnsNames.has(value)) {
                newLocked.delete(value);
            }
        } else {
            newChecked.add(value);
        }
        setSelectedColumnsNames(newChecked);
        setLockedColumnsNames(newLocked);
    };

    const handleToggleAll = () => {
        let isAllChecked =
            selectedColumnsNames.size === TABLES_COLUMNS_NAMES[tabIndex].size;
        // If all columns are selected/checked, then we hide all of them.
        setSelectedColumnsNames(
            isAllChecked ? new Set() : TABLES_COLUMNS_NAMES[tabIndex]
        );
        if (isAllChecked) {
            setLockedColumnsNames(new Set());
        }
    };

    const handleClickOnLock = (value) => () => {
        const newLocked = new Set(lockedColumnsNames.values());
        if (lockedColumnsNames.has(value)) {
            newLocked.delete(value);
        } else {
            if (lockedColumnsNames.size < MAX_LOCKS_PER_TAB) {
                newLocked.add(value);
            }
        }
        setLockedColumnsNames(newLocked);
    };

    const commit = useCallback(
        ({ source, destination }) => {
            if (destination) {
                let reorderedTableDefinitionIndexesTemp = [
                    ...reorderedTableDefinitionIndexes,
                ];
                const [reorderedItem] =
                    reorderedTableDefinitionIndexesTemp.splice(source.index, 1);
                reorderedTableDefinitionIndexesTemp.splice(
                    destination.index,
                    0,
                    reorderedItem
                );
                setReorderedTableDefinitionIndexes(
                    reorderedTableDefinitionIndexesTemp
                );
            }
        },
        [reorderedTableDefinitionIndexes]
    );

    const checkListColumnsNames = () => {
        let isAllChecked =
            selectedColumnsNames.size === TABLES_COLUMNS_NAMES[tabIndex].size;
        let isSomeChecked = selectedColumnsNames.size !== 0 && !isAllChecked;

        return (
            <>
                <ListItem
                    className={classes.checkboxSelectAll}
                    onClick={handleToggleAll}
                >
                    <Checkbox
                        style={{ marginLeft: '21px' }}
                        checked={isAllChecked}
                        indeterminate={isSomeChecked}
                    />
                    <FormattedMessage id="CheckAll" />
                </ListItem>

                <DragDropContext onDragEnd={commit}>
                    <Droppable droppableId="network-table-columns-list">
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                {[...reorderedTableDefinitionIndexes].map(
                                    (value, index) => (
                                        <Draggable
                                            draggableId={tabIndex + '-' + index}
                                            index={index}
                                            key={tabIndex + '-' + index}
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                >
                                                    <ListItem
                                                        className={
                                                            classes.checkboxItem
                                                        }
                                                        style={{
                                                            padding: '0 16px',
                                                        }}
                                                    >
                                                        <IconButton
                                                            {...provided.dragHandleProps}
                                                            className={
                                                                classes.dragIcon
                                                            }
                                                            size={'small'}
                                                        >
                                                            <DragIndicatorIcon
                                                                edge="start"
                                                                spacing={0}
                                                            />
                                                        </IconButton>

                                                        <ListItemIcon
                                                            onClick={handleClickOnLock(
                                                                value
                                                            )}
                                                            style={{
                                                                minWidth: 0,
                                                                width: '20px',
                                                            }}
                                                        >
                                                            {renderColumnConfigLockIcon(
                                                                value
                                                            )}
                                                        </ListItemIcon>
                                                        <ListItemIcon
                                                            onClick={handleToggle(
                                                                value
                                                            )}
                                                        >
                                                            <Checkbox
                                                                checked={selectedColumnsNames.has(
                                                                    value
                                                                )}
                                                            />
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            onClick={handleToggle(
                                                                value
                                                            )}
                                                            primary={intl.formatMessage(
                                                                {
                                                                    id: `${value}`,
                                                                }
                                                            )}
                                                        />
                                                    </ListItem>
                                                </div>
                                            )}
                                        </Draggable>
                                    )
                                )}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </>
        );
    };

    const getCSVFilename = useCallback(() => {
        const tabName = TABLES_DEFINITION_INDEXES.get(tabIndex).name;
        const localisedTabName = intl.formatMessage({ id: tabName });
        return localisedTabName
            .trim()
            .replace(/[\\/:"*?<>|\s]/g, '-') // Removes the filesystem sensible characters
            .substring(0, 27); // Best practice : limits the filename size to 31 characters (27+'.csv')
    }, [intl, tabIndex]);

    const getCSVColumnNames = () => {
        const columns = generateTableColumns(tabIndex).filter(
            (c) => !c.editColumn
        );
        return columns.map((col) => {
            return {
                displayName: col.label,
                id: col.dataKey,
            };
        });
    };

    const getCSVData = () => {
        const rows = getRows(tabIndex);
        const columns = generateTableColumns(tabIndex).filter(
            (c) => !c.editColumn
        );
        let csvData = [];
        rows.forEach((row) => {
            let rowData = {};
            columns.forEach((col) => {
                rowData[col.dataKey] = formatCell(row, col).value;
            });
            csvData.push(rowData);
        });
        return Promise.resolve(csvData);
    };

    function renderAll() {
        const rows = getRows(tabIndex);
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
                                    className={classes.invalidData}
                                    severity="warning"
                                >
                                    <FormattedMessage id="InvalidData" />
                                </Alert>
                            )}
                            <Grid item className={classes.exportCsv}>
                                <span
                                    className={clsx({
                                        [classes.disabledLabel]:
                                            isModifyingRow() ||
                                            props.disabled ||
                                            rows.length === 0,
                                    })}
                                >
                                    <FormattedMessage id="MuiVirtualizedTable/exportCSV" />
                                </span>
                                <span>
                                    <CsvDownloader
                                        datas={getCSVData}
                                        columns={getCSVColumnNames()}
                                        filename={getCSVFilename()}
                                        disabled={
                                            isModifyingRow() ||
                                            props.disabled ||
                                            rows.length === 0
                                        }
                                    >
                                        <IconButton
                                            disabled={
                                                isModifyingRow() ||
                                                props.disabled ||
                                                rows.length === 0
                                            }
                                            aria-label="exportCSVButton"
                                        >
                                            <GetAppIcon />
                                        </IconButton>
                                    </CsvDownloader>
                                </span>
                            </Grid>
                        </Grid>
                    </Grid>
                    <div className={classes.table} style={{ flexGrow: 1 }}>
                        {/*This render is fast, rerender full dom everytime*/}
                        {renderTable(rows)}
                    </div>

                    <SelectOptionsDialog
                        open={popupSelectColumnNames}
                        onClose={handleCancelPopupSelectColumnNames}
                        onClick={handleSaveSelectedColumnNames}
                        title={intl.formatMessage({
                            id: 'ColumnsList',
                        })}
                        child={checkListColumnsNames()}
                        //Replacing overflow default value 'auto' by 'visible' in order to prevent a react-beatiful-dnd warning related to nested scroll containers
                        style={{
                            '& .MuiPaper-root': {
                                overflowY: 'visible',
                            },
                        }}
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
