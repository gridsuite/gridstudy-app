/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TableCell, TableRow } from '@mui/material';
import { mergeSx, convertInputValue, FieldType, MuiStyles } from '@gridsuite/commons-ui';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { RunningStatus } from '../utils/running-status';
import { CurrentLimits } from 'services/network-modification-types';
import { CellRender } from './cell-render';
import { BranchEquipmentInfos } from './equipment-popover-type';

export const formatValue = (value?: number | string | null, fixed?: number | string | null) => {
    if (value !== undefined && value != null && !Number.isNaN(value)) {
        if (typeof value === 'number') {
            if (typeof fixed === 'number') {
                return value.toFixed(fixed);
            } else {
                return value.toString();
            }
        } else {
            return value;
        }
    } else {
        return '_';
    }
};

/**
 * Render common characteristics
 */
export const renderCommonCharacteristics = (equipmentInfo: any) => (
    <>
        <TableRow>
            <TableCell sx={styles.cell} />

            <CellRender label="SeriesResistanceOhm" isLabel={true} colStyle={styles.cell} />

            <CellRender value={formatValue(equipmentInfo.r, 2)} isLabel={false} colStyle={styles.cell} />
        </TableRow>

        <TableRow>
            <TableCell sx={styles.cell} />

            <CellRender label="SeriesReactanceOhm" isLabel={true} colStyle={styles.cell} />

            <CellRender value={formatValue(equipmentInfo.x, 2)} colStyle={styles.cell} />
        </TableRow>
    </>
);
export const styles = {
    table: (theme) => ({
        '& .MuiTableCell-root': {
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
        },
        padding: '8px 16px',
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[1],
        borderRadius: '4px',
    }),
    cell: {
        fontSize: 10,
        padding: '6px 10px',
    },
    layout: { width: '100%', tableLayout: 'auto' },
    grid: { width: '100%' },
} as const satisfies MuiStyles;

/**
 * Render voltage-level dependent characteristics (shunt susceptance, etc.)
 */
export const renderVoltageLevelCharacteristics = (equipmentInfo: any, equipmentType: any) => {
    const renderShuntRow = (voltageLevelId: any, value: any, type: any) => (
        <TableRow key={`${voltageLevelId}-${type}`}>
            <CellRender value={voltageLevelId} isLabel={false} colStyle={styles.cell} />

            <CellRender label="shuntSusceptance" isLabel={true} colStyle={styles.cell} />

            <CellRender value={convertInputValue(type, value)?.toFixed(2)} isLabel={false} colStyle={styles.cell} />
        </TableRow>
    );

    return equipmentType === EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER ? (
        renderShuntRow(equipmentInfo.voltageLevelId2, equipmentInfo?.b, FieldType.B)
    ) : (
        <>
            {renderShuntRow(equipmentInfo.voltageLevelId1, equipmentInfo.b1, FieldType.B1)}
            {renderShuntRow(equipmentInfo.voltageLevelId2, equipmentInfo?.b2, FieldType.B2)}
        </>
    );
};

/**
 * Generate the rows for current limits (permanent and temporary)
 */
export const generateCurrentLimitsRows = (
    equipmentInfos: BranchEquipmentInfos,
    currentLimits: CurrentLimits,
    side: '1' | '2',
    loadFlowStatus?: RunningStatus
) => {
    if (!equipmentInfos || !currentLimits) return null;

    return (
        <>
            {currentLimits?.permanentLimit && (
                <TableRow key={currentLimits.permanentLimit + side}>
                    <CellRender isLabel={true} label="PermanentCurrentLimitText" colStyle={styles.cell}></CellRender>
                    <TableCell sx={styles.cell}>{formatValue(Math.round(currentLimits.permanentLimit))}</TableCell>
                    <TableCell
                        sx={mergeSx(styles.cell, {
                            opacity: loadFlowStatus === RunningStatus.SUCCEED ? 1 : 0.2,
                        })}
                    >
                        {formatValue(
                            Math.round(
                                side === '1'
                                    ? (Math.abs(equipmentInfos.i1) * 100) / currentLimits.permanentLimit
                                    : (Math.abs(equipmentInfos.i2) * 100) / currentLimits.permanentLimit
                            )
                        )}
                    </TableCell>
                    <TableCell sx={styles.cell}>
                        {formatValue(side === '1' ? equipmentInfos?.voltageLevelId1 : equipmentInfos?.voltageLevelId2)}
                    </TableCell>
                </TableRow>
            )}
            {currentLimits?.temporaryLimits?.map(
                (temporaryLimit: any) =>
                    temporaryLimit.value && (
                        <TableRow key={temporaryLimit.name + side}>
                            <TableCell sx={styles.cell}>{formatValue(temporaryLimit.name)}</TableCell>
                            <TableCell sx={styles.cell}>{formatValue(Math.round(temporaryLimit.value))}</TableCell>
                            <TableCell
                                sx={mergeSx(styles.cell, {
                                    opacity: loadFlowStatus === RunningStatus.SUCCEED ? 1 : 0.2,
                                })}
                            >
                                {formatValue(
                                    Math.round(
                                        side === '1'
                                            ? (Math.abs(equipmentInfos?.i1) * 100) / temporaryLimit.value
                                            : (Math.abs(equipmentInfos?.i2) * 100) / temporaryLimit.value
                                    )
                                )}
                            </TableCell>
                            <TableCell sx={styles.cell}>
                                {formatValue(
                                    side === '1' ? equipmentInfos?.voltageLevelId1 : equipmentInfos?.voltageLevelId2
                                )}
                            </TableCell>
                        </TableRow>
                    )
            )}
        </>
    );
};
