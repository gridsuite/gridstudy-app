/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HTMLAttributes, ReactNode, SyntheticEvent, useState } from 'react';
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

// virtualized component CheckboxAutocomplete is customized from the MUI example
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
        '&:not(.Mui-focused) .MuiAutocomplete-tag': {
            maxWidth: 'calc(100% - 32px)', // reduce 32px to avoid the number of hidden tags, e.g +2, shown in a new line
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
        AutocompleteProps<Value, true, false, false>,
        | 'limitTags'
        | 'multiple'
        | 'ListboxComponent'
        | 'renderInput'
        | 'renderOption'
        | 'inputValue'
        | 'onChange'
        | 'onBlur'
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

    const handleChange = (_event: SyntheticEvent, value: Value[]) => {
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

    const renderOption = (props: HTMLAttributes<HTMLElement>, option: Value, state: AutocompleteRenderOptionState) =>
        virtualize ? (
            ([option, state.selected, getOptionLabel, props] as ReactNode)
        ) : (
            <CheckboxItem option={option} selected={state.selected} getOptionLabel={getOptionLabel} {...props} />
        );

    const handleBlur = () => {
        setInputValue('');
    };

    return (
        <Autocomplete
            id={`checkbox-autocomplete-${id}`}
            sx={styles.autocomplete}
            disableCloseOnSelect
            size="small"
            disableListWrap
            PopperComponent={StyledPopper}
            options={options}
            noOptionsText={intl.formatMessage({ id: 'noOption' })}
            getOptionLabel={getOptionLabel}
            {...otherProps}
            // props should not be overridden
            limitTags={1}
            multiple
            ListboxComponent={virtualize ? VirtualizedList : undefined}
            renderInput={renderInput}
            renderOption={renderOption}
            inputValue={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
        />
    );
};

export default CheckboxAutocomplete;
