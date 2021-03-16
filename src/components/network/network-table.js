/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback } from 'react';
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
}));

const NetworkTable = (props) => {
    const classes = useStyles();

    const [tabIndex, setTabIndex] = React.useState(0);
    const [lineEdit, setLineEdit] = React.useState({});
    const [rowFilter, setRowFilter] = React.useState(undefined);
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

    function renderSubstationsTable() {
        return (
            <VirtualizedTable
                rowCount={props.network.substations.length}
                rowGetter={({ index }) => props.network.substations[index]}
                filter={filter}
                columns={[
                    {
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        label: intl.formatMessage({ id: 'Country' }),
                        dataKey: 'countryName',
                    },
                ]}
            />
        );
    }

    function renderVoltageLevelsTable() {
        const voltageLevels = props.network.getVoltageLevels();
        return (
            <VirtualizedTable
                rowCount={voltageLevels.length}
                rowGetter={({ index }) => voltageLevels[index]}
                filter={filter}
                columns={[
                    {
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        label: intl.formatMessage({ id: 'SubstationId' }),
                        dataKey: 'substationId',
                    },
                    {
                        label: intl.formatMessage({ id: 'NominalVoltage' }),
                        dataKey: 'nominalVoltage',
                        numeric: true,
                        fractionDigits: 0,
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
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        label: intl.formatMessage({
                            id: 'VoltageLevelIdSide1',
                        }),
                        dataKey: 'voltageLevelId1',
                    },
                    {
                        label: intl.formatMessage({
                            id: 'VoltageLevelIdSide2',
                        }),
                        dataKey: 'voltageLevelId2',
                    },
                    {
                        label: intl.formatMessage({ id: 'ActivePowerSide1' }),
                        dataKey: 'p1',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({ id: 'ActivePowerSide2' }),
                        dataKey: 'p2',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({ id: 'ReactivePowerSide1' }),
                        dataKey: 'q1',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({ id: 'ReactivePowerSide2' }),
                        dataKey: 'q2',
                        numeric: true,
                        fractionDigits: 1,
                    },
                ]}
            />
        );
    }

    function makeHeaderCell(equipmentType) {
        return {
            width: 60,
            label: '',
            dataKey: '',
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
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        label: intl.formatMessage({
                            id: 'VoltageLevelIdSide1',
                        }),
                        dataKey: 'voltageLevelId1',
                    },
                    {
                        label: intl.formatMessage({
                            id: 'VoltageLevelIdSide2',
                        }),
                        dataKey: 'voltageLevelId2',
                    },
                    {
                        label: intl.formatMessage({ id: 'ActivePowerSide1' }),
                        dataKey: 'p1',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({ id: 'ActivePowerSide2' }),
                        dataKey: 'p2',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({ id: 'ReactivePowerSide1' }),
                        dataKey: 'q1',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({ id: 'ReactivePowerSide2' }),
                        dataKey: 'q2',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({ id: 'RatioTap' }),
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
                        label: intl.formatMessage({ id: 'PhaseTap' }),
                        dataKey: 'phaseTapChangerPosition',
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
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        label: intl.formatMessage({
                            id: 'VoltageLevelIdSide1',
                        }),
                        dataKey: 'voltageLevelId1',
                    },
                    {
                        label: intl.formatMessage({
                            id: 'VoltageLevelIdSide2',
                        }),
                        dataKey: 'voltageLevelId2',
                    },
                    {
                        label: intl.formatMessage({
                            id: 'VoltageLevelIdSide3',
                        }),
                        dataKey: 'voltageLevelId3',
                    },
                    {
                        label: intl.formatMessage({ id: 'ActivePowerSide1' }),
                        dataKey: 'p1',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({ id: 'ActivePowerSide2' }),
                        dataKey: 'p2',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({ id: 'ActivePowerSide3' }),
                        dataKey: 'p3',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({ id: 'ReactivePowerSide1' }),
                        dataKey: 'q1',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({ id: 'ReactivePowerSide2' }),
                        dataKey: 'q2',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({ id: 'ReactivePowerSide3' }),
                        dataKey: 'q3',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({ id: 'RatioTap1' }),
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
                        label: intl.formatMessage({ id: 'RatioTap2' }),
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
                        label: intl.formatMessage({ id: 'RatioTap3' }),
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
                        label: intl.formatMessage({ id: 'PhaseTap1' }),
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
                        label: intl.formatMessage({ id: 'PhaseTap2' }),
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
                        label: intl.formatMessage({ id: 'PhaseTap3' }),
                        numeric: true,
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
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        label: intl.formatMessage({
                            id: 'VoltageLevelId',
                        }),
                        dataKey: 'voltageLevelId',
                    },
                    {
                        label: intl.formatMessage({ id: 'ActivePower' }),
                        dataKey: 'p',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({ id: 'ReactivePower' }),
                        dataKey: 'q',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({ id: 'TargetP' }),
                        dataKey: 'targetP',
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
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        label: intl.formatMessage({ id: 'LoadType' }),
                        dataKey: 'type',
                    },
                    {
                        label: intl.formatMessage({
                            id: 'VoltageLevelId',
                        }),
                        dataKey: 'voltageLevelId',
                    },
                    {
                        label: intl.formatMessage({ id: 'ActivePower' }),
                        dataKey: 'p',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({ id: 'ReactivePower' }),
                        dataKey: 'q',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({
                            id: 'ConstantActivePower',
                        }),
                        dataKey: 'p0',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({
                            id: 'ConstantReactivePower',
                        }),
                        dataKey: 'q0',
                        numeric: true,
                        fractionDigits: 1,
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
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        label: intl.formatMessage({
                            id: 'VoltageLevelId',
                        }),
                        dataKey: 'voltageLevelId',
                    },
                    {
                        label: intl.formatMessage({ id: 'ActivePower' }),
                        dataKey: 'p',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({ id: 'ReactivePower' }),
                        dataKey: 'q',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({
                            id: 'ConstantActivePower',
                        }),
                        dataKey: 'p0',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({
                            id: 'ConstantReactivePower',
                        }),
                        dataKey: 'q0',
                        numeric: true,
                        fractionDigits: 1,
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
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        label: intl.formatMessage({
                            id: 'VoltageLevelId',
                        }),
                        dataKey: 'voltageLevelId',
                    },
                    {
                        label: intl.formatMessage({ id: 'UcteXnodeCode' }),
                        dataKey: 'ucteXnodeCode',
                    },
                    {
                        label: intl.formatMessage({ id: 'ActivePower' }),
                        dataKey: 'p',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({ id: 'ReactivePower' }),
                        dataKey: 'q',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({
                            id: 'ConstantActivePower',
                        }),
                        dataKey: 'p0',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({
                            id: 'ConstantReactivePower',
                        }),
                        dataKey: 'q0',
                        numeric: true,
                        fractionDigits: 1,
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
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        label: intl.formatMessage({ id: 'ConvertersMode' }),
                        dataKey: 'convertersMode',
                    },
                    {
                        label: intl.formatMessage({
                            id: 'ConverterStationId1',
                        }),
                        dataKey: 'converterStationId1',
                    },
                    {
                        label: intl.formatMessage({
                            id: 'ConverterStationId2',
                        }),
                        dataKey: 'converterStationId2',
                    },
                    {
                        label: intl.formatMessage({ id: 'R' }),
                        dataKey: 'r',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({ id: 'NominalV' }),
                        dataKey: 'nominalV',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({
                            id: 'ActivePowerSetpoint',
                        }),
                        dataKey: 'activePowerSetpoint',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({ id: 'MaxP' }),
                        dataKey: 'maxP',
                        numeric: true,
                        fractionDigits: 1,
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
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        label: intl.formatMessage({
                            id: 'VoltageLevelId',
                        }),
                        dataKey: 'voltageLevelId',
                    },
                    {
                        label: intl.formatMessage({ id: 'ReactivePower' }),
                        dataKey: 'q',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({
                            id: 'TargetV',
                        }),
                        dataKey: 'targetV',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({
                            id: 'TargetDeadband',
                        }),
                        dataKey: 'targetDeadband',
                        numeric: true,
                        fractionDigits: 1,
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
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        label: intl.formatMessage({
                            id: 'VoltageLevelId',
                        }),
                        dataKey: 'voltageLevelId',
                    },
                    {
                        label: intl.formatMessage({ id: 'ActivePower' }),
                        dataKey: 'p',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({ id: 'ReactivePower' }),
                        dataKey: 'q',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({
                            id: 'VoltageSetpoint',
                        }),
                        dataKey: 'voltageSetpoint',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({
                            id: 'ReactivePowerSetpoint',
                        }),
                        dataKey: 'reactivePowerSetpoint',
                        numeric: true,
                        fractionDigits: 1,
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
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        label: intl.formatMessage({
                            id: 'VoltageLevelId',
                        }),
                        dataKey: 'voltageLevelId',
                    },
                    {
                        label: intl.formatMessage({
                            id: 'HvdcLineId',
                        }),
                        dataKey: 'hvdcLineId',
                    },
                    {
                        label: intl.formatMessage({ id: 'ActivePower' }),
                        dataKey: 'p',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({ id: 'ReactivePower' }),
                        dataKey: 'q',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({
                            id: 'PowerFactor',
                        }),
                        dataKey: 'powerFactor',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({
                            id: 'LossFactor',
                        }),
                        dataKey: 'lossFactor',
                        numeric: true,
                        fractionDigits: 1,
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
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        label: intl.formatMessage({
                            id: 'VoltageLevelId',
                        }),
                        dataKey: 'voltageLevelId',
                    },
                    {
                        label: intl.formatMessage({
                            id: 'HvdcLineId',
                        }),
                        dataKey: 'hvdcLineId',
                    },
                    {
                        label: intl.formatMessage({ id: 'ActivePower' }),
                        dataKey: 'p',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({ id: 'ReactivePower' }),
                        dataKey: 'q',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        label: intl.formatMessage({
                            id: 'LossFactor',
                        }),
                        dataKey: 'lossFactor',
                        numeric: true,
                        fractionDigits: 1,
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
                </Grid>
                <div
                    className={classes.table}
                    style={{
                        flexGrow: 1,
                        overflow: 'auto',
                    }}
                >
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
