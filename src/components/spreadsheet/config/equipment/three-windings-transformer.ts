/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { ReadonlyDeep } from 'type-fest';
import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import CountryCellRenderer from '../../utils/country-cell-render';
import { BooleanCellRenderer } from '../../utils/cell-renderers';
import {
    countryEnumFilterConfig,
    defaultBooleanFilterConfig,
    defaultEnumFilterConfig,
    defaultNumericFilterConfig,
    defaultTextFilterConfig,
    editableColumnConfig,
    excludeFromGlobalFilter,
    generateTapPositions,
    typeAndFetchers,
} from './common-config';
import { MEDIUM_COLUMN_WIDTH } from '../../utils/constants';
import { genericColumnOfProperties } from '../common/column-properties';
import { standardSelectCellEditorConfig } from '../common/cell-editors';

function generateTapRequest(tapType: string, legNumber: number) {
    return (
        `tap = equipment.getLeg${legNumber}().get${tapType}TapChanger()\n` +
        'if (tap.getLowTapPosition() <= {} && {} <= tap.getHighTapPosition()) { \n' +
        '    tap.setTapPosition({})\n' +
        // to force update of transformer as sub elements changes like tapChanger are not detected
        '    equipment.setFictitious(equipment.isFictitious())\n' +
        '} else {\n' +
        "    throw new Exception('incorrect value')\n" +
        ' }\n'
    );
}

export const THREE_WINDINGS_TRANSFORMER_TAB_DEF = {
    index: 4,
    name: 'ThreeWindingsTransformers',
    ...typeAndFetchers(EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER),
    groovyEquipmentGetter: 'getThreeWindingsTransformer',
    columns: [
        {
            colId: 'ID',
            field: 'id',
            ...defaultTextFilterConfig,
            context: {
                ...defaultTextFilterConfig.context,
                isDefaultSort: true,
            },
        },
        {
            colId: 'Name',
            field: 'name',
            ...defaultTextFilterConfig,
        },
        {
            colId: 'VoltageLevelIdT3WSide1',
            field: 'voltageLevelId1',
            ...defaultTextFilterConfig,
        },
        {
            colId: 'VoltageLevelIdT3WSide2',
            field: 'voltageLevelId2',
            ...defaultTextFilterConfig,
        },
        {
            colId: 'VoltageLevelIdT3WSide3',
            field: 'voltageLevelId3',
            ...defaultTextFilterConfig,
        },
        {
            colId: 'Country',
            field: 'country',
            ...countryEnumFilterConfig,
            cellRenderer: CountryCellRenderer,
        },
        {
            colId: 'NominalVT3WSide1',
            field: 'nominalV1',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 0,
            },
        },
        {
            colId: 'NominalVT3WSide2',
            field: 'nominalV2',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 0,
            },
        },
        {
            colId: 'NominalVT3WSide3',
            field: 'nominalV3',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 0,
            },
        },
        {
            colId: 'ActivePowerT3WSide1',
            field: 'p1',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'ActivePowerT3WSide2',
            field: 'p2',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'ActivePowerT3WSide3',
            field: 'p3',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'ReactivePowerT3WSide1',
            field: 'q1',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'ReactivePowerT3WSide2',
            field: 'q2',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'ReactivePowerT3WSide3',
            field: 'q3',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'HasLoadTapChanging1Capabilities',
            field: 'hasLoadTapChanging1Capabilities',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
                boolean: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'RegulatingRatio1',
            field: 'isRegulatingRatio1',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
                boolean: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'TargetVPoint1',
            field: 'targetV1',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'RatioTap1',
            field: 'ratioTapChanger1.tapPosition',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                fractionDigits: 0,
                changeCmd: generateTapRequest('Ratio', 1),
            },
            valueGetter: (params) => params?.data?.ratioTapChanger1?.tapPosition,
            valueSetter: (params) => {
                params.data.ratioTapChanger1 = {
                    ...params.data.ratioTapChanger1,
                    tapPosition: params.newValue,
                };
                return true;
            },
            ...editableColumnConfig,
            ...standardSelectCellEditorConfig((params) => generateTapPositions(params.data.ratioTapChanger1)),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'HasLoadTapChanging2Capabilities',
            field: 'hasLoadTapChanging2Capabilities',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
                boolean: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'RegulatingRatio2',
            field: 'isRegulatingRatio2',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
                boolean: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'TargetVPoint2',
            field: 'targetV2',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'RatioTap2',
            field: 'ratioTapChanger2.tapPosition',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                fractionDigits: 0,
                changeCmd: generateTapRequest('Ratio', 2),
            },
            valueGetter: (params) => params?.data?.ratioTapChanger2?.tapPosition,
            valueSetter: (params) => {
                params.data.ratioTapChanger2 = {
                    ...params.data.ratioTapChanger2,
                    tapPosition: params.newValue,
                };
                return true;
            },
            ...editableColumnConfig,
            ...standardSelectCellEditorConfig((params) => generateTapPositions(params.data.ratioTapChanger2)),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'HasLoadTapChanging3Capabilities',
            field: 'hasLoadTapChanging3Capabilities',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
                boolean: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'RegulatingRatio3',
            field: 'isRegulatingRatio3',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
                boolean: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'TargetVPoint3',
            field: 'targetV3',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'RatioTap3',
            field: 'ratioTapChanger3.tapPosition',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                changeCmd: generateTapRequest('Ratio', 3),
                fractionDigits: 0,
            },
            valueGetter: (params) => params?.data?.ratioTapChanger3?.tapPosition,
            valueSetter: (params) => {
                params.data.ratioTapChanger3 = {
                    ...params.data.ratioTapChanger3,
                    tapPosition: params.newValue,
                };
                return true;
            },
            ...editableColumnConfig,
            ...standardSelectCellEditorConfig((params) => generateTapPositions(params.data.ratioTapChanger3)),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'RegulatingMode1',
            field: 'regulationModeName1',
            ...defaultEnumFilterConfig,
            context: {
                ...defaultEnumFilterConfig.context,
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'RegulatingPhase1',
            field: 'isRegulatingPhase1',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
                boolean: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'PhaseTap1',
            field: 'phaseTapChanger1.tapPosition',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                changeCmd: generateTapRequest('Phase', 1),
                fractionDigits: 0,
            },
            valueGetter: (params) => params?.data?.phaseTapChanger1?.tapPosition,
            valueSetter: (params) => {
                params.data.phaseTapChanger1 = {
                    ...params.data.phaseTapChanger1,
                    tapPosition: params.newValue,
                };
                return true;
            },
            ...editableColumnConfig,
            ...standardSelectCellEditorConfig((params) => generateTapPositions(params.data.phaseTapChanger1)),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'RegulatingValue1',
            field: 'regulatingValue1',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                columnWidth: MEDIUM_COLUMN_WIDTH,
                fractionDigits: 1,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'RegulatingMode2',
            field: 'regulationModeName2',
            ...defaultEnumFilterConfig,
            context: {
                ...defaultEnumFilterConfig.context,
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'RegulatingPhase2',
            field: 'isRegulatingPhase2',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
                boolean: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'PhaseTap2',
            field: 'phaseTapChanger2.tapPosition',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                changeCmd: generateTapRequest('Phase', 2),
                fractionDigits: 0,
            },
            valueGetter: (params) => params?.data?.phaseTapChanger2?.tapPosition,
            valueSetter: (params) => {
                params.data.phaseTapChanger2 = {
                    ...params.data.phaseTapChanger2,
                    tapPosition: params.newValue,
                };
                return true;
            },
            ...editableColumnConfig,
            ...standardSelectCellEditorConfig((params) => generateTapPositions(params.data.phaseTapChanger1)),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'RegulatingValue2',
            field: 'regulatingValue2',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'RegulatingMode3',
            field: 'regulationModeName3',
            ...defaultEnumFilterConfig,
            context: {
                ...defaultEnumFilterConfig.context,
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'RegulatingPhase3',
            field: 'isRegulatingPhase3',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
                boolean: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'PhaseTap3',
            field: 'phaseTapChanger3.tapPosition',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                changeCmd: generateTapRequest('Phase', 3),
                fractionDigits: 0,
            },
            valueGetter: (params) => params?.data?.phaseTapChanger3?.tapPosition,
            valueSetter: (params) => {
                params.data.phaseTapChanger3 = {
                    ...params.data.phaseTapChanger3,
                    tapPosition: params.newValue,
                };
                return true;
            },
            ...editableColumnConfig,
            ...standardSelectCellEditorConfig((params) => generateTapPositions(params.data.phaseTapChanger3)),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'RegulatingValue3',
            field: 'regulatingValue3',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'ConnectedT3WSide1',
            field: 'terminal1Connected',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
                boolean: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'ConnectedT3WSide2',
            field: 'terminal2Connected',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
                boolean: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'ConnectedT3WSide3',
            field: 'terminal3Connected',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
                boolean: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        genericColumnOfProperties,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;
