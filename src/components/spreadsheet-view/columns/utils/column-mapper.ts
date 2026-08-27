/*
 * Copyright © 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ColumnMenu } from '../column-menu';
import { limitedEvaluate, MathJsValidationError } from './math';
import { ColDef, ValueGetterParams } from 'ag-grid-community';
import {
    booleanColumnDefinition,
    enumColumnDefinition,
    numberColumnDefinition,
    textColumnDefinition,
} from '../common-column-definitions';
import { isValidationError, validateFormulaResult } from './formula-validator';
import { computeInvalidColumnIds, SpreadsheetValidity } from './column-validity';
import { ColumnDefinition, SpreadsheetTabDefinition } from '../../types/spreadsheet.type';
import { isCalculationRow } from '../../utils/calculation-utils';
import { ErrorCellRenderer, SnackInputs } from '@gridsuite/commons-ui';
import { COLUMN_TYPES, CustomAggridValue, CustomColDef } from '../../../../types/custom-aggrid-types';

export const SPREADSHEET_INVALID_CELL_CLASS = 'spreadsheet-invalid-cell';

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
            const result = limitedEvaluate(colDef.formula, scope);
            return result == null ? undefined : validateFormulaResult(result, colDef.type);
        } catch (e) {
            if (e instanceof MathJsValidationError) {
                return { error: e.error };
            }
            return undefined;
        }
    };

export const mapColumns = (
    tableDefinition: SpreadsheetTabDefinition,
    snackError: (snackInputs: SnackInputs) => void,
    validity: SpreadsheetValidity
) => {
    if (!tableDefinition) {
        return [];
    }
    const invalidColumnIds = computeInvalidColumnIds(tableDefinition.columns, tableDefinition.type, validity);
    return tableDefinition.columns.map((colDef): CustomColDef => {
        const isInvalid = invalidColumnIds.has(colDef.id);
        let baseDefinition: ColDef;

        switch (colDef.type) {
            case COLUMN_TYPES.NUMBER:
                baseDefinition = numberColumnDefinition(colDef, tableDefinition.uuid, snackError);
                break;
            case COLUMN_TYPES.TEXT:
                baseDefinition = textColumnDefinition(colDef, tableDefinition.uuid, snackError);
                break;
            case COLUMN_TYPES.BOOLEAN:
                baseDefinition = booleanColumnDefinition(colDef, tableDefinition.uuid, snackError);
                break;
            case COLUMN_TYPES.ENUM:
                baseDefinition = enumColumnDefinition(colDef, tableDefinition.uuid, snackError);
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
                isInvalid,
            },
            cellClass: isInvalid ? SPREADSHEET_INVALID_CELL_CLASS : undefined,
            valueGetter: createValueGetter(colDef),
            cellRendererSelector: (params) =>
                isValidationError(params.value) ? { component: ErrorCellRenderer } : undefined, //Returning undefined make it so the originally defined renderer is used
            hide: !colDef.visible,
            editable: false,
            enableCellChangeFlash: true,
        };
    });
};
