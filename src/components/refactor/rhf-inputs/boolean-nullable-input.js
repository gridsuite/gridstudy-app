/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import FormControl from '@mui/material/FormControl';
import { Checkbox, FormControlLabel, FormHelperText } from '@mui/material';
import { useIntl } from 'react-intl';
import { useController } from 'react-hook-form';
import { useCallback } from 'react';

const CheckboxNullableInput = ({
    name,
    label,
    id,
    formProps,
    previousValue,
}) => {
    const {
        field: { onChange, value },
    } = useController({ name });

    const intl = useIntl();

    const handleChangeValue = useCallback(
        (event) => {
            if (value) {
                onChange(null);
            } else if (value === null) {
                onChange(false);
            } else onChange(true);
        },
        [onChange, value]
    );

    return (
        <FormControl fullWidth size="small">
            <FormControlLabel
                id={id ? id : label}
                control={
                    <Checkbox
                        checked={value === true}
                        indeterminate={value === null}
                        onChange={(e) => handleChangeValue(e)}
                        value="checked"
                        inputProps={{
                            'aria-label': 'primary checkbox',
                        }}
                        {...formProps}
                    />
                }
                label={intl.formatMessage({
                    id: label,
                })}
            />
            {previousValue && <FormHelperText>{previousValue}</FormHelperText>}
        </FormControl>
    );
};

export default CheckboxNullableInput;
