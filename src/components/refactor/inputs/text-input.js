/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { IconButton, InputAdornment, TextField } from '@mui/material';
import React, { useCallback } from 'react';
import { func_identity, useStyles } from '../../dialogs/dialogUtils';
import {
    FieldLabel,
    genHelperError,
    genHelperPreviousValue,
} from '../../dialogs/inputs/hooks-helpers';
import TextFieldWithAdornment from '../../util/text-field-with-adornment';
import ClearIcon from '@mui/icons-material/Clear';
import PropTypes from 'prop-types';

const TextInput = ({
    value,
    onChange,
    label,
    id,
    adornment,
    transformValue = func_identity,
    acceptValue,
    formProps,
    errorMsg,
    previousValue,
    clearable,
    customAdornment,
    isRequired = false,
}) => {
    const classes = useStyles();

    const handleChangeValue = useCallback(
        (event) => {
            if (acceptValue === undefined || acceptValue(event.target.value))
                onChange(transformValue(event.target.value));
        },
        [onChange, acceptValue, transformValue]
    );

    const handleClearValue = useCallback(() => {
        onChange('');
    }, [onChange]);

    const Field = adornment ? TextFieldWithAdornment : TextField;
    return (
        <Field
            key={id ? id : label}
            size="small"
            fullWidth
            id={id ? id : label}
            label={FieldLabel({
                label,
                optional: isRequired === false && !formProps?.disabled,
            })}
            {...(adornment && {
                adornmentPosition: adornment.position,
                adornmentText: adornment?.text,
            })}
            value={value} // handle numerical value
            onChange={handleChangeValue}
            FormHelperTextProps={{
                className: classes.helperText,
            }}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        {clearable && value !== undefined && value !== '' && (
                            <IconButton onClick={handleClearValue}>
                                <ClearIcon />
                            </IconButton>
                        )}
                        {customAdornment && { ...customAdornment }}
                    </InputAdornment>
                ),
            }}
            {...(clearable &&
                adornment && { handleClearValue: handleClearValue })}
            {...genHelperPreviousValue(previousValue, adornment)}
            {...genHelperError(errorMsg)}
            {...formProps}
        />
    );
};

TextInput.propTypes = {
    label: PropTypes.string.isRequired,
    isRequired: PropTypes.bool,
    errorMessage: PropTypes.string,
    value: PropTypes.any,
    onChange: PropTypes.func,
    adornment: PropTypes.object,
    customAdornment: PropTypes.object,
    transformValue: PropTypes.func,
    acceptValue: PropTypes.func,
    formProps: PropTypes.object,
    previousValue: PropTypes.object,
    clearable: PropTypes.bool,
};

export default TextInput;
