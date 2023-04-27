/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { IconButton, InputAdornment, TextField } from '@mui/material';
import { useMemo } from 'react';
import { useController } from 'react-hook-form';
import ClearIcon from '@mui/icons-material/Clear';

export const TableTextInput = ({
    name,
    style,
    inputProps,
    previousValue,
    ...props
}) => {
    const {
        field: { onChange, value, ref },
        fieldState: { error },
    } = useController({ name });

    const outputTransform = (value) => {
        return value?.trim() === '' ? '' : value;
    };

    const handleInputChange = (e) => {
        onChange(outputTransform(e.target.value));
    };

    const handleClearValue = () => {
        onChange(outputTransform(previousValue));
    };

    const clearable = useMemo(
        () => previousValue && previousValue !== value,
        [previousValue, value]
    );

    return (
        <TextField
            value={value}
            onChange={handleInputChange}
            error={!!error?.message}
            size={'small'}
            fullWidth
            inputRef={ref}
            inputProps={{
                style: {
                    fontSize: 'small',
                },
                ...inputProps,
            }}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        {/** we add the clear button only if the previous value is different from the current value **/}
                        <IconButton
                            onClick={handleClearValue}
                            style={{
                                visibility: clearable ? 'visible' : 'hidden',
                            }}
                        >
                            <ClearIcon />
                        </IconButton>
                    </InputAdornment>
                ),
                disableInjectingGlobalStyles: true, // disable auto-fill animations and increase rendering perf
            }}
            {...props}
        />
    );
};
