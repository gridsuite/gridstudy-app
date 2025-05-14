/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { GlobalFilter } from './global-filter-types';
import { FilterType } from '../utils';

export const RECENT_FILTER: string = 'recent';

export const getOptionLabel = (option: GlobalFilter, translate: (arg: string) => string): string => {
    switch (option.filterType) {
        case FilterType.COUNTRY:
        case FilterType.COUNTRY_1:
        case FilterType.COUNTRY_2:
            return translate(option.label);
        case FilterType.VOLTAGE_LEVEL:
        case FilterType.VOLTAGE_LEVEL_1:
        case FilterType.VOLTAGE_LEVEL_2:
            return option.label + ' kV';
        case FilterType.GENERIC_FILTER:
            return option.label;
    }
    return '';
};
