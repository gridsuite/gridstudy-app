/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { GridApi } from 'ag-grid-community';
import { CustomColDef } from 'components/custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { COLUMN_TYPES } from 'components/custom-aggrid/custom-aggrid-header.type';
import { CalculationRowType, CalculationType } from './calculation.type';

// Types for calculation data
export interface CalculationRowData {
    rowType: CalculationRowType;
    calculationType?: CalculationType;
    [key: string]: any;
}

/**
 * Extract numerical values for multiple columns in a single pass
 */
export const extractNumericValuesForColumns = (gridApi: GridApi, columnIds: string[]): Record<string, number[]> => {
    if (!gridApi || !columnIds.length) {
        return {};
    }

    try {
        // Create a map to store values for each column
        const columnValues: Record<string, number[]> = {};
        columnIds.forEach((colId) => {
            columnValues[colId] = [];
        });

        gridApi.forEachNodeAfterFilter((node) => {
            // Skip pinned rows
            if (isCalculationRow(node.data?.rowType)) {
                return;
            }

            // Process each column
            columnIds.forEach((colId) => {
                const cellValue = gridApi.getCellValue({
                    rowNode: node,
                    colKey: colId,
                });
                if (cellValue !== undefined && cellValue !== null) {
                    const numValue = parseFloat(String(cellValue));
                    if (!isNaN(numValue)) {
                        columnValues[colId].push(numValue);
                    }
                }
            });
        });

        return columnValues;
    } catch (e) {
        console.warn(`Error extracting batch values:`, e);
        return {};
    }
};

/**
 * Calculates aggregated value based on calculation type
 */
export const calculateValue = (values: number[], calculationType: CalculationType): number | null => {
    if (!values || values.length === 0) {
        return null;
    }

    try {
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
    } catch (e) {
        console.warn(`Error calculating ${calculationType}:`, e);
        return null;
    }
};

export const generateCalculationRows = (
    calculationSelections: CalculationType[],
    columnData: CustomColDef[],
    gridApi: GridApi
): CalculationRowData[] => {
    if (!gridApi || !Array.isArray(columnData) || !calculationSelections.length) {
        return [{ rowType: CalculationRowType.CALCULATION_BUTTON }];
    }

    const numericColumns = columnData
        .filter((colDef) => colDef?.colId && colDef?.context?.columnType === COLUMN_TYPES.NUMBER)
        .map((colDef) => colDef.colId);

    // Create empty calculation rows even when there are no numeric columns
    const calculationRows = calculationSelections.map((calculationType) => {
        const row: CalculationRowData = {
            rowType: CalculationRowType.CALCULATION,
            calculationType: calculationType,
        };

        // Only process values if there are numeric columns
        if (numericColumns.length > 0) {
            // Extract all column values in a single batch operation
            const batchColumnValues = extractNumericValuesForColumns(gridApi, numericColumns);

            // Process values for each column
            numericColumns.forEach((colId) => {
                const values = batchColumnValues[colId] || [];
                const calculatedValue = calculateValue(values, calculationType);

                if (calculatedValue !== null) {
                    row[colId] = calculatedValue;
                }
            });
        }

        return row;
    });

    return [{ rowType: CalculationRowType.CALCULATION_BUTTON }, ...calculationRows];
};

export const isCalculationRow = (rowType: any): boolean => Object.values(CalculationRowType).includes(rowType);
