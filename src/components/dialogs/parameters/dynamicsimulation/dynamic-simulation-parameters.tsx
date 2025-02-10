/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../../utils/yup-config';
import { Grid, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';

import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import TimeDelayParameters, {
    emptyFormData as timeDelayEmptyFormData,
    formSchema as timeDelayFormSchema,
    START_TIME,
    STOP_TIME,
} from './time-delay-parameters';
import SolverParameters, {
    emptyFormData as solverEmptyFormData,
    formSchema as solverFormSchema,
    SOLVER_ID,
    SOLVERS,
} from './solver-parameters';
import MappingParameters, {
    emptyFormData as mappingEmptyFormData,
    formSchema as mappingFormSchema,
    MAPPING,
} from './mapping-parameters';
import { LabelledButton, styles, TabPanel, useParametersBackend } from '../parameters';
import NetworkParameters, {
    emptyFormData as networkEmptyFormData,
    formSchema as networkFormSchema,
    NETWORK,
} from './network-parameters';
import CurveParameters, {
    CURVES,
    emptyFormData as curveEmptyFormData,
    formSchema as curveFormSchema,
} from './curve-parameters';
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
import { CustomFormProvider, isObjectEmpty, SubmitButton } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { FieldErrors, useForm } from 'react-hook-form';
import { getTabStyle } from '../../../utils/tab-utils';
import ComputingType from '../../../computing-status/computing-type';
import LineSeparator from '../../commons/line-separator';
import { User } from 'oidc-client';
import { SolverInfos } from 'services/study/dynamic-simulation.type';
import ProviderParameter from '../common/provider-parameter';

enum TAB_VALUES {
    TIME_DELAY = 'timeDelay',
    SOLVER = 'solver',
    MAPPING = 'mapping',
    NETWORK = 'network',
    CURVE = 'curve',
}

interface DynamicSimulationParametersProps {
    user: User | null;
    setHaveDirtyFields: (haveDirtyFields: boolean) => void;
}

const formSchema = yup.object().shape({
    [TAB_VALUES.TIME_DELAY]: timeDelayFormSchema,
    [TAB_VALUES.SOLVER]: solverFormSchema,
    [TAB_VALUES.MAPPING]: mappingFormSchema,
    [TAB_VALUES.NETWORK]: networkFormSchema,
    [TAB_VALUES.CURVE]: curveFormSchema,
});

export type DynamicSimulationForm = yup.InferType<typeof formSchema>;

const DynamicSimulationParameters: FunctionComponent<DynamicSimulationParametersProps> = ({
    user,
    setHaveDirtyFields,
}) => {
    const dynamicSimulationAvailability = useOptionalServiceStatus(OptionalServicesNames.DynamicSimulation);

    const [providers, provider, updateProvider, resetProvider, parameters, updateParameters, resetParameters] =
        useParametersBackend(
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

    const [tabIndex, setTabIndex] = useState(TAB_VALUES.TIME_DELAY);

    const [tabIndexesWithError, setTabIndexesWithError] = useState<TAB_VALUES[]>([]);

    const handleResetParametersAndProvider = useCallback(() => {
        resetProvider();
        resetParameters();
    }, [resetParameters, resetProvider]);

    const emptyFormData = useMemo(() => {
        return {
            [TAB_VALUES.TIME_DELAY]: { ...timeDelayEmptyFormData },
            [TAB_VALUES.SOLVER]: { ...solverEmptyFormData },
            [TAB_VALUES.MAPPING]: { ...mappingEmptyFormData },
            [TAB_VALUES.NETWORK]: { ...networkEmptyFormData },
            [TAB_VALUES.CURVE]: { ...curveEmptyFormData },
        };
    }, []);

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
                ...parameters,
                ...newParams[TAB_VALUES.TIME_DELAY],
                [SOLVER_ID]: newParams[TAB_VALUES.SOLVER][SOLVER_ID],
                // merge only the current selected solver, others are ignored
                [SOLVERS]: parameters?.[SOLVERS]?.reduce(
                    (arr, curr, index) => [
                        ...arr,
                        newParams[TAB_VALUES.SOLVER][SOLVERS]?.[index].id === newParams[TAB_VALUES.SOLVER][SOLVER_ID]
                            ? newParams[TAB_VALUES.SOLVER][SOLVERS][index]
                            : curr,
                    ],
                    [] as SolverInfos[]
                ),
                ...newParams[TAB_VALUES.MAPPING],
                ...newParams[TAB_VALUES.MAPPING],
                [NETWORK]: newParams[TAB_VALUES.NETWORK],
                ...newParams[TAB_VALUES.CURVE],
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
                [TAB_VALUES.CURVE]: {
                    [CURVES]: parameters[CURVES],
                },
            });
        }
    }, [reset, parameters]);

    const handleTabChange = useCallback((event: React.SyntheticEvent<Element, Event>, newValue: TAB_VALUES) => {
        setTabIndex(newValue);
    }, []);

    useEffect(() => {
        setHaveDirtyFields(!!Object.keys(formState.dirtyFields).length);
    }, [formState, setHaveDirtyFields]);

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <Grid sx={{ height: '100%' }}>
                <Grid
                    key="dsParameters"
                    sx={mergeSx(styles.scrollableGrid, {
                        height: '100%',
                        paddingTop: 0,
                    })}
                >
                    <ProviderParameter providers={providers} provider={provider} onChangeProvider={updateProvider} />
                    <Grid container paddingTop={1} xl={tabIndex === TAB_VALUES.CURVE ? 12 : 8}>
                        <LineSeparator />
                    </Grid>

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
