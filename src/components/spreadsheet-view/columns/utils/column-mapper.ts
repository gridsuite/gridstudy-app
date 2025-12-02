/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ColumnMenu } from '../column-menu';
import { COLUMN_TYPES } from '../../../custom-aggrid/custom-aggrid-header.type';
import { limitedEvaluate, MathJsValidationError } from './math';
import { ColDef, ValueGetterParams } from 'ag-grid-community';
import {
    booleanColumnDefinition,
    enumColumnDefinition,
    numberColumnDefinition,
    textColumnDefinition,
} from '../common-column-definitions';
import { isValidationError, validateFormulaResult } from './formula-validator';
import { ColumnDefinition, SpreadsheetTabDefinition } from '../../types/spreadsheet.type';
import {
    type CustomAggridValue,
    type CustomColDef,
} from '../../../custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { isCalculationRow } from '../../utils/calculation-utils';
import { ErrorCellRenderer } from '@gridsuite/commons-ui';

const createValueGetter =
    (colDef: ColumnDefinition) =>
    (params: ValueGetterParams): CustomAggridValue | undefined => {
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
            return validateFormulaResult(result, colDef.type);
        } catch (e) {
            if (e instanceof MathJsValidationError) {
                return { error: e.error };
            }
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
            cellRendererSelector: (params) =>
                isValidationError(params.value) ? { component: ErrorCellRenderer } : undefined, //Returning undefined make it so the originally defined renderer is used
            hide: !colDef.visible,
            editable: false,
            enableCellChangeFlash: true,
        };
    });
