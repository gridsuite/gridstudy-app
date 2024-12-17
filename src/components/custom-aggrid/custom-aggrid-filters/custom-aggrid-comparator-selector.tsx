/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React from 'react';
import { Select, MenuItem } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select/SelectInput';
import { useIntl } from 'react-intl';

const styles = {
    input: {
        minWidth: '250px',
        maxWidth: '40%',
    },
};

interface CustomAggridComparatorSelectorProps {
    value: string;
    onChange: (event: SelectChangeEvent) => void;
    options: string[];
}

export const CustomAggridComparatorSelector: React.FC<CustomAggridComparatorSelectorProps> = ({
    value,
    onChange,
    options,
}) => {
    const intl = useIntl();

    return (
        <Select value={value} onChange={onChange} displayEmpty size={'small'} sx={styles.input}>
            {options.map((filterComparator) => (
                <MenuItem key={filterComparator} value={filterComparator}>
                    {intl.formatMessage({
                        id: `filter.${filterComparator}`,
                    })}
                </MenuItem>
            ))}
        </Select>
    );
};
