/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import makeStyles from '@mui/styles/makeStyles';
import Grid from '@mui/material/Grid';
import { FormattedMessage } from 'react-intl';
import React, { useState } from 'react';
import { Divider, Slider, Tooltip, Typography } from '@mui/material';
import { Box } from '@mui/system';

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
    emptyListError: {
        color: theme.palette.error.main,
        fontSize: 'small',
        textAlign: 'center',
        margin: theme.spacing(0.5),
    },
    formDirectoryElements1: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        flexDirection: 'row',
        border: '2px solid lightgray',
        padding: 4,
        borderRadius: '4px',
        overflow: 'hidden',
    },
    formDirectoryElementsError: {
        borderColor: theme.palette.error.main,
    },
    formDirectoryElements2: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        flexDirection: 'row',
        marginTop: 0,
        padding: 4,
        overflow: 'hidden',
    },
    labelDirectoryElements: {
        marginTop: -10,
    },
    addDirectoryElements: {
        marginTop: -5,
    },
}));

export const MicroSusceptanceAdornment = {
    position: 'end',
    text: 'µS',
};

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
export const MVAPowerAdornment = {
    position: 'end',
    text: 'MVA',
};
export const VoltageAdornment = {
    position: 'end',
    text: 'kV',
};
export const filledTextField = {
    variant: 'filled',
};
export const percentageTextField = {
    position: 'end',
    text: '%',
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

export function toIntOrEmptyValue(val) {
    if (val === '-') return val;
    if (val === '0') return 0;
    return parseInt(val) || '';
}

export function sanitizeString(val) {
    return val.trim() === '' ? null : val.trim();
}

export const toFloatValue = (val) => {
    if (val === '-') return val;
    if (val === '') return '';
    // TODO: remove replace when parsing behaviour will be made according to locale
    // Replace ',' by '.' to ensure double values can be parsed correctly
    const tmp = val?.replace(',', '.') || '';
    if (tmp.endsWith('.') || tmp.endsWith('0')) return val;
    return parseFloat(tmp) || 0;
};

export const removeNullDataValues = (data) => {
    Object.keys(data).forEach((key) => {
        if (data[key] === null) {
            delete data[key];
        }
    });
};

export const GridSection = ({ title, heading = '3', size = 12 }) => {
    const CustomTag = `h${heading}`;
    return (
        <Grid container spacing={2}>
            <Grid item xs={size}>
                <CustomTag>
                    <FormattedMessage id={title} />
                </CustomTag>
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

export const gridItemWithTooltip = (field, tooltip = '', size = 6) => {
    return (
        <Grid item xs={size} align={'start'}>
            <Tooltip title={tooltip}>{field}</Tooltip>
        </Grid>
    );
};

export const gridItemWithErrorMsg = (
    field,
    size = 6,
    error,
    errorClassName
) => {
    return (
        <Grid item xs={size} align={'start'}>
            {field}
            {error && (
                <div className={errorClassName}>
                    <FormattedMessage id={error} />
                </div>
            )}
        </Grid>
    );
};

export const getId = (e) => e?.id;
export const getIdOrSelf = (e) => e?.id ?? e;

export const compareById = (a, b) => a?.id?.localeCompare(b?.id);

export function LineSeparator() {
    return (
        <Grid item xs={12}>
            <Divider />
        </Grid>
    );
}

export const LabelledSilder = ({
    value,
    label,
    disabled,
    onCommitCallback,
    marks,
}) => {
    const [sliderValue, setSliderValue] = useState(value);

    const handleValueChanged = (event, newValue) => {
        setSliderValue(newValue);
    };

    const classes = useStyles();

    return (
        <>
            <Grid item xs={7}>
                <Typography component="span" variant="body1">
                    <Box fontWeight="fontWeightBold" m={1}>
                        <FormattedMessage id={label} />
                    </Box>
                </Typography>
            </Grid>
            <Grid item container xs={5} className={classes.controlItem}>
                <Slider
                    min={0}
                    max={100}
                    valueLabelDisplay="auto"
                    onChange={handleValueChanged}
                    onChangeCommitted={onCommitCallback}
                    value={sliderValue}
                    disabled={disabled}
                    marks={marks}
                />
            </Grid>
        </>
    );
};
