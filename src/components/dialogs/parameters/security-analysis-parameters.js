/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback } from 'react';
import { Grid } from '@mui/material';
import { LineSeparator } from '../dialogUtils';
import { CloseButton } from './common/close-button';
import { DropDown } from './common/drop-down';
import { LabelledButton } from './common/labelled-button';
import { useStyles } from './parameters-styles';

export const SecurityAnalysisParameters = ({
    hideParameters,
    parametersBackend,
}) => {
    const classes = useStyles();

    const [providers, provider, updateProvider, resetProvider] =
        parametersBackend;

    const handleUpdateProvider = (evt) => updateProvider(evt.target.value);

    const updateProviderCallback = useCallback(handleUpdateProvider, [
        updateProvider,
    ]);

    return (
        <Grid container className={classes.grid}>
            <Grid container key="secuAnalysisProvider">
                <DropDown
                    value={provider}
                    label="Provider"
                    values={providers}
                    callback={updateProviderCallback}
                />

                <Grid container paddingTop={1}>
                    <LineSeparator />
                </Grid>

                <Grid
                    container
                    className={
                        classes.controlItem + ' ' + classes.marginTopButton
                    }
                    maxWidth="md"
                >
                    <LabelledButton
                        callback={resetProvider}
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
