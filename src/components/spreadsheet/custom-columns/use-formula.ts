import { useMemo, useCallback } from 'react';
import { create, all } from 'mathjs';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { TABLES_NAMES } from '../utils/config-tables';

export function useFormulaHook(tabIndex: number) {
    const customColumnDefinitions = useSelector(
        (state: AppState) => state.allCustomColumnsDefinitions[TABLES_NAMES[tabIndex]]
    );

    const math = useMemo(() => {
        const instance = create(all, {
            precision: 1,
            number: 'BigNumber',
        });

        const limitedEvaluate = instance.evaluate.bind(instance);
        // Disable potentially dangerous functions
        instance.import(
            {
                import: function () {
                    throw new Error('Function import is disabled');
                },
                createUnit: function () {
                    throw new Error('Function createUnit is disabled');
                },
                evaluate: function () {
                    throw new Error('Function evaluate is disabled');
                },
                parse: function () {
                    throw new Error('Function parse is disabled');
                },
                simplify: function () {
                    throw new Error('Function simplify is disabled');
                },
                derivative: function () {
                    throw new Error('Function derivative is disabled');
                },
            },
            { override: true }
        );
        return { limitedEvaluate };
    }, []);

    const calcColumnValue = useCallback(
        (formula: string, lineData: Record<string, unknown>, calculatedColumns: Map<string, unknown> = new Map()) => {
            const scope: Record<string, unknown> = {};

            const getColumnValue = (columnName: string): unknown => {
                if (calculatedColumns.has(columnName) && calculatedColumns.get(columnName) !== 'calculating') {
                    return calculatedColumns.get(columnName);
                }

                const columnDefinition = customColumnDefinitions.find((col) => col.name === columnName);
                if (!columnDefinition) {
                    throw new Error(`Custom column "${columnName}" not found`);
                }

                if (calculatedColumns.get(columnName) === 'calculating') {
                    throw new Error(`Circular reference detected for column "${columnName}"`);
                }

                calculatedColumns.set(columnName, 'calculating');
                const result = calcColumnValue(columnDefinition.formula, lineData, calculatedColumns);
                calculatedColumns.set(columnName, result);
                return result;
            };

            // Add custom columns to the scope
            for (const column of customColumnDefinitions) {
                Object.defineProperty(scope, column.name, {
                    get: () => getColumnValue(column.name),
                    enumerable: true,
                });
            }

            // Add line data to the scope
            for (const [key, value] of Object.entries(lineData)) {
                scope[`var_${key}`] = value;
            }

            try {
                console.log('Evaluating formula:', formula);
                return math.limitedEvaluate(formula, scope);
            } catch (e) {
                console.error('Error evaluating formula:', e);
                return '#ERR';
            }
        },
        [math, customColumnDefinitions]
    );

    return { calcColumnValue };

    /* 
    columns example:
    [
  {
    "name": "cminp",
    "formula": "var_minP"
  },
  {
    "name": "doubrefc",
    "formula": "refc * 2"
  },
  {
    "name": "parsec",
    "formula": "parse(\"1\")"
  },
  {
    "name": "refc",
    "formula": "cminp + 1"
  },
  {
    "name": "sqrtc",
    "formula": "sqrt(16)"
  }
]
    
    */
}
