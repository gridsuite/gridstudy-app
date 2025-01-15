/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { typeAndFetchers } from './common-config';
import { computeHighTapPosition } from '../../../utils/utils';
import { convertInputValue, FieldType } from '@gridsuite/commons-ui';
import { genericColumnOfPropertiesReadonly } from './column-properties';
import { booleanColumnDefinition, textColumnDefinition, numberColumnDefinition } from '../common-column-definitions';

const tab = 'TwoWindingsTransformers';

export const TWO_WINDINGS_TRANSFORMER_TAB_DEF: SpreadsheetTabDefinition = {
    index: 3,
    name: tab,
    ...typeAndFetchers(EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER),
    columns: [
        {
            field: 'id',
            initialSort: 'asc',
            ...textColumnDefinition('id', 'ID', tab),
        },
        {
            id: 'Name',
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
            field: 'country',
            ...textColumnDefinition('country', 'Country', tab),
        },
        {
            field: 'nominalVoltage1',
            ...numberColumnDefinition('nominalVoltage1', 'Nominal voltage 1 (kV)', tab, 0),
        },
        {
            field: 'nominalVoltage2',
            ...numberColumnDefinition('nominalVoltage2', 'Nominal voltage 2 (kV)', tab, 0),
        },
        {
            field: 'ratedU1',
            ...numberColumnDefinition('ratedU1', 'Rated voltage 1 (kV)', tab, 0),
        },
        {
            field: 'ratedU2',
            ...numberColumnDefinition('ratedU2', 'Rated voltage 2 (kV)', tab, 0),
        },
        {
            field: 'p1',
            ...numberColumnDefinition('ActivePowerSide1', 'p1 (MW)', tab, 1),
        },
        {
            field: 'p2',
            ...numberColumnDefinition('ActivePowerSide2', 'p2 (MW)', tab, 1),
        },
        {
            field: 'q1',
            ...numberColumnDefinition('ReactivePowerSide1', 'q1 (MVar)', tab, 1),
        },
        {
            field: 'q2',
            ...numberColumnDefinition('ReactivePowerSide2', 'q2 (MVar)', tab, 1),
        },
        {
            field: 'ratioTapChanger.hasLoadTapChangingCapabilities',
            ...booleanColumnDefinition('HasLoadTapChangingCapabilities', 'Ratio on-load', tab),
        },
        {
            field: 'ratioTapChanger.regulationMode',
            ...textColumnDefinition('RatioRegulationMode', 'Ratio regulation mode', tab),
        },
        {
            field: 'ratioTapChanger.targetV',
            ...numberColumnDefinition('TargetVPoint', 'Voltage set point (kV)', tab, 1),
        },
        {
            field: 'ratioTapChanger.targetDeadband',
            ...numberColumnDefinition('RatioDeadBand', 'Ratio deadband', tab, 1),
        },
        {
            field: 'ratioTapChanger.regulationType',
            ...textColumnDefinition('RatioRegulationTypeText', 'Ratio regulation', tab),
        },
        {
            field: 'ratioTapChanger.regulationSide',
            ...textColumnDefinition('RatioRegulatedSide', 'Ratio regulated side', tab),
        },
        {
            field: 'ratioTapChanger.ratioRegulatingTerminal',
            ...textColumnDefinition('RatioRegulatingTerminal', 'Ratio regulated terminal', tab),
        },
        {
            field: 'ratioTapChanger.lowTapPosition',
            ...numberColumnDefinition('RatioLowTapPosition', 'Ratio low tap position', tab, 0),
        },
        {
            valueGetter: (params) => computeHighTapPosition(params?.data?.ratioTapChanger?.steps),
            ...numberColumnDefinition('RatioHighTapPosition', 'Ratio high tap position', tab, 0),
        },
        {
            field: 'ratioTapChanger.tapPosition',
            ...numberColumnDefinition('RatioTap', 'Ratio tap', tab, 0),
        },
        {
            field: 'phaseTapChanger.regulationMode',
            ...textColumnDefinition('RegulatingMode', 'Phase regulation mode', tab),
        },
        {
            field: 'phaseTapChanger.regulationValue',
            ...numberColumnDefinition('RegulatingValue', 'Current (A) or flow set point (MW)', tab, 1),
        },
        {
            field: 'phaseTapChanger.targetDeadband',
            ...numberColumnDefinition('PhaseDeadBand', 'Phase deadband', tab, 1),
        },
        {
            field: 'phaseTapChanger.regulationType',
            ...textColumnDefinition('PhaseRegulationTypeText', 'Phase regulation', tab),
        },
        {
            field: 'phaseTapChanger.regulationSide',
            ...textColumnDefinition('PhaseRegulatedSide', 'Phase regulated side', tab),
        },
        {
            field: 'phaseTapChanger.phaseRegulatingTerminal',
            ...textColumnDefinition('PhaseRegulatingTerminal', 'Phase regulated terminal', tab),
        },
        {
            field: 'phaseTapChanger.lowTapPosition',
            ...numberColumnDefinition('PhaseLowTapPosition', 'Phase low tap position', tab, 0),
        },
        {
            valueGetter: (params) => computeHighTapPosition(params?.data?.phaseTapChanger?.steps),
            ...numberColumnDefinition('PhaseHighTapPosition', 'Phase high tap position', tab, 0),
        },
        {
            field: 'phaseTapChanger.tapPosition',
            ...numberColumnDefinition('PhaseTap', 'Phase tap', tab, 0),
        },
        {
            field: 'r',
            ...numberColumnDefinition('r', 'Series resistance (Ω)', tab, 1),
        },
        {
            field: 'x',
            ...numberColumnDefinition('x', 'Series reactance (Ω)', tab, 1),
        },
        {
            valueGetter: (params) => convertInputValue(FieldType.G, params.data.g),
            ...numberColumnDefinition('g', 'Magnetizing conductance (μS)', tab, 1),
        },
        {
            valueGetter: (params) => convertInputValue(FieldType.B, params.data.b),
            ...numberColumnDefinition('b', 'Magnetizing susceptance (μS)', tab, 1),
        },
        {
            field: 'ratedS',
            ...numberColumnDefinition('ratedNominalPower', 'Rated nominal power (MVA)', tab, 1),
        },
        {
            field: 'terminal1Connected',
            ...booleanColumnDefinition('connected1', 'Connected 1', tab),
        },
        {
            field: 'terminal2Connected',
            ...booleanColumnDefinition('connected2', 'Connected 2', tab),
        },
        genericColumnOfPropertiesReadonly(tab),
    ],
};
