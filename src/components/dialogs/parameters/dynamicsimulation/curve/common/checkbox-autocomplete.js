/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    Autocomplete,
    Checkbox,
    createFilterOptions,
    TextField,
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import React, { useCallback, useState } from 'react';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const CHECK_ALL_LABEL = 'Check All';

const CheckboxAutocomplete = ({
    options,
    getOptionLabel: defaultGetOptionLabel,
    onChange,
    value: initialSelectedOptions,
    ...props
}) => {
    console.log('options', options);

    const [checkedOptions, setCheckedOptions] = useState(
        initialSelectedOptions ?? []
    );

    // used to reset internal state when initial selected value changed
    const [prevInitialSelectedOptions, setPrevInitialSelectedOptions] =
        useState(initialSelectedOptions);
    if (initialSelectedOptions !== prevInitialSelectedOptions) {
        setPrevInitialSelectedOptions(initialSelectedOptions);
        setCheckedOptions(initialSelectedOptions);
    }

    const checkedAll = options.length === checkedOptions.length;

    const getOptionLabel = useCallback(
        (option) => {
            if (option === CHECK_ALL_LABEL) {
                return CHECK_ALL_LABEL;
            }
            return defaultGetOptionLabel(option);
        },
        [defaultGetOptionLabel]
    );

    const optionRenderer = useCallback(
        (props, option, { selected }) => {
            // manage state of 'checked-all'
            const checkedProp =
                option === CHECK_ALL_LABEL ? { checked: checkedAll } : {};
            return (
                <li {...props}>
                    <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={selected}
                        {...checkedProp}
                    />
                    {getOptionLabel(option)}
                </li>
            );
        },
        [checkedAll, getOptionLabel]
    );

    const inputRenderer = useCallback(
        (params) => <TextField {...params} />,
        []
    );

    const tagRenderer = useCallback(
        (selectedOptions) => {
            if (selectedOptions.length === 1) {
                return getOptionLabel(selectedOptions[0]);
            } else if (selectedOptions.length > 1) {
                return `${getOptionLabel(
                    selectedOptions[selectedOptions.length - 1]
                )} ...`;
            }
            return '';
        },
        [getOptionLabel]
    );
    const filterOptions = useCallback((options, params) => {
        const defaultFilter = createFilterOptions();
        const filteredOptions = defaultFilter(options, params);
        console.log('filteredOptions', filteredOptions);
        return [CHECK_ALL_LABEL, ...filteredOptions];
    }, []);

    const handleCheckAll = useCallback(() => {
        if (!checkedAll) {
            setCheckedOptions(options);
        }
    }, [checkedAll, options]);

    const handleToggleOption = useCallback((selectedOptions) => {
        setCheckedOptions(selectedOptions);
    }, []);

    const handleClearOptions = useCallback(() => {
        setCheckedOptions([]);
    }, []);

    const handleChange = useCallback(
        (event, selectedOptions, reason) => {
            console.log('handleChange', [event, selectedOptions, reason]);
            if (['selectOption', 'removeOption'].includes(reason)) {
                // check whether Check All is selected
                if (selectedOptions.find((elem) => elem === CHECK_ALL_LABEL)) {
                    // must check all items
                    handleCheckAll();
                } else {
                    handleToggleOption(selectedOptions);
                }
            } else if (['clear'].includes(reason)) {
                handleClearOptions();
            }
        },
        [handleCheckAll, handleToggleOption, handleClearOptions]
    );

    return (
        <Autocomplete
            size="small"
            limitTags={1}
            multiple
            options={options}
            value={checkedOptions}
            disableCloseOnSelect
            filterOptions={filterOptions}
            renderOption={optionRenderer}
            renderInput={inputRenderer}
            onChange={handleChange}
            renderTags={tagRenderer}
            {...props}
        />
    );
};

export default CheckboxAutocomplete;
