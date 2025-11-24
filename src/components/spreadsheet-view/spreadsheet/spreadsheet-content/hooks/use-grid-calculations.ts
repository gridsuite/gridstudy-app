/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect } from 'react';
import { CustomColDef, useDebounce } from '@gridsuite/commons-ui';
import { AgGridReact } from 'ag-grid-react';
import { CalculationRowData, generateCalculationRows } from 'components/spreadsheet-view/utils/calculation-utils';
import type { UUID } from 'node:crypto';
import { shallowEqual, useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { CalculationRowType } from 'components/spreadsheet-view/types/calculation.type';

// Default calculation button row
const DEFAULT_ROWS = [{ rowType: CalculationRowType.CALCULATION_BUTTON }];

/**
 * Hook for managing calculation rows
 */
export const useGridCalculations = (
    gridRef: React.RefObject<AgGridReact>,
    tabUuid: UUID | null,
    columnDefs: CustomColDef[]
) => {
    const calculationSelections = useSelector(
        (state: AppState) => (tabUuid ? state.calculationSelections?.[tabUuid] || [] : []),
        shallowEqual // used to prevent unnecessary re-renders of other tabs
    );

    const updateCalculations = useCallback(() => {
        const api = gridRef?.current?.api;
        if (!api) {
            return;
        }
        let newRows: CalculationRowData[] = DEFAULT_ROWS;
        const hasData = api?.getDisplayedRowCount() > 0;
        // Only calculate if we have selections and data
        if (calculationSelections.length > 0 && hasData) {
            newRows = generateCalculationRows(calculationSelections, columnDefs, api);
        }

        api.setGridOption('pinnedBottomRowData', newRows);
    }, [calculationSelections, columnDefs, gridRef]);

    // Debounce the update to prevent multiple unnecessary calculations
    const debouncedUpdateCalculations = useDebounce(updateCalculations, 5);

    useEffect(() => {
        debouncedUpdateCalculations();
    }, [debouncedUpdateCalculations]);

    return {
        onModelUpdated: debouncedUpdateCalculations,
    };
};
