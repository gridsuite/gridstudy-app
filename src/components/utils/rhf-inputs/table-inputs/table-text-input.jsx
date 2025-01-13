/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TextField } from '@mui/material';
import { useController } from 'react-hook-form';
import { useIntl } from 'react-intl';

export const TableTextInput = ({ name, style, showErrorMsg, inputProps, ...props }) => {
    const {
        field: { onChange, value, ref },
        fieldState: { error },
    } = useController({ name });

    const intl = useIntl();

    const outputTransform = (value) => {
        return value?.trim() === '' ? '' : value;
    };

    const handleInputChange = (e) => {
        onChange(outputTransform(e.target.value));
    };

    return (
        <>
            <TextField
                value={value}
                onChange={handleInputChange}
                error={!!error?.message}
                helperText={showErrorMsg ? (error?.message ? intl.formatMessage({ id: error.message }) : '') : ''}
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
        </>
    );
};
