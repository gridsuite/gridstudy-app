/*
 * Copyright © 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import type { LimitTypes } from '../../components/results/loadflow/load-flow-result.type';
import type { FilterConfig, SortConfig } from '../../types/custom-aggrid-types';

/** data sent to the back */
export type GlobalFilters = {
    nominalV?: string[];
    countryCode?: string[];
    genericFilter?: string[]; // UUIDs of the generic filters
    // substation property filters fetched from user configuration
    substationProperty?: Record<string, string[]>;
};

export type GlobalFilterLoadFlow = GlobalFilters & {
    limitViolationsTypes?: LimitTypes[]; //TODO move to ResultsQueryParams
};

/**
 * globals filters are the filters applied to computation results
 * they may contain generic filters
 */
export interface ResultsQueryParams {
    sort?: SortConfig[];
    filters: FilterConfig[] | null; // column filters
    globalFilters?: GlobalFilters | GlobalFilterLoadFlow; // global filters, may contain generic filters applied to all the equipments
}
