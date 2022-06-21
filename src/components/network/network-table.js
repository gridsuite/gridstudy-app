/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Network from './network';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { FormattedMessage, useIntl } from 'react-intl';
import InputAdornment from '@mui/material/InputAdornment';
import { IconButton, TextField } from '@mui/material';
import Grid from '@mui/material/Grid';
import {
    requestNetworkChange,
    updateConfigParameter,
} from '../../utils/rest-api';
import { SelectOptionsDialog } from '../../utils/dialogs';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import CsvDownloader from 'react-csv-downloader';
import ListItemText from '@mui/material/ListItemText';
import {
    DISPLAYED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE,
    LOCKED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE,
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
import { useSnackbar } from 'notistack';
import {
    displayErrorMessageWithSnackbar,
    useIntlRef,
} from '../../utils/messages';
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
import clsx from 'clsx';
import { RunningStatus } from '../util/running-status';
import { INVALID_LOADFLOW_OPACITY } from '../../utils/colors';
import { isNodeValid } from '../graph/util/model-functions';
import AlertInvalidNode from '../util/alert-invalid-node';

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
    checkbox: {
        margin: '-10%',
        cursor: 'initial',
    },
    disabledLabel: {
        color: theme.palette.text.disabled,
    },
}));

const NetworkTable = (props) => {
    const classes = useStyles();

    const { enqueueSnackbar } = useSnackbar();

    const allDisplayedColumnsNames = useSelector(
        (state) => state.allDisplayedColumnsNames
    );
    const allLockedColumnsNames = useSelector(
        (state) => state.allLockedColumnsNames
    );
    const fluxConvention = useSelector((state) => state[PARAM_FLUX_CONVENTION]);

    const [lineEdit, setLineEdit] = useState(undefined);
    const [popupSelectColumnNames, setPopupSelectColumnNames] = useState(false);
    const [rowFilter, setRowFilter] = useState(undefined);
    const [columnSort, setColumnSort] = useState(undefined);
    const [tabIndex, setTabIndex] = useState(0);
    const [selectedColumnsNames, setSelectedColumnsNames] = useState(new Set());
    const [lockedColumnsNames, setLockedColumnsNames] = useState(new Set());
    const [scrollToIndex, setScrollToIndex] = useState(-1);
    const [manualTabSwitch, setManualTabSwitch] = useState(true);
    const [selectedDataKey, setSelectedDataKey] = useState(new Set());

    const isLineOnEditMode = useCallback(
        (rowData) => {
            return lineEdit && rowData.id === lineEdit.id;
        },
        [lineEdit]
    );

    const intl = useIntl();

    const intlRef = useIntlRef();

    useEffect(() => {
        const allDisplayedTemp = allDisplayedColumnsNames[tabIndex];
        setSelectedColumnsNames(
            new Set(allDisplayedTemp ? JSON.parse(allDisplayedTemp) : [])
        );
        setLineEdit({});
    }, [tabIndex, allDisplayedColumnsNames]);

    useEffect(() => {
        const allLockedTemp = allLockedColumnsNames[tabIndex];
        setLockedColumnsNames(
            new Set(allLockedTemp ? JSON.parse(allLockedTemp) : [])
        );
    }, [tabIndex, allLockedColumnsNames]);

    useEffect(() => {
        const resource = TABLES_DEFINITION_INDEXES.get(tabIndex).resource;
        if (!props.network) return;
        props.network.useEquipment(resource);
    }, [props.network, tabIndex]);

    const filter = useCallback(
        (cell) => {
            if (!rowFilter) return true;
            return (
                [...selectedDataKey].find((key) =>
                    rowFilter.test(cell[key])
                ) !== undefined
            );
        },
        [rowFilter, selectedDataKey]
    );

    const formatCell = useCallback(
        (rowData, columnDefinition) => {
            let value = rowData[columnDefinition.dataKey];
            if (columnDefinition.cellDataGetter) {
                value = columnDefinition.cellDataGetter(rowData, props.network);
            }
            if (columnDefinition.normed) {
                value = columnDefinition.normed(fluxConvention, value);
            }
            return value &&
                columnDefinition.numeric &&
                columnDefinition.fractionDigits
                ? parseFloat(value).toFixed(columnDefinition.fractionDigits)
                : value;
        },
        [fluxConvention, props.network]
    );

    const getRows = useCallback(
        (index) => {
            const tableDefinition = TABLES_DEFINITION_INDEXES.get(index);
            const datasourceRows = tableDefinition.getter
                ? tableDefinition.getter(props.network)
                : props.network[TABLES_DEFINITION_INDEXES.get(index).resource];

            if (!datasourceRows) return [];

            let result = [];
            for (let i = 0; i < datasourceRows.length; i++) {
                const row = datasourceRows[i];
                if (!rowFilter || filter(row)) {
                    result.push(row);
                }
            }

            function compareValue(a, b, isNumeric, reverse) {
                const mult = reverse ? 1 : -1;
                if (a === b) return 0;
                else if (a === undefined) return mult;
                else if (b === undefined) return -mult;

                return isNumeric
                    ? (Number(a) < Number(b) ? 1 : -1) * mult
                    : ('' + a).localeCompare(b) * mult;
            }

            if (columnSort) {
                return result.sort((a, b) => {
                    return compareValue(
                        formatCell(a, columnSort.colDef),
                        formatCell(b, columnSort.colDef),
                        columnSort.numeric,
                        columnSort.reverse
                    );
                });
            }
            return result;
        },
        [props.network, rowFilter, columnSort, filter, formatCell]
    );

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
            !manualTabSwitch
        ) {
            const newIndex = getTabIndexFromEquipementType(props.equipmentType);
            setTabIndex(newIndex); // select the right table type
            // calculate row index to scroll to
            const rows = getRows(newIndex);
            let index = rows.findIndex((r) => r.id === props.equipmentId);
            setScrollToIndex(index !== undefined ? index : 0);
        }
    }, [
        props.network,
        props.equipmentId,
        props.equipmentType,
        props.equipmentChanged,
        getRows,
        manualTabSwitch,
    ]);

    const renderTableLockIcon = useCallback(() => {
        return <LockIcon className={classes.tableLock} />;
    }, [classes.tableLock]);

    const isModifyingRow = useCallback(() => {
        return lineEdit?.id !== undefined;
    }, [lineEdit]);

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
                return <ArrowUpwardIcon className={'arrow'} />;
            }
            return <ArrowDownwardIcon className={'arrow'} />;
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
                return <div key={key} style={style}></div>;
            }
            return (
                <div
                    key={key}
                    style={style}
                    align={columnDefinition.numeric ? 'right' : 'left'}
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

    const editCellRender = useCallback(
        (rowData, columnDefinition, key, style) => {
            function resetChanges(rowData) {
                Object.entries(lineEdit.oldValues).forEach(
                    ([key, oldValue]) => {
                        rowData[key] = oldValue;
                    }
                );
                setLineEdit({});
            }
            function commitChanges(rowData) {
                function capitaliseFirst(str) {
                    return str.charAt(0).toUpperCase() + str.slice(1);
                }
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
                requestNetworkChange(
                    props.studyUuid,
                    props.workingNode?.id,
                    groovyCr
                ).then((response) => {
                    if (response.ok) {
                        Object.entries(lineEdit.newValues).forEach(
                            ([key, cr]) => {
                                rowData[key] = cr.value;
                            }
                        );
                        // TODO When the data is saved, we should force an update of the table's data. As is, it takes too long to update.
                        // And maybe add a visual clue that the save was successful ?
                    } else {
                        Object.entries(lineEdit.oldValues).forEach(
                            ([key, oldValue]) => {
                                rowData[key] = oldValue;
                            }
                        );

                        let message = intl.formatMessage({
                            id: 'paramsChangingDenied',
                        });
                        displayErrorMessageWithSnackbar({
                            errorMessage: message,
                            enqueueSnackbar: enqueueSnackbar,
                            headerMessage: {
                                headerMessageId: 'paramsChangingError',
                                intlRef: intlRef,
                            },
                        });
                    }
                    setLineEdit({});
                });
            }

            if (isLineOnEditMode(rowData)) {
                return (
                    <div key={key} style={style}>
                        <div className={classes.editCell}>
                            <IconButton
                                size={'small'}
                                onClick={() => commitChanges(rowData)}
                            >
                                <CheckIcon />
                            </IconButton>
                            <IconButton
                                size={'small'}
                                onClick={() => resetChanges(rowData)}
                            >
                                <ClearIcon />
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
                                disabled={isModifyingRow()}
                                onClick={() => {
                                    setLineEdit({
                                        oldValues: {},
                                        newValues: {},
                                        id: rowData.id,
                                        equipmentType:
                                            TABLES_DEFINITION_INDEXES.get(
                                                tabIndex
                                            ).modifiableEquipmentType,
                                    });
                                }}
                            >
                                <EditIcon />
                            </IconButton>
                        </div>
                    </div>
                );
            }
        },
        [
            isLineOnEditMode,
            lineEdit,
            tabIndex,
            props.studyUuid,
            props.workingNode?.id,
            intl,
            enqueueSnackbar,
            intlRef,
            classes.editCell,
            isModifyingRow,
        ]
    );

    const defaultCellRender = useCallback(
        (rowData, columnDefinition, key, style) => {
            const text = formatCell(rowData, columnDefinition);
            return (
                <div
                    key={key}
                    style={style}
                    align={columnDefinition.numeric ? 'right' : 'left'}
                >
                    <div className={classes.tableCell}>
                        <OverflowableText
                            className={clsx({
                                [classes.valueInvalid]:
                                    columnDefinition.canBeInvalidated &&
                                    props.loadFlowStatus !==
                                        RunningStatus.SUCCEED,
                            })}
                            text={text}
                        />
                    </div>
                </div>
            );
        },
        [
            classes.tableCell,
            classes.valueInvalid,
            props.loadFlowStatus,
            formatCell,
        ]
    );

    /**
     * Used for boolean cell data value to render a checkbox
     * @param {any} rowData data of row
     * @param {any} columnDefinition definition of column
     * @param {any} key key of element
     * @param {any} style style for table cell element
     * @returns {JSX.Element} Component template
     */
    const booleanCellRender = useCallback(
        (rowData, columnDefinition, key, style) => {
            const isChecked = formatCell(rowData, columnDefinition);
            return (
                <div key={key} style={style}>
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
            props.loadFlowStatus,
        ]
    );

    const registerChangeRequest = useCallback(
        (data, dataKey, changeCmd, value) => {
            // save original value, dont erase if exists
            if (!lineEdit.oldValues[dataKey]) {
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
        (rowData, columnDefinition, key, style) => {
            if (
                isLineOnEditMode(rowData) &&
                rowData[columnDefinition.dataKey] !== undefined
            ) {
                const text = formatCell(rowData, columnDefinition);
                const changeRequest = (value) =>
                    registerChangeRequest(
                        rowData,
                        columnDefinition.dataKey,
                        columnDefinition.changeCmd,
                        value
                    );
                const Editor = columnDefinition.editor;
                if (Editor) {
                    return (
                        <Editor
                            key={rowData.dataKey + rowData.id}
                            className={clsx(
                                classes.tableCell,
                                classes.inlineEditionCell
                            )}
                            equipment={rowData}
                            defaultValue={text}
                            setter={(val) => changeRequest(val)}
                            style={style}
                        />
                    );
                }
            }
            return defaultCellRender(rowData, columnDefinition, key, style);
        },
        [
            isLineOnEditMode,
            defaultCellRender,
            formatCell,
            registerChangeRequest,
            classes.tableCell,
            classes.inlineEditionCell,
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
                if (c.changeCmd !== undefined) {
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
                TABLES_DEFINITION_INDEXES.get(tabIndex)
                    .modifiableEquipmentType &&
                isNodeValid(props.workingNode, props.selectedNode) &&
                TABLES_DEFINITION_INDEXES.get(tabIndex)
                    .columns.filter((c) => c.editor)
                    .filter((c) => selectedColumnsNames.has(c.id)).length > 0
            );
        }
        if (generatedTableColumns.length > 0 && isEditColumnVisible()) {
            generatedTableColumns.unshift({
                locked: true,
                editColumn: true,
                columnWidth: EDIT_CELL_WIDTH,
                cellRenderer: (rowData, columnDefinition, key, style) =>
                    editCellRender(rowData, columnDefinition, key, style),
            });
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

    function renderTable() {
        const resource = TABLES_DEFINITION_INDEXES.get(tabIndex).resource;
        const rows = getRows(tabIndex);
        const columns = generateTableColumns(tabIndex);
        return (
            <EquipmentTable
                workingNode={props.workingNode}
                selectedNode={props.selectedNode}
                rows={rows}
                columns={columns}
                fetched={props.network.isResourceFetched(resource)}
                scrollToIndex={scrollToIndex} // TODO This is not implemented yet
            />
        );
    }

    function setFilter(event) {
        const value = event.target.value; // Value from the user's input
        const sanitizedValue = value
            .trim()
            .replace(/[#-.]|[[-^]|[?|{}]/g, '\\$&'); // No more Regexp sensible characters
        const everyWords = sanitizedValue.split(' ').filter((n) => n); // We split the user input by words
        const regExp = '(' + everyWords.join('|') + ')'; // For each word, we do a "OR" research
        setRowFilter(
            !value || value === '' ? undefined : new RegExp(regExp, 'i')
        );
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
            displayErrorMessageWithSnackbar({
                errorMessage: errorMessage,
                enqueueSnackbar: enqueueSnackbar,
                headerMessage: {
                    headerMessageId: 'paramsChangingError',
                    intlRef: intlRef,
                },
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
            displayErrorMessageWithSnackbar({
                errorMessage: errorMessage,
                enqueueSnackbar: enqueueSnackbar,
                headerMessage: {
                    headerMessageId: 'paramsChangingError',
                    intlRef: intlRef,
                },
            });
        });

        setPopupSelectColumnNames(false);
    }, [
        tabIndex,
        selectedColumnsNames,
        lockedColumnsNames,
        allDisplayedColumnsNames,
        allLockedColumnsNames,
        enqueueSnackbar,
        intlRef,
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

    const checkListColumnsNames = () => {
        let isAllChecked =
            selectedColumnsNames.size === TABLES_COLUMNS_NAMES[tabIndex].size;
        let isSomeChecked = selectedColumnsNames.size !== 0 && !isAllChecked;

        return (
            <List>
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
                {[...TABLES_COLUMNS_NAMES[tabIndex]].map((value, index) => (
                    <ListItem
                        key={tabIndex + '-' + index}
                        className={classes.checkboxItem}
                        style={{ padding: '0 16px' }}
                    >
                        <ListItemIcon
                            onClick={handleClickOnLock(value)}
                            style={{ minWidth: 0, width: '20px' }}
                        >
                            {renderColumnConfigLockIcon(value)}
                        </ListItemIcon>
                        <ListItemIcon onClick={handleToggle(value)}>
                            <Checkbox
                                checked={selectedColumnsNames.has(value)}
                            />
                        </ListItemIcon>
                        <ListItemText
                            onClick={handleToggle(value)}
                            primary={intl.formatMessage({ id: `${value}` })}
                        />
                    </ListItem>
                ))}
            </List>
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
                rowData[col.dataKey] = formatCell(row, col);
            });
            csvData.push(rowData);
        });
        return Promise.resolve(csvData);
    };

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
                                setColumnSort(undefined);
                            }}
                            aria-label="tables"
                        >
                            {Object.values(TABLES_DEFINITIONS).map((table) => (
                                <Tab
                                    key={table.name}
                                    label={intl.formatMessage({
                                        id: table.name,
                                    })}
                                    disabled={isModifyingRow()}
                                />
                            ))}
                        </Tabs>
                    </Grid>
                    <Grid container>
                        <Grid item className={classes.containerInputSearch}>
                            <TextField
                                disabled={isModifyingRow()}
                                className={classes.textField}
                                size="small"
                                placeholder={
                                    intl.formatMessage({ id: 'filter' }) + '...'
                                }
                                onChange={setFilter}
                                fullWidth
                                InputProps={{
                                    classes: {
                                        input: classes.searchSection,
                                    },
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon
                                                color={
                                                    isModifyingRow()
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
                                    [classes.disabledLabel]: isModifyingRow(),
                                })}
                            >
                                <FormattedMessage id="LabelSelectList" />
                            </span>
                            <IconButton
                                disabled={isModifyingRow()}
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
                            <SelectOptionsDialog
                                open={popupSelectColumnNames}
                                onClose={handleCancelPopupSelectColumnNames}
                                onClick={handleSaveSelectedColumnNames}
                                title={intl.formatMessage({
                                    id: 'ColumnsList',
                                })}
                                child={checkListColumnsNames()}
                            />
                        </Grid>
                        {!isNodeValid(props.workingNode, props.selectedNode) &&
                            props.selectedNode?.type !== 'ROOT' && (
                                <AlertInvalidNode />
                            )}
                        <Grid item className={classes.exportCsv}>
                            <span
                                className={clsx({
                                    [classes.disabledLabel]: isModifyingRow(),
                                })}
                            >
                                <FormattedMessage id="MuiVirtualizedTable/exportCSV" />
                            </span>
                            <span>
                                <CsvDownloader
                                    datas={getCSVData}
                                    columns={getCSVColumnNames()}
                                    filename={getCSVFilename()}
                                    disabled={isModifyingRow()}
                                >
                                    <IconButton
                                        disabled={isModifyingRow()}
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
                    {renderTable()}
                </div>
            </>
        )
    );
};

NetworkTable.defaultProps = {
    network: null,
    studyUuid: '',
    workingNode: null,
    selectedNode: null,
    equipmentId: null,
    equipmentType: null,
    equipmentChanged: false,
    loadFlowStatus: RunningStatus.IDLE,
};

NetworkTable.propTypes = {
    network: PropTypes.instanceOf(Network),
    studyUuid: PropTypes.string,
    workingNode: PropTypes.object,
    selectedNode: PropTypes.object,
    equipmentId: PropTypes.string,
    equipmentType: PropTypes.string,
    equipmentChanged: PropTypes.bool,
    loadFlowStatus: PropTypes.any,
};

export default NetworkTable;
