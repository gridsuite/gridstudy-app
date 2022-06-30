import React from 'react';

import { FormattedMessage } from 'react-intl';

import { Grid, MenuItem, Box, Select, Typography } from '@mui/material';

import { LineSeparator } from './line-separator';
import { PARAM_FLUX_CONVENTION } from '../../../utils/config-params';
import { useParameterState, useStyles } from './parameters';
export const FluxConventions = {
    IIDM: 'iidm',
    TARGET: 'target',
};

export const NetworkParameters = () => {
    const classes = useStyles();
    const [fluxConventionLocal, handleChangeFluxConvention] = useParameterState(
        PARAM_FLUX_CONVENTION
    );

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
                <LineSeparator />
            </Grid>
        </Grid>
    );
};
