/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ColDef } from 'ag-grid-community';
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

/**
 * Extract numerical values for multiple columns in a single pass
 */
export const extractNumericValuesForColumns = (gridApi: any, columnIds: string[]): Record<string, number[]> => {
    if (!gridApi || !columnIds.length) {
        return {};
    }

    try {
        // Create a map to store values for each column
        const columnValues: Record<string, number[]> = {};
        columnIds.forEach((colId) => {
            columnValues[colId] = [];
        });

        // Process all columns in a single export operation
        gridApi.getDataAsCsv({
            skipHeader: true,
            columnKeys: columnIds,
            processCellCallback: (params: any): string => {
                // Skip pinned rows
                if (!params.node.rowPinned && columnIds.includes(params.column.getColId())) {
                    const colId = params.column.getColId();
                    const numValue = parseFloat(params.value);
                    if (!isNaN(numValue)) {
                        columnValues[colId].push(numValue);
                    }
                }
                return params.value;
            },
            suppressQuotes: true,
            skipFooters: true,
            skipGroups: true,
            skipPinnedBottom: true,
            skipPinnedTop: true,
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
    columnData: ColDef[],
    gridApi: any
): any[] => {
    if (!gridApi || !Array.isArray(columnData) || !calculationSelections.length) {
        return [{ rowType: CalculationRowType.CALCULATION_BUTTON }];
    }

    const numericColumns = columnData
        .filter((colDef) => colDef?.colId && colDef?.context?.columnType === COLUMN_TYPES.NUMBER)
        .map((colDef) => colDef.colId as string);

    if (numericColumns.length === 0) {
        return [{ rowType: CalculationRowType.CALCULATION_BUTTON }];
    }

    // Extract all column values in a single batch operation
    const batchColumnValues = extractNumericValuesForColumns(gridApi, numericColumns);

    const calculationRows = calculationSelections.map((calculationType) => {
        const row: CalculationRowData = {
            rowType: CalculationRowType.CALCULATION,
            calculationType: calculationType,
        };

        // Process values for each column
        numericColumns.forEach((colId) => {
            const values = batchColumnValues[colId] || [];
            const calculatedValue = calculateValue(values, calculationType);

            if (calculatedValue !== null) {
                row[colId] = calculatedValue;
            }
        });

        return row;
    });

    return [{ rowType: CalculationRowType.CALCULATION_BUTTON }, ...calculationRows];
};
