import { useMemo, useCallback } from 'react';
import { create, all, bignumber } from 'mathjs';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { TABLES_NAMES } from '../utils/config-tables';
import { ColumnWithFormula } from './custom-columns.types';

export function useOptimizedFormulaHook(tabIndex: number) {
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

    // sort the columns by dependencies to optimize calculation and detect circular dependencies
    const sortedColumnDefinitions = useMemo(() => {
        // Create a dependency graph
        const graph = new Map();

        // Initialize the graph with custom columns only
        customColumnDefinitions.forEach((col) => {
            graph.set(col.name, new Set());
        });

        // Build the dependency graph for custom columns only
        customColumnDefinitions.forEach((col) => {
            customColumnDefinitions.forEach((depCol) => {
                if (col.formula.includes(depCol.name)) {
                    graph.get(col.name).add(depCol.name);
                }
            });
        });

        const sorted: string[] = [];
        const visited = new Set();
        const temp = new Set();

        function dfs(node: string) {
            if (temp.has(node)) {
                throw new Error('Circular dependency detected');
            }
            if (!visited.has(node)) {
                temp.add(node);
                graph.get(node).forEach(dfs);
                temp.delete(node);
                visited.add(node);
                sorted.push(node);
            }
        }

        // Start DFS from custom columns
        customColumnDefinitions.forEach((col) => {
            if (!visited.has(col.name)) {
                dfs(col.name);
            }
        });

        // Map back to column definitions
        return sorted.map((name) => customColumnDefinitions.find((col) => col.name === name)) as ColumnWithFormula[];
    }, [customColumnDefinitions]);

    const calcAllColumnValues = useCallback(
        (lineData: Record<string, unknown>) => {
            const customColumnsValues = new Map<string, unknown>();
            const scope: Record<string, unknown> = {};

            // Add line data to the scope
            for (const [key, value] of Object.entries(lineData)) {
                // Convert numbers to BigNumber to avoir this error : Cannot implicitly convert a number with >15 significant digits to BigNumber
                scope[`var_${key}`] = typeof value === 'number' ? bignumber(value) : value;
            }

            // Calculate all custom columns in one pass
            sortedColumnDefinitions.forEach((column) => {
                try {
                    const result = math.limitedEvaluate(column.formula, {
                        ...scope,
                        ...Object.fromEntries(customColumnsValues),
                    });
                    customColumnsValues.set(column.name, result);
                    scope[column.name] = result;
                } catch (e) {
                    console.error(`Error evaluating formula for ${column.name}:`, e);
                    customColumnsValues.set(column.name, '#ERR');
                }
            });

            return customColumnsValues;
        },
        [math, sortedColumnDefinitions]
    );

    return { calcAllColumnValues };

    /* 
    columns example:
    [
  {
    "name": "cust_a",
    "formula": "cust_b + cust_c"
  },
  {
    "name": "cust_b",
    "formula": "var_minP + 1"
  },
  {
    "name": "cust_c",
    "formula": "cust_b +1"
  },
  {
    "name": "cust_d",
    "formula": "5 + 2"
  }
]
    
    */
}
