import { TextField } from '@mui/material';
import React from 'react';
import { Controller } from 'react-hook-form';
import { toFloatValue } from '../../../dialogs/dialogUtils';
import { FieldLabel } from '../../../dialogs/inputs/hooks-helpers';
import { isFloatNumber } from '../../../dialogs/inputs/input-hooks';

export function ReactHookFormNumberTextField({
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
                    onChange={(e) => {
                        if (isFloatNumber(e.target.value))
                            onChange(toFloatValue(e.target.value));
                        else return;
                    }}
                    label={FieldLabel({ label: label, optional: !required })}
                    helperText={yupErrors?.[name]?.message}
                    error={yupErrors?.[name]?.message}
                    {...rest}
                />
            )}
        />
    );
}
