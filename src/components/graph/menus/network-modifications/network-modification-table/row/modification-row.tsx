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
import { createCellStyle, createRowStyle, styles } from '../styles';
import { Draggable, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { VirtualItem } from '@tanstack/react-virtual';

interface ModificationRowProps {
    virtualRow: VirtualItem;
    row: Row<NetworkModificationMetadata>;
    handleCellClick?: (modification: NetworkModificationMetadata) => void;
    isRowDragDisabled: boolean;
    highlightedModificationUuid: string | null;
}

const ModificationRow = memo<ModificationRowProps>(
    ({ virtualRow, row, handleCellClick, isRowDragDisabled, highlightedModificationUuid }) => {
        const handleCellClickCallback = useCallback(
            (columnId: string) => {
                if (columnId === 'modificationName') {
                    handleCellClick?.(row.original);
                }
            },
            [handleCellClick, row.original]
        );

        return (
            <Draggable draggableId={row.id} index={virtualRow.index} isDragDisabled={isRowDragDisabled}>
                {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                    <TableRow
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        data-row-id={row.original.uuid}
                        data-depth={row.depth}
                        sx={mergeSx(styles.tr, {
                            backgroundColor:
                                row.original.uuid === highlightedModificationUuid ? 'action.selected' : 'transparent',
                            opacity: !row.original.activated ? 0.4 : snapshot.isDragging ? 0.5 : 1,
                        })}
                        style={createRowStyle(provided, snapshot, virtualRow)}
                    >
                        {row.getVisibleCells().map((cell) => (
                            <TableCell
                                key={cell.id}
                                style={createCellStyle(cell, styles)}
                                onClick={() => handleCellClickCallback(cell.column.id)}
                                {...(cell.column.id === 'dragHandle' ? provided.dragHandleProps : undefined)}
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
