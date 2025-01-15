/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback, useMemo } from 'react';
import { AppState } from 'redux/reducer';
import { all, bignumber, create } from 'mathjs';
import { useSelector } from 'react-redux';
import { ColumnWithFormula } from 'types/custom-columns.types';
import { DefaultCellRenderer } from '../utils/cell-renderers';
import { CustomColumnMenu } from '../../custom-aggrid/custom-column-menu';
import CustomHeaderComponent from '../../custom-aggrid/custom-aggrid-header';
import { ColDef } from 'ag-grid-community';
import { SPREADSHEET_SORT_STORE } from 'utils/store-sort-filter-fields';

export function useCustomColumn(tabIndex: number) {
    const tablesNames = useSelector((state: AppState) => state.tables.names);
    const customColumnsDefinitions = useSelector(
        (state: AppState) => state.tables.allCustomColumnsDefinitions[tablesNames[tabIndex]].columns
    );

    const tablesDefinitionIndexes = useSelector((state: AppState) => state.tables.definitionIndexes);

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

    const createValueGetter = useCallback(
        (colWithFormula: ColumnWithFormula) =>
            (params: { data: Record<string, unknown> }): string => {
                try {
                    const { data } = params;
                    const scope = Object.entries(data).reduce((acc, [key, value]) => {
                        acc[key] = typeof value === 'number' ? bignumber(value) : value;
                        return acc;
                    }, {} as Record<string, unknown>);

                    return math.limitedEvaluate(colWithFormula.formula, scope);
                } catch (e) {
                    return '';
                }
            },
        [math]
    );

    const createCustomColumn = useCallback(() => {
        return customColumnsDefinitions.map((colWithFormula: ColumnWithFormula): ColDef => {
            return {
                colId: colWithFormula.id,
                headerName: colWithFormula.name,
                headerTooltip: colWithFormula.name,
                headerComponent: CustomHeaderComponent,
                headerComponentParams: {
                    sortParams: {
                        table: SPREADSHEET_SORT_STORE,
                        tab: tablesDefinitionIndexes.get(tabIndex)!.name,
                    },
                    field: colWithFormula.name,
                    tabIndex,
                    menu: {
                        Menu: CustomColumnMenu,
                        menuParams: {
                            tabIndex,
                            customColumnName: colWithFormula.name,
                        },
                    },
                },
                cellRenderer: DefaultCellRenderer,
                valueGetter: createValueGetter(colWithFormula),
            };
        });
    }, [customColumnsDefinitions, tablesDefinitionIndexes, tabIndex, createValueGetter]);

    return { createCustomColumn };
}
