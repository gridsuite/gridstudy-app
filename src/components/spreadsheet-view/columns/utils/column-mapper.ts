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
import { ColumnDefinition, SpreadsheetEquipmentType, SpreadsheetTabDefinition } from '../../types/spreadsheet.type';
import { isCalculationRow } from '../../utils/calculation-utils';
import { CalculationRowType } from '../../types/calculation.type';
import { ErrorCellRenderer, SnackInputs } from '@gridsuite/commons-ui';
import { COLUMN_TYPES, CustomAggridValue, CustomColDef } from '../../../../types/custom-aggrid-types';
import { RunningStatus } from 'components/utils/running-status';

export const SPREADSHEET_INVALID_CELL_CLASS = 'spreadsheet-invalid-cell';

// Equipment fields whose values are only valid when a loadflow has succeeded.
// - equipmentTypes: undefined means the group applies to all equipment types
// - securityNodeOnly: true means the group only applies when on a security analysis node
const LOADFLOW_DEPENDENT_FIELD_GROUPS: {
    fields: string[];
    equipmentTypes?: SpreadsheetEquipmentType[];
    securityNodeOnly?: boolean;
}[] = [
    { fields: ['p', 'p1', 'p2', 'p3', 'q', 'q1', 'q2', 'q3'] },
    { fields: ['v', 'angle'], equipmentTypes: [SpreadsheetEquipmentType.BUS] },
    {
        fields: ['ratioTapChanger.tapPosition', 'phaseTapChanger.tapPosition'],
        equipmentTypes: [SpreadsheetEquipmentType.TWO_WINDINGS_TRANSFORMER, SpreadsheetEquipmentType.BRANCH],
        securityNodeOnly: true,
    },
    { fields: ['sectionCount'], equipmentTypes: [SpreadsheetEquipmentType.SHUNT_COMPENSATOR], securityNodeOnly: true },
];

const getInvalidFields = (equipmentType: SpreadsheetEquipmentType, isSecurityNode: boolean): string[] =>
    LOADFLOW_DEPENDENT_FIELD_GROUPS.filter(
        (group) =>
            (!group.equipmentTypes || group.equipmentTypes.includes(equipmentType)) &&
            (!group.securityNodeOnly || isSecurityNode)
    ).flatMap((group) => group.fields);

const formulaReferencesField = (formula: string, field: string): boolean => {
    const escaped = field.replaceAll('.', String.raw`\.`);
    return new RegExp(String.raw`(?<![\w.])` + escaped + String.raw`(?![\w.])`, 'u').test(formula);
};

const computeLoadflowDependentColumnIds = (columns: ColumnDefinition[], fields: string[]): Set<string> => {
    // For each column, which other columns directly depend on it
    const dependents = new Map<string, string[]>();
    for (const col of columns) {
        for (const dep of col.dependencies ?? []) {
            dependents.set(dep, [...(dependents.get(dep) ?? []), col.id]);
        }
    }

    // Start from directly-dependent columns (those whose formula references an invalid field),
    // then propagate transitively to their dependents
    const result = new Set<string>();
    const dependentIdsToVisit = columns
        .filter((col) => col.formula && fields.some((field) => formulaReferencesField(col.formula, field)))
        .map((col) => col.id);
    while (dependentIdsToVisit.length > 0) {
        const id = dependentIdsToVisit.pop();
        if (id === undefined || result.has(id)) continue;
        result.add(id);
        dependentIdsToVisit.push(...(dependents.get(id) ?? []));
    }

    return result;
};

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
    loadFlowStatus: RunningStatus,
    isSecurityNode: boolean
) => {
    const loadflowDependentColumnIds = computeLoadflowDependentColumnIds(
        tableDefinition?.columns ?? [],
        getInvalidFields(tableDefinition?.type, isSecurityNode)
    );
    return tableDefinition?.columns.map((colDef): CustomColDef => {
        const isInvalid = loadflowDependentColumnIds.has(colDef.id) && loadFlowStatus !== RunningStatus.SUCCEED;
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
            cellClass: (params) => {
                if (isInvalid && params.data?.rowType !== CalculationRowType.CALCULATION_BUTTON) {
                    return SPREADSHEET_INVALID_CELL_CLASS;
                }
                return undefined;
            },
            valueGetter: createValueGetter(colDef),
            cellRendererSelector: (params) =>
                isValidationError(params.value) ? { component: ErrorCellRenderer } : undefined, //Returning undefined make it so the originally defined renderer is used
            hide: !colDef.visible,
            editable: false,
            enableCellChangeFlash: true,
        };
    });
};
