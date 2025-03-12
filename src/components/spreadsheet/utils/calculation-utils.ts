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
    [key: string]: any; // For dynamic column values
}

/**
 * Checks if a column is numeric and can be used in calculations
 */
export const isNumericColumn = (colDef: ColDef): boolean => {
    return (
        colDef?.cellRendererParams?.fractionDigits !== undefined ||
        colDef?.context?.columnType === COLUMN_TYPES.NUMBER ||
        colDef?.filter === 'agNumberColumnFilter'
    );
};

/**
 * Extracts displayed/filtered rows from the grid API
 */
export const getDisplayedRowData = (gridApi: any): any[] => {
    if (!gridApi) {
        return [];
    }

    const displayedRows: any[] = [];
    gridApi.forEachNodeAfterFilter((node: RowNode) => {
        if (node.data) {
            displayedRows.push(node.data);
        }
    });

    return displayedRows;
};

/**
 * Helper function to safely access nested properties using dot notation path
 */
export const getNestedValue = (obj: any, path: string): any => {
    if (!obj || !path) {
        return undefined;
    }

    // Handle both dot notation and simple property access
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
        if (current === null || current === undefined) {
            return undefined;
        }
        current = current[part];
    }

    return current;
};

/**
 * Extracts numeric values from data for a specific column, supporting nested paths
 */
export const extractNumericValues = (data: any[], colId: string): number[] => {
    return data
        .map((row: any) => {
            // Get value using nested path support
            const value = getNestedValue(row, colId);

            if (typeof value === 'string' && !isNaN(Number(value))) {
                return Number(value);
            }
            if (typeof value === 'number' && !isNaN(value)) {
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
    displayedData: any[]
): CalculationRowData[] => {
    // If no selections or data, return just the button row
    if (!calculationSelections.length || !displayedData.length) {
        return [{ rowType: CalculationRowType.CALCULATION_BUTTON }];
    }

    // Create calculation rows based on selected options
    const calculationRows = calculationSelections.map((calculationType) => {
        const row: CalculationRowData = {
            rowType: CalculationRowType.CALCULATION,
            calculationType: calculationType,
        };

        // Process only numeric columns
        columnData.forEach((colDef) => {
            if (colDef.colId && isNumericColumn(colDef)) {
                // Check if this is a nested path
                const colId = colDef.colId;
                const isNested = colId.includes('.');

                // Extract numeric values and calculate
                const values = extractNumericValues(displayedData, colId);
                const calculatedValue = calculateValue(values, calculationType);

                if (calculatedValue !== null) {
                    if (isNested) {
                        // For nested properties, create the proper structure
                        createNestedStructure(row, colId, calculatedValue);
                    } else {
                        // For flat properties, assign directly
                        row[colId] = calculatedValue;
                    }
                }
            }
        });

        return row;
    });

    // Return the button row and all calculation rows
    return [{ rowType: CalculationRowType.CALCULATION_BUTTON }, ...calculationRows];
};

/**
 * Creates a nested object structure from a dot notation path
 * Example: createNestedStructure(obj, 'a.b.c', value) creates obj.a.b.c = value
 */
export const createNestedStructure = (obj: any, path: string, value: any): void => {
    const parts = path.split('.');
    let current = obj;

    // Create the nested structure for all but the last part
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
            current[part] = {};
        }
        current = current[part];
    }

    // Set the value at the final level
    const lastPart = parts[parts.length - 1];
    current[lastPart] = value;
};
