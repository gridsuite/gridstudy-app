/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import GlobalFilterProvider from './global-filter-provider';
import GlobalFilterAutocomplete, { GlobalFilterAutocompleteProps } from './global-filter-autocomplete';
import { GlobalFilter } from './global-filter-types';

export type GlobalFilterSelectorProps = GlobalFilterAutocompleteProps & {
    onChange: (globalFilters: GlobalFilter[]) => void;
};
export default function GlobalFilterSelector({
    onChange,
    filterableEquipmentTypes,
    filters,
}: Readonly<GlobalFilterSelectorProps>) {
    const filterCategories = filters.map(filter => filter.filterType);
    return (
        <GlobalFilterProvider onChange={onChange} filterCategories={filterCategories}>
            <GlobalFilterAutocomplete filters={filters} filterableEquipmentTypes={filterableEquipmentTypes} />
        </GlobalFilterProvider>
    );
}
