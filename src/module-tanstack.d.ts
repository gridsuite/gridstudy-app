/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dispatch, RefObject, SetStateAction } from 'react';
import { SxProps, Theme } from '@mui/material';
import { ExcludedNetworkModifications, NameHeaderProps } from '@gridsuite/commons-ui';
import { RootNetworkMetadata } from 'components/graph/menus/network-modifications/network-modification-menu.type';

declare module '@tanstack/react-table' {
    // TableMeta = values shared by the whole table (same value across every cell).
    // Read at runtime via `table.options.meta` from any cell/header renderer.
    interface TableMeta<TData extends RowData> {
        lastClickedRowId: RefObject<string | null>;
        onRowSelected?: (selectedRows: TData[]) => void;
        isRowDragDisabled?: boolean;
        modificationsCount?: number;
        nameHeaderProps?: NameHeaderProps;
    }

    // ColumnMeta = values that differ from one column to another.
    // Read at runtime via `column.columnDef.meta` (per-column).
    // TData / TValue must match the original generic signature of ColumnMeta for the
    // module-augmentation merge to apply. They aren't referenced in this body, hence the disable.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ColumnMeta<TData extends RowData, TValue> {
        cellStyle?: SxProps<Theme>;
        rootNetwork?: RootNetworkMetadata;
        modificationsToExclude?: ExcludedNetworkModifications[];
        setModificationsToExclude?: Dispatch<SetStateAction<ExcludedNetworkModifications[]>>;
        isCurrentRootNetwork?: boolean;
        currentRootNetworkTag?: string;
    }
}
