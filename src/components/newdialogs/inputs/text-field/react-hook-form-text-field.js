import { TextField } from '@mui/material';
import React from 'react';
import { Controller } from 'react-hook-form';
import {
    FieldLabel,
    genHelperError,
} from '../../../dialogs/inputs/hooks-helpers';

export const ReactHookFormTextField = ({
    name,
    label,
    required,
    control,
    errorMessage,
    ...rest
}) => {
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
                    {...genHelperError(errorMessage)}
                    {...rest}
                />
            )}
        />
    );
};
