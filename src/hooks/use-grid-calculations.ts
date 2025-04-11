/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect } from 'react';
import { useDebounce } from '@gridsuite/commons-ui';
import { AgGridReact } from 'ag-grid-react';
import { CalculationRowData, generateCalculationRows } from 'components/spreadsheet/utils/calculation-utils';
import { UUID } from 'crypto';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { CustomColDef } from 'components/custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { CalculationRowType } from 'components/spreadsheet/utils/calculation.type';

// Default calculation button row
const DEFAULT_ROWS = [{ rowType: CalculationRowType.CALCULATION_BUTTON }];

/**
 * Hook for managing calculation rows
 */
export const useGridCalculations = (
    gridRef: React.RefObject<AgGridReact>,
    tabUuid: UUID | null,
    columnDefs: CustomColDef[],
    hasData: boolean
) => {
    const calculationSelections = useSelector((state: AppState) =>
        tabUuid ? state.calculationSelections?.[tabUuid] || [] : []
    );

    const updateCalculations = useCallback(() => {
        let newRows: CalculationRowData[] = DEFAULT_ROWS;

        // Only calculate if we have selections and data
        if (calculationSelections.length > 0 && hasData) {
            const api = gridRef?.current?.api;
            if (api) {
                newRows = generateCalculationRows(calculationSelections, columnDefs, api);
            }
        }

        // Update grid directly
        const api = gridRef?.current?.api;
        if (api) {
            api.setGridOption('pinnedBottomRowData', newRows);
        }
    }, [calculationSelections, columnDefs, gridRef, hasData]);

    // Debounce the update to prevent multiple unnecessary calculations
    const debouncedUpdateCalculations = useDebounce(updateCalculations, 5);

    useEffect(() => {
        debouncedUpdateCalculations();
    }, [debouncedUpdateCalculations]);

    return {
        onModelUpdated: debouncedUpdateCalculations,
    };
};
