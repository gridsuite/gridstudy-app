/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useMemo, useCallback } from 'react';
import { AppState } from 'redux/reducer';
import { create, all, bignumber } from 'mathjs';
import { useSelector } from 'react-redux';
import { TABLES_NAMES } from '../utils/config-tables';
import { ColumnWithFormula } from './custom-columns.types';

export function useCustomColumn(tabIndex: number) {
    const customColumnDefinitions = useSelector(
        (state: AppState) => state.allCustomColumnsDefinitions[TABLES_NAMES[tabIndex]].columns
    );

    const math = useMemo(() => {
        const instance = create(all, {
            precision: 10,
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
                equal: function (a: any, b: any) {
                    // == instead of === to be able to compare strings to numbers
                    return a === b;
                },
            },
            { override: true }
        );
        return { limitedEvaluate };
    }, []);

    const createDependencyGraph = (customColumnDefinitions: ColumnWithFormula[]): Map<string, Set<string>> => {
        const graph = new Map<string, Set<string>>();

        // Initialize the graph with all columns
        customColumnDefinitions.forEach((col) => {
            graph.set(col.name, new Set());
        });

        // Build the graph by adding dependencies between columns
        customColumnDefinitions.forEach((col) => {
            customColumnDefinitions.forEach((depCol) => {
                if (col.formula.includes(depCol.name) && col.name !== depCol.name) {
                    graph.get(col.name)!.add(depCol.name);
                }
            });
        });

        return graph;
    };

    const topologicalSort = (graph: Map<string, Set<string>>): string[] => {
        const sorted: string[] = [];
        const visited = new Set<string>();
        const visiting = new Set<string>(); // Temporary set for detecting cycles

        const dfs = (node: string) => {
            if (visiting.has(node)) {
                throw new Error(`Circular dependency detected at column: ${node}`);
            }
            if (!visited.has(node)) {
                visiting.add(node); // Mark the node as currently being visited
                const dependencies = graph.get(node) || new Set();
                dependencies.forEach(dfs);
                visiting.delete(node);
                visited.add(node);
                sorted.push(node);
            }
        };

        // Start DFS from each node
        for (const node of graph.keys()) {
            if (!visited.has(node)) {
                dfs(node);
            }
        }

        return sorted;
    };

    // Main function to sort columns by dependencies and calculate values
    const sortedColumnDefinitions = useMemo(() => {
        const graph = createDependencyGraph(customColumnDefinitions);
        const sortedColumns = topologicalSort(graph);

        return sortedColumns.map((name) =>
            customColumnDefinitions.find((col) => col.name === name)
        ) as ColumnWithFormula[];
    }, [customColumnDefinitions]);

    const calcAllColumnValues = useCallback(
        (lineData: Record<string, unknown>): Map<string, unknown> => {
            const customColumnsValues = new Map<string, unknown>();
            const scope: Record<string, unknown> = {};

            // Add line data to the scope
            Object.entries(lineData).forEach(([key, value]) => {
                scope[`${key}`] = typeof value === 'number' ? bignumber(value) : value;
            });

            sortedColumnDefinitions.forEach((column) => {
                if (!column) {
                    return;
                }
                try {
                    // Evaluate the formula and update the Map and scope
                    const result = math.limitedEvaluate(column.formula, {
                        ...scope,
                        ...Object.fromEntries(customColumnsValues),
                    });

                    customColumnsValues.set(column.name, result);
                    scope[column.name] = result; // Add calculated result to scope for future columns
                } catch (error: any) {
                    console.error(`Error evaluating formula for column ${column.name}: ${error.message}`);
                    customColumnsValues.set(column.name, '#ERR');
                }
            });

            return customColumnsValues;
        },
        [math, sortedColumnDefinitions]
    );

    return { calcAllColumnValues };
}
