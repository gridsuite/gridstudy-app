/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { ReadonlyDeep } from 'type-fest';
import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { defaultNumericFilterConfig, defaultTextFilterConfig, typeAndFetchers } from './common-config';
import { MEDIUM_COLUMN_WIDTH } from '../../utils/constants';
import { genericColumnOfPropertiesReadonly } from './column-properties';

export const THREE_WINDINGS_TRANSFORMER_TAB_DEF = {
    index: 4,
    name: 'ThreeWindingsTransformers',
    ...typeAndFetchers(EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER),
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
            ...defaultTextFilterConfig,
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
        },
        {
            id: 'ActivePowerT3WSide2',
            field: 'p2',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
        },
        {
            id: 'ActivePowerT3WSide3',
            field: 'p3',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
        },
        {
            id: 'ReactivePowerT3WSide1',
            field: 'q1',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
        },
        {
            id: 'ReactivePowerT3WSide2',
            field: 'q2',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
        },
        {
            id: 'ReactivePowerT3WSide3',
            field: 'q3',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
        },
        {
            id: 'HasLoadTapChanging1Capabilities',
            field: 'hasLoadTapChanging1Capabilities',
            ...defaultTextFilterConfig,
        },
        {
            id: 'RegulatingRatio1',
            field: 'isRegulatingRatio1',
            ...defaultTextFilterConfig,
        },
        {
            id: 'TargetVPoint1',
            field: 'targetV1',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
        },
        {
            id: 'RatioTap1',
            field: 'ratioTapChanger1',
            ...defaultNumericFilterConfig,
            fractionDigits: 0,
            valueGetter: (params) => params?.data?.ratioTapChanger1?.tapPosition,
        },
        {
            id: 'HasLoadTapChanging2Capabilities',
            field: 'hasLoadTapChanging2Capabilities',
            ...defaultTextFilterConfig,
        },
        {
            id: 'RegulatingRatio2',
            field: 'isRegulatingRatio2',
            ...defaultTextFilterConfig,
        },
        {
            id: 'TargetVPoint2',
            field: 'targetV2',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
        },
        {
            id: 'RatioTap2',
            field: 'ratioTapChanger2',
            ...defaultNumericFilterConfig,
            fractionDigits: 0,
            valueGetter: (params) => params?.data?.ratioTapChanger2?.tapPosition,
        },
        {
            id: 'HasLoadTapChanging3Capabilities',
            field: 'hasLoadTapChanging3Capabilities',
            ...defaultTextFilterConfig,
        },
        {
            id: 'RegulatingRatio3',
            field: 'isRegulatingRatio3',
            ...defaultTextFilterConfig,
        },
        {
            id: 'TargetVPoint3',
            field: 'targetV3',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
        },
        {
            id: 'RatioTap3',
            field: 'ratioTapChanger3',
            ...defaultNumericFilterConfig,
            fractionDigits: 0,
            valueGetter: (params) => params?.data?.ratioTapChanger3?.tapPosition,
        },
        {
            id: 'RegulatingMode1',
            field: 'regulationModeName1',
            ...defaultTextFilterConfig,
            columnWidth: MEDIUM_COLUMN_WIDTH,
        },
        {
            id: 'RegulatingPhase1',
            field: 'isRegulatingPhase1',
            ...defaultTextFilterConfig,
        },
        {
            id: 'PhaseTap1',
            field: 'phaseTapChanger1',
            ...defaultNumericFilterConfig,
            fractionDigits: 0,
            valueGetter: (params) => params?.data?.phaseTapChanger1?.tapPosition,
        },
        {
            id: 'RegulatingValue1',
            field: 'regulatingValue1',
            numeric: true,
            ...defaultNumericFilterConfig,
            columnWidth: MEDIUM_COLUMN_WIDTH,
            fractionDigits: 1,
        },
        {
            id: 'RegulatingMode2',
            field: 'regulationModeName2',
            ...defaultTextFilterConfig,
            columnWidth: MEDIUM_COLUMN_WIDTH,
        },
        {
            id: 'RegulatingPhase2',
            field: 'isRegulatingPhase2',
            ...defaultTextFilterConfig,
        },
        {
            id: 'PhaseTap2',
            field: 'phaseTapChanger2',
            ...defaultNumericFilterConfig,
            fractionDigits: 0,
            valueGetter: (params) => params?.data?.phaseTapChanger2?.tapPosition,
        },
        {
            id: 'RegulatingValue2',
            field: 'regulatingValue2',
            numeric: true,
            ...defaultNumericFilterConfig,
            columnWidth: MEDIUM_COLUMN_WIDTH,
            fractionDigits: 1,
        },
        {
            id: 'RegulatingMode3',
            field: 'regulationModeName3',
            ...defaultTextFilterConfig,
            columnWidth: MEDIUM_COLUMN_WIDTH,
        },
        {
            id: 'RegulatingPhase3',
            field: 'isRegulatingPhase3',
            ...defaultTextFilterConfig,
        },
        {
            id: 'PhaseTap3',
            field: 'phaseTapChanger3',
            ...defaultNumericFilterConfig,
            fractionDigits: 0,
            valueGetter: (params) => params?.data?.phaseTapChanger3?.tapPosition,
        },
        {
            id: 'RegulatingValue3',
            field: 'regulatingValue3',
            numeric: true,
            ...defaultNumericFilterConfig,
            columnWidth: MEDIUM_COLUMN_WIDTH,
            fractionDigits: 1,
        },
        {
            id: 'ConnectedT3WSide1',
            field: 'terminal1Connected',
            ...defaultTextFilterConfig,
        },
        {
            id: 'ConnectedT3WSide2',
            field: 'terminal2Connected',
            ...defaultTextFilterConfig,
        },
        {
            id: 'ConnectedT3WSide3',
            field: 'terminal3Connected',
            ...defaultTextFilterConfig,
        },
        genericColumnOfPropertiesReadonly,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;
