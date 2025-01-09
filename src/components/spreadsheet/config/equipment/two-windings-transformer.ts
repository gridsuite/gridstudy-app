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
import { computeHighTapPosition } from '../../../utils/utils';
import { convertInputValue, FieldType } from '@gridsuite/commons-ui';
import { genericColumnOfPropertiesReadonly } from './column-properties';

export const TWO_WINDINGS_TRANSFORMER_TAB_DEF = {
    index: 3,
    name: 'TwoWindingsTransformers',
    ...typeAndFetchers(EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER),
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
            id: 'VoltageLevelIdSide1',
            field: 'voltageLevelId1',
            ...defaultTextFilterConfig,
        },
        {
            id: 'VoltageLevelIdSide2',
            field: 'voltageLevelId2',
            ...defaultTextFilterConfig,
        },
        {
            id: 'Country',
            field: 'country',
            ...defaultTextFilterConfig,
        },
        {
            id: 'nominalVoltage1KV',
            field: 'nominalVoltage1',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 0,
        },
        {
            id: 'nominalVoltage2KV',
            field: 'nominalVoltage2',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 0,
        },
        {
            id: 'ratedVoltage1KV',
            field: 'ratedU1',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 0,
        },
        {
            id: 'ratedVoltage2KV',
            field: 'ratedU2',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 0,
        },
        {
            id: 'ActivePowerSide1',
            field: 'p1',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
        },
        {
            id: 'ActivePowerSide2',
            field: 'p2',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
        },
        {
            id: 'ReactivePowerSide1',
            field: 'q1',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
        },
        {
            id: 'ReactivePowerSide2',
            field: 'q2',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
        },
        {
            id: 'HasLoadTapChangingCapabilities',
            field: 'ratioTapChanger.hasLoadTapChangingCapabilities',
            valueGetter: (params) => params?.data?.ratioTapChanger?.hasLoadTapChangingCapabilities,
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
        },
        {
            id: 'RatioRegulationMode',
            field: 'ratioTapChanger.regulationMode',
            valueGetter: (params) => params.data?.ratioTapChanger?.regulationMode,
            columnWidth: MEDIUM_COLUMN_WIDTH,
            ...defaultTextFilterConfig,
        },
        {
            id: 'TargetVPoint',
            field: 'ratioTapChanger.targetV',
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
        },
        {
            id: 'RatioDeadBand',
            field: 'ratioTapChanger.targetDeadband',
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
        },
        {
            id: 'RatioRegulationTypeText',
            field: 'ratioTapChanger.regulationType',
            valueGetter: (params) => params.data?.ratioTapChanger?.regulationType,
            columnWidth: MEDIUM_COLUMN_WIDTH,
            ...defaultTextFilterConfig,
        },
        {
            id: 'RatioRegulatedSide',
            field: 'ratioTapChanger.regulationSide',
            ...defaultTextFilterConfig,
            valueGetter: (params) => params.data?.ratioTapChanger?.regulationSide,
        },
        {
            id: 'RatioRegulatingTerminal',
            field: 'ratioTapChanger.ratioRegulatingTerminal',
            ...defaultTextFilterConfig,
            valueGetter: (params) => params.data?.ratioTapChanger?.ratioRegulatingTerminal,
            columnWidth: MEDIUM_COLUMN_WIDTH,
        },
        {
            id: 'RatioLowTapPosition',
            field: 'ratioTapChanger.lowTapPosition',
            ...defaultNumericFilterConfig,
            numeric: true,
            fractionDigits: 0,
        },
        {
            id: 'RatioHighTapPosition',
            field: 'ratioTapChanger.highTapPosition',
            ...defaultNumericFilterConfig,
            valueGetter: (params) => computeHighTapPosition(params?.data?.ratioTapChanger?.steps),
        },
        {
            id: 'RatioTap',
            field: 'ratioTapChanger.tapPosition',
            ...defaultNumericFilterConfig,
            numeric: true,
            fractionDigits: 0,
            valueGetter: (params) => params?.data?.ratioTapChanger?.tapPosition,
        },
        {
            id: 'RegulatingMode',
            field: 'phaseTapChanger.regulationMode',
            ...defaultTextFilterConfig,
            valueGetter: (params) => params?.data?.phaseTapChanger?.regulationMode,
            columnWidth: MEDIUM_COLUMN_WIDTH,
        },
        {
            id: 'RegulatingValue',
            field: 'phaseTapChanger.regulationValue',
            ...defaultNumericFilterConfig,
            columnWidth: MEDIUM_COLUMN_WIDTH,
            fractionDigits: 1,
            valueGetter: (params) => params?.data?.phaseTapChanger?.regulationValue,
        },
        {
            id: 'PhaseDeadBand',
            field: 'phaseTapChanger.targetDeadband',
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
        },
        {
            id: 'PhaseRegulationTypeText',
            field: 'phaseTapChanger.regulationType',
            ...defaultTextFilterConfig,
            valueGetter: (params) => params.data?.phaseTapChanger?.regulationType,
            columnWidth: MEDIUM_COLUMN_WIDTH,
        },
        {
            id: 'PhaseRegulatedSide',
            field: 'phaseTapChanger.regulationSide',
            ...defaultTextFilterConfig,
            valueGetter: (params) => params.data?.phaseTapChanger?.regulationSide,
        },
        {
            id: 'PhaseRegulatingTerminal',
            field: 'phaseTapChanger.phaseRegulatingTerminal',
            ...defaultTextFilterConfig,
            valueGetter: (params) => params.data?.phaseTapChanger?.phaseRegulatingTerminal,
            columnWidth: MEDIUM_COLUMN_WIDTH,
        },
        {
            id: 'PhaseLowTapPosition',
            field: 'phaseTapChanger.lowTapPosition',
            ...defaultNumericFilterConfig,
            numeric: true,
            fractionDigits: 0,
        },
        {
            id: 'PhaseHighTapPosition',
            field: 'phaseTapChanger.highTapPosition',
            ...defaultNumericFilterConfig,
            valueGetter: (params) => computeHighTapPosition(params?.data?.phaseTapChanger?.steps),
        },
        {
            id: 'PhaseTap',
            field: 'phaseTapChanger.tapPosition',
            ...defaultNumericFilterConfig,
            numeric: true,
            fractionDigits: 0,
            valueGetter: (params) => params?.data?.phaseTapChanger?.tapPosition,
        },
        {
            id: 'r',
            field: 'r',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
        },
        {
            id: 'x',
            field: 'x',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
        },
        {
            id: 'g',
            field: 'g',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            valueGetter: (params) => convertInputValue(FieldType.G, params.data.g),
        },
        {
            id: 'b',
            field: 'b',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            valueGetter: (params) => convertInputValue(FieldType.B, params.data.b),
        },
        {
            id: 'ratedNominalPower',
            field: 'ratedS',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
        },
        {
            id: 'connected1',
            field: 'terminal1Connected',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
        },
        {
            id: 'connected2',
            field: 'terminal2Connected',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
        },
        genericColumnOfPropertiesReadonly,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;
