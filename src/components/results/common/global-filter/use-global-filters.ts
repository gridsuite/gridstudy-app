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
            (globalFilters.substationOrVoltageLevelFilter && globalFilters.substationOrVoltageLevelFilter.length > 0) ||
            !!globalFilters.substationProperty)
    );
}

export default function useGlobalFilters() {
    const [globalFilters, setGlobalFilters] = useState<GlobalFilters>();

    // see <GlobalFilterSelector onChange={...} .../>
    const handleGlobalFilterChange = useCallback((value: GlobalFilter[]) => {
        let newGlobalFilter: GlobalFilters = {};

        const nominalVs = new Set(
            value
                .filter((filter: GlobalFilter) => filter.filterType === FilterType.VOLTAGE_LEVEL)
                .map((filter: GlobalFilter) => filter.label)
        );

        const genericFilters: Set<string> = new Set(
            value
                .filter((filter: GlobalFilter): boolean => filter.filterType === FilterType.GENERIC_FILTER)
                .map((filter: GlobalFilter) => filter.uuid ?? '')
                .filter((uuid: string): boolean => uuid !== '')
        );

        const substationOrVoltageLevelFilter: Set<string> = new Set(
            value
                .filter((filter: GlobalFilter): boolean => filter.filterType === FilterType.SUBSTATION_OR_VL)
                .map((filter: GlobalFilter) => filter.uuid ?? '')
                .filter((uuid: string): boolean => uuid !== '')
        );

        const countryCodes = new Set(
            value
                .filter((filter: GlobalFilter) => filter.filterType === FilterType.COUNTRY)
                .map((filter: GlobalFilter) => filter.label)
        );

        const substationProperties: Map<string, string[]> = new Map();
        value
            .filter((filter: GlobalFilter) => filter.filterType === FilterType.SUBSTATION_PROPERTY)
            .forEach((filter: GlobalFilter) => {
                if (filter.filterSubtype) {
                    const subtypeSubstationProperties = substationProperties.get(filter.filterSubtype);
                    if (subtypeSubstationProperties) {
                        subtypeSubstationProperties.push(filter.label);
                    } else {
                        substationProperties.set(filter.filterSubtype, [filter.label]);
                    }
                }
            });

        newGlobalFilter.nominalV = [...nominalVs];
        newGlobalFilter.countryCode = [...countryCodes];
        newGlobalFilter.genericFilter = [...genericFilters];
        newGlobalFilter.substationOrVoltageLevelFilter = Array.from(substationOrVoltageLevelFilter);

        if (substationProperties.size > 0) {
            newGlobalFilter.substationProperty = Object.fromEntries(substationProperties);
        }

        setGlobalFilters(newGlobalFilter);
    }, []);

    return { globalFilters, handleGlobalFilterChange };
}
