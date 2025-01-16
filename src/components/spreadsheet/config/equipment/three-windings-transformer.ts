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
import { booleanColumnDefinition, textColumnDefinition, numberColumnDefinition } from '../common-column-definitions';

const tab = 'ThreeWindingsTransformers';

export const THREE_WINDINGS_TRANSFORMER_TAB_DEF: SpreadsheetTabDefinition = {
    index: 4,
    name: tab,
    ...typeAndFetchers(EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER),
    groovyEquipmentGetter: 'getThreeWindingsTransformer',
    columns: [
        {
            field: 'id',
            initialSort: 'asc',
            ...textColumnDefinition('id', 'ID', tab),
        },
        {
            field: 'name',
            ...textColumnDefinition('name', 'Name', tab),
        },
        {
            field: 'voltageLevelId1',
            ...textColumnDefinition('voltageLevelId1', 'Voltage level ID 1', tab),
        },
        {
            field: 'voltageLevelId2',
            ...textColumnDefinition('voltageLevelId2', 'Voltage level ID 2', tab),
        },
        {
            field: 'voltageLevelId3',
            ...textColumnDefinition('voltageLevelId3', 'Voltage level ID 3', tab),
        },
        {
            field: 'country',
            ...textColumnDefinition('country', 'Country', tab),
        },
        {
            field: 'nominalV1',
            ...numberColumnDefinition('nominalV1', 'Nominal voltage 1 (kV)', tab, 0),
        },
        {
            field: 'nominalV2',
            ...numberColumnDefinition('nominalV2', 'Nominal voltage 2 (kV)', tab, 0),
        },
        {
            field: 'nominalV3',
            ...numberColumnDefinition('nominalV3', 'Nominal voltage 3 (kV)', tab, 0),
        },
        {
            field: 'p1',
            ...numberColumnDefinition('ActivePowerT3WSide1', 'p1 (MW)', tab, 1),
        },
        {
            field: 'p2',
            ...numberColumnDefinition('ActivePowerT3WSide2', 'p2 (MW)', tab, 1),
        },
        {
            field: 'p3',
            ...numberColumnDefinition('ActivePowerT3WSide3', 'p3 (MW)', tab, 1),
        },
        {
            field: 'q1',
            ...numberColumnDefinition('ReactivePowerT3WSide1', 'q1 (MW)', tab, 1),
        },
        {
            field: 'q2',
            ...numberColumnDefinition('ReactivePowerT3WSide2', 'q2 (MW)', tab, 1),
        },
        {
            field: 'q3',
            ...numberColumnDefinition('ReactivePowerT3WSide3', 'q3 (MW)', tab, 1),
        },
        {
            field: 'hasLoadTapChanging1Capabilities',
            ...booleanColumnDefinition('hasLoadTapChanging1Capabilities', 'Ratio on-load 1', tab),
        },
        {
            field: 'isRegulatingRatio1',
            ...booleanColumnDefinition('isRegulatingRatio1', 'Ratio regulating 1', tab),
        },
        {
            field: 'targetV1',
            ...numberColumnDefinition('targetV1', 'Voltage set point (kV) 1', tab, 1),
        },
        {
            field: 'ratioTapChanger1.tapPosition',
            ...numberColumnDefinition('RatioTap1', 'Ratio tap 1', tab, 0),
        },
        {
            field: 'hasLoadTapChanging2Capabilities',
            ...booleanColumnDefinition('hasLoadTapChanging2Capabilities', 'Ratio on-load 2', tab),
        },
        {
            field: 'isRegulatingRatio2',
            ...booleanColumnDefinition('isRegulatingRatio2', 'Ratio regulating 2', tab),
        },
        {
            field: 'targetV2',
            ...numberColumnDefinition('targetV2', 'Voltage set point (kV) 2', tab, 1),
        },
        {
            id: 'RatioTap2',
            field: 'ratioTapChanger2.tapPosition',
            ...numberColumnDefinition('RatioTap2', 'Ratio tap 2', tab, 0),
        },
        {
            field: 'hasLoadTapChanging3Capabilities',
            ...booleanColumnDefinition('hasLoadTapChanging3Capabilities', 'Ratio on-load 3', tab),
        },
        {
            field: 'isRegulatingRatio3',
            ...booleanColumnDefinition('isRegulatingRatio3', 'Ratio regulating 3', tab),
        },
        {
            field: 'targetV3',
            ...numberColumnDefinition('targetV3', 'Voltage set point (kV) 3', tab, 1),
        },
        {
            id: 'RatioTap3',
            field: 'ratioTapChanger3.tapPosition',
            ...numberColumnDefinition('RatioTap3', 'Ratio tap 3', tab, 0),
        },
        {
            field: 'regulationModeName1',
            ...textColumnDefinition('regulationModeName1', 'Phase regulation mode 1', tab),
        },
        {
            field: 'isRegulatingPhase1',
            ...booleanColumnDefinition('isRegulatingPhase1', 'Phase regulating 1', tab),
        },
        {
            id: 'PhaseTap1',
            field: 'phaseTapChanger1.tapPosition',
            ...numberColumnDefinition('PhaseTap1', 'Phase tap 1', tab, 0),
        },
        {
            field: 'regulatingValue1',
            ...numberColumnDefinition('regulatingValue1', 'Current (A) or flow set point (MW) 1', tab, 1),
        },
        {
            field: 'regulationModeName2',
            ...textColumnDefinition('regulationModeName2', 'Phase regulation mode 2', tab),
        },
        {
            field: 'isRegulatingPhase2',
            ...booleanColumnDefinition('isRegulatingPhase2', 'Phase regulating 2', tab),
        },
        {
            id: 'PhaseTap2',
            field: 'phaseTapChanger2.tapPosition',
            ...numberColumnDefinition('PhaseTap2', 'Phase tap 2', tab, 0),
        },
        {
            field: 'regulatingValue2',
            ...numberColumnDefinition('regulatingValue2', 'Current (A) or flow set point (MW) 2', tab, 1),
        },
        {
            field: 'regulationModeName3',
            ...textColumnDefinition('regulationModeName3', 'Phase regulation mode 3', tab),
        },
        {
            field: 'isRegulatingPhase3',
            ...booleanColumnDefinition('isRegulatingPhase3', 'Phase regulating 3', tab),
        },
        {
            id: 'PhaseTap3',
            field: 'phaseTapChanger3.tapPosition',
            ...numberColumnDefinition('PhaseTap3', 'Phase tap 3', tab, 0),
        },
        {
            field: 'regulatingValue3',
            ...numberColumnDefinition('regulatingValue3', 'Current (A) or flow set point (MW) 3', tab, 1),
        },
        {
            field: 'terminal1Connected',
            ...booleanColumnDefinition('terminal1Connected', 'Connected 1', tab),
        },
        {
            field: 'terminal2Connected',
            ...booleanColumnDefinition('terminal2Connected', 'Connected 2', tab),
        },
        {
            field: 'terminal3Connected',
            ...booleanColumnDefinition('terminal3Connected', 'Connected 3', tab),
        },
        genericColumnOfPropertiesReadonly(tab),
    ],
};
