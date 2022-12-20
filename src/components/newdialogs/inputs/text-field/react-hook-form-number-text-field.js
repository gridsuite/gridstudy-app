import { TextField } from '@mui/material';
import React from 'react';
import { Controller } from 'react-hook-form';
import { toFloatValue } from '../../../dialogs/dialogUtils';
import {
    FieldLabel,
    genHelperError,
} from '../../../dialogs/inputs/hooks-helpers';
import { isFloatNumber } from '../../../dialogs/inputs/input-hooks';

export const ReactHookFormNumberTextField = ({
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
                    onChange={(e) => {
                        if (isFloatNumber(e.target.value))
                            onChange(toFloatValue(e.target.value));
                        else return;
                    }}
                    label={FieldLabel({ label: label, optional: !required })}
                    {...genHelperError(errorMessage)}
                    {...rest}
                />
            )}
        />
    );
};
