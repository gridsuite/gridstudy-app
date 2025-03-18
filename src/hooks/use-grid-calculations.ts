/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect } from 'react';
import { useDebounce } from '@gridsuite/commons-ui';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import {
    CalculationRowData,
    CalculationRowType,
    CalculationType,
    generateCalculationRows,
} from 'components/spreadsheet/utils/calculation-utils';

// Default calculation button row - ensure type is correct
const DEFAULT_ROWS = [{ rowType: CalculationRowType.CALCULATION_BUTTON }];

/**
 * Hook for managing calculation rows with more predictable state management
 */
export const useGridCalculations = (
    gridRef: React.RefObject<AgGridReact>,
    calculationSelections: CalculationType[],
    columnDefs: ColDef[],
    hasData: boolean
) => {
    const updateCalculations = useCallback(() => {
        let newRows: CalculationRowData[] = DEFAULT_ROWS;

        // Only calculate if we have selections and data
        if (calculationSelections.length > 0 && hasData) {
            const api = gridRef?.current?.api;
            if (api) {
                newRows = generateCalculationRows(calculationSelections, columnDefs, api) as CalculationRowData[];
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

    // Update calculations when selections or columns change
    useEffect(() => {
        debouncedUpdateCalculations();
    }, [calculationSelections, columnDefs, debouncedUpdateCalculations]);

    // Used to trigger calculations when displayed rows have changed.
    // Triggered after sort, filter native or external ...
    const handleModelUpdate = useCallback(() => {
        if (calculationSelections.length > 0) {
            debouncedUpdateCalculations();
        }
    }, [calculationSelections, debouncedUpdateCalculations]);

    return {
        onModelUpdated: handleModelUpdate,
    };
};
