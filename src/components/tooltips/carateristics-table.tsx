/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EquipmentInfos } from '@gridsuite/commons-ui';
import { Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Grid } from '@mui/material';
import { IntlShape } from 'react-intl';
import { renderCommonCharacteristics, styles } from './generic-equipment-popover-utils';

interface CharacteristicsTableProps {
    equipmentInfos: EquipmentInfos;
    intl: IntlShape;
    renderVoltageLevelCharacteristics?: (equipmentInfos: EquipmentInfos, intl: IntlShape) => JSX.Element;
}

export const CharacteristicsTable: React.FC<CharacteristicsTableProps> = ({
    equipmentInfos,
    intl,
    renderVoltageLevelCharacteristics,
}) => {
    return (
        <Grid item sx={{ width: '100%' }}>
            <TableContainer sx={styles.table}>
                <Table size="small" sx={{ width: '100%', tableLayout: 'auto' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={styles.cell} />
                            <TableCell sx={{ ...styles.cell, fontWeight: 'bold' }}>
                                {intl.formatMessage({ id: 'characteristic' })}
                            </TableCell>
                            <TableCell sx={{ ...styles.cell, fontWeight: 'bold' }}>
                                {intl.formatMessage({ id: 'values' })}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {renderCommonCharacteristics(equipmentInfos, intl)}
                        {renderVoltageLevelCharacteristics && renderVoltageLevelCharacteristics(equipmentInfos, intl)}
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    );
};
