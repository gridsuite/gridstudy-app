/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { memo, useCallback } from 'react';
import { flexRender, Row } from '@tanstack/react-table';
import { mergeSx, NetworkModificationMetadata } from '@gridsuite/commons-ui';
import { TableCell, TableRow } from '@mui/material';
import { createCellStyle, createRowStyle, createRowSx, styles } from '../styles';
import { Draggable, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { VirtualItem } from '@tanstack/react-virtual';
import { STATIC_MODIFICATION_TABLE_COLUMNS } from '../columns-definition';

interface ModificationRowProps {
    virtualRow: VirtualItem;
    row: Row<NetworkModificationMetadata>;
    handleCellClick?: (modification: NetworkModificationMetadata) => void;
    isRowDragDisabled: boolean;
    highlightedModificationUuid: string | null;
}

const ModificationRow = memo<ModificationRowProps>(
    ({ virtualRow, row, handleCellClick, isRowDragDisabled, highlightedModificationUuid }) => {
        const isHighlighted = row.original.uuid === highlightedModificationUuid;

        const handleCellClickCallback = useCallback(
            (columnId: string) => {
                if (columnId === STATIC_MODIFICATION_TABLE_COLUMNS.MODIFICATION_NAME.id) {
                    handleCellClick?.(row.original);
                }
            },
            [handleCellClick, row.original]
        );

        return (
            <Draggable draggableId={row.id} index={virtualRow.index} isDragDisabled={isRowDragDisabled}>
                {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                    <TableRow
                        className={'modificationRow'}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        data-row-id={row.original.uuid}
                        sx={mergeSx(styles.tr, createRowSx(isHighlighted, snapshot.isDragging))}
                        style={createRowStyle(provided, snapshot, virtualRow)}
                    >
                        {row.getVisibleCells().map((cell) => (
                            <TableCell
                                key={cell.id}
                                style={createCellStyle(cell)}
                                onClick={() => handleCellClickCallback(cell.column.id)}
                                {...(cell.column.id === STATIC_MODIFICATION_TABLE_COLUMNS.DRAG_HANDLE.id
                                    ? provided.dragHandleProps
                                    : undefined)}
                            >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                        ))}
                    </TableRow>
                )}
            </Draggable>
        );
    }
);

export default ModificationRow;
