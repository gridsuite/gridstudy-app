/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { memo, useCallback } from 'react';
import { flexRender, Row } from '@tanstack/react-table';
import { Box, TableCell, TableRow, Tooltip } from '@mui/material';
import {
    BORDER_SUPPRESSED_COLUMNS,
    createCellContentWrapperSx,
    createCellStyle,
    createRowSx,
    networkModificationTableStyles,
} from '../network-modification-table-styles';
import { Draggable, DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { VirtualItem } from '@tanstack/react-virtual';
import { AUTO_EXTENSIBLE_COLUMNS, BASE_MODIFICATION_TABLE_COLUMNS } from '../columns-definition';
import { useTheme } from '@mui/material/styles';
import { ComposedModificationMetadata } from '../utils';
import { FormattedMessage } from 'react-intl';
import { mergeSx } from '@gridsuite/commons-ui';

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
                                networkModificationTableStyles.tableRow,
                                createRowSx(theme, isHighlighted, snapshot.isDragging, virtualRow, row.depth)
                            )}
                        >
                            {row.getVisibleCells().map((cell) => {
                                const isNameColumn = cell.column.id === BASE_MODIFICATION_TABLE_COLUMNS.NAME.id;
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
                                                <Box
                                                    sx={createCellContentWrapperSx(
                                                        theme,
                                                        (isExpanded || row.depth > 0) &&
                                                            BORDER_SUPPRESSED_COLUMNS.has(
                                                                cell.column.columnDef.id ?? ''
                                                            )
                                                    )}
                                                    {...provided.dragHandleProps}
                                                >
                                                    {cellContent}
                                                </Box>
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
                                                <Box
                                                    sx={createCellContentWrapperSx(
                                                        theme,
                                                        (isExpanded || row.depth > 0) &&
                                                            BORDER_SUPPRESSED_COLUMNS.has(
                                                                cell.column.columnDef.id ?? ''
                                                            )
                                                    )}
                                                >
                                                    {cellContent}
                                                </Box>
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
                                        {isNameColumn ? (
                                            // NameCell owns its own borders entirely
                                            flexRender(cell.column.columnDef.cell, cell.getContext())
                                        ) : (
                                            <Box
                                                sx={createCellContentWrapperSx(
                                                    theme,
                                                    (isExpanded || row.depth > 0) &&
                                                        BORDER_SUPPRESSED_COLUMNS.has(cell.column.columnDef.id ?? '')
                                                )}
                                            >
                                                {cellContent}
                                            </Box>
                                        )}
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
