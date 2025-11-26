/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Grid } from '@mui/material';
import { RunningStatus } from '../utils/running-status';
import { IntlShape } from 'react-intl';
import { generateRows, styles } from './generic-equipment-popover-utils';

interface LimitsTableProps {
    equipmentInfos: any;
    intl: IntlShape;
    loadFlowStatus?: RunningStatus;
}

export const LimitsTable: React.FC<LimitsTableProps> = ({ equipmentInfos, intl, loadFlowStatus }) => {
    return (
        <Grid item sx={styles.grid}>
            <TableContainer sx={styles.table}>
                <Table size="small" sx={styles.layout}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ ...styles.cell, fontWeight: 'bold' }}>
                                {intl.formatMessage({ id: 'Limit_name' })}
                            </TableCell>
                            <TableCell sx={{ ...styles.cell, fontWeight: 'bold' }}>
                                {intl.formatMessage({ id: 'LimitLabel' })}
                            </TableCell>
                            <TableCell sx={{ ...styles.cell, fontWeight: 'bold' }}>
                                {intl.formatMessage({ id: 'Loading' })}
                            </TableCell>
                            <TableCell sx={{ ...styles.cell, fontWeight: 'bold' }}>
                                {intl.formatMessage({ id: 'Side' })}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {generateRows(equipmentInfos, equipmentInfos?.currentLimits1, '1', intl, loadFlowStatus)}
                        {generateRows(equipmentInfos, equipmentInfos?.currentLimits2, '2', intl, loadFlowStatus)}
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    );
};
