/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import GlobalFilterProvider from './global-filter-provider';
import GlobalFilterAutocomplete from './global-filter-autocomplete';
import { FilterType } from '../utils';
import { TableType } from '../../../../types/custom-aggrid-types';
import type { UUID } from 'node:crypto';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';

export type GlobalFilterSelectorProps = {
    filterCategories?: FilterType[];
    filterableEquipmentTypes: EQUIPMENT_TYPES[];
    genericFiltersStrictMode?: boolean;
    tableType: TableType;
    tableUuid?: UUID;
};
export default function GlobalFilterSelector({
    filterCategories = Object.values(FilterType) as FilterType[],
    filterableEquipmentTypes,
    //If this parameter is enabled, only generic filters of the same type as those provided in filterableEquipmentTypes will be available
    genericFiltersStrictMode = false,
    tableType,
    tableUuid,
}: Readonly<GlobalFilterSelectorProps>) {
    return (
        <GlobalFilterProvider
            filterCategories={filterCategories}
            genericFiltersStrictMode={genericFiltersStrictMode}
            filterableEquipmentTypes={filterableEquipmentTypes}
            tableType={tableType}
            tableUuid={tableUuid ?? tableType}
        >
            <GlobalFilterAutocomplete />
        </GlobalFilterProvider>
    );
}
