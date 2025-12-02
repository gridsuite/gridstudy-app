/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Table, TableHead, TableRow, TableBody, TableContainer, Grid } from '@mui/material';
import { CellRender } from './cell-render';
import { styles } from './generic-equipment-popover-utils';
import { PHASE_REGULATION_MODES, RATIO_REGULATION_MODES } from 'components/network/constants';
import { BranchEquipmentInfos } from '@gridsuite/commons-ui';

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
        rows.push({
            tap: phase.tapPosition ?? '-',
            rho: phase.steps[phase.tapPosition].rho,
            alpha: phase.tapPosition ?? '-',
            mode: phase.isRegulating ? phase.regulationMode : PHASE_REGULATION_MODES.OFF.label,
        });
    }

    return (
        <Grid item sx={styles.grid}>
            <TableContainer sx={styles.table}>
                <Table size="small" sx={styles.layout}>
                    <TableHead>
                        <TableRow>
                            <CellRender isLabel label="Tap" colStyle={{ ...styles.cell, fontWeight: 'bold' }} />
                            <CellRender isLabel label="twtReport" colStyle={{ ...styles.cell, fontWeight: 'bold' }} />
                            <CellRender isLabel label="twtAlpha" colStyle={{ ...styles.cell, fontWeight: 'bold' }} />
                            <CellRender
                                isLabel
                                label="RegulationMode"
                                colStyle={{ ...styles.cell, fontWeight: 'bold' }}
                            />
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {rows.map((r, idx) => (
                            <TableRow key={idx}>
                                <CellRender value={r.tap} colStyle={styles.cell} />
                                <CellRender value={r.rho} colStyle={styles.cell} />
                                <CellRender value={r.alpha} colStyle={styles.cell} />
                                <CellRender isLabel label={r.mode} colStyle={styles.cell} />
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    );
};
