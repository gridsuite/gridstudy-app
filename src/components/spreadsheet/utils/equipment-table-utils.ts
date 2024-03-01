import {
    computeMaxQAtNominalV,
    computeMaxSusceptance,
    computeSwitchedOnValue,
    getTapChangerRegulationTerminalValue,
} from 'components/utils/utils';
import { EDIT_COLUMN } from './config-tables';
import {
    CellEditingStoppedEvent,
    ColDef,
    Column,
    RefreshCellsParams,
    GridApi,
} from 'ag-grid-community';
import {
    REGULATION_TYPES,
    SHUNT_COMPENSATOR_TYPES,
} from 'components/network/constants';
import {
    getComputedRegulationTypeId,
    getComputedTapSideId,
    getInitialTwtRatioRegulationModeId,
} from 'components/dialogs/network-modifications/two-windings-transformer/tap-changer-pane/ratio-tap-changer-pane/ratio-tap-changer-pane-utils';
import {
    getComputedPhaseRegulationTypeId,
    getPhaseTapRegulationSideId,
} from 'components/dialogs/network-modifications/two-windings-transformer/tap-changer-pane/phase-tap-changer-pane/phase-tap-changer-pane-utils';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';

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

const updateCellValue = (
    colId: string,
    value: any,
    cellEditingParams: CellEditingStoppedEvent
) => {
    const columnState = cellEditingParams.columnApi.getColumnState();
    if (columnState.find(({ colId: columnId }: any) => columnId === colId)) {
        cellEditingParams.node.setDataValue(colId, value);
        cellEditingParams.api.flashCells({
            rowNodes: [cellEditingParams.node],
            columns: [colId],
        });
    } else {
        cellEditingParams.data[colId] = value;
    }
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

/*
 * This function is used to format the data of the table to be able to display it in the table
 * and resolve the issue of the calculated fields
 */
const formatRatioTapChanger = (twt: any) => {
    if (!twt?.ratioTapChanger) {
        return twt;
    }

    const regulationType = getComputedRegulationTypeId(twt) ?? undefined;
    const regulationSide =
        regulationType === REGULATION_TYPES.LOCAL.id
            ? getComputedTapSideId(twt)
            : undefined;
    const ratioRegulatingTerminal =
        regulationType === REGULATION_TYPES.DISTANT.id
            ? getTapChangerRegulationTerminalValue(twt.ratioTapChanger)
            : null;

    return {
        ...twt,
        ratioTapChanger: {
            ...twt.ratioTapChanger,
            regulationMode:
                getInitialTwtRatioRegulationModeId(twt) ?? undefined,
            regulationType,
            regulationSide,
            ratioRegulatingTerminal,
        },
    };
};

const formatPhaseTapChanger = (twt: any) => {
    if (!twt?.phaseTapChanger) {
        return twt;
    }

    const regulationType = getComputedPhaseRegulationTypeId(twt) ?? undefined;
    const regulationSide =
        regulationType === REGULATION_TYPES.LOCAL.id
            ? getPhaseTapRegulationSideId(twt)
            : undefined;
    const phaseRegulatingTerminal =
        regulationType === REGULATION_TYPES.DISTANT.id
            ? getTapChangerRegulationTerminalValue(twt.phaseTapChanger)
            : null;

    return {
        ...twt,
        phaseTapChanger: {
            ...twt.phaseTapChanger,
            regulationType,
            regulationSide,
            phaseRegulatingTerminal,
        },
    };
};

export const formatTwtDataForTable = (twt: any) => {
    let formattedTwt = formatRatioTapChanger(twt);
    formattedTwt = formatPhaseTapChanger(formattedTwt);

    return formattedTwt;
};

export const formatFetchedEquipments = (
    equipmentType: string,
    equipments: any
) => {
    if (equipmentType === EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER) {
        return equipments.map(formatTwtDataForTable);
    }
    return equipments;
};

export const updateTwtCells = (params: CellEditingStoppedEvent) => {
    const colId = params.column.getColId();
    const ratioRegulationTypeText =
        params.data?.ratioTapChanger?.regulationType;
    const phaseRegulationTypeText =
        params.data?.phaseTapChanger?.regulationType;
    switch (colId) {
        case 'ratioTapChanger.regulationType':
            if (ratioRegulationTypeText === REGULATION_TYPES.DISTANT.id) {
                // empty regulation side
                updateCellValue('ratioTapChanger.regulationSide', null, params);
            } else if (ratioRegulationTypeText === REGULATION_TYPES.LOCAL.id) {
                params.data.ratioTapChanger.regulatingTerminalVlId = null;
                params.data.ratioTapChanger.regulatingTerminalConnectableId =
                    null;
                params.data.ratioTapChanger.regulatingTerminalConnectableType =
                    null;
                updateCellValue(
                    'ratioTapChanger.ratioRegulatingTerminal',
                    null,
                    params
                );
            }
            break;

        case 'phaseTapChanger.regulationType':
            if (phaseRegulationTypeText === REGULATION_TYPES.DISTANT.id) {
                // empty regulation side
                updateCellValue('phaseTapChanger.regulationSide', null, params);
            } else if (phaseRegulationTypeText === REGULATION_TYPES.LOCAL.id) {
                params.data.phaseTapChanger.regulatingTerminalVlId = null;
                params.data.phaseTapChanger.regulatingTerminalConnectableId =
                    null;
                params.data.phaseTapChanger.regulatingTerminalConnectableType =
                    null;
                updateCellValue(
                    'phaseTapChanger.phaseRegulatingTerminal',
                    null,
                    params
                );
            }
            break;

        case 'ratioTapChanger.ratioRegulatingTerminal':
            const ratioRegulatingTerminal =
                params.data?.ratioTapChanger?.ratioRegulatingTerminal;
            if (ratioRegulatingTerminal) {
                const ratioTapChanger = { ...params.data?.ratioTapChanger };
                ratioTapChanger.regulatingTerminalVlId =
                    params.context.dynamicValidation.ratioTapChanger.regulatingTerminalVlId;
                ratioTapChanger.regulatingTerminalConnectableId =
                    params.context.dynamicValidation.ratioTapChanger.regulatingTerminalConnectableId;
                ratioTapChanger.regulatingTerminalConnectableType =
                    params.context.dynamicValidation.ratioTapChanger.regulatingTerminalConnectableType;
                params.data.ratioTapChanger = ratioTapChanger;
            }
            break;

        case 'phaseTapChanger.phaseRegulatingTerminal':
            const phaseRegulatingTerminal =
                params.data?.phaseTapChanger?.phaseRegulatingTerminal;
            if (phaseRegulatingTerminal) {
                const phaseTapChanger = { ...params.data?.phaseTapChanger };
                phaseTapChanger.regulatingTerminalVlId =
                    params.context.dynamicValidation.phaseTapChanger.regulatingTerminalVlId;
                phaseTapChanger.regulatingTerminalConnectableId =
                    params.context.dynamicValidation.phaseTapChanger.regulatingTerminalConnectableId;
                phaseTapChanger.regulatingTerminalConnectableType =
                    params.context.dynamicValidation.phaseTapChanger.regulatingTerminalConnectableType;
                params.data.phaseTapChanger = phaseTapChanger;
            }
            break;
        default:
            break;
    }
};

export const updateShuntCompensatorCells = (
    params: CellEditingStoppedEvent
) => {
    const colId = params.column.getColId();
    const maxSusceptance = params.data.maxSusceptance;
    let type = params.data.type;
    if (type === undefined) {
        type =
            maxSusceptance < 0
                ? SHUNT_COMPENSATOR_TYPES.REACTOR.id
                : SHUNT_COMPENSATOR_TYPES.CAPACITOR.id;
    }
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
            updateCellValue('maxSusceptance', -maxSusceptance, params);
            updateCellValue('switchedOnSusceptance', -maxSusceptance, params);
        }
    } else if (colId === 'maxSusceptance') {
        if (Math.abs(maxSusceptance) !== Math.abs(params.oldValue)) {
            updateCellValue(
                'maxQAtNominalV',
                computeMaxQAtNominalV(maxSusceptance, nominalVoltage),
                params
            );
            updateCellValue(
                'switchedOnQAtNominalV',
                computeSwitchedOnValue(
                    sectionCount,
                    maximumSectionCount,
                    maxQAtNominalV
                ),
                params
            );
        }
        updateCellValue(
            'switchedOnSusceptance',
            computeSwitchedOnValue(
                sectionCount,
                maximumSectionCount,
                maxSusceptance
            ),
            params
        );
        if (maxSusceptance < 0 && type !== SHUNT_COMPENSATOR_TYPES.REACTOR.id) {
            updateCellValue('type', SHUNT_COMPENSATOR_TYPES.REACTOR.id, params);
        } else if (
            maxSusceptance > 0 &&
            type !== SHUNT_COMPENSATOR_TYPES.CAPACITOR.id
        ) {
            updateCellValue(
                'type',
                SHUNT_COMPENSATOR_TYPES.CAPACITOR.id,
                params
            );
        }
        params.context.lastEditedField = 'maxSusceptance';
    } else if (colId === 'maxQAtNominalV') {
        updateCellValue(
            'switchedOnQAtNominalV',
            computeSwitchedOnValue(
                sectionCount,
                maximumSectionCount,
                maxQAtNominalV
            ),
            params
        );
        const maxSusceptance = computeMaxSusceptance(
            maxQAtNominalV,
            nominalVoltage
        );
        updateCellValue(
            'maxSusceptance',
            type === SHUNT_COMPENSATOR_TYPES.REACTOR.id
                ? -maxSusceptance
                : maxSusceptance,
            params
        );
        updateCellValue(
            'switchedOnSusceptance',
            computeSwitchedOnValue(
                sectionCount,
                maximumSectionCount,
                maxSusceptance
            ),
            params
        );
        params.context.lastEditedField = 'maxQAtNominalV';
    } else if (colId === 'sectionCount' || colId === 'maximumSectionCount') {
        updateCellValue(
            'switchedOnQAtNominalV',
            computeSwitchedOnValue(
                sectionCount,
                maximumSectionCount,
                maxQAtNominalV
            ),
            params
        );
        updateCellValue(
            'switchedOnSusceptance',
            computeSwitchedOnValue(
                sectionCount,
                maximumSectionCount,
                maxSusceptance
            ),
            params
        );
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
        current = JSON.parse(JSON.stringify(obj)),
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
        originalValue =
            colDef.numeric && isNaN(originalValue) ? undefined : originalValue;

        // if the original value is not undefined, we don't let the user empty the field unless we have
        // another condition that verifies that the field can be empty (requiredOn, optional, etc.)
        if (
            originalValue !== undefined &&
            !colDef.crossValidation?.requiredOn
        ) {
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
