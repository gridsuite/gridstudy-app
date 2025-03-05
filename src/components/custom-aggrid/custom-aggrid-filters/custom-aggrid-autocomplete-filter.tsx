/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { FunctionComponent, SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { useIntl } from 'react-intl';
import { useCustomAggridFilter } from './hooks/use-custom-aggrid-filter';
import { isNonEmptyStringOrArray } from '../../../utils/types-utils';
import { CustomAggridFilterParams, FILTER_TEXT_COMPARATORS } from './custom-aggrid-filter.type';

export interface CustomAggridAutocompleteFilterParams extends CustomAggridFilterParams {
    getOptionLabel?: (value: string) => string; // Used for translation of enum values in the filter
    options?: string[];
}

export const CustomAggridAutocompleteFilter: FunctionComponent<CustomAggridAutocompleteFilterParams> = ({
    api,
    colId,
    filterParams,
    getOptionLabel,
    options,
}) => {
    const intl = useIntl();
    const { selectedFilterData, handleChangeFilterValue } = useCustomAggridFilter(api, colId, filterParams);
    const [computedFilterOptions, setComputedFilterOptions] = useState<string[]>(options ?? []);

    const getUniqueValues = useCallback(() => {
        const uniqueValues = new Set<string>();
        api.forEachNode((node) => {
            const value = api.getCellValue({
                rowNode: node,
                colKey: colId,
            });
            if (value) {
                uniqueValues.add(value);
            }
        });
        return Array.from(uniqueValues);
    }, [api, colId]);

    useEffect(() => {
        if (!options) {
            setComputedFilterOptions(getUniqueValues());
        }
    }, [options, getUniqueValues]);

    const handleFilterAutoCompleteChange = (_: SyntheticEvent, data: string[]) => {
        handleChangeFilterValue({ value: data, type: FILTER_TEXT_COMPARATORS.EQUALS });
    };

    return (
        <Autocomplete
            multiple
            value={Array.isArray(selectedFilterData) ? selectedFilterData : []}
            options={computedFilterOptions}
            getOptionLabel={getOptionLabel}
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
