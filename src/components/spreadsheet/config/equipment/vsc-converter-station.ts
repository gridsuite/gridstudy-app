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
    TEXT_TYPE,
} from '../../utils/constants';
import { genericColumnOfProperties } from '../common/column-properties';
import { SortWay } from 'hooks/use-aggrid-sort';

export const VSC_CONVERTER_STATION_TAB_DEF = {
    index: 12,
    name: 'VscConverterStations',
    ...typeAndFetchers(EQUIPMENT_TYPES.VSC_CONVERTER_STATION),
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
            type: TEXT_TYPE,
        },
        {
            id: 'VoltageLevelId',
            field: 'voltageLevelId',
            type: TEXT_TYPE,
        },
        {
            id: 'Country',
            field: 'country',
            type: COUNTRY_TYPE,
        },
        {
            id: 'NominalV',
            field: 'nominalV',
            type: NUMERIC_0_FRACTION_DIGITS_TYPE,
        },
        {
            id: 'HvdcLineId',
            field: 'hvdcLineId',
            type: TEXT_TYPE,
        },
        {
            id: 'activePower',
            field: 'p',
            type: [NUMERIC_1_FRACTION_DIGITS_TYPE, NUMERIC_CAN_BE_INVALIDATED_TYPE],
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePower',
            field: 'q',
            type: [NUMERIC_1_FRACTION_DIGITS_TYPE, NUMERIC_CAN_BE_INVALIDATED_TYPE],
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'LossFactor',
            field: 'lossFactor',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'voltageRegulationOn',
            field: 'voltageRegulatorOn',
            type: BOOLEAN_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'VoltageSetpointKV',
            field: 'voltageSetpoint',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePowerSetpointMVAR',
            field: 'reactivePowerSetpoint',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'connected',
            field: 'terminalConnected',
            type: BOOLEAN_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        genericColumnOfProperties,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;
