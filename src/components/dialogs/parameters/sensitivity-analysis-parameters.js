/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import { CloseButton, DropDown, LabelledButton, useStyles } from './parameters';
import {
    fetchDefaultSensitivityAnalysisProvider,
    fetchSensitivityAnalysisProvider,
    fetchSensitivityAnalysisProviders,
    updateSensitivityAnalysisProvider
} from '../../../utils/rest-api';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useSelector } from 'react-redux';
import { LineSeparator } from '../dialogUtils';

export const useSensitivityAnalysisParametersContext = (user) => {

    const studyUuid = useSelector((state) => state.studyUuid);

    const { snackError } = useSnackMessage();

    const [providers, setProviders] = useState([]);

    const [provider, setProvider] = useState(null);

    useEffect(() => {
        if (user !== null) {
            fetchSensitivityAnalysisProviders()
                .then((providers) => {
                    // we can consider the provider get from back will be also used as
                    // a key for translation
                    const providersObj = providers.reduce(function (obj, v, i) {
                        obj[v] = v;
                        return obj;
                    }, {});
                    setProviders(providersObj);
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'fetchSensitivityAnalysisProvidersError',
                    });
                });
        }
    }, [user, snackError]);

    const updateProvider = useCallback(
        (newProvider) => {
            updateSensitivityAnalysisProvider(studyUuid, newProvider)
                .then(() => setProvider(newProvider))
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'updateSensitivityAnalysisProviderError',
                    });
                });
        },
        [studyUuid, snackError]
    );

    const resetProvider = useCallback(() => {
        fetchDefaultSensitivityAnalysisProvider()
            .then((defaultProvider) => {
                const providerNames = Object.keys(providers);
                if (providerNames.length > 0) {
                    const newProvider =
                        defaultProvider in providers
                            ? defaultProvider
                            : providerNames[0];
                    updateProvider(newProvider);
                }
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'fetchDefaultSensitivityAnalysisProviderError',
                });
            });
    }, [providers, updateProvider, snackError]);

    useEffect(() => {
        if (studyUuid) {
            fetchSensitivityAnalysisProvider(studyUuid)
                .then((provider) => {
                    // if provider is not defined or not among allowed values, it's set to default value
                    if (provider in providers) {
                        setProvider(provider);
                    } else {
                        resetProvider();
                    }
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'fetchSensitivityAnalysisProviderError',
                    });
                });
        }
    }, [studyUuid, snackError, resetProvider]);

    return [providers, provider, updateProvider, resetProvider];
};

export const SensitivityAnalysisParameters = ({
    hideParameters,
    parametersContext,
}) => {
    const classes = useStyles();

    const [providers, provider, updateProvider, resetProvider] =
        parametersContext;

    const updateProviderCallback = useCallback(
        (evt) => {
            updateProvider(evt.target.value);
        },
        [updateProvider]
    );

    return (
        <Grid container className={classes.grid}>
            <Grid container key="sensiAnalysisProvider">
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
