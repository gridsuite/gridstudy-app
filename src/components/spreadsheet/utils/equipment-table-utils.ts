import { SHUNT_COMPENSATOR_TYPES } from 'components/utils/field-constants';
import {
    computeMaxQAtNominalV,
    computeMaxSusceptance,
    computeSwitchedOnValue,
} from 'components/utils/utils';
import { EDIT_COLUMN } from './config-tables';

export const updateShuntCompensatorCells = (params: any) => {
    const rowNode = params.node;
    const colId = params.column.colId;
    const type = params.data.type;
    const maxSusceptance = params.data.maxSusceptance;
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
            params.api.flashCells({
                rowNodes: [rowNode],
                columns: ['maxSusceptance', 'switchedOnSusceptance'],
            });
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
            params.api.flashCells({
                rowNodes: [rowNode],
                columns: ['maxQAtNominalV', 'switchedOnQAtNominalV'],
            });
        }
        rowNode.setDataValue(
            'switchedOnSusceptance',
            computeSwitchedOnValue(
                sectionCount,
                maximumSectionCount,
                maxSusceptance
            )
        );
        params.api.flashCells({
            rowNodes: [rowNode],
            columns: ['switchedOnSusceptance'],
        });
        if (maxSusceptance < 0 && type !== SHUNT_COMPENSATOR_TYPES.REACTOR.id) {
            rowNode.setDataValue('type', SHUNT_COMPENSATOR_TYPES.REACTOR.id);
            params.api.flashCells({
                rowNodes: [rowNode],
                columns: ['type'],
            });
        } else if (
            maxSusceptance > 0 &&
            type !== SHUNT_COMPENSATOR_TYPES.CAPACITOR.id
        ) {
            rowNode.setDataValue('type', SHUNT_COMPENSATOR_TYPES.CAPACITOR.id);
            params.api.flashCells({
                rowNodes: [rowNode],
                columns: ['type'],
            });
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
        rowNode.setDataValue(
            'maxSusceptance',
            computeMaxSusceptance(maxQAtNominalV, nominalVoltage)
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
        params.api.flashCells({
            rowNodes: [rowNode],
            columns: [
                'switchedOnQAtNominalV',
                'maxSusceptance',
                'switchedOnSusceptance',
            ],
        });
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
        params.api.flashCells({
            rowNodes: [rowNode],
            columns: ['switchedOnQAtNominalV', 'switchedOnSusceptance'],
        });
    }
};

const deepFindValue = (obj: any, path: any) => {
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

// build object from path and value (e.g. 'a.b.c', 1) => {a: {b: {c: 1}}}
export const buildObjectFromPath = (path: any, value: any) => {
    const paths = path.split('.');
    let obj = {};
    let current: any = obj;
    let i;

    for (i = 0; i < paths.length - 1; ++i) {
        current[paths[i]] = {};
        current = current[paths[i]];
    }
    current[paths[i]] = value;
    return obj;
};

export const checkValidationsAndRefreshCells = (
    gridApi: any,
    gridContext: any
) => {
    const updatedErrors = { ...gridContext.editErrors };
    const columnsWithCrossValidation = gridApi
        .getColumnDefs()
        .filter((colDef: any) => colDef.editable && colDef.crossValidation);
    columnsWithCrossValidation.forEach((colDef: any) => {
        let isValid = true;

        const fieldVal = deepFindValue(
            gridContext.dynamicValidation,
            colDef.field
        );

        if (fieldVal === undefined || fieldVal === null || isNaN(fieldVal)) {
            if (colDef.crossValidation?.optional) {
                isValid = true;
            } else if (colDef.crossValidation?.requiredOn) {
                const isConditionFulfiled = checkCrossValidationRequiredOn(
                    gridContext.dynamicValidation,
                    colDef
                );
                if (isConditionFulfiled) {
                    isValid = true;
                } else {
                    isValid = false;
                }
            } else {
                isValid = false;
            }
        }
        if (colDef.crossValidation?.allowZero && fieldVal === 0) {
            isValid = true;
        }
        const minExpression = colDef.crossValidation?.minExpression;
        const maxExpression = colDef.crossValidation?.maxExpression;
        if (maxExpression || minExpression) {
            const minVal = !isNaN(minExpression)
                ? minExpression
                : gridContext.dynamicValidation[minExpression];
            const maxVal = !isNaN(maxExpression)
                ? maxExpression
                : gridContext.dynamicValidation[maxExpression];
            isValid =
                (minVal === undefined || fieldVal >= minVal) &&
                (maxVal === undefined || fieldVal <= maxVal);
        }

        if (isValid) {
            delete updatedErrors[colDef.field];
            gridContext.editErrors = updatedErrors;
        } else {
            updatedErrors[colDef.field] = true;
            gridContext.editErrors = updatedErrors;
        }
    });
    const rowNode = gridApi.getPinnedTopRow(0);
    if (rowNode) {
        const refreshConfig = {
            rowNodes: [rowNode],
            columns: [
                ...columnsWithCrossValidation.map(
                    (colDef: any) => colDef.field
                ),
                EDIT_COLUMN,
            ],
            force: true,
        };
        gridApi.refreshCells(refreshConfig);
    }
};

const checkCrossValidationRequiredOn = (
    dynamicValidation: any,
    colDef: any
) => {
    let dependencyValue = deepFindValue(
        dynamicValidation,
        colDef.crossValidation.requiredOn.dependencyColumn
    );
    if (typeof dependencyValue === 'boolean') {
        dependencyValue = dependencyValue ? 1 : 0;
    }
    if ('columnValue' in colDef.crossValidation.requiredOn) {
        // if the prop columnValue exist, then we compare its value with the current value
        return (
            dependencyValue !== colDef.crossValidation.requiredOn.columnValue
        );
    } else {
        // otherwise, we just check if there is a current value
        return dependencyValue === undefined;
    }
};
