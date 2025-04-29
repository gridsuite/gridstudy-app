/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColumnMovedEvent, ColumnState } from 'ag-grid-community';
import { SpreadsheetTabDefinition } from '../config/spreadsheet.type';
import { ROW_INDEX_COLUMN_ID } from '../constants';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { SPREADSHEET_SORT_STORE } from 'utils/store-sort-filter-fields';
import { updateTableDefinition } from 'redux/actions';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { reorderSpreadsheetColumns } from 'services/study/study-config';

export function useColumnManagement(gridRef: React.RefObject<AgGridReact>, tableDefinition: SpreadsheetTabDefinition) {
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
        // Start with the row index column which should always be pinned left
        const lockedColumnsConfig: ColumnState[] = [
            {
                colId: ROW_INDEX_COLUMN_ID,
                pinned: 'left',
            },
        ];

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
        gridRef.current?.api?.applyColumnState({
            state: [...lockedColumnsConfig, ...userLockedColumns],
            defaultState: { pinned: null },
        });
    }, [tableDefinition, gridRef]);

    const isLockedColumnNamesEmpty = useMemo(
        () => !tableDefinition?.columns?.some((col) => col.locked),
        [tableDefinition?.columns]
    );

    // Create a map to store the original positions of all columns
    const originalColumnPositions = useMemo(() => {
        const positions = new Map<string, number>();
        tableDefinition?.columns.forEach((col, index) => {
            positions.set(col.id, index);
        });
        return positions;
    }, [tableDefinition?.columns]);

    const handleColumnDrag = useCallback(
        (event: ColumnMovedEvent) => {
            const colId = event.column?.getColId();
            if (studyUuid && colId && event.finished && event.toIndex !== undefined) {
                // Adjust toIndex to account for the row index column which is always first
                // When moving a column, we need to subtract 1 from AG Grid's toIndex
                // because our tableDefinition doesn't include the row index column
                const adjustedToIndex = Math.max(0, event.toIndex - 1);

                let reorderedTableDefinitionIndexesTemp = [...tableDefinition.columns.filter((col) => col.visible)];
                const sourceIndex = reorderedTableDefinitionIndexesTemp.findIndex((col) => col.id === colId);
                const [reorderedItem] = reorderedTableDefinitionIndexesTemp.splice(sourceIndex, 1);
                reorderedTableDefinitionIndexesTemp.splice(adjustedToIndex, 0, reorderedItem);

                // Reinsert invisible columns in their original positions
                const updatedColumns = [...reorderedTableDefinitionIndexesTemp];
                tableDefinition.columns.forEach((col) => {
                    if (!col.visible) {
                        const originalIndex = originalColumnPositions.get(col.id);
                        if (originalIndex !== undefined) {
                            updatedColumns.splice(originalIndex, 0, col);
                        }
                    }
                });

                reorderSpreadsheetColumns(
                    studyUuid,
                    tableDefinition.uuid,
                    updatedColumns.map((col) => col.uuid)
                )
                    .then(() => {
                        dispatch(
                            updateTableDefinition({
                                ...tableDefinition,
                                columns: updatedColumns,
                            })
                        );
                    })
                    .catch((error) => {
                        snackError({
                            messageTxt: error,
                            headerId: 'spreadsheet/reorder_columns/error',
                        });
                    });
            }
        },
        [studyUuid, tableDefinition, originalColumnPositions, dispatch, snackError]
    );

    return {
        updateSortConfig,
        updateLockedColumnsConfig,
        isLockedColumnNamesEmpty,
        handleColumnDrag,
    };
}
