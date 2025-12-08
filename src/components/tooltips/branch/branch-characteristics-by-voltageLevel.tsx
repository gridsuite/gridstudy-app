/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Table, TableHead, TableRow, TableBody, TableContainer, Grid } from '@mui/material';
import { CellRender } from '../cell-render';
import { formatValue, styles } from '../generic-equipment-popover-utils';
import { BranchEquipmentInfos } from '../equipment-popover-type';

interface BranchCharacteristicsByVoltageLevelProps {
    equipmentInfos: BranchEquipmentInfos;
}

export const BranchCharacteristicsByVoltageLevel: React.FC<BranchCharacteristicsByVoltageLevelProps> = ({
    equipmentInfos,
}) => {
    return (
        <Grid item sx={styles.grid}>
            <TableContainer sx={styles.table}>
                <Table size="small" sx={styles.layout}>
                    <TableHead>
                        <TableRow>
                            <CellRender colStyle={{ ...styles.cell, fontWeight: 'bold' }} />
                            <CellRender
                                isLabel
                                label="VoltageLevelIdSide1"
                                colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                            />
                            <CellRender
                                isLabel
                                label="VoltageLevelIdSide2"
                                colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                            />
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        <TableRow>
                            <CellRender isLabel label="I_(A)" colStyle={{ ...styles.cell, fontWeight: 'bold' }} />
                            <CellRender value={formatValue(equipmentInfos.i1, 3)} colStyle={styles.cell} />
                            <CellRender value={formatValue(equipmentInfos.i2, 3)} colStyle={styles.cell} />
                        </TableRow>

                        <TableRow>
                            <CellRender isLabel label="activePower" colStyle={{ ...styles.cell, fontWeight: 'bold' }} />
                            <CellRender value={formatValue(equipmentInfos.p1, 3)} colStyle={styles.cell} />
                            <CellRender value={formatValue(equipmentInfos.p2, 3)} colStyle={styles.cell} />
                        </TableRow>

                        <TableRow>
                            <CellRender
                                isLabel
                                label="reactivePowerTooltip"
                                colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                            />
                            <CellRender value={formatValue(equipmentInfos.q1, 3)} colStyle={styles.cell} />
                            <CellRender value={formatValue(equipmentInfos.q1, 3)} colStyle={styles.cell} />
                        </TableRow>

                        <TableRow>
                            <CellRender
                                isLabel
                                label="SelectedOperationalLimitGroups"
                                colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                            />
                            <CellRender
                                value={formatValue(equipmentInfos?.currentLimits1?.id)}
                                colStyle={styles.cell}
                            />
                            <CellRender
                                value={formatValue(equipmentInfos?.currentLimits2?.id)}
                                colStyle={styles.cell}
                            />
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    );
};
