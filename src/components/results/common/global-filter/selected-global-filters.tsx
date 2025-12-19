/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { GlobalFilter } from './global-filter-types';
import List from '@mui/material/List';
import { mergeSx, OverflowableChip } from '@gridsuite/commons-ui';
import { getResultsGlobalFiltersChipStyle, resultsGlobalFilterStyles } from './global-filter-styles';
import { ListItem } from '@mui/material';
import { getOptionLabel } from './global-filter-utils';
import { useContext } from 'react';
import { GlobalFilterContext } from './global-filter-context';
import { useLocalizedCountries } from '../../../utils/localized-countries-hook';

function SelectedGlobalFilters() {
    const { selectedGlobalFilters, setSelectedGlobalFilters, onChange } = useContext(GlobalFilterContext);
    const { translate } = useLocalizedCountries();

    return (
        <List sx={mergeSx(resultsGlobalFilterStyles.list, { overflowY: 'auto' })}>
            <>
                {selectedGlobalFilters.map((element: GlobalFilter) => (
                    <ListItem key={element.label} sx={{ height: '1.8em' }}>
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
                    </ListItem>
                ))}
            </>
        </List>
    );
}

export default SelectedGlobalFilters;
