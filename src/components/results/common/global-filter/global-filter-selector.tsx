/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import GlobalFilterProvider from './global-filter-provider';
import GlobalFilterAutocomplete from './global-filter-autocomplete';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { GlobalFilter } from './global-filter-types';

export type GlobalFilterSelectorProps = {
    onChange: (globalFilters: GlobalFilter[]) => void;
    filterableEquipmentTypes: EQUIPMENT_TYPES[];
    filters: GlobalFilter[];
};
export default function GlobalFilterSelector({
    onChange,
    filterableEquipmentTypes,
    filters,
}: Readonly<GlobalFilterSelectorProps>) {
    return (
        <GlobalFilterProvider onChange={onChange}>
            <GlobalFilterAutocomplete filters={filters} filterableEquipmentTypes={filterableEquipmentTypes} />
        </GlobalFilterProvider>
    );
}
