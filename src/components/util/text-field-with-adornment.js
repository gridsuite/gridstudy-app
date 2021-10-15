/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { TextField } from '@material-ui/core';
import InputAdornment from '@material-ui/core/InputAdornment';
import React, { useState } from 'react';
import PropTypes from 'prop-types';

const TextFieldWithAdornment = (props) => {
    const [isFocused, setIsFocused] = useState(false);

    const endAdornment =
        isFocused || props.value
            ? {
                  endAdornment: (
                      <InputAdornment position="end">
                          {props.adornmentText}
                      </InputAdornment>
                  ),
              }
            : {};

    const startAdornment =
        isFocused || props.value
            ? {
                  startAdornment: (
                      <InputAdornment position="start">
                          {props.adornmentText}
                      </InputAdornment>
                  ),
              }
            : {};

    return (
        <TextField
            {...props}
            InputProps={
                props.adornmentPosition === 'start'
                    ? startAdornment
                    : endAdornment
            }
            onFocus={(e) => setIsFocused(true)}
            onBlur={(e) => setIsFocused(false)}
        />
    );
};

TextFieldWithAdornment.propTypes = {
    adornmentPosition: PropTypes.string.isRequired,
    adornmentText: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
};

export default TextFieldWithAdornment;
