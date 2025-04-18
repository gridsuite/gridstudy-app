/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';

import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import TimeDelayParameters from './time-delay-parameters';
import SolverParameters from './solver-parameters';
import MappingParameters from './mapping-parameters';
import { LabelledButton, TabPanel } from '../parameters';
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
import { CustomFormProvider, isObjectEmpty, mergeSx, SubmitButton } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { FieldErrors, useForm } from 'react-hook-form';
import { getTabStyle } from '../../../utils/tab-utils';
import ComputingType from '../../../computing-status/computing-type';
import { User } from 'oidc-client';
import { PROVIDER } from '../../../utils/field-constants';
import ProviderParam from '../common/ProviderParam';
import { SolverInfos } from 'services/study/dynamic-simulation.type';
import {
    Curve,
    curveEmptyFormData,
    MAPPING,
    mappingEmptyFormData,
    NETWORK,
    networkEmptyFormData,
    Solver,
    solverEmptyFormData,
    TimeDelay,
    timeDelayEmptyFormData,
} from './dynamic-simulation-utils';
import { useParametersBackend } from '../use-parameters-backend';
import { styles } from '../parameters-style';
import { DynamicSimulationForm, formSchema, TAB_VALUES } from './dynamic-simulation.type';

interface DynamicSimulationParametersProps {
    user: User | null;
    setHaveDirtyFields: (haveDirtyFields: boolean) => void;
}

const emptyFormData = {
    [PROVIDER]: '',
    [TAB_VALUES.TIME_DELAY]: { ...timeDelayEmptyFormData },
    [TAB_VALUES.SOLVER]: { ...solverEmptyFormData },
    [TAB_VALUES.MAPPING]: { ...mappingEmptyFormData },
    [TAB_VALUES.NETWORK]: { ...networkEmptyFormData },
    [TAB_VALUES.CURVE]: { ...curveEmptyFormData },
};

const DynamicSimulationParameters: FunctionComponent<DynamicSimulationParametersProps> = ({
    user,
    setHaveDirtyFields,
}) => {
    const dynamicSimulationAvailability = useOptionalServiceStatus(OptionalServicesNames.DynamicSimulation);

    const [providers, provider, , resetProvider, parameters, updateParameters, resetParameters] = useParametersBackend(
        user,
        ComputingType.DYNAMIC_SIMULATION,
        dynamicSimulationAvailability,
        fetchDynamicSimulationProviders,
        fetchDynamicSimulationProvider,
        fetchDefaultDynamicSimulationProvider,
        updateDynamicSimulationProvider,
        fetchDynamicSimulationParameters,
        updateDynamicSimulationParameters
    );

    const formattedProviders = useMemo(
        () =>
            Object.entries(providers).map(([key, value]) => ({
                id: key,
                label: value,
            })),
        [providers]
    );

    const [tabIndex, setTabIndex] = useState(TAB_VALUES.TIME_DELAY);
    const [tabIndexesWithError, setTabIndexesWithError] = useState<TAB_VALUES[]>([]);

    const handleResetParametersAndProvider = useCallback(() => {
        resetProvider();
        resetParameters();
    }, [resetParameters, resetProvider]);

    const formMethods = useForm<DynamicSimulationForm>({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, handleSubmit, formState, clearErrors } = formMethods;

    const onError = useCallback(
        (errors: FieldErrors<DynamicSimulationForm>) => {
            if (!errors || isObjectEmpty(errors)) {
                return;
            }

            const tabsInError = [];
            // do not show error when being in the current tab
            if (errors?.[TAB_VALUES.TIME_DELAY] && TAB_VALUES.TIME_DELAY !== tabIndex) {
                tabsInError.push(TAB_VALUES.TIME_DELAY);
            }
            if (errors?.[TAB_VALUES.SOLVER] && TAB_VALUES.SOLVER !== tabIndex) {
                tabsInError.push(TAB_VALUES.SOLVER);
            }
            if (errors?.[TAB_VALUES.MAPPING] && TAB_VALUES.MAPPING !== tabIndex) {
                tabsInError.push(TAB_VALUES.MAPPING);
            }
            if (errors?.[TAB_VALUES.NETWORK] && TAB_VALUES.NETWORK !== tabIndex) {
                tabsInError.push(TAB_VALUES.NETWORK);
            }
            if (errors?.[TAB_VALUES.CURVE] && TAB_VALUES.CURVE !== tabIndex) {
                tabsInError.push(TAB_VALUES.CURVE);
            }

            if (tabsInError.includes(tabIndex)) {
                // error in current tab => do not change tab systematically but remove current tab in error list
                setTabIndexesWithError(tabsInError.filter((errorTabIndex) => errorTabIndex !== tabIndex));
            } else if (tabsInError.length > 0) {
                // switch to the first tab in the list then remove the tab in the error list
                setTabIndex(tabsInError[0]);
                setTabIndexesWithError(tabsInError.filter((errorTabIndex, index, arr) => errorTabIndex !== arr[0]));
            }
        },
        [tabIndex]
    );

    const onSubmit = useCallback(
        (newParams: DynamicSimulationForm) => {
            // use updater to set with new parameters
            updateParameters({
                [PROVIDER]: newParams.provider,
                ...newParams.timeDelay,
                [Solver.ID]: newParams.solver.solverId,
                // merge only the current selected solver, others are ignored
                [Solver.SOLVERS]: parameters?.solvers?.reduce(
                    (arr, curr, index) => [
                        ...arr,
                        newParams.solver.solvers?.[index].id === newParams.solver.solverId
                            ? newParams.solver.solvers[index]
                            : curr,
                    ],
                    [] as SolverInfos[]
                ),
                ...newParams.mapping,
                [NETWORK]: newParams.network,
                ...newParams.curve,
            });
        },
        [parameters, updateParameters]
    );

    useEffect(() => {
        if (parameters && provider) {
            reset({
                [PROVIDER]: parameters.provider ?? provider,
                [TAB_VALUES.TIME_DELAY]: {
                    [TimeDelay.START_TIME]: parameters.startTime,
                    [TimeDelay.STOP_TIME]: parameters.stopTime,
                },
                [TAB_VALUES.SOLVER]: {
                    [Solver.ID]: parameters.solverId,
                    [Solver.SOLVERS]: parameters.solvers,
                },
                [TAB_VALUES.MAPPING]: {
                    [MAPPING]: parameters.mapping,
                },
                [TAB_VALUES.NETWORK]: {
                    ...parameters.network,
                },
                [TAB_VALUES.CURVE]: {
                    [Curve.CURVES]: parameters.curves,
                },
            });
        }
    }, [reset, parameters, provider]);

    const handleTabChange = useCallback((event: React.SyntheticEvent<Element, Event>, newValue: TAB_VALUES) => {
        setTabIndex(newValue);
    }, []);

    useEffect(() => {
        setHaveDirtyFields(!!Object.keys(formState.dirtyFields).length);
    }, [formState, setHaveDirtyFields]);

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <Grid sx={{ height: '100%' }}>
                <ProviderParam options={formattedProviders} />
                <Grid
                    key="dsParameters"
                    sx={mergeSx(styles.scrollableGrid, {
                        height: '100%',
                        paddingTop: 0,
                    })}
                >
                    <Grid item width="100%">
                        <Tabs value={tabIndex} variant="scrollable" onChange={handleTabChange} aria-label="parameters">
                            <Tab
                                label={<FormattedMessage id="DynamicSimulationTimeDelay" />}
                                value={TAB_VALUES.TIME_DELAY}
                                sx={getTabStyle(tabIndexesWithError, TAB_VALUES.TIME_DELAY)}
                            />
                            <Tab
                                label={<FormattedMessage id="DynamicSimulationSolver" />}
                                value={TAB_VALUES.SOLVER}
                                sx={getTabStyle(tabIndexesWithError, TAB_VALUES.SOLVER)}
                            />
                            <Tab
                                label={<FormattedMessage id="DynamicSimulationMapping" />}
                                value={TAB_VALUES.MAPPING}
                                sx={getTabStyle(tabIndexesWithError, TAB_VALUES.MAPPING)}
                            />
                            <Tab
                                label={<FormattedMessage id="DynamicSimulationNetwork" />}
                                value={TAB_VALUES.NETWORK}
                                sx={getTabStyle(tabIndexesWithError, TAB_VALUES.NETWORK)}
                            />
                            <Tab label={<FormattedMessage id="DynamicSimulationCurve" />} value={TAB_VALUES.CURVE} />
                        </Tabs>

                        <TabPanel value={tabIndex} index={TAB_VALUES.TIME_DELAY}>
                            <TimeDelayParameters path={TAB_VALUES.TIME_DELAY} />
                        </TabPanel>
                        <TabPanel value={tabIndex} index={TAB_VALUES.SOLVER}>
                            <SolverParameters
                                solver={
                                    parameters
                                        ? {
                                              solverId: parameters.solverId as string,
                                              solvers: parameters.solvers as Record<string, any>[],
                                          }
                                        : undefined
                                }
                                path={TAB_VALUES.SOLVER}
                                clearErrors={clearErrors}
                            />
                        </TabPanel>
                        <TabPanel value={tabIndex} index={TAB_VALUES.MAPPING}>
                            <MappingParameters
                                mapping={
                                    parameters
                                        ? {
                                              mappings: parameters.mappings,
                                          }
                                        : undefined
                                }
                                path={TAB_VALUES.MAPPING}
                            />
                        </TabPanel>
                        <TabPanel value={tabIndex} index={TAB_VALUES.NETWORK}>
                            <NetworkParameters path={TAB_VALUES.NETWORK} />
                        </TabPanel>
                        <TabPanel value={tabIndex} index={TAB_VALUES.CURVE}>
                            <CurveParameters path={TAB_VALUES.CURVE} />
                        </TabPanel>
                    </Grid>
                </Grid>
            </Grid>
            <Grid container sx={mergeSx(styles.controlParametersItem, styles.marginTopButton, { paddingTop: 4 })}>
                <LabelledButton callback={handleResetParametersAndProvider} label="resetToDefault" />
                <SubmitButton variant="outlined" onClick={handleSubmit(onSubmit, onError)}>
                    <FormattedMessage id={'validate'} />
                </SubmitButton>
            </Grid>
        </CustomFormProvider>
    );
};

export default DynamicSimulationParameters;
