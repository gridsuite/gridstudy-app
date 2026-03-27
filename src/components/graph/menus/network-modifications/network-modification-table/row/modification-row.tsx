/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { memo, useCallback } from 'react';
import { flexRender, Row } from '@tanstack/react-table';
import { mergeSx, NetworkModificationMetadata } from '@gridsuite/commons-ui';
import { TableCell, TableRow, Tooltip } from '@mui/material';
import { createCellStyle, createRowSx, styles } from '../styles';
import { Draggable, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { VirtualItem } from '@tanstack/react-virtual';
import { AUTO_EXTENSIBLE_COLUMNS, BASE_MODIFICATION_TABLE_COLUMNS } from '../columns-definition';
import { FormattedMessage } from 'react-intl';

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
                            sx={mergeSx(styles.tableRow, createRowSx(isHighlighted, snapshot.isDragging, virtualRow))}
                        >
                            {row.getVisibleCells().map((cell) => {
                                const isDragHandle = cell.column.id === BASE_MODIFICATION_TABLE_COLUMNS.DRAG_HANDLE.id;
                                const isCheckboxColumn = cell.column.id === BASE_MODIFICATION_TABLE_COLUMNS.SELECT.id;
                                const cellContent = flexRender(cell.column.columnDef.cell, cell.getContext());
                                // Tooltip for drag
                                if (isDragHandle) {
                                    return (
                                        <TableCell
                                            key={cell.id}
                                            sx={createCellStyle(cell, AUTO_EXTENSIBLE_COLUMNS.includes(cell.column.id))}
                                        >
                                            <Tooltip title={<FormattedMessage id={'moveModification'} />} arrow>
                                                <span {...provided.dragHandleProps}>{cellContent}</span>
                                            </Tooltip>
                                        </TableCell>
                                    );
                                }

                                // Tooltip for checkbox
                                if (isCheckboxColumn) {
                                    return (
                                        <TableCell
                                            key={cell.id}
                                            sx={createCellStyle(cell, AUTO_EXTENSIBLE_COLUMNS.includes(cell.column.id))}
                                            onClick={() => handleCellClickCallback(cell.column.id)}
                                        >
                                            <Tooltip
                                                title={
                                                    <FormattedMessage
                                                        id={
                                                            row.getIsSelected()
                                                                ? 'deselectModification'
                                                                : 'selectModification'
                                                        }
                                                    />
                                                }
                                                arrow
                                            >
                                                <span>{cellContent}</span>
                                            </Tooltip>
                                        </TableCell>
                                    );
                                }

                                return (
                                    <TableCell
                                        key={cell.id}
                                        sx={createCellStyle(cell, AUTO_EXTENSIBLE_COLUMNS.includes(cell.column.id))}
                                        onClick={() => handleCellClickCallback(cell.column.id)}
                                    >
                                        {cellContent}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    );
                }}
            </Draggable>
        );
    }
);

export default ModificationRow;
