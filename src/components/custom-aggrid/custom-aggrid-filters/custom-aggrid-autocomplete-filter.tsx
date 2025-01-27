/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { FunctionComponent, SyntheticEvent, useMemo } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { useIntl } from 'react-intl';
import { useCustomAggridFilter } from './hooks/use-custom-aggrid-filter';
import { CustomAggridFilterParams, FILTER_TEXT_COMPARATORS, FilterEnumsType } from '../custom-aggrid-header.type';
import { isNonEmptyStringOrArray } from '../../../utils/types-utils';

export interface CustomAggridAutocompleteFilterParams extends CustomAggridFilterParams {
    filterEnums?: FilterEnumsType;
    getEnumLabel?: (value: string) => string; // Used for translation of enum values in the filter
    customOptions?: string[];
}

/**
 * may be used with enums OR with a customOptions string array
 */
export const CustomAggridAutocompleteFilter: FunctionComponent<CustomAggridAutocompleteFilterParams> = ({
    api,
    colId,
    filterParams,
    filterEnums,
    getEnumLabel,
    customOptions,
}) => {
    const intl = useIntl();
    const { selectedFilterData, handleChangeFilterValue } = useCustomAggridFilter(api, colId, filterParams);

    const handleFilterAutoCompleteChange = (_: SyntheticEvent, data: string[]) => {
        handleChangeFilterValue({ value: data, type: FILTER_TEXT_COMPARATORS.EQUALS });
    };

    const enumMode: boolean = useMemo(() => filterEnums !== undefined, [filterEnums]);

    const filterOption = useMemo(() => {
        if (enumMode) {
            return filterEnums?.[colId] ?? [];
        }
        return customOptions ?? [];
    }, [colId, filterEnums, customOptions, enumMode]);

    return (
        <Autocomplete
            multiple
            value={Array.isArray(selectedFilterData) ? selectedFilterData : []}
            options={filterOption}
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
