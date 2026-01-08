/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Table, TableBody, TableContainer, TableRow } from '@mui/material';
import { CellRender } from '../cell-render';
import { formatValue, styles } from '../generic-equipment-popover-utils';
import { LoadEquipmentInfos } from '../equipment-popover-type';
import { getPropertyValue } from 'components/dialogs/network-modifications/common/properties/property-utils';
interface LoadPopoverContentProps {
    equipmentInfos: LoadEquipmentInfos;
}

export const LoadPopoverContent: React.FC<LoadPopoverContentProps> = ({ equipmentInfos }) => {
    const typeAffineFixe = getPropertyValue(equipmentInfos?.properties, 'typeAffineFixe');
    return (
        <Grid container direction="column" rowSpacing={2} alignItems="center">
            <Grid item sx={styles.grid}>
                <TableContainer sx={styles.table}>
                    <Table size="small" sx={styles.layout}>
                        <TableBody>
                            <TableRow>
                                <CellRender isLabel label="ConsP" colStyle={{ ...styles.cell, fontWeight: 'bold' }} />
                                <CellRender value={formatValue(Math.round(equipmentInfos.p0))} colStyle={styles.cell} />
                            </TableRow>

                            <TableRow>
                                <CellRender isLabel label="ConsQ" colStyle={{ ...styles.cell, fontWeight: 'bold' }} />
                                <CellRender value={formatValue(Math.round(equipmentInfos.q0))} colStyle={styles.cell} />
                            </TableRow>

                            {typeAffineFixe && (
                                <TableRow>
                                    <CellRender
                                        isLabel
                                        label="Type"
                                        colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                                    />
                                    <CellRender value={formatValue(typeAffineFixe)} colStyle={styles.cell} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </Grid>
    );
};

export default LoadPopoverContent;
