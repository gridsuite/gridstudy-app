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
import NetworkParameters from './network-parameters';
import CurveParameters from './curve-parameters';
import { fetchDynamicSimulationProviders } from '../../../../services/dynamic-simulation';
import {
    fetchDefaultDynamicSimulationProvider,
    fetchDynamicSimulationParameters,
    fetchDynamicSimulationProvider,
    updateDynamicSimulationParameters,
    updateDynamicSimulationProvider,
} from '../../../../services/study/dynamic-simulation';
import { OptionalServicesNames } from '../../../utils/optional-services';
import { useOptionalServiceStatus } from '../../../../hooks/use-optional-service-status';

const TAB_VALUES = {
    timeDelayParamsTabValue: 'TimeDelay',
    solverParamsTabValue: 'Solver',
    mappingParamsTabValue: 'Mapping',
    networkParamsTabValue: 'Network',
    curveParamsTabValue: 'Curve',
};

const DynamicSimulationParameters = ({ user, hideParameters }) => {
    const classes = useStyles();

    const dynamicSimulationAvailability = useOptionalServiceStatus(
        OptionalServicesNames.DynamicSimulation
    );

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
        dynamicSimulationAvailability,
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

    const handleUpdateSolver = useCallback(
        (newSolver) => {
            updateParameters({ ...parameters, ...newSolver });
        },
        [updateParameters, parameters]
    );

    const handleUpdateCurve = useCallback(
        (newCurves) => {
            updateParameters({ ...parameters, curves: newCurves });
        },
        [updateParameters, parameters]
    );

    const handleUpdateMapping = useCallback(
        (newMapping) => {
            updateParameters({ ...parameters, ...newMapping });
        },
        [updateParameters, parameters]
    );

    const handleUpdateNetwork = useCallback(
        (newNetwork) => {
            updateParameters({ ...parameters, network: newNetwork });
        },
        [updateParameters, parameters]
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
                        <Tab
                            label={
                                <FormattedMessage id="DynamicSimulationCurve" />
                            }
                            value={TAB_VALUES.curveParamsTabValue}
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
                            solver={
                                parameters
                                    ? {
                                          solverId: parameters.solverId,
                                          solvers: parameters.solvers,
                                      }
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
                            network={
                                parameters
                                    ? { ...parameters.network }
                                    : undefined
                            }
                            onUpdateNetwork={handleUpdateNetwork}
                        />
                    </TabPanel>
                    <TabPanel
                        value={tabValue}
                        index={TAB_VALUES.curveParamsTabValue}
                    >
                        <CurveParameters
                            key={`curve-${resetRevision}`} // to force remount a component having internal states
                            curves={
                                parameters
                                    ? parameters.curves
                                        ? [...parameters.curves]
                                        : []
                                    : undefined
                            }
                            onUpdateCurve={handleUpdateCurve}
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
