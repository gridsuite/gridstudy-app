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
import { LineSeparator } from '../dialogUtils';
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
                    <Grid
                        container
                        className={classes.controlItem}
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
                <LineSeparator />{' '}
            </Grid>
        </Grid>
    );
};
