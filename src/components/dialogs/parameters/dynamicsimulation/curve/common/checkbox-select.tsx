/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Checkbox, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import { FunctionComponent, useCallback, useState } from 'react';
import { useIntl } from 'react-intl';

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

const CHECK_ALL = { label: 'SelectAll', value: 'check_all' };
const UNCHECK_ALL = { label: 'UnselectAll', value: 'uncheck_all' };

interface CheckBoxSelectProps {
    options: string[];
    getOptionLabel: (label: string) => string;
    onChange: (newSelectedOption: string[]) => void;
    value: string[];
    disabled: boolean;
}

const CheckboxSelect: FunctionComponent<CheckBoxSelectProps> = ({
    options,
    getOptionLabel: defaultGetOptionLabel,
    onChange,
    value: initialSelectedOptions,
    disabled,
}) => {
    const intl = useIntl();
    const [selectedOptions, setSelectedOptions] = useState(initialSelectedOptions ?? []);

    // used to reset internal state when initial selected value changed
    const [prevInitialSelectedOptions, setPrevInitialSelectedOptions] = useState(initialSelectedOptions);
    if (initialSelectedOptions !== prevInitialSelectedOptions) {
        setPrevInitialSelectedOptions(initialSelectedOptions);
        setSelectedOptions(initialSelectedOptions);
    }

    const handleChange = useCallback(
        (event: SelectChangeEvent<string[]>) => {
            const {
                target: { value: eventValue },
            } = event;
            const values = Array.isArray(eventValue) ? eventValue : [eventValue];

            let newSelectedOptions: string[];
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
            onChange && onChange(newSelectedOptions);
        },
        [options, onChange]
    );

    const getOptionLabel = useCallback(
        (option: string) => {
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
                    return `${getOptionLabel(selectedOptions[selectedOptions.length - 1])} (+${
                        selectedOptions.length - 1
                    })`;
                }
                return '';
            }}
            MenuProps={MenuProps}
            sx={{ width: '100%' }}
            disabled={disabled}
        >
            <MenuItem key={CHECK_ALL.value} value={CHECK_ALL.value}>
                <ListItemText primary={intl.formatMessage({ id: CHECK_ALL.label })} />
            </MenuItem>
            <MenuItem key={UNCHECK_ALL.value} value={UNCHECK_ALL.value}>
                <ListItemText primary={intl.formatMessage({ id: UNCHECK_ALL.label })} />
            </MenuItem>
            {options.map((option) => (
                <MenuItem key={option} value={option}>
                    <Checkbox checked={selectedOptions.indexOf(option) > -1} />
                    <ListItemText>{getOptionLabel(option)}</ListItemText>
                </MenuItem>
            ))}
        </Select>
    );
};

export default CheckboxSelect;
