/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { ReadonlyDeep } from 'type-fest';
import {
    type CustomColDef,
    FILTER_DATA_TYPES,
    FILTER_NUMBER_COMPARATORS,
    FILTER_TEXT_COMPARATORS,
} from '../../../custom-aggrid/custom-aggrid-header.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import {
    fetchBatteries,
    fetchBusbarSections,
    fetchBuses,
    fetchDanglingLines,
    fetchGenerators,
    fetchHvdcLines,
    fetchLccConverterStations,
    fetchLines,
    fetchLoads,
    fetchShuntCompensators,
    fetchStaticVarCompensators,
    fetchSubstations,
    fetchThreeWindingsTransformers,
    fetchTieLines,
    fetchTwoWindingsTransformers,
    fetchVoltageLevels,
    fetchVscConverterStations,
} from '../../../../services/study/network';
import { EquipmentFetcher, SpreadsheetEquipmentType } from '../spreadsheet.type';
import { CustomAggridComparatorFilter } from '../../../custom-aggrid/custom-aggrid-filters/custom-aggrid-comparator-filter';

export const getFetchers = (equipmentType: SpreadsheetEquipmentType): EquipmentFetcher[] => {
    switch (equipmentType) {
        case EQUIPMENT_TYPES.SUBSTATION:
            return [fetchSubstations];
        case EQUIPMENT_TYPES.VOLTAGE_LEVEL:
            return [fetchVoltageLevels];
        case EQUIPMENT_TYPES.LINE:
            return [fetchLines];
        case EQUIPMENT_TYPES.TIE_LINE:
            return [fetchTieLines];
        case EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER:
            return [fetchTwoWindingsTransformers];
        case EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER:
            return [fetchThreeWindingsTransformers];
        case EQUIPMENT_TYPES.HVDC_LINE:
            return [fetchHvdcLines];
        case EQUIPMENT_TYPES.GENERATOR:
            return [fetchGenerators];
        case EQUIPMENT_TYPES.BATTERY:
            return [fetchBatteries];
        case EQUIPMENT_TYPES.LOAD:
            return [fetchLoads];
        case EQUIPMENT_TYPES.SHUNT_COMPENSATOR:
            return [fetchShuntCompensators];
        case EQUIPMENT_TYPES.DANGLING_LINE:
            return [fetchDanglingLines];
        case EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR:
            return [fetchStaticVarCompensators];
        case EQUIPMENT_TYPES.VSC_CONVERTER_STATION:
            return [fetchVscConverterStations];
        case EQUIPMENT_TYPES.LCC_CONVERTER_STATION:
            return [fetchLccConverterStations];
        case EQUIPMENT_TYPES.BUS:
            return [fetchBuses];
        case EQUIPMENT_TYPES.BUSBAR_SECTION:
            return [fetchBusbarSections];
    }
};

export const typeAndFetchers = <TEquipType extends SpreadsheetEquipmentType>(equipmentType: TEquipType) =>
    ({
        type: equipmentType,
        fetchers: getFetchers(equipmentType),
    } as const);

export const defaultTextFilterConfig = {
    filter: 'agTextColumnFilter',
    filterComponent: CustomAggridComparatorFilter,
    filterComponentParams: {
        filterParams: {
            filterDataType: FILTER_DATA_TYPES.TEXT,
            filterComparators: [FILTER_TEXT_COMPARATORS.STARTS_WITH, FILTER_TEXT_COMPARATORS.CONTAINS],
        },
    },
} as const satisfies Partial<ReadonlyDeep<CustomColDef>>;

export const defaultNumericFilterConfig = {
    filter: 'agNumberColumnFilter',
    filterComponent: CustomAggridComparatorFilter,
    filterComponentParams: {
        filterParams: {
            filterDataType: FILTER_DATA_TYPES.NUMBER,
            filterComparators: Object.values(FILTER_NUMBER_COMPARATORS),
        },
    },
} as const satisfies Partial<ReadonlyDeep<CustomColDef>>;
