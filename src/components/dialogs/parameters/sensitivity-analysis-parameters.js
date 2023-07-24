/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback } from 'react';
import { Grid } from '@mui/material';
import { CloseButton, DropDown, LabelledButton, useStyles } from './parameters';
import { LineSeparator } from '../dialogUtils';
import { TYPES, makeComponentsFor } from './util/make-component-utils';

export const SensitivityAnalysisParameters = ({
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

    const sensiParams = {
        flowFlowSensitivityValueThreshold: {
            type: TYPES.double,
            description: 'flowFlowSensitivityValueThreshold',
        },
        angleFlowSensitivityValueThreshold: {
            type: TYPES.double,
            description: 'angleFlowSensitivityValueThreshold',
        },
        flowVoltageSensitivityValueThreshold: {
            type: TYPES.double,
            description: 'flowVoltageSensitivityValueThreshold',
        },
    };

    return (
        <>
            <Grid container spacing={1} padding={1}>
                <DropDown
                    value={provider}
                    label="Provider"
                    values={providers}
                    callback={updateProviderCallback}
                />
            </Grid>
            <Grid
                container
                key="sensiAnalysisProvider"
                className={classes.scrollableGrid}
            ></Grid>
            <LineSeparator />
            {makeComponentsFor(sensiParams)}
            <Grid
                container
                className={classes.controlItem + ' ' + classes.marginTopButton}
                maxWidth="md"
            >
                <LabelledButton
                    callback={resetProvider}
                    label="resetToDefault"
                />
                <LabelledButton label="resetProviderValuesToDefault" />
                <CloseButton
                    hideParameters={hideParameters}
                    className={classes.button}
                />
            </Grid>
        </>
    );
};
