/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { Table, TableHead, TableRow, TableBody, TableContainer, Grid } from '@mui/material';
import { RunningStatus } from '../utils/running-status';
import { generateCurrentLimitsRows, styles } from './generic-equipment-popover-utils';
import { CellRender } from './cell-render';
import { BranchEquipmentInfos } from './equipment-popover-type';

interface LimitsTableProps {
    equipmentInfos: BranchEquipmentInfos;
    loadFlowStatus?: RunningStatus;
}

export const LimitsTable: React.FC<LimitsTableProps> = ({ equipmentInfos, loadFlowStatus }) => {
    return (
        <Grid item sx={styles.grid}>
            <TableContainer sx={styles.table}>
                <Table size="small" sx={styles.layout}>
                    <TableHead>
                        <TableRow>
                            <CellRender
                                isLabel={true}
                                label="Limit_name"
                                colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                            ></CellRender>

                            <CellRender
                                isLabel={true}
                                label="LimitLabel"
                                colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                            ></CellRender>
                            <CellRender
                                isLabel={true}
                                label="Loading"
                                colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                            ></CellRender>

                            <CellRender
                                isLabel={true}
                                label="Side"
                                colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                            ></CellRender>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {generateCurrentLimitsRows(equipmentInfos, equipmentInfos?.currentLimits1, '1', loadFlowStatus)}
                        {generateCurrentLimitsRows(equipmentInfos, equipmentInfos?.currentLimits2, '2', loadFlowStatus)}
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    );
};
