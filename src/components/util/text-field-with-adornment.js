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
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    inputRight: {
        textAlign: 'end',
    },
    inputLeft: {
        textAlign: 'start',
    },
}));

const TextFieldWithAdornment = (props) => {
    const classes = useStyles();
    const { adornmentPosition, adornmentText, value, variant, ...otherProps } =
        props;
    const [isFocused, setIsFocused] = useState(false);

    console.log('variant:' + props['variant']);

    const endAdornment =
        isFocused || value
            ? {
                  endAdornment: (
                      <InputAdornment
                          position="end"
                          // hack to circumviate centering of adornment
                          // when TextField has variant 'filled' with 'end' position
                          sx={{
                              alignItems:
                                  variant === 'filled' ? 'start' : 'end',
                          }}
                      >
                          {adornmentText}
                      </InputAdornment>
                  ),
                  classes: { input: classes.inputRight },
              }
            : {};

    const startAdornment =
        isFocused || value
            ? {
                  startAdornment: (
                      <InputAdornment position="start">
                          {adornmentText}
                      </InputAdornment>
                  ),
                  classes: { input: classes.inputLeft },
              }
            : {};

    return (
        <TextField
            {...otherProps}
            value={value}
            InputProps={
                adornmentPosition === 'start' ? startAdornment : endAdornment
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
