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
import { genericColumnOfPropertiesReadonly } from './column-properties';
import {
    booleanAgGridColumnDefinition,
    textAgGridColumnDefinition,
    numberAgGridColumnDefinition,
} from '../common-column-definitions';
import { unitToMicroUnit } from '@gridsuite/commons-ui';

export const TWO_WINDINGS_TRANSFORMER_TAB_DEF: SpreadsheetTabDefinition = {
    index: 3,
    name: 'TwoWindingsTransformers',
    ...typeAndFetchers(EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER),
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
            id: 'VoltageLevelIdSide1',
            field: 'voltageLevelId1',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'VoltageLevelIdSide2',
            field: 'voltageLevelId2',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'Country',
            field: 'country',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'nominalVoltage1KV',
            field: 'nominalVoltage1',
            ...numberAgGridColumnDefinition(0),
        },
        {
            id: 'nominalVoltage2KV',
            field: 'nominalVoltage2',
            ...numberAgGridColumnDefinition(0),
        },
        {
            id: 'ratedVoltage1KV',
            field: 'ratedU1',
            ...numberAgGridColumnDefinition(0),
        },
        {
            id: 'ratedVoltage2KV',
            field: 'ratedU2',
            ...numberAgGridColumnDefinition(0),
        },
        {
            id: 'ActivePowerSide1',
            field: 'p1',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'ActivePowerSide2',
            field: 'p2',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'ReactivePowerSide1',
            field: 'q1',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'ReactivePowerSide2',
            field: 'q2',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'HasLoadTapChangingCapabilities',
            field: 'ratioTapChanger.hasLoadTapChangingCapabilities',
            ...booleanAgGridColumnDefinition,
        },
        {
            id: 'RatioRegulationMode',
            field: 'ratioTapChanger.regulationMode',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'TargetVPoint',
            field: 'ratioTapChanger.targetV',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'RatioDeadBand',
            field: 'ratioTapChanger.targetDeadband',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'RatioRegulationTypeText',
            field: 'ratioTapChanger.regulationType',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'RatioRegulatedSide',
            field: 'ratioTapChanger.regulationSide',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'RatioRegulatingTerminal',
            field: 'ratioTapChanger.ratioRegulatingTerminal',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'RatioLowTapPosition',
            field: 'ratioTapChanger.lowTapPosition',
            ...numberAgGridColumnDefinition(0),
        },
        {
            id: 'RatioHighTapPosition',
            valueGetter: (params) => computeHighTapPosition(params?.data?.ratioTapChanger?.steps),
            ...numberAgGridColumnDefinition(0),
        },
        {
            id: 'RatioTap',
            field: 'ratioTapChanger.tapPosition',
            ...numberAgGridColumnDefinition(0),
        },
        {
            id: 'RegulatingMode',
            field: 'phaseTapChanger.regulationMode',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'RegulatingValue',
            field: 'phaseTapChanger.regulationValue',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'PhaseDeadBand',
            field: 'phaseTapChanger.targetDeadband',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'PhaseRegulationTypeText',
            field: 'phaseTapChanger.regulationType',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'PhaseRegulatedSide',
            field: 'phaseTapChanger.regulationSide',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'PhaseRegulatingTerminal',
            field: 'phaseTapChanger.phaseRegulatingTerminal',
            ...textAgGridColumnDefinition,
        },
        {
            id: 'PhaseLowTapPosition',
            field: 'phaseTapChanger.lowTapPosition',
            ...numberAgGridColumnDefinition(0),
        },
        {
            id: 'PhaseHighTapPosition',
            valueGetter: (params) => computeHighTapPosition(params?.data?.phaseTapChanger?.steps),
            ...numberAgGridColumnDefinition(0),
        },
        {
            id: 'PhaseTap',
            field: 'phaseTapChanger.tapPosition',
            ...numberAgGridColumnDefinition(0),
        },
        {
            id: 'r',
            field: 'r',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'x',
            field: 'x',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'g',
            valueGetter: (params) => unitToMicroUnit(params.data.g),
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'b',
            valueGetter: (params) => unitToMicroUnit(params.data.b),
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'ratedNominalPower',
            field: 'ratedS',
            ...numberAgGridColumnDefinition(1),
        },
        {
            id: 'connected1',
            field: 'terminal1Connected',
            ...booleanAgGridColumnDefinition,
        },
        {
            id: 'connected2',
            field: 'terminal2Connected',
            ...booleanAgGridColumnDefinition,
        },
        genericColumnOfPropertiesReadonly,
    ],
};
