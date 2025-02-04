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
import { COLUMN_TYPES, CustomColDef } from '../../custom-aggrid/custom-aggrid-header.type';
import { ColDef, ValueGetterParams } from 'ag-grid-community';
import { CustomColumnMenu } from '../../custom-aggrid/custom-column-menu';
import {
    booleanColumnDefinition,
    enumColumnDefinition,
    numberColumnDefinition,
    textColumnDefinition,
} from '../config/common-column-definitions';
import { validateFormulaResult } from './formula-validator';

export function useCustomColumn(tabIndex: number) {
    const tablesNames = useSelector((state: AppState) => state.tables.names);
    const customColumnsDefinitions = useSelector(
        (state: AppState) => state.tables.allCustomColumnsDefinitions[tablesNames[tabIndex]].columns
    );
    const tablesDefinitionIndexes = useSelector((state: AppState) => state.tables.definitionIndexes);
    const nodesAliases = useSelector((state: AppState) => state.customColumnsNodesAliases);

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

    const processValue = useCallback((value: unknown): unknown => {
        return typeof value === 'number' ? bignumber(value) : value;
    }, []);

    const processNode = useCallback(
        (node: Record<string, unknown>): Record<string, unknown> => {
            return Object.entries(node).reduce((acc, [key, value]) => {
                acc[key] = processValue(value);
                return acc;
            }, {} as Record<string, unknown>);
        },
        [processValue]
    );

    const createValueGetter = useCallback(
        (colWithFormula: ColumnWithFormula) =>
            (params: ValueGetterParams): boolean | string | number | undefined => {
                try {
                    const { data } = params;

                    const scope = Object.entries(data).reduce((acc, [key, value]) => {
                        if (nodesAliases.some((nodeAlias) => nodeAlias.alias === key)) {
                            acc[key] = processNode(value as Record<string, unknown>);
                        } else {
                            acc[key] = processValue(value);
                        }
                        return acc;
                    }, {} as Record<string, unknown>);
                    colWithFormula.dependencies.forEach((dep) => {
                        scope[dep] = params.getValue(dep);
                    });

                    const result = math.limitedEvaluate(colWithFormula.formula, scope);
                    const validation = validateFormulaResult(result, colWithFormula.type);

                    if (!validation.isValid) {
                        return undefined;
                    }

                    return result;
                } catch (e) {
                    return undefined;
                }
            },
        [math, nodesAliases, processNode, processValue]
    );

    const createCustomColumn = useCallback(() => {
        return customColumnsDefinitions.map((colWithFormula): CustomColDef => {
            let baseDefinition: ColDef;

            switch (colWithFormula.type) {
                case COLUMN_TYPES.NUMBER:
                    baseDefinition = numberColumnDefinition(
                        colWithFormula.name,
                        tablesDefinitionIndexes.get(tabIndex)!.name,
                        colWithFormula.precision
                    );
                    break;
                case COLUMN_TYPES.TEXT:
                    baseDefinition = textColumnDefinition(
                        colWithFormula.name,
                        tablesDefinitionIndexes.get(tabIndex)!.name
                    );
                    break;
                case COLUMN_TYPES.BOOLEAN:
                    baseDefinition = booleanColumnDefinition(
                        colWithFormula.name,
                        tablesDefinitionIndexes.get(tabIndex)!.name
                    );
                    break;
                case COLUMN_TYPES.ENUM:
                    baseDefinition = enumColumnDefinition(
                        colWithFormula.name,
                        tablesDefinitionIndexes.get(tabIndex)!.name
                    );
                    break;
                default:
                    baseDefinition = {};
            }

            return {
                ...baseDefinition,
                colId: colWithFormula.id,
                headerName: colWithFormula.name,
                headerTooltip: colWithFormula.name,
                headerComponentParams: {
                    ...baseDefinition.headerComponentParams,
                    menu: {
                        Menu: CustomColumnMenu,
                        menuParams: {
                            tabIndex,
                            customColumnName: colWithFormula.name,
                        },
                    },
                },
                valueGetter: createValueGetter(colWithFormula),
                editable: false,
                suppressMovable: true,
            };
        });
    }, [customColumnsDefinitions, tablesDefinitionIndexes, tabIndex, createValueGetter]);

    return { createCustomColumn };
}
