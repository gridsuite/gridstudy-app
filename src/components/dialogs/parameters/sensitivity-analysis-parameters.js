/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useState } from 'react';
import { Grid } from '@mui/material';
import { CloseButton, DropDown, LabelledButton, styles } from './parameters';
import { LineSeparator } from '../dialogUtils';
import { TYPES, getValue } from './util/make-component-utils';
import { DoubleEditor } from './load-flow-parameters';
import { mergeSx } from '../../utils/functions';

export const SensitivityAnalysisParameters = ({
    hideParameters,
    parametersBackend,
}) => {
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
                <Grid
                    container
                    spacing={1}
                    sx={{ padding: 0, paddingBottom: 1 }}
                >
                    <DropDown
                        value={provider}
                        label="Provider"
                        values={providers}
                        callback={updateProviderCallback}
                    />
                </Grid>
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
                    sx={styles.scrollableGrid}
                ></Grid>
                <LineSeparator />
            </Grid>

            <Grid
                container
                sx={mergeSx(styles.controlItem, styles.marginTopButton)}
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
                <CloseButton hideParameters={hideParameters} />
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
            {SensitivityParamField(defParams[key], key, params, setter)}
        </Grid>
    ));
}
function SensitivityParamField(defParam, key, params, setter) {
    function updateValues(newval) {
        setter({ ...params, [key]: newval });
    }
    const value = getValue(params, key);
    return (
        <DoubleEditor
            initValue={value}
            label={defParam.description}
            callback={updateValues}
            checkIsTwoDigitAfterDecimal
        />
    );
}
