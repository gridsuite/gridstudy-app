/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Table, TableContainer, TableRow } from '@mui/material';
import { formatValue, styles } from '../generic-equipment-popover-utils';
import { CellRender } from '../cell-render';
import { GeneratorEquipmentInfos } from '../equipment-popover-type';
import { GeneratorActivePowerTable } from './generator-active-power-table';
import { GeneratorVoltageRegulationTable } from './generator-voltage-regulation-table';
interface GeneratorPopoverContentProps {
    equipmentInfos: GeneratorEquipmentInfos;
}

export const GeneratorPopoverContent: React.FC<GeneratorPopoverContentProps> = ({ equipmentInfos }) => {
    return (
        <Grid container direction="column" rowSpacing={2} alignItems="center">
            <Grid item sx={styles.grid}>
                <TableContainer sx={styles.table}>
                    <Table size="small" sx={styles.layout}>
                        <TableRow>
                            <CellRender isLabel label="ActivePower" colStyle={{ ...styles.cell, fontWeight: 'bold' }} />
                            <CellRender
                                value={formatValue(equipmentInfos.p && Math.round(equipmentInfos.p))}
                                colStyle={styles.cell}
                            />
                        </TableRow>

                        <TableRow>
                            <CellRender
                                isLabel
                                label="reactivePowerTooltip"
                                colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                            />
                            <CellRender
                                value={formatValue(equipmentInfos.q && Math.round(equipmentInfos.q))}
                                colStyle={styles.cell}
                            />
                        </TableRow>
                    </Table>
                </TableContainer>
            </Grid>

            <GeneratorActivePowerTable equipmentInfos={equipmentInfos} />

            <Grid item sx={styles.grid}>
                <TableContainer sx={styles.table}>
                    <Table size="small" sx={styles.layout}>
                        <TableRow>
                            <CellRender
                                isLabel
                                label="reactivePowerSetpointTooltip"
                                colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                            />
                            <CellRender
                                value={formatValue(equipmentInfos.targetQ && Math.round(equipmentInfos.targetQ))}
                                colStyle={styles.cell}
                            />
                        </TableRow>
                    </Table>
                </TableContainer>
            </Grid>

            <GeneratorVoltageRegulationTable equipmentInfos={equipmentInfos} />
        </Grid>
    );
};

export default GeneratorPopoverContent;
