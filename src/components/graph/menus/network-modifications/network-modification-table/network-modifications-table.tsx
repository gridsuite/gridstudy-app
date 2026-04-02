/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {
    Dispatch,
    FunctionComponent,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useSelector } from 'react-redux';
import {
    ColumnDef,
    ExpandedState,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    Updater,
    useReactTable,
} from '@tanstack/react-table';
import { DragDropContext, Droppable, DroppableProvided } from '@hello-pangea/dnd';
import { useVirtualizer } from '@tanstack/react-virtual';
import { NetworkModificationEditorNameHeaderProps } from './renderers/network-modification-node-editor-name-header';
import { ExcludedNetworkModifications } from '../network-modification-menu.type';
import {
    createHeaderCellStyle,
    MODIFICATION_ROW_HEIGHT,
    networkModificationTableStyles,
} from './network-modification-table-styles';
import { AUTO_EXTENSIBLE_COLUMNS, createBaseColumns, createRootNetworksColumns } from './columns-definition';
import ModificationRow from './row/modification-row';
import { useTheme } from '@mui/material/styles';
import { useModificationsDragAndDrop } from './use-modifications-drag-and-drop';
import { AppState } from '../../../../../redux/reducer.type';
import {
    ComposedModificationMetadata,
    fetchSubModificationsForExpandedRows,
    findAllLoadedCompositeModifications,
    formatComposedModification,
    isCompositeModification,
    mergeSubModificationsIntoTree,
    refetchSubModificationsForExpandedRows,
} from './utils';
import { NetworkModificationMetadata } from '@gridsuite/commons-ui';

interface NetworkModificationsTableProps extends Omit<NetworkModificationEditorNameHeaderProps, 'modificationCount'> {
    modifications: NetworkModificationMetadata[];
    setModifications: Dispatch<SetStateAction<NetworkModificationMetadata[]>>;
    handleCellClick: (modification: NetworkModificationMetadata) => void;
    isRowDragDisabled?: boolean;
    onRowDragStart: () => void;
    onRowDragEnd: () => void;
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

    const [expanded, setExpanded] = useState<ExpandedState>({});

    const [composedModifications, setComposedModifications] = useState<ComposedModificationMetadata[]>(
        formatComposedModification(modifications)
    );

    useEffect(() => {
        setComposedModifications((prevMods) => {
            // Rebuild from the new modifications prop, carrying over already-fetched subModifications
            // to avoid a visual flash of empty children while re-fetches are in flight.
            const nextMods = mergeSubModificationsIntoTree(formatComposedModification(modifications), prevMods);

            // Re-fetch for any composite that already has loaded sub-modifications, regardless of
            // whether it is currently expanded to avoid stale state
            let loadedComposite: ComposedModificationMetadata[] = [];
            findAllLoadedCompositeModifications(nextMods, loadedComposite);
            refetchSubModificationsForExpandedRows(
                loadedComposite.map((mod) => mod.uuid),
                nextMods,
                setComposedModifications
            );
            return nextMods;
        });
    }, [modifications]);

    const handleExpandRow = useCallback((updater: Updater<ExpandedState>) => {
        setExpanded((prevExpanded) => {
            const nextExpanded = typeof updater === 'function' ? updater(prevExpanded) : updater;

            const prevRecord = prevExpanded === true ? {} : prevExpanded;
            const nextRecord = nextExpanded === true ? {} : nextExpanded;
            const newlyExpandedIds = Object.keys(nextRecord).filter((id) => nextRecord[id] && !prevRecord[id]);

            setComposedModifications((prevMods) => {
                fetchSubModificationsForExpandedRows(newlyExpandedIds, prevMods, setComposedModifications);
                return prevMods;
            });

            return nextExpanded;
        });
    }, []);

    const columns = useMemo<ColumnDef<ComposedModificationMetadata>[]>(() => {
        const staticColumns = createBaseColumns(
            isRowDragDisabled,
            modifications.length,
            nameHeaderProps,
            setComposedModifications
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
        isMonoRootStudy,
        rootNetworks,
        currentRootNetworkUuid,
        modificationsToExclude,
        setModificationsToExclude,
    ]);

    const table = useReactTable({
        data: composedModifications,
        columns,
        state: { expanded },
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getSubRows: (row) => row.subModifications,
        getRowId: (row) => row.uuid,
        getRowCanExpand: (row) => isCompositeModification(row.original),
        enableRowSelection: true,
        enableSubRowSelection: false,
        enableExpanding: true,
        onExpandedChange: handleExpandRow,
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
        composedModifications,
        setComposedModifications,
        onDragEnd: onRowDragEnd,
    });

    useEffect(() => {
        table.resetRowSelection();
        table.resetExpanded();
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
            <Box sx={networkModificationTableStyles.tableWrapper}>
                <Droppable droppableId="modifications-table" mode="virtual" renderClone={renderClone}>
                    {(provided: DroppableProvided) => (
                        <Box ref={containerRef} sx={networkModificationTableStyles.container}>
                            <Table sx={networkModificationTableStyles.table}>
                                <TableHead sx={networkModificationTableStyles.thead}>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id} sx={networkModificationTableStyles.tableRow}>
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
                                    sx={{
                                        ...networkModificationTableStyles.tableBody,
                                        height: `${virtualizer.getTotalSize()}px`,
                                    }}
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
