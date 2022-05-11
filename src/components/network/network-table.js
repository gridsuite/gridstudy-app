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
import SearchIcon from '@mui/icons-material/Search';
import { IconButton, TextField } from '@mui/material';
import Grid from '@mui/material/Grid';
import { updateConfigParameter } from '../../utils/rest-api';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { SelectOptionsDialog } from '../../utils/dialogs';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import LockIcon from '@mui/icons-material/Lock';
import EditIcon from '@mui/icons-material/Edit';
import GetAppIcon from '@mui/icons-material/GetApp';
import CsvDownloader from 'react-csv-downloader';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ListItemText from '@mui/material/ListItemText';
import {
    DISPLAYED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE,
    LOCKED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE,
    TABLES_COLUMNS_NAMES,
    TABLES_DEFINITION_INDEXES,
    TABLES_DEFINITIONS,
    TABLES_NAMES,
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

const MIN_COLUMN_WIDTH = 160;
const HEADER_CELL_WIDTH = 65;
const MAX_LOCKS_PER_TAB = 5;

const useStyles = makeStyles((theme) => ({
    searchSection: {
        paddingRight: '10px',
        alignItems: 'center',
    },
    table: {
        marginTop: '20px',
    },
    containerInputSearch: {
        marginTop: '15px',
        marginLeft: '10px',
    },
    checkboxSelectAll: {
        padding: '0 32px 15px 15px',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    checkboxItem: {
        cursor: 'pointer',
    },
    selectColumns: {
        marginTop: '12px',
        marginLeft: '50px',
    },
    exportCsv: {
        marginTop: '12px',
        marginLeft: '50px',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'baseline',
        position: 'absolute',
        right: '0px',
    },
    tableCell: {
        fontSize: 'small',
        cursor: 'initial',
        margin: '5px',
        padding: '10px',
        borderTop: '1px solid #515151',
        display: 'flex',
    },
    tableHeader: {
        fontSize: 'small',
        cursor: 'initial',
        textTransform: 'uppercase',
        margin: '5px',
        padding: '10px 24px 10px 10px',
        fontWeight: 'bold',
    },
    editCell: {
        fontSize: 'small',
        cursor: 'initial',
        margin: '5px',
        padding: '10px',
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
        marginRight: '6px',
        color: theme.palette.action.disabled,
    },
    activeSortArrow: {
        '& .arrow': {
            fontSize: '1.1em',
            display: 'block',
            position: 'absolute',
            top: '14px',
            right: '0',
            color: theme.palette.action.active,
        },
    },
    inactiveSortArrow: {
        '& .arrow': {
            fontSize: '1.1em',
            display: 'block',
            position: 'absolute',
            top: '14px',
            right: '0',
            opacity: 0,
        },
        '&:hover .arrow': {
            fontSize: '1.1em',
            display: 'block',
            position: 'absolute',
            top: '14px',
            right: '0',
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

    const [popupSelectColumnNames, setPopupSelectColumnNames] = useState(false);
    const [rowFilter, setRowFilter] = useState(undefined);
    const [columnSort, setColumnSort] = useState(undefined);
    const [tabIndex, setTabIndex] = useState(0);
    const [selectedColumnsNames, setSelectedColumnsNames] = useState(new Set());
    const [lockedColumnsNames, setLockedColumnsNames] = useState(new Set());
    const [scrollToIndex, setScrollToIndex] = useState(-1);
    const [manualTabSwitch, setManualTabSwitch] = useState(true);
    const [selectedDataKey, setSelectedDataKey] = useState(new Set());

    const intl = useIntl();

    const intlRef = useIntlRef();

    useEffect(() => {
        const allDisplayedTemp = allDisplayedColumnsNames[tabIndex];
        setSelectedColumnsNames(
            new Set(allDisplayedTemp ? JSON.parse(allDisplayedTemp) : [])
        );
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
                if (!rowFilter || filter(row)) { // Data filtering here
                    result.push(row);
                }
            }

            function compareValue(a, b, isNumeric, reverse) {
                const mult = reverse ? 1 : -1;
                if (a === undefined && b === undefined) return 0;
                else if (a === undefined) return mult;
                else if (b === undefined) return -mult;

                return isNumeric
                    ? (Number(a) < Number(b) ? 1 : -1) * mult
                    : ('' + a).localeCompare(b) * mult;
            }

            if (columnSort) {
                return result.sort((a,b) => {
                    return compareValue(a[columnSort.key], b[columnSort.key], columnSort.numeric, columnSort.reverse);
                });
            }
            return result;
        },
        [props.network, rowFilter, columnSort]
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
            props.equipmentId !== null &&
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

    const formatCell = useCallback(
        (cellData, columnDefinition) => {
            let value = cellData[columnDefinition.dataKey];
            if (columnDefinition.cellDataGetter) {
                value = columnDefinition.cellDataGetter(cellData, props.network);
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

    const defaultCellRender = useCallback(
        (cellData, columnDefinition, key, style) => {
            const text = formatCell(cellData, columnDefinition);
            return (
                <div key={key}
                     style={style}
                     align={columnDefinition.numeric ? 'right' : 'left'}>
                    <div
                        className={classes.tableCell}>
                        <OverflowableText text={text} />
                    </div>
                </div>
            );
        },
        [classes.tableCell, formatCell]
    );

    const renderTableLockIcon = () => {
        return (<LockIcon className={classes.tableLock}/>);
    };

    const sortIconClassStyle = (columnSort, dataKey) => {
        if(columnSort && columnSort.key === dataKey) {
            return classes.activeSortArrow;
        }
        return classes.inactiveSortArrow;
    };

    const renderSortArrowIcon = (columnSort, dataKey) => {
        if (columnSort && columnSort.key === dataKey && columnSort.reverse) {
            return (<span><ArrowUpwardIcon className={'arrow'} /></span>);
        }
        return (<span><ArrowDownwardIcon className={'arrow'} /></span>);
    };

    const editIcon = () => {
        return (<EditIcon />);
    };

    const renderColumnConfigLockIcon = (value) => {
        if (lockedColumnsNames.has(value)) {
            return <LockIcon className={classes.columnConfigClosedLock}/>;
        } else {
            if(lockedColumnsNames.size < MAX_LOCKS_PER_TAB) {
                return <LockOpenIcon className={classes.columnConfigOpenLock}/>;
            }
        }
    };

    const headerCellRender = useCallback(
        (columnDefinition, key, style) => {
            return (
                <div key={key}
                     style={style}
                     align={columnDefinition.numeric ? 'right' : 'left'}
                     onClick={() => setSort(columnDefinition)}
                     className={sortIconClassStyle(columnSort, columnDefinition.dataKey)}
                >
                    <div className={classes.tableHeader}>
                        {columnDefinition.locked && !columnDefinition.editColumn ? renderTableLockIcon() : ''}
                        {columnDefinition.label}
                    </div>
                    {renderSortArrowIcon(columnSort, columnDefinition.dataKey)}
                </div>
            );
        },
        [classes.tableHeader, columnSort]
    );

    const editCellRender = useCallback(
        (cellData, columnDefinition, key, style) => {
            return (
                <div key={key}
                     style={style}>
                    <div className={classes.editCell}>
                        {editIcon()}
                    </div>
                </div>
            );
        },
        [classes.editCell]
    );

    function generateTableColumns(tabIndex) {
        let generatedTableColumns = TABLES_DEFINITION_INDEXES.get(tabIndex).columns.filter((c) => {
            return selectedColumnsNames.has(c.id);
        }).map((c) => {
            let column = {
                ...c,
                label: intl.formatMessage({ id: c.id }),
                locked: lockedColumnsNames.has(c.id),
                columnWidth: c.columnWidth ? c.columnWidth : MIN_COLUMN_WIDTH,
            };
            if (c.changeCmd !== undefined) {
                // TODO CHARLY attention code pas terminé ici
                column.cellRenderer = (cell, columnDefinition, key, style) =>
                    //EditableCellRender(cell, columnDefinition);
                    defaultCellRender(cell, columnDefinition, key, style);
            } else {
                column.cellRenderer = (cell, columnDefinition, key, style) =>
                    defaultCellRender(cell, columnDefinition, key, style);
            }
            delete column.changeCmd;
            return column;
        });

        function isEditColumnVisible() {
            return (
                TABLES_DEFINITION_INDEXES.get(tabIndex).modifiableEquipmentType && !props.workingNode?.readOnly
            );
        }
        if (generatedTableColumns.length > 0 && isEditColumnVisible()) {
            generatedTableColumns.unshift({
                locked: true,
                editColumn: true,
                columnWidth: HEADER_CELL_WIDTH,
                cellRenderer: (cell, columnDefinition, key, style) =>
                    editCellRender(cell, columnDefinition, key, style),
            });
        }
        generatedTableColumns.headerCellRender = (columnDefinition, key, style) => {
            return headerCellRender(columnDefinition, key, style);
        }

        function sortByLock(a, b) {
            if(a.locked && !b.locked) return -1;
            if(!a.locked && b.locked) return 1;
            return 0;
        }
        generatedTableColumns.sort(sortByLock);
        return generatedTableColumns;
    }

    function renderTable() {
        const resource = TABLES_DEFINITION_INDEXES.get(tabIndex).resource;
        const rows = getRows(tabIndex);
        const columns = generateTableColumns(tabIndex)
        return (
            <EquipmentTable // TODO CHARLY supprimer les props inutiles
                tabIndex={tabIndex}
                studyUuid={props.studyUuid}
                workingNode={props.workingNode}
                rows={rows}
                columns={columns}
                tableDefinition={TABLES_DEFINITION_INDEXES.get(tabIndex)}
                fetched={props.network.isResourceFetched(resource)}
                scrollToIndex={scrollToIndex}
                scrollToAlignment="start"
                network={props.network}
                //selectedDataKey={Array.from(selectedDataKey)}
            />
        );
    }

    function setFilter(event) {
        const value = event.target.value; // Value from the user's input
        const sanitizedValue = value.trim().replace(/[#-.]|[[-^]|[?|{}]/g, '\\$&'); // No more Regexp sensible characters
        const everyWords = sanitizedValue.split(' ').filter(n => n); // We split the user input by words
        const regExp = '('+everyWords.join('|')+')'; // For each word, we do a "OR" research
        setRowFilter(
            !value || value === '' ? undefined : new RegExp(regExp, 'i')
        );
    }

    function setSort(columnDefinition) {
        let newReverse = false;
        if(columnSort && columnSort.key === columnDefinition.dataKey && !columnSort.reverse) {
            newReverse = true;
        }
        let newSort = {
            key: columnDefinition.dataKey,
            reverse: newReverse,
            numeric: columnDefinition.numeric,
        };
        setColumnSort(newSort);
    }

    useEffect(() => {
        let tmpDataKeySet = new Set();
        TABLES_DEFINITION_INDEXES.get(tabIndex)
            .columns.filter((col) => selectedColumnsNames.has(col.id))
            .forEach((col) => tmpDataKeySet.add(col.dataKey));
        setSelectedDataKey(tmpDataKeySet);
    }, [tabIndex, selectedColumnsNames]);

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
            DISPLAYED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE + TABLES_NAMES[tabIndex],
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
        updateConfigParameter(
            LOCKED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE + TABLES_NAMES[tabIndex],
            JSON.stringify([...lockedColumnsNames])
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
        if (selectedColumnsNames.has(value)) {
            newChecked.delete(value);
        } else {
            newChecked.add(value);
        }
        setSelectedColumnsNames(newChecked);
    };

    const handleToggleAll = () => {
        let isAllChecked =
            selectedColumnsNames.size === TABLES_COLUMNS_NAMES[tabIndex].size;
        setSelectedColumnsNames(
            isAllChecked ? new Set() : TABLES_COLUMNS_NAMES[tabIndex]
        );
    };

    const handleClickOnLock = (value) => () => {
        // If we need to check for double-click, we need to use :
        // const handleClickOnLock = (value) => (event) => {
        // and then :
        // if(event.detail > 1) {/*DOUBLE CLICK HERE*/}
        const newLocked = new Set(lockedColumnsNames.values());
        if (lockedColumnsNames.has(value)) {
            newLocked.delete(value);
        } else {
            if(lockedColumnsNames.size < MAX_LOCKS_PER_TAB) {
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
                        <ListItemIcon onClick={handleClickOnLock(value)} style={{minWidth:0, width:'20px'}}>
                            {renderColumnConfigLockIcon(value)}
                        </ListItemIcon>
                        <ListItemIcon onClick={handleToggle(value)}>
                            <Checkbox
                                checked={selectedColumnsNames.has(value)}
                            />
                        </ListItemIcon>
                        <ListItemText onClick={handleToggle(value)}
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
    }, [tabIndex]);

    const getCSVColumnNames = () => {
        let tempHeaders = [];
        const columns = generateTableColumns(tabIndex);
        columns.forEach((col) => {
            tempHeaders.push({
                displayName: col.label,
                id: col.dataKey,
            });
        });
        return tempHeaders;
    };

    const getCSVData = () => {
        const rows = getRows(tabIndex);
        const columns = generateTableColumns(tabIndex)
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
                                />
                            ))}
                        </Tabs>
                    </Grid>
                    <Grid container>
                        <Grid item className={classes.containerInputSearch}>
                            <TextField
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
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item className={classes.selectColumns}>
                            <span>
                                <FormattedMessage id="LabelSelectList" />
                            </span>
                            <IconButton className={selectedColumnsNames.size===0?classes.blink:''}
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
                        <Grid item className={classes.exportCsv}>
                            <span>
                                <FormattedMessage id="MuiVirtualizedTable/exportCSV" />
                            </span>
                            <span>
                                <CsvDownloader
                                    datas={getCSVData}
                                    columns={getCSVColumnNames()}
                                    filename={getCSVFilename()}>
                                    <IconButton aria-label="exportCSVButton">
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
    equipmentId: null,
    equipmentType: null,
    equipmentChanged: false,
};

NetworkTable.propTypes = {
    network: PropTypes.instanceOf(Network),
    studyUuid: PropTypes.string,
    workingNode: PropTypes.object,
    equipmentId: PropTypes.string,
    equipmentType: PropTypes.string,
    equipmentChanged: PropTypes.bool,
};

export default NetworkTable;
