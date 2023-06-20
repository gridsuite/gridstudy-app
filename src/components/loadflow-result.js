/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Paper from '@mui/material/Paper';
import { useIntl } from 'react-intl';
import makeStyles from '@mui/styles/makeStyles';
import { TableCell } from '@mui/material';
import { Lens } from '@mui/icons-material';
import Grid from '@mui/material/Grid';
import { green, red } from '@mui/material/colors';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { fetchCurrentLimitViolations } from '../utils/rest-api';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { FormattedMessage } from 'react-intl/lib';
import { useSelector } from 'react-redux';
import { PARAM_LIMIT_REDUCTION } from '../utils/config-params';
import { CustomAGGrid } from './dialogs/custom-aggrid';
import { useTheme } from '@mui/styles';
const LoadFlowResult = ({ result, studyUuid, nodeUuid }) => {
    const useStyles = makeStyles((theme) => ({
        tablePaper: {
            flexGrow: 1,
        },
        cell: {
            display: 'flex',
            alignItems: 'center',
            textAlign: 'center',
            boxSizing: 'border-box',
            flex: 1,
            height: '48px',
            cursor: 'initial',
        },
        succeed: {
            color: green[500],
        },
        fail: {
            color: red[500],
        },
    }));

    const intl = useIntl();
    const theme = useTheme();
    const classes = useStyles();
    const { snackError } = useSnackMessage();
    const [tabIndex, setTabIndex] = useState(0);
    const [overloadedEquipments, setOverloadedEquipments] = useState(null);

    const limitReductionParam = useSelector((state) =>
        Number(state[PARAM_LIMIT_REDUCTION])
    );
    const loadflowNotif = useSelector((state) => state.loadflowNotif);

    useEffect(() => {
        const UNDEFINED_ACCEPTABLE_DURATION = Math.pow(2, 31) - 1;
        const PERMANENT_LIMIT_NAME = 'permanent';
        const convertDuration = (acceptableDuration) => {
            if (acceptableDuration === UNDEFINED_ACCEPTABLE_DURATION) {
                return undefined;
            }
            // if modulo 60 convert into minutes, otherwise we still use seconds (600 -> 10' and 700 -> 700")
            if (acceptableDuration % 60 === 0) {
                return acceptableDuration / 60 + "'";
            } else {
                return acceptableDuration + '"';
            }
        };
        const convertSide = (side) => {
            return side === 'ONE' ? 1 : side === 'TWO' ? 2 : undefined;
        };
        const convertLimitName = (limitName) => {
            return limitName === PERMANENT_LIMIT_NAME
                ? intl.formatMessage({ id: 'PermanentLimitName' })
                : limitName;
        };
        const makeData = (overloadedEquipment) => {
            return {
                overload: (
                    (overloadedEquipment.value / overloadedEquipment.limit) *
                    100
                ).toFixed(1),
                name: overloadedEquipment.subjectId,
                intensity: overloadedEquipment.value,
                acceptableDuration: convertDuration(
                    overloadedEquipment.acceptableDuration
                ),
                limit: overloadedEquipment.limit,
                limitName: convertLimitName(overloadedEquipment.limitName),
                side: convertSide(overloadedEquipment.side),
            };
        };
        if (result) {
            fetchCurrentLimitViolations(
                studyUuid,
                nodeUuid,
                limitReductionParam / 100.0
            )
                .then((overloadedEquipments) => {
                    const sortedLines = overloadedEquipments
                        .map((overloadedEquipment) =>
                            makeData(overloadedEquipment)
                        )
                        .sort((a, b) => b.overload - a.overload);
                    setOverloadedEquipments(sortedLines);
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'ErrFetchCurrentLimitViolationsMsg',
                    });
                });
        }
    }, [studyUuid, nodeUuid, intl, snackError, limitReductionParam, result]);

    const NumberRenderer = useCallback(
        (cellData) => {
            const value = cellData.data[cellData.colDef.field];
            return (
                <TableCell
                    component={'div'}
                    id={cellData.dataKey}
                    className={classes.cell}
                >
                    {!isNaN(value) ? value.toFixed(1) : ''}
                </TableCell>
            );
        },
        [classes.cell]
    );

    const StatusCellRender = useCallback(
        (cellData) => {
            const status = cellData.value;
            const color =
                status === 'CONVERGED' ? classes.succeed : classes.fail;
            return (
                <TableCell
                    component={'div'}
                    id={cellData.dataKey}
                    className={classes.cell}
                >
                    <Grid
                        container
                        direction="row"
                        spacing={4}
                        alignItems="center"
                    >
                        <Grid item xs={1}>
                            <Lens fontSize={'medium'} className={color} />
                        </Grid>
                        <Grid item xs={1}>
                            {status}
                        </Grid>
                    </Grid>
                </TableCell>
            );
        },
        [classes.cell, classes.fail, classes.succeed]
    );

    const loadFlowConstraintscolumns = useMemo(() => {
        return [
            {
                headerName: intl.formatMessage({ id: 'OverloadedEquipment' }),
                field: 'name',
                numeric: false,
            },
            {
                headerName: intl.formatMessage({ id: 'LimitName' }),
                field: 'limitName',
                numeric: false,
            },
            {
                headerName: intl.formatMessage({ id: 'LimitSide' }),
                field: 'side',
                numeric: true,
            },
            {
                headerName: intl.formatMessage({
                    id: 'LimitAcceptableDuration',
                }),
                field: 'acceptableDuration',
                numeric: false,
            },
            {
                headerName: intl.formatMessage({ id: 'Limit' }),
                field: 'limit',
                valueFormatter: (params) => params.value.toFixed(1),
            },
            {
                headerName: intl.formatMessage({ id: 'Intensity' }),
                field: 'intensity',
                numeric: true,
                valueFormatter: (params) => params.value.toFixed(1),
            },
            {
                headerName: intl.formatMessage({ id: 'EquipmentOverload' }),
                field: 'overload',
                numeric: true,
                valueFormatter: (params) => `${Math.round(params.value)} %`,
            },
        ];
    }, [intl]);

    const defaultColDef = useMemo(
        () => ({
            filter: true,
            sortable: true,
            resizable: true,
            lockPinned: true,
            wrapHeaderText: true,
            autoHeaderHeight: true,
        }),
        []
    );

    const loadFlowResultcolumns = useMemo(() => {
        return [
            {
                headerName: intl.formatMessage({
                    id: 'connectedComponentNum',
                }),
                field: 'connectedComponentNum',
            },
            {
                headerName: intl.formatMessage({
                    id: 'synchronousComponentNum',
                }),
                field: 'synchronousComponentNum',
            },
            {
                headerName: intl.formatMessage({ id: 'status' }),
                field: 'status',
                cellRenderer: StatusCellRender,
            },
            {
                headerName: intl.formatMessage({
                    id: 'iterationCount',
                }),
                field: 'iterationCount',
            },
            {
                headerName: intl.formatMessage({
                    id: 'slackBusId',
                }),
                field: 'slackBusId',
            },
            {
                headerName: intl.formatMessage({
                    id: 'slackBusActivePowerMismatch',
                }),
                field: 'slackBusActivePowerMismatch',
                cellRenderer: NumberRenderer,
            },
        ];
    }, [intl, NumberRenderer, StatusCellRender]);

    function renderLoadFlowResult() {
        return (
            <Paper className={classes.tablePaper}>
                <CustomAGGrid
                    rowData={result.componentResults}
                    columnDefs={loadFlowResultcolumns}
                    defaultColDef={defaultColDef}
                    enableCellTextSelection={true}
                    onGridReady={onGridReady}
                    getRowStyle={getRowStyle}
                />
            </Paper>
        );
    }
    const onGridReady = useCallback((params) => {
        if (params.api) {
            params.api.sizeColumnsToFit();
        }
    }, []);
    const getRowStyle = useCallback(
        (params) => {
            if (params?.data?.elementId) {
                return {
                    backgroundColor: theme.selectedRow.background,
                };
            }
        },
        [theme.selectedRow.background]
    );
    function renderLoadFlowConstraints() {
        return (
            <Paper className={classes.tablePaper}>
                <CustomAGGrid
                    rowData={overloadedEquipments}
                    defaultColDef={defaultColDef}
                    enableCellTextSelection={true}
                    columnDefs={loadFlowConstraintscolumns}
                    onGridReady={onGridReady}
                    getRowStyle={getRowStyle}
                />
            </Paper>
        );
    }

    function renderLoadFlowResultTabs() {
        return (
            <>
                <div className={classes.container}>
                    <div className={classes.tabs}>
                        <Tabs
                            value={tabIndex}
                            onChange={(event, newTabIndex) =>
                                setTabIndex(newTabIndex)
                            }
                        >
                            <Tab
                                label={
                                    <FormattedMessage
                                        id={'LoadFlowResultsConstraints'}
                                    />
                                }
                            />
                            <Tab
                                label={
                                    <FormattedMessage
                                        id={'LoadFlowResultsStatus'}
                                    />
                                }
                            />
                        </Tabs>
                    </div>
                </div>
                {tabIndex === 0 &&
                    overloadedEquipments &&
                    loadflowNotif &&
                    result &&
                    renderLoadFlowConstraints()}
                {tabIndex === 1 &&
                    loadflowNotif &&
                    result &&
                    renderLoadFlowResult()}
            </>
        );
    }

    return renderLoadFlowResultTabs();
};

LoadFlowResult.defaultProps = {
    result: null,
};

LoadFlowResult.propTypes = {
    result: PropTypes.object,
};

export default LoadFlowResult;
