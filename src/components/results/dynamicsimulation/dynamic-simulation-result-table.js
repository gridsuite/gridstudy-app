/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import VirtualizedTable from '../../util/virtualized-table';
import { useIntl } from 'react-intl';
import { Paper, TableCell } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Lens } from '@mui/icons-material';
import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { green, red } from '@mui/material/colors';

/* must be coherent to LoadFlowResult component */
const useStyles = makeStyles((theme) => ({
    tablePaper: {
        flexGrow: 1,
        height: 100,
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

const DynamicSimulationResultTable = ({ result }) => {
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

    return (
        result && (
            <Paper className={classes.tablePaper}>
                {
                    <VirtualizedTable
                        rows={result}
                        sortable
                        columns={[
                            {
                                label: intl.formatMessage({
                                    id: 'status',
                                }),
                                dataKey: 'status',
                                cellRenderer: StatusCellRender,
                            },
                        ]}
                    />
                }
            </Paper>
        )
    );
};

export default DynamicSimulationResultTable;
