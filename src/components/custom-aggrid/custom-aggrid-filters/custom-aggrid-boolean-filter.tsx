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
import { BooleanFilterValue } from '../custom-aggrid-header-utils';
import { mergeSx } from 'components/utils/functions';

const styles = {
    input: {
        minWidth: '250px',
        maxWidth: '40%',
        paddingRight: '0px',
    },
};

interface ICustomAggridBooleanFilter {
    value: string;
    onChange: (value: string) => void;
}

const CustomAggridBooleanFilter: FunctionComponent<ICustomAggridBooleanFilter> = ({ value, onChange }) => {
    const intl = useIntl();

    const handleValueChange = (event: SelectChangeEvent) => {
        const newValue = event.target.value;
        onChange && onChange(newValue);
    };

    return (
        <Select
            fullWidth
            size={'small'}
            value={value || ''}
            onChange={handleValueChange}
            sx={mergeSx(styles.input, {
                '& .MuiSelect-iconOutlined': {
                    display: value ? 'none' : '',
                },
            })}
            endAdornment={
                value && (
                    <IconButton onClick={() => onChange('')}>
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
