/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import VirtualizedTable from '../../utils/virtualized-table';
import { useIntl } from 'react-intl';
import {
    Box,
    LinearProgress,
    Paper,
    TableCell,
    Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Lens } from '@mui/icons-material';
import React, { useMemo } from 'react';
import { green, red } from '@mui/material/colors';
import PropTypes from 'prop-types';
import { useNodeData } from '../../study-container';
import { fetchDynamicSimulationStatus } from '../../../services/study/dynamic-simulation';
import { dynamicSimulationResultInvalidations } from './utils/dynamic-simulation-result-utils';
import { useSelector } from 'react-redux';
import ComputingType from '../../computing-status/computing-type';
import {
    getNoRowsMessage,
    useIntlResultStatusMessages,
} from '../../utils/aggrid-rows-handler';

/* must be coherent to LoadFlowResult component */
const styles = {
    overlay: {
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
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

const DynamicSimulationResultSynthesis = ({ nodeUuid, studyUuid }) => {
    const intl = useIntl();

    const [result, isLoading] = useNodeData(
        studyUuid,
        nodeUuid,
        fetchDynamicSimulationStatus,
        dynamicSimulationResultInvalidations,
        null,
        (status) =>
            status && [
                {
                    status,
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

    // messages to show when no data
    const dynamicSimulationStatus = useSelector(
        (state) => state.computingStatus[ComputingType.DYNAMIC_SIMULATION]
    );
    const messages = useIntlResultStatusMessages(intl, true);
    const overlayMessage = useMemo(
        () =>
            getNoRowsMessage(
                messages,
                result,
                dynamicSimulationStatus,
                !isLoading
            ),
        [messages, result, dynamicSimulationStatus, isLoading]
    );

    return (
        <>
            {isLoading && (
                <Box sx={styles.loader}>
                    <LinearProgress />
                </Box>
            )}
            {overlayMessage ? (
                <Box sx={styles.overlay}>
                    <Typography variant={'body2'}>{overlayMessage}</Typography>
                </Box>
            ) : (
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

DynamicSimulationResultSynthesis.propTypes = {
    nodeUuid: PropTypes.string,
    studyUuid: PropTypes.string,
};

export default DynamicSimulationResultSynthesis;
