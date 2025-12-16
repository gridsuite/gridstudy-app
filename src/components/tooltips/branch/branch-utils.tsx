/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import { BranchEquipmentInfos, CommonBranchEquipmentInfos } from '../equipment-popover-type';
import { CellRender } from '../cell-render';
import { cellWithStatus, formatValue, styles } from '../generic-equipment-popover-utils';
import { CurrentLimits, TemporaryLimit } from 'services/network-modification-types';
import RunningStatus from 'components/utils/running-status';
import {CurrentLimitsData, TemporaryLimitsData} from "../../../services/study/network-map.type";

/**
 * Render common characteristics Table
 */
export const renderCommonCharacteristicsTable = (equipmentInfo: CommonBranchEquipmentInfos) => (
    <TableContainer sx={styles.table}>
        <Table size="small" sx={styles.layout}>
            <TableBody>
                <TableRow>
                    <CellRender isLabel={true} label="r" colStyle={{ ...styles.cell, fontWeight: 'bold' }}></CellRender>
                    <CellRender
                        value={formatValue(equipmentInfo.r, 2)}
                        colStyle={{
                            ...styles.cell,
                        }}
                    />
                </TableRow>

                <TableRow>
                    <CellRender isLabel label="x" colStyle={{ ...styles.cell, fontWeight: 'bold' }} />
                    <CellRender
                        value={formatValue(equipmentInfo.x, 2)}
                        colStyle={{
                            ...styles.cell,
                        }}
                    />
                </TableRow>
            </TableBody>
        </Table>
    </TableContainer>
);

/**
 * Generate the rows for current limits (permanent and temporary)
 */
export const generateCurrentLimitsRows = (
    equipmentInfos: BranchEquipmentInfos,
    currentLimits: CurrentLimitsData,
    side: '1' | '2',
    loadFlowStatus?: RunningStatus
) => {
    console.log('HMA', currentLimits);
    if (!equipmentInfos || !currentLimits) return null;

    return (
        <>
            {currentLimits?.permanentLimit && (
                <TableRow key={currentLimits.permanentLimit + side}>
                    <CellRender isLabel={true} label="PermanentCurrentLimitText" colStyle={styles.cell}></CellRender>
                    <TableCell sx={styles.cell}>{formatValue(Math.round(currentLimits.permanentLimit))}</TableCell>

                    <CellRender
                        value={formatValue(
                            Math.round(
                                side === '1'
                                    ? (Math.abs(equipmentInfos.i1) * 100) / currentLimits.permanentLimit
                                    : (Math.abs(equipmentInfos.i2) * 100) / currentLimits.permanentLimit
                            )
                        )}
                        colStyle={cellWithStatus(loadFlowStatus)}
                    />
                    <TableCell sx={styles.cell}>
                        {side === '1' ? equipmentInfos?.voltageLevelId1 : equipmentInfos?.voltageLevelId2}
                    </TableCell>
                </TableRow>
            )}
            {currentLimits?.temporaryLimits?.map(
                (temporaryLimit: TemporaryLimitsData) =>
                    temporaryLimit.value && (
                        <TableRow key={temporaryLimit.name + side}>
                            <TableCell sx={styles.cell}>{formatValue(temporaryLimit.name)}</TableCell>
                            <TableCell sx={styles.cell}>
                                {formatValue(Math.round(temporaryLimit.value))}
                            </TableCell>
                            <CellRender
                                value={formatValue(
                                    Math.round(
                                        side === '1'
                                            ? (Math.abs(equipmentInfos?.i1) * 100) / temporaryLimit.value
                                            : (Math.abs(equipmentInfos?.i2) * 100) / temporaryLimit.value
                                    )
                                )}
                                colStyle={cellWithStatus(loadFlowStatus)}
                            />

                            <TableCell sx={styles.cell}>
                                {side === '1' ? equipmentInfos?.voltageLevelId1 : equipmentInfos?.voltageLevelId2}
                            </TableCell>
                        </TableRow>
                    )
            )}
        </>
    );
};
