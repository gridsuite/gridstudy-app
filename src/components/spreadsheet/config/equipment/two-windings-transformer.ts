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
            colId: 'VoltageLevelIdSide1',
            field: 'voltageLevelId1',
            ...defaultTextFilterConfig,
        },
        {
            colId: 'VoltageLevelIdSide2',
            field: 'voltageLevelId2',
            ...defaultTextFilterConfig,
        },
        {
            colId: 'Country',
            field: 'country',
            ...defaultTextFilterConfig,
        },
        {
            colId: 'nominalVoltage1KV',
            field: 'nominalVoltage1',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 0,
            },
        },
        {
            colId: 'nominalVoltage2KV',
            field: 'nominalVoltage2',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 0,
            },
        },
        {
            colId: 'ratedVoltage1KV',
            field: 'ratedU1',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 0,
            },
        },
        {
            colId: 'ratedVoltage2KV',
            field: 'ratedU2',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 0,
            },
        },
        {
            colId: 'ActivePowerSide1',
            field: 'p1',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
        },
        {
            colId: 'ActivePowerSide2',
            field: 'p2',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
        },
        {
            colId: 'ReactivePowerSide1',
            field: 'q1',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
        },
        {
            colId: 'ReactivePowerSide2',
            field: 'q2',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
        },
        {
            colId: 'HasLoadTapChangingCapabilities',
            field: 'ratioTapChanger.hasLoadTapChangingCapabilities',
            valueGetter: (params) => params?.data?.ratioTapChanger?.hasLoadTapChangingCapabilities,
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
        },
        {
            colId: 'RatioRegulationMode',
            field: 'ratioTapChanger.regulationMode',
            valueGetter: (params) => params.data?.ratioTapChanger?.regulationMode,
            ...defaultTextFilterConfig,
            context: {
                ...defaultTextFilterConfig.context,
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
        },
        {
            colId: 'TargetVPoint',
            field: 'ratioTapChanger.targetV',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                fractionDigits: 1,
            },
        },
        {
            colId: 'RatioDeadBand',
            field: 'ratioTapChanger.targetDeadband',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                fractionDigits: 1,
            },
        },
        {
            colId: 'RatioRegulationTypeText',
            field: 'ratioTapChanger.regulationType',
            valueGetter: (params) => params.data?.ratioTapChanger?.regulationType,
            ...defaultTextFilterConfig,
            context: {
                ...defaultTextFilterConfig.context,
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
        },
        {
            colId: 'RatioRegulatedSide',
            field: 'ratioTapChanger.regulationSide',
            ...defaultTextFilterConfig,
            context: {
                ...defaultTextFilterConfig.context,
            },
            valueGetter: (params) => params.data?.ratioTapChanger?.regulationSide,
        },
        {
            colId: 'RatioRegulatingTerminal',
            field: 'ratioTapChanger.ratioRegulatingTerminal',
            ...defaultTextFilterConfig,
            valueGetter: (params) => params.data?.ratioTapChanger?.ratioRegulatingTerminal,
            context: {
                ...defaultTextFilterConfig.context,
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
        },
        {
            colId: 'RatioLowTapPosition',
            field: 'ratioTapChanger.lowTapPosition',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 0,
            },
        },
        {
            colId: 'RatioHighTapPosition',
            field: 'ratioTapChanger.highTapPosition',
            ...defaultNumericFilterConfig,
            valueGetter: (params) => computeHighTapPosition(params?.data?.ratioTapChanger?.steps),
        },
        {
            colId: 'RatioTap',
            field: 'ratioTapChanger.tapPosition',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 0,
            },
            valueGetter: (params) => params?.data?.ratioTapChanger?.tapPosition,
        },
        {
            colId: 'RegulatingMode',
            field: 'phaseTapChanger.regulationMode',
            ...defaultTextFilterConfig,
            context: {
                ...defaultTextFilterConfig.context,
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            valueGetter: (params) => params?.data?.phaseTapChanger?.regulationMode,
        },
        {
            colId: 'RegulatingValue',
            field: 'phaseTapChanger.regulationValue',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                columnWidth: MEDIUM_COLUMN_WIDTH,
                fractionDigits: 1,
            },
            valueGetter: (params) => params?.data?.phaseTapChanger?.regulationValue,
        },
        {
            colId: 'PhaseDeadBand',
            field: 'phaseTapChanger.targetDeadband',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                fractionDigits: 1,
            },
        },
        {
            colId: 'PhaseRegulationTypeText',
            field: 'phaseTapChanger.regulationType',
            ...defaultTextFilterConfig,
            context: {
                ...defaultTextFilterConfig.context,
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            valueGetter: (params) => params.data?.phaseTapChanger?.regulationType,
        },
        {
            colId: 'PhaseRegulatedSide',
            field: 'phaseTapChanger.regulationSide',
            ...defaultTextFilterConfig,
            context: {
                ...defaultTextFilterConfig.context,
            },
            valueGetter: (params) => params.data?.phaseTapChanger?.regulationSide,
        },
        {
            colId: 'PhaseRegulatingTerminal',
            field: 'phaseTapChanger.phaseRegulatingTerminal',
            ...defaultTextFilterConfig,
            valueGetter: (params) => params.data?.phaseTapChanger?.phaseRegulatingTerminal,
            context: {
                ...defaultTextFilterConfig.context,
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
        },
        {
            colId: 'PhaseLowTapPosition',
            field: 'phaseTapChanger.lowTapPosition',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 0,
            },
        },
        {
            colId: 'PhaseHighTapPosition',
            field: 'phaseTapChanger.highTapPosition',
            ...defaultNumericFilterConfig,
            valueGetter: (params) => computeHighTapPosition(params?.data?.phaseTapChanger?.steps),
        },
        {
            colId: 'PhaseTap',
            field: 'phaseTapChanger.tapPosition',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 0,
            },
            valueGetter: (params) => params?.data?.phaseTapChanger?.tapPosition,
        },
        {
            colId: 'r',
            field: 'r',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
        },
        {
            colId: 'x',
            field: 'x',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
        },
        {
            colId: 'g',
            field: 'g',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
            valueGetter: (params) => convertInputValue(FieldType.G, params.data.g),
        },
        {
            colId: 'b',
            field: 'b',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
            valueGetter: (params) => convertInputValue(FieldType.B, params.data.b),
        },
        {
            colId: 'ratedNominalPower',
            field: 'ratedS',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
        },
        {
            colId: 'connected1',
            field: 'terminal1Connected',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
            },
        },
        {
            colId: 'connected2',
            field: 'terminal2Connected',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
            },
        },
        genericColumnOfPropertiesReadonly,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;
