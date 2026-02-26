/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { type AutocompleteInputProps, genHelperError, type MuiStyles } from '@gridsuite/commons-ui';
import { useController } from 'react-hook-form';
import { SyntheticEvent } from 'react';
import { Autocomplete, AutocompleteProps, TextField } from '@mui/material';

const styles = {
    autocomplete: {
        maxWidth: '100%',
    },
} as const satisfies MuiStyles;

type DependenciesEditorProps = Pick<AutocompleteProps<string, true, false, false>, 'disabled'> & {
    name: AutocompleteInputProps['name'];
    dependencies: string[];
};

export default function DependenciesEditor({ name, dependencies, ...props }: DependenciesEditorProps) {
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
            options={dependencies}
            size={'small'}
            sx={styles.autocomplete}
            renderInput={({ inputProps, ...rest }) => (
                <TextField
                    inputRef={ref}
                    inputProps={{
                        style: {
                            fontSize: 'small',
                        },
                        ...inputProps,
                    }}
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
