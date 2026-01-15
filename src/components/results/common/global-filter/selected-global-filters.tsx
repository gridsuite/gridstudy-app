/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { GlobalFilter } from './global-filter-types';
import { OverflowableChip } from '@gridsuite/commons-ui';
import { getResultsGlobalFiltersChipStyle, resultsGlobalFilterStyles } from './global-filter-styles';
import { Box, Divider, List, ListItem, Typography } from '@mui/material';
import { getOptionLabel } from './global-filter-utils';
import { useContext } from 'react';
import { GlobalFilterContext } from './global-filter-context';
import { useLocalizedCountries } from '../../../utils/localized-countries-hook';
import { FormattedMessage, useIntl } from 'react-intl';
import { FilterType } from '../utils';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';

function SelectedGlobalFilters() {
    const { selectedGlobalFilters, setSelectedGlobalFilters, onChange } = useContext(GlobalFilterContext);
    const { translate } = useLocalizedCountries();
    const intl = useIntl();

    const filtersByCategories: Map<string, GlobalFilter[]> = new Map();
    selectedGlobalFilters.forEach((filter: GlobalFilter) => {
        let displayedCategoryTitle: string = 'results.globalFilter.' + filter.filterType;

        if (filter.equipmentType !== undefined) {
            if (filter.filterType === FilterType.GENERIC_FILTER) {
                // generic filters are separated and displayed by equipment type :
                displayedCategoryTitle = filter.equipmentType;
            } else if (filter.filterType === FilterType.SUBSTATION_OR_VL) {
                // for clarity : if only substation filters are selected SUBSTATION_OR_VL are displayed as substations only
                const onlySubstationFilters = selectedGlobalFilters
                    .filter((filter) => filter.filterType === FilterType.SUBSTATION_OR_VL)
                    .every((filter) => filter.equipmentType === EQUIPMENT_TYPES.SUBSTATION);
                if (onlySubstationFilters) {
                    displayedCategoryTitle = filter.equipmentType;
                }
            }
        }
        if (!filtersByCategories.has(displayedCategoryTitle)) {
            filtersByCategories.set(displayedCategoryTitle, []);
        }
        filtersByCategories.get(displayedCategoryTitle)?.push(filter);
    });
    const entries = Array.from(filtersByCategories.entries());
    entries.sort((a, b) => a[0].localeCompare(b[0]));
    const filtersSortedByCategories = new Map(entries);

    return (
        <List sx={resultsGlobalFilterStyles.selectedFiltersPanel}>
            {Array.from(filtersSortedByCategories).map(([displayedCategoryTitle, filters], index) => (
                <ListItem key={displayedCategoryTitle} sx={resultsGlobalFilterStyles.selectedFiltersSubGroup}>
                    {index !== 0 && <Divider />}
                    <Typography sx={{ marginTop: 1 }}>
                        <FormattedMessage id={displayedCategoryTitle} />
                    </Typography>
                    <Box sx={resultsGlobalFilterStyles.selectedFiltersChips}>
                        {filters.map((element: GlobalFilter) => (
                            <OverflowableChip
                                label={getOptionLabel(element, translate, intl)}
                                sx={getResultsGlobalFiltersChipStyle(element.filterType)}
                                onDelete={() => {
                                    const newSelectedGlobalFilters = selectedGlobalFilters.filter(
                                        (filter) => filter !== element
                                    );
                                    setSelectedGlobalFilters(newSelectedGlobalFilters);
                                    onChange(newSelectedGlobalFilters);
                                }}
                            />
                        ))}
                    </Box>
                </ListItem>
            ))}
        </List>
    );
}

export default SelectedGlobalFilters;
