/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { LimitTypes } from '../../loadflow/load-flow-result.type';
import { FilterConfig, SortConfig } from '../../../../types/custom-aggrid-types';
import { UUID } from 'crypto';

/**
 * globals filters are the filters applied to computation results
 * they may contain generic filters
 */

// data sent to the back
export interface GlobalFilters {
    nominalV?: string[];
    countryCode?: string[];
    genericFilter?: string[]; // UUIDs of the generic filters
    limitViolationsTypes?: LimitTypes[];
}

// complete individual global filter
export interface GlobalFilter {
    label: string;
    filterType: string;
    recent?: boolean;
    uuid?: UUID; // only useful for generic filters
    equipmentType?: string; // only useful for generic filters
    path?: string; // only useful for generic filters
}

export interface ResultsQueryParams {
    sort?: SortConfig[];
    filters: FilterConfig[] | null; // column filters
    globalFilters?: GlobalFilters; // global filters, may contain generic filters applied to all the equipments
}
