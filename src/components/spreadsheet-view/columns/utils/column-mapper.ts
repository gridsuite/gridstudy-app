/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ColumnMenu } from '../column-menu';
import { COLUMN_TYPES } from '../../../custom-aggrid/custom-aggrid-header.type';
import { limitedEvaluate } from './math';
import { ColDef, ValueGetterParams } from 'ag-grid-community';
import {
    booleanColumnDefinition,
    enumColumnDefinition,
    numberColumnDefinition,
    textColumnDefinition,
} from '../common-column-definitions';
import { isValidationResult, validateFormulaResult } from './formula-validator';
import { ColumnDefinition, SpreadsheetTabDefinition } from '../../types/spreadsheet.type';
import { CustomColDef } from '../../../custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { isCalculationRow } from '../../utils/calculation-utils';
import { ErrorCellRenderer } from '../../../custom-aggrid/cell-renderers';

const createValueGetter =
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
                return validation;
            }
            return result;
        } catch (e) {
            return undefined;
        }
    };

export const mapColumns = (tableDefinition: SpreadsheetTabDefinition) =>
    tableDefinition?.columns.map((colDef): CustomColDef => {
        let baseDefinition: ColDef;

        switch (colDef.type) {
            case COLUMN_TYPES.NUMBER:
                baseDefinition = numberColumnDefinition(colDef, tableDefinition.uuid);
                break;
            case COLUMN_TYPES.TEXT:
                baseDefinition = textColumnDefinition(colDef, tableDefinition.uuid);
                break;
            case COLUMN_TYPES.BOOLEAN:
                baseDefinition = booleanColumnDefinition(colDef, tableDefinition.uuid);
                break;
            case COLUMN_TYPES.ENUM:
                baseDefinition = enumColumnDefinition(colDef, tableDefinition.uuid);
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
                    Menu: ColumnMenu,
                    menuParams: {
                        tableDefinition,
                        colUuid: colDef.uuid,
                    },
                },
            },
            valueGetter: createValueGetter(colDef),
            hide: !colDef.visible,
            editable: false,
            enableCellChangeFlash: true,
            cellRendererSelector: (params) =>
                isValidationResult(params.value) && !params.value.isValid
                    ? { component: ErrorCellRenderer }
                    : { component: baseDefinition.cellRenderer },
        };
    });
