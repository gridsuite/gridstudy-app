import { Box, Grid, Slider, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import React, { useState } from 'react';
import { useStyles } from './parameters';

export function MakeSlider(
    threshold,
    label,
    disabled,
    onCommitCallback,
    thresholdMarks
) {
    const [sliderValue, setSliderValue] = useState(threshold);

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
                    marks={thresholdMarks}
                />
            </Grid>
        </>
    );
}
