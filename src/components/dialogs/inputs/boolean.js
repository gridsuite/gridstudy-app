/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { Checkbox, FormHelperText } from '@mui/material';
import FormControl from '@mui/material/FormControl';

export const useBooleanValue = ({
    label,
    id,
    defaultValue,
    validation = {},
    inputForm,
    formProps,
}) => {
    const [value, setValue] = useState(defaultValue);
    const intl = useIntl();

    useEffect(() => {
        function validate() {
            return true;
        }

        inputForm.addValidation(id ? id : label, validate);
    }, [label, validation, inputForm, value, id]);

    const handleChangeValue = useCallback(
        (event) => {
            setValue(event.target.checked);
            inputForm.setHasChanged(true);
        },
        [inputForm]
    );

    const field = useMemo(() => {
        return (
            <FormControlLabel
                id={id ? id : label}
                control={
                    <Switch
                        checked={value}
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
        );
    }, [intl, label, value, handleChangeValue, formProps, id]);

    useEffect(
        () => setValue(defaultValue),
        [defaultValue, inputForm.toggleClear]
    );

    return [value, field];
};

export const useNullableBooleanValue = ({
    label,
    id,
    defaultValue,
    previousValue,
    validation = {},
    inputForm,
    formProps,
}) => {
    const [value, setValue] = useState(
        defaultValue === undefined ? null : defaultValue
    );
    const intl = useIntl();

    useEffect(() => {
        function validate() {
            return true;
        }

        inputForm.addValidation(id ? id : label, validate);
    }, [label, validation, inputForm, value, id]);

    const handleChangeValue = useCallback(
        (event) => {
            setValue((oldVal) => {
                if (oldVal) {
                    return null;
                }
                if (oldVal === null) {
                    return false;
                }
                return true;
            });
            inputForm.setHasChanged(true);
        },
        [inputForm]
    );
    const field = useMemo(() => {
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
                {previousValue && (
                    <FormHelperText>{previousValue}</FormHelperText>
                )}
            </FormControl>
        );
    }, [intl, label, value, handleChangeValue, formProps, id, previousValue]);

    useEffect(
        () => setValue(defaultValue),
        [defaultValue, inputForm.toggleClear]
    );

    return [value, field];
};
