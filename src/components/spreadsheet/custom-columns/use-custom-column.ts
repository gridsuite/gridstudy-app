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
import { COLUMN_TYPES } from '../../custom-aggrid/custom-aggrid-header.type';
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
import { CustomColDef } from '../../custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { isCalculationRow } from '../utils/calculation-utils';

export function useCustomColumn(tabIndex: number) {
    const tableDefinition = useSelector((state: AppState) => state.tables.definitions[tabIndex]);

    const createValueGetter = useCallback(
        (colDef: ColumnDefinition) =>
            (params: ValueGetterParams): boolean | string | number | undefined => {
                try {
                    // Skip formula processing for pinned rows and use raw value
                    if (isCalculationRow(params.node?.data?.rowType)) {
                        return params.data[colDef.id];
                    }
                    const scope = { ...params.data };
                    const colDependencies = colDef.dependencies ?? [];
                    colDependencies.forEach((dep) => {
                        scope[dep] = params.getValue(dep);
                    });
                    const escapedFormula = colDef.formula.replace(/\\/g, '\\\\');
                    const result = limitedEvaluate(escapedFormula, scope);
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
            tableDefinition?.columns.map((colDef): CustomColDef => {
                let baseDefinition: ColDef;

                switch (colDef.type) {
                    case COLUMN_TYPES.NUMBER:
                        baseDefinition = numberColumnDefinition(colDef.name, tableDefinition.uuid, colDef.precision);
                        break;
                    case COLUMN_TYPES.TEXT:
                        baseDefinition = textColumnDefinition(colDef.name, tableDefinition.uuid);
                        break;
                    case COLUMN_TYPES.BOOLEAN:
                        baseDefinition = booleanColumnDefinition(colDef.name, tableDefinition.uuid);
                        break;
                    case COLUMN_TYPES.ENUM:
                        baseDefinition = enumColumnDefinition(colDef.name, tableDefinition.uuid);
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
                                colUuid: colDef.uuid,
                            },
                        },
                    },
                    valueGetter: createValueGetter(colDef),
                    editable: false,
                    enableCellChangeFlash: true,
                };
            }),
        [tableDefinition?.columns, tableDefinition?.uuid, tabIndex, createValueGetter]
    );
}
