/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import VirtualizedTable from './util/virtualized-table';
import { useIntl } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import { TableCell } from '@material-ui/core';
import { Lens } from '@material-ui/icons';
import Grid from '@material-ui/core/Grid';
import { green, red } from '@material-ui/core/colors';

const LoadFlowResult = ({ result }) => {
    const useStyles = makeStyles((theme) => ({
        table: {
            height: '100%',
        },
        tablePaper: {
            display: 'inline-block',
            float: 'right',
            width: '100%',
            height: '100%',
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

    function StatusCellRender(cellData) {
        const status = cellData.rowData[cellData.dataKey];
        const color = status === 'CONVERGED' ? classes.succeed : classes.fail;
        return (
            <TableCell id={cellData.dataKey} className={classes.cell}>
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
            <TableCell id={cellData.dataKey} className={classes.cell}>
                {value.toFixed(1)}
            </TableCell>
        );
    }

    function renderLoadFlowResult() {
        return (
            <>
                <Paper className={classes.tablePaper}>
                    <VirtualizedTable
                        className={classes.table}
                        rowCount={result.componentResults.length}
                        rowGetter={({ index }) =>
                            result.componentResults[index]
                        }
                        columns={[
                            {
                                width: 200,
                                label: intl.formatMessage({
                                    id: 'componentNum',
                                }),
                                dataKey: 'componentNum',
                            },
                            {
                                width: 200,
                                label: intl.formatMessage({
                                    id: 'status',
                                }),
                                dataKey: 'status',
                                cellRenderer: StatusCellRender,
                            },
                            {
                                width: 200,
                                label: intl.formatMessage({
                                    id: 'iterationCount',
                                }),
                                dataKey: 'iterationCount',
                            },
                            {
                                width: 200,
                                label: intl.formatMessage({
                                    id: 'slackBusId',
                                }),
                                dataKey: 'slackBusId',
                            },
                            {
                                width: 400,
                                label: intl.formatMessage({
                                    id: 'slackBusActivePowerMismatch',
                                }),
                                dataKey: 'slackBusActivePowerMismatch',
                                cellRenderer: NumberRenderer,
                            },
                        ]}
                    />
                </Paper>
            </>
        );
    }

    return result && renderLoadFlowResult();
};

LoadFlowResult.defaultProps = {
    result: null,
};

LoadFlowResult.propTypes = {
    result: PropTypes.object,
};

export default LoadFlowResult;
