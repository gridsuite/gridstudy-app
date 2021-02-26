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

    function isLineOnEditMode(row) {
        return (lineEdit[tabIndex] && lineEdit[tabIndex].line === row) || false;
    }

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

    function defaultCellRender(cellData, numeric, fractionDigit) {
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
    }

    function registerChangeRequest(data, command, value) {
        // save original value, dont erase if exists
        if (!lineEdit[tabIndex].oldValues[data.dataKey])
            lineEdit[tabIndex].oldValues[data.dataKey] =
                data.rowData[data.dataKey];
        lineEdit[tabIndex].newValues[data.dataKey] = {
            command: command,
            value: value,
        };
        data.rowData[data.dataKey] = value;
    }

    function EditableCellRender(cellData, numeric, command, fractionDigit) {
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
                    registerChangeRequest(cellData, command, obj.target.value)
                }
                defaultValue={formatCellData(cellData, numeric, fractionDigit)}
            />
        );
    }

    const showSelectedColumn = (key) => {
        return selectedListName.includes(intl.formatMessage({ id: key }))
            ? ''
            : 'none';
    };

    const renderSubstationsTable = () => {
        return (
            <VirtualizedTable
                rowCount={props.network.substations.length}
                rowGetter={({ index }) => props.network.substations[index]}
                filter={filter}
                columns={[
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                        headerStyle: {
                            display: showSelectedColumn('ID'),
                        },
                        style: {
                            display: showSelectedColumn('ID'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                        headerStyle: {
                            display: showSelectedColumn('Name'),
                        },
                        style: {
                            display: showSelectedColumn('Name'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Country' }),
                        dataKey: 'countryName',
                        headerStyle: {
                            display: showSelectedColumn('Country'),
                        },
                        style: {
                            display: showSelectedColumn('Country'),
                        },
                    },
                ]}
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
                columns={[
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                        headerStyle: {
                            display: showSelectedColumn('ID'),
                        },
                        style: {
                            display: showSelectedColumn('ID'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                        headerStyle: {
                            display: showSelectedColumn('Name'),
                        },
                        style: {
                            display: showSelectedColumn('Name'),
                        },
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'SubstationId' }),
                        dataKey: 'substationId',
                        headerStyle: {
                            display: showSelectedColumn('SubstationId'),
                        },
                        style: {
                            display: showSelectedColumn('SubstationId'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'NominalVoltage' }),
                        dataKey: 'nominalVoltage',
                        numeric: true,
                        fractionDigits: 0,
                        headerStyle: {
                            display: showSelectedColumn('NominalVoltage'),
                        },
                        style: {
                            display: showSelectedColumn('NominalVoltage'),
                        },
                    },
                ]}
            />
        );
    }

    function renderLinesTable() {
        return (
            <VirtualizedTable
                rowCount={props.network.lines.length}
                rowGetter={({ index }) => props.network.lines[index]}
                filter={filter}
                columns={[
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                        headerStyle: {
                            display: showSelectedColumn('ID'),
                        },
                        style: {
                            display: showSelectedColumn('ID'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                        headerStyle: {
                            display: showSelectedColumn('Name'),
                        },
                        style: {
                            display: showSelectedColumn('Name'),
                        },
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelIdSide1',
                        }),
                        dataKey: 'voltageLevelId1',
                        headerStyle: {
                            display: showSelectedColumn('VoltageLevelIdSide1'),
                        },
                        style: {
                            display: showSelectedColumn('VoltageLevelIdSide1'),
                        },
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelIdSide2',
                        }),
                        dataKey: 'voltageLevelId2',
                        headerStyle: {
                            display: showSelectedColumn('VoltageLevelIdSide2'),
                        },
                        style: {
                            display: showSelectedColumn('VoltageLevelIdSide2'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePowerSide1' }),
                        dataKey: 'p1',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ActivePowerSide1'),
                        },
                        style: {
                            display: showSelectedColumn('ActivePowerSide1'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePowerSide2' }),
                        dataKey: 'p2',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ActivePowerSide2'),
                        },
                        style: {
                            display: showSelectedColumn('ActivePowerSide2'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePowerSide1' }),
                        dataKey: 'q1',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ReactivePowerSide1'),
                        },
                        style: {
                            display: showSelectedColumn('ReactivePowerSide1'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePowerSide2' }),
                        dataKey: 'q2',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ReactivePowerSide2'),
                        },
                        style: {
                            display: showSelectedColumn('ReactivePowerSide2'),
                        },
                    },
                ]}
            />
        );
    }

    function makeHeaderCell(equipmentType) {
        return {
            width: 80,
            label: '',
            dataKey: '',
            style: {
                display: selectedListName.length > 0 ? '' : 'none',
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
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                        headerStyle: {
                            display: showSelectedColumn('ID'),
                        },
                        style: {
                            display: showSelectedColumn('ID'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                        headerStyle: {
                            display: showSelectedColumn('Name'),
                        },
                        style: {
                            display: showSelectedColumn('Name'),
                        },
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelIdSide1',
                        }),
                        dataKey: 'voltageLevelId1',
                        headerStyle: {
                            display: showSelectedColumn('VoltageLevelIdSide1'),
                        },
                        style: {
                            display: showSelectedColumn('VoltageLevelIdSide1'),
                        },
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelIdSide2',
                        }),
                        dataKey: 'voltageLevelId2',
                        headerStyle: {
                            display: showSelectedColumn('VoltageLevelIdSide2'),
                        },
                        style: {
                            display: showSelectedColumn('VoltageLevelIdSide2'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePowerSide1' }),
                        dataKey: 'p1',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ActivePowerSide1'),
                        },
                        style: {
                            display: showSelectedColumn('ActivePowerSide1'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePowerSide2' }),
                        dataKey: 'p2',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ActivePowerSide2'),
                        },
                        style: {
                            display: showSelectedColumn('ActivePowerSide2'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePowerSide1' }),
                        dataKey: 'q1',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ReactivePowerSide1'),
                        },
                        style: {
                            display: showSelectedColumn('ReactivePowerSide1'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePowerSide2' }),
                        dataKey: 'q2',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ReactivePowerSide2'),
                        },
                        style: {
                            display: showSelectedColumn('ReactivePowerSide2'),
                        },
                    },
                    {
                        width: 150,
                        label: intl.formatMessage({ id: 'RatioTap' }),
                        dataKey: 'ratioTapChangerPosition',
                        headerStyle: {
                            display: showSelectedColumn('RatioTap'),
                        },
                        style: {
                            display: showSelectedColumn('RatioTap'),
                        },
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
                        label: intl.formatMessage({ id: 'PhaseTap' }),
                        dataKey: 'phaseTapChangerPosition',
                        headerStyle: {
                            display: showSelectedColumn('PhaseTap'),
                        },
                        style: {
                            display: showSelectedColumn('PhaseTap'),
                        },
                        cellRenderer: (cell) =>
                            EditableCellRender(
                                cell,
                                true,
                                generateTapRequest('Phase'),
                                0
                            ),
                    },
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
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                        headerStyle: {
                            display: showSelectedColumn('ID'),
                        },
                        style: {
                            display: showSelectedColumn('ID'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                        headerStyle: {
                            display: showSelectedColumn('Name'),
                        },
                        style: {
                            display: showSelectedColumn('Name'),
                        },
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelIdSide1',
                        }),
                        dataKey: 'voltageLevelId1',
                        headerStyle: {
                            display: showSelectedColumn('VoltageLevelIdSide1'),
                        },
                        style: {
                            display: showSelectedColumn('VoltageLevelIdSide1'),
                        },
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelIdSide2',
                        }),
                        dataKey: 'voltageLevelId2',
                        headerStyle: {
                            display: showSelectedColumn('VoltageLevelIdSide2'),
                        },
                        style: {
                            display: showSelectedColumn('VoltageLevelIdSide2'),
                        },
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelIdSide3',
                        }),
                        dataKey: 'voltageLevelId3',
                        headerStyle: {
                            display: showSelectedColumn('VoltageLevelIdSide3'),
                        },
                        style: {
                            display: showSelectedColumn('VoltageLevelIdSide3'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePowerSide1' }),
                        dataKey: 'p1',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ActivePowerSide1'),
                        },
                        style: {
                            display: showSelectedColumn('ActivePowerSide1'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePowerSide2' }),
                        dataKey: 'p2',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ActivePowerSide2'),
                        },
                        style: {
                            display: showSelectedColumn('ActivePowerSide2'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePowerSide3' }),
                        dataKey: 'p3',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ActivePowerSide3'),
                        },
                        style: {
                            display: showSelectedColumn('ActivePowerSide3'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePowerSide1' }),
                        dataKey: 'q1',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ReactivePowerSide1'),
                        },
                        style: {
                            display: showSelectedColumn('ReactivePowerSide1'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePowerSide2' }),
                        dataKey: 'q2',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ReactivePowerSide2'),
                        },
                        style: {
                            display: showSelectedColumn('ReactivePowerSide2'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePowerSide3' }),
                        dataKey: 'q3',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ReactivePowerSide3'),
                        },
                        style: {
                            display: showSelectedColumn('ReactivePowerSide3'),
                        },
                    },
                    {
                        width: 150,
                        label: intl.formatMessage({ id: 'RatioTap1' }),
                        dataKey: 'ratioTapChanger1Position',
                        headerStyle: {
                            display: showSelectedColumn('RatioTap1'),
                        },
                        style: {
                            display: showSelectedColumn('RatioTap1'),
                        },
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
                        label: intl.formatMessage({ id: 'RatioTap2' }),
                        dataKey: 'ratioTapChanger2Position',
                        headerStyle: {
                            display: showSelectedColumn('RatioTap2'),
                        },
                        style: {
                            display: showSelectedColumn('RatioTap2'),
                        },

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
                        label: intl.formatMessage({ id: 'RatioTap3' }),
                        dataKey: 'ratioTapChanger3Position',
                        headerStyle: {
                            display: showSelectedColumn('RatioTap3'),
                        },
                        style: {
                            display: showSelectedColumn('RatioTap3'),
                        },
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
                        label: intl.formatMessage({ id: 'PhaseTap1' }),
                        dataKey: 'phaseTapChanger1Position',
                        headerStyle: {
                            display: showSelectedColumn('PhaseTap1'),
                        },
                        style: {
                            display: showSelectedColumn('PhaseTap1'),
                        },
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
                        label: intl.formatMessage({ id: 'PhaseTap2' }),
                        dataKey: 'phaseTapChanger2Position',
                        headerStyle: {
                            display: showSelectedColumn('PhaseTap2'),
                        },
                        style: {
                            display: showSelectedColumn('PhaseTap2'),
                        },
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
                        label: intl.formatMessage({ id: 'PhaseTap3' }),
                        numeric: true,
                        headerStyle: {
                            display: showSelectedColumn('PhaseTap3'),
                        },
                        style: {
                            display: showSelectedColumn('PhaseTap3'),
                        },
                        cellRenderer: (cell) =>
                            EditableCellRender(
                                cell,
                                true,
                                generateTapRequest('Phase', 3),
                                0
                            ),
                    },
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
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                        headerStyle: {
                            display: showSelectedColumn('ID'),
                        },
                        style: {
                            display: showSelectedColumn('ID'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                        headerStyle: {
                            display: showSelectedColumn('Name'),
                        },
                        style: {
                            display: showSelectedColumn('Name'),
                        },
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelId',
                        }),
                        dataKey: 'voltageLevelId',
                        headerStyle: {
                            display: showSelectedColumn('VoltageLevelId'),
                        },
                        style: {
                            display: showSelectedColumn('VoltageLevelId'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePower' }),
                        dataKey: 'p',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ActivePower'),
                        },
                        style: {
                            display: showSelectedColumn('ActivePower'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePower' }),
                        dataKey: 'q',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ReactivePower'),
                        },
                        style: {
                            display: showSelectedColumn('ReactivePower'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'TargetP' }),
                        dataKey: 'targetP',
                        headerStyle: {
                            display: showSelectedColumn('TargetP'),
                        },
                        style: {
                            display: showSelectedColumn('TargetP'),
                        },
                        cellRenderer: (cell) =>
                            EditableCellRender(
                                cell,
                                true,
                                'equipment.setTargetP({})',
                                1
                            ),
                    },
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
                columns={[
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                        headerStyle: {
                            display: showSelectedColumn('ID'),
                        },
                        style: {
                            display: showSelectedColumn('ID'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                        headerStyle: {
                            display: showSelectedColumn('Name'),
                        },
                        style: {
                            display: showSelectedColumn('Name'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'LoadType' }),
                        dataKey: 'type',
                        headerStyle: {
                            display: showSelectedColumn('LoadType'),
                        },
                        style: {
                            display: showSelectedColumn('LoadType'),
                        },
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelId',
                        }),
                        dataKey: 'voltageLevelId',
                        headerStyle: {
                            display: showSelectedColumn('VoltageLevelId'),
                        },
                        style: {
                            display: showSelectedColumn('VoltageLevelId'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePower' }),
                        dataKey: 'p',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ActivePower'),
                        },
                        style: {
                            display: showSelectedColumn('ActivePower'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePower' }),
                        dataKey: 'q',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ReactivePower'),
                        },
                        style: {
                            display: showSelectedColumn('ReactivePower'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({
                            id: 'ConstantActivePower',
                        }),
                        dataKey: 'p0',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ConstantActivePower'),
                        },
                        style: {
                            display: showSelectedColumn('ConstantActivePower'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({
                            id: 'ConstantReactivePower',
                        }),
                        dataKey: 'q0',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn(
                                'ConstantReactivePower'
                            ),
                        },
                        style: {
                            display: showSelectedColumn(
                                'ConstantReactivePower'
                            ),
                        },
                    },
                ]}
            />
        );
    }

    function renderBatteriesTable() {
        return (
            <VirtualizedTable
                rowCount={props.network.batteries.length}
                rowGetter={({ index }) => props.network.batteries[index]}
                filter={filter}
                columns={[
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                        headerStyle: {
                            display: showSelectedColumn('ID'),
                        },
                        style: {
                            display: showSelectedColumn('ID'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                        headerStyle: {
                            display: showSelectedColumn('Name'),
                        },
                        style: {
                            display: showSelectedColumn('Name'),
                        },
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelId',
                        }),
                        dataKey: 'voltageLevelId',
                        headerStyle: {
                            display: showSelectedColumn('VoltageLevelId'),
                        },
                        style: {
                            display: showSelectedColumn('VoltageLevelId'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePower' }),
                        dataKey: 'p',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ActivePower'),
                        },
                        style: {
                            display: showSelectedColumn('ActivePower'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePower' }),
                        dataKey: 'q',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ReactivePower'),
                        },
                        style: {
                            display: showSelectedColumn('ReactivePower'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({
                            id: 'ConstantActivePower',
                        }),
                        dataKey: 'p0',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ConstantActivePower'),
                        },
                        style: {
                            display: showSelectedColumn('ConstantActivePower'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({
                            id: 'ConstantReactivePower',
                        }),
                        dataKey: 'q0',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn(
                                'ConstantReactivePower'
                            ),
                        },
                        style: {
                            display: showSelectedColumn(
                                'ConstantReactivePower'
                            ),
                        },
                    },
                ]}
            />
        );
    }

    function renderDanglingLinesTable() {
        return (
            <VirtualizedTable
                rowCount={props.network.danglingLines.length}
                rowGetter={({ index }) => props.network.danglingLines[index]}
                filter={filter}
                columns={[
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                        headerStyle: {
                            display: showSelectedColumn('ID'),
                        },
                        style: {
                            display: showSelectedColumn('ID'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                        headerStyle: {
                            display: showSelectedColumn('Name'),
                        },
                        style: {
                            display: showSelectedColumn('Name'),
                        },
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelId',
                        }),
                        dataKey: 'voltageLevelId',
                        headerStyle: {
                            display: showSelectedColumn('VoltageLevelId'),
                        },
                        style: {
                            display: showSelectedColumn('VoltageLevelId'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'UcteXnodeCode' }),
                        dataKey: 'ucteXnodeCode',
                        headerStyle: {
                            display: showSelectedColumn('UcteXnodeCode'),
                        },
                        style: {
                            display: showSelectedColumn('UcteXnodeCode'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePower' }),
                        dataKey: 'p',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ActivePower'),
                        },
                        style: {
                            display: showSelectedColumn('ActivePower'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePower' }),
                        dataKey: 'q',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ReactivePower'),
                        },
                        style: {
                            display: showSelectedColumn('ReactivePower'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({
                            id: 'ConstantActivePower',
                        }),
                        dataKey: 'p0',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ConstantActivePower'),
                        },
                        style: {
                            display: showSelectedColumn('ConstantActivePower'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({
                            id: 'ConstantReactivePower',
                        }),
                        dataKey: 'q0',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn(
                                'ConstantReactivePower'
                            ),
                        },
                        style: {
                            display: showSelectedColumn(
                                'ConstantReactivePower'
                            ),
                        },
                    },
                ]}
            />
        );
    }

    function renderHvdcLinesTable() {
        return (
            <VirtualizedTable
                rowCount={props.network.hvdcLines.length}
                rowGetter={({ index }) => props.network.hvdcLines[index]}
                filter={filter}
                columns={[
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                        headerStyle: {
                            display: showSelectedColumn('ID'),
                        },
                        style: {
                            display: showSelectedColumn('ID'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                        headerStyle: {
                            display: showSelectedColumn('Name'),
                        },
                        style: {
                            display: showSelectedColumn('Name'),
                        },
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ConvertersMode' }),
                        dataKey: 'convertersMode',
                        headerStyle: {
                            display: showSelectedColumn('ConvertersMode'),
                        },
                        style: {
                            display: showSelectedColumn('ConvertersMode'),
                        },
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'ConverterStationId1',
                        }),
                        dataKey: 'converterStationId1',
                        headerStyle: {
                            display: showSelectedColumn('ConverterStationId1'),
                        },
                        style: {
                            display: showSelectedColumn('ConverterStationId1'),
                        },
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'ConverterStationId2',
                        }),
                        dataKey: 'converterStationId2',
                        headerStyle: {
                            display: showSelectedColumn('ConverterStationId2'),
                        },
                        style: {
                            display: showSelectedColumn('ConverterStationId2'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'R' }),
                        dataKey: 'r',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('R'),
                        },
                        style: {
                            display: showSelectedColumn('R'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'NominalV' }),
                        dataKey: 'nominalV',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('NominalV'),
                        },
                        style: {
                            display: showSelectedColumn('NominalV'),
                        },
                    },
                    {
                        width: 300,
                        label: intl.formatMessage({
                            id: 'ActivePowerSetpoint',
                        }),
                        dataKey: 'activePowerSetpoint',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ActivePowerSetpoint'),
                        },
                        style: {
                            display: showSelectedColumn('ActivePowerSetpoint'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'MaxP' }),
                        dataKey: 'maxP',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('MaxP'),
                        },
                        style: {
                            display: showSelectedColumn('MaxP'),
                        },
                    },
                ]}
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
                columns={[
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                        headerStyle: {
                            display: showSelectedColumn('ID'),
                        },
                        style: {
                            display: showSelectedColumn('ID'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                        headerStyle: {
                            display: showSelectedColumn('Name'),
                        },
                        style: {
                            display: showSelectedColumn('Name'),
                        },
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelId',
                        }),
                        dataKey: 'voltageLevelId',
                        headerStyle: {
                            display: showSelectedColumn('VoltageLevelId'),
                        },
                        style: {
                            display: showSelectedColumn('VoltageLevelId'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePower' }),
                        dataKey: 'q',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ReactivePower'),
                        },
                        style: {
                            display: showSelectedColumn('ReactivePower'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({
                            id: 'TargetV',
                        }),
                        dataKey: 'targetV',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('TargetV'),
                        },
                        style: {
                            display: showSelectedColumn('TargetV'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({
                            id: 'TargetDeadband',
                        }),
                        dataKey: 'targetDeadband',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('TargetDeadband'),
                        },
                        style: {
                            display: showSelectedColumn('TargetDeadband'),
                        },
                    },
                ]}
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
                columns={[
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                        headerStyle: {
                            display: showSelectedColumn('ID'),
                        },
                        style: {
                            display: showSelectedColumn('ID'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                        headerStyle: {
                            display: showSelectedColumn('Name'),
                        },
                        style: {
                            display: showSelectedColumn('Name'),
                        },
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelId',
                        }),
                        dataKey: 'voltageLevelId',
                        headerStyle: {
                            display: showSelectedColumn('VoltageLevelId'),
                        },
                        style: {
                            display: showSelectedColumn('VoltageLevelId'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePower' }),
                        dataKey: 'p',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ActivePower'),
                        },
                        style: {
                            display: showSelectedColumn('ActivePower'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePower' }),
                        dataKey: 'q',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ReactivePower'),
                        },
                        style: {
                            display: showSelectedColumn('ReactivePower'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({
                            id: 'VoltageSetpoint',
                        }),
                        dataKey: 'voltageSetpoint',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('VoltageSetpoint'),
                        },
                        style: {
                            display: showSelectedColumn('VoltageSetpoint'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({
                            id: 'ReactivePowerSetpoint',
                        }),
                        dataKey: 'reactivePowerSetpoint',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn(
                                'ReactivePowerSetpoint'
                            ),
                        },
                        style: {
                            display: showSelectedColumn(
                                'ReactivePowerSetpoint'
                            ),
                        },
                    },
                ]}
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
                columns={[
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                        headerStyle: {
                            display: showSelectedColumn('ID'),
                        },
                        style: {
                            display: showSelectedColumn('ID'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                        headerStyle: {
                            display: showSelectedColumn('Name'),
                        },
                        style: {
                            display: showSelectedColumn('Name'),
                        },
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelId',
                        }),
                        dataKey: 'voltageLevelId',
                        headerStyle: {
                            display: showSelectedColumn('VoltageLevelId'),
                        },
                        style: {
                            display: showSelectedColumn('VoltageLevelId'),
                        },
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'HvdcLineId',
                        }),
                        dataKey: 'hvdcLineId',
                        headerStyle: {
                            display: showSelectedColumn('HvdcLineId'),
                        },
                        style: {
                            display: showSelectedColumn('HvdcLineId'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePower' }),
                        dataKey: 'p',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ActivePower'),
                        },
                        style: {
                            display: showSelectedColumn('ActivePower'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePower' }),
                        dataKey: 'q',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ReactivePower'),
                        },
                        style: {
                            display: showSelectedColumn('ReactivePower'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({
                            id: 'PowerFactor',
                        }),
                        dataKey: 'powerFactor',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('PowerFactor'),
                        },
                        style: {
                            display: showSelectedColumn('PowerFactor'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({
                            id: 'LossFactor',
                        }),
                        dataKey: 'lossFactor',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('LossFactor'),
                        },
                        style: {
                            display: showSelectedColumn('LossFactor'),
                        },
                    },
                ]}
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
                columns={[
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                        headerStyle: {
                            display: showSelectedColumn('ID'),
                        },
                        style: {
                            display: showSelectedColumn('ID'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                        headerStyle: {
                            display: showSelectedColumn('Name'),
                        },
                        style: {
                            display: showSelectedColumn('Name'),
                        },
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelId',
                        }),
                        dataKey: 'voltageLevelId',
                        headerStyle: {
                            display: showSelectedColumn('VoltageLevelId'),
                        },
                        style: {
                            display: showSelectedColumn('VoltageLevelId'),
                        },
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'HvdcLineId',
                        }),
                        dataKey: 'hvdcLineId',
                        headerStyle: {
                            display: showSelectedColumn('HvdcLineId'),
                        },
                        style: {
                            display: showSelectedColumn('HvdcLineId'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePower' }),
                        dataKey: 'p',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ActivePower'),
                        },
                        style: {
                            display: showSelectedColumn('ActivePower'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePower' }),
                        dataKey: 'q',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('ReactivePower'),
                        },
                        style: {
                            display: showSelectedColumn('ReactivePower'),
                        },
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({
                            id: 'LossFactor',
                        }),
                        dataKey: 'lossFactor',
                        numeric: true,
                        fractionDigits: 1,
                        headerStyle: {
                            display: showSelectedColumn('LossFactor'),
                        },
                        style: {
                            display: showSelectedColumn('LossFactor'),
                        },
                    },
                ]}
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
        setListColumnsNames(onClickCallFunction(tabIndex));
        setPopupSelectListName(true);
    };

    const handleClosePopupSelectList = () => {
        setPopupSelectListName(false);
    };

    const handleSaveSelectedList = () => {
        const showListName = listColumnsNames.filter((item) =>
            checked.includes(item)
        );
        setSelectedListName(showListName);
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
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
    };

    const numberOfChecked = (items) => intersection(checked, items).length;

    const handleToggleAll = (items) => () => {
        if (numberOfChecked(items) === items.length) {
            setChecked(not(checked, items));
        } else {
            setChecked(union(checked, items));
        }
    };

    const checkListColumnsNames = () => {
        return (
            <List>
                <ListItem
                    className={classes.checkboxSelectAll}
                    onClick={handleToggleAll(listColumnsNames)}
                >
                    <Checkbox
                        checked={
                            numberOfChecked(listColumnsNames) ===
                                listColumnsNames.length &&
                            listColumnsNames.length !== 0
                        }
                        indeterminate={
                            numberOfChecked(listColumnsNames) !==
                                listColumnsNames.length &&
                            numberOfChecked(listColumnsNames) !== 0
                        }
                        disabled={listColumnsNames.length === 0}
                        color="primary"
                    />
                    <FormattedMessage id="CheckAll" />
                </ListItem>
                {listColumnsNames.map((value, index) => (
                    <List
                        className="dragHandle"
                        key={index}
                        style={{ padding: '0' }}
                    >
                        <ListItem
                            key={index}
                            className={classes.checkboxItem}
                            onClick={handleToggle(value)}
                            style={{ padding: '0 16px' }}
                        >
                            <ListItemIcon>
                                <Checkbox
                                    checked={checked.indexOf(value) !== -1}
                                    color="primary"
                                />
                            </ListItemIcon>
                            <ListItemText primary={`${value}`} />
                        </ListItem>
                    </List>
                ))}
            </List>
        );
    };

    const onClickCallFunction = (index) => {
        let list = '';
        if (props.network) {
            setSelectedListName([]);
            switch (index) {
                case 0:
                    list = [
                        intl.formatMessage({ id: 'ID' }),
                        intl.formatMessage({ id: 'Name' }),
                        intl.formatMessage({ id: 'Country' }),
                    ];
                    return list;
                case 1:
                    list = [
                        intl.formatMessage({ id: 'ID' }),
                        intl.formatMessage({ id: 'Name' }),
                        intl.formatMessage({ id: 'SubstationId' }),
                        intl.formatMessage({ id: 'NominalVoltage' }),
                    ];
                    return list;
                case 2:
                    list = [
                        intl.formatMessage({ id: 'ID' }),
                        intl.formatMessage({ id: 'Name' }),
                        intl.formatMessage({ id: 'VoltageLevelIdSide1' }),
                        intl.formatMessage({ id: 'VoltageLevelIdSide2' }),
                        intl.formatMessage({ id: 'ActivePowerSide1' }),
                        intl.formatMessage({ id: 'ActivePowerSide2' }),
                        intl.formatMessage({ id: 'ReactivePowerSide1' }),
                        intl.formatMessage({ id: 'ReactivePowerSide2' }),
                    ];
                    return list;
                case 3:
                    list = [
                        intl.formatMessage({ id: 'ID' }),
                        intl.formatMessage({ id: 'Name' }),
                        intl.formatMessage({ id: 'VoltageLevelIdSide1' }),
                        intl.formatMessage({ id: 'VoltageLevelIdSide2' }),
                        intl.formatMessage({ id: 'ActivePowerSide1' }),
                        intl.formatMessage({ id: 'ActivePowerSide2' }),
                        intl.formatMessage({ id: 'ReactivePowerSide1' }),
                        intl.formatMessage({ id: 'ReactivePowerSide2' }),
                        intl.formatMessage({ id: 'RatioTap' }),
                        intl.formatMessage({ id: 'PhaseTap' }),
                    ];
                    return list;
                case 4:
                    list = [
                        intl.formatMessage({ id: 'ID' }),
                        intl.formatMessage({ id: 'Name' }),
                        intl.formatMessage({ id: 'VoltageLevelIdSide1' }),
                        intl.formatMessage({ id: 'VoltageLevelIdSide2' }),
                        intl.formatMessage({ id: 'VoltageLevelIdSide3' }),
                        intl.formatMessage({ id: 'ActivePowerSide1' }),
                        intl.formatMessage({ id: 'ActivePowerSide2' }),
                        intl.formatMessage({ id: 'ActivePowerSide3' }),
                        intl.formatMessage({ id: 'ReactivePowerSide1' }),
                        intl.formatMessage({ id: 'ReactivePowerSide2' }),
                        intl.formatMessage({ id: 'ReactivePowerSide3' }),
                        intl.formatMessage({ id: 'RatioTap1' }),
                        intl.formatMessage({ id: 'RatioTap2' }),
                        intl.formatMessage({ id: 'RatioTap3' }),
                        intl.formatMessage({ id: 'PhaseTap1' }),
                        intl.formatMessage({ id: 'PhaseTap2' }),
                        intl.formatMessage({ id: 'PhaseTap3' }),
                    ];
                    return list;
                case 5:
                    list = [
                        intl.formatMessage({ id: 'ID' }),
                        intl.formatMessage({ id: 'Name' }),
                        intl.formatMessage({ id: 'VoltageLevelId' }),
                        intl.formatMessage({ id: 'ActivePower' }),
                        intl.formatMessage({ id: 'ReactivePower' }),
                        intl.formatMessage({ id: 'TargetP' }),
                    ];
                    return list;
                case 6:
                    list = [
                        intl.formatMessage({ id: 'ID' }),
                        intl.formatMessage({ id: 'Name' }),
                        intl.formatMessage({ id: 'LoadType' }),
                        intl.formatMessage({ id: 'VoltageLevelId' }),
                        intl.formatMessage({ id: 'ActivePower' }),
                        intl.formatMessage({ id: 'ReactivePower' }),
                        intl.formatMessage({ id: 'ConstantActivePower' }),
                        intl.formatMessage({ id: 'ConstantReactivePower' }),
                    ];
                    return list;
                case 7:
                    list = [
                        intl.formatMessage({ id: 'ID' }),
                        intl.formatMessage({ id: 'Name' }),
                        intl.formatMessage({ id: 'VoltageLevelId' }),
                        intl.formatMessage({ id: 'ReactivePower' }),
                        intl.formatMessage({ id: 'TargetV' }),
                        intl.formatMessage({ id: 'TargetDeadband' }),
                    ];
                    return list;
                case 8:
                    list = [
                        intl.formatMessage({ id: 'ID' }),
                        intl.formatMessage({ id: 'Name' }),
                        intl.formatMessage({ id: 'VoltageLevelId' }),
                        intl.formatMessage({ id: 'ActivePower' }),
                        intl.formatMessage({ id: 'ReactivePower' }),
                        intl.formatMessage({ id: 'VoltageSetpoint' }),
                        intl.formatMessage({ id: 'ReactivePowerSetpoint' }),
                    ];
                    return list;
                case 9:
                    list = [
                        intl.formatMessage({ id: 'ID' }),
                        intl.formatMessage({ id: 'Name' }),
                        intl.formatMessage({ id: 'VoltageLevelId' }),
                        intl.formatMessage({ id: 'ActivePower' }),
                        intl.formatMessage({ id: 'ReactivePower' }),
                        intl.formatMessage({ id: 'ConstantActivePower' }),
                        intl.formatMessage({ id: 'ConstantReactivePower' }),
                    ];
                    return list;
                case 10:
                    list = [
                        intl.formatMessage({ id: 'ID' }),
                        intl.formatMessage({ id: 'Name' }),
                        intl.formatMessage({ id: 'ConvertersMode' }),
                        intl.formatMessage({ id: 'ConverterStationId1' }),
                        intl.formatMessage({ id: 'ConverterStationId2' }),
                        intl.formatMessage({ id: 'R' }),
                        intl.formatMessage({ id: 'NominalV' }),
                        intl.formatMessage({ id: 'ActivePowerSetpoint' }),
                        intl.formatMessage({ id: 'MaxP' }),
                    ];
                    return list;
                case 11:
                    list = [
                        intl.formatMessage({ id: 'ID' }),
                        intl.formatMessage({ id: 'Name' }),
                        intl.formatMessage({ id: 'VoltageLevelId' }),
                        intl.formatMessage({ id: 'HvdcLineId' }),
                        intl.formatMessage({ id: 'ActivePower' }),
                        intl.formatMessage({ id: 'ReactivePower' }),
                        intl.formatMessage({ id: 'PowerFactor' }),
                        intl.formatMessage({ id: 'LossFactor' }),
                    ];
                    return list;
                case 12:
                    list = [
                        intl.formatMessage({ id: 'ID' }),
                        intl.formatMessage({ id: 'Name' }),
                        intl.formatMessage({ id: 'VoltageLevelId' }),
                        intl.formatMessage({ id: 'HvdcLineId' }),
                        intl.formatMessage({ id: 'ActivePower' }),
                        intl.formatMessage({ id: 'ReactivePower' }),
                        intl.formatMessage({ id: 'LossFactor' }),
                    ];
                    return list;
                case 13:
                    list = [
                        intl.formatMessage({ id: 'ID' }),
                        intl.formatMessage({ id: 'Name' }),
                        intl.formatMessage({ id: 'VoltageLevelId' }),
                        intl.formatMessage({ id: 'UcteXnodeCode' }),
                        intl.formatMessage({ id: 'ActivePower' }),
                        intl.formatMessage({ id: 'ReactivePower' }),
                        intl.formatMessage({ id: 'ConstantActivePower' }),
                        intl.formatMessage({ id: 'ConstantReactivePower' }),
                    ];
                    return list;
                default:
                    list = [
                        intl.formatMessage({ id: 'ID' }),
                        intl.formatMessage({ id: 'Name' }),
                        intl.formatMessage({ id: 'Country' }),
                    ];
                    return list;
            }
        }
    };
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
                                    onClick={() =>
                                        onClickCallFunction(tabIndex)
                                    }
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
