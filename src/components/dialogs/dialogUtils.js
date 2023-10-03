/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Grid from '@mui/material/Grid';
import { FormattedMessage } from 'react-intl';
import React, { useState } from 'react';
import { Divider, Slider, Tooltip, Typography } from '@mui/material';
import { Box, styled } from '@mui/system';

export const styles = {
    helperText: {
        margin: 0,
        marginTop: '4px',
    },
    tooltip: {
        fontSize: 18,
        maxWidth: 'none',
    },
    button: (theme) => ({
        justifyContent: 'flex-start',
        fontSize: 'small',
        marginTop: theme.spacing(1),
    }),
    paddingButton: (theme) => ({
        paddingLeft: theme.spacing(2),
    }),
    formDirectoryElements1: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        flexDirection: 'row',
        border: '2px solid lightgray',
        padding: '4px',
        borderRadius: '4px',
        overflow: 'hidden',
    },
    formDirectoryElementsError: (theme) => ({
        borderColor: theme.palette.error.main,
    }),
    formDirectoryElements2: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        flexDirection: 'row',
        marginTop: 0,
        padding: '4px',
        overflow: 'hidden',
    },
    labelDirectoryElements: {
        marginTop: '-10px',
    },
    addDirectoryElements: {
        marginTop: '-5px',
    },
};

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

export const KiloAmpereAdornment = {
    position: 'end',
    text: 'kA',
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
export const KilometerAdornment = {
    position: 'end',
    text: 'km',
};
export const filledTextField = {
    variant: 'filled',
};

export const standardTextField = {
    variant: 'standard',
};

export const italicFontTextField = {
    style: { fontStyle: 'italic' },
};

export const percentageTextField = {
    position: 'end',
    text: '%',
};
export const func_identity = (e) => e;

export function parseIntData(val, defaultValue) {
    const intValue = parseInt(val);
    return isNaN(intValue) ? defaultValue : intValue;
}

export function sanitizeString(val) {
    const trimedValue = val?.trim();
    return trimedValue === '' ? null : trimedValue;
}

export const GridSection = ({
    title,
    heading = '3',
    size = 12,
    customStyle = {},
}) => {
    const CustomTag = styled(`h${heading}`)(customStyle);
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

export const LabelledSlider = ({
    value,
    label,
    disabled,
    onCommitCallback,
    marks,
    minValue = 0,
    maxValue = 100,
}) => {
    const [sliderValue, setSliderValue] = useState(value);

    const handleValueChanged = (event, newValue) => {
        setSliderValue(newValue);
    };

    return (
        <>
            <Grid item xs={7}>
                <Typography component="span" variant="body1">
                    <Box fontWeight="fontWeightBold" m={1}>
                        <FormattedMessage id={label} />
                    </Box>
                </Typography>
            </Grid>
            <Grid item container xs={5}>
                <Slider
                    min={minValue}
                    max={maxValue}
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
