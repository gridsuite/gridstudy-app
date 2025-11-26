/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Grid } from '@mui/material';
import { mergeSx } from '@gridsuite/commons-ui';
import { RunningStatus } from '../utils/running-status';
import { IntlShape } from 'react-intl';
import { formatValue, styles } from './generic-equipment-popover-utils';

interface CurrentTableProps {
    equipmentInfos: any;
    intl: IntlShape;
    loadFlowStatus?: RunningStatus;
}

export const CurrentTable: React.FC<CurrentTableProps> = ({ equipmentInfos, intl, loadFlowStatus }) => {
    return (
        <Grid item sx={styles.grid}>
            <TableContainer sx={styles.table}>
                <Table size="small" sx={styles.layout}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ ...styles.cell, fontWeight: 'bold' }}>
                                {intl.formatMessage({ id: 'CURRENT' })}
                            </TableCell>
                            <TableCell sx={{ ...styles.cell, fontWeight: 'bold' }}>
                                {formatValue(equipmentInfos?.voltageLevelId1)}
                            </TableCell>
                            <TableCell sx={{ ...styles.cell, fontWeight: 'bold' }}>
                                {formatValue(equipmentInfos?.voltageLevelId2)}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell sx={styles.cell}>{intl.formatMessage({ id: 'I_(A)' })}</TableCell>
                            <TableCell
                                sx={mergeSx(styles.cell, {
                                    opacity: loadFlowStatus === RunningStatus.SUCCEED ? 1 : 0.2,
                                })}
                            >
                                {formatValue(Math.round(equipmentInfos?.i1))}
                            </TableCell>
                            <TableCell
                                sx={mergeSx(styles.cell, {
                                    opacity: loadFlowStatus === RunningStatus.SUCCEED ? 1 : 0.2,
                                })}
                            >
                                {formatValue(Math.round(equipmentInfos?.i2))}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    );
};
