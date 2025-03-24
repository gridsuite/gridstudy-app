import { ColumnDefinitionDto } from '../components/spreadsheet/config/spreadsheet.type';
import { ColDef, ValueGetterParams } from 'ag-grid-community';
import { limitedEvaluate } from '../components/spreadsheet/custom-columns/math';
import { validateFormulaResult } from '../components/spreadsheet/custom-columns/formula-validator';
import { CustomColDef } from '../components/custom-aggrid/custom-aggrid-filters/custom-aggrid-filter.type';
import { COLUMN_TYPES } from '../components/custom-aggrid/custom-aggrid-header.type';
import {
    booleanColumnDefinition,
    enumColumnDefinition,
    numberColumnDefinition,
    textColumnDefinition,
} from '../components/spreadsheet/config/common-column-definitions';
import { CustomColumnMenu } from '../components/custom-aggrid/custom-column-menu';
import { UUID } from 'crypto';

const createValueGetter =
    (colDef: ColumnDefinitionDto, colDependencies: string[] | undefined) =>
    (params: ValueGetterParams): boolean | string | number | undefined => {
        try {
            const scope = { ...params.data };
            colDependencies?.forEach((dep) => {
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
    };

export const mapColumnDefinition = (tabUuid: UUID, colDef: ColumnDefinitionDto): CustomColDef => {
    let baseDefinition: ColDef;

    switch (colDef.type) {
        case COLUMN_TYPES.NUMBER:
            baseDefinition = numberColumnDefinition(colDef.name, tabUuid, colDef.precision);
            break;
        case COLUMN_TYPES.TEXT:
            baseDefinition = textColumnDefinition(colDef.name, tabUuid);
            break;
        case COLUMN_TYPES.BOOLEAN:
            baseDefinition = booleanColumnDefinition(colDef.name, tabUuid);
            break;
        case COLUMN_TYPES.ENUM:
            baseDefinition = enumColumnDefinition(colDef.name, tabUuid);
            break;
        default:
            baseDefinition = {};
    }

    const colDependencies = colDef.dependencies?.length ? (JSON.parse(colDef.dependencies) as string[]) : undefined;

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
                    tabUuid,
                    colUuid: colDef.uuid,
                },
            },
        },
        valueGetter: createValueGetter(colDef, colDependencies),
        editable: false,
        enableCellChangeFlash: true,
        pinned: colDef.locked ? 'left' : null,
        hide: !(colDef.visible ?? true),
        context: {
            ...baseDefinition.context,
            uuid: colDef.uuid,
            dependencies: colDependencies,
        },
    };
};
