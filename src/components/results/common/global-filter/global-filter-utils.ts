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

export const RECENT_FILTER: string = 'recent';

export const getOptionLabel = (option: GlobalFilter, translate: (arg: string) => string, intl: IntlShape): string => {
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
