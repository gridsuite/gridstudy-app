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

export const styles = {
    container: (theme) => ({
        position: 'relative',
        flexGrow: 1,
        marginTop: theme.spacing(1),
        overflow: 'auto',
        height: '100%',
    }),
    dragHandle: { display: 'flex', alignItems: 'center', cursor: 'grab' },
    modificationLabel: { textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'preserve nowrap' },
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
    }),
    th: {
        borderTop: `1px solid #68686e`,
        borderBottom: `1px solid #68686e`,
        padding: 2,
        textAlign: 'left',
        fontWeight: 600,
    },
    tr: {
        display: 'flex',
        alignItems: 'center',
        '&:hover': {
            '& .edit-description-button': {
                opacity: 1,
                pointerEvents: 'auto',
            },
        },
    },
    td: {
        padding: 0,
    },
    tableBody: {
        position: 'relative',
    },
    tableCell: (theme) => ({
        fontSize: 'small',
        minWidth: 0,
        cursor: 'inherit',
        display: 'flex',
        '&:before': {
            content: '""',
            position: 'absolute',
            left: theme.spacing(0.5),
            right: theme.spacing(0.5),
            bottom: 0,
        },
    }),
    dragRowClone: {
        backgroundColor: 'background.paper',
        boxShadow: 4,
        opacity: 1,
        border: '1px solid #f5f5f5',
        display: 'flex',
        borderRadius: 4,
        width: 'fit-content',
    },
    overflow: {
        whiteSpace: 'pre',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
    coloredButton: (theme) => ({
        color: theme.palette.text.primary,
    }),
} as const satisfies MuiStyles;

export const createRowStyle = (
    provided: DraggableProvided,
    snapshot: DraggableStateSnapshot,
    virtualRow: VirtualItem
) => ({
    ...provided.draggableProps.style,
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: `${virtualRow.size}px`,
    transform: snapshot.isDragging ? provided.draggableProps.style?.transform : `translateY(${virtualRow.start}px)`,
    transition: snapshot.isDragging ? 'none' : 'transform 0.2s ease',
});

export const createCellStyle = (cell: any, styles: any) => ({
    ...styles.td,
    ...cell.column.columnDef.meta?.cellStyle,
    width: cell.column.id === 'modificationName' ? '100%' : cell.column.getSize(),
    maxWidth: cell.column.id === 'modificationName' ? '100%' : cell.column.getSize(),
    minWidth: cell.column.columnDef.minSize,
    height: `${MODIFICATION_ROW_HEIGHT}px`,
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
});

export const createHeaderCellStyle = (header: any, styles: any) => ({
    ...styles.th,
    width: header.column.id === 'modificationName' ? '100%' : header.column.getSize(),
    maxWidth: header.column.id === 'modificationName' ? '100%' : header.column.getSize(),
    minWidth: header.column.columnDef.minSize,
    height: `${MODIFICATION_ROW_HEIGHT}px`,
    display: 'flex',
    alignItems: 'center',
    paddingTop: '2.5vh',
    paddingBottom: '2.5vh',
});
