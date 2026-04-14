/*
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { FunctionComponent, useCallback, useMemo } from 'react';
import { Checkbox } from '@mui/material';
import { Row, Table } from '@tanstack/react-table';
import { networkModificationTableStyles } from '../network-modification-table-styles';
import { ComposedModificationMetadata } from '../utils';

interface SelectCellRendererProps {
    row: Row<ComposedModificationMetadata>;
    table: Table<ComposedModificationMetadata>;
}

const SelectCell: FunctionComponent<SelectCellRendererProps> = ({ row, table }) => {
    const meta = table.options.meta;

    const handleChange = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            const rows = table.getRowModel().flatRows;
            const currentIndex = rows.indexOf(row);
            const nextSelection = { ...table.getState().rowSelection };

            // When shift is held and a previous click exists, select or deselect the contiguous range between
            // the two clicks instead of toggling a single row.
            if (
                event.shiftKey &&
                meta?.lastClickedIndex.current !== null &&
                meta?.lastClickedIndex.current !== undefined
            ) {
                const lastIndex = meta.lastClickedIndex.current;
                const [from, to] = lastIndex < currentIndex ? [lastIndex, currentIndex] : [currentIndex, lastIndex];
                const isRowSelected = row.getIsSelected();

                rows.slice(from, to + 1).forEach((r) => {
                    if (r.getCanSelect()) {
                        r.toggleSelected(!isRowSelected);
                        if (isRowSelected) {
                            delete nextSelection[r.id];
                        } else {
                            nextSelection[r.id] = true;
                        }
                    }
                });
            } else {
                row.toggleSelected();
                if (row.getIsSelected()) {
                    // was selected, now toggled off
                    delete nextSelection[row.id];
                } else {
                    // was unselected, now toggled on
                    nextSelection[row.id] = true;
                }
            }

            if (meta) {
                meta.lastClickedIndex.current = currentIndex;
                const selectedRows = rows.filter((r) => nextSelection[r.id]).map((r) => r.original);
                meta.onRowSelected?.(selectedRows);
            }
        },
        [table, row, meta]
    );

    const hasPartiallySelectedSubRows = useMemo(
        () => row.subRows.some((subRow) => subRow.getIsSelected()) && !row.getIsSelected(),
        [row]
    );

    return (
        <Checkbox
            size="small"
            checked={row.getIsSelected()}
            indeterminate={hasPartiallySelectedSubRows}
            disabled={!row.getCanSelect()}
            onClick={handleChange}
            sx={networkModificationTableStyles.selectCheckBox}
        />
    );
};

export default SelectCell;
