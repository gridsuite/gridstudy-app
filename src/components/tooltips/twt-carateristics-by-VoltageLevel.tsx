/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Table, TableHead, TableRow, TableBody, TableContainer, Grid } from '@mui/material';
import { CellRender } from './cell-render';
import { styles } from './generic-equipment-popover-utils';
import { BranchEquipmentInfos } from './equipment-popover-type';

interface TwoCharacteristicsByVoltageLevelProps {
    equipmentInfos: BranchEquipmentInfos;
}

export const TwoCharacteristicsByVoltageLevel: React.FC<TwoCharacteristicsByVoltageLevelProps> = ({
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
                            <CellRender isLabel label="ID Poste" colStyle={styles.cell} />
                            <CellRender value={equipmentInfos.voltageLevelId1} colStyle={styles.cell} />
                            <CellRender value={equipmentInfos.voltageLevelId2} colStyle={styles.cell} />
                        </TableRow>

                        <TableRow>
                            <CellRender isLabel label="I_(A)" colStyle={styles.cell} />
                            <CellRender value={equipmentInfos.i1} colStyle={styles.cell} />
                            <CellRender value={equipmentInfos.i2} colStyle={styles.cell} />
                        </TableRow>

                        <TableRow>
                            <CellRender isLabel label="activePower" colStyle={styles.cell} />
                            <CellRender value={equipmentInfos.p1} colStyle={styles.cell} />
                            <CellRender value={equipmentInfos.p2} colStyle={styles.cell} />
                        </TableRow>

                        <TableRow>
                            <CellRender isLabel label="Q (Mvar)" colStyle={styles.cell} />
                            <CellRender value={equipmentInfos.q1} colStyle={styles.cell} />
                            <CellRender value={equipmentInfos.q1} colStyle={styles.cell} />
                        </TableRow>

                        <TableRow>
                            <CellRender isLabel label="SelectedOperationalLimitGroups" colStyle={styles.cell} />
                            <CellRender value={''} colStyle={styles.cell} />
                            <CellRender value={''} colStyle={styles.cell} />
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    );
};
