/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TextField } from '@mui/material';
import { useController, useFormContext } from 'react-hook-form';

export const TableNumericalInput = ({ name, style, inputProps, ...props }) => {
    const { trigger } = useFormContext();
    const {
        field: { onChange, value, ref },
        fieldState: { error },
    } = useController({ name });

    const inputTransform = (value) => {
        if (['-', '.'].includes(value)) return value;
        return value === null || isNaN(value) ? '' : value.toString();
    };

    const outputTransform = (value) => {
        if (value === '-') return value;
        if (value === '') return null;

        const tmp = value?.replace(',', '.') || '';
        if (tmp.endsWith('.') || tmp.endsWith('0')) return value;
        return parseFloat(tmp) || null;
    };

    const handleInputChange = (e) => {
        onChange(outputTransform(e.target.value));
        trigger(name);
    };

    const transformedValue = inputTransform(value);

    const renderNumericText = (
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
                },
                inputMode: 'numeric',
                pattern: '[0-9]*',
                lang: 'en-US', // to have . as decimal separator
                ...inputProps,
            }}
            InputProps={{
                disableInjectingGlobalStyles: true, // disable auto-fill animations and increase rendering perf
            }}
            {...props}
        />
    );

    return <div>{renderNumericText}</div>;
};
