import React, { useState, useEffect } from 'react';

import { FormattedMessage } from 'react-intl';

import { Grid, MenuItem, Box, Select, Typography } from '@mui/material';

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
import { LabelledSwitch, useParameterState } from './parameters';
import { LineSeparator } from './make-line-separator';
import { useStyles } from './parameters';
import { LabelledSilder } from './make-slider';

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

    return (
        <Grid container spacing={1} className={classes.grid}>
            {LabelledSwitch(lineFullPathLocal, 'lineFullPath', () => {
                handleChangeLineFullPath(!lineFullPathLocal);
            })}
            <LineSeparator />
            {LabelledSwitch(lineParallelPathLocal, 'lineParallelPath', () => {
                handleChangeLineParallelPath(!lineParallelPathLocal);
            })}
            <LineSeparator />
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
            <LineSeparator />
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
            <LineSeparator />
            {LabelledSilder(
                Number(lineFlowAlertThresholdLocal),
                'AlertThresholdLabel',
                disabledFlowAlertThreshold,
                (event, value) => {
                    handleChangeLineFlowAlertThreshold(value);
                },
                alertThresholdMarks
            )}
            <LineSeparator />
            {LabelledSwitch(
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
