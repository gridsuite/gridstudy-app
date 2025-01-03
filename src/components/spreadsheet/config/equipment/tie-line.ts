/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { ReadonlyDeep } from 'type-fest';
import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { excludeFromGlobalFilter, typeAndFetchers } from './common-config';
import {
    BOOLEAN_TYPE,
    COUNTRY_TYPE,
    MEDIUM_COLUMN_WIDTH,
    NUMERIC_0_FRACTION_DIGITS_TYPE,
    NUMERIC_1_FRACTION_DIGITS_TYPE,
    NUMERIC_CAN_BE_INVALIDATED_TYPE,
    NUMERIC_UNIT_TO_MICRO_UNIT_TYPE,
    TEXT_TYPE,
} from '../../utils/constants';
import { genericColumnOfPropertiesReadonly } from '../common/column-properties';
import { SortWay } from 'hooks/use-aggrid-sort';

export const TIE_LINE_TAB_DEF = {
    index: 15,
    name: 'TieLines',
    ...typeAndFetchers(EQUIPMENT_TYPES.TIE_LINE),
    columns: [
        {
            id: 'ID',
            field: 'id',
            columnWidth: MEDIUM_COLUMN_WIDTH,
            type: TEXT_TYPE,
            sort: SortWay.ASC,
        },
        {
            id: 'Name',
            field: 'name',
            columnWidth: MEDIUM_COLUMN_WIDTH,
            type: TEXT_TYPE,
        },
        {
            id: 'VoltageLevelIdSide1',
            field: 'voltageLevelId1',
            type: TEXT_TYPE,
        },
        {
            id: 'VoltageLevelIdSide2',
            field: 'voltageLevelId2',
            type: TEXT_TYPE,
        },
        {
            id: 'Country1',
            field: 'country1',
            type: COUNTRY_TYPE,
        },
        {
            id: 'Country2',
            field: 'country2',
            type: COUNTRY_TYPE,
        },
        {
            id: 'nominalVoltage1KV',
            field: 'nominalVoltage1',
            type: NUMERIC_0_FRACTION_DIGITS_TYPE,
        },
        {
            id: 'nominalVoltage2KV',
            field: 'nominalVoltage2',
            type: NUMERIC_0_FRACTION_DIGITS_TYPE,
        },
        {
            id: 'ActivePowerSide1',
            field: 'p1',
            type: [NUMERIC_1_FRACTION_DIGITS_TYPE, NUMERIC_CAN_BE_INVALIDATED_TYPE],
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ActivePowerSide2',
            field: 'p2',
            type: [NUMERIC_1_FRACTION_DIGITS_TYPE, NUMERIC_CAN_BE_INVALIDATED_TYPE],
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePowerSide1',
            field: 'q1',
            type: [NUMERIC_1_FRACTION_DIGITS_TYPE, NUMERIC_CAN_BE_INVALIDATED_TYPE],
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePowerSide2',
            field: 'q2',
            type: [NUMERIC_1_FRACTION_DIGITS_TYPE, NUMERIC_CAN_BE_INVALIDATED_TYPE],
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'r',
            field: 'r',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'x',
            field: 'x',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'g1',
            field: 'g1',
            type: NUMERIC_UNIT_TO_MICRO_UNIT_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'g2',
            field: 'g2',
            type: NUMERIC_UNIT_TO_MICRO_UNIT_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'b1',
            field: 'b1',
            type: NUMERIC_UNIT_TO_MICRO_UNIT_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'b2',
            field: 'b2',
            type: NUMERIC_UNIT_TO_MICRO_UNIT_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'connected1',
            field: 'terminal1Connected',
            type: BOOLEAN_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'connected2',
            field: 'terminal2Connected',
            type: BOOLEAN_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        genericColumnOfPropertiesReadonly,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;
