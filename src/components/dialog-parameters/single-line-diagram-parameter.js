/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { useEffect, useState } from 'react';

import { FormattedMessage } from 'react-intl';

import { Grid, MenuItem, Box, Select, Typography } from '@mui/material';

import { getAvailableComponentLibraries } from '../../utils/rest-api';
import { SubstationLayout } from '../diagrams/singleLineDiagram/single-line-diagram';
import {
    PARAM_CENTER_LABEL,
    PARAM_DIAGONAL_LABEL,
    PARAM_SUBSTATION_LAYOUT,
    PARAM_COMPONENT_LIBRARY,
} from '../../utils/config-params';
import { LabelledSwitch, useParameterState } from './parameters';
import { LineSeparator } from './line-separator';
import { useStyles } from './parameters';

export const SingleLineDiagramParameters = ({ user }) => {
    const classes = useStyles();

    const [diagonalLabelLocal, handleChangeDiagonalLabel] =
        useParameterState(PARAM_DIAGONAL_LABEL);
    const [centerLabelLocal, handleChangeCenterLabel] =
        useParameterState(PARAM_CENTER_LABEL);
    const [substationLayoutLocal, handleChangeSubstationLayout] =
        useParameterState(PARAM_SUBSTATION_LAYOUT);
    const [componentLibraryLocal, handleChangeComponentLibrary] =
        useParameterState(PARAM_COMPONENT_LIBRARY);
    const [componentLibraries, setComponentLibraries] = useState([]);
    useEffect(() => {
        if (user !== null) {
            getAvailableComponentLibraries().then((libraries) => {
                setComponentLibraries(libraries);
            });
        }
    }, [user]);

    return (
        <Grid container spacing={1} className={classes.grid}>
            {LabelledSwitch(diagonalLabelLocal, 'diagonalLabel', () => {
                handleChangeDiagonalLabel(!diagonalLabelLocal);
            })}
            <LineSeparator />
            {LabelledSwitch(centerLabelLocal, 'centerLabel', () => {
                handleChangeCenterLabel(!centerLabelLocal);
            })}
            <LineSeparator />
            <Grid item xs={8}>
                <Typography component="span" variant="body1">
                    <Box fontWeight="fontWeightBold" m={1}>
                        <FormattedMessage id="SubstationLayout" />
                    </Box>
                </Typography>
            </Grid>
            <Grid item container xs={4} className={classes.controlItem}>
                <Select
                    size="small"
                    labelId="substation-layout-select-label"
                    value={substationLayoutLocal}
                    onChange={(event) => {
                        handleChangeSubstationLayout(event.target.value);
                    }}
                >
                    <MenuItem value={SubstationLayout.HORIZONTAL}>
                        <FormattedMessage id="HorizontalSubstationLayout" />
                    </MenuItem>
                    <MenuItem value={SubstationLayout.VERTICAL}>
                        <FormattedMessage id="VerticalSubstationLayout" />
                    </MenuItem>
                    <MenuItem value={SubstationLayout.SMART}>
                        <FormattedMessage id="SmartSubstationLayout" />
                    </MenuItem>
                    <MenuItem
                        value={SubstationLayout.SMARTHORIZONTALCOMPACTION}
                    >
                        <FormattedMessage id="SmartWithHorizontalCompactionSubstationLayout" />
                    </MenuItem>
                    <MenuItem value={SubstationLayout.SMARTVERTICALCOMPACTION}>
                        <FormattedMessage id="SmartWithVerticalCompactionSubstationLayout" />
                    </MenuItem>
                </Select>
            </Grid>

            <LineSeparator />

            <Grid item xs={8}>
                <Typography component="span" variant="body1">
                    <Box fontWeight="fontWeightBold" m={1}>
                        <FormattedMessage id="ComponentLibrary" />
                    </Box>
                </Typography>
            </Grid>
            <Grid item container xs={4} className={classes.controlItem}>
                <Select
                    size="small"
                    labelId="component-library-select-label"
                    value={
                        componentLibraryLocal !== null
                            ? componentLibraryLocal
                            : componentLibraries[0]
                    }
                    onChange={(event) => {
                        handleChangeComponentLibrary(event.target.value);
                    }}
                >
                    {componentLibraries.map((library) => {
                        return (
                            <MenuItem key={library} value={library}>
                                {library}
                            </MenuItem>
                        );
                    })}
                </Select>
            </Grid>
        </Grid>
    );
};
