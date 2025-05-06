/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { GlobalFilter } from './global-filter-types';
import { FilterType } from '../utils';
import { fetchStudyMetadata } from '@gridsuite/commons-ui';

export const RECENT_FILTER: string = 'recent';

export const getOptionLabel = (option: GlobalFilter, translate: (arg: string) => string): string => {
    switch (option.filterType) {
        case FilterType.COUNTRY:
            return translate(option.label);
        case FilterType.VOLTAGE_LEVEL:
            return option.label + ' kV';
        case FilterType.GENERIC_FILTER:
            return option.label;
        case FilterType.SUBSTATION_PROPERTY:
            return option.label;
    }
    return '';
};

export async function fetchSubstationPropertiesGlobalFilters(): Promise<{
    substationPropertiesGlobalFilters?: Map<string, string[]>;
}> {
    const { substationPropertiesGlobalFilters } = await fetchStudyMetadata();
    return {
        substationPropertiesGlobalFilters: new Map(Object.entries(substationPropertiesGlobalFilters)),
    };
}
