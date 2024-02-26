/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import VirtualizedTable from '../../utils/virtualized-table';
import { useIntl } from 'react-intl';
import { Box, LinearProgress, Paper, TableCell } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Lens } from '@mui/icons-material';
import React from 'react';
import { green, red } from '@mui/material/colors';
import PropTypes from 'prop-types';
import { useNodeData } from '../../study-container';
import { fetchDynamicSimulationStatus } from '../../../services/study/dynamic-simulation';
import { dynamicSimulationResultInvalidations } from './dynamic-simulation-result.type';

/* must be coherent to LoadFlowResult component */
const styles = {
    tablePaper: {
        flexGrow: 1,
        height: '100px',
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
    loader: {
        height: '4px',
    },
};

const DynamicSimulationResultTable = ({ nodeUuid, studyUuid }) => {
    const intl = useIntl();

    const [result, isLoading] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchDynamicSimulationStatus,
        dynamicSimulationResultInvalidations,
        null,
        (status) => [
            {
                status: status,
            },
        ]
    );

    function StatusCellRender(cellData) {
        const status = cellData.rowData[cellData.dataKey];
        const color = status === 'CONVERGED' ? styles.succeed : styles.fail;
        return (
            <TableCell component={'div'} id={cellData.dataKey} sx={styles.cell}>
                <Grid container direction="row" spacing={4} alignItems="center">
                    <Grid item xs={1}>
                        <Lens fontSize={'medium'} sx={color} />
                    </Grid>
                    <Grid item xs={1}>
                        {status}
                    </Grid>
                </Grid>
            </TableCell>
        );
    }

    return (
        <>
            <Box sx={styles.loader}>{isLoading && <LinearProgress />}</Box>
            {result && (
                <Paper sx={styles.tablePaper}>
                    {
                        <VirtualizedTable
                            rows={result}
                            sortable
                            disableHeader={true}
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
            )}
        </>
    );
};

DynamicSimulationResultTable.propTypes = {
    nodeUuid: PropTypes.string,
    studyUuid: PropTypes.string,
};

export default DynamicSimulationResultTable;
