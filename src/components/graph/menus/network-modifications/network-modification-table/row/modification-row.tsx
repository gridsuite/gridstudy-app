/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { memo, useCallback } from 'react';
import { flexRender, Row } from '@tanstack/react-table';
import { mergeSx } from '@gridsuite/commons-ui';
import { TableCell, TableRow } from '@mui/material';
import { createCellStyle, createRowSx, styles } from '../styles';
import { Draggable, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { VirtualItem } from '@tanstack/react-virtual';
import { AUTO_EXTENSIBLE_COLUMNS, BASE_MODIFICATION_TABLE_COLUMNS } from '../columns-definition';
import { useTheme } from '@mui/material/styles';
import { ComposedModificationMetadata } from '../utils';

interface ModificationRowProps {
    virtualRow: VirtualItem;
    row: Row<ComposedModificationMetadata>;
    handleCellClick?: (modification: ComposedModificationMetadata) => void;
    isRowDragDisabled: boolean;
    highlightedModificationUuid: string | null;
}

const ModificationRow = memo<ModificationRowProps>(
    ({ virtualRow, row, handleCellClick, isRowDragDisabled, highlightedModificationUuid }) => {
        const isHighlighted = row.original.uuid === highlightedModificationUuid;
        const theme = useTheme();
        const isExpanded = row.getIsExpanded() && !!row.subRows?.length;
        // Last leaf: depth > 0 and this row is the last child of its parent
        const parentSubRows = row.getParentRow()?.subRows;
        const isLastLeaf =
            row.depth > 0 && !!parentSubRows && row.index === parentSubRows[parentSubRows.length - 1].index;

        const handleCellClickCallback = useCallback(
            (columnId: string) => {
                if (columnId === BASE_MODIFICATION_TABLE_COLUMNS.NAME.id) {
                    handleCellClick?.(row.original);
                }
            },
            [handleCellClick, row.original]
        );

        return (
            <Draggable draggableId={row.id} index={virtualRow.index} isDragDisabled={isRowDragDisabled}>
                {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
                    const { style, ...draggablePropsWithoutStyle } = provided.draggableProps;
                    return (
                        <TableRow
                            ref={provided.innerRef}
                            {...draggablePropsWithoutStyle}
                            data-row-id={row.original.uuid}
                            sx={mergeSx(
                                styles.tableRow,
                                createRowSx(
                                    theme,
                                    isHighlighted,
                                    snapshot.isDragging,
                                    virtualRow,
                                    row.depth,
                                    isExpanded
                                )
                            )}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell
                                    key={cell.id}
                                    sx={createCellStyle(
                                        cell,
                                        AUTO_EXTENSIBLE_COLUMNS.includes(cell.column.id),
                                        row.depth,
                                        isExpanded
                                    )}
                                    onClick={() => handleCellClickCallback(cell.column.id)}
                                    {...(cell.column.id === BASE_MODIFICATION_TABLE_COLUMNS.DRAG_HANDLE.id
                                        ? provided.dragHandleProps
                                        : undefined)}
                                >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    );
                }}
            </Draggable>
        );
    }
);

export default ModificationRow;
