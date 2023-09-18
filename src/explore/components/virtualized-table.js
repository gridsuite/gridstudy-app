/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    DEFAULT_CELL_PADDING,
    MuiVirtualizedTable,
} from '@gridsuite/commons-ui';
import { styled } from '@mui/material';

const PREFIX = 'MuiVirtualizedTable';
const classes = {
    flexContainer: `${PREFIX}-flexContainer`,
    table: `${PREFIX}-table`,
    tableRow: `${PREFIX}-tableRow`,
    tableRowHover: `${PREFIX}-tableRowHover`,
    tableCell: `${PREFIX}-tableCell`,
    noClick: `${PREFIX}-noClick`,
    tableCellColor: `${PREFIX}-tableCellColor`,
    header: `${PREFIX}-header`,
    rowBackgroundDark: `${PREFIX}-rowBackgroundDark`,
    rowBackgroundLight: `${PREFIX}-rowBackgroundLight`,
};

const VirtualizedTable = styled(MuiVirtualizedTable)(({ theme }) => ({
    [`.${classes.flexContainer}`]: {
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
    },
    [`.${classes.table}`]: {
        // temporary right-to-left patch, waiting for
        // https://github.com/bvaughn/react-virtualized/issues/454
        '& .ReactVirtualized__Table__headerRow': {
            flip: false,
            paddingRight:
                theme.direction === 'rtl' ? '0 !important' : undefined,
        },
        '& .ReactVirtualized__Table__Grid': {
            outline: 'none',
        },
    },
    [`.${classes.tableRow}`]: {
        cursor: 'pointer',
    },
    [`.${classes.tableRowHover}`]: {
        '&:hover': {
            backgroundColor: theme.row.hover,
        },
    },
    [`.${classes.tableCell}`]: {
        flex: 1,
        padding: DEFAULT_CELL_PADDING,
    },
    [`.${classes.noClick}`]: {
        cursor: 'initial',
    },
    [`.${classes.tableCellColor}`]: {
        color: theme.link.color,
    },
    [`.${classes.header}`]: {
        backgroundColor: 'inherit',
    },
    [`.${classes.rowBackgroundDark}`]: {
        backgroundColor: theme.row.primary,
    },
    [`.${classes.rowBackgroundLight}`]: {
        backgroundColor: theme.row.secondary,
    },
}));

export default VirtualizedTable;
