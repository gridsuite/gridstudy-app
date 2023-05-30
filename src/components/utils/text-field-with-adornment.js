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
        marginBottom: '0.3em',
    },
}));

const TextFieldWithAdornment = (props) => {
    const classes = useStyles();
    const {
        adornmentPosition,
        adornmentText,
        value,
        variant,
        handleClearValue,
        ...otherProps
    } = props;
    const [isFocused, setIsFocused] = useState(false);

    const getAdornmentClassName = useCallback(
        (variant) => {
            if (variant === 'filled') {
                return classes.adornRightFilled;
            }
            if (variant === 'standard') {
                return classes.adornRightOther;
            }
            return null;
        },
        [classes.adornRightFilled, classes.adornRightOther]
    );

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
                <InputAdornment
                    position={position}
                    className={getAdornmentClassName(variant)}
                >
                    {adornmentText}
                </InputAdornment>
            );
        },
        [adornmentText, variant, getAdornmentClassName]
    );

    const withEndAdornmentText = useCallback(() => {
        return value !== '' || isFocused
            ? {
                  startAdornment:
                      value && handleClearValue
                          ? getClearAdornment('start')
                          : undefined,
                  endAdornment: getTextAdornment('end'),
                  classes: { input: classes.inputRight },
              }
            : {};
    }, [
        value,
        handleClearValue,
        getClearAdornment,
        isFocused,
        getTextAdornment,
        classes.inputRight,
    ]);

    const withStartAdornmentText = useCallback(() => {
        return value !== '' || isFocused
            ? {
                  startAdornment: getTextAdornment('start'),
                  endAdornment:
                      value && handleClearValue && getClearAdornment('end'),
                  classes: { input: classes.inputLeft },
              }
            : {};
    }, [
        value,
        handleClearValue,
        getClearAdornment,
        isFocused,
        getTextAdornment,
        classes,
    ]);

    return (
        <TextField
            {...otherProps}
            variant={variant}
            value={value}
            InputProps={
                adornmentPosition === 'start'
                    ? withStartAdornmentText()
                    : withEndAdornmentText()
            }
            onFocus={(e) => setIsFocused(true)}
            onBlur={(e) => setIsFocused(false)}
        />
    );
};

TextFieldWithAdornment.propTypes = {
    adornmentPosition: PropTypes.string.isRequired,
    adornmentText: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default TextFieldWithAdornment;
