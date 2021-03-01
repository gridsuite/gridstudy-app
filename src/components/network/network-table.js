/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Network from './network';
import VirtualizedTable from '../util/virtualized-table';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { useIntl } from 'react-intl';
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
import { FormattedMessage } from 'react-intl';
import { SelectColumnsNames } from '../../utils/dialogs';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';

const TABLE_NAMES = [
    'Substations',
    'VoltageLevels',
    'Lines',
    'TwoWindingsTransformers',
    'ThreeWindingsTransformers',
    'Generators',
    'Loads',
    'ShuntCompensators',
    'StaticVarCompensators',
    'Batteries',
    'HvdcLines',
    'LccConverterStations',
    'VscConverterStations',
    'DanglingLines',
];

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
}));

const NetworkTable = (props) => {
    const classes = useStyles();

    const [tabIndex, setTabIndex] = React.useState(0);
    const [lineEdit, setLineEdit] = React.useState({});
    const [rowFilter, setRowFilter] = React.useState(undefined);
    const [popupSelectListName, setPopupSelectListName] = React.useState(false);

    const [listColumnsNames, setListColumnsNames] = useState([]);
    const [checked, setChecked] = React.useState([]);
    const [selectedListName, setSelectedListName] = useState([]);

    const intl = useIntl();

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

    function generateTapRequest(type, leg) {
        const getLeg = leg !== undefined ? '.getLeg' + leg + '()' : '';
        return (
            'tap = equipment' +
            getLeg +
            '.get' +
            type +
            'TapChanger()\n' +
            'if (tap.getLowTapPosition() <= {} && {} < tap.getHighTapPosition() ) { \n' +
            '    tap.setTapPosition({})\n' +
            // to force update of transformer as sub elements changes like tapChanger are not detected
            '    equipment.setFictitious(equipment.isFictitious())\n' +
            '} else {\n' +
            "throw new Exception('incorrect value')\n" +
            ' }\n'
        );
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
            groovyCr += cr.command.replace(/\{\}/g, cr.value) + '\n';
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
        (data, command, value) => {
            // save original value, dont erase if exists
            if (!lineEdit[tabIndex].oldValues[data.dataKey])
                lineEdit[tabIndex].oldValues[data.dataKey] =
                    data.rowData[data.dataKey];
            lineEdit[tabIndex].newValues[data.dataKey] = {
                command: command,
                value: value,
            };
            data.rowData[data.dataKey] = value;
        },
        [lineEdit, tabIndex]
    );

    const EditableCellRender = useCallback(
        (cellData, numeric, command, fractionDigit) => {
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
                            command,
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
        return selectedListName[tabIndex].includes(key) ? '' : 'none';
    };

    const generateTableColumns = (index) => {
        return getListAvailableColumns(index).map((c) => {
            return {
                label: intl.formatMessage({ id: c.id }),
                headerStyle: { display: showSelectedColumn(c.id) },
                style: { display: showSelectedColumn(c.id) },
                ...c,
            };
        });
    };

    const renderSubstationsTable = () => {
        return (
            <VirtualizedTable
                rowCount={props.network.substations.length}
                rowGetter={({ index }) => props.network.substations[index]}
                filter={filter}
                columns={generateTableColumns(0)}
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
                columns={generateTableColumns(1)}
            />
        );
    }

    function renderLinesTable() {
        return (
            <VirtualizedTable
                rowCount={props.network.lines.length}
                rowGetter={({ index }) => props.network.lines[index]}
                filter={filter}
                columns={generateTableColumns(2)}
            />
        );
    }

    function makeHeaderCell(equipmentType) {
        return {
            width: 80,
            label: '',
            dataKey: '',
            style: {
                display: selectedListName[tabIndex].length > 0 ? '' : 'none',
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
                    ...generateTableColumns(3),
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
                    ...generateTableColumns(4),
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
                    ...generateTableColumns(5),
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
                columns={generateTableColumns(6)}
            />
        );
    }

    function renderBatteriesTable() {
        return (
            <VirtualizedTable
                rowCount={props.network.batteries.length}
                rowGetter={({ index }) => props.network.batteries[index]}
                filter={filter}
                columns={generateTableColumns(9)}
            />
        );
    }

    function renderDanglingLinesTable() {
        return (
            <VirtualizedTable
                rowCount={props.network.danglingLines.length}
                rowGetter={({ index }) => props.network.danglingLines[index]}
                filter={filter}
                columns={generateTableColumns(13)}
            />
        );
    }

    function renderHvdcLinesTable() {
        return (
            <VirtualizedTable
                rowCount={props.network.hvdcLines.length}
                rowGetter={({ index }) => props.network.hvdcLines[index]}
                filter={filter}
                columns={generateTableColumns(10)}
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
                columns={generateTableColumns(7)}
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
                columns={generateTableColumns(8)}
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
                columns={generateTableColumns(11)}
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
                columns={generateTableColumns(12)}
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

    const handleOpenPopupSelectList = () => {
        setListColumnsNames(
            listColumnsNames.map((arr, index) =>
                tabIndex === index
                    ? getListAvailableColumns(tabIndex).map((c) => {
                          return c.id;
                      })
                    : arr
            )
        );
        setPopupSelectListName(true);
    };

    const handleClosePopupSelectList = () => {
        setPopupSelectListName(false);
    };

    const handleSaveSelectedList = () => {
        const showListName = listColumnsNames[tabIndex].filter((item) =>
            checked[tabIndex].includes(item)
        );
        setSelectedListName(
            selectedListName.map((arr, index) =>
                tabIndex === index ? showListName : arr
            )
        );

        setPopupSelectListName(false);
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

    const getListAvailableColumns = useCallback(
        (index) => {
            let list = [];
            switch (index) {
                case 0: // substations
                    list = [
                        {
                            width: 400,
                            id: 'ID',
                            dataKey: 'id',
                        },
                        {
                            width: 200,
                            id: 'Name',
                            dataKey: 'name',
                        },
                        {
                            width: 200,
                            id: 'Country',
                            dataKey: 'countryName',
                        },
                    ];
                    return list;

                case 1: // voltage levels
                    list = [
                        {
                            width: 400,
                            id: 'ID',
                            dataKey: 'id',
                        },
                        {
                            width: 200,
                            id: 'Name',
                            dataKey: 'name',
                        },
                        {
                            width: 400,
                            id: 'SubstationId',
                            dataKey: 'substationId',
                        },
                        {
                            width: 200,
                            id: 'NominalVoltage',
                            dataKey: 'nominalVoltage',
                            numeric: true,
                            fractionDigits: 0,
                        },
                    ];
                    return list;

                case 2: // lines
                    list = [
                        {
                            width: 400,
                            id: 'ID',
                            dataKey: 'id',
                        },
                        {
                            width: 200,
                            id: 'Name',
                            dataKey: 'name',
                        },
                        {
                            width: 400,
                            id: 'VoltageLevelIdSide1',
                            dataKey: 'voltageLevelId1',
                        },
                        {
                            width: 400,
                            id: 'VoltageLevelIdSide2',
                            dataKey: 'voltageLevelId2',
                        },
                        {
                            width: 200,
                            id: 'ActivePowerSide1',
                            dataKey: 'p1',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'ActivePowerSide2',
                            dataKey: 'p2',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'ReactivePowerSide1',
                            dataKey: 'q1',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'ReactivePowerSide2',
                            dataKey: 'q2',
                            numeric: true,
                            fractionDigits: 1,
                        },
                    ];
                    return list;

                case 3: // two windings transformers
                    list = [
                        {
                            width: 400,
                            id: 'ID',
                            dataKey: 'id',
                        },
                        {
                            width: 200,
                            id: 'Name',
                            dataKey: 'name',
                        },
                        {
                            width: 400,
                            id: 'VoltageLevelIdSide1',
                            dataKey: 'voltageLevelId1',
                        },
                        {
                            width: 400,
                            id: 'VoltageLevelIdSide2',
                            dataKey: 'voltageLevelId2',
                        },
                        {
                            width: 200,
                            id: 'ActivePowerSide1',
                            dataKey: 'p1',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'ActivePowerSide2',
                            dataKey: 'p2',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'ReactivePowerSide1',
                            dataKey: 'q1',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'ReactivePowerSide2',
                            dataKey: 'q2',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 150,
                            id: 'RatioTap',
                            dataKey: 'ratioTapChangerPosition',
                            cellRenderer: (cell) =>
                                EditableCellRender(
                                    cell,
                                    true,
                                    generateTapRequest('Ratio'),
                                    0
                                ),
                        },
                        {
                            width: 150,
                            id: 'PhaseTap',
                            dataKey: 'phaseTapChangerPosition',
                            cellRenderer: (cell) =>
                                EditableCellRender(
                                    cell,
                                    true,
                                    generateTapRequest('Phase'),
                                    0
                                ),
                        },
                    ];
                    return list;

                case 4: // three windings transformers
                    list = [
                        {
                            width: 400,
                            id: 'ID',
                            dataKey: 'id',
                        },
                        {
                            width: 200,
                            id: 'Name',
                            dataKey: 'name',
                        },
                        {
                            width: 400,
                            id: 'VoltageLevelIdSide1',
                            dataKey: 'voltageLevelId1',
                        },
                        {
                            width: 400,
                            id: 'VoltageLevelIdSide2',
                            dataKey: 'voltageLevelId2',
                        },
                        {
                            width: 400,
                            id: 'VoltageLevelIdSide3',
                            dataKey: 'voltageLevelId3',
                        },
                        {
                            width: 200,
                            id: 'ActivePowerSide1',
                            dataKey: 'p1',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'ActivePowerSide2',
                            dataKey: 'p2',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'ActivePowerSide3',
                            dataKey: 'p3',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'ReactivePowerSide1',
                            dataKey: 'q1',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'ReactivePowerSide2',
                            dataKey: 'q2',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'ReactivePowerSide3',
                            dataKey: 'q3',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 150,
                            id: 'RatioTap1',
                            dataKey: 'ratioTapChanger1Position',
                            cellRenderer: (cell) =>
                                EditableCellRender(
                                    cell,
                                    true,
                                    generateTapRequest('Ratio', 1),
                                    0
                                ),
                        },
                        {
                            width: 150,
                            id: 'RatioTap2',
                            dataKey: 'ratioTapChanger2Position',
                            cellRenderer: (cell) =>
                                EditableCellRender(
                                    cell,
                                    true,
                                    generateTapRequest('Ratio', 2),
                                    0
                                ),
                        },
                        {
                            width: 150,
                            id: 'RatioTap3',
                            dataKey: 'ratioTapChanger3Position',
                            cellRenderer: (cell) =>
                                EditableCellRender(
                                    cell,
                                    true,
                                    generateTapRequest('Ratio', 3),
                                    0
                                ),
                        },
                        {
                            width: 150,
                            id: 'PhaseTap1',
                            dataKey: 'phaseTapChanger1Position',
                            cellRenderer: (cell) =>
                                EditableCellRender(
                                    cell,
                                    true,
                                    generateTapRequest('Phase', 1),
                                    0
                                ),
                        },
                        {
                            width: 150,
                            id: 'PhaseTap2',
                            dataKey: 'phaseTapChanger2Position',
                            cellRenderer: (cell) =>
                                EditableCellRender(
                                    cell,
                                    true,
                                    generateTapRequest('Phase', 2),
                                    0
                                ),
                        },
                        {
                            width: 150,
                            id: 'PhaseTap3',
                            numeric: true,
                            cellRenderer: (cell) =>
                                EditableCellRender(
                                    cell,
                                    true,
                                    generateTapRequest('Phase', 3),
                                    0
                                ),
                        },
                    ];
                    return list;

                case 5: // generators
                    list = [
                        {
                            width: 400,
                            id: 'ID',
                            dataKey: 'id',
                        },
                        {
                            width: 200,
                            id: 'Name',
                            dataKey: 'name',
                        },
                        {
                            width: 400,
                            id: 'VoltageLevelId',
                            dataKey: 'voltageLevelId',
                        },
                        {
                            width: 200,
                            id: 'ActivePower',
                            dataKey: 'p',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'ReactivePower',
                            dataKey: 'q',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'TargetP',
                            dataKey: 'targetP',
                            cellRenderer: (cell) =>
                                EditableCellRender(
                                    cell,
                                    true,
                                    'equipment.setTargetP({})',
                                    1
                                ),
                        },
                    ];
                    return list;

                case 6: // loads
                    list = [
                        {
                            width: 400,
                            id: 'ID',
                            dataKey: 'id',
                        },
                        {
                            width: 200,
                            id: 'Name',
                            dataKey: 'name',
                        },
                        {
                            width: 200,
                            id: 'LoadType',
                            dataKey: 'type',
                        },
                        {
                            width: 400,
                            id: 'VoltageLevelId',
                            dataKey: 'voltageLevelId',
                        },
                        {
                            width: 200,
                            id: 'ActivePower',
                            dataKey: 'p',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'ReactivePower',
                            dataKey: 'q',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'ConstantActivePower',
                            dataKey: 'p0',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'ConstantReactivePower',
                            dataKey: 'q0',
                            numeric: true,
                            fractionDigits: 1,
                        },
                    ];
                    return list;

                case 7: // shunt compensators
                    list = [
                        {
                            width: 400,
                            id: 'ID',
                            dataKey: 'id',
                        },
                        {
                            width: 200,
                            id: 'Name',
                            dataKey: 'name',
                        },
                        {
                            width: 400,
                            id: 'VoltageLevelId',
                            dataKey: 'voltageLevelId',
                        },
                        {
                            width: 200,
                            id: 'ReactivePower',
                            dataKey: 'q',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'TargetV',
                            dataKey: 'targetV',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'TargetDeadband',
                            dataKey: 'targetDeadband',
                            numeric: true,
                            fractionDigits: 1,
                        },
                    ];
                    return list;

                case 8: // static var compensators
                    list = [
                        {
                            width: 400,
                            id: 'ID',
                            dataKey: 'id',
                        },
                        {
                            width: 200,
                            id: 'Name',
                            dataKey: 'name',
                        },
                        {
                            width: 400,
                            id: 'VoltageLevelId',
                            dataKey: 'voltageLevelId',
                        },
                        {
                            width: 200,
                            id: 'ActivePower',
                            dataKey: 'p',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'ReactivePower',
                            dataKey: 'q',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'VoltageSetpoint',
                            dataKey: 'voltageSetpoint',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'ReactivePowerSetpoint',
                            dataKey: 'reactivePowerSetpoint',
                            numeric: true,
                            fractionDigits: 1,
                        },
                    ];
                    return list;

                case 9: // batteries
                    list = [
                        {
                            width: 400,
                            id: 'ID',
                            dataKey: 'id',
                        },
                        {
                            width: 200,
                            id: 'Name',
                            dataKey: 'name',
                        },
                        {
                            width: 400,
                            id: 'VoltageLevelId',
                            dataKey: 'voltageLevelId',
                        },
                        {
                            width: 200,
                            id: 'ActivePower',
                            dataKey: 'p',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'ReactivePower',
                            dataKey: 'q',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'ConstantActivePower',
                            dataKey: 'p0',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'ConstantReactivePower',
                            dataKey: 'q0',
                            numeric: true,
                            fractionDigits: 1,
                        },
                    ];
                    return list;

                case 10: // hvdc lines
                    list = [
                        {
                            width: 400,
                            id: 'ID',
                            dataKey: 'id',
                        },
                        {
                            width: 200,
                            id: 'Name',
                            dataKey: 'name',
                        },
                        {
                            width: 400,
                            id: 'ConvertersMode',
                            dataKey: 'convertersMode',
                        },
                        {
                            width: 400,
                            id: 'ConverterStationId1',
                            dataKey: 'converterStationId1',
                        },
                        {
                            width: 400,
                            id: 'ConverterStationId2',
                            dataKey: 'converterStationId2',
                        },
                        {
                            width: 200,
                            id: 'R',
                            dataKey: 'r',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'NominalV',
                            dataKey: 'nominalV',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 300,
                            id: 'ActivePowerSetpoint',
                            dataKey: 'activePowerSetpoint',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'MaxP',
                            dataKey: 'maxP',
                            numeric: true,
                            fractionDigits: 1,
                        },
                    ];
                    return list;

                case 11: // lcc converter stations
                    list = [
                        {
                            width: 400,
                            id: 'ID',
                            dataKey: 'id',
                        },
                        {
                            width: 200,
                            id: 'Name',
                            dataKey: 'name',
                        },
                        {
                            width: 400,
                            id: 'VoltageLevelId',
                            dataKey: 'voltageLevelId',
                        },
                        {
                            width: 400,
                            id: 'HvdcLineId',
                            dataKey: 'hvdcLineId',
                        },
                        {
                            width: 200,
                            id: 'ActivePower',
                            dataKey: 'p',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'ReactivePower',
                            dataKey: 'q',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'PowerFactor',
                            dataKey: 'powerFactor',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'LossFactor',
                            dataKey: 'lossFactor',
                            numeric: true,
                            fractionDigits: 1,
                        },
                    ];
                    return list;

                case 12: // vsc converter stations
                    list = [
                        {
                            width: 400,
                            id: 'ID',
                            dataKey: 'id',
                        },
                        {
                            width: 200,
                            id: 'Name',
                            dataKey: 'name',
                        },
                        {
                            width: 400,
                            id: 'VoltageLevelId',
                            dataKey: 'voltageLevelId',
                        },
                        {
                            width: 400,
                            id: 'HvdcLineId',
                            dataKey: 'hvdcLineId',
                        },
                        {
                            width: 200,
                            id: 'ActivePower',
                            dataKey: 'p',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'ReactivePower',
                            dataKey: 'q',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'LossFactor',
                            dataKey: 'lossFactor',
                            numeric: true,
                            fractionDigits: 1,
                        },
                    ];
                    return list;

                case 13: // dangling lines
                    list = [
                        {
                            width: 400,
                            id: 'ID',
                            dataKey: 'id',
                        },
                        {
                            width: 200,
                            id: 'Name',
                            dataKey: 'name',
                        },
                        {
                            width: 400,
                            id: 'VoltageLevelId',
                            dataKey: 'voltageLevelId',
                        },
                        {
                            width: 200,
                            id: 'UcteXnodeCode',
                            dataKey: 'ucteXnodeCode',
                        },
                        {
                            width: 200,
                            id: 'ActivePower',
                            dataKey: 'p',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'ReactivePower',
                            dataKey: 'q',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'ConstantActivePower',
                            dataKey: 'p0',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            width: 200,
                            id: 'ConstantReactivePower',
                            dataKey: 'q0',
                            numeric: true,
                            fractionDigits: 1,
                        },
                    ];
                    return list;

                default:
                    return [];
            }
        },
        [EditableCellRender]
    );

    useEffect(() => {
        // by default, all available columns are selected
        let cols = [];
        let selCols = [];
        let checkCols = [];
        TABLE_NAMES.forEach((name, index) => {
            let availableCols = getListAvailableColumns(index).map((c) => {
                return c.id;
            });
            cols.push(availableCols);
            selCols.push(availableCols);
            checkCols.push(availableCols);
        });

        setListColumnsNames(cols);
        setSelectedListName(selCols);
        setChecked(checkCols);
        // Do not add getListAvailableColumns as dependency, because this effect must be called just once
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        props.network && (
            <>
                <Grid container justify={'space-between'}>
                    <Grid container justify={'space-between'} item>
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
                                    {TABLE_NAMES.map((tableName) => (
                                        <Tab
                                            key={tableName}
                                            label={intl.formatMessage({
                                                id: tableName,
                                            })}
                                        />
                                    ))}
                                </Tabs>
                            </Grid>
                            <Grid container>
                                <span style={{ marginTop: '15px' }}>
                                    <FormattedMessage id="LabelSelectList" />
                                </span>
                                <IconButton
                                    aria-label="dialog"
                                    onClick={handleOpenPopupSelectList}
                                >
                                    <ViewColumnIcon />
                                </IconButton>
                                <SelectColumnsNames
                                    open={popupSelectListName}
                                    onClose={handleClosePopupSelectList}
                                    onClick={handleSaveSelectedList}
                                    title={
                                        <FormattedMessage id="ColumnsList" />
                                    }
                                    child={checkListColumnsNames()}
                                />
                            </Grid>
                            <Grid
                                item
                                alignContent={'flex-end'}
                                className={classes.containerInputSearch}
                            >
                                <TextField
                                    className={classes.textField}
                                    size="small"
                                    placeholder={
                                        intl.formatMessage({ id: 'filter' }) +
                                        '...'
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
                        </Grid>
                    </Grid>
                </Grid>
                <div className={classes.table} style={{ flexGrow: 1 }}>
                    {/*This render is fast, rerender full dom everytime*/}
                    {tabIndex === 0 && renderSubstationsTable()}
                    {tabIndex === 1 && renderVoltageLevelsTable()}
                    {tabIndex === 2 && renderLinesTable()}
                    {tabIndex === 3 && renderTwoWindingsTransformersTable()}
                    {tabIndex === 4 && renderThreeWindingsTransformersTable()}
                    {tabIndex === 5 && renderGeneratorsTable()}
                    {tabIndex === 6 && renderLoadsTable()}
                    {tabIndex === 7 && renderShuntCompensatorsTable()}
                    {tabIndex === 8 && renderStaticVarCompensatorsTable()}
                    {tabIndex === 9 && renderBatteriesTable()}
                    {tabIndex === 10 && renderHvdcLinesTable()}
                    {tabIndex === 11 && renderLccConverterStationsTable()}
                    {tabIndex === 12 && renderVscConverterStationsTable()}
                    {tabIndex === 13 && renderDanglingLinesTable()}
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
