/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useState } from 'react';
import { Grid } from '@mui/material';
import { CloseButton, DropDown, LabelledButton, useStyles } from './parameters';
import { LineSeparator } from '../dialogUtils';
import { TYPES } from './util/make-component-utils';
import { makeComponentFor } from './util/make-component-utils';

export const SensitivityAnalysisParameters = ({
    hideParameters,
    parametersBackend,
}) => {
    const classes = useStyles();

    const [
        providers,
        provider,
        updateProvider,
        resetProvider,
        defaultParamsValues,
        updateParameters,
        resetParameters,
    ] = parametersBackend;

    const handleUpdateProvider = (evt) => updateProvider(evt.target.value);
    const updateProviderCallback = useCallback(handleUpdateProvider, [
        updateProvider,
    ]);

    // to force remount a component having internal states
    const [refreshKey, setRefreshKey] = useState(0);

    const handleUpdateSensitivityParameters = useCallback(
        (newValues) => {
            updateParameters({ ...defaultParamsValues, ...newValues });
        },
        [defaultParamsValues, updateParameters]
    );

    const resetSensitivityParametersAndProvider = useCallback(() => {
        resetProvider();
        resetParametersAndRefresh(resetParameters, setRefreshKey);
    }, [resetParameters, resetProvider]);

    const resetSensitivityAnalysisParameters = useCallback(() => {
        resetParametersAndRefresh(resetParameters, setRefreshKey);
    }, [resetParameters]);

    return (
        <>
            <Grid container spacing={1} padding={1}>
                <DropDown
                    value={provider}
                    label="Provider"
                    values={providers}
                    callback={updateProviderCallback}
                />
                <LineSeparator />
                <SensitivityAnalysisFields
                    key={`sensititvity-params-${refreshKey}`}
                    paramaters={defaultParamsValues}
                    onHandleUpdateSensitivityParameters={
                        handleUpdateSensitivityParameters
                    }
                />
                <Grid
                    container
                    key="sensiAnalysisProvider"
                    className={classes.scrollableGrid}
                ></Grid>
                <LineSeparator />
            </Grid>

            <Grid
                container
                className={classes.controlItem + ' ' + classes.marginTopButton}
                maxWidth="md"
            >
                <LabelledButton
                    callback={resetSensitivityParametersAndProvider}
                    label="resetToDefault"
                />
                <LabelledButton
                    label="resetProviderValuesToDefault"
                    callback={resetSensitivityAnalysisParameters}
                />
                <CloseButton
                    hideParameters={hideParameters}
                    className={classes.button}
                />
            </Grid>
        </>
    );
};

const SensitivityAnalysisFields = ({
    paramaters,
    onHandleUpdateSensitivityParameters,
}) => {
    const handleUpdateParamsValues = useCallback(
        (newValues) => {
            onHandleUpdateSensitivityParameters(newValues);
        },
        [onHandleUpdateSensitivityParameters]
    );

    const sensiParams = {
        flowFlowSensitivityValueThreshold: {
            type: TYPES.float,
            description: 'flowFlowSensitivityValueThreshold',
        },
        angleFlowSensitivityValueThreshold: {
            type: TYPES.float,
            description: 'angleFlowSensitivityValueThreshold',
        },
        flowVoltageSensitivityValueThreshold: {
            type: TYPES.float,
            description: 'flowVoltageSensitivityValueThreshold',
        },
    };
    return (
        paramaters && (
            <Grid container>
                {makeComponentsFor(
                    sensiParams,
                    paramaters,
                    handleUpdateParamsValues
                )}
            </Grid>
        )
    );
};

function resetParametersAndRefresh(resetParameters, setResetRevision) {
    resetParameters(() => setResetRevision((prevState) => prevState + 1));
}

function makeComponentsFor(defParams, params, setter) {
    return Object.keys(defParams).map((key) => (
        <Grid container spacing={1} paddingTop={1} key={key}>
            {makeComponentFor(defParams[key], key, params, setter)}
        </Grid>
    ));
}
