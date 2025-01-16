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
import { booleanColumnDefinition, numberColumnDefinition, textColumnDefinition } from '../common-column-definitions';

const tab = 'TwoWindingsTransformers';

export const TWO_WINDINGS_TRANSFORMER_TAB_DEF: SpreadsheetTabDefinition = {
    index: 3,
    name: tab,
    ...typeAndFetchers(EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER),
    columns: [
        { colId: 'ID', field: 'id', initialSort: 'asc', ...textColumnDefinition('ID', tab) },
        {
            colId: 'Name',
            field: 'name',
            ...textColumnDefinition('Name', tab),
        },
        {
            colId: 'VoltageLevelIdSide1',
            field: 'voltageLevelId1',
            ...textColumnDefinition('Voltage level ID 1', tab),
        },
        {
            colId: 'VoltageLevelIdSide2',
            field: 'voltageLevelId2',
            ...textColumnDefinition('Voltage level ID 2', tab),
        },
        { colId: 'Country', field: 'country', ...textColumnDefinition('Country', tab) },
        {
            colId: 'nominalVoltage1KV',
            field: 'nominalVoltage1',
            ...numberColumnDefinition('Nominal voltage 1 (kV)', tab, 0),
        },
        {
            colId: 'nominalVoltage2KV',
            field: 'nominalVoltage2',
            ...numberColumnDefinition('Nominal voltage 2 (kV)', tab, 0),
        },
        {
            colId: 'ratedVoltage1KV',
            field: 'ratedU1',
            ...numberColumnDefinition('Rated voltage 1 (kV)', tab, 0),
        },
        {
            colId: 'ratedVoltage2KV',
            field: 'ratedU2',
            ...numberColumnDefinition('Rated voltage 2 (kV)', tab, 0),
        },
        { colId: 'ActivePowerSide1', field: 'p1', ...numberColumnDefinition('p1 (MW)', tab, 1) },
        { colId: 'ActivePowerSide2', field: 'p2', ...numberColumnDefinition('p2 (MW)', tab, 1) },
        { colId: 'ReactivePowerSide1', field: 'q1', ...numberColumnDefinition('q1 (MVar)', tab, 1) },
        { colId: 'ReactivePowerSide2', field: 'q2', ...numberColumnDefinition('q2 (MVar)', tab, 1) },
        {
            colId: 'HasLoadTapChangingCapabilities',
            field: 'ratioTapChanger.hasLoadTapChangingCapabilities',
            ...booleanColumnDefinition('Ratio on-load', tab),
        },
        {
            colId: 'RatioRegulationMode',
            field: 'ratioTapChanger.regulationMode',
            ...textColumnDefinition('Ratio regulation mode', tab),
        },
        {
            colId: 'TargetVPoint',
            field: 'ratioTapChanger.targetV',
            ...numberColumnDefinition('Voltage set point (kV)', tab, 1),
        },
        {
            colId: 'RatioDeadBand',
            field: 'ratioTapChanger.targetDeadband',
            ...numberColumnDefinition('Ratio deadband', tab, 1),
        },
        {
            colId: 'RatioRegulationTypeText',
            field: 'ratioTapChanger.regulationType',
            ...textColumnDefinition('Ratio regulation', tab),
        },
        {
            colId: 'RatioRegulatedSide',
            field: 'ratioTapChanger.regulationSide',
            ...textColumnDefinition('Ratio regulated side', tab),
        },
        {
            colId: 'RatioRegulatingTerminal',
            field: 'ratioTapChanger.ratioRegulatingTerminal',
            ...textColumnDefinition('Ratio regulated terminal', tab),
        },
        {
            colId: 'RatioLowTapPosition',
            field: 'ratioTapChanger.lowTapPosition',
            ...numberColumnDefinition('Ratio low tap position', tab, 0),
        },
        {
            colId: 'RatioHighTapPosition',
            valueGetter: (params) => computeHighTapPosition(params?.data?.ratioTapChanger?.steps),
            ...numberColumnDefinition('Ratio high tap position', tab, 0),
        },
        {
            colId: 'RatioTap',
            field: 'ratioTapChanger.tapPosition',
            ...numberColumnDefinition('Ratio tap', tab, 0),
        },
        {
            colId: 'RegulatingMode',
            field: 'phaseTapChanger.regulationMode',
            ...textColumnDefinition('Phase regulation mode', tab),
        },
        {
            colId: 'RegulatingValue',
            field: 'phaseTapChanger.regulationValue',
            ...numberColumnDefinition('Current (A) or flow set point (MW)', tab, 1),
        },
        {
            colId: 'PhaseDeadBand',
            field: 'phaseTapChanger.targetDeadband',
            ...numberColumnDefinition('Phase deadband', tab, 1),
        },
        {
            colId: 'PhaseRegulationTypeText',
            field: 'phaseTapChanger.regulationType',
            ...textColumnDefinition('Phase regulation', tab),
        },
        {
            colId: 'PhaseRegulatedSide',
            field: 'phaseTapChanger.regulationSide',
            ...textColumnDefinition('Phase regulated side', tab),
        },
        {
            colId: 'PhaseRegulatingTerminal',
            field: 'phaseTapChanger.phaseRegulatingTerminal',
            ...textColumnDefinition('Phase regulated terminal', tab),
        },
        {
            colId: 'PhaseLowTapPosition',
            field: 'phaseTapChanger.lowTapPosition',
            ...numberColumnDefinition('Phase low tap position', tab, 0),
        },
        {
            colId: 'PhaseHighTapPosition',
            valueGetter: (params) => computeHighTapPosition(params?.data?.phaseTapChanger?.steps),
            ...numberColumnDefinition('Phase high tap position', tab, 0),
        },
        {
            colId: 'PhaseTap',
            field: 'phaseTapChanger.tapPosition',
            ...numberColumnDefinition('Phase tap', tab, 0),
        },
        { colId: 'r', field: 'r', ...numberColumnDefinition('Series resistance (Ω)', tab, 1) },
        { colId: 'x', field: 'x', ...numberColumnDefinition('Series reactance (Ω)', tab, 1) },
        {
            colId: 'g',
            valueGetter: (params) => convertInputValue(FieldType.G, params.data.g),
            ...numberColumnDefinition('Magnetizing conductance (μS)', tab, 1),
        },
        {
            colId: 'b',
            valueGetter: (params) => convertInputValue(FieldType.B, params.data.b),
            ...numberColumnDefinition('Magnetizing susceptance (μS)', tab, 1),
        },
        {
            colId: 'ratedNominalPower',
            field: 'ratedS',
            ...numberColumnDefinition('Rated nominal power (MVA)', tab, 1),
        },
        { colId: 'connected1', field: 'terminal1Connected', ...booleanColumnDefinition('Connected 1', tab) },
        {
            colId: 'connected2',
            field: 'terminal2Connected',
            ...booleanColumnDefinition('Connected 2', tab),
        },
        genericColumnOfPropertiesReadonly(tab),
    ],
};
