/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { FunctionComponent, SyntheticEvent, useCallback } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { useLocalizedCountries } from '../../utils/localized-countries-hook';
import { useIntl } from 'react-intl';
import { useCustomAggridFilter } from '../hooks/use-custom-aggrid-filter';
import { isStringOrNonEmptyArray } from '../custom-aggrid-header-utils';
import { CustomAggridFilterProps } from './custom-aggrid-filter';
import { FILTER_TEXT_COMPARATORS } from '../custom-aggrid-header.type';

export const CustomAggridAutocompleteFilter: FunctionComponent<CustomAggridFilterProps> = ({ field, filterParams }) => {
    const { translate } = useLocalizedCountries();
    const intl = useIntl();
    const { filterOptions, isCountry, getEnumLabel } = filterParams;

    const { selectedFilterData, handleChangeFilterValue } = useCustomAggridFilter(field, filterParams);

    const handleFilterAutoCompleteChange = (_: SyntheticEvent, data: string[]) => {
        handleChangeFilterValue({ value: data, type: FILTER_TEXT_COMPARATORS.EQUALS });
    };

    const getOptionLabel = useCallback(
        (option: string) =>
            isCountry
                ? translate(option)
                : intl.formatMessage({
                      id: getEnumLabel?.(option) ?? option,
                      defaultMessage: option,
                  }),
        [isCountry, intl, translate, getEnumLabel]
    );

    return (
        <Autocomplete
            multiple
            value={Array.isArray(selectedFilterData) ? selectedFilterData : []}
            options={filterOptions}
            getOptionLabel={getOptionLabel}
            onChange={handleFilterAutoCompleteChange}
            size="small"
            disableCloseOnSelect
            renderInput={(params) => (
                <TextField
                    {...params}
                    placeholder={
                        !isStringOrNonEmptyArray(selectedFilterData)
                            ? intl.formatMessage({
                                  id: 'filter.filterOoo',
                              })
                            : ''
                    }
                />
            )}
            fullWidth
        />
    );
};