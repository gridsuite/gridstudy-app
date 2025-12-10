/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Table, TableRow, TableContainer, Grid } from '@mui/material';
import { GeneratorEquipmentInfos } from '../equipment-popover-type';
import { formatValue, styles } from '../generic-equipment-popover-utils';
import { CellRender } from '../cell-render';

interface GeneratorActivePowerTableProps {
    equipmentInfos: GeneratorEquipmentInfos;
}

export const GeneratorActivePowerTable: React.FC<GeneratorActivePowerTableProps> = ({ equipmentInfos }) => {
    return (
        <Grid item sx={styles.grid}>
            <TableContainer sx={styles.table}>
                <Table size="small" sx={styles.layout}>
                    <TableRow>
                        <CellRender
                            isLabel
                            label="activePowerSetPointTooltip"
                            colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                        />
                        <CellRender value={formatValue(Math.round(equipmentInfos.targetP))} colStyle={styles.cell} />
                    </TableRow>

                    <TableRow>
                        <CellRender
                            isLabel
                            label="MinimumActivePowerTooltip"
                            colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                        />
                        <CellRender value={formatValue(Math.round(equipmentInfos.minP))} colStyle={styles.cell} />
                    </TableRow>

                    <TableRow>
                        <CellRender
                            isLabel
                            label="MaximumActivePowerTooltip"
                            colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                        />
                        <CellRender value={formatValue(Math.round(equipmentInfos.maxP))} colStyle={styles.cell} />
                    </TableRow>

                    <TableRow>
                        <CellRender
                            isLabel
                            label="plannedActivePowerSetPointTooltip"
                            colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                        />
                        <CellRender
                            value={formatValue(equipmentInfos.plannedActivePowerSetPoint)}
                            colStyle={styles.cell}
                        />
                    </TableRow>
                </Table>
            </TableContainer>
        </Grid>
    );
};
