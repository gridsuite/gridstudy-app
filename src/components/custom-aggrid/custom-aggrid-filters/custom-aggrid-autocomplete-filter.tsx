/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { FunctionComponent, SyntheticEvent, useMemo } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { useIntl } from 'react-intl';
import { useCustomAggridFilter } from '../hooks/use-custom-aggrid-filter';
import { isStringOrNonEmptyArray } from '../custom-aggrid-header-utils';
import { CustomAggridFilterParams, FILTER_TEXT_COMPARATORS, FilterEnumsType } from '../custom-aggrid-header.type';

export interface CustomAggridAutocompleteFilterParams extends CustomAggridFilterParams {
    filterEnums?: FilterEnumsType;
    getEnumLabel?: (value: string) => string; // Used for translation of enum values in the filter
}

export const CustomAggridAutocompleteFilter: FunctionComponent<CustomAggridAutocompleteFilterParams> = ({
    colId,
    filterParams,
    filterEnums,
    getEnumLabel,
}) => {
    const intl = useIntl();
    const { selectedFilterData, handleChangeFilterValue } = useCustomAggridFilter(colId, filterParams);

    const handleFilterAutoCompleteChange = (_: SyntheticEvent, data: string[]) => {
        handleChangeFilterValue({ value: data, type: FILTER_TEXT_COMPARATORS.EQUALS });
    };

    const filterOption = useMemo(() => filterEnums?.[colId] ?? [], [colId, filterEnums]);

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
