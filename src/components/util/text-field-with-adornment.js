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
import React, { useCallback, useState } from 'react';
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

    const getClearAdornment = useCallback(
        (position) => {
            return (
                <InputAdornment position={position}>
                    <IconButton onClick={handleClearValue}>
                        <ClearIcon />
                    </IconButton>
                </InputAdornment>
            );
        },
        [handleClearValue]
    );

    const getTextAdornment = useCallback(
        (position) => {
            return (
                <InputAdornment position={position}>
                    {adornmentText}
                </InputAdornment>
            );
        },
        [adornmentText]
    );

    const withEndAdornmentText = value
        ? {
              startAdornment: clearable && getClearAdornment('start'),
              endAdornment: isFocused && getTextAdornment('end'),
              classes: { input: classes.inputRight },
          }
        : {};

    const withStartAdornmentText = value
        ? {
              startAdornment: isFocused && getTextAdornment('start'),
              endAdornment: clearable && getClearAdornment('end'),
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
