/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColumnMovedEvent, ColumnState } from 'ag-grid-community';
import { SpreadsheetTabDefinition } from '../../../types/spreadsheet.type';
import { ROW_INDEX_COLUMN_STATE } from '../../../constants';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { SPREADSHEET_SORT_STORE } from 'utils/store-sort-filter-fields';
import { updateTableDefinition } from 'redux/actions';
import { snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import { reorderSpreadsheetColumns } from 'services/study/study-config';

export function useColumnManagement(
    gridRef: React.RefObject<AgGridReact | null>,
    tableDefinition: SpreadsheetTabDefinition
) {
    const dispatch = useDispatch();
    const { snackError } = useSnackMessage();
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const sortConfig = useSelector(
        (state: AppState) => state.tableSort[SPREADSHEET_SORT_STORE]?.[tableDefinition?.uuid]
    );

    const updateSortConfig = useCallback(() => {
        gridRef.current?.api?.applyColumnState({
            state: sortConfig,
            defaultState: { sort: null },
        });
    }, [sortConfig, gridRef]);

    const updateLockedColumnsConfig = useCallback(() => {
        // Add any other locked columns from the table definition
        const userLockedColumns =
            tableDefinition?.columns
                ?.filter((column) => column.visible && column.locked)
                ?.map((column) => {
                    return {
                        colId: column.id ?? '',
                        pinned: 'left',
                    } as ColumnState;
                }) || [];

        // Apply column state with the specified default
        // Start with the row index column which should always be pinned left
        gridRef.current?.api?.applyColumnState({
            state: [ROW_INDEX_COLUMN_STATE, ...userLockedColumns],
            defaultState: { pinned: null },
        });
    }, [tableDefinition, gridRef]);

    const handleColumnDrag = useCallback(
        (event: ColumnMovedEvent) => {
            const colId = event.column?.getColId();
            if (!studyUuid || !colId || !event.finished || event.toIndex === undefined) {
                return;
            }
            // Adjust toIndex to account for the row index column which is always first
            // When moving a column, we need to subtract 1 from AG Grid's toIndex
            // because our tableDefinition doesn't include the row index column
            const adjustedToIndex = Math.max(0, event.toIndex - 1);

            // Move the dragged column in the full array
            const allColumns = [...tableDefinition.columns];
            const sourceIndex = allColumns.findIndex((col) => col.id === colId);

            const [movedColumn] = allColumns.splice(sourceIndex, 1);
            allColumns.splice(adjustedToIndex, 0, movedColumn);

            // Restore invisible columns to their original positions
            const originalColumns = tableDefinition.columns;
            const reordered = [...allColumns];
            originalColumns.forEach((col, idx) => {
                if (!col.visible) {
                    const currentIdx = reordered.findIndex((c) => c.id === col.id);
                    if (currentIdx !== -1) {
                        const [invisibleCol] = reordered.splice(currentIdx, 1);
                        reordered.splice(idx, 0, invisibleCol);
                    }
                }
            });

            reorderSpreadsheetColumns(
                studyUuid,
                tableDefinition.uuid,
                reordered.map((col) => col.uuid)
            )
                .then(() => {
                    dispatch(
                        updateTableDefinition({
                            ...tableDefinition,
                            columns: reordered,
                        })
                    );
                })
                .catch((error) => {
                    snackWithFallback(snackError, error, { headerId: 'spreadsheet/reorder_columns/error' });
                });
        },
        [studyUuid, tableDefinition, dispatch, snackError]
    );

    return {
        updateSortConfig,
        updateLockedColumnsConfig,
        handleColumnDrag,
    };
}
