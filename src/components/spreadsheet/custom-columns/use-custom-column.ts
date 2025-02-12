/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback, useMemo } from 'react';
import { AppState } from 'redux/reducer';
import { useSelector } from 'react-redux';
import { CustomColumnMenu } from '../../custom-aggrid/custom-column-menu';
import { COLUMN_TYPES, CustomColDef } from '../../custom-aggrid/custom-aggrid-header.type';
import { limitedEvaluate } from './math';
import { ColDef, ValueGetterParams } from 'ag-grid-community';
import {
    booleanColumnDefinition,
    enumColumnDefinition,
    numberColumnDefinition,
    textColumnDefinition,
} from '../config/common-column-definitions';
import { validateFormulaResult } from './formula-validator';
import { ColumnDefinition } from '../config/spreadsheet.type';

export function useCustomColumn(tabIndex: number) {
    const tableDefinition = useSelector((state: AppState) => state.tables.definitions[tabIndex]);

    const createValueGetter = useCallback(
        (colDef: ColumnDefinition) =>
            (params: ValueGetterParams): boolean | string | number | undefined => {
                try {
                    const scope = { ...params.data };
                    const colDependencies = colDef.dependencies as string[];
                    colDependencies.forEach((dep) => {
                        scope[dep] = params.getValue(dep);
                    });
                    const result = limitedEvaluate(colDef.formula, scope);
                    const validation = validateFormulaResult(result, colDef.type);

                    if (!validation.isValid) {
                        return undefined;
                    }
                    return result;
                } catch (e) {
                    return undefined;
                }
            },
        []
    );

    return useMemo(
        () =>
            tableDefinition.columns.map((colDef): CustomColDef => {
                let baseDefinition: ColDef;

                switch (colDef.type) {
                    case COLUMN_TYPES.NUMBER:
                        baseDefinition = numberColumnDefinition(colDef.name, tableDefinition.name, colDef.precision);
                        break;
                    case COLUMN_TYPES.TEXT:
                        baseDefinition = textColumnDefinition(colDef.name, tableDefinition.name);
                        break;
                    case COLUMN_TYPES.BOOLEAN:
                        baseDefinition = booleanColumnDefinition(colDef.name, tableDefinition.name);
                        break;
                    case COLUMN_TYPES.ENUM:
                        baseDefinition = enumColumnDefinition(colDef.name, tableDefinition.name);
                        break;
                    default:
                        baseDefinition = {};
                }

                return {
                    ...baseDefinition,
                    colId: colDef.id,
                    headerName: colDef.name,
                    headerTooltip: colDef.name,
                    headerComponentParams: {
                        ...baseDefinition.headerComponentParams,
                        menu: {
                            Menu: CustomColumnMenu,
                            menuParams: {
                                tabIndex,
                                colId: colDef.id,
                            },
                        },
                    },
                    valueGetter: createValueGetter(colDef),
                    editable: false,
                    suppressMovable: true,
                };
            }),
        [tableDefinition.columns, tableDefinition.name, tabIndex, createValueGetter]
    );
}
