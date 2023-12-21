import { SHUNT_COMPENSATOR_TYPES } from 'components/utils/field-constants';
import {
    computeMaxQAtNominalV,
    computeMaxSusceptance,
    computeSwitchedOnValue,
} from 'components/utils/utils';
import { EDIT_COLUMN } from './config-tables';
import {
    CellEditingStoppedEvent,
    ColDef,
    Column,
    RefreshCellsParams,
    GridApi,
} from 'ag-grid-community';
import { REGULATION_TYPES } from 'components/network/constants';

type DynamicValidation = Record<string, number | undefined>;

export interface CrossValidationOptions {
    optional?: boolean;
    requiredOn?: {
        dependencyColumn?: string;
        columnValue?: string;
    };
    allowZero?: boolean;
    minExpression?: number | string;
    maxExpression?: number | string;
}

const flashCells = (params: CellEditingStoppedEvent, columns: string[]) => {
    params.api.flashCells({
        rowNodes: [params.node],
        columns,
    });
};

export const updateGeneratorCells = (params: CellEditingStoppedEvent) => {
    const rowNode = params.node;
    const colId = params.column.getColId();
    const regulationTypeText = params.data.RegulationTypeText;
    const previousData = params.context.dataToModify;
    if (colId === 'RegulationTypeText') {
        if (regulationTypeText === REGULATION_TYPES.LOCAL.id) {
            params.data.regulatingTerminalVlId = null;
            params.data.regulatingTerminalConnectableId = null;
            params.data.regulatingTerminalConnectableType = null;
            rowNode.setDataValue('RegulatingTerminalGenerator', null);
        }
        if (regulationTypeText === REGULATION_TYPES.DISTANT.id) {
            params.data.regulatingTerminalVlId =
                previousData.regulatingTerminalVlId ?? ' ';
            params.data.regulatingTerminalConnectableId =
                previousData.regulatingTerminalConnectableId ?? ' ';
            params.data.regulatingTerminalConnectableType =
                previousData.regulatingTerminalConnectableType ?? ' ';

            const regulatingTerminalGenerator =
                previousData.regulatingTerminalConnectableType
                    ? `${previousData.regulatingTerminalConnectableType} (${previousData.regulatingTerminalConnectableId} )`
                    : null;
            rowNode.setDataValue(
                'RegulatingTerminalGenerator',
                regulatingTerminalGenerator
            );
        }
        params.api.flashCells({
            rowNodes: [rowNode],
            columns: ['RegulationTypeText', 'RegulatingTerminalGenerator'],
        });
    } else if (colId === 'RegulatingTerminalGenerator') {
        const RegulatingTerminalGenerator =
            params.data.RegulatingTerminalGenerator;
        if (RegulatingTerminalGenerator) {
            params.data.regulatingTerminalVlId =
                params.context.dynamicValidation.regulatingTerminalVlId;
            params.data.regulatingTerminalConnectableId =
                params.context.dynamicValidation.regulatingTerminalConnectableId;
            params.data.regulatingTerminalConnectableType =
                params.context.dynamicValidation.regulatingTerminalConnectableType;
        } else {
            params.data.regulatingTerminalVlId = undefined;
            params.data.regulatingTerminalConnectableId = undefined;
            params.data.regulatingTerminalConnectableType = undefined;
        }
    }
};

export const updateShuntCompensatorCells = (
    params: CellEditingStoppedEvent
) => {
    const rowNode = params.node;
    const colId = params.column.getColId();
    const maxSusceptance = params.data.maxSusceptance;
    const type = params.data.type;
    const nominalVoltage = params.data.nominalVoltage;
    const maxQAtNominalV = params.data.maxQAtNominalV;
    const maximumSectionCount = params.data.maximumSectionCount;
    const sectionCount = params.data.sectionCount;
    if (colId === 'type') {
        if (
            (type === SHUNT_COMPENSATOR_TYPES.REACTOR.id &&
                maxSusceptance > 0) ||
            (type === SHUNT_COMPENSATOR_TYPES.CAPACITOR.id &&
                maxSusceptance < 0)
        ) {
            rowNode.setDataValue('maxSusceptance', -maxSusceptance);
            rowNode.setDataValue('switchedOnSusceptance', -maxSusceptance);
            flashCells(params, ['maxSusceptance', 'switchedOnSusceptance']);
        }
    } else if (colId === 'maxSusceptance') {
        if (Math.abs(maxSusceptance) !== Math.abs(params.oldValue)) {
            rowNode.setDataValue(
                'maxQAtNominalV',
                computeMaxQAtNominalV(maxSusceptance, nominalVoltage)
            );
            rowNode.setDataValue(
                'switchedOnQAtNominalV',
                computeSwitchedOnValue(
                    sectionCount,
                    maximumSectionCount,
                    maxQAtNominalV
                )
            );
            flashCells(params, ['maxQAtNominalV', 'switchedOnQAtNominalV']);
        }
        rowNode.setDataValue(
            'switchedOnSusceptance',
            computeSwitchedOnValue(
                sectionCount,
                maximumSectionCount,
                maxSusceptance
            )
        );
        flashCells(params, ['switchedOnSusceptance']);
        if (maxSusceptance < 0 && type !== SHUNT_COMPENSATOR_TYPES.REACTOR.id) {
            rowNode.setDataValue('type', SHUNT_COMPENSATOR_TYPES.REACTOR.id);
            flashCells(params, ['type']);
        } else if (
            maxSusceptance > 0 &&
            type !== SHUNT_COMPENSATOR_TYPES.CAPACITOR.id
        ) {
            rowNode.setDataValue('type', SHUNT_COMPENSATOR_TYPES.CAPACITOR.id);
            flashCells(params, ['type']);
        }
        params.context.lastEditedField = 'maxSusceptance';
    } else if (colId === 'maxQAtNominalV') {
        rowNode.setDataValue(
            'switchedOnQAtNominalV',
            computeSwitchedOnValue(
                sectionCount,
                maximumSectionCount,
                maxQAtNominalV
            )
        );
        const maxSusceptance = computeMaxSusceptance(
            maxQAtNominalV,
            nominalVoltage
        );
        rowNode.setDataValue(
            'maxSusceptance',
            type === SHUNT_COMPENSATOR_TYPES.REACTOR.id
                ? -maxSusceptance
                : maxSusceptance
        );
        rowNode.setDataValue(
            'switchedOnSusceptance',
            computeSwitchedOnValue(
                sectionCount,
                maximumSectionCount,
                maxSusceptance
            )
        );
        params.context.lastEditedField = 'maxQAtNominalV';
        flashCells(params, [
            'switchedOnQAtNominalV',
            'maxSusceptance',
            'switchedOnSusceptance',
        ]);
    } else if (colId === 'sectionCount' || colId === 'maximumSectionCount') {
        rowNode.setDataValue(
            'switchedOnQAtNominalV',
            computeSwitchedOnValue(
                sectionCount,
                maximumSectionCount,
                maxQAtNominalV
            )
        );
        rowNode.setDataValue(
            'switchedOnSusceptance',
            computeSwitchedOnValue(
                sectionCount,
                maximumSectionCount,
                maxSusceptance
            )
        );
        flashCells(params, ['switchedOnQAtNominalV', 'switchedOnSusceptance']);
    }
};

const deepFindValue = (obj: any, path: any) => {
    if (path === undefined) {
        return undefined;
    }
    let paths = path.split('.'),
        current = obj,
        i;

    for (i = 0; i < paths.length; ++i) {
        if (current[paths[i]] === undefined) {
            return undefined;
        } else {
            current = current[paths[i]];
        }
    }
    return current;
};

export const deepUpdateValue = (obj: any, path: any, value: any) => {
    let paths = path.split('.'),
        current = structuredClone(obj),
        data = current,
        i;

    for (i = 0; i < paths.length - 1; ++i) {
        if (current[paths[i]] === undefined) {
            current[paths[i]] = {};
        }
        current = current[paths[i]];
    }
    current[paths[i]] = value;
    return data;
};

const isValueValid = (fieldVal: any, colDef: any, gridContext: any) => {
    if (
        fieldVal === undefined ||
        fieldVal === null ||
        fieldVal === '' ||
        (isNaN(fieldVal) && colDef.numeric)
    ) {
        let originalValue = deepFindValue(
            gridContext.dataToModify,
            colDef.field
        );
        if (originalValue !== undefined) {
            return false;
        } else if (colDef.crossValidation?.optional) {
            return true;
        } else if (colDef.crossValidation?.requiredOn) {
            const isConditionFulfiled = checkCrossValidationRequiredOn(
                gridContext.dynamicValidation,
                colDef
            );
            if (!isConditionFulfiled) {
                return false;
            }
        } else if (colDef.numeric) {
            return false;
        }
    }
    if (colDef.crossValidation?.allowZero && fieldVal === 0) {
        return true;
    }
    const minExpression = colDef.crossValidation?.minExpression;
    const maxExpression = colDef.crossValidation?.maxExpression;
    if (maxExpression !== undefined || minExpression !== undefined) {
        const minVal = !isNaN(minExpression)
            ? minExpression
            : deepFindValue(gridContext.dynamicValidation, minExpression);
        const maxVal = !isNaN(maxExpression)
            ? maxExpression
            : deepFindValue(gridContext.dynamicValidation, maxExpression);
        return (
            (minVal === undefined || fieldVal >= minVal) &&
            (maxVal === undefined || fieldVal <= maxVal)
        );
    }
    return true;
};

export const checkValidationsAndRefreshCells = (
    gridApi: GridApi,
    gridContext: any
) => {
    const updatedErrors = { ...gridContext.editErrors };
    const columnsWithCrossValidation =
        gridApi.getColumnDefs()?.filter(({ editable }: ColDef) => editable) ??
        [];
    columnsWithCrossValidation.forEach((colDef: ColDef) => {
        const { field = '' } = colDef;
        const fieldVal = deepFindValue(gridContext.dynamicValidation, field);
        const isValid = isValueValid(fieldVal, colDef, gridContext);
        if (isValid) {
            delete updatedErrors[field];
            gridContext.editErrors = updatedErrors;
        } else {
            updatedErrors[field] = true;
            gridContext.editErrors = updatedErrors;
        }
    });
    const rowNode = gridApi.getPinnedTopRow(0);
    if (rowNode) {
        const mappedColumnsWithCrossValidation: Column[] = (
            columnsWithCrossValidation || []
        )
            .map(({ field }: ColDef) => field as Column | undefined)
            .filter((field): field is Column => typeof field !== 'undefined');
        const refreshConfig: RefreshCellsParams = {
            rowNodes: [rowNode],
            columns: [...mappedColumnsWithCrossValidation, EDIT_COLUMN],
            force: true,
        };
        gridApi.refreshCells(refreshConfig);
    }
};

const checkCrossValidationRequiredOn = (
    dynamicValidation: DynamicValidation,
    colDef: ColDef
) => {
    const requiredOn = colDef?.crossValidation?.requiredOn ?? {};
    let dependencyValue = deepFindValue(
        dynamicValidation,
        requiredOn?.dependencyColumn
    );
    if (typeof dependencyValue === 'boolean') {
        dependencyValue = dependencyValue ? 1 : 0;
    }
    if ('columnValue' in requiredOn) {
        // if the prop columnValue exist, then we compare its value with the current value
        return dependencyValue !== requiredOn.columnValue;
    } else {
        // otherwise, we just check if there is a current value
        return dependencyValue === undefined;
    }
};
