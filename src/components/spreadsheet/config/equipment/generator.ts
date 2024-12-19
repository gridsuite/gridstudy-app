/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { ReadonlyDeep } from 'type-fest';
import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import {
    type EquipmentTableDataEditorProps,
    GeneratorRegulatingTerminalEditor,
} from '../../utils/equipment-table-editors';
import type { EditableCallback, ValueGetterFunc } from 'ag-grid-community';
import { editableCellStyle, editableColumnConfig, excludeFromGlobalFilter, typeAndFetchers } from './common-config';
import {
    BOOLEAN_TYPE,
    COUNTRY_TYPE,
    ENERGY_SOURCE_ENUM_TYPE,
    MEDIUM_COLUMN_WIDTH,
    NUMERIC_APPLY_FLUX_CONVENTION_1_FRACTION_DIGITS_TYPE,
    NUMERIC_CAN_BE_INVALIDATED_TYPE,
    REGULATION_ENUM_TYPE,
    TEXT_TYPE,
    NUMERIC_1_FRACTION_DIGITS_TYPE,
    NUMERIC_2_FRACTION_DIGITS_TYPE,
} from '../../utils/constants';
import { ENERGY_SOURCES, REGULATION_TYPES } from '../../../network/constants';
import { genericColumnOfPropertiesEditPopup } from '../common/column-properties';
import {
    booleanCellEditorConfig,
    enumCellEditorConfig,
    type ICustomCellEditorParams,
    numericalCellEditorConfig,
} from '../common/cell-editors';
import { SortWay } from 'hooks/use-aggrid-sort';

const RegulatingTerminalCellGetter: ValueGetterFunc = (params) => {
    const { regulatingTerminalConnectableId, regulatingTerminalVlId, regulatingTerminalConnectableType } =
        params?.data || {};

    if (
        regulatingTerminalVlId &&
        regulatingTerminalConnectableId &&
        regulatingTerminalConnectableType.trim() !== '' &&
        regulatingTerminalConnectableId.trim() !== ''
    ) {
        return `${regulatingTerminalConnectableType} (${regulatingTerminalConnectableId})`;
    }

    return null;
};

const isEditableRegulatingTerminalCell: EditableCallback = (params) => {
    return (
        params.node.rowIndex === 0 &&
        params.node.rowPinned === 'top' &&
        (params.data.RegulationTypeText === REGULATION_TYPES.DISTANT.id ||
            params.data?.regulatingTerminalVlId ||
            params.data?.regulatingTerminalConnectableId)
    );
};

export const GENERATOR_TAB_DEF = {
    index: 5,
    name: 'Generators',
    ...typeAndFetchers(EQUIPMENT_TYPES.GENERATOR),
    columns: [
        {
            id: 'ID',
            field: 'id',
            columnWidth: MEDIUM_COLUMN_WIDTH,
            type: TEXT_TYPE,
            sort: SortWay.ASC,
        },
        {
            id: 'Name',
            field: 'name',
            type: TEXT_TYPE,
            ...editableColumnConfig,
        },
        {
            id: 'VoltageLevelId',
            field: 'voltageLevelId',
            type: TEXT_TYPE,
        },
        {
            id: 'Country',
            field: 'country',
            type: COUNTRY_TYPE,
        },
        {
            id: 'NominalV',
            field: 'nominalVoltage',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
        },
        {
            id: 'energySource',
            field: 'energySource',
            type: ENERGY_SOURCE_ENUM_TYPE,
            ...editableColumnConfig,
            ...enumCellEditorConfig((params) => params.data?.energySource, ENERGY_SOURCES),
        },
        {
            id: 'activePower',
            field: 'p',
            type: [NUMERIC_APPLY_FLUX_CONVENTION_1_FRACTION_DIGITS_TYPE, NUMERIC_CAN_BE_INVALIDATED_TYPE],
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePower',
            field: 'q',
            type: [NUMERIC_APPLY_FLUX_CONVENTION_1_FRACTION_DIGITS_TYPE, NUMERIC_CAN_BE_INVALIDATED_TYPE],
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ActivePowerControl',
            field: 'activePowerControl.participate',
            type: BOOLEAN_TYPE,
            ...editableColumnConfig,
            valueSetter: (params) => {
                params.data.activePowerControl = {
                    ...(params.data.activePowerControl || {}),
                    participate: params.newValue,
                };

                return true;
            },
            ...booleanCellEditorConfig((params) => params.data?.activePowerControl?.participate ?? false),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ActivePowerRegulationDroop',
            field: 'activePowerControl.droop',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.activePowerControl?.droop),
            valueGetter: (params) => params.data?.activePowerControl?.droop,
            valueSetter: (params) => {
                params.data.activePowerControl = {
                    ...(params.data.activePowerControl || {}),
                    droop: params.newValue,
                };
                return true;
            },
            crossValidation: {
                requiredOn: {
                    dependencyColumn: 'activePowerControl.participate',
                    columnValue: true,
                },
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'minP',
            field: 'minP',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.minP),
            getQuickFilterText: excludeFromGlobalFilter,
            crossValidation: {
                maxExpression: 'maxP',
            },
        },
        {
            id: 'maxP',
            field: 'maxP',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.maxP),
            getQuickFilterText: excludeFromGlobalFilter,
            crossValidation: {
                minExpression: 'minP',
            },
        },
        {
            id: 'activePowerSetpoint',
            field: 'targetP',
            numeric: true,
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.targetP),
            getQuickFilterText: excludeFromGlobalFilter,
            crossValidation: {
                minExpression: 'minP',
                maxExpression: 'maxP',
                allowZero: true,
            },
        },
        {
            id: 'reactivePowerSetpoint',
            field: 'targetQ',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.targetQ),
            crossValidation: {
                requiredOn: {
                    dependencyColumn: 'voltageRegulatorOn',
                    columnValue: false,
                },
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'voltageRegulationOn',
            field: 'voltageRegulatorOn',
            type: BOOLEAN_TYPE,
            ...editableColumnConfig,
            ...booleanCellEditorConfig((params) => params.data?.voltageRegulatorOn ?? false),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'voltageSetpoint',
            field: 'targetV',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.targetV),
            crossValidation: {
                requiredOn: {
                    dependencyColumn: 'voltageRegulatorOn',
                    columnValue: true,
                },
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePercentageVoltageRegulation',
            field: 'coordinatedReactiveControl.qPercent',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => {
                const qPercent = params.data?.coordinatedReactiveControl?.qPercent;
                return isNaN(qPercent) ? 0 : qPercent;
            }),
            valueGetter: (params) => {
                const qPercent = params.data?.coordinatedReactiveControl?.qPercent;
                return isNaN(qPercent) ? 0 : qPercent;
            },
            valueSetter: (params) => {
                params.data.coordinatedReactiveControl = {
                    ...params.data.coordinatedReactiveControl,
                    qPercent: params.newValue,
                };
                return true;
            },
            crossValidation: {
                optional: true,
            },
        },
        {
            id: 'directTransX',
            field: 'generatorShortCircuit.directTransX',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data?.generatorShortCircuit?.directTransX || 0),
            valueGetter: (params) => params.data?.generatorShortCircuit?.directTransX,
            valueSetter: (params) => {
                params.data.generatorShortCircuit = {
                    ...params.data.generatorShortCircuit,
                    directTransX: params.newValue,
                };
                return true;
            },
            crossValidation: {
                optional: true,
            },
        },
        {
            id: 'stepUpTransformerX',
            field: 'generatorShortCircuit.stepUpTransformerX',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data?.generatorShortCircuit?.stepUpTransformerX || 0),
            valueGetter: (params) => params.data?.generatorShortCircuit?.stepUpTransformerX,
            valueSetter: (params) => {
                params.data.generatorShortCircuit = {
                    ...params.data.generatorShortCircuit,
                    stepUpTransformerX: params.newValue,
                };
                return true;
            },
            crossValidation: {
                optional: true,
            },
        },
        {
            id: 'plannedActivePowerSetPoint',
            field: 'generatorStartup.plannedActivePowerSetPoint',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data?.generatorStartup?.plannedActivePowerSetPoint),
            valueGetter: (params) => params.data?.generatorStartup?.plannedActivePowerSetPoint,
            valueSetter: (params) => {
                params.data.generatorStartup = {
                    ...params.data?.generatorStartup,
                    plannedActivePowerSetPoint: params.newValue,
                };
                return true;
            },
            crossValidation: {
                optional: true,
            },
        },
        {
            id: 'marginalCost',
            field: 'generatorStartup.marginalCost',
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data?.generatorStartup?.marginalCost),
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
            valueGetter: (params) => params.data?.generatorStartup?.marginalCost,
            valueSetter: (params) => {
                params.data.generatorStartup = {
                    ...params.data?.generatorStartup,
                    marginalCost: params.newValue,
                };
                return true;
            },
            crossValidation: {
                optional: true,
            },
        },
        {
            id: 'plannedOutageRate',
            field: 'generatorStartup.plannedOutageRate',
            type: NUMERIC_2_FRACTION_DIGITS_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data?.generatorStartup?.plannedOutageRate || 0),
            crossValidation: {
                optional: true,
                maxExpression: 1,
                minExpression: 0,
            },
            valueGetter: (params) => params.data?.generatorStartup?.plannedOutageRate,
            valueSetter: (params) => {
                params.data.generatorStartup = {
                    ...params.data?.generatorStartup,
                    plannedOutageRate: params.newValue,
                };
                return true;
            },
        },
        {
            id: 'forcedOutageRate',
            field: 'generatorStartup.forcedOutageRate',
            type: NUMERIC_2_FRACTION_DIGITS_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.generatorStartup?.forcedOutageRate),
            crossValidation: {
                optional: true,
                maxExpression: 1,
                minExpression: 0,
            },
            valueGetter: (params) => params.data?.generatorStartup?.forcedOutageRate,
            valueSetter: (params) => {
                params.data.generatorStartup = {
                    ...params.data?.generatorStartup,
                    forcedOutageRate: params.newValue,
                };
                return true;
            },
        },
        {
            id: 'connected',
            field: 'terminalConnected',
            type: BOOLEAN_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RegulationTypeText',
            field: 'RegulationTypeText',
            type: REGULATION_ENUM_TYPE,
            ...editableColumnConfig,
            ...enumCellEditorConfig((params) => params.data?.RegulationTypeText, Object.values(REGULATION_TYPES)),
        },
        {
            id: 'RegulatingTerminalGenerator',
            field: 'RegulatingTerminalGenerator',
            type: TEXT_TYPE,
            valueGetter: RegulatingTerminalCellGetter,
            cellStyle: (params) => (isEditableRegulatingTerminalCell(params) ? editableCellStyle(params) : {}),
            editable: isEditableRegulatingTerminalCell,
            crossValidation: {
                requiredOn: {
                    dependencyColumn: 'RegulationTypeText',
                    columnValue: REGULATION_TYPES.DISTANT.id,
                },
            },
            cellEditor: GeneratorRegulatingTerminalEditor,
            cellEditorParams: (params: ICustomCellEditorParams): EquipmentTableDataEditorProps => ({
                // @ts-expect-error TODO: defaultValue does not exist in type EquipmentTableDataEditorProps
                defaultValue: RegulatingTerminalCellGetter,
                gridContext: params.context,
                gridApi: params.api,
                colDef: params.colDef,
                rowData: params.data,
            }),
            cellEditorPopup: true,
        },
        genericColumnOfPropertiesEditPopup,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;
