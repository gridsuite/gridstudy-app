/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';

import React, { useCallback, useState } from 'react';
import TimeDelayParameters from './time-delay-parameters';
import SolverParameters from './solver-parameters';
import MappingParameters from './mapping-parameters';
import { LineSeparator } from '../../dialogUtils';
import {
    CloseButton,
    DropDown,
    LabelledButton,
    TabPanel,
    useParametersBackend,
    useStyles,
} from '../parameters';
import {
    fetchDefaultDynamicSimulationProvider,
    fetchDynamicSimulationParameters,
    fetchDynamicSimulationProvider,
    fetchDynamicSimulationProviders,
    updateDynamicSimulationParameters,
    updateDynamicSimulationProvider,
} from '../../../../utils/rest-api';
import NetworkParameters from './network-parameters';

const TAB_VALUES = {
    timeDelayParamsTabValue: 'TimeDelay',
    solverParamsTabValue: 'Solver',
    mappingParamsTabValue: 'Mapping',
    networkParamsTabValue: 'Network',
};

const EXTENSIONS = {
    DYNA_WALTZ: 'DynaWaltzParameters',
};

const DynamicSimulationParameters = ({ user, hideParameters }) => {
    const classes = useStyles();

    const [
        providers,
        provider,
        updateProvider,
        resetProvider,
        parameters,
        updateParameters,
        resetParameters,
    ] = useParametersBackend(
        user,
        'DynamicSimulation',
        fetchDynamicSimulationProviders,
        fetchDynamicSimulationProvider,
        fetchDefaultDynamicSimulationProvider,
        updateDynamicSimulationProvider,
        fetchDynamicSimulationParameters,
        updateDynamicSimulationParameters
    );

    const [tabValue, setTabValue] = useState(
        TAB_VALUES.timeDelayParamsTabValue
    );

    // to force remount a component having internal states
    const [resetRevision, setResetRevision] = useState(0);

    const handleUpdateProvider = useCallback(
        (evt) => {
            updateProvider(evt.target.value);
        },
        [updateProvider]
    );

    const handleResetParametersAndProvider = useCallback(() => {
        resetProvider();
        resetParameters(
            () =>
                setResetRevision(
                    (prevState) => prevState + 1
                ) /* to force remount a component having internal states */
        );
    }, [resetParameters, resetProvider]);

    const handleUpdateTimeDelay = useCallback(
        (newTimeDelay) => {
            updateParameters({ ...parameters, ...newTimeDelay });
        },
        [updateParameters, parameters]
    );

    const updateExtension = useCallback(
        (newExtension) => {
            const foundIndex = parameters.extensions.findIndex(
                (elem) => elem.name === newExtension.name
            );
            parameters.extensions.splice(foundIndex, 1, newExtension);
            updateParameters({
                ...parameters,
            });
        },
        [updateParameters, parameters]
    );

    const handleUpdateSolver = useCallback(
        (newExtension) => {
            updateExtension(newExtension);
        },
        [updateExtension]
    );

    const handleUpdateMapping = useCallback(
        (newMapping) => {
            updateParameters({ ...parameters, ...newMapping });
        },
        [updateParameters, parameters]
    );

    const handleUpdateNetwork = useCallback(
        (newExtension) => {
            updateExtension(newExtension);
        },
        [updateExtension]
    );

    const handleTabChange = useCallback((event, newValue) => {
        setTabValue(newValue);
    }, []);

    return (
        <>
            <Grid
                container
                key="dsParameters"
                className={classes.scrollableGrid}
            >
                {providers && provider && (
                    <DropDown
                        value={provider}
                        label="Provider"
                        values={Object.entries(providers).reduce(
                            (obj, [key, value]) => {
                                obj[key] = `DynamicSimulationProvider${value}`;
                                return obj;
                            },
                            {}
                        )}
                        callback={handleUpdateProvider}
                    />
                )}

                <Grid container paddingTop={1}>
                    <LineSeparator />
                </Grid>

                <Grid item maxWidth="md" width="100%">
                    <Tabs
                        value={tabValue}
                        variant="scrollable"
                        onChange={handleTabChange}
                        aria-label="parameters"
                    >
                        <Tab
                            label={
                                <FormattedMessage id="DynamicSimulationTimeDelay" />
                            }
                            value={TAB_VALUES.timeDelayParamsTabValue}
                        />
                        <Tab
                            label={
                                <FormattedMessage id="DynamicSimulationSolver" />
                            }
                            value={TAB_VALUES.solverParamsTabValue}
                        />
                        <Tab
                            label={
                                <FormattedMessage id="DynamicSimulationMapping" />
                            }
                            value={TAB_VALUES.mappingParamsTabValue}
                        />
                        <Tab
                            label={
                                <FormattedMessage id="DynamicSimulationNetwork" />
                            }
                            value={TAB_VALUES.networkParamsTabValue}
                        />
                    </Tabs>

                    <TabPanel
                        value={tabValue}
                        index={TAB_VALUES.timeDelayParamsTabValue}
                    >
                        <TimeDelayParameters
                            key={`time-delay-${resetRevision}`} // to force remount a component having internal states
                            timeDelay={
                                parameters
                                    ? {
                                          startTime: parameters.startTime,
                                          stopTime: parameters.stopTime,
                                      }
                                    : undefined
                            }
                            onUpdateTimeDelay={handleUpdateTimeDelay}
                        />
                    </TabPanel>
                    <TabPanel
                        value={tabValue}
                        index={TAB_VALUES.solverParamsTabValue}
                    >
                        <SolverParameters
                            key={`solver-${resetRevision}`} // to force remount a component having internal states
                            dynaWaltzExtension={
                                parameters
                                    ? parameters.extensions[
                                          parameters.extensions.findIndex(
                                              (elem) =>
                                                  elem.name ===
                                                  EXTENSIONS.DYNA_WALTZ
                                          )
                                      ]
                                    : undefined
                            }
                            onUpdateSolver={handleUpdateSolver}
                        />
                    </TabPanel>
                    <TabPanel
                        value={tabValue}
                        index={TAB_VALUES.mappingParamsTabValue}
                    >
                        <MappingParameters
                            mapping={
                                parameters
                                    ? {
                                          mapping: parameters.mapping,
                                          mappings: parameters.mappings,
                                      }
                                    : undefined
                            }
                            onUpdateMapping={handleUpdateMapping}
                        />
                    </TabPanel>
                    <TabPanel
                        value={tabValue}
                        index={TAB_VALUES.networkParamsTabValue}
                    >
                        <NetworkParameters
                            key={`network-${resetRevision}`} // to force remount a component having internal states
                            dynaWaltzExtension={
                                parameters
                                    ? parameters.extensions[
                                          parameters.extensions.findIndex(
                                              (elem) =>
                                                  elem.name ===
                                                  EXTENSIONS.DYNA_WALTZ
                                          )
                                      ]
                                    : undefined
                            }
                            onUpdateNetwork={handleUpdateNetwork}
                        />
                    </TabPanel>
                </Grid>
            </Grid>
            <Grid
                container
                className={classes.controlItem + ' ' + classes.marginTopButton}
                maxWidth="md"
            >
                <LabelledButton
                    callback={handleResetParametersAndProvider}
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

export default DynamicSimulationParameters;
