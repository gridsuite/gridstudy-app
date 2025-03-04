/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useController } from 'react-hook-form';
import { TextField } from '@mui/material';
import { genHelperError } from '@gridsuite/commons-ui';

interface ReadOnlyInputProps {
    name: string;
    isNumerical?: boolean;
}

export function ReadOnlyInput({ name, isNumerical = false }: ReadOnlyInputProps) {
    const {
        field: { value },
        fieldState: { error },
    } = useController({ name });

    return (
        <TextField
            InputProps={{
                readOnly: true,
                disableUnderline: true,
                sx: isNumerical
                    ? {
                          '& input': {
                              textAlign: 'right',
                          },
                      }
                    : {},
            }}
            fullWidth
            value={value}
            variant="standard"
            {...genHelperError(error?.message)}
        />
    );
}

export default ReadOnlyInput;
