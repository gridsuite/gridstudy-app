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
import RunningStatus from 'components/utils/running-status';

interface BranchCharacteristicsByVoltageLevelProps {
    equipmentInfos: BranchEquipmentInfos;
    loadFlowStatus?: RunningStatus;
}

export const BranchCharacteristicsByVoltageLevel: React.FC<BranchCharacteristicsByVoltageLevelProps> = ({
    equipmentInfos,
    loadFlowStatus,
}) => {
    return (
        <Grid item sx={styles.grid}>
            <TableContainer sx={styles.table}>
                <Table size="small" sx={styles.layout}>
                    <TableHead>
                        <TableRow>
                            <CellRender colStyle={{ ...styles.cell, fontWeight: 'bold' }} />
                            <CellRender
                                value={formatValue(equipmentInfos?.voltageLevelId1)}
                                colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                            />
                            <CellRender
                                value={formatValue(equipmentInfos?.voltageLevelId2)}
                                colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                            />
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        <TableRow>
                            <CellRender
                                isLabel={true}
                                label="I_(A)"
                                colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                            ></CellRender>
                            <CellRender
                                value={formatValue(Math.round(equipmentInfos?.i1))}
                                colStyle={{
                                    ...styles.cell,
                                    opacity: loadFlowStatus === RunningStatus.SUCCEED ? 1 : 0.2,
                                }}
                            />
                            <CellRender
                                value={formatValue(Math.round(equipmentInfos?.i2))}
                                colStyle={{
                                    ...styles.cell,
                                    opacity: loadFlowStatus === RunningStatus.SUCCEED ? 1 : 0.2,
                                }}
                            />
                        </TableRow>

                        <TableRow>
                            <CellRender isLabel label="activePower" colStyle={{ ...styles.cell, fontWeight: 'bold' }} />
                            <CellRender
                                value={formatValue(Math.round(equipmentInfos?.p1))}
                                colStyle={{
                                    ...styles.cell,
                                    opacity: loadFlowStatus === RunningStatus.SUCCEED ? 1 : 0.2,
                                }}
                            />
                            <CellRender
                                value={formatValue(Math.round(equipmentInfos?.p2))}
                                colStyle={{
                                    ...styles.cell,
                                    opacity: loadFlowStatus === RunningStatus.SUCCEED ? 1 : 0.2,
                                }}
                            />
                        </TableRow>

                        <TableRow>
                            <CellRender
                                isLabel
                                label="reactivePowerTooltip"
                                colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                            />
                            <CellRender
                                value={formatValue(Math.round(equipmentInfos?.q1))}
                                colStyle={{
                                    ...styles.cell,
                                    opacity: loadFlowStatus === RunningStatus.SUCCEED ? 1 : 0.2,
                                }}
                            />
                            <CellRender
                                value={formatValue(Math.round(equipmentInfos?.q2))}
                                colStyle={{
                                    ...styles.cell,
                                    opacity: loadFlowStatus === RunningStatus.SUCCEED ? 1 : 0.2,
                                }}
                            />
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
