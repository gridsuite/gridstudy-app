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
            id: 'ID',
            field: 'id',
            columnWidth: MEDIUM_COLUMN_WIDTH,
            isDefaultSort: true,
            ...defaultTextFilterConfig,
        },
        {
            id: 'Name',
            field: 'name',
            ...defaultTextFilterConfig,
            ...editableColumnConfig,
        },
        {
            id: 'VoltageLevelId',
            field: 'voltageLevelId',
            ...defaultTextFilterConfig,
        },
        {
            id: 'Country',
            field: 'country',
            ...countryEnumFilterConfig,
            cellRenderer: CountryCellRenderer,
        },
        {
            id: 'NominalV',
            field: 'nominalVoltage',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 0,
        },
        {
            id: 'energySource',
            field: 'energySource',
            ...getDefaultEnumConfig(ENERGY_SOURCES),
            ...editableColumnConfig,
            ...enumCellEditorConfig((params) => params.data?.energySource, ENERGY_SOURCES),
        },
        {
            id: 'activePower',
            field: 'p',
            numeric: true,
            fractionDigits: 1,
            ...defaultNumericFilterConfig,
            canBeInvalidated: true,
            withFluxConvention: true,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePower',
            field: 'q',
            numeric: true,
            fractionDigits: 1,
            ...defaultNumericFilterConfig,
            canBeInvalidated: true,
            withFluxConvention: true,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ActivePowerControl',
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
            ...booleanCellEditorConfig((params) =>
                params.data?.activePowerControl?.participate != null
                    ? params.data.activePowerControl.participate
                    : false
            ),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ActivePowerRegulationDroop',
            field: 'activePowerControl.droop',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
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
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
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
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
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
            ...defaultNumericFilterConfig,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.targetP),
            fractionDigits: 1,
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
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
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
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            ...editableColumnConfig,
            ...booleanCellEditorConfig((params) =>
                params.data?.voltageRegulatorOn != null ? params.data.voltageRegulatorOn : false
            ),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'voltageSetpoint',
            field: 'targetV',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
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
            ...defaultNumericFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
            ...editableColumnConfig,
            numeric: true,
            fractionDigits: 1,
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
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
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
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
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
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
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
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
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
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 2,
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
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 2,
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
            boolean: true,
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RegulationTypeText',
            field: 'RegulationTypeText',
            ...getDefaultEnumConfig(Object.values(REGULATION_TYPES)),
            ...editableColumnConfig,
            ...enumCellEditorConfig((params) => params.data?.RegulationTypeText, Object.values(REGULATION_TYPES)),
        },
        {
            id: 'RegulatingTerminalGenerator',
            field: 'RegulatingTerminalGenerator',
            ...defaultTextFilterConfig,
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
