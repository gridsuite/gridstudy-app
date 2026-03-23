/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Grid, TableCell, TableRow } from '@mui/material';
import { VoltageLevelTooltipBusInfos } from '../equipment-popover-type';
import { CellRender } from '../cell-render';
import { formatValue, styles as genericStyles } from '../generic-equipment-popover-utils';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer.type';
import RunningStatus from 'components/utils/running-status';
import { CSSProperties, useMemo } from 'react';
import { getBaseVoltageSldAndNadThemeColors, INVALID_COMPUTATION_OPACITY } from 'utils/colors';
import { useBaseVoltages } from 'hooks/use-base-voltages';
import { PARAM_THEME } from '@gridsuite/commons-ui';

const styles = {
    invalidComputation: {
        opacity: INVALID_COMPUTATION_OPACITY,
    },
    busHeaderCell: {
        ...genericStyles.cell,
        fontWeight: 'bold',
    },
    busHeaderContent: {
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
    },
    busHeaderDot: {
        width: 8,
        height: 8,
        minWidth: 8,
        borderRadius: '50%',
    },
};

export const VoltageLevelPopoverBusInfos = ({
    buses,
    fallbackVoltage,
}: {
    buses?: VoltageLevelTooltipBusInfos[];
    fallbackVoltage?: number;
}) => {
    const loadFlowStatus = useSelector((state: AppState) => state.computingStatus.LOAD_FLOW);
    const shortcircuitStatus = useSelector((state: AppState) => state.computingStatus.SHORT_CIRCUIT);
    const theme = useSelector((state: AppState) => state[PARAM_THEME]);
    const isLoadflowInvalid = loadFlowStatus !== RunningStatus.SUCCEED;
    const isShortcircuitInvalid = shortcircuitStatus !== RunningStatus.SUCCEED;
    const { getBaseVoltageInterval } = useBaseVoltages();

    const voltageLevelThemeColors = useMemo(() => {
        const voltage = buses?.find(({ u }) => u != null)?.u ?? fallbackVoltage;
        if (voltage != null) {
            const voltageLevelInterval = getBaseVoltageInterval(voltage);
            return voltageLevelInterval && getBaseVoltageSldAndNadThemeColors(voltageLevelInterval, theme);
        }
        return undefined;
    }, [buses, fallbackVoltage, getBaseVoltageInterval, theme]);

    const getBusColor = (busIndex: number) => {
        const colorKey = busIndex === 0 ? 'default' : `bus-${busIndex}`;
        return voltageLevelThemeColors?.[colorKey];
    };

    const renderBusHeaderCell = (bus: VoltageLevelTooltipBusInfos, index: number) => (
        <TableCell key={bus.id} sx={styles.busHeaderCell}>
            <Box sx={styles.busHeaderContent}>
                <Box sx={{ ...styles.busHeaderDot, backgroundColor: getBusColor(index) }} />
                <Box component="span">{bus.id}</Box>
            </Box>
        </TableCell>
    );

    const renderSpecificRow = (
        label: string,
        valueGetter: (b: VoltageLevelTooltipBusInfos) => number,
        rowSpecificStyle?: CSSProperties
    ) => (
        <TableRow>
            <CellRender
                isLabel={true}
                label={label}
                colStyle={{ ...genericStyles.cell, fontWeight: 'bold', ...rowSpecificStyle }}
            />

            {buses?.map((b) => (
                <CellRender
                    key={`${label}-${b.id}`}
                    value={formatValue(valueGetter(b), 2)}
                    colStyle={{ ...genericStyles.cell, ...rowSpecificStyle }}
                />
            ))}
        </TableRow>
    );

    return (
        <Grid item sx={genericStyles.grid}>
            <TableRow>
                <CellRender isLabel={true} label="" colStyle={{ ...genericStyles.cell, fontWeight: 'bold' }} />
                {buses?.map((b, index) => renderBusHeaderCell(b, index))}
            </TableRow>

            {renderSpecificRow('tooltip.u', (bus) => bus.u, isLoadflowInvalid ? styles.invalidComputation : undefined)}
            {renderSpecificRow(
                'tooltip.angle',
                (bus) => bus.angle,
                isLoadflowInvalid ? styles.invalidComputation : undefined
            )}
            {renderSpecificRow(
                'tooltip.generation',
                (bus) => bus.generation,
                isLoadflowInvalid ? styles.invalidComputation : undefined
            )}
            {renderSpecificRow(
                'tooltip.load',
                (bus) => bus.load,
                isLoadflowInvalid ? styles.invalidComputation : undefined
            )}
            {renderSpecificRow(
                'tooltip.balance',
                (bus) => bus.balance,
                isLoadflowInvalid ? styles.invalidComputation : undefined
            )}
            {renderSpecificRow(
                'tooltip.icc',
                (bus) => bus.icc / 1000,
                isShortcircuitInvalid ? styles.invalidComputation : undefined
            )}
        </Grid>
    );
};
