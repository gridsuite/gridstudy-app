/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MuiStyles } from '@gridsuite/commons-ui';
import { VirtualItem } from '@tanstack/react-virtual';
import { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { CSSProperties } from 'react';

const HIGHLIGHT_COLOR_BASE = 'rgba(144, 202, 249, 0.16)';
const HIGHLIGHT_COLOR_HOVER = 'rgba(144, 202, 249, 0.24)';
const ROW_HOVER_COLOR = 'rgba(144, 202, 249, 0.08)';
const DRAG_OPACITY = 0.5;
const DEACTIVATED_OPACITY = 0.4;

export const MODIFICATION_ROW_HEIGHT = 41;

// Static styles

export const styles = {
    tableWrapper: (theme) => ({
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        margin: theme.spacing(1),
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
        minHeight: 0,
    }),
    container: {
        position: 'relative',
        flexGrow: 1,
        overflow: 'auto',
        height: '100%',
    },
    table: (theme) => ({
        width: '100%',
        tableLayout: 'fixed',
        borderCollapse: 'collapse',
        backgroundColor: theme.palette.background.paper,
    }),
    thead: (theme) => ({
        backgroundColor: theme.palette.background.paper,
        position: 'sticky',
        top: 0,
        zIndex: 1,
        width: '100%',
        '& tr:hover': {
            backgroundColor: 'transparent',
        },
    }),
    tableRow: {
        display: 'flex',
        alignItems: 'center',
        transition: 'none',
        opacity: 1,
    },
    tableBody: {
        position: 'relative',
    },
    tableCell: {
        fontSize: 'small',
        minWidth: 0,
        display: 'flex',
    },
    dragRowClone: (theme) => ({
        backgroundColor: 'background.paper',
        boxShadow: 4,
        opacity: 1,
        border: '1px solid #f5f5f5',
        display: 'flex',
        width: 'fit-content',
        paddingRight: theme.spacing(1),
    }),
    overflow: {
        whiteSpace: 'pre',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
    selectCheckBox: (theme) => ({
        padding: theme.spacing(0.8),
    }),
    dragHandle: (theme) => ({
        display: 'flex',
        alignItems: 'center',
        cursor: 'grab',
        opacity: 0,
        padding: theme.spacing(0.5),
        'tr:hover &': { opacity: 1 },
    }),
    dragIndicatorIcon: {
        width: '16px',
        height: '16px',
    },
    modificationLabel: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
    },
    rootNetworkHeader: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
    },
    columnCell: {
        select: { padding: 2, justifyContent: 'center' },
        modificationName: { cursor: 'pointer', minWidth: 0, overflow: 'hidden', flex: 1 },
        rootNetworkChip: { textAlign: 'center' },
    },
} as const satisfies MuiStyles;

// Dynamic styles

export const DROP_INDICATOR_TOP = 'inset 0 2px 0 #90caf9';
export const DROP_INDICATOR_BOTTOM = 'inset 0 -2px 0 #90caf9';

export const createRowSx = (isHighlighted: boolean, isDragging: boolean, virtualRow: VirtualItem): SxProps => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: `${virtualRow.size}px`,
    transform: `translateY(${virtualRow.start}px)`,
    backgroundColor: isHighlighted ? HIGHLIGHT_COLOR_BASE : 'transparent',
    opacity: isDragging ? DRAG_OPACITY : 1,
    '&:hover': {
        backgroundColor: isHighlighted ? HIGHLIGHT_COLOR_HOVER : ROW_HOVER_COLOR,
    },
    ...(isDragging && { zIndex: 1, transform: 'none' }),
});

export const createModificationNameCellStyle = (activated: boolean): CSSProperties => ({
    opacity: activated ? 1 : DEACTIVATED_OPACITY,
    paddingLeft: '0.8vw',
});

export const createRootNetworkChipCellSx = (activated: boolean): SxProps => ({
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    opacity: activated ? 1 : DEACTIVATED_OPACITY,
});

export const createEditDescriptionStyle = (description: string | undefined): SxProps => ({
    opacity: description ? 1 : 0,
    cursor: description ? 'pointer' : 'default',
    'tr:hover &': { opacity: 1 },
});

export const createCellStyle = (cell: any, isAutoExtensible: boolean) => {
    const size = cell.column.getSize();
    const minSize = cell.column.columnDef.minSize;

    return {
        ...cell.column.columnDef.meta?.cellStyle,
        padding: 0,
        flex: isAutoExtensible ? `1 1 ${size}px` : `0 1 ${size}px`,
        minWidth: minSize ? `${minSize}px` : undefined,
        height: `${MODIFICATION_ROW_HEIGHT}px`,
        display: 'flex',
        alignItems: 'center',
    };
};

export const createHeaderCellStyle = (
    header: any,
    theme: Theme,
    isFirst: boolean,
    isLast: boolean,
    isAutoExtensible: boolean
) => {
    const darkBorder = `1px solid ${alpha(theme.palette.text.secondary, 0.4)}`;
    const size = header.column.getSize();
    const minSize = header.column.columnDef.minSize;

    return {
        ...header.column.columnDef.meta?.cellStyle,
        flex: isAutoExtensible ? `1 1 ${size}px` : `0 1 ${size}px`,
        minWidth: minSize ? `${minSize}px` : undefined,
        height: `${MODIFICATION_ROW_HEIGHT}px`,
        padding: '2px',
        textAlign: 'left',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        paddingTop: '1.5vh',
        paddingBottom: '1.5vh',
        backgroundColor: theme.palette.background.paper,
        borderBottom: darkBorder,
        borderTop: darkBorder,
        ...(isFirst && { borderLeft: darkBorder }),
        ...(isLast && { borderRight: darkBorder }),
    };
};
