/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { ReadonlyDeep, Writable } from 'type-fest';
import { getEnumLabelById } from '../../../utils/utils';
import {
    type CustomColDef,
    FILTER_DATA_TYPES,
    FILTER_NUMBER_COMPARATORS,
    FILTER_TEXT_COMPARATORS,
} from '../../../custom-aggrid/custom-aggrid-header.type';
import { EnumOption } from '../../../utils/utils-type';
import type { CellStyleFunc, EditableCallback } from 'ag-grid-community';
import EnumCellRenderer, { type EnumCellRendererProps } from '../../utils/enum-cell-renderer';
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
import { BooleanFilterValue } from '../../../custom-aggrid/custom-aggrid-filters/custom-aggrid-boolean-filter';
import { CustomAggridAutocompleteFilter } from '../../../custom-aggrid/custom-aggrid-filters/custom-aggrid-autocomplete-filter';
import { CustomAggridComparatorFilter } from '../../../custom-aggrid/custom-aggrid-filters/custom-aggrid-comparator-filter';

type TapPositionsType = {
    lowTapPosition: number;
    highTapPosition: number;
};

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

export const generateTapPositions = (params: TapPositionsType) => {
    return params ? Array.from(Array(params.highTapPosition - params.lowTapPosition + 1).keys()) : [];
};

export const isEditable: EditableCallback = (params) => params.context.isEditing && params.node.rowPinned === 'top';

export const editableCellStyle: CellStyleFunc = (params) => {
    if (isEditable(params)) {
        if (Object.keys(params.context.editErrors).includes(params.column.getColId())) {
            return params.context.theme.editableCellError;
        } else {
            return params.context.theme.editableCell;
        }
    }
    return null;
};

export const editableColumnConfig = {
    editable: isEditable,
    cellStyle: editableCellStyle,
} as const satisfies Partial<ReadonlyDeep<CustomColDef>>;

//this function enables us to exclude some columns from the computation of the spreadsheet global filter
// The columns we want to include in the global filter at the date of this comment: ID (all), Name, Country, Type and Nominal Voltage (all).
// All the others should be excluded.
export const excludeFromGlobalFilter = () => '' as const;

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

/**
 * Default configuration for an enum filter
 * a new filter option is added to the default ag-grid filter
 */
export const defaultEnumFilterConfig = {
    filter: 'agTextColumnFilter',
    agGridFilterParams: {
        filterOptions: [
            {
                displayKey: 'customInRange',
                displayName: 'customInRange',
                predicate: (filterValues: string[], cellValue: string) =>
                    // We receive here the filter enum values as a string (filterValue)
                    filterValues.at(0)?.includes(cellValue) ?? false,
            },
        ],
    },
    //filterComponent: CustomAggridAutocompleteFilter,
    filterComponentParams: {
        filterParams: {
            filterDataType: FILTER_DATA_TYPES.TEXT,
        },
    },
    isEnum: true,
} as const satisfies Partial<ReadonlyDeep<CustomColDef>>;

/**
 * Default configuration for a boolean filter
 */
export const defaultBooleanFilterConfig = {
    filter: 'agTextColumnFilter',
    agGridFilterParams: {
        filterOptions: [
            {
                displayKey: 'booleanMatches',
                displayName: 'booleanMatches',
                predicate: (filterValues: string[], cellValue: boolean) => {
                    const filterValue = filterValues.at(0);
                    if (filterValue === undefined) {
                        return false;
                    }
                    // We receive here the filter boolean value as a string (filterValue)
                    // we check if the cellValue is not null neither undefined
                    if (cellValue != null) {
                        return filterValue === cellValue.toString();
                    }

                    // we return true if the filter chosen is undefinedValue
                    return filterValue === BooleanFilterValue.UNDEFINED;
                },
            },
        ],
    },
    filterComponentParams: {
        filterParams: {
            filterDataType: FILTER_DATA_TYPES.BOOLEAN,
        },
    },
} as const satisfies Partial<ReadonlyDeep<CustomColDef>>;

// This function is used to generate the default configuration for an enum filter
// It generates configuration for filtering, sorting and rendering
export const getDefaultEnumConfig = (enumOptions: Readonly<EnumOption[]>) =>
    ({
        ...defaultEnumFilterConfig,
        cellRenderer: EnumCellRenderer,
        cellRendererParams: {
            enumOptions: enumOptions as Writable<typeof enumOptions>,
            // @ts-expect-error TODO TS1360: Property value is missing in type
        } satisfies EnumCellRendererProps,
        getEnumLabel: (value: string) => getEnumLabelById(enumOptions as Writable<typeof enumOptions>, value),
    } as const satisfies Partial<ReadonlyDeep<CustomColDef>>);

export const countryEnumFilterConfig = {
    ...defaultEnumFilterConfig,
} as const satisfies Partial<ReadonlyDeep<CustomColDef>>;

export const defaultNumericFilterConfig = {
    filter: 'agNumberColumnFilter',
    filterComponentParams: {
        filterParams: {
            filterDataType: FILTER_DATA_TYPES.NUMBER,
            filterComparators: Object.values(FILTER_NUMBER_COMPARATORS),
        },
    },
} as const satisfies Partial<ReadonlyDeep<CustomColDef>>;
