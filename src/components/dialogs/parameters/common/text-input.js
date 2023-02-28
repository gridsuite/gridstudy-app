/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useStyles } from '../parameters-styles';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Box,
    Grid,
    InputAdornment,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { FormattedMessage } from 'react-intl';
import InfoIcon from '@mui/icons-material/Info';

const TextInput = ({ value, label, callback, validator }) => {
    const classes = useStyles();
    const [initialValue] = useState(value);
    const [controlledValue, setControlledValue] = useState(value);
    const handleCallback = useCallback(
        (event) => {
            const value = event.target.value;
            setControlledValue(value);
            if (validator.isValid(value)) {
                callback(event);
            }
        },
        [callback]
    );

    // used to reset the initial value from an outside button
    useEffect(() => {
        if (value === initialValue) {
            setControlledValue(initialValue);
        }
    }, [value]);

    return (
        <>
            <Grid item xs={8}>
                <Typography component="span" variant="body1">
                    <Box fontWeight="fontWeightBold" m={1}>
                        <FormattedMessage id={label} />
                    </Box>
                </Typography>
            </Grid>
            <Grid item container xs={4} className={classes.controlItem}>
                <TextField
                    size={'small'}
                    onChange={handleCallback}
                    value={controlledValue}
                    error={!validator.isValid(controlledValue)}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <div
                                    style={{
                                        visibility: validator.isValid(
                                            controlledValue
                                        )
                                            ? 'hidden'
                                            : 'visible',
                                    }}
                                >
                                    <Tooltip title={validator.errorMessage}>
                                        <InfoIcon />
                                    </Tooltip>
                                </div>
                            </InputAdornment>
                        ),
                    }}
                />
            </Grid>
        </>
    );
};

export default TextInput;
