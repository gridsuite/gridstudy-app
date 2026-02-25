/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MuiStyles } from '@gridsuite/commons-ui';
import { DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { VirtualItem } from '@tanstack/react-virtual';
import { MODIFICATION_ROW_HEIGHT } from './network-modifications-table';
import { AUTO_EXTENSIBLE_COLUMNS } from './columns-definition';
import { CSSProperties } from 'react';
import { Theme } from '@mui/material';

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
    tr: {
        display: 'flex',
        alignItems: 'center',
        '.dragHandle': {
            opacity: 0,
        },
        '&:hover': {
            backgroundColor: 'rgba(144, 202, 249, 0.08)',
            '& .editDescription': {
                opacity: 1,
                cursor: 'pointer',
            },
            '& .dragHandle': {
                opacity: 1,
            },
        },
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
    dragHandle: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'grab',
        paddingLeft: 0.5,
        opacity: 1,
    },
    modificationLabel: { textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'preserve nowrap' },
} as const satisfies MuiStyles;

export const DROP_INDICATOR_TOP = 'inset 0 2px 0 #90caf9';
export const DROP_INDICATOR_BOTTOM = 'inset 0 -2px 0 #90caf9';

export const createRowStyle = (
    provided: DraggableProvided,
    snapshot: DraggableStateSnapshot,
    virtualRow: VirtualItem
): CSSProperties => {
    if (snapshot.isDragging) {
        return {
            ...provided.draggableProps.style,
            height: `${virtualRow.size}px`,
            transition: 'none',
            zIndex: 1,
        };
    }
    return {
        ...provided.draggableProps.style,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: `${virtualRow.size}px`,
        transform: `translateY(${virtualRow.start}px)`,
        transition: 'none',
    };
};

export const createCellStyle = (cell: any) => {
    const isAutoExtensible = AUTO_EXTENSIBLE_COLUMNS.includes(cell.column.id);
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

export const createHeaderCellStyle = (header: any, theme: Theme) => {
    const isAutoExtensible = AUTO_EXTENSIBLE_COLUMNS.includes(header.column.id);
    const size = header.column.getSize();
    const minSize = header.column.columnDef.minSize;

    return {
        ...header.column.columnDef.meta?.cellStyle,
        flex: isAutoExtensible ? `1 1 ${size}px` : `0 1 ${size}px`,
        minWidth: minSize ? `${minSize}px` : undefined,
        height: `${MODIFICATION_ROW_HEIGHT}px`,
        padding: 2,
        textAlign: 'left',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        paddingTop: '1.5vh',
        paddingBottom: '1.5vh',
        backgroundColor: theme.palette.background.paper,
    };
};

export const createEditDescriptionStyle = (description: string) => ({
    opacity: description ? 1 : 0,
    cursor: 'pointer',
});
