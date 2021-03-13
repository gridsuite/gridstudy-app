/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import Network from './network';
import VirtualizedTable from '../util/virtualized-table';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { FormattedMessage, useIntl } from 'react-intl';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import TableCell from '@material-ui/core/TableCell';
import { IconButton, TextField } from '@material-ui/core';
import CreateIcon from '@material-ui/icons/Create';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { requestNetworkChange } from '../../utils/rest-api';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';

import ViewColumnIcon from '@material-ui/icons/ViewColumn';
import { SelectOptionsDialog } from '../../utils/dialogs';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';

import { TABLES_COLUMNS_NAMES, TABLES_DEFINITIONS } from './constants';

const useStyles = makeStyles((theme) => ({
    cell: {
        display: 'flex',
        alignItems: 'right',
        textAlign: 'right',
        boxSizing: 'border-box',
        flex: 1,
        width: '100%',
        height: '100%',
        cursor: 'initial',
    },
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
}));

const NetworkTable = (props) => {
    const classes = useStyles();

    const [tabIndex, setTabIndex] = useState(0);
    const [lineEdit, setLineEdit] = useState({});
    const [rowFilter, setRowFilter] = useState(undefined);
    const [popupSelectColumnNames, setPopupSelectColumnNames] = useState(false);

    const intl = useIntl();

    const [listColumnsNames, setListColumnsNames] = useState(
        TABLES_COLUMNS_NAMES()
    );
    const [checked, setChecked] = useState(TABLES_COLUMNS_NAMES());
    const [listSelectedColumnsNames, setListSelectedColumnsNames] = useState(
        TABLES_COLUMNS_NAMES()
    );

    const rowHeight = 48;

    const isLineOnEditMode = useCallback(
        (row) => {
            return (
                (lineEdit[tabIndex] && lineEdit[tabIndex].line === row) || false
            );
        },
        [lineEdit, tabIndex]
    );

    function setLineEditAt(index, value) {
        setLineEdit({
            ...lineEdit,
            ...{ [index]: value },
        });
    }

    function commitChanges(rowData) {
        const tab = tabIndex;
        let groovyCr =
            'equipment = network.get' +
            lineEdit[tab].equipmentType +
            "('" +
            lineEdit[tabIndex].id.replace(/'/g, "\\'") +
            "')\n";
        Object.values(lineEdit[tabIndex].newValues).forEach((cr) => {
            groovyCr += cr.changeCmd.replace(/\{\}/g, cr.value) + '\n';
        });
        requestNetworkChange(props.userId, props.studyName, groovyCr).then(
            (response) => {
                if (response.ok) {
                    Object.entries(lineEdit[tab].newValues).forEach(
                        ([key, cr]) => {
                            rowData[key] = cr.value;
                        }
                    );
                } else {
                    Object.entries(lineEdit[tab].oldValues).forEach(
                        ([key, oldValue]) => {
                            rowData[key] = oldValue;
                        }
                    );
                }
                setLineEditAt(tab, {});
            }
        );
    }

    function resetChanges(rowData) {
        Object.entries(lineEdit[tabIndex].oldValues).forEach(
            ([key, oldValue]) => {
                rowData[key] = oldValue;
            }
        );
        setLineEditAt(tabIndex, {});
    }

    function createEditableRow(cellData, equipmentType) {
        return (
            (!isLineOnEditMode(cellData.rowIndex) && (
                <IconButton
                    disabled={
                        lineEdit[tabIndex] && lineEdit[tabIndex].id && true
                    }
                    onClick={() =>
                        setLineEditAt(tabIndex, {
                            line: cellData.rowIndex,
                            oldValues: {},
                            newValues: {},
                            id: cellData.rowData['id'],
                            equipmentType: equipmentType,
                        })
                    }
                >
                    <CreateIcon alignmentBaseline={'middle'} />
                </IconButton>
            )) || (
                <Grid container>
                    <Grid item>
                        <IconButton
                            size={'small'}
                            onClick={() => commitChanges(cellData.rowData)}
                        >
                            <CheckIcon />
                        </IconButton>
                        <IconButton
                            size={'small'}
                            onClick={() => resetChanges(cellData.rowData)}
                        >
                            <ClearIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            )
        );
    }

    function formatCellData(cellData, isNumeric, fractionDigit) {
        return cellData.rowData[cellData.dataKey] && isNumeric && fractionDigit
            ? parseFloat(cellData.rowData[cellData.dataKey]).toFixed(
                  fractionDigit
              )
            : cellData.rowData[cellData.dataKey];
    }

    const defaultCellRender = useCallback(
        (cellData, numeric, fractionDigit) => {
            return (
                <TableCell
                    component="div"
                    variant="body"
                    style={{ height: rowHeight, width: cellData.width }}
                    className={classes.cell}
                    align="right"
                >
                    <Grid container direction="column">
                        <Grid item xs={1} />
                        <Grid item xs={1}>
                            {formatCellData(cellData, numeric, fractionDigit)}
                        </Grid>
                    </Grid>
                </TableCell>
            );
        },
        [classes.cell]
    );

    const registerChangeRequest = useCallback(
        (data, changeCmd, value) => {
            // save original value, dont erase if exists
            if (!lineEdit[tabIndex].oldValues[data.dataKey])
                lineEdit[tabIndex].oldValues[data.dataKey] =
                    data.rowData[data.dataKey];
            lineEdit[tabIndex].newValues[data.dataKey] = {
                changeCmd: changeCmd,
                value: value,
            };
            data.rowData[data.dataKey] = value;
        },
        [lineEdit, tabIndex]
    );

    const EditableCellRender = useCallback(
        (cellData, numeric, changeCmd, fractionDigit) => {
            return !isLineOnEditMode(cellData.rowIndex) ||
                cellData.rowData[cellData.dataKey] === undefined ? (
                defaultCellRender(cellData, numeric, fractionDigit)
            ) : (
                <TextField
                    id={cellData.dataKey}
                    type="Number"
                    className={classes.cell}
                    size={'medium'}
                    margin={'normal'}
                    inputProps={{ style: { textAlign: 'center' } }}
                    onChange={(obj) =>
                        registerChangeRequest(
                            cellData,
                            changeCmd,
                            obj.target.value
                        )
                    }
                    defaultValue={formatCellData(
                        cellData,
                        numeric,
                        fractionDigit
                    )}
                />
            );
        },
        [
            classes.cell,
            defaultCellRender,
            isLineOnEditMode,
            registerChangeRequest,
        ]
    );

    const showSelectedColumn = (key) => {
        return listSelectedColumnsNames[tabIndex].includes(key) ? '' : 'none';
    };

    const generateTableColumns = (table) => {
        return table.columns.map((c) => {
            let column = {
                label: intl.formatMessage({ id: c.id }),
                headerStyle: { display: showSelectedColumn(c.id) },
                style: { display: showSelectedColumn(c.id) },
                ...c,
            };
            c.changeCmd !== undefined &&
                (column.cellRenderer = (cell) =>
                    EditableCellRender(
                        cell,
                        c.numeric,
                        c.changeCmd,
                        c.fractionDigits
                    ));
            delete column.changeCmd;
            return column;
        });
    };

    const renderSubstationsTable = () => {
        return (
            <VirtualizedTable
                rowCount={props.network.substations.length}
                rowGetter={({ index }) => props.network.substations[index]}
                filter={filter}
                columns={generateTableColumns(TABLES_DEFINITIONS.SUBSTATIONS)}
            />
        );
    };

    function renderVoltageLevelsTable() {
        const voltageLevels = props.network.getVoltageLevels();
        return (
            <VirtualizedTable
                rowCount={voltageLevels.length}
                rowGetter={({ index }) => voltageLevels[index]}
                filter={filter}
                columns={generateTableColumns(
                    TABLES_DEFINITIONS.VOLTAGE_LEVELS
                )}
            />
        );
    }

    function renderLinesTable() {
        return (
            <VirtualizedTable
                rowCount={props.network.lines.length}
                rowGetter={({ index }) => props.network.lines[index]}
                filter={filter}
                columns={generateTableColumns(TABLES_DEFINITIONS.LINES)}
            />
        );
    }

    function makeHeaderCell(equipmentType) {
        return {
            width: 80,
            label: '',
            dataKey: '',
            style: {
                display:
                    listSelectedColumnsNames[tabIndex].length > 0 ? '' : 'none',
            },
            cellRenderer: (cellData) =>
                createEditableRow(cellData, equipmentType),
        };
    }

    function renderTwoWindingsTransformersTable() {
        return (
            <VirtualizedTable
                rowCount={props.network.twoWindingsTransformers.length}
                rowGetter={({ index }) =>
                    props.network.twoWindingsTransformers[index]
                }
                filter={filter}
                columns={[
                    makeHeaderCell('TwoWindingsTransformer'),
                    ...generateTableColumns(
                        TABLES_DEFINITIONS.TWO_WINDINGS_TRANSFORMERS
                    ),
                ]}
            />
        );
    }

    function renderThreeWindingsTransformersTable() {
        return (
            <VirtualizedTable
                rowCount={props.network.threeWindingsTransformers.length}
                rowGetter={({ index }) =>
                    props.network.threeWindingsTransformers[index]
                }
                filter={filter}
                columns={[
                    makeHeaderCell('ThreeWindingsTransformer'),
                    ...generateTableColumns(
                        TABLES_DEFINITIONS.THREE_WINDINGS_TRANSFORMERS
                    ),
                ]}
            />
        );
    }

    function renderGeneratorsTable() {
        return (
            <VirtualizedTable
                rowCount={props.network.generators.length}
                rowGetter={({ index }) => props.network.generators[index]}
                filter={filter}
                columns={[
                    makeHeaderCell('Generator'),
                    ...generateTableColumns(TABLES_DEFINITIONS.GENERATORS),
                ]}
            />
        );
    }

    function renderLoadsTable() {
        return (
            <VirtualizedTable
                rowCount={props.network.loads.length}
                rowGetter={({ index }) => props.network.loads[index]}
                filter={filter}
                columns={generateTableColumns(TABLES_DEFINITIONS.LOADS)}
            />
        );
    }

    function renderBatteriesTable() {
        return (
            <VirtualizedTable
                rowCount={props.network.batteries.length}
                rowGetter={({ index }) => props.network.batteries[index]}
                filter={filter}
                columns={generateTableColumns(TABLES_DEFINITIONS.BATTERIES)}
            />
        );
    }

    function renderDanglingLinesTable() {
        return (
            <VirtualizedTable
                rowCount={props.network.danglingLines.length}
                rowGetter={({ index }) => props.network.danglingLines[index]}
                filter={filter}
                columns={generateTableColumns(
                    TABLES_DEFINITIONS.DANGLING_LINES
                )}
            />
        );
    }

    function renderHvdcLinesTable() {
        return (
            <VirtualizedTable
                rowCount={props.network.hvdcLines.length}
                rowGetter={({ index }) => props.network.hvdcLines[index]}
                filter={filter}
                columns={generateTableColumns(TABLES_DEFINITIONS.HVDC_LINES)}
            />
        );
    }

    function renderShuntCompensatorsTable() {
        return (
            <VirtualizedTable
                rowCount={props.network.shuntCompensators.length}
                rowGetter={({ index }) =>
                    props.network.shuntCompensators[index]
                }
                filter={filter}
                columns={generateTableColumns(
                    TABLES_DEFINITIONS.SHUNT_COMPENSATORS
                )}
            />
        );
    }

    function renderStaticVarCompensatorsTable() {
        return (
            <VirtualizedTable
                rowCount={props.network.staticVarCompensators.length}
                rowGetter={({ index }) =>
                    props.network.staticVarCompensators[index]
                }
                filter={filter}
                columns={generateTableColumns(
                    TABLES_DEFINITIONS.STATIC_VAR_COMPENSATORS
                )}
            />
        );
    }

    function renderLccConverterStationsTable() {
        return (
            <VirtualizedTable
                rowCount={props.network.lccConverterStations.length}
                rowGetter={({ index }) =>
                    props.network.lccConverterStations[index]
                }
                filter={filter}
                columns={generateTableColumns(
                    TABLES_DEFINITIONS.LCC_CONVERTER_STATIONS
                )}
            />
        );
    }

    function renderVscConverterStationsTable() {
        return (
            <VirtualizedTable
                rowCount={props.network.vscConverterStations.length}
                rowGetter={({ index }) =>
                    props.network.vscConverterStations[index]
                }
                filter={filter}
                columns={generateTableColumns(
                    TABLES_DEFINITIONS.VSC_CONVERTER_STATIONS
                )}
            />
        );
    }

    function setFilter(event) {
        const value = event.target.value;
        setRowFilter(
            !value || value === '' ? undefined : new RegExp(value, 'i')
        );
    }

    const filter = useCallback(
        (cell) => {
            if (!rowFilter) return true;
            let ok = false;
            Object.values(cell).forEach((value) => {
                if (rowFilter.test(value)) {
                    ok = true;
                }
            });

            return ok;
        },
        [rowFilter]
    );

    const handleOpenPopupSelectColumnNames = () => {
        setListColumnsNames(
            listColumnsNames.map((arr, index) =>
                tabIndex === index
                    ? Object.values(TABLES_DEFINITIONS)
                          .filter((table) => tabIndex === table.index)[0]
                          .columns.map((c) => {
                              return c.id;
                          })
                    : arr
            )
        );
        setPopupSelectColumnNames(true);
    };

    const handleClosePopupSelectColumnNames = () => {
        setPopupSelectColumnNames(false);
    };

    const handleSaveSelectedColumnNames = () => {
        const showListName = listColumnsNames[tabIndex].filter((item) =>
            checked[tabIndex].includes(item)
        );
        setListSelectedColumnsNames(
            listSelectedColumnsNames.map((arr, index) =>
                tabIndex === index ? showListName : arr
            )
        );

        setPopupSelectColumnNames(false);
    };

    function not(a, b) {
        return a.filter((value) => b.indexOf(value) === -1);
    }

    function intersection(a, b) {
        return a.filter((value) => b.indexOf(value) !== -1);
    }

    function union(a, b) {
        return [...a, ...not(b, a)];
    }

    const handleToggle = (value) => () => {
        const currentIndex = checked[tabIndex].indexOf(value);
        const newChecked = [...checked[tabIndex]];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(
            checked.map((arr, index) => (tabIndex === index ? newChecked : arr))
        );
    };

    const numberOfChecked = (items) =>
        intersection(checked[tabIndex], items).length;

    const handleToggleAll = (items) => () => {
        let newChecked;
        if (numberOfChecked(items) === items.length) {
            newChecked = not(checked[tabIndex], items);
        } else {
            newChecked = union(checked[tabIndex], items);
        }
        setChecked(
            checked.map((arr, index) => (tabIndex === index ? newChecked : arr))
        );
    };

    const checkListColumnsNames = () => {
        return (
            <List>
                <ListItem
                    className={classes.checkboxSelectAll}
                    onClick={handleToggleAll(listColumnsNames[tabIndex])}
                >
                    <Checkbox
                        checked={
                            numberOfChecked(listColumnsNames[tabIndex]) ===
                                listColumnsNames[tabIndex].length &&
                            listColumnsNames[tabIndex].length !== 0
                        }
                        indeterminate={
                            numberOfChecked(listColumnsNames[tabIndex]) !==
                                listColumnsNames[tabIndex].length &&
                            numberOfChecked(listColumnsNames[tabIndex]) !== 0
                        }
                        disabled={listColumnsNames[tabIndex].length === 0}
                        color="primary"
                    />
                    <FormattedMessage id="CheckAll" />
                </ListItem>
                {listColumnsNames[tabIndex].map((value, index) => (
                    <List key={index} style={{ padding: '0' }}>
                        <ListItem
                            key={index}
                            className={classes.checkboxItem}
                            onClick={handleToggle(value)}
                            style={{ padding: '0 16px' }}
                        >
                            <ListItemIcon>
                                <Checkbox
                                    checked={
                                        checked[tabIndex].indexOf(value) !== -1
                                    }
                                    color="primary"
                                />
                            </ListItemIcon>
                            <ListItemText
                                primary={intl.formatMessage({ id: `${value}` })}
                            />
                        </ListItem>
                    </List>
                ))}
            </List>
        );
    };

    return (
        props.network && (
            <>
                <Grid container justify={'space-between'}>
                    <Grid container justify={'space-between'} item>
                        <Tabs
                            value={tabIndex}
                            indicatorColor="primary"
                            variant="scrollable"
                            scrollButtons="auto"
                            onChange={(event, newValue) =>
                                setTabIndex(newValue)
                            }
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
                        <Grid
                            item
                            alignContent={'flex-end'}
                            className={classes.containerInputSearch}
                        >
                            <TextField
                                className={classes.textField}
                                size="small"
                                placeholder={
                                    intl.formatMessage({ id: 'filter' }) + '...'
                                }
                                onChange={setFilter}
                                variant="outlined"
                                classes={classes.searchSection}
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
                            <IconButton
                                aria-label="dialog"
                                onClick={handleOpenPopupSelectColumnNames}
                            >
                                <ViewColumnIcon />
                            </IconButton>
                            <SelectOptionsDialog
                                open={popupSelectColumnNames}
                                onClose={handleClosePopupSelectColumnNames}
                                onClick={handleSaveSelectedColumnNames}
                                title={<FormattedMessage id="ColumnsList" />}
                                child={checkListColumnsNames()}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <div className={classes.table} style={{ flexGrow: 1 }}>
                    {/*This render is fast, rerender full dom everytime*/}
                    {tabIndex === TABLES_DEFINITIONS.SUBSTATIONS.index &&
                        renderSubstationsTable()}
                    {tabIndex === TABLES_DEFINITIONS.VOLTAGE_LEVELS.index &&
                        renderVoltageLevelsTable()}
                    {tabIndex === TABLES_DEFINITIONS.LINES.index &&
                        renderLinesTable()}
                    {tabIndex ===
                        TABLES_DEFINITIONS.TWO_WINDINGS_TRANSFORMERS.index &&
                        renderTwoWindingsTransformersTable()}
                    {tabIndex ===
                        TABLES_DEFINITIONS.THREE_WINDINGS_TRANSFORMERS.index &&
                        renderThreeWindingsTransformersTable()}
                    {tabIndex === TABLES_DEFINITIONS.GENERATORS.index &&
                        renderGeneratorsTable()}
                    {tabIndex === TABLES_DEFINITIONS.LOADS.index &&
                        renderLoadsTable()}
                    {tabIndex === TABLES_DEFINITIONS.SHUNT_COMPENSATORS.index &&
                        renderShuntCompensatorsTable()}
                    {tabIndex ===
                        TABLES_DEFINITIONS.STATIC_VAR_COMPENSATORS.index &&
                        renderStaticVarCompensatorsTable()}
                    {tabIndex === TABLES_DEFINITIONS.BATTERIES.index &&
                        renderBatteriesTable()}
                    {tabIndex === TABLES_DEFINITIONS.HVDC_LINES.index &&
                        renderHvdcLinesTable()}
                    {tabIndex ===
                        TABLES_DEFINITIONS.LCC_CONVERTER_STATIONS.index &&
                        renderLccConverterStationsTable()}
                    {tabIndex ===
                        TABLES_DEFINITIONS.VSC_CONVERTER_STATIONS.index &&
                        renderVscConverterStationsTable()}
                    {tabIndex === TABLES_DEFINITIONS.DANGLING_LINES.index &&
                        renderDanglingLinesTable()}
                </div>
            </>
        )
    );
};

NetworkTable.defaultProps = {
    network: null,
    userId: '',
    studyName: '',
};

NetworkTable.propTypes = {
    network: PropTypes.instanceOf(Network),
    userId: PropTypes.string,
    studyName: PropTypes.string,
};

export default NetworkTable;
