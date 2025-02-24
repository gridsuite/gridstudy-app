/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { green, red } from '@mui/material/colors';
import { Box } from '@mui/material';
import { Lens } from '@mui/icons-material';
import { ICellRendererParams } from 'ag-grid-community';

const styles = {
    cell: {
        display: 'flex',
        alignItems: 'center',
        textAlign: 'center',
        boxSizing: 'border-box',
        flex: 1,
        cursor: 'initial',
    },
    succeed: {
        color: green[500],
    },
    fail: {
        color: red[500],
    },
};

export const StatusCellRender = (cellData: ICellRendererParams) => {
    const status = cellData.value;
    const color = status === 'CONVERGED' || status === 'SUCCEED' ? styles.succeed : styles.fail;
    return (
        <Box sx={styles.cell}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Lens fontSize={'medium'} sx={color} />
                <span style={{ marginLeft: '4px' }}>{status}</span>
            </div>
        </Box>
    );
};

export const NumberCellRenderer = (cellData: ICellRendererParams) => {
    const value = cellData.value;
    return <Box sx={styles.cell}>{isNaN(value) ? '' : value.toFixed(2)}</Box>;
};
