/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { type AutocompleteInputProps, genHelperError, type MuiStyles } from '@gridsuite/commons-ui';
import { useController } from 'react-hook-form';
import { SyntheticEvent } from 'react';
import { Autocomplete, type AutocompleteProps, TextField, type TextFieldProps } from '@mui/material';

const styles = {
    autocomplete: (theme) => ({
        '.MuiAutocomplete-inputRoot': {
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            flexWrap: 'nowrap',
            padding: '1px',
            paddingLeft: '5px',
        },
        '.Mui-expanded, .Mui-focused, .Mui-focusVisible': {
            width: 'inherit',
            background: theme.palette.tabBackground,
            flexWrap: 'wrap',
        },
    }),
} as const satisfies MuiStyles;

type SubstationsAutocompleteProps = Pick<AutocompleteProps<string, true, false, false>, 'disabled'> & {
    name: AutocompleteInputProps['name'];
    label?: TextFieldProps['label'];
    disabled?: boolean;
    substations: string[];
};

export default function SubstationsAutocomplete({
    name,
    label,
    disabled,
    substations,
    ...props
}: SubstationsAutocompleteProps) {
    const {
        field: { onChange, value, ref },
        fieldState: { error },
    } = useController({ name });

    const handleChange = (_: SyntheticEvent, value: string[]) => {
        onChange(value);
    };

    return (
        <Autocomplete
            multiple
            disabled={disabled}
            value={value}
            onChange={handleChange}
            options={substations}
            size={'small'}
            freeSolo
            sx={styles.autocomplete}
            renderInput={({ inputProps, ...rest }) => (
                <TextField
                    inputRef={ref}
                    inputProps={{ ...inputProps }}
                    label={label}
                    {...genHelperError(error?.message)}
                    {...rest}
                />
            )}
            autoHighlight={true}
            disableCloseOnSelect={true}
            {...props}
        />
    );
}
