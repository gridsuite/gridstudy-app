/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ColDef, RowNode } from 'ag-grid-community';
import { COLUMN_TYPES } from 'components/custom-aggrid/custom-aggrid-header.type';

export enum CalculationRowType {
    CALCULATION = 'calculation',
    CALCULATION_BUTTON = 'calculationButton',
}

export enum CalculationType {
    SUM = 'sum',
    AVERAGE = 'average',
    MIN = 'min',
    MAX = 'max',
}

// Types for calculation data
export interface CalculationRowData {
    rowType: CalculationRowType;
    calculationType?: CalculationType;
    [key: string]: any;
}

export const extractNumericValues = (gridApi: any, rowNodes: RowNode[], colId: string): number[] => {
    return rowNodes
        .map((rowNode: RowNode) => {
            const value = gridApi.getCellValue({
                rowNode: rowNode,
                colKey: colId,
            });

            if (!isNaN(value)) {
                return value;
            }
            return null;
        })
        .filter((value): value is number => value !== null);
};

/**
 * Calculates aggregated value based on calculation type
 */
export const calculateValue = (values: number[], calculationType: CalculationType): number | null => {
    if (values.length === 0) {
        return null;
    }

    switch (calculationType) {
        case CalculationType.SUM:
            return values.reduce((sum, val) => sum + val, 0);
        case CalculationType.AVERAGE:
            return values.reduce((sum, val) => sum + val, 0) / values.length;
        case CalculationType.MIN:
            return Math.min(...values);
        case CalculationType.MAX:
            return Math.max(...values);
        default:
            return null;
    }
};

/**
 * Generates calculation rows for the grid based on selected calculation types
 */
export const generateCalculationRows = (
    calculationSelections: CalculationType[],
    columnData: ColDef[],
    gridApi: any,
    displayedNodes: RowNode[]
): CalculationRowData[] => {
    // Create calculation rows based on selected options
    const calculationRows = calculationSelections.map((calculationType) => {
        const row: CalculationRowData = {
            rowType: CalculationRowType.CALCULATION,
            calculationType: calculationType,
        };

        // Skip calculations if no data to process
        if (displayedNodes.length > 0) {
            // Process only numeric columns
            columnData.forEach((colDef) => {
                if (colDef.colId && colDef?.context?.columnType === COLUMN_TYPES.NUMBER) {
                    // Extract numeric values and calculate
                    const values = extractNumericValues(gridApi, displayedNodes, colDef.colId);
                    const calculatedValue = calculateValue(values, calculationType);

                    if (calculatedValue !== null) {
                        row[colDef.colId] = calculatedValue;
                    }
                }
            });
        }

        return row;
    });

    // Return the button row and all calculation rows
    return [{ rowType: CalculationRowType.CALCULATION_BUTTON }, ...calculationRows];
};
