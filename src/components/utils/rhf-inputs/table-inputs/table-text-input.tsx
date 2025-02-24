/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { InputBaseComponentProps, TextField } from '@mui/material';
import { useController } from 'react-hook-form';
import { useIntl } from 'react-intl';

interface TableTextInputProps {
    name: string;
    showErrorMsg?: boolean;
    inputProps?: InputBaseComponentProps;
}

export const TableTextInput = ({ name, showErrorMsg, inputProps, ...props }: TableTextInputProps) => {
    const {
        field: { onChange, value, ref },
        fieldState: { error },
    } = useController({ name });

    const intl = useIntl();

    const outputTransform = (value: string) => {
        return value?.trim() === '' ? '' : value;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onChange(outputTransform(e.target.value));
    };

    return (
        <TextField
            value={value}
            onChange={handleInputChange}
            error={!!error?.message}
            helperText={showErrorMsg && (error?.message ? intl.formatMessage({ id: error.message }) : '')}
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
                disableInjectingGlobalStyles: true, // disable auto-fill animations and increase rendering perf
            }}
            {...props}
        />
    );
};
