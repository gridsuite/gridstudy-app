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

const styles = {
    iconSize: {
        fontSize: '1rem',
    },
    input: {
        minWidth: '250px',
        maxWidth: '40%',
    },
};

interface ICustomAggridBooleanFilter {
    value: string;
    onChange: (value: string) => void;
}

const CustomAggridBooleanFilter: FunctionComponent<
    ICustomAggridBooleanFilter
> = ({ value, onChange }) => {
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
            sx={styles.input}
            endAdornment={
                value && (
                    <IconButton
                        onClick={() => onChange('')}
                        sx={styles.iconSize}
                    >
                        <ClearIcon />
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
