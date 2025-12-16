/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, TableRow } from '@mui/material';
import { VoltageLevelTooltipBusInfos } from '../equipment-popover-type';
import { CellRender } from '../cell-render';
import { formatValue, styles as genericStyles } from '../generic-equipment-popover-utils';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import RunningStatus from 'components/utils/running-status';
import { CSSProperties } from 'react';
import { INVALID_COMPUTATION_OPACITY } from 'utils/colors';

const styles = {
    invalidComputation: {
        opacity: INVALID_COMPUTATION_OPACITY,
    },
};

export const VoltageLevelPopoverBusInfos = ({ buses }: { buses?: VoltageLevelTooltipBusInfos[] }) => {
    const loadFlowStatus = useSelector((state: AppState) => state.computingStatus.LOAD_FLOW);
    const shortcircuitStatus = useSelector((state: AppState) => state.computingStatus.SHORT_CIRCUIT);
    const isLoadflowInvalid = loadFlowStatus !== RunningStatus.SUCCEED;
    const isShortcircuitInvalid = shortcircuitStatus !== RunningStatus.SUCCEED;

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
                {buses?.map((b) => (
                    <CellRender key={b.id} value={`${b.id}`} colStyle={{ ...genericStyles.cell, fontWeight: 'bold' }} />
                ))}
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
