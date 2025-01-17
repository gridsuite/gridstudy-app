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
import { booleanColumnDefinition, numberColumnDefinition, textColumnDefinition } from '../common-column-definitions';

const tab = 'ThreeWindingsTransformers';

export const THREE_WINDINGS_TRANSFORMER_TAB_DEF: SpreadsheetTabDefinition = {
    index: 4,
    name: tab,
    ...typeAndFetchers(EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER),
    groovyEquipmentGetter: 'getThreeWindingsTransformer',
    columns: [
        { colId: 'ID', field: 'id', ...textColumnDefinition('ID', tab) },
        { colId: 'Name', field: 'name', ...textColumnDefinition('Name', tab) },
        {
            colId: 'VoltageLevelIdT3WSide1',
            field: 'voltageLevelId1',
            ...textColumnDefinition('Voltage level ID 1', tab),
        },
        {
            colId: 'VoltageLevelIdT3WSide2',
            field: 'voltageLevelId2',
            ...textColumnDefinition('Voltage level ID 2', tab),
        },
        {
            colId: 'VoltageLevelIdT3WSide3',
            field: 'voltageLevelId3',
            ...textColumnDefinition('Voltage level ID 3', tab),
        },
        { colId: 'Country', field: 'country', ...textColumnDefinition('Country', tab) },
        {
            colId: 'NominalVT3WSide1',
            field: 'nominalV1',
            ...numberColumnDefinition('Nominal voltage 1 (kV)', tab, 0),
        },
        {
            colId: 'NominalVT3WSide2',
            field: 'nominalV2',
            ...numberColumnDefinition('Nominal voltage 2 (kV)', tab, 0),
        },
        {
            colId: 'NominalVT3WSide3',
            field: 'nominalV3',
            ...numberColumnDefinition('Nominal voltage 3 (kV)', tab, 0),
        },
        { colId: 'ActivePowerT3WSide1', field: 'p1', ...numberColumnDefinition('p1 (MW)', tab, 1) },
        { colId: 'ActivePowerT3WSide2', field: 'p2', ...numberColumnDefinition('p2 (MW)', tab, 1) },
        { colId: 'ActivePowerT3WSide3', field: 'p3', ...numberColumnDefinition('p3 (MW)', tab, 1) },
        {
            colId: 'ReactivePowerT3WSide1',
            field: 'q1',
            ...numberColumnDefinition('q1 (MW)', tab, 1),
        },
        {
            colId: 'ReactivePowerT3WSide2',
            field: 'q2',
            ...numberColumnDefinition('q2 (MW)', tab, 1),
        },
        {
            colId: 'ReactivePowerT3WSide3',
            field: 'q3',
            ...numberColumnDefinition('q3 (MW)', tab, 1),
        },
        {
            colId: 'HasLoadTapChanging1Capabilities',
            field: 'hasLoadTapChanging1Capabilities',
            ...booleanColumnDefinition('Ratio on-load 1', tab),
        },
        {
            colId: 'RegulatingRatio1',
            field: 'isRegulatingRatio1',
            ...booleanColumnDefinition('Ratio regulating 1', tab),
        },
        {
            colId: 'TargetVPoint1',
            field: 'targetV1',
            ...numberColumnDefinition('Voltage set point (kV) 1', tab, 1),
        },
        {
            colId: 'RatioTap1',
            field: 'ratioTapChanger1.tapPosition',
            ...numberColumnDefinition('Ratio tap 1', tab, 0),
        },
        {
            colId: 'HasLoadTapChanging2Capabilities',
            field: 'hasLoadTapChanging2Capabilities',
            ...booleanColumnDefinition('Ratio on-load 2', tab),
        },
        {
            colId: 'RegulatingRatio2',
            field: 'isRegulatingRatio2',
            ...booleanColumnDefinition('Ratio regulating 2', tab),
        },
        {
            colId: 'TargetVPoint2',
            field: 'targetV2',
            ...numberColumnDefinition('Voltage set point (kV) 2', tab, 1),
        },
        {
            colId: 'RatioTap2',
            field: 'ratioTapChanger2.tapPosition',
            ...numberColumnDefinition('Ratio tap 2', tab, 0),
        },
        {
            colId: 'HasLoadTapChanging3Capabilities',
            field: 'hasLoadTapChanging3Capabilities',
            ...booleanColumnDefinition('Ratio on-load 3', tab),
        },
        {
            colId: 'RegulatingRatio3',
            field: 'isRegulatingRatio3',
            ...booleanColumnDefinition('Ratio regulating 3', tab),
        },
        {
            colId: 'TargetVPoint3',
            field: 'targetV3',
            ...numberColumnDefinition('Voltage set point (kV) 3', tab, 1),
        },
        {
            colId: 'RatioTap3',
            field: 'ratioTapChanger3.tapPosition',
            ...numberColumnDefinition('Ratio tap 3', tab, 0),
        },
        {
            colId: 'RegulatingMode1',
            field: 'regulationModeName1',
            ...textColumnDefinition('Phase regulation mode 1', tab),
        },
        {
            colId: 'RegulatingPhase1',
            field: 'isRegulatingPhase1',
            ...booleanColumnDefinition('Phase regulating 1', tab),
        },
        {
            colId: 'PhaseTap1',
            field: 'phaseTapChanger1.tapPosition',
            ...numberColumnDefinition('Phase tap 1', tab, 0),
        },
        {
            colId: 'RegulatingValue1',
            field: 'regulatingValue1',
            ...numberColumnDefinition('Current (A) or flow set point (MW) 1', tab, 1),
        },
        {
            colId: 'RegulatingMode2',
            field: 'regulationModeName2',
            ...textColumnDefinition('Phase regulation mode 2', tab),
        },
        {
            colId: 'RegulatingPhase2',
            field: 'isRegulatingPhase2',
            ...booleanColumnDefinition('Phase regulating 2', tab),
        },
        {
            colId: 'PhaseTap2',
            field: 'phaseTapChanger2.tapPosition',
            ...numberColumnDefinition('Phase tap 2', tab, 0),
        },
        {
            colId: 'RegulatingValue2',
            field: 'regulatingValue2',
            ...numberColumnDefinition('Current (A) or flow set point (MW) 2', tab, 1),
        },
        {
            colId: 'RegulatingMode3',
            field: 'regulationModeName3',
            ...textColumnDefinition('Phase regulation mode 3', tab),
        },
        {
            colId: 'RegulatingPhase3',
            field: 'isRegulatingPhase3',
            ...booleanColumnDefinition('Phase regulating 3', tab),
        },
        {
            colId: 'PhaseTap3',
            field: 'phaseTapChanger3.tapPosition',
            ...numberColumnDefinition('Phase tap 3', tab, 0),
        },
        {
            colId: 'RegulatingValue3',
            field: 'regulatingValue3',
            ...numberColumnDefinition('Current (A) or flow set point (MW) 3', tab, 1),
        },
        {
            colId: 'ConnectedT3WSide1',
            field: 'terminal1Connected',
            ...booleanColumnDefinition('Connected 1', tab),
        },
        {
            colId: 'ConnectedT3WSide2',
            field: 'terminal2Connected',
            ...booleanColumnDefinition('Connected 2', tab),
        },
        {
            colId: 'ConnectedT3WSide3',
            field: 'terminal3Connected',
            ...booleanColumnDefinition('Connected 3', tab),
        },
        genericColumnOfPropertiesReadonly(tab),
    ],
};
