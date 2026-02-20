/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Table, TableBody, TableContainer, TableRow } from '@mui/material';
import { CellRender } from '../cell-render';
import { formatValue, styles } from '../generic-equipment-popover-utils';
import { VoltageLevelTooltipInfos } from '../equipment-popover-type';

export const VoltageLevelPopoverInfos = ({ equipmentInfos }: { equipmentInfos?: VoltageLevelTooltipInfos }) => {
    return (
        <Grid item sx={styles.grid}>
            <TableContainer>
                <Table size="small" sx={styles.layout}>
                    <TableBody>
                        <TableRow>
                            <CellRender
                                isLabel={true}
                                label="tooltip.umin"
                                colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                            />
                            <CellRender
                                value={formatValue(equipmentInfos?.umin, 2)}
                                colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                            />
                        </TableRow>
                        <TableRow>
                            <CellRender
                                isLabel={true}
                                label="tooltip.umax"
                                colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                            />
                            <CellRender
                                value={formatValue(equipmentInfos?.umax, 2)}
                                colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                            />
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    );
};
