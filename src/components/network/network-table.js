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
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
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
import LoaderWithOverlay from '../loader-with-overlay';

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
        height: '48px',
        paddingRight: '10px',
        alignItems: 'center',
        minWidth: '300px',
    },
    table: {
        marginTop: '20px',
    },
}));

const NetworkTable = (props) => {
    const classes = useStyles();

    const [tabIndex, setTabIndex] = React.useState(0);
    const [lineEdit, setLineEdit] = React.useState({});
    const [rowFilter, setRowFilter] = React.useState(undefined);

    const [dataFetched, setDataFetched] = React.useState({});
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
                rowCount={props.network.substations.length()}
                rowGetter={({ index }) =>
                    props.network.substations.get()[index]
                }
                filter={filter}
                className={classes.table}
                columns={[
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        width: 200,
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
                className={classes.table}
                columns={[
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'SubstationId' }),
                        dataKey: 'substationId',
                    },
                    {
                        width: 200,
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
                rowCount={props.network.lines.length()}
                rowGetter={({ index }) => props.network.lines.get()[index]}
                filter={filter}
                className={classes.table}
                columns={[
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelIdSide1',
                        }),
                        dataKey: 'voltageLevelId1',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelIdSide2',
                        }),
                        dataKey: 'voltageLevelId2',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePowerSide1' }),
                        dataKey: 'p1',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePowerSide2' }),
                        dataKey: 'p2',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePowerSide1' }),
                        dataKey: 'q1',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
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
            width: 80,
            label: '',
            dataKey: '',
            cellRenderer: (cellData) =>
                createEditableRow(cellData, equipmentType),
        };
    }

    function renderTwoWindingsTransformersTable() {
        return (
            <VirtualizedTable
                rowCount={props.network.twoWindingsTransformers.length()}
                rowGetter={({ index }) =>
                    props.network.twoWindingsTransformers.get()[index]
                }
                filter={filter}
                className={classes.table}
                columns={[
                    makeHeaderCell('TwoWindingsTransformer'),
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelIdSide1',
                        }),
                        dataKey: 'voltageLevelId1',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelIdSide2',
                        }),
                        dataKey: 'voltageLevelId2',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePowerSide1' }),
                        dataKey: 'p1',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePowerSide2' }),
                        dataKey: 'p2',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePowerSide1' }),
                        dataKey: 'q1',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePowerSide2' }),
                        dataKey: 'q2',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 150,
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
                        width: 150,
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
                rowCount={props.network.threeWindingsTransformers.length()}
                rowGetter={({ index }) =>
                    props.network.threeWindingsTransformers.get()[index]
                }
                filter={filter}
                className={classes.table}
                columns={[
                    makeHeaderCell('ThreeWindingsTransformer'),
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelIdSide1',
                        }),
                        dataKey: 'voltageLevelId1',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelIdSide2',
                        }),
                        dataKey: 'voltageLevelId2',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelIdSide3',
                        }),
                        dataKey: 'voltageLevelId3',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePowerSide1' }),
                        dataKey: 'p1',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePowerSide2' }),
                        dataKey: 'p2',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePowerSide3' }),
                        dataKey: 'p3',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePowerSide1' }),
                        dataKey: 'q1',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePowerSide2' }),
                        dataKey: 'q2',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePowerSide3' }),
                        dataKey: 'q3',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 150,
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
                        width: 150,
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
                        width: 150,
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
                        width: 150,
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
                        width: 150,
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
                        width: 150,
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
                rowCount={props.network.generators.length()}
                rowGetter={({ index }) => props.network.generators.get()[index]}
                filter={filter}
                className={classes.table}
                columns={[
                    makeHeaderCell('Generator'),
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelId',
                        }),
                        dataKey: 'voltageLevelId',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePower' }),
                        dataKey: 'p',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePower' }),
                        dataKey: 'q',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
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
                rowCount={props.network.loads.length()}
                rowGetter={({ index }) => props.network.loads.get()[index]}
                filter={filter}
                className={classes.table}
                columns={[
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'LoadType' }),
                        dataKey: 'type',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelId',
                        }),
                        dataKey: 'voltageLevelId',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePower' }),
                        dataKey: 'p',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePower' }),
                        dataKey: 'q',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({
                            id: 'ConstantActivePower',
                        }),
                        dataKey: 'p0',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
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
                rowCount={props.network.batteries.length()}
                rowGetter={({ index }) => props.network.batteries.get()[index]}
                filter={filter}
                className={classes.table}
                columns={[
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelId',
                        }),
                        dataKey: 'voltageLevelId',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePower' }),
                        dataKey: 'p',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePower' }),
                        dataKey: 'q',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({
                            id: 'ConstantActivePower',
                        }),
                        dataKey: 'p0',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
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
                rowCount={props.network.danglingLines.length()}
                rowGetter={({ index }) =>
                    props.network.danglingLines.get()[index]
                }
                filter={filter}
                className={classes.table}
                columns={[
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelId',
                        }),
                        dataKey: 'voltageLevelId',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'UcteXnodeCode' }),
                        dataKey: 'ucteXnodeCode',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePower' }),
                        dataKey: 'p',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePower' }),
                        dataKey: 'q',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({
                            id: 'ConstantActivePower',
                        }),
                        dataKey: 'p0',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
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
                rowCount={props.network.hvdcLines.length()}
                rowGetter={({ index }) => props.network.hvdcLines.get()[index]}
                filter={filter}
                className={classes.table}
                columns={[
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ConvertersMode' }),
                        dataKey: 'convertersMode',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'ConverterStationId1',
                        }),
                        dataKey: 'converterStationId1',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'ConverterStationId2',
                        }),
                        dataKey: 'converterStationId2',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'R' }),
                        dataKey: 'r',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'NominalV' }),
                        dataKey: 'nominalV',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 300,
                        label: intl.formatMessage({
                            id: 'ActivePowerSetpoint',
                        }),
                        dataKey: 'activePowerSetpoint',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
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
                rowCount={props.network.shuntCompensators.length()}
                rowGetter={({ index }) =>
                    props.network.shuntCompensators.get()[index]
                }
                filter={filter}
                className={classes.table}
                columns={[
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelId',
                        }),
                        dataKey: 'voltageLevelId',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePower' }),
                        dataKey: 'q',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({
                            id: 'TargetV',
                        }),
                        dataKey: 'targetV',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
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
                rowCount={props.network.staticVarCompensators.length()}
                rowGetter={({ index }) =>
                    props.network.staticVarCompensators.get()[index]
                }
                filter={filter}
                className={classes.table}
                columns={[
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelId',
                        }),
                        dataKey: 'voltageLevelId',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePower' }),
                        dataKey: 'p',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePower' }),
                        dataKey: 'q',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({
                            id: 'VoltageSetpoint',
                        }),
                        dataKey: 'voltageSetpoint',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
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
                rowCount={props.network.lccConverterStations.length()}
                rowGetter={({ index }) =>
                    props.network.lccConverterStations.get()[index]
                }
                filter={filter}
                className={classes.table}
                columns={[
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelId',
                        }),
                        dataKey: 'voltageLevelId',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'HvdcLineId',
                        }),
                        dataKey: 'hvdcLineId',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePower' }),
                        dataKey: 'p',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePower' }),
                        dataKey: 'q',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({
                            id: 'PowerFactor',
                        }),
                        dataKey: 'powerFactor',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
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
                rowCount={props.network.vscConverterStations.length()}
                rowGetter={({ index }) =>
                    props.network.vscConverterStations.get()[index]
                }
                filter={filter}
                className={classes.table}
                columns={[
                    {
                        width: 400,
                        label: intl.formatMessage({ id: 'ID' }),
                        dataKey: 'id',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'Name' }),
                        dataKey: 'name',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'VoltageLevelId',
                        }),
                        dataKey: 'voltageLevelId',
                    },
                    {
                        width: 400,
                        label: intl.formatMessage({
                            id: 'HvdcLineId',
                        }),
                        dataKey: 'hvdcLineId',
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ActivePower' }),
                        dataKey: 'p',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
                        label: intl.formatMessage({ id: 'ReactivePower' }),
                        dataKey: 'q',
                        numeric: true,
                        fractionDigits: 1,
                    },
                    {
                        width: 200,
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

    function TabHolder(index, resource, renderer) {
        if (tabIndex !== index) return;
        if (resource.values === undefined) {
            if (dataFetched[index])
                setDataFetched({ ...dataFetched, ...{ [index]: false } });
            resource.get(() =>
                setDataFetched({ ...dataFetched, ...{ [index]: true } })
            );
            return (
                <LoaderWithOverlay
                    color="inherit"
                    loaderSize={70}
                    isFixed={true}
                    loadingMessageText={'Loading'}
                />
            );
        }
        return renderer();
    }

    return (
        props.network && (
            <AutoSizer>
                {({ width, height }) => (
                    <div style={{ width: width, height: height - 48 }}>
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
                                className={classes.searchSection}
                            >
                                <TextField
                                    className={classes.textField}
                                    size="medium"
                                    placeholder={
                                        intl.formatMessage({ id: 'filter' }) +
                                        '...'
                                    }
                                    onChange={setFilter}
                                    variant="standard"
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
                        {/*This render is fast, rerender full dom everytime*/}
                        {TabHolder(
                            0,
                            props.network.substations,
                            renderSubstationsTable
                        )}
                        {TabHolder(
                            1,
                            props.network.substations,
                            renderVoltageLevelsTable
                        )}
                        {TabHolder(2, props.network.lines, renderLinesTable)}
                        {TabHolder(
                            3,
                            props.network.twoWindingsTransformers,
                            renderTwoWindingsTransformersTable
                        )}
                        {TabHolder(
                            4,
                            props.network.threeWindingsTransformers,
                            renderThreeWindingsTransformersTable
                        )}
                        {TabHolder(
                            5,
                            props.network.generators,
                            renderGeneratorsTable
                        )}
                        {TabHolder(6, props.network.loads, renderLoadsTable)}
                        {TabHolder(
                            7,
                            props.network.shuntCompensators,
                            renderShuntCompensatorsTable
                        )}
                        {TabHolder(
                            8,
                            props.network.staticVarCompensators,
                            renderStaticVarCompensatorsTable
                        )}
                        {TabHolder(
                            9,
                            props.network.batteries,
                            renderBatteriesTable
                        )}
                        {TabHolder(
                            10,
                            props.network.hvdcLines,
                            renderHvdcLinesTable
                        )}
                        {TabHolder(
                            11,
                            props.network.lccConverterStations,
                            renderLccConverterStationsTable
                        )}
                        {TabHolder(
                            12,
                            props.network.vscConverterStations,
                            renderVscConverterStationsTable
                        )}
                        {TabHolder(
                            13,
                            props.network.danglingLines,
                            renderDanglingLinesTable
                        )}
                    </div>
                )}
            </AutoSizer>
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
