/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Autocomplete, TextField } from '@mui/material';
import React from 'react';
import {
    FieldLabel,
    genHelperError,
    genHelperPreviousValue,
} from '../../dialogs/inputs/hooks-helpers';
import PropTypes from 'prop-types';
import { Controller, useController, useFormContext } from 'react-hook-form';
import { func_identity } from '../../dialogs/dialogUtils';

/**
 * Autocomplete input
 * @param label field label id, will be translated
 * @param required required state to append '(optional)' to the end of the label
 * @param options select options, each option needs a label that will be translated and an id
 * @param errorMessage errorMessage that will be displayed if not empty
 * @param onChange callback that need to be called on input value change
 * @param value input value
 * @returns autocomplete field containing the options values
 */
const AutocompleteInput = ({
    name,
    label,
    outputTransform = func_identity, //transform materialUi input value before sending it to react hook form, mostly used to deal with select fields that need to return a string
    inputTransform = func_identity, //transform react hook form value before sending it to materialUi input, mostly used to deal with select fields that need to return a string
    options,
    readOnly = false,
    previousValue,
    formProps,
    allowNewValue,
    ...props
}) => {
    const { isFieldRequired } = useFormContext();
    const {
        field: { onChange, value },
        fieldState: { error },
    } = useController({ name });

    return (
        <Autocomplete
            value={inputTransform(value)}
            onChange={(_, data) => onChange(outputTransform(data))}
            //if free input is needed. The resulting object will be : {id: <userInput>}
            {...(allowNewValue && {
                freeSolo: true,
                autoComplete: true,
                blurOnSelect: true,
                clearOnBlur: true,
                onInputChange: (_, data) => {
                    onChange({ id: data });
                },
            })}
            options={options}
            renderInput={({ inputProps, ...rest }) => (
                <TextField
                    label={FieldLabel({
                        label: label,
                        optional: !isFieldRequired(name),
                    })}
                    inputProps={{ ...inputProps, readOnly: readOnly }}
                    {...genHelperPreviousValue(previousValue)}
                    {...genHelperError(error?.message)}
                    {...formProps}
                    {...rest}
                />
            )}
            {...props}
        />
    );
};

AutocompleteInput.propTypes = {
    label: PropTypes.string.isRequired,
    isRequired: PropTypes.bool,
    options: PropTypes.array.isRequired,
    errorMessage: PropTypes.string,
    value: PropTypes.object,
    onChange: PropTypes.func,
};

export default AutocompleteInput;
