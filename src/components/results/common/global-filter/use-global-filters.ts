/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo, useState } from 'react';
import { GlobalFilter, GlobalFilters } from './global-filter-types';
import { FilterType } from '../utils';

export function buildValidGlobalFilters(filters: GlobalFilter[]): GlobalFilters | undefined {
    const newGlobalFilter: GlobalFilters = {};
    const nominalVs = new Set<string>();
    const genericFilters = new Set<string>();
    const countryCodes = new Set<string>();
    const substationProperties: Record<string, string[]> = {};

    filters.forEach((filter) => {
        switch (filter.filterType) {
            case FilterType.VOLTAGE_LEVEL:
                nominalVs.add(filter.label);
                break;
            case FilterType.COUNTRY:
                countryCodes.add(filter.label);
                break;
            case FilterType.GENERIC_FILTER:
                if (filter.uuid) genericFilters.add(filter.uuid);
                break;
            case FilterType.SUBSTATION_PROPERTY:
                if (filter.filterSubtype) {
                    substationProperties[filter.filterSubtype] ??= [];
                    substationProperties[filter.filterSubtype].push(filter.label);
                }
                break;
        }
    });

    if (nominalVs.size > 0) newGlobalFilter.nominalV = [...nominalVs];
    if (countryCodes.size > 0) newGlobalFilter.countryCode = [...countryCodes];
    if (genericFilters.size > 0) newGlobalFilter.genericFilter = [...genericFilters];
    if (Object.keys(substationProperties).length > 0) {
        newGlobalFilter.substationProperty = substationProperties;
    }

    const hasValidFilter =
        (newGlobalFilter.nominalV?.length ?? 0) > 0 ||
        (newGlobalFilter.countryCode?.length ?? 0) > 0 ||
        (newGlobalFilter.genericFilter?.length ?? 0) > 0 ||
        !!newGlobalFilter.substationProperty;

    return hasValidFilter ? newGlobalFilter : undefined;
}

export default function useGlobalFilters() {
    const [selectedFilters, setSelectedFilters] = useState<GlobalFilter[]>([]);

    const handleGlobalFilterChange = useCallback((value: GlobalFilter[]) => {
        setSelectedFilters(value);
    }, []);

    const globalFilters = useMemo(() => buildValidGlobalFilters(selectedFilters), [selectedFilters]);
    return { globalFilters, handleGlobalFilterChange };
}
