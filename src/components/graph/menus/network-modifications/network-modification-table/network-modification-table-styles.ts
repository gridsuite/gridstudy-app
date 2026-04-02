/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MuiStyles } from '@gridsuite/commons-ui';
import { VirtualItem } from '@tanstack/react-virtual';
import { SxProps, Theme } from '@mui/material';
import { alpha, darken, lighten } from '@mui/material/styles';
import { CSSProperties } from 'react';

const HIGHLIGHT_COLOR_BASE = 'rgba(144, 202, 249, 0.16)';
const HIGHLIGHT_COLOR_HOVER = 'rgba(144, 202, 249, 0.24)';
const ROW_HOVER_COLOR = 'rgba(144, 202, 249, 0.08)';
const DRAG_OPACITY = 0.5;
const DEACTIVATED_OPACITY = 0.4;

export const MODIFICATION_ROW_HEIGHT = 41;
export const DEPTH_CELL_WIDTH: number = 32;

export const createCellBorderColor = (theme: Theme): string =>
    theme.palette.mode === 'light'
        ? lighten(alpha(theme.palette.divider, 1), 0.88)
        : darken(alpha(theme.palette.divider, 1), 0.68);

// Static styles

export const networkModificationTableStyles = {
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
        padding: theme.spacing(1),
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
        paddingLeft: '0.5vw',
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
    nameCellInnerRow: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        flex: 1,
        minWidth: 0,
        alignSelf: 'stretch',
    },
    nameCellTogglerBox: {
        width: `${DEPTH_CELL_WIDTH}px`,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nameCellToggleButton: {
        padding: '4px',
        width: `${DEPTH_CELL_WIDTH}px`,
        height: '32px',
    },
    nameCellLabelBoxPlain: {
        flex: 1,
        minWidth: 0,
    },
    // depth-box
    firstLevelDepthBox: (folder: boolean) => ({
        width: folder ? `${1 + DEPTH_CELL_WIDTH / 2}px` : `${DEPTH_CELL_WIDTH}px`,
        display: 'flex',
        justifyContent: folder ? 'right' : 'center',
        alignSelf: 'stretch',
        position: 'relative',
    }),
    depthBox: {
        width: `${DEPTH_CELL_WIDTH / 2}px`,
        display: 'flex',
        alignSelf: 'stretch',
        position: 'relative',
        justifyContent: 'flex-start',
    },
    depthBoxLine: {
        width: '1px',
        backgroundColor: 'divider',
        alignSelf: 'stretch',
    },
    depthBoxTick: {
        position: 'absolute',
        top: '50%',
        left: '100%',
        width: '5px',
        height: '1px',
        backgroundColor: 'divider',
    },
} as const satisfies MuiStyles;

// Dynamic styles

export const DROP_INDICATOR_TOP = 'inset 0 2px 0 #90caf9';
export const DROP_INDICATOR_BOTTOM = 'inset 0 -2px 0 #90caf9';

export const DROP_FORBIDDEN_INDICATOR_TOP = 'inset 0 2px 0 #FF3636';
export const DROP_FORBIDDEN_INDICATOR_BOTTOM = 'inset 0 -2px 0 #FF3636';

export const createRowSx = (
    theme: Theme,
    isHighlighted: boolean,
    isDragging: boolean,
    virtualRow: VirtualItem,
    depth: number
): SxProps => ({
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
    ...(depth === 0 && {
        borderTop: `1px solid ${createCellBorderColor(theme)}`,
    }),
});

export const createModificationNameCellStyle = (activated: boolean): CSSProperties => ({
    opacity: activated ? 1 : DEACTIVATED_OPACITY,
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
        borderTop: 'none',
        borderBottom: 'none',
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
export const BORDER_SUPPRESSED_COLUMNS = new Set(['dragHandle', 'select']);

export const createCellContentWrapperSx = (theme: Theme, areBordersSuppressed: boolean): SxProps => ({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    borderTop: areBordersSuppressed ? 'none' : `1px solid ${createCellBorderColor(theme)}`,
    borderBottom: areBordersSuppressed ? 'none' : `1px solid ${createCellBorderColor(theme)}`,
});

export const createNameCellRootStyle = (theme: Theme, isExpanded: boolean, depth: number) => ({
    height: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'stretch',
    gap: 0,
    ...(depth === 0 &&
        !isExpanded && {
            borderTop: `1px solid ${createCellBorderColor(theme)}`,
            borderBottom: `1px solid ${createCellBorderColor(theme)}`,
        }),
});

export const createNameCellLabelBoxSx = (isExpanded: boolean, depth: number): SxProps<Theme> => {
    return {
        alignSelf: 'stretch',
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        minWidth: 0,
        ...((depth > 0 || isExpanded) && {
            borderTop: (theme: Theme) => `1px solid ${createCellBorderColor(theme)}`,
            borderBottom: (theme: Theme) => `1px solid ${createCellBorderColor(theme)}`,
            borderLeft: (theme: Theme) => `1px solid ${createCellBorderColor(theme)}`,
        }),
    };
};
