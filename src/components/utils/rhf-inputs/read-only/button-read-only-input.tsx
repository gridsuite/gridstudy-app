/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useController } from 'react-hook-form';
import { InputAdornment, TextField, useTheme } from '@mui/material';
import { genHelperError } from '@gridsuite/commons-ui';
import { PropsWithChildren } from 'react';

interface ButtonReadOnlyInputProps extends PropsWithChildren {
    name: string;
    isNumerical?: boolean;
}

export function ButtonReadOnlyInput({ name, isNumerical = false, children }: ButtonReadOnlyInputProps) {
    const theme = useTheme();

    const {
        field: { value },
        fieldState: { error },
    } = useController({ name });

    return (
        <TextField
            InputProps={{
                readOnly: true,
                sx: isNumerical
                    ? {
                          '& input': {
                              textAlign: 'right',
                          },
                      }
                    : {},
                endAdornment: (
                    <InputAdornment
                        sx={{
                            '& button': {
                                borderRadius: 0,
                                borderLeft: '1px solid',
                                borderColor: theme.palette.action.disabled,
                                marginRight: '-14px',
                                marginLeft: '-8px',
                            },
                        }}
                        position="end"
                    >
                        {children}
                    </InputAdornment>
                ),
            }}
            size="small"
            fullWidth
            value={value}
            {...genHelperError(error?.message)}
        />
    );
}
