/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import FormControl from '@mui/material/FormControl';
import { Checkbox, CheckboxProps, FormControlLabel } from '@mui/material';
import { useIntl } from 'react-intl';
import { useController } from 'react-hook-form';
import { useCallback } from 'react';
import { HelperPreviousValue, useCustomFormContext } from '@gridsuite/commons-ui';

interface CheckboxNullableInputProps {
    name: string;
    label: string | ((value: boolean | null) => string);
    id?: string;
    formProps?: CheckboxProps;
    previousValue?: string;
    nullDisabled?: boolean;
    style?: { color: string };
}

const CheckboxNullableInput = ({
    name,
    label,
    id,
    formProps,
    previousValue,
    nullDisabled,
    style,
}: Readonly<CheckboxNullableInputProps>) => {
    const {
        field: { onChange, value },
    } = useController({ name });

    const intl = useIntl();
    const { isNodeBuilt, isUpdate } = useCustomFormContext();

    const handleChangeValue = useCallback(() => {
        if (value) {
            onChange(null);
        } else if (value === null) {
            onChange(false);
        } else {
            onChange(true);
        }
    }, [onChange, value]);

    // Get the current label based on value
    const currentLabel = typeof label === 'function' ? label(value) : label;

    return (
        <FormControl fullWidth size="small">
            <FormControlLabel
                id={id ?? currentLabel}
                control={
                    <Checkbox
                        checked={value === true}
                        indeterminate={nullDisabled ? undefined : value === null}
                        onChange={handleChangeValue}
                        value="checked"
                        inputProps={{
                            'aria-label': 'primary checkbox',
                        }}
                        {...formProps}
                    />
                }
                label={
                    !label
                        ? ''
                        : intl.formatMessage({
                              id: currentLabel,
                          })
                }
                sx={style ? { color: style.color } : undefined}
            />
            {previousValue && (
                <HelperPreviousValue
                    previousValue={previousValue}
                    isNodeBuilt={isNodeBuilt}
                    disabledTooltip={!isUpdate && isNodeBuilt}
                />
            )}
        </FormControl>
    );
};

export default CheckboxNullableInput;
