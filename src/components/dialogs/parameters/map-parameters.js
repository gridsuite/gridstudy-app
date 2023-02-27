/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid, MenuItem, Box, Select, Typography } from '@mui/material';
import { LineFlowMode } from '../../network/line-layer';
import { LineFlowColorMode } from '../../network/line-layer';
import {
    PARAM_LINE_FLOW_ALERT_THRESHOLD,
    PARAM_LINE_FLOW_COLOR_MODE,
    PARAM_LINE_FLOW_MODE,
    PARAM_LINE_FULL_PATH,
    PARAM_DISPLAY_OVERLOAD_TABLE,
    PARAM_LINE_PARALLEL_PATH,
    PARAM_MAP_MANUAL_REFRESH,
} from '../../../utils/config-params';
import { CloseButton, SwitchWithLabel, useParameterState } from './parameters';
import { useStyles } from './parameters';
import { LabelledSilder, LineSeparator } from '../dialogUtils';

export const MapParameters = ({ hideParameters }) => {
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

    const [mapManualRefreshLocal, handleChangeMapManualRefresh] =
        useParameterState(PARAM_MAP_MANUAL_REFRESH);

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
        <>
            <Grid container spacing={1} classes={classes.scrollableGrid}>
                <SwitchWithLabel
                    value={lineFullPathLocal}
                    label="lineFullPath"
                    callback={() => {
                        handleChangeLineFullPath(!lineFullPathLocal);
                    }}
                />
                <LineSeparator />
                <SwitchWithLabel
                    value={lineParallelPathLocal}
                    label="lineParallelPath"
                    callback={() => {
                        handleChangeLineParallelPath(!lineParallelPathLocal);
                    }}
                />
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
                <LabelledSilder
                    value={Number(lineFlowAlertThresholdLocal)}
                    label="AlertThresholdLabel"
                    disabled={disabledFlowAlertThreshold}
                    onCommitCallback={(event, value) => {
                        handleChangeLineFlowAlertThreshold(value);
                    }}
                    marks={alertThresholdMarks}
                />
                <LineSeparator />
                <SwitchWithLabel
                    value={displayOverloadTableLocal}
                    label="displayOverloadTable"
                    callback={() => {
                        handleChangeDisplayOverloadTable(
                            !displayOverloadTableLocal
                        );
                    }}
                />
                <LineSeparator />
                <SwitchWithLabel
                    value={mapManualRefreshLocal}
                    label="MapManualRefresh"
                    callback={() => {
                        handleChangeMapManualRefresh(!mapManualRefreshLocal);
                    }}
                />
            </Grid>
            <Grid
                container
                className={classes.controlItem + ' ' + classes.marginTopButton}
                maxWidth="md"
            >
                <CloseButton
                    hideParameters={hideParameters}
                    classeStyleName={classes.button}
                />
            </Grid>
        </>
    );
};
