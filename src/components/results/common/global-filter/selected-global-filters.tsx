/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { GlobalFilter } from './global-filter-types';
import { LineSeparator, OverflowableChip } from '@gridsuite/commons-ui';
import { getResultsGlobalFiltersChipStyle, resultsGlobalFilterStyles } from './global-filter-styles';
import { Box, Typography } from '@mui/material';
import { getOptionLabel } from './global-filter-utils';
import { useContext } from 'react';
import { GlobalFilterContext } from './global-filter-context';
import { useLocalizedCountries } from '../../../utils/localized-countries-hook';
import { FormattedMessage } from 'react-intl';

function SelectedGlobalFilters() {
    const { selectedGlobalFilters, setSelectedGlobalFilters, onChange } = useContext(GlobalFilterContext);
    const { translate } = useLocalizedCountries();

    const filtersByCategories: Map<string, GlobalFilter[]> = new Map();
    selectedGlobalFilters.forEach((filter: GlobalFilter) => {
        if (!filtersByCategories.has(filter.filterType)) {
            filtersByCategories.set(filter.filterType, []);
        }
        filtersByCategories.get(filter.filterType)?.push(filter);
    });

    return (
        <Box sx={resultsGlobalFilterStyles.selectedFiltersPanel}>
            <>
                {Array.from(filtersByCategories).map(([category, filters]) => (
                    <>
                        <Typography component="div" margin={0}>
                            <FormattedMessage id={'results.globalFilter.' + category} />
                        </Typography>
                        <LineSeparator />
                        <Box sx={resultsGlobalFilterStyles.selectedFiltersSubGroup}>
                            <>
                                {filters.map((element: GlobalFilter) => (
                                    <OverflowableChip
                                        label={getOptionLabel(element, translate)}
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
                            </>
                        </Box>
                    </>
                ))}
            </>
        </Box>
    );
}

export default SelectedGlobalFilters;
