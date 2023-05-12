/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Paper from '@mui/material/Paper';
import VirtualizedTable from './utils/virtualized-table';
import { useIntl } from 'react-intl';
import makeStyles from '@mui/styles/makeStyles';
import { TableCell } from '@mui/material';
import { Lens } from '@mui/icons-material';
import Grid from '@mui/material/Grid';
import { green, red } from '@mui/material/colors';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { fetchOverloadedLines } from '../utils/rest-api';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { FormattedMessage } from 'react-intl/lib';
import { useSelector } from 'react-redux';
import { PARAM_LINE_FLOW_ALERT_THRESHOLD } from '../utils/config-params';

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
    const classes = useStyles();
    const { snackError } = useSnackMessage();
    const [tabIndex, setTabIndex] = useState(0);
    const [overloadedLines, setOverloadedLines] = useState(null);

    const lineFlowAlertThreshold = useSelector((state) =>
        Number(state[PARAM_LINE_FLOW_ALERT_THRESHOLD])
    );

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
        const makeData = (overloadedLine) => {
            return {
                overload: (
                    (overloadedLine.value / overloadedLine.limit) *
                    100
                ).toFixed(1),
                name: overloadedLine.subjectId,
                intensity: overloadedLine.value,
                acceptableDuration: convertDuration(
                    overloadedLine.acceptableDuration
                ),
                limit: overloadedLine.limit,
                limitName: convertLimitName(overloadedLine.limitName),
                side: convertSide(overloadedLine.side),
            };
        };
        fetchOverloadedLines(
            studyUuid,
            nodeUuid,
            lineFlowAlertThreshold / 100.0
        )
            .then((overloadedLines) => {
                const sortedLines = overloadedLines
                    .map((overloadedLine) => makeData(overloadedLine))
                    .sort((a, b) => b.overload - a.overload);
                setOverloadedLines(sortedLines);
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'ErrFetchOverloadedLinesMsg',
                });
            });
    }, [studyUuid, nodeUuid, lineFlowAlertThreshold, intl, snackError]);

    function StatusCellRender(cellData) {
        const status = cellData.rowData[cellData.dataKey];
        const color = status === 'CONVERGED' ? classes.succeed : classes.fail;
        return (
            <TableCell
                component={'div'}
                id={cellData.dataKey}
                className={classes.cell}
            >
                <Grid container direction="row" spacing={4} alignItems="center">
                    <Grid item xs={1}>
                        <Lens fontSize={'medium'} className={color} />
                    </Grid>
                    <Grid item xs={1}>
                        {status}
                    </Grid>
                </Grid>
            </TableCell>
        );
    }

    function NumberRenderer(cellData) {
        const value = cellData.rowData[cellData.dataKey];
        return (
            <TableCell
                component={'div'}
                id={cellData.dataKey}
                className={classes.cell}
            >
                {!isNaN(value) ? value.toFixed(1) : ''}
            </TableCell>
        );
    }

    function renderLoadFlowResult() {
        return (
            <Paper className={classes.tablePaper}>
                <VirtualizedTable
                    rows={result.componentResults}
                    sortable={true}
                    columns={[
                        {
                            label: intl.formatMessage({
                                id: 'connectedComponentNum',
                            }),
                            dataKey: 'connectedComponentNum',
                        },
                        {
                            label: intl.formatMessage({
                                id: 'synchronousComponentNum',
                            }),
                            dataKey: 'synchronousComponentNum',
                        },
                        {
                            label: intl.formatMessage({
                                id: 'status',
                            }),
                            dataKey: 'status',
                            cellRenderer: StatusCellRender,
                        },
                        {
                            label: intl.formatMessage({
                                id: 'iterationCount',
                            }),
                            dataKey: 'iterationCount',
                        },
                        {
                            label: intl.formatMessage({
                                id: 'slackBusId',
                            }),
                            dataKey: 'slackBusId',
                        },
                        {
                            label: intl.formatMessage({
                                id: 'slackBusActivePowerMismatch',
                            }),
                            dataKey: 'slackBusActivePowerMismatch',
                            cellRenderer: NumberRenderer,
                        },
                    ]}
                />
            </Paper>
        );
    }

    function renderLoadFlowConstraints() {
        return (
            <Paper className={classes.tablePaper}>
                <VirtualizedTable
                    rows={overloadedLines}
                    sortable={true}
                    columns={[
                        {
                            label: intl.formatMessage({ id: 'OverloadedLine' }),
                            dataKey: 'name',
                            numeric: false,
                        },
                        {
                            label: intl.formatMessage({ id: 'LimitName' }),
                            dataKey: 'limitName',
                            numeric: false,
                        },
                        {
                            label: intl.formatMessage({ id: 'LimitSide' }),
                            dataKey: 'side',
                            numeric: true,
                        },
                        {
                            label: intl.formatMessage({
                                id: 'LimitAcceptableDuration',
                            }),
                            dataKey: 'acceptableDuration',
                            numeric: false,
                        },
                        {
                            label: intl.formatMessage({ id: 'Limit' }),
                            dataKey: 'limit',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            label: intl.formatMessage({ id: 'Intensity' }),
                            dataKey: 'intensity',
                            numeric: true,
                            fractionDigits: 1,
                        },
                        {
                            label: intl.formatMessage({ id: 'LineLoad' }),
                            dataKey: 'overload',
                            numeric: true,
                            fractionDigits: 0,
                            unit: '%',
                        },
                    ]}
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
                    overloadedLines &&
                    renderLoadFlowConstraints()}
                {tabIndex === 1 && renderLoadFlowResult()}
            </>
        );
    }

    return result && renderLoadFlowResultTabs();
};

LoadFlowResult.defaultProps = {
    result: null,
};

LoadFlowResult.propTypes = {
    result: PropTypes.object,
};

export default LoadFlowResult;
