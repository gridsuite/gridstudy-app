/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { ReadonlyDeep } from 'type-fest';
import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { BooleanCellRenderer } from '../../utils/cell-renderers';
import {
    defaultBooleanFilterConfig,
    defaultNumericFilterConfig,
    defaultTextFilterConfig,
    typeAndFetchers,
} from './common-config';
import { MEDIUM_COLUMN_WIDTH } from '../../utils/constants';
import { genericColumnOfPropertiesReadonly } from './column-properties';

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
            ...defaultTextFilterConfig,
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
            },
        },
        {
            colId: 'ActivePowerT3WSide2',
            field: 'p2',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
        },
        {
            colId: 'ActivePowerT3WSide3',
            field: 'p3',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
        },
        {
            colId: 'ReactivePowerT3WSide1',
            field: 'q1',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
        },
        {
            colId: 'ReactivePowerT3WSide2',
            field: 'q2',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
        },
        {
            colId: 'ReactivePowerT3WSide3',
            field: 'q3',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
        },
        {
            colId: 'HasLoadTapChanging1Capabilities',
            field: 'hasLoadTapChanging1Capabilities',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
            },
        },
        {
            colId: 'RegulatingRatio1',
            field: 'isRegulatingRatio1',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
            },
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
        },
        {
            colId: 'RatioTap1',
            field: 'ratioTapChanger1.tapPosition',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                fractionDigits: 0,
            },
            valueGetter: (params) => params?.data?.ratioTapChanger1?.tapPosition,
        },
        {
            colId: 'HasLoadTapChanging2Capabilities',
            field: 'hasLoadTapChanging2Capabilities',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
            },
        },
        {
            colId: 'RegulatingRatio2',
            field: 'isRegulatingRatio2',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
            },
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
        },
        {
            colId: 'RatioTap2',
            field: 'ratioTapChanger2.tapPosition',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                fractionDigits: 0,
            },
            valueGetter: (params) => params?.data?.ratioTapChanger2?.tapPosition,
        },
        {
            colId: 'HasLoadTapChanging3Capabilities',
            field: 'hasLoadTapChanging3Capabilities',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
            },
        },
        {
            colId: 'RegulatingRatio3',
            field: 'isRegulatingRatio3',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
            },
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
        },
        {
            colId: 'RatioTap3',
            field: 'ratioTapChanger3.tapPosition',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                fractionDigits: 0,
            },
            valueGetter: (params) => params?.data?.ratioTapChanger3?.tapPosition,
        },
        {
            colId: 'RegulatingMode1',
            field: 'regulationModeName1',
            ...defaultTextFilterConfig,
            context: {
                ...defaultTextFilterConfig.context,
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
        },
        {
            colId: 'RegulatingPhase1',
            field: 'isRegulatingPhase1',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
            },
        },
        {
            colId: 'PhaseTap1',
            field: 'phaseTapChanger1.tapPosition',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                fractionDigits: 0,
            },
            valueGetter: (params) => params?.data?.phaseTapChanger1?.tapPosition,
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
        },
        {
            colId: 'RegulatingMode2',
            field: 'regulationModeName2',
            ...defaultTextFilterConfig,
            context: {
                ...defaultTextFilterConfig.context,
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
        },
        {
            colId: 'RegulatingPhase2',
            field: 'isRegulatingPhase2',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
            },
        },
        {
            colId: 'PhaseTap2',
            field: 'phaseTapChanger2.tapPosition',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                fractionDigits: 0,
            },
            valueGetter: (params) => params?.data?.phaseTapChanger2?.tapPosition,
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
        },
        {
            colId: 'RegulatingMode3',
            field: 'regulationModeName3',
            ...defaultTextFilterConfig,
            context: {
                ...defaultTextFilterConfig.context,
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
        },
        {
            colId: 'RegulatingPhase3',
            field: 'isRegulatingPhase3',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
            },
        },
        {
            colId: 'PhaseTap3',
            field: 'phaseTapChanger3.tapPosition',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                fractionDigits: 0,
            },
            valueGetter: (params) => params?.data?.phaseTapChanger3?.tapPosition,
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
        },
        {
            colId: 'ConnectedT3WSide1',
            field: 'terminal1Connected',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
            },
        },
        {
            colId: 'ConnectedT3WSide2',
            field: 'terminal2Connected',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
            },
        },
        {
            colId: 'ConnectedT3WSide3',
            field: 'terminal3Connected',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
            },
        },
        genericColumnOfPropertiesReadonly,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;
