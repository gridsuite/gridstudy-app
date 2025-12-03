/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Table, TableHead, TableRow, TableBody, TableContainer, Grid } from '@mui/material';
import { CellRender } from './cell-render';
import { formatValue, styles } from './generic-equipment-popover-utils';
import { PHASE_REGULATION_MODES, RATIO_REGULATION_MODES } from 'components/network/constants';
import { BranchEquipmentInfos } from './equipment-popover-type';

interface TwoCharacteristicsModeProps {
    equipmentInfos: BranchEquipmentInfos;
}

export const TwoCharacteristicsMode: React.FC<TwoCharacteristicsModeProps> = ({ equipmentInfos }) => {
    const ratio = equipmentInfos.ratioTapChanger;
    const phase = equipmentInfos.phaseTapChanger;

    const rows = [];

    if (ratio) {
        rows.push({
            tap: ratio.tapPosition,
            rho: ratio.steps[ratio.tapPosition].rho,
            alpha: '-',
            mode: ratio.isRegulating
                ? RATIO_REGULATION_MODES.VOLTAGE_REGULATION.label
                : RATIO_REGULATION_MODES.FIXED_RATIO.label,
        });
    }

    if (phase) {
        const phaseRegulationMode =
            PHASE_REGULATION_MODES[phase.regulationMode as keyof typeof PHASE_REGULATION_MODES].label;

        rows.push({
            tap: phase.tapPosition ?? '-',
            rho: '-',
            alpha: phase.steps[phase.tapPosition].alpha,
            mode: phase.isRegulating ? phaseRegulationMode : PHASE_REGULATION_MODES.OFF.label,
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
                            <CellRender isLabel label="twtAlpha" colStyle={{ ...styles.cell, fontWeight: 'bold' }} />
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
                                <CellRender value={formatValue(r.tap, 3)} colStyle={styles.cell} />
                                <CellRender value={formatValue(r.rho, 3)} colStyle={styles.cell} />
                                <CellRender value={formatValue(r.alpha, 3)} colStyle={styles.cell} />
                                <CellRender isLabel label={r.mode} colStyle={styles.cell} />
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    );
};
