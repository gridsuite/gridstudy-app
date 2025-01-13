/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { typeAndFetchers } from './common-config';
import { genericColumnOfPropertiesReadonly } from './column-properties';
import {
    booleanAgGridColumnDefinition,
    textAgGridColumnDefinition,
    numberAgGridColumnDefinition,
} from '../common-column-definitions';

export const THREE_WINDINGS_TRANSFORMER_TAB_DEF: SpreadsheetTabDefinition = {
    index: 4,
    name: 'ThreeWindingsTransformers',
    ...typeAndFetchers(EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER),
    groovyEquipmentGetter: 'getThreeWindingsTransformer',
    columns: [
        {
            id: 'ID',
            field: 'id',
            initialSort: 'asc',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'Name',
            field: 'name',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'VoltageLevelIdT3WSide1',
            field: 'voltageLevelId1',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'VoltageLevelIdT3WSide2',
            field: 'voltageLevelId2',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'VoltageLevelIdT3WSide3',
            field: 'voltageLevelId3',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'Country',
            field: 'country',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'NominalVT3WSide1',
            field: 'nominalV1',
            ...numberAgGridColumnDefinition(0),
        },
        {
            id: 'NominalVT3WSide2',
            field: 'nominalV2',
            ...numberAgGridColumnDefinition(0),
        },
        {
            id: 'NominalVT3WSide3',
            field: 'nominalV3',
            ...numberAgGridColumnDefinition(0),
        },
        {
            id: 'ActivePowerT3WSide1',
            field: 'p1',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'ActivePowerT3WSide2',
            field: 'p2',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'ActivePowerT3WSide3',
            field: 'p3',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'ReactivePowerT3WSide1',
            field: 'q1',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'ReactivePowerT3WSide2',
            field: 'q2',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'ReactivePowerT3WSide3',
            field: 'q3',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'HasLoadTapChanging1Capabilities',
            field: 'hasLoadTapChanging1Capabilities',
            ...booleanAgGridColumnDefinition,
        },
        {
            id: 'RegulatingRatio1',
            field: 'isRegulatingRatio1',
            ...booleanAgGridColumnDefinition,
        },
        {
            id: 'TargetVPoint1',
            field: 'targetV1',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'RatioTap1',
            valueGetter: (params) => params?.data?.ratioTapChanger1?.tapPosition,
            ...numberAgGridColumnDefinition(0),
        },
        {
            id: 'HasLoadTapChanging2Capabilities',
            field: 'hasLoadTapChanging2Capabilities',
            ...booleanAgGridColumnDefinition,
        },
        {
            id: 'RegulatingRatio2',
            field: 'isRegulatingRatio2',
            ...booleanAgGridColumnDefinition,
        },
        {
            id: 'TargetVPoint2',
            field: 'targetV2',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'RatioTap2',
            valueGetter: (params) => params?.data?.ratioTapChanger2?.tapPosition,
            ...numberAgGridColumnDefinition(0),
        },
        {
            id: 'HasLoadTapChanging3Capabilities',
            field: 'hasLoadTapChanging3Capabilities',
            ...booleanAgGridColumnDefinition,
        },
        {
            id: 'RegulatingRatio3',
            field: 'isRegulatingRatio3',
            ...booleanAgGridColumnDefinition,
        },
        {
            id: 'TargetVPoint3',
            field: 'targetV3',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'RatioTap3',
            valueGetter: (params) => params?.data?.ratioTapChanger3?.tapPosition,
            ...numberAgGridColumnDefinition(0),
        },
        {
            id: 'RegulatingMode1',
            field: 'regulationModeName1',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'RegulatingPhase1',
            field: 'isRegulatingPhase1',
            ...booleanAgGridColumnDefinition,
        },
        {
            id: 'PhaseTap1',
            valueGetter: (params) => params?.data?.phaseTapChanger1?.tapPosition,
            ...numberAgGridColumnDefinition(0),
        },
        {
            id: 'RegulatingValue1',
            field: 'regulatingValue1',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'RegulatingMode2',
            field: 'regulationModeName2',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'RegulatingPhase2',
            field: 'isRegulatingPhase2',
            ...booleanAgGridColumnDefinition,
        },
        {
            id: 'PhaseTap2',
            valueGetter: (params) => params?.data?.phaseTapChanger2?.tapPosition,
            ...numberAgGridColumnDefinition(0),
        },
        {
            id: 'RegulatingValue2',
            field: 'regulatingValue2',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'RegulatingMode3',
            field: 'regulationModeName3',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'RegulatingPhase3',
            field: 'isRegulatingPhase3',
            ...booleanAgGridColumnDefinition,
        },
        {
            id: 'PhaseTap3',
            valueGetter: (params) => params?.data?.phaseTapChanger3?.tapPosition,
            ...numberAgGridColumnDefinition(0),
        },
        {
            id: 'RegulatingValue3',
            field: 'regulatingValue3',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'ConnectedT3WSide1',
            field: 'terminal1Connected',
            ...booleanAgGridColumnDefinition,
        },
        {
            id: 'ConnectedT3WSide2',
            field: 'terminal2Connected',
            ...booleanAgGridColumnDefinition,
        },
        {
            id: 'ConnectedT3WSide3',
            field: 'terminal3Connected',
            ...booleanAgGridColumnDefinition,
        },
        genericColumnOfPropertiesReadonly,
    ],
};
