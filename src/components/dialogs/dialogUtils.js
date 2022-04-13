/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import makeStyles from '@mui/styles/makeStyles';
import Grid from '@mui/material/Grid';
import { FormattedMessage } from 'react-intl';
import React from 'react';

export const useStyles = makeStyles((theme) => ({
    helperText: {
        margin: 0,
        marginTop: 4,
    },
    h4: {
        marginBottom: 0,
    },
    popper: {
        style: {
            width: 'fit-content',
        },
    },
    tooltip: {
        fontSize: 18,
        maxWidth: 'none',
    },
    button: {
        justifyContent: 'flex-start',
        fontSize: 'small',
        marginTop: theme.spacing(1),
    },
}));

export const SusceptanceAdornment = {
    position: 'end',
    text: 'S',
};
export const OhmAdornment = {
    position: 'end',
    text: 'Ω',
};
export const AmpereAdornment = {
    position: 'end',
    text: 'A',
};
export const ActivePowerAdornment = {
    position: 'end',
    text: 'MW',
};
export const ReactivePowerAdornment = {
    position: 'end',
    text: 'MVar',
};
export const VoltageAdornment = {
    position: 'end',
    text: 'kV',
};
export const filledTextField = {
    variant: 'filled',
};
export const func_identity = (e) => e;

export function toIntValue(val) {
    if (val === '-') return val;
    return parseInt(val) || 0;
}

export function toPositiveIntValue(val) {
    val.replace('-', '');
    return parseInt(val) || 0;
}

export const toFloatValue = (val) => {
    if (val === '-') return val;
    // TODO: remove replace when parsing behaviour will be made according to locale
    // Replace ',' by '.' to ensure double values can be parsed correctly
    const tmp = val?.replace(',', '.') || '';
    if (tmp.endsWith('.') || tmp.endsWith('0')) return val;
    return parseFloat(tmp) || 0;
};

export const GridSection = ({ title, size = 12 }) => {
    const classes = useStyles();
    return (
        <Grid container spacing={2}>
            <Grid item xs={size}>
                <h3 className={classes.h3}>
                    <FormattedMessage id={title} />
                </h3>
            </Grid>
        </Grid>
    );
};

export const gridItem = (field, size = 6) => {
    return (
        <Grid item xs={size} align={'start'}>
            {field}
        </Grid>
    );
};
