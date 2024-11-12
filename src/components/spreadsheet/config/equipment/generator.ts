/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import {
    BooleanListField,
    EnumListField,
    GeneratorRegulatingTerminalEditor,
    NumericalField,
} from '../../utils/equipment-table-editors';
import CountryCellRenderer from '../../utils/country-cell-render';
import { CellClassParams, EditableCallbackParams, ValueGetterParams, ValueSetterParams } from 'ag-grid-community';
import { BooleanCellRenderer, PropertiesCellRenderer } from '../../utils/cell-renderers';
import { SitePropertiesEditor } from '../../utils/equipement-table-popup-editors';
import {
    countryEnumFilterConfig,
    defaultBooleanFilterConfig,
    defaultNumericFilterConfig,
    defaultTextFilterConfig,
    editableCellStyle,
    excludeFromGlobalFilter,
    getDefaultEnumCellEditorParams,
    getDefaultEnumConfig,
    isEditable,
    propertiesGetter,
    typeAndFetchers,
} from './common-config';
import { MEDIUM_COLUMN_WIDTH } from '../../utils/constants';
import { ENERGY_SOURCES, REGULATION_TYPES } from '../../../network/constants';

const RegulatingTerminalCellGetter = (params: ValueGetterParams) => {
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

const isEditableRegulatingTerminalCell = (params: EditableCallbackParams) => {
    return (
        params.node.rowIndex === 0 &&
        params.node.rowPinned === 'top' &&
        (params.data.RegulationTypeText === REGULATION_TYPES.DISTANT.id ||
            params.data?.regulatingTerminalVlId ||
            params.data?.regulatingTerminalConnectableId)
    );
};

export const GENERATOR_TAB_DEF: SpreadsheetTabDefinition = {
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
            editable: isEditable,
            cellStyle: editableCellStyle,
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
            editable: isEditable,
            cellStyle: editableCellStyle,
            cellEditor: EnumListField,
            cellEditorParams: (params: any) =>
                getDefaultEnumCellEditorParams(params, params.data?.energySource, ENERGY_SOURCES),
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
            editable: isEditable,
            cellStyle: editableCellStyle,
            valueSetter: (params: ValueSetterParams) => {
                params.data.activePowerControl = {
                    ...(params.data.activePowerControl || {}),
                    participate: params.newValue,
                };

                return true;
            },
            cellEditor: BooleanListField,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue:
                        params.data?.activePowerControl?.participate != null
                            ? params.data.activePowerControl.participate
                            : false,
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                };
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ActivePowerRegulationDroop',
            field: 'activePowerControl.droop',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            editable: isEditable,
            cellStyle: editableCellStyle,
            cellEditor: NumericalField,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue: params.data.activePowerControl?.droop,
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                    rowData: params.data,
                };
            },
            valueGetter: (params: ValueGetterParams) => params.data?.activePowerControl?.droop,
            valueSetter: (params: ValueSetterParams) => {
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
            editable: isEditable,
            cellStyle: editableCellStyle,
            cellEditor: NumericalField,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue: params.data.minP,
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                    rowData: params.data,
                };
            },
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
            editable: isEditable,
            cellStyle: editableCellStyle,
            cellEditor: NumericalField,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue: params.data.maxP,
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                    rowData: params.data,
                };
            },
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
            editable: isEditable,
            cellStyle: editableCellStyle,
            cellEditor: NumericalField,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue: params.data.targetP,
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                    rowData: params.data,
                };
            },
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
            editable: isEditable,
            cellStyle: editableCellStyle,
            cellEditor: NumericalField,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue: params.data.targetQ,
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                    rowData: params.data,
                };
            },
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
            editable: isEditable,
            cellStyle: editableCellStyle,
            cellEditor: BooleanListField,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue: params.data?.voltageRegulatorOn != null ? params.data.voltageRegulatorOn : false,
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                };
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'voltageSetpoint',
            field: 'targetV',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            editable: isEditable,
            cellStyle: editableCellStyle,
            cellEditor: NumericalField,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue: params.data.targetV,
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                    rowData: params.data,
                };
            },
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
            editable: isEditable,
            cellStyle: editableCellStyle,
            numeric: true,
            fractionDigits: 1,
            cellEditor: NumericalField,
            cellEditorParams: (params: any) => {
                const qPercent = params.data?.coordinatedReactiveControl?.qPercent;
                return {
                    defaultValue: isNaN(qPercent) ? 0 : qPercent,
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                    rowData: params.data,
                };
            },
            valueGetter: (params: ValueGetterParams) => {
                const qPercent = params.data?.coordinatedReactiveControl?.qPercent;
                return isNaN(qPercent) ? 0 : qPercent;
            },
            valueSetter: (params: ValueSetterParams) => {
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
            editable: isEditable,
            cellStyle: editableCellStyle,
            cellEditor: NumericalField,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue: params.data?.generatorShortCircuit?.directTransX || 0,
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                    rowData: params.data,
                };
            },
            valueGetter: (params: ValueGetterParams) => params.data?.generatorShortCircuit?.directTransX,
            valueSetter: (params: ValueSetterParams) => {
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
            editable: isEditable,
            cellStyle: editableCellStyle,
            cellEditor: NumericalField,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue: params.data?.generatorShortCircuit?.stepUpTransformerX || 0,
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                    rowData: params.data,
                };
            },
            valueGetter: (params: ValueGetterParams) => params.data?.generatorShortCircuit?.stepUpTransformerX,
            valueSetter: (params: ValueSetterParams) => {
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
            editable: isEditable,
            cellStyle: editableCellStyle,
            cellEditor: NumericalField,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue: params.data?.generatorStartup?.plannedActivePowerSetPoint,
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                    rowData: params.data,
                };
            },
            valueGetter: (params: ValueGetterParams) => params.data?.generatorStartup?.plannedActivePowerSetPoint,
            valueSetter: (params: ValueSetterParams) => {
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
            editable: isEditable,
            cellStyle: editableCellStyle,
            cellEditor: NumericalField,
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue: params.data?.generatorStartup?.marginalCost,
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                    rowData: params.data,
                };
            },
            valueGetter: (params: ValueGetterParams) => params.data?.generatorStartup?.marginalCost,
            valueSetter: (params: ValueSetterParams) => {
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
            editable: isEditable,
            cellStyle: editableCellStyle,
            cellEditor: NumericalField,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue: params.data?.generatorStartup?.plannedOutageRate || 0,
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                    rowData: params.data,
                };
            },
            crossValidation: {
                optional: true,
                maxExpression: 1,
                minExpression: 0,
            },
            valueGetter: (params: ValueGetterParams) => params.data?.generatorStartup?.plannedOutageRate,
            valueSetter: (params: ValueSetterParams) => {
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
            editable: isEditable,
            cellStyle: editableCellStyle,
            cellEditor: NumericalField,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue: params.data.generatorStartup?.forcedOutageRate,
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                    rowData: params.data,
                };
            },
            crossValidation: {
                optional: true,
                maxExpression: 1,
                minExpression: 0,
            },
            valueGetter: (params: ValueGetterParams) => params.data?.generatorStartup?.forcedOutageRate,
            valueSetter: (params: ValueSetterParams) => {
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
            editable: isEditable,
            cellStyle: editableCellStyle,
            cellEditor: EnumListField,
            cellEditorParams: (params: any) =>
                getDefaultEnumCellEditorParams(
                    params,
                    params.data?.RegulationTypeText,
                    Object.values(REGULATION_TYPES)
                ),
        },
        {
            id: 'RegulatingTerminalGenerator',
            field: 'RegulatingTerminalGenerator',
            ...defaultTextFilterConfig,
            valueGetter: RegulatingTerminalCellGetter,
            cellStyle: (params: CellClassParams) =>
                isEditableRegulatingTerminalCell(params) ? editableCellStyle(params) : {},
            editable: (params: EditableCallbackParams) => isEditableRegulatingTerminalCell(params),
            crossValidation: {
                requiredOn: {
                    dependencyColumn: 'RegulationTypeText',
                    columnValue: REGULATION_TYPES.DISTANT.id,
                },
            },
            cellEditor: GeneratorRegulatingTerminalEditor,
            cellEditorParams: (params: any) => {
                return {
                    defaultValue: RegulatingTerminalCellGetter,
                    gridContext: params.context,
                    gridApi: params.api,
                    colDef: params.colDef,
                    rowData: params.data,
                };
            },
            cellEditorPopup: true,
        },
        {
            id: 'Properties',
            field: 'properties',
            editable: isEditable,
            cellStyle: editableCellStyle,
            valueGetter: propertiesGetter,
            cellRenderer: PropertiesCellRenderer,
            minWidth: 300,
            getQuickFilterText: excludeFromGlobalFilter,
            valueSetter: (params: ValueSetterParams) => {
                params.data.properties = params.newValue;
                return true;
            },
            cellEditor: SitePropertiesEditor,
            cellEditorPopup: true,
            ...defaultTextFilterConfig,
        },
    ],
};
