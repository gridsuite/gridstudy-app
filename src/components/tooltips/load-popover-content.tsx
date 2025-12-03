/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Table, TableContainer, TableRow } from '@mui/material';
import { LoadEquipmentInfos } from './equipment-popover-type';
import { CellRender } from './cell-render';
import { formatValue, styles } from './generic-equipment-popover-utils';
import { getLoadTypeLabel } from 'components/network/constants';

interface LoadPopoverContentProps {
    equipmentInfos: LoadEquipmentInfos;
}

export const LoadPopoverContent: React.FC<LoadPopoverContentProps> = ({ equipmentInfos }) => {
    return (
        <Grid container direction="column" rowSpacing={2} alignItems="center">
            <Grid item sx={styles.grid}>
                <TableContainer sx={styles.table}>
                    <Table size="small" sx={styles.layout}>
                        <TableRow>
                            <CellRender isLabel label="ConsP" colStyle={{ ...styles.cell, fontWeight: 'bold' }} />
                            <CellRender value={formatValue(equipmentInfos.p0, 3)} colStyle={styles.cell} />
                        </TableRow>

                        <TableRow>
                            <CellRender isLabel label="ConsQ" colStyle={{ ...styles.cell, fontWeight: 'bold' }} />
                            <CellRender value={formatValue(equipmentInfos.q0, 3)} colStyle={styles.cell} />
                        </TableRow>

                        <TableRow>
                            <CellRender isLabel label="loadType" colStyle={{ ...styles.cell, fontWeight: 'bold' }} />
                            <CellRender isLabel label={getLoadTypeLabel(equipmentInfos.type)} colStyle={styles.cell} />
                        </TableRow>
                    </Table>
                </TableContainer>
            </Grid>
        </Grid>
    );
};

export default LoadPopoverContent;
