/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { Dispatch, FunctionComponent, SetStateAction, useEffect, useMemo, useRef } from 'react';
import {
    AUTO_EXTENSIBLE_COLUMNS,
    createHeaderCellStyle,
    ExcludedNetworkModifications,
    MODIFICATION_ROW_HEIGHT,
    ModificationRow,
    NetworkModificationEditorNameHeaderProps,
    NetworkModificationMetadata,
    networkTableStyles,
    useModificationsDragAndDrop,
} from '@gridsuite/commons-ui';
import { Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useSelector } from 'react-redux';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { DragDropContext, DragStart, Droppable, DroppableProvided, DropResult } from '@hello-pangea/dnd';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useTheme } from '@mui/material/styles';
import { AppState } from '../../../../../redux/reducer.type';
import { createBaseColumns, createRootNetworksColumns } from './createColumns';

interface NetworkModificationsTableProps extends Omit<NetworkModificationEditorNameHeaderProps, 'modificationCount'> {
    modifications: NetworkModificationMetadata[];
    setModifications: Dispatch<SetStateAction<NetworkModificationMetadata[]>>;
    handleCellClick: (modification: NetworkModificationMetadata) => void;
    isRowDragDisabled?: boolean;
    onRowDragStart: (event: DragStart) => void;
    onRowDragEnd: (event: DropResult) => void;
    onRowSelected: (selectedRows: NetworkModificationMetadata[]) => void;
    modificationsToExclude: ExcludedNetworkModifications[];
    setModificationsToExclude: Dispatch<SetStateAction<ExcludedNetworkModifications[]>>;
}

const NetworkModificationsTable: FunctionComponent<NetworkModificationsTableProps> = ({
    modifications,
    setModifications,
    handleCellClick,
    isRowDragDisabled = false,
    onRowDragStart,
    onRowDragEnd,
    onRowSelected,
    modificationsToExclude,
    setModificationsToExclude,
    ...nameHeaderProps
}) => {
    const theme = useTheme();
    const rootNetworks = useSelector((state: AppState) => state.rootNetworks);
    const isMonoRootStudy = useSelector((state: AppState) => state.isMonoRootStudy);
    const highlightedModificationUuid = useSelector((state: AppState) => state.highlightedModificationUuid);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const currentTreeNodeId = useSelector((state: AppState) => state.currentTreeNode?.id);

    const containerRef = useRef<HTMLDivElement>(null);
    const lastClickedIndex = useRef<number | null>(null);

    const columns = useMemo<ColumnDef<NetworkModificationMetadata>[]>(() => {
        const staticColumns = createBaseColumns(
            isRowDragDisabled,
            modifications.length,
            nameHeaderProps,
            setModifications
        );
        const dynamicColumns = isMonoRootStudy
            ? []
            : createRootNetworksColumns(
                  rootNetworks,
                  currentRootNetworkUuid!,
                  modifications.length,
                  modificationsToExclude,
                  setModificationsToExclude
              );

        return [...staticColumns, ...dynamicColumns];
    }, [
        isRowDragDisabled,
        modifications,
        nameHeaderProps,
        setModifications,
        isMonoRootStudy,
        rootNetworks,
        currentRootNetworkUuid,
        modificationsToExclude,
        setModificationsToExclude,
    ]);

    const table = useReactTable({
        data: modifications,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.uuid,
        enableRowSelection: true,
        meta: { lastClickedIndex, onRowSelected },
    });

    const { rows } = table.getRowModel();

    const virtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => containerRef.current,
        overscan: 5,
        estimateSize: () => MODIFICATION_ROW_HEIGHT,
    });
    const virtualItems = virtualizer.getVirtualItems();

    const { handleDragUpdate, handleDragEnd, renderClone } = useModificationsDragAndDrop({
        rows,
        containerRef,
        onRowDragEnd,
        studyUuid,
        currentNodeId,
    });

    useEffect(() => {
        table.resetRowSelection();
        lastClickedIndex.current = null;
    }, [currentTreeNodeId, table]);

    useEffect(() => {
        if (highlightedModificationUuid && containerRef.current) {
            const rowIndex = rows.findIndex((row) => row.original.uuid === highlightedModificationUuid);
            if (rowIndex !== -1) {
                virtualizer.scrollToIndex(rowIndex, { align: 'start', behavior: 'auto' });
            }
        }
    }, [highlightedModificationUuid, rows, virtualizer]);

    return (
        <DragDropContext onDragEnd={handleDragEnd} onDragStart={onRowDragStart} onDragUpdate={handleDragUpdate}>
            <Box sx={networkTableStyles.tableWrapper}>
                <Droppable droppableId="modifications-table" mode="virtual" renderClone={renderClone}>
                    {(provided: DroppableProvided) => (
                        <Box ref={containerRef} sx={networkTableStyles.container}>
                            <Table sx={networkTableStyles.table}>
                                <TableHead sx={networkTableStyles.thead}>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id} sx={networkTableStyles.tableRow}>
                                            {headerGroup.headers.map((header) => (
                                                <TableCell
                                                    key={header.id}
                                                    sx={createHeaderCellStyle(
                                                        header,
                                                        theme,
                                                        header.index === 0,
                                                        header.index === headerGroup.headers.length - 1,
                                                        AUTO_EXTENSIBLE_COLUMNS.includes(header.column.id)
                                                    )}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHead>
                                <TableBody
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    sx={{ ...networkTableStyles.tableBody, height: `${virtualizer.getTotalSize()}px` }}
                                >
                                    {virtualItems.map((virtualRow) => {
                                        const row = rows[virtualRow.index];
                                        return (
                                            <ModificationRow
                                                key={row.id}
                                                virtualRow={virtualRow}
                                                row={row}
                                                handleCellClick={handleCellClick}
                                                isRowDragDisabled={isRowDragDisabled}
                                                highlightedModificationUuid={highlightedModificationUuid}
                                            />
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </Box>
                    )}
                </Droppable>
            </Box>
        </DragDropContext>
    );
};

export default NetworkModificationsTable;
