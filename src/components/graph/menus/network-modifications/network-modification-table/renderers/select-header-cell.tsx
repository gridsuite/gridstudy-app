/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, useCallback } from 'react';
import { Checkbox } from '@mui/material';
import { Table } from '@tanstack/react-table';
import { NetworkModificationMetadata } from '@gridsuite/commons-ui';
import { TableMeta } from '../network-modifications-table';

interface SelectHeaderCellProps {
    table: Table<NetworkModificationMetadata>;
}

const SelectHeaderCell: FunctionComponent<SelectHeaderCellProps> = ({ table }) => {
    const handleClick = useCallback(() => {
        const meta = table.options.meta as TableMeta;
        const willSelectAll = !table.getIsAllRowsSelected();
        table.toggleAllRowsSelected();
        if (meta) {
            meta.lastClickedIndex.current = null;
            if (meta.onRowSelected) {
                const selectedRows = willSelectAll ? table.getCoreRowModel().rows.map((r) => r.original) : [];
                meta.onRowSelected(selectedRows);
            }
        }
    }, [table]);

    return (
        <Checkbox
            size="small"
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onClick={handleClick}
        />
    );
};

export default SelectHeaderCell;
