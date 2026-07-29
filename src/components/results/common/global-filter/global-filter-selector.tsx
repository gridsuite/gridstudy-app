/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import GlobalFilterProvider from './adapter/global-filter-provider';
import { TableType } from '../../../../types/custom-aggrid-types';
import type { UUID } from 'node:crypto';
import { EquipmentType, GlobalFilterPanel, GlobalFilterType } from '@gridsuite/commons-ui';
import { useLocalizedCountries } from '../../../utils/localized-countries-hook';

import { useEffect, useState } from 'react';
import { fetchSubstationPropertiesGlobalFilters } from './adapter/global-filter-app-data';

export type GlobalFilterSelectorProps = {
    filterCategories?: GlobalFilterType[];
    filterableEquipmentTypes: EquipmentType[];
    genericFiltersStrictMode?: boolean;
    tableType: TableType;
    tableUuid?: UUID;
};
const defaultFilterCategories = Object.values(GlobalFilterType) as GlobalFilterType[];
export default function GlobalFilterSelector({
    filterCategories = defaultFilterCategories,
    filterableEquipmentTypes,
    //If this parameter is enabled, only generic filters of the same type as those provided in filterableEquipmentTypes will be available
    genericFiltersStrictMode = false,
    tableType,
    tableUuid,
}: Readonly<GlobalFilterSelectorProps>) {
    const { translate: translateCountryCode } = useLocalizedCountries();
    const [substationPropertiesGlobalFilters, setSubstationPropertiesGlobalFilters] = useState<Map<string, string[]>>();

    useEffect(() => {
        fetchSubstationPropertiesGlobalFilters().then(({ substationPropertiesGlobalFilters }) => {
            setSubstationPropertiesGlobalFilters(substationPropertiesGlobalFilters);
        });
    }, []);

    return (
        <GlobalFilterProvider tableType={tableType} tableUuid={tableUuid ?? tableType}>
            <GlobalFilterPanel
                translateCountryCode={translateCountryCode}
                filterCategories={filterCategories}
                genericFiltersStrictMode={genericFiltersStrictMode}
                filterableEquipmentTypes={filterableEquipmentTypes}
                substationPropertiesGlobalFilters={substationPropertiesGlobalFilters}
            />
        </GlobalFilterProvider>
    );
}
