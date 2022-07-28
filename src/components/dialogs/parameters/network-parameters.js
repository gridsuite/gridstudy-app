/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid, MenuItem, Box, Select, Typography } from '@mui/material';
import { PARAM_FLUX_CONVENTION } from '../../../utils/config-params';
import {
    CloseButton,
    LabelledButton,
    useParameterState,
    useStyles,
} from './parameters';
import { fetchDefaultParametersValues } from '../../../utils/rest-api';
export const FluxConventions = {
    IIDM: 'iidm',
    TARGET: 'target',
};

export const NetworkParameters = ({ hideParameters }) => {
    const classes = useStyles();
    const [fluxConventionLocal, handleChangeFluxConvention] = useParameterState(
        PARAM_FLUX_CONVENTION
    );

    const resetNetworkParameters = () => {
        fetchDefaultParametersValues().then((defaultValues) => {
            const defaultFluxConvention = defaultValues.fluxConvention;
            if (
                Object.values(FluxConventions).includes(defaultFluxConvention)
            ) {
                handleChangeFluxConvention(defaultFluxConvention);
            }
        });
    };

    return (
        <Grid container spacing={1} className={classes.grid}>
            <Grid item container spacing={1}>
                <Grid item xs={8}>
                    <Typography component="span" variant="body1">
                        <Box fontWeight="fontWeightBold" m={1}>
                            <FormattedMessage id="FluxConvention" />
                        </Box>
                    </Typography>
                </Grid>
                <Grid item container xs={4} className={classes.controlItem}>
                    <Select
                        size="small"
                        labelId="flux-convention-select-label"
                        value={fluxConventionLocal}
                        onChange={(event) => {
                            handleChangeFluxConvention(event.target.value);
                        }}
                    >
                        <MenuItem value={FluxConventions.IIDM}>
                            <FormattedMessage id="FluxConvention.iidm" />
                        </MenuItem>
                        <MenuItem value={FluxConventions.TARGET}>
                            <FormattedMessage id="FluxConvention.target" />
                        </MenuItem>
                    </Select>
                </Grid>
                <Grid
                    container
                    className={
                        classes.controlItem + ' ' + classes.marginTopButton
                    }
                    maxWidth="md"
                >
                    <LabelledButton
                        callback={resetNetworkParameters}
                        label="resetToDefault"
                    />
                    <CloseButton
                        hideParameters={hideParameters}
                        className={classes.button}
                    />
                </Grid>
            </Grid>
        </Grid>
    );
};
