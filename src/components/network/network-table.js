/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
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
import makeStyles from '@material-ui/core/styles/makeStyles';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
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

    function commitChanges(rowData) {
        const changedTab = tabIndex;
        requestNetworkChange(
            props.userId,
            props.studyName,
            lineEdit[tabIndex].equipmentType,
            lineEdit[tabIndex].id,
            lineEdit[tabIndex].newValues
        ).then((result) => {
            Object.entries(result).forEach(([key, done]) => {
                if (!done) {
                    rowData[key] = lineEdit[tabIndex].oldValues[key];
                }
            });
            setLineEditAt(changedTab, {});
        });
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

    function registerChangeRequest(data, value) {
        // save original value, dont erase if exists
        if (!lineEdit[tabIndex].oldValues[data.dataKey])
            lineEdit[tabIndex].oldValues[data.dataKey] =
                data.rowData[data.dataKey];
        lineEdit[tabIndex].newValues[data.dataKey] = value;
        data.rowData[data.dataKey] = value;
    }

    function EditableCellRender(cellData, numeric, fractionDigit) {
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
                    registerChangeRequest(cellData, obj.target.value)
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
                rowCount={props.network.lines.length}
                rowGetter={({ index }) => props.network.lines[index]}
                filter={filter}
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
                rowCount={props.network.twoWindingsTransformers.length}
                rowGetter={({ index }) =>
                    props.network.twoWindingsTransformers[index]
                }
                filter={filter}
                columns={[
                    makeHeaderCell('TWO_WINDINGS_TRANSFORMER'),
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
                            EditableCellRender(cell, true, 0),
                    },
                    {
                        width: 150,
                        label: intl.formatMessage({ id: 'PhaseTap' }),
                        dataKey: 'phaseTapChangerPosition',
                        cellRenderer: (cell) =>
                            EditableCellRender(cell, true, 0),
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
                    makeHeaderCell('THREE_WINDINGS_TRANSFORMER'),
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
                            EditableCellRender(cell, true, 0),
                    },
                    {
                        width: 150,
                        label: intl.formatMessage({ id: 'RatioTap2' }),
                        dataKey: 'ratioTapChanger2Position',
                        cellRenderer: (cell) =>
                            EditableCellRender(cell, true, 0),
                    },
                    {
                        width: 150,
                        label: intl.formatMessage({ id: 'RatioTap3' }),
                        dataKey: 'ratioTapChanger3Position',
                        cellRenderer: (cell) =>
                            EditableCellRender(cell, true, 0),
                    },
                    {
                        width: 150,
                        label: intl.formatMessage({ id: 'PhaseTap1' }),
                        dataKey: 'phaseTapChanger1Position',
                        cellRenderer: (cell) =>
                            EditableCellRender(cell, true, 0),
                    },
                    {
                        width: 150,
                        label: intl.formatMessage({ id: 'PhaseTap2' }),
                        dataKey: 'phaseTapChanger2Position',
                        cellRenderer: (cell) =>
                            EditableCellRender(cell, true, 0),
                    },
                    {
                        width: 150,
                        label: intl.formatMessage({ id: 'PhaseTap3' }),
                        numeric: true,
                        cellRenderer: (cell) =>
                            EditableCellRender(cell, true, 0),
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
                    makeHeaderCell('GENERATOR'),
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
                            EditableCellRender(cell, true, 1),
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
            <AutoSizer>
                {({ width, height }) => (
                    <div style={{ width: width, height: height - 48 }}>
                        <Grid container justify={'space-between'}>
                            <Grid item>
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
                        {tabIndex === 0 && renderSubstationsTable()}
                        {tabIndex === 1 && renderVoltageLevelsTable()}
                        {tabIndex === 2 && renderLinesTable()}
                        {tabIndex === 3 && renderTwoWindingsTransformersTable()}
                        {tabIndex === 4 &&
                            renderThreeWindingsTransformersTable()}
                        {tabIndex === 5 && renderGeneratorsTable()}
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
