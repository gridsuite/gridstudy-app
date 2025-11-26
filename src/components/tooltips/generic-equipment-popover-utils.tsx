/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { TableCell, TableRow } from '@mui/material';
import { mergeSx, convertInputValue, FieldType, MuiStyles } from '@gridsuite/commons-ui';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { RunningStatus } from '../utils/running-status';
import { IntlShape } from 'react-intl';
import { CurrentLimits } from 'services/network-modification-types';

export const formatValue = (value: number | string | null | undefined, fixed?: number) => {
    if (value === null || value === undefined || value === '') return '_';

    if (typeof value === 'number' && !Number.isNaN(value)) {
        return fixed !== undefined ? value.toFixed(fixed) : value.toString();
    }

    if (typeof value === 'string') {
        const num = Number(value);
        if (!Number.isNaN(num)) {
            return fixed !== undefined ? num.toFixed(fixed) : num.toString();
        }
        return value;
    }

    return '_';
};

/**
 * Render one <TableCell> that can be either a label or a value
 */
export const renderTableCell = ({
    label,
    value,
    isLabel,
    colStyle,
    intl,
}: {
    label?: string;
    value?: string | number;
    isLabel: boolean;
    colStyle: React.CSSProperties;
    intl: IntlShape;
}) => <TableCell sx={colStyle}>{isLabel ? (label ? intl.formatMessage({ id: label }) : '') : value}</TableCell>;

/**
 * Render common characteristics
 */
export const renderCommonCharacteristics = (equipmentInfo: any, intl: IntlShape) => (
    <>
        <TableRow>
            <TableCell sx={styles.cell} />
            {renderTableCell({
                label: 'seriesResistance',
                isLabel: true,
                colStyle: styles.cell,
                intl,
            })}
            {renderTableCell({
                value: formatValue(equipmentInfo.r, 2),
                isLabel: false,
                colStyle: styles.cell,
                intl,
            })}
        </TableRow>
        <TableRow>
            <TableCell sx={styles.cell} />
            {renderTableCell({
                label: 'seriesReactance',
                isLabel: true,
                colStyle: styles.cell,
                intl,
            })}
            {renderTableCell({
                value: formatValue(equipmentInfo.x, 2),
                isLabel: false,
                colStyle: styles.cell,
                intl,
            })}
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
} as const satisfies MuiStyles;

/**
 * Render voltage-level dependent characteristics (shunt susceptance, etc.)
 */
export const renderVoltageLevelCharacteristics = (equipmentInfo: any, equipmentType: any, intl: IntlShape) => {
    const renderShuntRow = (voltageLevelId: any, value: any, type: any) => (
        <TableRow key={`${voltageLevelId}-${type}`}>
            {renderTableCell({
                value: voltageLevelId,
                isLabel: false,
                colStyle: styles.cell,
                intl,
            })}
            {renderTableCell({
                label: 'shuntSusceptance',
                isLabel: true,
                colStyle: styles.cell,
                intl,
            })}
            {renderTableCell({
                value: convertInputValue(type, value)?.toFixed(2),
                isLabel: false,
                colStyle: styles.cell,
                intl,
            })}
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
export const generateRows = (
    equipmentInfos: any,
    currentLimits: CurrentLimits,
    side: '1' | '2',
    intl: IntlShape,
    loadFlowStatus?: RunningStatus
) => {
    if (!equipmentInfos || !currentLimits) return null;

    return (
        <>
            {currentLimits?.permanentLimit && (
                <TableRow key={currentLimits.permanentLimit + side}>
                    <TableCell sx={styles.cell}>{intl.formatMessage({ id: 'PermanentCurrentLimitText' })}</TableCell>
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
