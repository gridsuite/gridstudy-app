/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import { useState } from 'react';
import {
    Autocomplete,
    autocompleteClasses,
    AutocompleteProps,
    AutocompleteRenderInputParams,
    AutocompleteRenderOptionState,
    lighten,
    Popper,
    styled,
    TextField,
    Theme,
} from '@mui/material';
import { useIntl } from 'react-intl';
import VirtualizedList from './virtualized-list';
import CheckboxItem from './checkbox-item';

// the virtualized component is customized from the MUI example
// https://mui.com/material-ui/react-autocomplete/#virtualization

const styles = {
    autocomplete: (theme: Theme) => ({
        '.MuiAutocomplete-inputRoot': {
            height: '40px',
            backgroundColor: 'unset', // prevents the field from changing size when selected with the keyboard
        },
        '.Mui-expanded, .Mui-focused, .Mui-focusVisible': {
            position: 'absolute',
            width: 'inherit',
            height: 'inherit',
            zIndex: 20, // jump up to avoid input zone pushed down below component
            backgroundColor: lighten(theme.palette.background.default, 0.16),
        },
        '&.Mui-focused': {
            '.MuiInputLabel-root': {
                zIndex: 21, // jump up to show max limit text
                width: 'auto',
            },
        },
    }),
};
// to reset all default alignments
const StyledPopper = styled(Popper)({
    [`& .${autocompleteClasses.listbox}`]: {
        boxSizing: 'border-box',
        '& ul': {
            padding: 0,
            margin: 0,
        },
    },
});

interface CheckboxAutocompleteProps<Value>
    extends Omit<
        AutocompleteProps<Value, true, false, false, any>,
        'renderInput' | 'renderOption' | 'inputValue' | 'onChange'
    > {
    id?: string;
    virtualize?: boolean;
    maxSelection?: number;
    options: Value[];
    getOptionLabel: (option: Value) => string;
    onChange: (value: Value[]) => void;
}

const CheckboxAutocomplete = <Value,>({
    id = '',
    virtualize = false,
    maxSelection = 0,
    options,
    getOptionLabel,
    onChange,
    ...otherProps
}: CheckboxAutocompleteProps<Value>) => {
    const intl = useIntl();

    // used to manage search text
    const [inputValue, setInputValue] = useState<string>('');

    // these states used as conditions to manage input label
    const [isFocusInput, setIsFocusInput] = useState(false);
    const [isMaxLimitReached, setMaxLimitReached] = useState(false);

    const handleChange = (_event: React.SyntheticEvent, value: Value[]) => {
        if (!maxSelection || value.length <= maxSelection) {
            setMaxLimitReached(false);
            // propagate change to the parent
            onChange(value);
        } else {
            setMaxLimitReached(true);
        }
    };

    // when lost focus, show number of options
    // when focused, check maxSelection reached to show infos
    const getInputLabel = () => {
        if (!isFocusInput) {
            return `${options?.length} ${intl.formatMessage({
                id: 'options',
            })}`;
        } else {
            if (isMaxLimitReached) {
                return `${maxSelection} ${intl.formatMessage({
                    id: 'maxSelection',
                })}`;
            }
        }
    };

    const renderInput = (params: AutocompleteRenderInputParams) => (
        <TextField
            {...params}
            label={getInputLabel()}
            onChange={(event) => {
                setInputValue(event.target.value);
            }}
            onFocus={() => {
                setIsFocusInput(true);
            }}
            onBlur={() => {
                setIsFocusInput(false);
                setMaxLimitReached(false);
            }}
            color={isMaxLimitReached ? 'warning' : undefined}
        />
    );

    const renderOption = (
        props: React.HTMLAttributes<HTMLElement>,
        option: Value,
        state: AutocompleteRenderOptionState
    ) =>
        virtualize ? (
            ([option, state.selected, getOptionLabel, props] as React.ReactNode)
        ) : (
            <CheckboxItem
                option={option}
                selected={state.selected}
                getOptionLabel={getOptionLabel}
                {...props}
            />
        );

    const handleBlur = () => {
        setInputValue('');
    };

    return (
        <Autocomplete
            id={`checkbox-autocomplete-${id}`}
            sx={styles.autocomplete}
            multiple
            disableCloseOnSelect
            size="small"
            disableListWrap
            PopperComponent={StyledPopper}
            ListboxComponent={virtualize ? VirtualizedList : undefined}
            options={options}
            noOptionsText={intl.formatMessage({ id: 'noOption' })}
            getOptionLabel={getOptionLabel}
            onChange={handleChange}
            inputValue={inputValue}
            onBlur={handleBlur}
            renderInput={renderInput}
            renderOption={renderOption}
            limitTags={1}
            {...otherProps}
        />
    );
};

export default CheckboxAutocomplete;
