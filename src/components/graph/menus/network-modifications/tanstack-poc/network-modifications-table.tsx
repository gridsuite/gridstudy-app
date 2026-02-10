/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { memo, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { mergeSx, type MuiStyles, useModificationLabelComputer } from '@gridsuite/commons-ui';
import { RemoveRedEye as RemoveRedEyeIcon } from '@mui/icons-material';
import {
    Badge,
    Box,
    Checkbox,
    IconButton,
    SxProps,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Theme,
    Tooltip,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { useIntl } from 'react-intl';
import {
    ColumnDef,
    ExpandedState,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    Row,
    RowSelectionState,
    useReactTable,
} from '@tanstack/react-table';
import {
    DragDropContext,
    Draggable,
    DraggableProvided,
    DraggableStateSnapshot,
    DragStart,
    Droppable,
    DroppableProvided,
    DropResult,
} from '@hello-pangea/dnd';
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';
import type { UUID } from 'node:crypto';

import {
    NetworkModificationEditorNameHeader,
    NetworkModificationEditorNameHeaderProps,
} from '../network-modification-node-editor-name-header';
import RootNetworkChipCellRenderer from '../root-network-chip-cell-renderer';
import { ExcludedNetworkModifications } from '../network-modification-menu.type';
import DescriptionRenderer from './description-renderer-tanstack';
import SwitchCellRenderer from './switch-cell-renderer-tanstack';

export interface NetworkModificationMetadata {
    uuid: UUID;
    type: string;
    date: Date;
    stashed: boolean;
    activated: boolean;
    description: string;
    messageType: string;
    messageValues: string;
    subModifications: NetworkModificationMetadata[];
}

interface NetworkModificationsTableProps extends Omit<NetworkModificationEditorNameHeaderProps, 'modificationCount'> {
    modifications: NetworkModificationMetadata[];
    setModifications: React.Dispatch<SetStateAction<NetworkModificationMetadata[]>>;
    handleCellClick?: (modification: NetworkModificationMetadata) => void;
    isRowDragDisabled?: boolean;
    onRowDragStart?: (event: DragStart) => void;
    onRowDragEnd?: (event: DropResult) => void;
    onRowSelected?: (selectedRows: NetworkModificationMetadata[]) => void;
    modificationsToExclude: ExcludedNetworkModifications[];
    setModificationsToExclude: React.Dispatch<SetStateAction<ExcludedNetworkModifications[]>>;
}

interface ModificationRowProps {
    virtualRow: VirtualItem;
    row: Row<NetworkModificationMetadata>;
    handleCellClick?: (modification: NetworkModificationMetadata) => void;
    isRowDragDisabled: boolean;
    highlightedModificationUuid: string;
}

const styles = {
    container: (theme) => ({
        position: 'relative',
        flexGrow: 1,
        marginTop: theme.spacing(1),
        overflow: 'auto',
        height: '100%',
    }),
    table: (theme) => ({
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: theme.palette.background.paper,
    }),
    thead: (theme) => ({
        backgroundColor: theme.palette.background.paper,
        position: 'sticky',
        borderTop: `2px solid ${theme.palette.divider}`,
        borderBottom: `2px solid ${theme.palette.divider}`,
        top: 0,
        zIndex: 1,
    }),
    th: {
        padding: 0,
        textAlign: 'left',
        fontWeight: 600,
    },
    tbody: (theme) => ({
        backgroundColor: theme.palette.background.paper,
        position: 'relative',
    }),
    tr: {
        '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            '& .edit-description-button': {
                opacity: 1,
                pointerEvents: 'auto',
            },
        },
    },
    td: {
        padding: 0,
    },
    tableCell: (theme) => ({
        fontSize: 'small',
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
    overflow: {
        whiteSpace: 'pre',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
} as const satisfies MuiStyles;

const createIndentedCellStyle = (depth: number): SxProps<Theme> => ({
    paddingLeft: depth * 4,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
});

const createRowStyle = (provided: DraggableProvided, snapshot: DraggableStateSnapshot, virtualRow: VirtualItem) => ({
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

const createCellStyle = (cell: any, styles: any) => ({
    ...styles.td,
    ...(cell.column.columnDef.meta as any)?.cellStyle,
    width: cell.column.getSize(),
    minWidth: cell.column.columnDef.minSize,
    maxWidth: cell.column.getSize(),
});

const NetworkModificationNameCell = memo(({ row }: { row: Row<NetworkModificationMetadata> }) => {
    const intl = useIntl();
    const { computeLabel } = useModificationLabelComputer();

    const hasSubModifications = row.original.subModifications?.length > 0;
    const depth = row.depth;

    const getModificationLabel = useCallback(
        (modif?: NetworkModificationMetadata, formatBold: boolean = true) => {
            if (!modif) return '';
            return intl.formatMessage(
                { id: `network_modifications.${modif.messageType}` },
                { ...modif, ...(computeLabel(modif, formatBold) as any) }
            );
        },
        [computeLabel, intl]
    );

    const label = getModificationLabel(row.original);

    return (
        <Box sx={mergeSx(styles.tableCell, createIndentedCellStyle(depth))}>
            {hasSubModifications ? (
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        row.getToggleExpandedHandler()();
                    }}
                    sx={{ padding: '4px' }}
                    aria-label={row.getIsExpanded() ? 'Collapse' : 'Expand'}
                >
                    {row.getIsExpanded() ? (
                        <KeyboardArrowDownIcon fontSize="small" />
                    ) : (
                        <KeyboardArrowRightIcon fontSize="small" />
                    )}
                </IconButton>
            ) : (
                <Box sx={{ width: 28 }} />
            )}
            <Tooltip
                disableFocusListener
                disableTouchListener
                title={label}
                componentsProps={{
                    tooltip: { sx: { maxWidth: 'none' } },
                }}
            >
                <Box sx={styles.overflow}>{label}</Box>
            </Tooltip>
        </Box>
    );
});

const DragHandleCell = memo(({ isRowDragDisabled }: { isRowDragDisabled: boolean }) => {
    if (isRowDragDisabled) {
        return <Box sx={{ width: 24 }} />;
    }
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'grab' }}>
            <DragIndicatorIcon fontSize="small" />
        </Box>
    );
});

const createStaticColumns = (
    isRowDragDisabled: boolean,
    modifications: NetworkModificationMetadata[],
    nameHeaderProps: any,
    setModifications: React.Dispatch<SetStateAction<NetworkModificationMetadata[]>>
): ColumnDef<NetworkModificationMetadata>[] => [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllRowsSelected()}
                indeterminate={table.getIsSomeRowsSelected()}
                onChange={table.getToggleAllRowsSelectedHandler()}
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                disabled={!row.getCanSelect()}
                onChange={row.getToggleSelectedHandler()}
                onClick={(e) => e.stopPropagation()}
            />
        ),
        size: 50,
    },
    {
        id: 'dragHandle',
        header: '',
        cell: () => <DragHandleCell isRowDragDisabled={isRowDragDisabled} />,
        size: 40,
    },
    {
        id: 'modificationName',
        header: () => (
            <NetworkModificationEditorNameHeader modificationCount={modifications?.length} {...nameHeaderProps} />
        ),
        cell: ({ row }) => <NetworkModificationNameCell row={row} />,
        minSize: 200,
        size: Number.MAX_SAFE_INTEGER,
        meta: {
            cellStyle: { cursor: 'pointer' },
        },
    },
    {
        id: 'modificationDescription',
        header: '',
        cell: ({ row }) => <DescriptionRenderer data={row.original} />,
        size: 30,
    },
    {
        id: 'switch',
        header: '',
        cell: ({ row }) => <SwitchCellRenderer data={row.original} setModifications={setModifications} />,
        size: 60,
    },
];

const createDynamicColumns = (
    rootNetworks: any[],
    currentRootNetworkUuid: string,
    modificationsCount: number,
    modificationsToExclude: ExcludedNetworkModifications[],
    setModificationsToExclude: React.Dispatch<SetStateAction<ExcludedNetworkModifications[]>>
): ColumnDef<NetworkModificationMetadata>[] => {
    return rootNetworks.map((rootNetwork) => {
        const rootNetworkUuid = rootNetwork.rootNetworkUuid;
        const isCurrentRootNetwork = rootNetworkUuid === currentRootNetworkUuid;

        return {
            id: rootNetworkUuid,
            header: () =>
                isCurrentRootNetwork && modificationsCount >= 1 ? (
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <Badge overlap="circular" color="primary" variant="dot">
                            <RemoveRedEyeIcon />
                        </Badge>
                    </Box>
                ) : null,
            cell: ({ row }) => (
                <RootNetworkChipCellRenderer
                    data={row.original}
                    rootNetwork={rootNetwork}
                    modificationsToExclude={modificationsToExclude}
                    setModificationsToExclude={setModificationsToExclude}
                />
            ),
            size: 72,
            meta: {
                cellStyle: { textAlign: 'center' },
            },
        };
    });
};

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
                            display: 'table-row',
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

const DragCloneRow = memo(({ row }: { row: Row<NetworkModificationMetadata> }) => (
    <TableRow
        sx={mergeSx(styles.tr, {
            backgroundColor: 'background.paper',
            boxShadow: 4,
            opacity: 1,
        })}
    >
        {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id} style={createCellStyle(cell, styles)}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
        ))}
    </TableRow>
));

const NetworkModificationsTable: React.FC<NetworkModificationsTableProps> = ({
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
        getExpandedRowModel: getExpandedRowModel(),
        getRowId: (row, index, parent) => (parent ? `${parent.id}.${row.uuid}` : row.uuid),
        getSubRows: (row) => row.subModifications,
        getRowCanExpand: (row) => !!row.original.subModifications?.length,
        enableRowSelection: true,
        enableExpanding: true,
    });

    const { rows } = table.getRowModel();

    const virtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => parentRef.current,
        overscan: 5,
        estimateSize: () => 48,
    });
    const virtualItems = virtualizer.getVirtualItems();

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
                virtualizer.scrollToIndex(rowIndex, { align: 'center', behavior: 'smooth' });
            }
        }
    }, [highlightedModificationUuid, rows, virtualizer]);

    // Event handlers
    const handleDragStart = useCallback(
        (event: DragStart) => {
            onRowDragStart?.(event);
        },
        [onRowDragStart]
    );

    const handleDragEnd = useCallback(
        (result: DropResult) => {
            if (!result.destination || result.source.index === result.destination.index) {
                return;
            }
            onRowDragEnd?.(result);
        },
        [onRowDragEnd]
    );

    const renderClone = useCallback(
        (provided: DraggableProvided, snapshot: DraggableStateSnapshot, rubric: any) => (
            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                <DragCloneRow row={rows[rubric.source.index]} />
            </div>
        ),
        [rows]
    );

    return (
        <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
            <Droppable droppableId="modifications-table" mode="virtual" renderClone={renderClone}>
                {(provided: DroppableProvided) => (
                    <Box ref={parentRef} sx={styles.container}>
                        <Table sx={styles.table}>
                            <TableHead sx={styles.thead}>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableCell
                                                key={header.id}
                                                style={{
                                                    ...styles.th,
                                                    width: header.getSize(),
                                                    padding: 0,
                                                    minWidth: header.column.columnDef.minSize,
                                                }}
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHead>
                            <TableBody
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                sx={styles.tbody}
                                style={{ height: `${virtualizer.getTotalSize()}px` }}
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
                                            highlightedModificationUuid={highlightedModificationUuid ?? ''}
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

export default memo(NetworkModificationsTable);
