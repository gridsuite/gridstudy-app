/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Network from './network';
import VirtualizedTable from '../util/virtualized-table';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { useIntl } from 'react-intl';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
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
}));

const NetworkTable = (props) => {
    const classes = useStyles();

    const [tabIndex, setTabIndex] = React.useState(0);
    const [lineEdit, setLineEdit] = React.useState({});
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

    function defaultCellRender(cellData) {
        return (
            <TableCell
                component="div"
                variant="body"
                style={{ height: rowHeight, width: cellData.width }}
                className={classes.cell}
                align="right"
            >
                <Grid container direction="column">
                    <Grid item xs={1}/>
                    <Grid item xs={1}>
                        {cellData.rowData[cellData.dataKey]}
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

    function EditableCellRender(cellData) {
        return !isLineOnEditMode(cellData.rowIndex) ||
            cellData.rowData[cellData.dataKey] === undefined ? (
            defaultCellRender(cellData)
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
                defaultValue={cellData.rowData[cellData.dataKey]}
            />
        );
    }

    function renderSubstationsTable() {
        return (
            <VirtualizedTable
                rowCount={props.network.substations.length}
                rowGetter={({ index }) => props.network.substations[index]}
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
                columns={[
                    makeHeaderCell('TWO_WINDING_TRANSFORMER'),
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
                        numeric: true,
                        cellRenderer: EditableCellRender,
                        fractionDigits: 0,
                    },
                    {
                        width: 150,
                        label: intl.formatMessage({ id: 'PhaseTap' }),
                        dataKey: 'phaseTapChangerPosition',
                        numeric: true,
                        cellRenderer: EditableCellRender,
                        fractionDigits: 0,
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
                columns={[
                    makeHeaderCell('THREE_WINDING_TRANSFORMER'),
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
                        numeric: true,
                        cellRenderer: EditableCellRender,
                        fractionDigits: 0,
                    },
                    {
                        width: 150,
                        label: intl.formatMessage({ id: 'RatioTap2' }),
                        dataKey: 'ratioTapChanger2Position',
                        numeric: true,
                        cellRenderer: EditableCellRender,
                        fractionDigits: 0,
                    },
                    {
                        width: 150,
                        label: intl.formatMessage({ id: 'RatioTap3' }),
                        dataKey: 'ratioTapChanger3Position',
                        numeric: true,
                        cellRenderer: EditableCellRender,
                        fractionDigits: 0,
                    },
                    {
                        width: 150,
                        label: intl.formatMessage({ id: 'PhaseTap1' }),
                        dataKey: 'phaseTapChanger1Position',
                        numeric: true,
                        cellRenderer: EditableCellRender,
                        fractionDigits: 0,
                    },
                    {
                        width: 150,
                        label: intl.formatMessage({ id: 'PhaseTap2' }),
                        dataKey: 'phaseTapChanger2Position',
                        numeric: true,
                        cellRenderer: EditableCellRender,
                        fractionDigits: 0,
                    },
                    {
                        width: 150,
                        label: intl.formatMessage({ id: 'PhaseTap3' }),
                        dataKey: 'phaseTapChanger3Position',
                        numeric: true,
                        cellRenderer: EditableCellRender,
                        fractionDigits: 0,
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
                        numeric: true,
                        cellRenderer: EditableCellRender,
                        fractionDigits: 1,
                    },
                ]}
            />
        );
    }

    return (
        props.network && (
            <AutoSizer>
                {({ width, height }) => (
                    <div style={{ width: width, height: height - 48 }}>
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
                                    label={intl.formatMessage({
                                        id: tableName,
                                    })}
                                />
                            ))}
                        </Tabs>
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
