/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';

import React, { useCallback, useEffect, useState } from 'react';
import TimeDelayParameters from './time-delay-parameters';
import SolverParameters from './solver-parameters';
import MappingParameters from './mapping-parameters';
import { LineSeparator } from '../../dialogUtils';
import {
    CloseButton,
    DropDown,
    LabelledButton,
    useStyles,
} from '../parameters';
import TabPanelLazy from '../common/tab-panel-lazy';

const TAB_VALUES = {
    timeDelayParamsTabValue: 'TimeDelay',
    solverParamsTabValue: 'Solver',
    mappingParamsTabValue: 'Mapping',
};

const EXTENSIONS = {
    DYNA_WALTZ: 'DynaWaltzParameters',
};

const DynamicSimulationParameters = ({ hideParameters, parametersBackend }) => {
    const classes = useStyles();

    const [
        providers,
        provider,
        updateProvider,
        resetProvider,
        parameters,
        updateParameters,
        resetParameters,
    ] = parametersBackend;

    const [tabValue, setTabValue] = useState(
        TAB_VALUES.timeDelayParamsTabValue
    );

    const handleUpdateProvider = useCallback(
        (evt) => {
            updateProvider(evt.target.value);
        },
        [updateProvider]
    );

    const handleResetParametersAndProvider = useCallback(() => {
        resetParameters();
        resetProvider();
    }, [resetParameters, resetProvider]);

    const handleUpdateTimeDelay = useCallback(
        (newTimeDelay) => {
            updateParameters({ ...parameters, ...newTimeDelay });
        },
        [updateParameters, parameters]
    );

    const handleUpdateSolver = useCallback(
        (newExtension) => {
            const foundIndex = parameters.extensions.findIndex(
                (elem) => elem.name === EXTENSIONS.DYNA_WALTZ
            );
            parameters.extensions.splice(foundIndex, 1, newExtension);
            updateParameters({
                ...parameters,
            });
        },
        [updateParameters, parameters]
    );

    const handleUpdateMapping = useCallback(
        (newMapping) => {
            updateParameters({ ...parameters, ...newMapping });
        },
        [updateParameters, parameters]
    );

    const handleTabChange = useCallback((event, newValue) => {
        setTabValue(newValue);
    }, []);
    useEffect(() => {
        console.log('Mounted DynamicSimulationParameters');
        return () => {
            console.log('Unmounted DynamicSimulationParameters');
        };
    }, []);
    return (
        <>
            <Grid
                container
                key="dsParameters"
                className={classes.scrollableGrid}
            >
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

                <Grid container paddingTop={1}>
                    <LineSeparator />
                </Grid>

                <Grid item maxWidth="md">
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
                    </Tabs>

                    <TabPanelLazy
                        className={classes.tabPanel}
                        selected={
                            tabValue === TAB_VALUES.timeDelayParamsTabValue
                        }
                    >
                        <TimeDelayParameters
                            timeDelay={{
                                startTime: parameters.startTime,
                                stopTime: parameters.stopTime,
                            }}
                            onUpdateTimeDelay={handleUpdateTimeDelay}
                        />
                    </TabPanelLazy>
                    <TabPanelLazy
                        className={classes.tabPanel}
                        selected={tabValue === TAB_VALUES.solverParamsTabValue}
                    >
                        <SolverParameters
                            dynaWaltzExtension={
                                parameters.extensions[
                                    parameters.extensions.findIndex(
                                        (elem) =>
                                            elem.name === EXTENSIONS.DYNA_WALTZ
                                    )
                                ]
                            }
                            onUpdateSolver={handleUpdateSolver}
                        />
                    </TabPanelLazy>
                    <TabPanelLazy
                        className={classes.tabPanel}
                        selected={tabValue === TAB_VALUES.mappingParamsTabValue}
                    >
                        <MappingParameters
                            mapping={{
                                mapping: parameters.mapping,
                                mappings: parameters.mappings,
                            }}
                            onUpdateMapping={handleUpdateMapping}
                        />
                    </TabPanelLazy>
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
