import {
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
} from '@mui/material';
import React from 'react';
import { Controller } from 'react-hook-form';
import { FieldLabel } from '../../dialogs/inputs/hooks-helpers';

export function ReactHookFormSelect({
    name,
    label,
    required = false,
    options,
    control,
    yupErrors,
    ...rest
}) {
    const hasError = !!yupErrors?.[name]?.message;

    return (
        <FormControl fullWidth size="small" variant="filled" errors={hasError}>
            <InputLabel error={hasError} id="enum-type-label">
                <FieldLabel label={label} optional={!required} />
            </InputLabel>
            <Controller
                control={control}
                name={name}
                render={({ field: { onChange, value } }) => (
                    <Select
                        size="small"
                        variant="filled"
                        fullWidth
                        value={value}
                        onChange={onChange}
                        error={hasError}
                    >
                        {options.map((option) => (
                            <MenuItem value={option.id}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                )}
            />
            <FormHelperText error={hasError}>
                {yupErrors?.[name]?.message}
            </FormHelperText>
        </FormControl>
    );
}
