/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { RefObject, useCallback } from 'react';
import { Checkbox } from '@mui/material';
import { Row, Table } from '@tanstack/react-table';
import { NetworkModificationMetadata } from '@gridsuite/commons-ui';

interface SelectCellRendererProps {
    row: Row<NetworkModificationMetadata>;
    table: Table<NetworkModificationMetadata>;
}

const SelectCellRenderer: React.FC<SelectCellRendererProps> = ({ row, table }) => {
    const meta = table.options.meta as RangeSelectionTableMeta | undefined;

    const handleChange = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            const rows = table.getRowModel().rows;
            const currentIndex = row.index;

            if (
                event.shiftKey &&
                meta?.lastClickedIndex.current !== null &&
                meta?.lastClickedIndex.current !== undefined
            ) {
                const lastIndex = meta.lastClickedIndex.current;
                const [from, to] = lastIndex < currentIndex ? [lastIndex, currentIndex] : [currentIndex, lastIndex];
                const targetSelected = !row.getIsSelected();

                rows.slice(from, to + 1).forEach((r) => {
                    if (r.getCanSelect()) {
                        r.toggleSelected(targetSelected);
                    }
                });
            } else {
                row.toggleSelected();
            }

            if (meta) {
                meta.lastClickedIndex.current = currentIndex;
            }
        },
        [row, table, meta]
    );

    return (
        <Checkbox size="small" checked={row.getIsSelected()} disabled={!row.getCanSelect()} onClick={handleChange} />
    );
};

export default SelectCellRenderer;

export interface RangeSelectionTableMeta {
    lastClickedIndex: RefObject<number | null>;
}
