/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { FunctionComponent, SyntheticEvent, useMemo, useEffect, useState, useCallback } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { useIntl } from 'react-intl';
import { useCustomAggridFilter } from './hooks/use-custom-aggrid-filter';
import { CustomAggridFilterParams, FILTER_TEXT_COMPARATORS, FilterEnumsType } from '../custom-aggrid-header.type';
import { isNonEmptyStringOrArray } from '../../../utils/types-utils';

export interface CustomAggridAutocompleteFilterParams extends CustomAggridFilterParams {
    filterEnums?: FilterEnumsType;
    getEnumLabel?: (value: string) => string; // Used for translation of enum values in the filter
}

export const CustomAggridAutocompleteFilter: FunctionComponent<CustomAggridAutocompleteFilterParams> = ({
    api,
    colId,
    field,
    filterParams,
    filterEnums,
    getEnumLabel,
}) => {
    const intl = useIntl();
    const { selectedFilterData, handleChangeFilterValue } = useCustomAggridFilter(api, colId, filterParams);
    const [computedFilterOptions, setComputedFilterOptions] = useState<string[]>([]);

    const getUniqueValues = useCallback(() => {
        const uniqueValues = new Set<string>();
        api.forEachNode((node) => {
            const value = node.data[field];
            if (value) {
                uniqueValues.add(value);
            }
        });
        setComputedFilterOptions(Array.from(uniqueValues));
    }, [api, field]);

    useEffect(() => {
        if (!filterEnums) {
            getUniqueValues();
        }
    }, [filterEnums, getUniqueValues]);

    const handleFilterAutoCompleteChange = (_: SyntheticEvent, data: string[]) => {
        handleChangeFilterValue({ value: data, type: FILTER_TEXT_COMPARATORS.EQUALS });
    };

    const filterOptions = useMemo(
        () => filterEnums?.[colId] ?? computedFilterOptions,
        [colId, computedFilterOptions, filterEnums]
    );

    return (
        <Autocomplete
            multiple
            value={Array.isArray(selectedFilterData) ? selectedFilterData : []}
            options={filterOptions}
            getOptionLabel={getEnumLabel}
            onChange={handleFilterAutoCompleteChange}
            size="small"
            disableCloseOnSelect
            renderInput={(params) => (
                <TextField
                    {...params}
                    placeholder={
                        !isNonEmptyStringOrArray(selectedFilterData)
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
