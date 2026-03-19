/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { GlobalFilter, GlobalFilters } from './global-filter-types';
import { FilterType } from '../utils';

/**
 * Transforms global filters stored by the frontend into the format expected by the filter server.
 * This function iterates through the list of `GlobalFilter` objects coming from the front,
 * categorizes them based on their `filterType`, and constructs a `GlobalFilters` object
 * suitable for the backend filter service. Returns `undefined` if no valid filters are found.
 */
export function buildValidGlobalFilters(filters: GlobalFilter[]): GlobalFilters | undefined {
    const newGlobalFilter: GlobalFilters = {};
    const voltageRanges: [number, number][] = [];
    const substationOrVoltageLevelFilters = new Set<string>();
    const genericFilters = new Set<string>();
    const countryCodes = new Set<string>();
    const substationProperties: Record<string, string[]> = {};

    filters.forEach((filter) => {
        switch (filter.filterType) {
            case FilterType.VOLTAGE_LEVEL:
                if (typeof filter.minValue === 'number' && typeof filter.maxValue === 'number') {
                    voltageRanges.push([filter.minValue, filter.maxValue]);
                }
                break;
            case FilterType.COUNTRY:
                countryCodes.add(filter.label);
                break;
            case FilterType.GENERIC_FILTER:
                if (filter.uuid) genericFilters.add(filter.uuid);
                break;
            case FilterType.SUBSTATION_OR_VL:
                if (filter.uuid) {
                    substationOrVoltageLevelFilters.add(filter.uuid);
                }
                break;
            case FilterType.SUBSTATION_PROPERTY:
                if (filter.filterSubtype) {
                    substationProperties[filter.filterSubtype] ??= [];
                    substationProperties[filter.filterSubtype].push(filter.label);
                }
                break;
        }
    });

    if (voltageRanges.length > 0) {
        newGlobalFilter.voltageRanges = voltageRanges;
    }
    if (countryCodes.size > 0) newGlobalFilter.countryCode = [...countryCodes];
    if (genericFilters.size > 0) newGlobalFilter.genericFilter = [...genericFilters];
    if (substationOrVoltageLevelFilters.size > 0) {
        newGlobalFilter.substationOrVoltageLevelFilter = [...substationOrVoltageLevelFilters];
    }
    if (Object.keys(substationProperties).length > 0) {
        newGlobalFilter.substationProperty = substationProperties;
    }

    const hasValidFilter =
        newGlobalFilter !== undefined &&
        ((newGlobalFilter.countryCode && newGlobalFilter.countryCode.length > 0) ||
            (newGlobalFilter.voltageRanges && newGlobalFilter.voltageRanges.length > 0) ||
            (newGlobalFilter.genericFilter && newGlobalFilter.genericFilter.length > 0) ||
            (newGlobalFilter.substationOrVoltageLevelFilter &&
                newGlobalFilter.substationOrVoltageLevelFilter.length > 0) ||
            !!newGlobalFilter.substationProperty);

    return hasValidFilter ? newGlobalFilter : undefined;
}
