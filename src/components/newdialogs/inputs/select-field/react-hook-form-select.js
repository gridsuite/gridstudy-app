import { MenuItem, TextField } from '@mui/material';
import React from 'react';
import { Controller } from 'react-hook-form';
import { FieldLabel } from '../../../dialogs/inputs/hooks-helpers';
import { FormattedMessage } from 'react-intl';

export const ReactHookFormSelect = ({
    name,
    label,
    required = false,
    options,
    control,
    errorMessage,
    ...rest
}) => {
    const hasError = !!errorMessage;

    return (
        <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value } }) => (
                <TextField
                    select
                    value={value}
                    label={FieldLabel({ label: label, optional: !required })}
                    onChange={onChange}
                    error={hasError}
                    {...rest}
                >
                    {options.map((option) => (
                        <MenuItem value={option.id}>
                            <FormattedMessage id={option.label} />
                        </MenuItem>
                    ))}
                </TextField>
            )}
        />
    );
};
