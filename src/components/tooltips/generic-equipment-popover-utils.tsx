/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MuiStyles } from '@gridsuite/commons-ui';
import RunningStatus from 'components/utils/running-status';

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

export const styles = {
    table: (theme) => ({
        '& .MuiTableCell-root': {
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.mode === 'light' ? theme.palette.background.paper : '#36343B',
        },
        padding: '8px 16px',
        backgroundColor: theme.palette.mode === 'light' ? theme.palette.background.paper : '#36343B',
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

export const cellWithStatus = (status: RunningStatus | undefined) => ({
    ...styles.cell,
    opacity: status === RunningStatus.SUCCEED ? 1 : 0.5,
});
