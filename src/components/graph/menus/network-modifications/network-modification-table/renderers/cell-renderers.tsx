/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ComposedModificationMetadata,
    createRootNetworkChipCellSx,
    DragHandleCell,
    NameCell,
    NetworkModificationEditorNameHeader,
    networkModificationTableStyles,
    SelectCell,
    SelectHeaderCell,
} from '@gridsuite/commons-ui';
import { CellContext, HeaderContext } from '@tanstack/react-table';
import { Badge, Box, Tooltip } from '@mui/material';
import { RemoveRedEye as RemoveRedEyeIcon } from '@mui/icons-material';
import { FormattedMessage } from 'react-intl';
import DescriptionCell from './description-cell';
import SwitchCell from './switch-cell';
import RootNetworkChipCell from './root-network-chip-cell';

/**
 * Cell/header renderers must keep a stable reference across renders: react-table calls
 * `flexRender(columnDef.cell, ctx)`, and when a renderer function is used as a component,
 * a new function reference is treated as a different component type — which can
 * unmount/remount the cell and reset its local state.
 *
 * But what matters is the *scope* the renderer is defined in, not whether it is inline or named.
 * An inline arrow inside a module-scope constant (e.g. `BASE_COLUMNS`) is created once and is
 * just as stable as a named component. The renderers below are hoisted because they are reused
 * by `createRootNetworksColumns`, which is a factory called inside a hook — defining them inline
 * there would produce a fresh reference on every call.
 *
 * Dynamic values are routed via react-table's `meta`: table-wide via `table.options.meta`,
 * per-column via `column.columnDef.meta`.
 */

type CCtx = CellContext<ComposedModificationMetadata, unknown>;
type HCtx = HeaderContext<ComposedModificationMetadata, unknown>;

export function DragHandleRenderer({ table }: CCtx) {
    return <DragHandleCell isRowDragDisabled={table.options.meta?.isRowDragDisabled ?? false} />;
}

export function SelectHeaderRenderer({ table }: HCtx) {
    return <SelectHeaderCell table={table} />;
}

export function SelectCellRenderer({ row, table }: CCtx) {
    return <SelectCell row={row} table={table} />;
}

export function NameHeaderRenderer({ table }: HCtx) {
    const meta = table.options.meta;
    const nameHeaderProps = meta?.nameHeaderProps;
    if (!nameHeaderProps) {
        return null;
    }
    return (
        <NetworkModificationEditorNameHeader modificationCount={meta?.modificationsCount ?? 0} {...nameHeaderProps} />
    );
}

export function NameCellRenderer({ row, column }: CCtx) {
    return <NameCell row={row} onEditNameCell={column.columnDef.meta?.onEditNameCell} />;
}

export function DescriptionCellRenderer({ row }: CCtx) {
    return <DescriptionCell data={row.original} />;
}

export function SwitchCellRenderer({ row }: CCtx) {
    return <SwitchCell data={row.original} />;
}

export function RootNetworkHeaderRenderer({ column, table }: HCtx) {
    const colMeta = column.columnDef.meta;
    const tableMeta = table.options.meta;
    if (!colMeta?.isCurrentRootNetwork || (tableMeta?.modificationsCount ?? 0) < 1) {
        return null;
    }
    return (
        <Box sx={networkModificationTableStyles.rootNetworkHeader}>
            <Tooltip
                title={<FormattedMessage id="visualizedRootNetwork" values={{ tag: colMeta.currentRootNetworkTag }} />}
            >
                <Badge overlap="circular" color="primary" variant="dot">
                    <RemoveRedEyeIcon />
                </Badge>
            </Tooltip>
        </Box>
    );
}

export function RootNetworkCellRenderer({ row, column }: CCtx) {
    const meta = column.columnDef.meta;
    if (!meta?.rootNetwork || !meta.modificationsToExclude || !meta.setModificationsToExclude) {
        return null;
    }
    return (
        <Box sx={createRootNetworkChipCellSx(row.original.activated)}>
            <RootNetworkChipCell
                data={row.original}
                rootNetwork={meta.rootNetwork}
                modificationsToExclude={meta.modificationsToExclude}
                setModificationsToExclude={meta.setModificationsToExclude}
            />
        </Box>
    );
}
