import React, { useState, useEffect } from 'react';

import { FormattedMessage } from 'react-intl';

import {
    Grid,
    MenuItem,
    Box,
    Select,
    Switch,
    Typography,
    Slider,
} from '@mui/material';

import { LineFlowMode } from '../network/line-layer';
import { LineFlowColorMode } from '../network/line-layer';
import {
    PARAM_LINE_FLOW_ALERT_THRESHOLD,
    PARAM_LINE_FLOW_COLOR_MODE,
    PARAM_LINE_FLOW_MODE,
    PARAM_LINE_FULL_PATH,
    PARAM_DISPLAY_OVERLOAD_TABLE,
    PARAM_LINE_PARALLEL_PATH,
} from '../../utils/config-params';
import { useParameterState } from './parameters';
import { MakeLineSeparator } from './make-line-separator';
import { useStyles } from './parameters';

export const MapParameters = () => {
    const classes = useStyles();

    const [lineFullPathLocal, handleChangeLineFullPath] =
        useParameterState(PARAM_LINE_FULL_PATH);

    const [lineParallelPathLocal, handleChangeLineParallelPath] =
        useParameterState(PARAM_LINE_PARALLEL_PATH);

    const [lineFlowModeLocal, handleChangeLineFlowMode] =
        useParameterState(PARAM_LINE_FLOW_MODE);

    const [lineFlowColorModeLocal, handleChangeLineFlowColorMode] =
        useParameterState(PARAM_LINE_FLOW_COLOR_MODE);

    const [lineFlowAlertThresholdLocal, handleChangeLineFlowAlertThreshold] =
        useParameterState(PARAM_LINE_FLOW_ALERT_THRESHOLD);

    const [displayOverloadTableLocal, handleChangeDisplayOverloadTable] =
        useParameterState(PARAM_DISPLAY_OVERLOAD_TABLE);

    const [disabledFlowAlertThreshold, setDisabledFlowAlertThreshold] =
        useState(
            lineFlowColorModeLocal === 'nominalVoltage' &&
                !displayOverloadTableLocal
        );

    const alertThresholdMarks = [
        {
            value: 0,
            label: '0',
        },
        {
            value: 100,
            label: '100',
        },
    ];

    useEffect(() => {
        setDisabledFlowAlertThreshold(
            lineFlowColorModeLocal === 'nominalVoltage' &&
                !displayOverloadTableLocal
        );
    }, [lineFlowColorModeLocal, displayOverloadTableLocal]);

    function MakeSlider(
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

    function MakeSwitch(prop, label, callback) {
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
                    <Switch
                        checked={prop}
                        onChange={callback}
                        value={prop}
                        inputProps={{ 'aria-label': 'primary checkbox' }}
                    />
                </Grid>
            </>
        );
    }
    return (
        <Grid container spacing={1} className={classes.grid}>
            {MakeSwitch(lineFullPathLocal, 'lineFullPath', () => {
                handleChangeLineFullPath(!lineFullPathLocal);
            })}
            <MakeLineSeparator />
            {MakeSwitch(lineParallelPathLocal, 'lineParallelPath', () => {
                handleChangeLineParallelPath(!lineParallelPathLocal);
            })}
            <MakeLineSeparator />
            <Grid item xs={8}>
                <Typography component="span" variant="body1">
                    <Box fontWeight="fontWeightBold" m={1}>
                        <FormattedMessage id="LineFlowMode" />
                    </Box>
                </Typography>
            </Grid>
            <Grid item container xs={4} className={classes.controlItem}>
                <Select
                    size="small"
                    labelId="line-flow-mode-select-label"
                    value={lineFlowModeLocal}
                    onChange={(event) => {
                        handleChangeLineFlowMode(event.target.value);
                    }}
                >
                    <MenuItem value={LineFlowMode.STATIC_ARROWS}>
                        <FormattedMessage id="StaticArrows" />
                    </MenuItem>
                    <MenuItem value={LineFlowMode.ANIMATED_ARROWS}>
                        <FormattedMessage id="AnimatedArrows" />
                    </MenuItem>
                    <MenuItem value={LineFlowMode.FEEDERS}>
                        <FormattedMessage id="Feeders" />
                    </MenuItem>
                </Select>
            </Grid>
            <MakeLineSeparator />
            <Grid item xs={8}>
                <Typography component="span" variant="body1">
                    <Box fontWeight="fontWeightBold" m={1}>
                        <FormattedMessage id="LineFlowColorMode" />
                    </Box>
                </Typography>
            </Grid>
            <Grid item container xs={4} className={classes.controlItem}>
                <Select
                    size="small"
                    labelId="line-flow-color-mode-select-label"
                    value={lineFlowColorModeLocal}
                    onChange={(event) => {
                        handleChangeLineFlowColorMode(event.target.value);
                    }}
                >
                    <MenuItem value={LineFlowColorMode.NOMINAL_VOLTAGE}>
                        <FormattedMessage id="NominalVoltage" />
                    </MenuItem>
                    <MenuItem value={LineFlowColorMode.OVERLOADS}>
                        <FormattedMessage id="Overloads" />
                    </MenuItem>
                </Select>
            </Grid>
            <MakeLineSeparator />
            {MakeSlider(
                Number(lineFlowAlertThresholdLocal),
                'AlertThresholdLabel',
                disabledFlowAlertThreshold,
                (event, value) => {
                    handleChangeLineFlowAlertThreshold(value);
                },
                alertThresholdMarks
            )}
            <MakeLineSeparator />
            {MakeSwitch(
                displayOverloadTableLocal,
                'displayOverloadTable',
                () => {
                    handleChangeDisplayOverloadTable(
                        !displayOverloadTableLocal
                    );
                }
            )}
        </Grid>
    );
};
