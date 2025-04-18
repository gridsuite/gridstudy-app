/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent } from 'react';
import { IconButton, MenuItem, Select } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { useIntl } from 'react-intl';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import { useCustomAggridFilter } from './hooks/use-custom-aggrid-filter';
import { isNonEmptyStringOrArray } from '../../../utils/types-utils';
import { mergeSx } from '@gridsuite/commons-ui';
import { BooleanFilterValue } from './utils/aggrid-filters-utils';
import { CustomAggridFilterParams, FILTER_DATA_TYPES, FILTER_TEXT_COMPARATORS } from './custom-aggrid-filter.type';

const styles = {
    input: {
        minWidth: '250px',
        maxWidth: '40%',
        paddingRight: '0px',
    },
};

export const CustomAggridBooleanFilter: FunctionComponent<CustomAggridFilterParams> = ({
    api,
    colId,
    filterParams,
}) => {
    const intl = useIntl();

    const { selectedFilterData, handleChangeFilterValue } = useCustomAggridFilter(api, colId, filterParams);

    const handleValueChange = (event: SelectChangeEvent) => {
        const newValue = event.target.value;
        handleChangeFilterValue({
            value: newValue,
            type: FILTER_TEXT_COMPARATORS.EQUALS,
            dataType: FILTER_DATA_TYPES.BOOLEAN,
        });
    };

    const handleClearFilter = () => {
        handleChangeFilterValue({
            value: undefined,
        });
    };

    return (
        <Select
            fullWidth
            size={'small'}
            value={typeof selectedFilterData === 'string' ? selectedFilterData : ''}
            onChange={handleValueChange}
            sx={mergeSx(styles.input, {
                '& .MuiSelect-iconOutlined': {
                    display: selectedFilterData ? 'none' : '',
                },
            })}
            endAdornment={
                isNonEmptyStringOrArray(selectedFilterData) && (
                    <IconButton onClick={handleClearFilter}>
                        <ClearIcon fontSize={'small'} />
                    </IconButton>
                )
            }
        >
            {Object.values(BooleanFilterValue).map((option) => (
                <MenuItem key={option} value={option}>
                    {intl.formatMessage({
                        id: option,
                    })}
                </MenuItem>
            ))}
        </Select>
    );
};
