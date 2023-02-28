/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';

import React, { useCallback, useState } from 'react';
import TabPanel from '../common/tab-panel';
import TimeDelayParameters from './time-delay-parameters';
import SolverParameters from './solver-parameters';
import MappingParameters from './mapping-parameters';
import { LineSeparator } from '../../dialogUtils';
import { CloseButton } from '../common/close-button';
import { DropDown } from '../common/drop-down';
import { LabelledButton } from '../common/labelled-button';
import { useStyles } from '../parameters-styles';

const TAB_VALUES = {
    timeDelayParamsTabValue: 'TimeDelay',
    solverParamsTabValue: 'Solver',
    mappingParamsTabValue: 'Mapping',
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

    return (
        <Grid container direction={'column'} className={classes.grid}>
            <Grid container key="provider">
                <DropDown
                    value={provider}
                    label="Provider"
                    values={providers}
                    callback={handleUpdateProvider}
                />

                <Grid container paddingTop={1}>
                    <LineSeparator />
                </Grid>

                <Grid item maxWidth="md">
                    <Tabs
                        value={tabValue}
                        variant="scrollable"
                        onChange={(event, newValue) => setTabValue(newValue)}
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

                    <TabPanel
                        value={tabValue}
                        index={TAB_VALUES.timeDelayParamsTabValue}
                    >
                        <TimeDelayParameters
                            timeDelay={parameters.timeDelay}
                            onUpdateTimeDelay={updateParameters}
                        />
                    </TabPanel>
                    <TabPanel
                        value={tabValue}
                        index={TAB_VALUES.solverParamsTabValue}
                    >
                        <SolverParameters
                            solver={parameters.solver}
                            onUpdateSolver={updateParameters}
                        />
                    </TabPanel>
                    <TabPanel
                        value={tabValue}
                        index={TAB_VALUES.mappingParamsTabValue}
                    >
                        <MappingParameters
                            mapping={parameters.mapping}
                            onUpdateMapping={updateParameters}
                        />
                    </TabPanel>
                </Grid>

                <Grid
                    container
                    className={
                        classes.controlItem + ' ' + classes.marginTopButton
                    }
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
            </Grid>
        </Grid>
    );
};

export default DynamicSimulationParameters;
