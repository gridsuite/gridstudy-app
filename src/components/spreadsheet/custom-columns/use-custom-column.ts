/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback, useMemo } from 'react';
import { AppState } from 'redux/reducer';
import { useSelector } from 'react-redux';
import { ColumnWithFormula } from 'types/custom-columns.types';
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

export function useCustomColumn(tabIndex: number) {
    const tableDefinition = useSelector((state: AppState) => state.tables.definitions[tabIndex]);
    const customColumnsDefinitions = useSelector(
        (state: AppState) => state.tables.allCustomColumnsDefinitions[tabIndex]
    );

    const createValueGetter = useCallback(
        (colWithFormula: ColumnWithFormula) =>
            (params: ValueGetterParams): boolean | string | number | undefined => {
                try {
                    const scope = { ...params.data };
                    colWithFormula.dependencies.forEach((dep) => {
                        scope[dep] = params.getValue(dep);
                    });
                    const result = limitedEvaluate(colWithFormula.formula, scope);
                    const validation = validateFormulaResult(result, colWithFormula.type);

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
            customColumnsDefinitions.map((colWithFormula): CustomColDef => {
                let baseDefinition: ColDef;

                switch (colWithFormula.type) {
                    case COLUMN_TYPES.NUMBER:
                        baseDefinition = numberColumnDefinition(
                            colWithFormula.name,
                            tableDefinition.name,
                            colWithFormula.precision
                        );
                        break;
                    case COLUMN_TYPES.TEXT:
                        baseDefinition = textColumnDefinition(colWithFormula.name, tableDefinition.name);
                        break;
                    case COLUMN_TYPES.BOOLEAN:
                        baseDefinition = booleanColumnDefinition(colWithFormula.name, tableDefinition.name);
                        break;
                    case COLUMN_TYPES.ENUM:
                        baseDefinition = enumColumnDefinition(colWithFormula.name, tableDefinition.name);
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
            }),
        [customColumnsDefinitions, tableDefinition.name, tabIndex, createValueGetter]
    );
}
