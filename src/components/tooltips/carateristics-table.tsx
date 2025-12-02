/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EquipmentInfos } from '@gridsuite/commons-ui';
import { Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Grid } from '@mui/material';
import { renderCommonCharacteristics, styles } from './generic-equipment-popover-utils';
import { CellRender } from './cell-render';
import { JSX } from 'react';

interface CharacteristicsTableProps {
    equipmentInfos: EquipmentInfos;
    renderVoltageLevelCharacteristics?: (equipmentInfos: EquipmentInfos) => JSX.Element;
}

export const CharacteristicsTable: React.FC<CharacteristicsTableProps> = ({
    equipmentInfos,
    renderVoltageLevelCharacteristics,
}) => {
    return (
        <Grid item sx={styles.grid}>
            <TableContainer sx={styles.table}>
                <Table size="small" sx={styles.layout}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={styles.cell} />
                            <CellRender
                                isLabel={true}
                                label="characteristic"
                                colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                            ></CellRender>
                            <CellRender
                                isLabel={true}
                                label="values"
                                colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                            ></CellRender>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {renderCommonCharacteristics(equipmentInfos)}
                        {renderVoltageLevelCharacteristics?.(equipmentInfos)}
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    );
};
