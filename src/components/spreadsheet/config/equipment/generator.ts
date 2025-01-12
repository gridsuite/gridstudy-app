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
import CountryCellRenderer from '../../utils/country-cell-render';
import type { EditableCallback, ValueGetterFunc } from 'ag-grid-community';
import { BooleanCellRenderer } from '../../utils/cell-renderers';
import {
    countryEnumFilterConfig,
    defaultBooleanFilterConfig,
    defaultNumericFilterConfig,
    defaultTextFilterConfig,
    editableCellStyle,
    editableColumnConfig,
    excludeFromGlobalFilter,
    getDefaultEnumConfig,
    typeAndFetchers,
} from './common-config';
import { MEDIUM_COLUMN_WIDTH } from '../../utils/constants';
import { ENERGY_SOURCES, REGULATION_TYPES } from '../../../network/constants';
import { genericColumnOfPropertiesEditPopup } from '../common/column-properties';
import {
    booleanCellEditorConfig,
    enumCellEditorConfig,
    type ICustomCellEditorParams,
    numericalCellEditorConfig,
} from '../common/cell-editors';

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
            colId: 'ID',
            field: 'id',
            ...defaultTextFilterConfig,
            context: {
                ...defaultTextFilterConfig.context,
                columnWidth: MEDIUM_COLUMN_WIDTH,
                isDefaultSort: true,
            },
        },
        {
            colId: 'Name',
            field: 'name',
            ...defaultTextFilterConfig,
            ...editableColumnConfig,
        },
        {
            colId: 'VoltageLevelId',
            field: 'voltageLevelId',
            ...defaultTextFilterConfig,
        },
        {
            colId: 'Country',
            field: 'country',
            ...countryEnumFilterConfig,
            cellRenderer: CountryCellRenderer,
        },
        {
            colId: 'NominalV',
            field: 'nominalVoltage',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 0,
            },
        },
        {
            colId: 'energySource',
            field: 'energySource',
            ...getDefaultEnumConfig(ENERGY_SOURCES),
            ...editableColumnConfig,
            ...enumCellEditorConfig((params) => params.data?.energySource, ENERGY_SOURCES),
        },
        {
            colId: 'activePower',
            field: 'p',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
                withFluxConvention: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'ReactivePower',
            field: 'q',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
                withFluxConvention: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'ActivePowerControl',
            field: 'activePowerControl.participate',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
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
            colId: 'ActivePowerRegulationDroop',
            field: 'activePowerControl.droop',
            ...defaultNumericFilterConfig,
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
            getQuickFilterText: excludeFromGlobalFilter,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                crossValidation: {
                    requiredOn: {
                        dependencyColumn: 'activePowerControl.participate',
                        columnValue: true,
                    },
                },
            },
        },
        {
            colId: 'minP',
            field: 'minP',
            ...defaultNumericFilterConfig,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.minP),
            getQuickFilterText: excludeFromGlobalFilter,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                crossValidation: {
                    maxExpression: 'maxP',
                },
            },
        },
        {
            colId: 'maxP',
            field: 'maxP',
            ...defaultNumericFilterConfig,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.maxP),
            getQuickFilterText: excludeFromGlobalFilter,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                crossValidation: {
                    minExpression: 'minP',
                },
            },
        },
        {
            colId: 'activePowerSetpoint',
            field: 'targetP',
            ...defaultNumericFilterConfig,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.targetP),
            getQuickFilterText: excludeFromGlobalFilter,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                crossValidation: {
                    minExpression: 'minP',
                    maxExpression: 'maxP',
                    allowZero: true,
                },
            },
        },
        {
            colId: 'reactivePowerSetpoint',
            field: 'targetQ',
            ...defaultNumericFilterConfig,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.targetQ),
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                crossValidation: {
                    requiredOn: {
                        dependencyColumn: 'voltageRegulatorOn',
                        columnValue: false,
                    },
                },
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'voltageRegulationOn',
            field: 'voltageRegulatorOn',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            ...editableColumnConfig,
            ...booleanCellEditorConfig((params) => params.data?.voltageRegulatorOn ?? false),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'voltageSetpoint',
            field: 'targetV',
            ...defaultNumericFilterConfig,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.targetV),
            getQuickFilterText: excludeFromGlobalFilter,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                crossValidation: {
                    requiredOn: {
                        dependencyColumn: 'voltageRegulatorOn',
                        columnValue: true,
                    },
                },
            },
        },
        {
            colId: 'ReactivePercentageVoltageRegulation',
            field: 'coordinatedReactiveControl.qPercent',
            ...defaultNumericFilterConfig,
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
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                crossValidation: {
                    optional: true,
                },
            },
        },
        {
            colId: 'directTransX',
            field: 'generatorShortCircuit.directTransX',
            ...defaultNumericFilterConfig,
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
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                crossValidation: {
                    optional: true,
                },
            },
        },
        {
            colId: 'stepUpTransformerX',
            field: 'generatorShortCircuit.stepUpTransformerX',
            ...defaultNumericFilterConfig,
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
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                crossValidation: {
                    optional: true,
                },
            },
        },
        {
            colId: 'plannedActivePowerSetPoint',
            field: 'generatorStartup.plannedActivePowerSetPoint',
            ...defaultNumericFilterConfig,
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
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                crossValidation: {
                    optional: true,
                },
            },
        },
        {
            colId: 'marginalCost',
            field: 'generatorStartup.marginalCost',
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data?.generatorStartup?.marginalCost),
            ...defaultNumericFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
            valueGetter: (params) => params.data?.generatorStartup?.marginalCost,
            valueSetter: (params) => {
                params.data.generatorStartup = {
                    ...params.data?.generatorStartup,
                    marginalCost: params.newValue,
                };
                return true;
            },
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                crossValidation: {
                    optional: true,
                },
            },
        },
        {
            colId: 'plannedOutageRate',
            field: 'generatorStartup.plannedOutageRate',
            ...defaultNumericFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data?.generatorStartup?.plannedOutageRate || 0),
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 2,
                crossValidation: {
                    optional: true,
                    maxExpression: 1,
                    minExpression: 0,
                },
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
            colId: 'forcedOutageRate',
            field: 'generatorStartup.forcedOutageRate',
            ...defaultNumericFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.generatorStartup?.forcedOutageRate),
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 2,
                crossValidation: {
                    optional: true,
                    maxExpression: 1,
                    minExpression: 0,
                },
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
            colId: 'connected',
            field: 'terminalConnected',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
                boolean: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'RegulationTypeText',
            field: 'RegulationTypeText',
            ...getDefaultEnumConfig(Object.values(REGULATION_TYPES)),
            ...editableColumnConfig,
            ...enumCellEditorConfig((params) => params.data?.RegulationTypeText, Object.values(REGULATION_TYPES)),
        },
        {
            colId: 'RegulatingTerminalGenerator',
            field: 'RegulatingTerminalGenerator',
            ...defaultTextFilterConfig,
            valueGetter: RegulatingTerminalCellGetter,
            cellStyle: (params) => (isEditableRegulatingTerminalCell(params) ? editableCellStyle(params) : {}),
            editable: isEditableRegulatingTerminalCell,
            context: {
                ...defaultTextFilterConfig.context,
                crossValidation: {
                    requiredOn: {
                        dependencyColumn: 'RegulationTypeText',
                        columnValue: REGULATION_TYPES.DISTANT.id,
                    },
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
