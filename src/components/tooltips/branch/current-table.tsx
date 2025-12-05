/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Grid } from '@mui/material';
import { mergeSx } from '@gridsuite/commons-ui';
import { RunningStatus } from '../../utils/running-status';
import { formatValue, styles } from '../generic-equipment-popover-utils';
import { CellRender } from '../cell-render';
import { BranchEquipmentInfos } from '../equipment-popover-type';

interface CurrentTableProps {
    equipmentInfos: BranchEquipmentInfos;
    loadFlowStatus?: RunningStatus;
}

export const CurrentTable: React.FC<CurrentTableProps> = ({ equipmentInfos, loadFlowStatus }) => {
    return (
        <Grid item sx={styles.grid}>
            <TableContainer sx={styles.table}>
                <Table size="small" sx={styles.layout}>
                    <TableHead>
                        <TableRow>
                            <CellRender
                                isLabel={true}
                                label="CURRENT"
                                colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                            ></CellRender>
                            <TableCell sx={{ ...styles.cell, fontWeight: 'bold' }}>
                                {equipmentInfos?.voltageLevelId1 && formatValue(equipmentInfos?.voltageLevelId1)}
                            </TableCell>
                            <TableCell sx={{ ...styles.cell, fontWeight: 'bold' }}>
                                {equipmentInfos?.voltageLevelId2 && formatValue(equipmentInfos?.voltageLevelId2)}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <CellRender
                                isLabel={true}
                                label="I_(A)"
                                colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                            ></CellRender>
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
