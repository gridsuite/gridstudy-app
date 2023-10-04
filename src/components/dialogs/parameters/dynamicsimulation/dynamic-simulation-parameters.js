/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../../utils/yup-config';
import { Grid, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import TimeDelayParameters, {
    formSchema as timeDelayFormSchema,
    emptyFormData as timeDelayEmptyFormData,
    TIME_DELAY,
    START_TIME,
    STOP_TIME,
} from './time-delay-parameters';
import SolverParameters, {
    formSchema as solverFormSchema,
    emptyFormData as solverEmptyFormData,
    SOLVER,
    SOLVER_ID,
    SOLVERS,
} from './solver-parameters';
import MappingParameters, {
    formSchema as mappingFormSchema,
    emptyFormData as mappingEmptyFormData,
    MAPPING,
} from './mapping-parameters';
import { LineSeparator } from '../../dialogUtils';
import {
    CloseButton,
    DropDown,
    LabelledButton,
    TabPanel,
    useParametersBackend,
    styles,
} from '../parameters';
import NetworkParameters, {
    formSchema as networkFormSchema,
    emptyFormData as networkEmptyFormData,
    NETWORK,
} from './network-parameters';
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
import { mergeSx } from '../../../utils/functions';
import { SubmitButton } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';

const TAB_VALUES = {
    timeDelayParamsTabValue: 'TimeDelay',
    solverParamsTabValue: 'Solver',
    mappingParamsTabValue: 'Mapping',
    networkParamsTabValue: 'Network',
    curveParamsTabValue: 'Curve',
};

const DynamicSimulationParameters = ({ user, hideParameters }) => {
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

    const emptyFormData = useMemo(() => {
        return {
            [TIME_DELAY]: { ...timeDelayEmptyFormData },
            [SOLVER]: { ...solverEmptyFormData },
            [MAPPING]: { ...mappingEmptyFormData },
            [NETWORK]: { ...networkEmptyFormData },
        };
    }, []);

    const formSchema = yup.object().shape({
        [TIME_DELAY]: timeDelayFormSchema,
        [SOLVER]: solverFormSchema,
        [MAPPING]: mappingFormSchema,
        [NETWORK]: networkFormSchema,
    });

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, handleSubmit } = formMethods;

    const onSubmit = useCallback((newParams) => {
        // use hook setter to set with new parameters
        console.log('set new parameters', newParams);
    }, []);

    useEffect(() => {
        if (parameters) {
            reset({
                [TIME_DELAY]: {
                    [START_TIME]: parameters[START_TIME],
                    [STOP_TIME]: parameters[STOP_TIME],
                },
                [SOLVER]: {
                    [SOLVER_ID]: parameters[SOLVER_ID],
                    [SOLVERS]: parameters[SOLVERS],
                },
                [MAPPING]: {
                    [MAPPING]: parameters[MAPPING],
                },
                [NETWORK]: {
                    ...parameters[NETWORK],
                },
            });
        }
    }, [reset, parameters]);

    const handleUpdateCurve = useCallback(
        (newCurves) => {
            updateParameters({ ...parameters, curves: newCurves });
        },
        [updateParameters, parameters]
    );

    const handleTabChange = useCallback((event, newValue) => {
        setTabValue(newValue);
    }, []);

    return (
        <FormProvider validationSchema={formSchema} {...formMethods}>
            <Grid container key="dsParameters" sx={styles.scrollableGrid}>
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
                            path={TIME_DELAY}
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
                            path={SOLVER}
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
                            path={MAPPING}
                        />
                    </TabPanel>
                    <TabPanel
                        value={tabValue}
                        index={TAB_VALUES.networkParamsTabValue}
                    >
                        <NetworkParameters
                            key={`network-${resetRevision}`} // to force remount a component having internal states
                            path={NETWORK}
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
                sx={mergeSx(styles.controlItem, styles.marginTopButton)}
                maxWidth="md"
            >
                <LabelledButton
                    callback={handleResetParametersAndProvider}
                    label="resetToDefault"
                />
                <SubmitButton onClick={handleSubmit(onSubmit)}>
                    <FormattedMessage id={'validate'} />
                </SubmitButton>
                <CloseButton hideParameters={hideParameters} />
            </Grid>
        </FormProvider>
    );
};

export default DynamicSimulationParameters;
