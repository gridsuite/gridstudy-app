/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormattedMessage } from 'react-intl';
import { Box, Grid, MenuItem, Select, Typography } from '@mui/material';
import {
    PARAM_DEVELOPER_MODE,
    PARAM_FLUX_CONVENTION,
} from '../../../utils/config-params';
import {
    CloseButton,
    LabelledButton,
    SwitchWithLabel,
    useParameterState,
    useStyles,
} from './parameters';
import { LineSeparator } from '../dialogUtils';
import Alert from '@mui/material/Alert';
import { fetchDefaultParametersValues } from '../../../services/utils';

export const FluxConventions = {
    IIDM: 'iidm',
    TARGET: 'target',
};

export const NetworkParameters = ({ hideParameters }) => {
    const classes = useStyles();
    const [fluxConventionLocal, handleChangeFluxConvention] = useParameterState(
        PARAM_FLUX_CONVENTION
    );

    const [enableDeveloperMode, handleChangeEnableDeveloperMode] =
        useParameterState(PARAM_DEVELOPER_MODE);

    const resetNetworkParameters = () => {
        fetchDefaultParametersValues().then((defaultValues) => {
            const defaultFluxConvention = defaultValues.fluxConvention;
            if (
                Object.values(FluxConventions).includes(defaultFluxConvention)
            ) {
                handleChangeFluxConvention(defaultFluxConvention);
            }

            handleChangeEnableDeveloperMode(
                defaultValues?.enableDeveloperMode ?? false
            );
        });
    };

    return (
        <>
            <Grid
                container
                spacing={1}
                key={'networkParameters'}
                className={classes.scrollableGrid}
            >
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
                <Grid item container xs={12}>
                    <SwitchWithLabel
                        label="EnableDeveloperMode"
                        value={enableDeveloperMode}
                        callback={() => {
                            handleChangeEnableDeveloperMode(
                                !enableDeveloperMode
                            );
                        }}
                    />
                    {enableDeveloperMode && (
                        <Alert severity={'warning'}>
                            <FormattedMessage id="DeveloperModeWarningMsg" />
                        </Alert>
                    )}
                </Grid>
            </Grid>
            <LineSeparator />
            <Grid
                container
                className={classes.controlItem + ' ' + classes.marginTopButton}
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
        </>
    );
};
