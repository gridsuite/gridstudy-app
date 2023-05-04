/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Paper from '@mui/material/Paper';
import VirtualizedTable from './utils/virtualized-table';
import { useIntl } from 'react-intl';
import makeStyles from '@mui/styles/makeStyles';
import { TableCell } from '@mui/material';
import { Lens } from '@mui/icons-material';
import Grid from '@mui/material/Grid';
import { green, red } from '@mui/material/colors';

const LoadFlowResult = ({ result }) => {
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

    return result && renderLoadFlowResult();
};

LoadFlowResult.defaultProps = {
    result: null,
};

LoadFlowResult.propTypes = {
    result: PropTypes.object,
};

export default LoadFlowResult;
