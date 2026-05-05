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
 * Renderers are defined as named module-scope components so their reference is stable across renders.
 * Without this, every rebuild of the `columns` memo produces new inline functions which React treats as
 * different component types, unmounting/remounting cells and resetting their local state. Dynamic values
 * are routed via react-table's `meta` (table-wide via `table.options.meta`, per-column via `column.columnDef.meta`).
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

export function NameCellRenderer({ row }: CCtx) {
    return <NameCell row={row} />;
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
