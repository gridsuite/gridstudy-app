/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { GlobalFilter } from './global-filter.type';

/**
 * Global filters types
 * the order of those enum values is the default order for global filter displays : do not move them around
 */
export enum FilterType {
    VOLTAGE_LEVEL = 'voltageLevel',
    COUNTRY = 'country',
    SUBSTATION_PROPERTY = 'substationProperty',
    SUBSTATION_OR_VL = 'substationOrVoltageLevelFilter', // voltage levels and substation generic filters which uses the filter library
    GENERIC_FILTER = 'genericFilter', // generic filters which uses the filter library (except voltage level and substation filters)
}

export function isCriteriaFilter(filter: GlobalFilter): boolean {
    return isCriteriaFilterType(filter.filterType);
}

export function isCriteriaFilterType(filterType: string | undefined): boolean {
    return (
        filterType !== undefined &&
        (filterType === FilterType.GENERIC_FILTER || filterType === FilterType.SUBSTATION_OR_VL)
    );
}
