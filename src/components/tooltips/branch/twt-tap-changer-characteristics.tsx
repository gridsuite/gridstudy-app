/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Table, TableHead, TableRow, TableBody, TableContainer, Grid } from '@mui/material';
import { CellRender } from '../cell-render';
import { formatValue, styles } from '../generic-equipment-popover-utils';
import { TwtEquipmentInfos } from '../equipment-popover-type';
import { getComputedRegulationMode } from 'components/dialogs/network-modifications/two-windings-transformer/tap-changer-pane/ratio-tap-changer-pane/ratio-tap-changer-pane-utils';
import { getComputedPhaseTapChangerRegulationMode } from 'components/dialogs/network-modifications/two-windings-transformer/tap-changer-pane/phase-tap-changer-pane/phase-tap-changer-pane-utils';

interface TwtTapChangerCharacteristicsProps {
    equipmentInfos: TwtEquipmentInfos;
}

export const TwtTapChangerCharacteristics: React.FC<TwtTapChangerCharacteristicsProps> = ({ equipmentInfos }) => {
    const ratioTapChanger = equipmentInfos.ratioTapChanger;
    const phaseTapChanger = equipmentInfos.phaseTapChanger;

    const rows = [];

    if (ratioTapChanger) {
        rows.push({
            tap: ratioTapChanger.tapPosition,
            rho: ratioTapChanger.steps[ratioTapChanger.tapPosition].rho,
            alpha: '-',
            mode: getComputedRegulationMode(equipmentInfos)?.label,
        });
    }

    if (phaseTapChanger) {
        rows.push({
            tap: phaseTapChanger.tapPosition ?? '-',
            rho: '-',
            alpha: phaseTapChanger.steps[phaseTapChanger.tapPosition - 1].alpha,
            mode: getComputedPhaseTapChangerRegulationMode(phaseTapChanger)?.label,
        });
    }

    if (!phaseTapChanger && !ratioTapChanger) {
        rows.push({
            tap: '_',
            rho: '_',
            alpha: '_',
            mode: '_',
        });
    }
    return (
        <Grid item sx={styles.grid}>
            <TableContainer sx={styles.table}>
                <Table size="small" sx={styles.layout}>
                    <TableHead>
                        <TableRow>
                            <CellRender isLabel label="Tap" colStyle={{ ...styles.cell, fontWeight: 'bold' }} />
                            <CellRender isLabel label="Ratio" colStyle={{ ...styles.cell, fontWeight: 'bold' }} />
                            <CellRender isLabel label="Alpha" colStyle={{ ...styles.cell, fontWeight: 'bold' }} />
                            <CellRender
                                isLabel
                                label="RegulationMode"
                                colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                            />
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {rows.map((r) => (
                            <TableRow key={r.tap}>
                                <CellRender value={formatValue(Math.round(r.tap))} colStyle={styles.cell} />
                                <CellRender value={formatValue(r.rho, 3)} colStyle={styles.cell} />
                                <CellRender value={formatValue(r.alpha, 1)} colStyle={styles.cell} />
                                <CellRender isLabel label={r.mode} colStyle={styles.cell} />
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    );
};
