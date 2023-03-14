/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
import { useStyles } from '../parameters';

const TextInput = ({ value, label, callback, validator }) => {
    const classes = useStyles();
    const [textValue, setTextValue] = useState(value);
    const handleCallback = useCallback(
        (event) => {
            const value = event.target.value;
            setTextValue(value);
            if (validator.isValid(value)) {
                callback(event);
            }
        },
        [callback, validator]
    );

    // to reset the default value when click on 'Default Values' button
    useEffect(() => {
        setTextValue(value);
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
                    value={textValue}
                    error={!validator.isValid(textValue)}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <div
                                    style={{
                                        visibility: validator.isValid(textValue)
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
