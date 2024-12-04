/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { FunctionComponent, SyntheticEvent, useCallback } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { FilterParams, FilterPropsType } from '../custom-aggrid-header.type';
import { useLocalizedCountries } from '../../utils/localized-countries-hook';
import { useIntl } from 'react-intl';

interface CustomAggridAutocompleteFilterProps {
    value: string[] | undefined;
    filterParams: FilterParams & FilterPropsType;
    getEnumLabel: (value: string) => string | undefined;
    isCountry: boolean;
    onChange: (_: SyntheticEvent, data: string[]) => void;
}

export const CustomAggridAutocompleteFilter: FunctionComponent<CustomAggridAutocompleteFilterProps> = ({
    value,
    onChange,
    filterParams,
    getEnumLabel,
    isCountry,
}) => {
    const { translate } = useLocalizedCountries();
    const intl = useIntl();
    const { filterOptions } = filterParams;

    const getOptionLabel = useCallback(
        (option: string) =>
            isCountry
                ? translate(option)
                : intl.formatMessage({
                      id: getEnumLabel?.(option) || option,
                      defaultMessage: option,
                  }),
        [isCountry, intl, translate, getEnumLabel]
    );

    return (
        <Autocomplete
            multiple
            value={value || []}
            options={filterOptions}
            getOptionLabel={getOptionLabel}
            onChange={onChange}
            size="small"
            disableCloseOnSelect
            renderInput={(params) => (
                <TextField
                    {...params}
                    placeholder={
                        !value?.length
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
