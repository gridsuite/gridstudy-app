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
import { mergeSx } from 'components/utils/functions';
import { useCustomAggridFilter } from '../hooks/use-custom-aggrid-filter';
import { isStringOrNonEmptyArray } from '../custom-aggrid-header-utils';
import { CustomAggridFilterParams, FILTER_TEXT_COMPARATORS } from '../custom-aggrid-header.type';

export enum BooleanFilterValue {
    TRUE = 'true',
    FALSE = 'false',
    UNDEFINED = 'undefinedValue',
}

const styles = {
    input: {
        minWidth: '250px',
        maxWidth: '40%',
        paddingRight: '0px',
    },
};

export const CustomAggridBooleanFilter: FunctionComponent<CustomAggridFilterParams> = ({ colId, filterParams }) => {
    const intl = useIntl();

    const { selectedFilterData, handleChangeFilterValue } = useCustomAggridFilter(colId, filterParams);

    const handleValueChange = (event: SelectChangeEvent) => {
        const newValue = event.target.value;
        handleChangeFilterValue({ value: newValue, type: FILTER_TEXT_COMPARATORS.EQUALS });
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
                isStringOrNonEmptyArray(selectedFilterData) && (
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
