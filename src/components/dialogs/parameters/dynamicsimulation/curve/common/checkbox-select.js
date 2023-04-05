/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Checkbox, MenuItem, Select } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import { useCallback, useState } from 'react';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            maxWidth: '200',
        },
    },
};

const CHECK_ALL = { label: 'Check all', value: 'check_all' };
const UNCHECK_ALL = { label: 'Uncheck all', value: 'uncheck_all' };

const CheckboxSelect = ({
    options,
    getOptionLabel: defaultGetOptionLabel,
    onChange,
    value: initialSelectedOptions,
}) => {
    const [selectedOptions, setSelectedOptions] = useState(
        initialSelectedOptions ?? []
    );

    const handleChange = useCallback(
        (event) => {
            const {
                target: { value: values },
            } = event;
            let newSelectedOptions;
            if (values.find((elem) => elem === CHECK_ALL.value)) {
                // must check all items
                newSelectedOptions = options;
            } else if (values.find((elem) => elem === UNCHECK_ALL.value)) {
                // must un check all items
                newSelectedOptions = [];
            } else {
                newSelectedOptions = values;
            }

            setSelectedOptions(newSelectedOptions);

            // propagate by callback
            onChange(newSelectedOptions);
        },
        [options, onChange]
    );

    const getOptionLabel = useCallback(
        (option) => {
            return defaultGetOptionLabel(option);
        },
        [defaultGetOptionLabel]
    );

    return (
        <Select
            id="multiple-checkbox"
            size={'small'}
            multiple
            value={selectedOptions}
            onChange={handleChange}
            renderValue={(selectedOptions) => {
                if (selectedOptions.length === 1) {
                    return getOptionLabel(selectedOptions[0]);
                } else if (selectedOptions.length > 1) {
                    return `${getOptionLabel(
                        selectedOptions[selectedOptions.length - 1]
                    )} ...`;
                }
                return '';
            }}
            MenuProps={MenuProps}
            sx={{ width: '100%' }}
        >
            <MenuItem
                size={'small'}
                key={CHECK_ALL.value}
                value={CHECK_ALL.value}
            >
                <ListItemText primary={CHECK_ALL.label} />
            </MenuItem>
            <MenuItem
                size={'small'}
                key={UNCHECK_ALL.value}
                value={UNCHECK_ALL.value}
            >
                <ListItemText primary={UNCHECK_ALL.label} />
            </MenuItem>
            {options.map((option) => (
                <MenuItem size={'small'} key={option} value={option}>
                    <Checkbox checked={selectedOptions.indexOf(option) > -1} />
                    <ListItemText>{getOptionLabel(option)}</ListItemText>
                </MenuItem>
            ))}
        </Select>
    );
};

export default CheckboxSelect;
