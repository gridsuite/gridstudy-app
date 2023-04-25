/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { IconButton, InputAdornment, TextField } from '@mui/material';
import { useController, useFormContext } from 'react-hook-form';
import ClearIcon from '@mui/icons-material/Clear';

export const TableNumericalInput = ({
    name,
    style,
    inputProps,
    previousValue,
    ...props
}) => {
    const { trigger } = useFormContext();
    const {
        field: { onChange, value, ref },
        fieldState: { error },
    } = useController({ name });

    const inputTransform = (value) => {
        if (['-', '.'].includes(value)) {
            return value;
        }
        return value === null || isNaN(value) ? '' : value.toString();
    };

    const outputTransform = (value) => {
        if (typeof value === 'string') {
            if (value === '-') {
                return value;
            }
            if (value === '') {
                return null;
            }

            const tmp = value?.replace(',', '.') || '';
            if (tmp.endsWith('.') || tmp.endsWith('0')) {
                return value;
            }
            return parseFloat(tmp) || null;
        }
        return value === Number.MAX_VALUE ? null : value;
    };

    const handleInputChange = (e) => {
        onChange(outputTransform(e.target.value));
        trigger(name);
    };

    const transformedValue = inputTransform(value);

    const handleClearValue = () => {
        onChange(outputTransform(previousValue));
    };

    return (
        <TextField
            value={transformedValue}
            onChange={handleInputChange}
            error={!!error?.message}
            size={'small'}
            fullWidth
            inputRef={ref}
            inputProps={{
                style: {
                    fontSize: 'small',
                    color:
                        previousValue && previousValue === value
                            ? 'grey'
                            : null, // grey out the value if it is the same as the previous one
                },
                inputMode: 'numeric',
                pattern: '[0-9]*',
                lang: 'en-US', // to have . as decimal separator
                ...inputProps,
            }}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        {/** we add the clear button only if the previous value is different from the current value **/}
                        {previousValue &&
                            previousValue !== value &&
                            transformedValue !== undefined &&
                            transformedValue !== '' && (
                                <IconButton onClick={handleClearValue}>
                                    <ClearIcon />
                                </IconButton>
                            )}
                    </InputAdornment>
                ),
                disableInjectingGlobalStyles: true, // disable auto-fill animations and increase rendering perf
            }}
            {...props}
        />
    );
};
