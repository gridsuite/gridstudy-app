/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { type RefObject, useCallback, useEffect, useMemo } from 'react';
import type { FilterChangedEvent, GridOptions } from 'ag-grid-community';
import type { UUID } from 'node:crypto';
import { useSelector } from 'react-redux';
import { type AppState } from '../../../../../redux/reducer';
import { SpreadsheetEquipmentType } from '../../../types/spreadsheet.type';
import { type AgGridReact } from 'ag-grid-react';
import { ROW_INDEX_COLUMN_ID } from '../../../constants';
import { useGlobalFilterResults } from '../../../../results/common/global-filter/use-global-filter-results';
import { FilterEquipmentType } from '../../../../../types/filter-lib/filter';

export const refreshSpreadsheetAfterFilterChanged = (event: FilterChangedEvent) => {
    event.api.refreshCells({ columns: [ROW_INDEX_COLUMN_ID], force: true });
};

type ObjWithId<T extends string = string> = { id: T };
export function useSpreadsheetGlobalFilter<TData extends ObjWithId = ObjWithId>(
    gridRef: RefObject<AgGridReact<TData> | null>,
    tabUuid: UUID,
    equipmentType: SpreadsheetEquipmentType
) {
    const globalFilterSpreadsheetState = useSelector((state: AppState) => state.globalFilterSpreadsheetState[tabUuid]);
    const equipmentTypes = useMemo(
        () =>
            equipmentType === SpreadsheetEquipmentType.BRANCH
                ? ([FilterEquipmentType.LINE, FilterEquipmentType.TWO_WINDINGS_TRANSFORMER] as const)
                : ([equipmentType as unknown as FilterEquipmentType] as const),
        [equipmentType]
    );
    const filteredEquipmentIds = useGlobalFilterResults(globalFilterSpreadsheetState, equipmentTypes);
    useEffect(() => {
        gridRef.current?.api?.onFilterChanged();
    }, [filteredEquipmentIds, gridRef]);
    // Check if the equipment of the row belongs to the filtered equipments
    const doesFormulaFilteringPass = useCallback<NonNullable<GridOptions<TData>['doesExternalFilterPass']>>(
        (node) => node.data?.id !== undefined && (filteredEquipmentIds?.includes(node.data?.id) ?? true),
        [filteredEquipmentIds]
    );
    const isExternalFilterPresent = useCallback<NonNullable<GridOptions<TData>['isExternalFilterPresent']>>(
        () => globalFilterSpreadsheetState.length > 0,
        [globalFilterSpreadsheetState]
    );
    return { doesFormulaFilteringPass, isExternalFilterPresent };
}
