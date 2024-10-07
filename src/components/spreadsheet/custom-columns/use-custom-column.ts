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
import { TABLES_DEFINITION_INDEXES, TABLES_NAMES } from '../utils/config-tables';
import { makeAgGridCustomHeaderColumn } from 'components/custom-aggrid/custom-aggrid-header-utils';
import { useAgGridSort } from 'hooks/use-aggrid-sort';
import { SPREADSHEET_SORT_STORE } from 'utils/store-sort-filter-fields';
import { ColumnWithFormula } from 'types/custom-columns.types';
import { createDependencyGraph, topologicalSort } from './custom-columns-utils';

export function useCustomColumn(tabIndex: number) {
    const customColumnsDefinitions = useSelector(
        (state: AppState) => state.allCustomColumnsDefinitions[TABLES_NAMES[tabIndex]].columns
    );

    const { onSortChanged, sortConfig } = useAgGridSort(
        SPREADSHEET_SORT_STORE,
        TABLES_DEFINITION_INDEXES.get(tabIndex)!.type as string
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

    // Main function to sort columns by dependencies and calculate values
    const sortedColumnDefinitions = useMemo(() => {
        const graph = createDependencyGraph(customColumnsDefinitions);
        const sortedColumns = topologicalSort(graph);

        return sortedColumns.map((name) =>
            customColumnsDefinitions.find((col) => col.name === name)
        ) as ColumnWithFormula[];
    }, [customColumnsDefinitions]);

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
                }
            });

            return customColumnsValues;
        },
        [math, sortedColumnDefinitions]
    );

    const createCustomColumn = useCallback(() => {
        return customColumnsDefinitions.map((colWithFormula: ColumnWithFormula) => {
            return makeAgGridCustomHeaderColumn({
                headerName: colWithFormula.name,
                field: colWithFormula.name,
                sortProps: {
                    onSortChanged,
                    sortConfig,
                },
                valueGetter: (params) => {
                    const allValues = calcAllColumnValues(params.data);
                    return allValues.get(colWithFormula.name);
                },
                editable: false,
                suppressMovable: true,
            });
        });
    }, [customColumnsDefinitions, onSortChanged, sortConfig, calcAllColumnValues]);

    return { createCustomColumn };
}
