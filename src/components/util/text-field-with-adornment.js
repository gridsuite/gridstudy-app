/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import ClearIcon from '@mui/icons-material/Clear';
import { TextField } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
    inputRight: {
        textAlign: 'end',
    },
    inputLeft: {
        textAlign: 'start',
    },
    adornRightFilled: {
        alignItems: 'start',
        marginBottom: '0.4em',
    },
    adornRightOther: {
        marginBottom: '0.2em',
    },
}));

const TextFieldWithAdornment = (props) => {
    const classes = useStyles();
    const {
        adornmentPosition,
        adornmentText,
        value,
        variant,
        clearable,
        handleClearValue,
        ...otherProps
    } = props;
    const [isFocused, setIsFocused] = useState(false);

    const withEndAdornmentText = value
        ? {
              startAdornment: clearable && (
                  <InputAdornment position="start">
                      <IconButton onClick={handleClearValue}>
                          <ClearIcon />
                      </IconButton>
                  </InputAdornment>
              ),
              endAdornment: isFocused && (
                  <InputAdornment position="end">
                      {adornmentText}
                  </InputAdornment>
              ),
              classes: { input: classes.inputRight },
          }
        : {};

    const withStartAdornmentText = value
        ? {
              startAdornment: isFocused && (
                  <InputAdornment position="start">
                      {adornmentText}
                  </InputAdornment>
              ),
              endAdornment: clearable && (
                  <InputAdornment position="end">
                      <IconButton onClick={handleClearValue}>
                          <ClearIcon />
                      </IconButton>
                  </InputAdornment>
              ),
              classes: { input: classes.inputLeft },
          }
        : {};

    return (
        <TextField
            {...otherProps}
            variant={variant}
            value={value}
            InputProps={
                adornmentPosition === 'start'
                    ? withStartAdornmentText
                    : withEndAdornmentText
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
