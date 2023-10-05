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
    START_TIME,
    STOP_TIME,
} from './time-delay-parameters';
import SolverParameters, {
    formSchema as solverFormSchema,
    emptyFormData as solverEmptyFormData,
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
import { getTabStyle } from '../../../utils/tab-utils';

const TAB_VALUES = {
    TIME_DELAY: 'timeDelay',
    SOLVER: 'solver',
    MAPPING: 'mapping',
    NETWORK: 'network',
    CURVE: 'curve',
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

    const [tabValue, setTabValue] = useState(TAB_VALUES.TIME_DELAY);

    const [tabIndexesWithError, setTabIndexesWithError] = useState([]);

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
            [TAB_VALUES.TIME_DELAY]: { ...timeDelayEmptyFormData },
            [TAB_VALUES.SOLVER]: { ...solverEmptyFormData },
            [TAB_VALUES.MAPPING]: { ...mappingEmptyFormData },
            [TAB_VALUES.NETWORK]: { ...networkEmptyFormData },
        };
    }, []);

    const formSchema = yup.object().shape({
        [TAB_VALUES.TIME_DELAY]: timeDelayFormSchema,
        [TAB_VALUES.SOLVER]: solverFormSchema,
        [TAB_VALUES.MAPPING]: mappingFormSchema,
        [TAB_VALUES.NETWORK]: networkFormSchema,
    });

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const {
        reset,
        handleSubmit,
        formState: { errors },
    } = formMethods;

    const onError = useCallback((errors) => {
        let tabsInError = [];
        if (errors?.[TAB_VALUES.TIME_DELAY]) {
            tabsInError.push(TAB_VALUES.TIME_DELAY);
        }
        if (errors?.[TAB_VALUES.SOLVER]) {
            tabsInError.push(TAB_VALUES.SOLVER);
        }
        if (errors?.[TAB_VALUES.MAPPING]) {
            tabsInError.push(TAB_VALUES.MAPPING);
        }
        if (errors?.[TAB_VALUES.NETWORK]) {
            tabsInError.push(TAB_VALUES.NETWORK);
        }
        setTabIndexesWithError(tabsInError);
    }, []);

    // errors is a mutable object => convert to json to activate useEffect
    const errorsJSON = JSON.stringify(errors);

    useEffect(() => {
        onError(JSON.parse(errorsJSON));
    }, [errorsJSON, onError]);

    const onSubmit = useCallback(
        (newParams) => {
            // use updater to set with new parameters
            console.log('set new parameters', newParams);
            updateParameters({
                ...parameters,
                ...newParams[TAB_VALUES.TIME_DELAY],
                ...newParams[TAB_VALUES.SOLVER],
                ...newParams[TAB_VALUES.MAPPING],
                ...newParams[TAB_VALUES.MAPPING],
                [NETWORK]: newParams[TAB_VALUES.NETWORK],
            });
        },
        [parameters, updateParameters]
    );

    useEffect(() => {
        if (parameters) {
            reset({
                [TAB_VALUES.TIME_DELAY]: {
                    [START_TIME]: parameters[START_TIME],
                    [STOP_TIME]: parameters[STOP_TIME],
                },
                [TAB_VALUES.SOLVER]: {
                    [SOLVER_ID]: parameters[SOLVER_ID],
                    [SOLVERS]: parameters[SOLVERS],
                },
                [TAB_VALUES.MAPPING]: {
                    [MAPPING]: parameters[MAPPING],
                },
                [TAB_VALUES.NETWORK]: {
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
                            value={TAB_VALUES.TIME_DELAY}
                            sx={getTabStyle(
                                tabIndexesWithError,
                                TAB_VALUES.TIME_DELAY
                            )}
                        />
                        <Tab
                            label={
                                <FormattedMessage id="DynamicSimulationSolver" />
                            }
                            value={TAB_VALUES.SOLVER}
                            sx={getTabStyle(
                                tabIndexesWithError,
                                TAB_VALUES.SOLVER
                            )}
                        />
                        <Tab
                            label={
                                <FormattedMessage id="DynamicSimulationMapping" />
                            }
                            value={TAB_VALUES.MAPPING}
                            sx={getTabStyle(
                                tabIndexesWithError,
                                TAB_VALUES.MAPPING
                            )}
                        />
                        <Tab
                            label={
                                <FormattedMessage id="DynamicSimulationNetwork" />
                            }
                            value={TAB_VALUES.NETWORK}
                            sx={getTabStyle(
                                tabIndexesWithError,
                                TAB_VALUES.NETWORK
                            )}
                        />
                        <Tab
                            label={
                                <FormattedMessage id="DynamicSimulationCurve" />
                            }
                            value={TAB_VALUES.CURVE}
                        />
                    </Tabs>

                    <TabPanel value={tabValue} index={TAB_VALUES.TIME_DELAY}>
                        <TimeDelayParameters
                            key={`time-delay-${resetRevision}`} // to force remount a component having internal states
                            path={TAB_VALUES.TIME_DELAY}
                        />
                    </TabPanel>
                    <TabPanel value={tabValue} index={TAB_VALUES.SOLVER}>
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
                            path={TAB_VALUES.SOLVER}
                            errors={errors[TAB_VALUES.SOLVER]}
                        />
                    </TabPanel>
                    <TabPanel value={tabValue} index={TAB_VALUES.MAPPING}>
                        <MappingParameters
                            mapping={
                                parameters
                                    ? {
                                          mapping: parameters.mapping,
                                          mappings: parameters.mappings,
                                      }
                                    : undefined
                            }
                            path={TAB_VALUES.MAPPING}
                        />
                    </TabPanel>
                    <TabPanel value={tabValue} index={TAB_VALUES.NETWORK}>
                        <NetworkParameters
                            key={`network-${resetRevision}`} // to force remount a component having internal states
                            path={TAB_VALUES.NETWORK}
                        />
                    </TabPanel>
                    <TabPanel value={tabValue} index={TAB_VALUES.CURVE}>
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
