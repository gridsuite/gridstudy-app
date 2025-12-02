/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';
import { GlobalFilter, GlobalFilters } from './global-filter-types';
import { FilterType } from '../utils';

export function isGlobalFilterParameter(globalFilters: GlobalFilters | undefined): globalFilters is GlobalFilters {
    return (
        globalFilters !== undefined &&
        ((globalFilters.countryCode && globalFilters.countryCode.length > 0) ||
            (globalFilters.nominalV && globalFilters.nominalV.length > 0) ||
            (globalFilters.genericFilter && globalFilters.genericFilter.length > 0) ||
            !!globalFilters.substationProperty)
    );
}

export default function useGlobalFilters() {
    const [globalFilters, setGlobalFilters] = useState<GlobalFilters>();

    // see <GlobalFilterSelector onChange={...} .../>
    const handleGlobalFilterChange = useCallback((value: GlobalFilter[]) => {
        const newGlobalFilter: GlobalFilters = {};
        const nominalVs = new Set<string>();
        const genericFilters = new Set<string>();
        const countryCodes = new Set<string>();
        const substationProperties: Record<string, string[]> = {};

        value.forEach((filter) => {
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

        setGlobalFilters(newGlobalFilter);
    }, []);

    return { globalFilters, handleGlobalFilterChange };
}
