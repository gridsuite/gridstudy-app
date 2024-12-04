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
import { CustomHeaderFilterParams } from '../custom-aggrid-header.type';
import { useCustomAggridFilter } from './use-custom-aggrid-filter';
import { isStringOrNonEmptyArray } from '../custom-aggrid-header-utils';

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

interface ICustomAggridBooleanFilter {
    field: string;
    filterParams: CustomHeaderFilterParams;
}

const CustomAggridBooleanFilter: FunctionComponent<ICustomAggridBooleanFilter> = ({ field, filterParams }) => {
    const intl = useIntl();

    const { selectedFilterData, booleanFilterParams } = useCustomAggridFilter(field, filterParams);
    const { handleSelectedFilterDataChange } = booleanFilterParams;

    const handleValueChange = (event: SelectChangeEvent) => {
        const newValue = event.target.value;
        handleSelectedFilterDataChange && handleSelectedFilterDataChange(newValue);
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
                    <IconButton onClick={() => handleSelectedFilterDataChange('')}>
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

export default CustomAggridBooleanFilter;
