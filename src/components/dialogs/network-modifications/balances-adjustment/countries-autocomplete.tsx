/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { AutocompleteInputProps, genHelperError } from '@gridsuite/commons-ui';

import { useLocalizedCountries } from '../../../utils/localized-countries-hook';
import { styles } from './styles';
import { useController } from 'react-hook-form';
import { SyntheticEvent } from 'react';
import { Autocomplete, AutocompleteProps, TextField, TextFieldProps } from '@mui/material';

type CountriesAutocompleteProps = Pick<AutocompleteProps<string, true, false, false>, 'limitTags' | 'disabled'> & {
    name: AutocompleteInputProps['name'];
    label?: TextFieldProps['label'];
    disabled?: boolean;
};

export default function CountriesAutocomplete({ name, label, ...props }: CountriesAutocompleteProps) {
    const { countryCodes, translate } = useLocalizedCountries();

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
            value={value}
            onChange={handleChange}
            options={countryCodes}
            size={'small'}
            limitTags={2}
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
            getOptionLabel={(value) => translate(value)}
            autoHighlight={true}
            disableCloseOnSelect={true}
            {...props}
        />
    );
}
