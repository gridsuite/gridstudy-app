/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Box, Grid, MenuItem, Select, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import React from 'react';
import { useStyles } from '../parameters-styles';

export const DropDown = ({ value, label, values, callback, renderValue }) => {
    const classes = useStyles();
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
                <Select
                    labelId={label}
                    value={value}
                    onChange={callback}
                    size="small"
                >
                    {Object.entries(values).map(([key, value]) => (
                        <MenuItem key={key} value={key}>
                            {renderValue ? (
                                renderValue(value)
                            ) : (
                                <FormattedMessage id={value} />
                            )}
                        </MenuItem>
                    ))}
                </Select>
            </Grid>
        </>
    );
};
