/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { GlobalFilter } from './global-filter-types';
import { FilterType } from '../utils';
import { fetchStudyMetadata } from '@gridsuite/commons-ui';
import { IntlShape } from 'react-intl';
import { UUID } from 'node:crypto';

export type GlobalFilterWithoutId = Omit<GlobalFilter, 'id'>;

export const RECENT_FILTER: string = 'recent';

// Add an ID to each filter object saved in the server so that it can be used as a key in the globalFiltersOptions object.
export const addGlobalFilterId = (filter: GlobalFilterWithoutId): GlobalFilter => {
    switch (filter.filterType) {
        case FilterType.GENERIC_FILTER:
        case FilterType.SUBSTATION_OR_VL:
            return { ...filter, id: filter.uuid as UUID };
        default:
            return { ...filter, id: filter.label };
    }
};

// Returns an ID for a given filter without modifying it
export const getGlobalFilterId = (filter: GlobalFilterWithoutId): string => {
    switch (filter.filterType) {
        case FilterType.GENERIC_FILTER:
        case FilterType.SUBSTATION_OR_VL:
            return filter.uuid as UUID;
        default:
            return filter.label;
    }
};

export const getOptionLabel = (
    option: GlobalFilterWithoutId,
    translate: (arg: string) => string,
    intl: IntlShape
): string => {
    if (option.label === 'elementNotFound') {
        return intl.formatMessage({ id: 'elementNotFound' });
    }
    switch (option.filterType) {
        case FilterType.COUNTRY:
            return translate(option.label);
        case FilterType.VOLTAGE_LEVEL:
            return intl.formatMessage({ id: option.label });
        case FilterType.GENERIC_FILTER:
        case FilterType.SUBSTATION_OR_VL:
        case FilterType.SUBSTATION_PROPERTY:
            return option.label;
    }
    return '';
};

export async function fetchSubstationPropertiesGlobalFilters(): Promise<{
    substationPropertiesGlobalFilters?: Map<string, string[]>;
}> {
    const { substationPropertiesGlobalFilters } = await fetchStudyMetadata();
    const definedSubstationPropertiesGlobalFilters: Map<string, string[]> = substationPropertiesGlobalFilters
        ? new Map(Object.entries(substationPropertiesGlobalFilters))
        : new Map<string, string[]>();
    return {
        substationPropertiesGlobalFilters: definedSubstationPropertiesGlobalFilters,
    };
}
