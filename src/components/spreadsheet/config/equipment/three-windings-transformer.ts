/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { fetchThreeWindingsTransformers } from '../../../../services/study/network';
import CountryCellRenderer from '../../utils/country-cell-render';
import { ValueGetterParams, ValueSetterParams } from 'ag-grid-community';
import { BooleanCellRenderer, PropertiesCellRenderer } from '../../utils/cell-renderers';
import {
    countryEnumFilterConfig,
    defaultBooleanFilterConfig,
    defaultEnumFilterConfig,
    defaultNumericFilterConfig,
    defaultTextFilterConfig,
    editableCellStyle,
    excludeFromGlobalFilter,
    generateTapPositions,
    isEditable,
    MEDIUM_COLUMN_WIDTH,
    propertiesGetter,
} from './common-config';

function generateTapRequest(tapType: string, legNumber: number) {
    const getLeg = '.getLeg' + legNumber + '()';
    return (
        'tap = equipment' +
        getLeg +
        '.get' +
        tapType +
        'TapChanger()\n' +
        'if (tap.getLowTapPosition() <= {} && {} <= tap.getHighTapPosition() ) { \n' +
        '    tap.setTapPosition({})\n' +
        // to force update of transformer as sub elements changes like tapChanger are not detected
        '    equipment.setFictitious(equipment.isFictitious())\n' +
        '} else {\n' +
        "throw new Exception('incorrect value')\n" +
        ' }\n'
    );
}

export const THREE_WINDINGS_TRANSFORMER_TAB_DEF: SpreadsheetTabDefinition = {
    index: 4,
    name: 'ThreeWindingsTransformers',
    type: EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER,
    fetchers: [fetchThreeWindingsTransformers],
    groovyEquipmentGetter: 'getThreeWindingsTransformer',
    columns: [
        {
            id: 'ID',
            field: 'id',
            isDefaultSort: true,
            ...defaultTextFilterConfig,
        },
        {
            id: 'Name',
            field: 'name',
            ...defaultTextFilterConfig,
        },
        {
            id: 'VoltageLevelIdT3WSide1',
            field: 'voltageLevelId1',
            ...defaultTextFilterConfig,
        },
        {
            id: 'VoltageLevelIdT3WSide2',
            field: 'voltageLevelId2',
            ...defaultTextFilterConfig,
        },
        {
            id: 'VoltageLevelIdT3WSide3',
            field: 'voltageLevelId3',
            ...defaultTextFilterConfig,
        },
        {
            id: 'Country',
            field: 'country',
            ...countryEnumFilterConfig,
            cellRenderer: CountryCellRenderer,
        },
        {
            id: 'NominalVT3WSide1',
            field: 'nominalV1',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 0,
        },
        {
            id: 'NominalVT3WSide2',
            field: 'nominalV2',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 0,
        },
        {
            id: 'NominalVT3WSide3',
            field: 'nominalV3',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 0,
        },
        {
            id: 'ActivePowerT3WSide1',
            field: 'p1',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            canBeInvalidated: true,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ActivePowerT3WSide2',
            field: 'p2',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            canBeInvalidated: true,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ActivePowerT3WSide3',
            field: 'p3',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            canBeInvalidated: true,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePowerT3WSide1',
            field: 'q1',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            canBeInvalidated: true,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePowerT3WSide2',
            field: 'q2',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            canBeInvalidated: true,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePowerT3WSide3',
            field: 'q3',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            canBeInvalidated: true,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'HasLoadTapChanging1Capabilities',
            field: 'hasLoadTapChanging1Capabilities',
            boolean: true,
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RegulatingRatio1',
            field: 'isRegulatingRatio1',
            boolean: true,
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'TargetVPoint1',
            field: 'targetV1',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RatioTap1',
            field: 'ratioTapChanger1',
            ...defaultNumericFilterConfig,
            changeCmd: generateTapRequest('Ratio', 1),
            fractionDigits: 0,
            valueGetter: (params: ValueGetterParams) => params?.data?.ratioTapChanger1?.tapPosition,
            valueSetter: (params: ValueSetterParams) => {
                params.data.ratioTapChanger1 = {
                    ...params.data.ratioTapChanger1,
                    tapPosition: params.newValue,
                };
                return true;
            },
            editable: isEditable,
            cellStyle: editableCellStyle,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: (params: any) => {
                return {
                    values: generateTapPositions(params.data.ratioTapChanger1),
                };
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'HasLoadTapChanging2Capabilities',
            field: 'hasLoadTapChanging2Capabilities',
            boolean: true,
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RegulatingRatio2',
            field: 'isRegulatingRatio2',
            boolean: true,
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'TargetVPoint2',
            field: 'targetV2',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RatioTap2',
            field: 'ratioTapChanger2',
            ...defaultNumericFilterConfig,
            changeCmd: generateTapRequest('Ratio', 2),
            fractionDigits: 0,
            valueGetter: (params: ValueGetterParams) => params?.data?.ratioTapChanger2?.tapPosition,
            valueSetter: (params: ValueSetterParams) => {
                params.data.ratioTapChanger2 = {
                    ...params.data.ratioTapChanger2,
                    tapPosition: params.newValue,
                };
                return true;
            },
            editable: isEditable,
            cellStyle: editableCellStyle,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: (params: any) => {
                return {
                    values: generateTapPositions(params.data.ratioTapChanger2),
                };
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'HasLoadTapChanging3Capabilities',
            field: 'hasLoadTapChanging3Capabilities',
            boolean: true,
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RegulatingRatio3',
            field: 'isRegulatingRatio3',
            boolean: true,
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'TargetVPoint3',
            field: 'targetV3',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RatioTap3',
            field: 'ratioTapChanger3',
            ...defaultNumericFilterConfig,
            changeCmd: generateTapRequest('Ratio', 3),
            fractionDigits: 0,
            valueGetter: (params: ValueGetterParams) => params?.data?.ratioTapChanger3?.tapPosition,
            valueSetter: (params: ValueSetterParams) => {
                params.data.ratioTapChanger3 = {
                    ...params.data.ratioTapChanger3,
                    tapPosition: params.newValue,
                };
                return true;
            },
            editable: isEditable,
            cellStyle: editableCellStyle,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: (params: any) => {
                return {
                    values: generateTapPositions(params.data.ratioTapChanger3),
                };
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RegulatingMode1',
            field: 'regulationModeName1',
            ...defaultEnumFilterConfig,
            columnWidth: MEDIUM_COLUMN_WIDTH,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RegulatingPhase1',
            field: 'isRegulatingPhase1',
            boolean: true,
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'PhaseTap1',
            field: 'phaseTapChanger1',
            ...defaultNumericFilterConfig,
            changeCmd: generateTapRequest('Phase', 1),
            fractionDigits: 0,
            valueGetter: (params: ValueGetterParams) => params?.data?.phaseTapChanger1?.tapPosition,
            valueSetter: (params: ValueSetterParams) => {
                params.data.phaseTapChanger1 = {
                    ...params.data.phaseTapChanger1,
                    tapPosition: params.newValue,
                };
                return true;
            },
            editable: isEditable,
            cellStyle: editableCellStyle,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: (params: any) => {
                return {
                    values: generateTapPositions(params.data.phaseTapChanger1),
                };
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RegulatingValue1',
            field: 'regulatingValue1',
            numeric: true,
            ...defaultNumericFilterConfig,
            columnWidth: MEDIUM_COLUMN_WIDTH,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RegulatingMode2',
            field: 'regulationModeName2',
            ...defaultEnumFilterConfig,
            columnWidth: MEDIUM_COLUMN_WIDTH,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RegulatingPhase2',
            field: 'isRegulatingPhase2',
            boolean: true,
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'PhaseTap2',
            field: 'phaseTapChanger2',
            ...defaultNumericFilterConfig,
            changeCmd: generateTapRequest('Phase', 2),
            fractionDigits: 0,
            valueGetter: (params: ValueGetterParams) => params?.data?.phaseTapChanger2?.tapPosition,
            valueSetter: (params: ValueSetterParams) => {
                params.data.phaseTapChanger2 = {
                    ...params.data.phaseTapChanger2,
                    tapPosition: params.newValue,
                };
                return true;
            },
            editable: isEditable,
            cellStyle: editableCellStyle,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: (params: any) => {
                return {
                    values: generateTapPositions(params.data.phaseTapChanger1),
                };
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RegulatingValue2',
            field: 'regulatingValue2',
            numeric: true,
            ...defaultNumericFilterConfig,
            columnWidth: MEDIUM_COLUMN_WIDTH,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RegulatingMode3',
            field: 'regulationModeName3',
            ...defaultEnumFilterConfig,
            columnWidth: MEDIUM_COLUMN_WIDTH,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RegulatingPhase3',
            field: 'isRegulatingPhase3',
            boolean: true,
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'PhaseTap3',
            field: 'phaseTapChanger3',
            ...defaultNumericFilterConfig,
            changeCmd: generateTapRequest('Phase', 3),
            fractionDigits: 0,
            valueGetter: (params: ValueGetterParams) => params?.data?.phaseTapChanger3?.tapPosition,
            valueSetter: (params: ValueSetterParams) => {
                params.data.phaseTapChanger3 = {
                    ...params.data.phaseTapChanger3,
                    tapPosition: params.newValue,
                };
                return true;
            },
            editable: isEditable,
            cellStyle: editableCellStyle,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: (params: any) => {
                return {
                    values: generateTapPositions(params.data.phaseTapChanger3),
                };
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RegulatingValue3',
            field: 'regulatingValue3',
            numeric: true,
            ...defaultNumericFilterConfig,
            columnWidth: MEDIUM_COLUMN_WIDTH,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ConnectedT3WSide1',
            field: 'terminal1Connected',
            boolean: true,
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ConnectedT3WSide2',
            field: 'terminal2Connected',
            boolean: true,
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ConnectedT3WSide3',
            field: 'terminal3Connected',
            boolean: true,
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'Properties',
            field: 'properties',
            valueGetter: propertiesGetter,
            cellRenderer: PropertiesCellRenderer,
            minWidth: 300,
            getQuickFilterText: excludeFromGlobalFilter,
            valueSetter: (params: ValueSetterParams) => {
                params.data.properties = params.newValue;
                return true;
            },
            ...defaultTextFilterConfig,
        },
    ],
};
