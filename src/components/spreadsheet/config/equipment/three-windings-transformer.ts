/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { ReadonlyDeep } from 'type-fest';
import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { editableColumnConfig, excludeFromGlobalFilter, generateTapPositions, typeAndFetchers } from './common-config';
import {
    BOOLEAN_TYPE,
    COUNTRY_TYPE,
    MEDIUM_COLUMN_WIDTH,
    NUMERIC_0_FRACTION_DIGITS_TYPE,
    NUMERIC_1_FRACTION_DIGITS_TYPE,
    NUMERIC_CAN_BE_INVALIDATED_TYPE,
    NUMERIC_TYPE,
    TEXT_TYPE,
} from '../../utils/constants';
import { genericColumnOfProperties } from '../common/column-properties';
import { standardSelectCellEditorConfig } from '../common/cell-editors';
import { SortWay } from 'hooks/use-aggrid-sort';

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
            id: 'ID',
            field: 'id',
            type: TEXT_TYPE,
            sort: SortWay.ASC,
        },
        {
            id: 'Name',
            field: 'name',
            type: TEXT_TYPE,
        },
        {
            id: 'VoltageLevelIdT3WSide1',
            field: 'voltageLevelId1',
            type: TEXT_TYPE,
        },
        {
            id: 'VoltageLevelIdT3WSide2',
            field: 'voltageLevelId2',
            type: TEXT_TYPE,
        },
        {
            id: 'VoltageLevelIdT3WSide3',
            field: 'voltageLevelId3',
            type: TEXT_TYPE,
        },
        {
            id: 'Country',
            field: 'country',
            type: COUNTRY_TYPE,
        },
        {
            id: 'NominalVT3WSide1',
            field: 'nominalV1',
            type: NUMERIC_0_FRACTION_DIGITS_TYPE,
        },
        {
            id: 'NominalVT3WSide2',
            field: 'nominalV2',
            type: NUMERIC_0_FRACTION_DIGITS_TYPE,
        },
        {
            id: 'NominalVT3WSide3',
            field: 'nominalV3',
            type: NUMERIC_0_FRACTION_DIGITS_TYPE,
        },
        {
            id: 'ActivePowerT3WSide1',
            field: 'p1',
            type: [NUMERIC_1_FRACTION_DIGITS_TYPE, NUMERIC_CAN_BE_INVALIDATED_TYPE],
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ActivePowerT3WSide2',
            field: 'p2',
            numeric: true,
            type: [NUMERIC_1_FRACTION_DIGITS_TYPE, NUMERIC_CAN_BE_INVALIDATED_TYPE],
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ActivePowerT3WSide3',
            field: 'p3',
            numeric: true,
            type: [NUMERIC_1_FRACTION_DIGITS_TYPE, NUMERIC_CAN_BE_INVALIDATED_TYPE],
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePowerT3WSide1',
            field: 'q1',
            numeric: true,
            type: [NUMERIC_1_FRACTION_DIGITS_TYPE, NUMERIC_CAN_BE_INVALIDATED_TYPE],
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePowerT3WSide2',
            field: 'q2',
            numeric: true,
            type: [NUMERIC_1_FRACTION_DIGITS_TYPE, NUMERIC_CAN_BE_INVALIDATED_TYPE],
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePowerT3WSide3',
            field: 'q3',
            numeric: true,
            type: [NUMERIC_1_FRACTION_DIGITS_TYPE, NUMERIC_CAN_BE_INVALIDATED_TYPE],
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'HasLoadTapChanging1Capabilities',
            field: 'hasLoadTapChanging1Capabilities',
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RegulatingRatio1',
            field: 'isRegulatingRatio1',
            type: BOOLEAN_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'TargetVPoint1',
            field: 'targetV1',
            numeric: true,
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RatioTap1',
            field: 'ratioTapChanger1.tapPosition',
            type: NUMERIC_TYPE,
            changeCmd: generateTapRequest('Ratio', 1),
            fractionDigits: 0,
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
            id: 'HasLoadTapChanging2Capabilities',
            field: 'hasLoadTapChanging2Capabilities',
            type: BOOLEAN_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RegulatingRatio2',
            field: 'isRegulatingRatio2',
            type: BOOLEAN_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'TargetVPoint2',
            field: 'targetV2',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RatioTap2',
            field: 'ratioTapChanger2.tapPosition',
            type: NUMERIC_TYPE,
            changeCmd: generateTapRequest('Ratio', 2),
            fractionDigits: 0,
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
            id: 'HasLoadTapChanging3Capabilities',
            field: 'hasLoadTapChanging3Capabilities',
            type: BOOLEAN_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RegulatingRatio3',
            field: 'isRegulatingRatio3',
            type: BOOLEAN_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'TargetVPoint3',
            field: 'targetV3',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RatioTap3',
            field: 'ratioTapChanger3.tapPosition',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            changeCmd: generateTapRequest('Ratio', 3),
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
            id: 'RegulatingMode1',
            field: 'regulationModeName1',
            type: NUMERIC_TYPE,
            columnWidth: MEDIUM_COLUMN_WIDTH,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RegulatingPhase1',
            field: 'isRegulatingPhase1',
            type: BOOLEAN_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'PhaseTap1',
            field: 'phaseTapChanger1.tapPosition',
            type: NUMERIC_0_FRACTION_DIGITS_TYPE,
            changeCmd: generateTapRequest('Phase', 1),
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
            id: 'RegulatingValue1',
            field: 'regulatingValue1',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            columnWidth: MEDIUM_COLUMN_WIDTH,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RegulatingMode2',
            field: 'regulationModeName2',
            type: NUMERIC_TYPE,
            columnWidth: MEDIUM_COLUMN_WIDTH,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RegulatingPhase2',
            field: 'isRegulatingPhase2',
            type: BOOLEAN_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'PhaseTap2',
            field: 'phaseTapChanger2.tapPosition',
            type: NUMERIC_0_FRACTION_DIGITS_TYPE,
            changeCmd: generateTapRequest('Phase', 2),
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
            id: 'RegulatingValue2',
            field: 'regulatingValue2',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            columnWidth: MEDIUM_COLUMN_WIDTH,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RegulatingMode3',
            field: 'regulationModeName3',
            type: NUMERIC_TYPE,
            columnWidth: MEDIUM_COLUMN_WIDTH,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RegulatingPhase3',
            field: 'isRegulatingPhase3',
            type: BOOLEAN_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'PhaseTap3',
            field: 'phaseTapChanger3.tapPosition',
            type: NUMERIC_0_FRACTION_DIGITS_TYPE,
            changeCmd: generateTapRequest('Phase', 3),
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
            id: 'RegulatingValue3',
            field: 'regulatingValue3',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            columnWidth: MEDIUM_COLUMN_WIDTH,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ConnectedT3WSide1',
            field: 'terminal1Connected',
            type: BOOLEAN_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ConnectedT3WSide2',
            field: 'terminal2Connected',
            type: BOOLEAN_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ConnectedT3WSide3',
            field: 'terminal3Connected',
            type: BOOLEAN_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        genericColumnOfProperties,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;
