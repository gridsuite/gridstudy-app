/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Table, TableRow, TableContainer, Grid, TableBody } from '@mui/material';
import { GeneratorEquipmentInfos } from '../equipment-popover-type';
import { styles } from '../generic-equipment-popover-utils';
import { CellRender } from '../cell-render';

interface GeneratorVoltageRegulationTableProps {
    equipmentInfos: GeneratorEquipmentInfos;
}

export const GeneratorVoltageRegulationTable: React.FC<GeneratorVoltageRegulationTableProps> = ({ equipmentInfos }) => {
    return (
        <Grid item sx={styles.grid}>
            <TableContainer sx={styles.table}>
                <Table size="small" sx={styles.layout}>
                    <TableBody>
                        <TableRow>
                            <CellRender
                                isLabel
                                label="VoltageRegulation"
                                colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                            />
                            <CellRender
                                isLabel
                                label={equipmentInfos.voltageRegulatorOn ? 'yes' : 'no'}
                                colStyle={styles.cell}
                            />
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    );
};
