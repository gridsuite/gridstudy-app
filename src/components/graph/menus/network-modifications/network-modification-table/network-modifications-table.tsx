/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { Dispatch, FC, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NetworkModificationMetadata } from '@gridsuite/commons-ui';
import { Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import {
    ColumnDef,
    ExpandedState,
    flexRender,
    getCoreRowModel,
    RowSelectionState,
    useReactTable,
} from '@tanstack/react-table';
import {
    DragDropContext,
    DraggableProvided,
    DraggableRubric,
    DraggableStateSnapshot,
    DragStart,
    DragUpdate,
    Droppable,
    DroppableProvided,
    DropResult,
} from '@hello-pangea/dnd';
import { useVirtualizer } from '@tanstack/react-virtual';

import { NetworkModificationEditorNameHeaderProps } from './renderers/network-modification-node-editor-name-header';
import { ExcludedNetworkModifications } from '../network-modification-menu.type';
import { createHeaderCellStyle, DROP_INDICATOR_BOTTOM, DROP_INDICATOR_TOP, styles } from './styles';
import { createDynamicColumns, createStaticColumns } from './columns-definition';
import ModificationRow from './row/modification-row';
import DragCloneRow from './row/drag-row-clone';

export const MODIFICATION_ROW_HEIGHT = 41;

interface NetworkModificationsTableProps extends Omit<NetworkModificationEditorNameHeaderProps, 'modificationCount'> {
    modifications: NetworkModificationMetadata[];
    setModifications: Dispatch<SetStateAction<NetworkModificationMetadata[]>>;
    handleCellClick?: (modification: NetworkModificationMetadata) => void;
    isRowDragDisabled?: boolean;
    onRowDragStart?: (event: DragStart) => void;
    onRowDragEnd?: (event: DropResult) => void;
    onRowSelected?: (selectedRows: NetworkModificationMetadata[]) => void;
    modificationsToExclude: ExcludedNetworkModifications[];
    setModificationsToExclude: Dispatch<SetStateAction<ExcludedNetworkModifications[]>>;
}

const NetworkModificationsTable: FC<NetworkModificationsTableProps> = ({
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
    const rootNetworks = useSelector((state: AppState) => state.rootNetworks);
    const isMonoRootStudy = useSelector((state: AppState) => state.isMonoRootStudy);
    const highlightedModificationUuid = useSelector((state: AppState) => state.highlightedModificationUuid);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const currentTreeNodeId = useSelector((state: AppState) => state.currentTreeNode?.id);

    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [expanded, setExpanded] = useState<ExpandedState>({});

    const parentRef = useRef<HTMLDivElement>(null);

    const columns = useMemo<ColumnDef<NetworkModificationMetadata>[]>(() => {
        const staticColumns = createStaticColumns(isRowDragDisabled, modifications, nameHeaderProps, setModifications);
        const dynamicColumns = !isMonoRootStudy
            ? createDynamicColumns(
                  rootNetworks,
                  currentRootNetworkUuid!,
                  modifications.length,
                  modificationsToExclude,
                  setModificationsToExclude
              )
            : [];

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
        state: { rowSelection, expanded },
        onRowSelectionChange: setRowSelection,
        onExpandedChange: setExpanded,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.uuid,
        enableRowSelection: true,
    });

    const { rows } = table.getRowModel();

    const virtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => parentRef.current,
        overscan: 5,
        estimateSize: () => MODIFICATION_ROW_HEIGHT,
    });
    const virtualItems = virtualizer.getVirtualItems();

    useEffect(() => {
        setRowSelection({});
    }, [currentTreeNodeId]);

    useEffect(() => {
        if (onRowSelected) {
            const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
            onRowSelected(selectedRows);
        }
    }, [rowSelection, onRowSelected, table]);

    useEffect(() => {
        if (highlightedModificationUuid && parentRef.current) {
            const rowIndex = rows.findIndex((row) => row.original.uuid === highlightedModificationUuid);
            if (rowIndex !== -1) {
                virtualizer.scrollToIndex(rowIndex, { align: 'start', behavior: 'auto' });
            }
        }
    }, [highlightedModificationUuid, rows, virtualizer]);

    const clearRowDragIndicator = () => {
        parentRef.current?.querySelectorAll<HTMLElement>('.modificationRow').forEach((el) => {
            el.style.boxShadow = '';
        });
    };

    // Event handlers
    const handleDragUpdate = useCallback(
        (update: DragUpdate) => {
            clearRowDragIndicator();
            const { source, destination } = update;
            if (!destination || source.index === destination.index) return;
            const el = parentRef.current?.querySelector<HTMLElement>(
                `[data-row-id="${rows[destination.index]?.original.uuid}"]`
            );
            if (el) {
                el.style.boxShadow = destination.index > source.index ? DROP_INDICATOR_BOTTOM : DROP_INDICATOR_TOP;
            }
        },
        [rows]
    );

    const handleDragEnd = useCallback(
        (result: DropResult) => {
            clearRowDragIndicator();
            if (result.destination && result.source.index !== result.destination.index) {
                onRowDragEnd?.(result);
            }
        },
        [onRowDragEnd]
    );

    const renderClone = useCallback(
        (provided: DraggableProvided, snapshot: DraggableStateSnapshot, rubric: DraggableRubric) => (
            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                <DragCloneRow row={rows[rubric.source.index]} />
            </div>
        ),
        [rows]
    );

    return (
        <DragDropContext onDragEnd={handleDragEnd} onDragStart={onRowDragStart} onDragUpdate={handleDragUpdate}>
            <Droppable droppableId="modifications-table" mode="virtual" renderClone={renderClone}>
                {(provided: DroppableProvided) => (
                    <Box ref={parentRef} sx={styles.container}>
                        <Table sx={styles.table}>
                            <TableHead sx={styles.thead}>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id} sx={styles.tr}>
                                        {headerGroup.headers.map((header) => (
                                            <TableCell key={header.id} style={createHeaderCellStyle(header, styles)}>
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHead>
                            <TableBody
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                style={{ ...styles.tableBody, height: `${virtualizer.getTotalSize()}px` }}
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
        </DragDropContext>
    );
};

export default NetworkModificationsTable;
