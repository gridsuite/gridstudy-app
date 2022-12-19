import { TextField } from '@mui/material';
import React from 'react';
import { Controller } from 'react-hook-form';
import { FieldLabel } from '../../../dialogs/inputs/hooks-helpers';

export function ReactHookFormTextField({
    name,
    label,
    required,
    control,
    yupErrors,
    ...rest
}) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value } }) => (
                <TextField
                    size="small"
                    fullWidth
                    value={value}
                    onChange={onChange}
                    label={FieldLabel({ label: label, optional: !required })}
                    helperText={yupErrors?.[name]?.message}
                    error={yupErrors?.[name]?.message}
                    {...rest}
                />
            )}
        />
    );
}
