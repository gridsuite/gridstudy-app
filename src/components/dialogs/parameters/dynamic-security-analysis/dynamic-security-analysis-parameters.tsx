/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../../utils/yup-config';
import { Grid, SelectChangeEvent, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';

import { FunctionComponent, SyntheticEvent, useCallback, useEffect, useState } from 'react';
import ScenarioParameters, {
    emptyFormData as scenarioEmptyFormData,
    formSchema as scenarioFormSchema,
    SCENARIO_DURATION,
} from './scenario-parameters';
import {
    fetchDefaultDynamicSecurityAnalysisProvider,
    fetchDynamicSecurityAnalysisParameters,
    fetchDynamicSecurityAnalysisProviders,
    updateDynamicSecurityAnalysisParameters,
    updateDynamicSecurityAnalysisProvider,
} from '../../../../services/study/dynamic-security-analysis';
import { OptionalServicesNames } from '../../../utils/optional-services';
import { useOptionalServiceStatus } from '../../../../hooks/use-optional-service-status';
import { mergeSx } from '../../../utils/functions';
import { CustomFormProvider, SubmitButton } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { FieldErrors, useForm } from 'react-hook-form';
import { getTabStyle } from '../../../utils/tab-utils';
import ComputingType from '../../../computing-status/computing-type';
import LineSeparator from '../../commons/line-separator';
import { User } from 'oidc-client';

import { DropDown, LabelledButton, styles, TabPanel, useParametersBackend } from '../parameters';
import ContingencyParameters, {
    CONTINGENCIES_LIST_INFOS,
    CONTINGENCIES_START_TIME,
    emptyFormData as contingencyEmptyFormData,
    formSchema as contingencyFormSchema,
} from './contingency-parameters';

enum TAB_VALUES {
    SCENARIO = 'scenario',
    CONTINGENCY = 'contingency',
}

interface DynamicSecurityAnalysisParametersProps {
    user: User | null;
    setHaveDirtyFields: (haveDirtyFields: boolean) => void;
}

const formSchema = yup.object().shape({
    [TAB_VALUES.SCENARIO]: scenarioFormSchema,
    [TAB_VALUES.CONTINGENCY]: contingencyFormSchema,
});

const emptyFormData = {
    [TAB_VALUES.SCENARIO]: { ...scenarioEmptyFormData },
    [TAB_VALUES.CONTINGENCY]: { ...contingencyEmptyFormData },
};

export type DynamicSecurityAnalysisParametersForm = yup.InferType<typeof formSchema>;

const DynamicSecurityAnalysisParameters: FunctionComponent<DynamicSecurityAnalysisParametersProps> = ({
    user,
    setHaveDirtyFields,
}) => {
    const dynamicSecurityAnalysisAvailability = useOptionalServiceStatus(OptionalServicesNames.DynamicSecurityAnalysis);

    const [providers, provider, updateProvider, resetProvider, parameters, updateParameters, resetParameters] =
        useParametersBackend(
            user,
            ComputingType.DYNAMIC_SECURITY_ANALYSIS,
            dynamicSecurityAnalysisAvailability,
            fetchDynamicSecurityAnalysisProviders,
            null,
            fetchDefaultDynamicSecurityAnalysisProvider,
            updateDynamicSecurityAnalysisProvider,
            fetchDynamicSecurityAnalysisParameters,
            updateDynamicSecurityAnalysisParameters
        );

    const [tabIndex, setTabIndex] = useState(TAB_VALUES.SCENARIO);
    const [tabIndexesWithError, setTabIndexesWithError] = useState<TAB_VALUES[]>([]);

    const handleUpdateProvider = useCallback(
        (evt: SelectChangeEvent) => {
            updateProvider(evt.target.value);
        },
        [updateProvider]
    );

    const handleResetParametersAndProvider = useCallback(() => {
        resetProvider();
        resetParameters();
    }, [resetParameters, resetProvider]);

    const formMethods = useForm<DynamicSecurityAnalysisParametersForm>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DynamicSecurityAnalysisParametersForm>(formSchema),
    });

    const { reset, handleSubmit, formState } = formMethods;

    const onError = useCallback(
        (errors: FieldErrors<DynamicSecurityAnalysisParametersForm>) => {
            const tabsInError = [];
            // do not show error when being in the current tab
            if (errors?.[TAB_VALUES.SCENARIO] && TAB_VALUES.SCENARIO !== tabIndex) {
                tabsInError.push(TAB_VALUES.SCENARIO);
            }
            if (errors?.[TAB_VALUES.CONTINGENCY] && TAB_VALUES.CONTINGENCY !== tabIndex) {
                tabsInError.push(TAB_VALUES.CONTINGENCY);
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
        (newParams: DynamicSecurityAnalysisParametersForm) => {
            // use updater to set with new parameters
            updateParameters({
                ...parameters,
                ...newParams[TAB_VALUES.SCENARIO],
                [CONTINGENCIES_START_TIME]: newParams[TAB_VALUES.CONTINGENCY][CONTINGENCIES_START_TIME],
                [CONTINGENCIES_LIST_INFOS]: newParams[TAB_VALUES.CONTINGENCY][CONTINGENCIES_LIST_INFOS],
            });
        },
        [parameters, updateParameters]
    );

    useEffect(() => {
        if (parameters) {
            reset({
                [TAB_VALUES.SCENARIO]: {
                    [SCENARIO_DURATION]: parameters[SCENARIO_DURATION],
                },
                [TAB_VALUES.CONTINGENCY]: {
                    [CONTINGENCIES_START_TIME]: parameters[CONTINGENCIES_START_TIME],
                    [CONTINGENCIES_LIST_INFOS]: parameters[CONTINGENCIES_LIST_INFOS],
                },
            });
        }
    }, [reset, parameters]);

    const handleTabChange = useCallback((event: SyntheticEvent<Element, Event>, newValue: TAB_VALUES) => {
        setTabIndex(newValue);
    }, []);

    useEffect(() => {
        setHaveDirtyFields(!!Object.keys(formState.dirtyFields).length);
    }, [formState, setHaveDirtyFields]);

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <Grid sx={{ height: '100%' }}>
                <Grid
                    key="dsaParameters"
                    sx={mergeSx(styles.scrollableGrid, {
                        height: '100%',
                        paddingTop: 0,
                    })}
                >
                    <Grid
                        xl={6}
                        container
                        sx={{
                            height: 'fit-content',
                            justifyContent: 'space-between',
                        }}
                    >
                        {providers && provider && (
                            <DropDown
                                value={provider}
                                label="Provider"
                                values={Object.entries(providers).reduce<Record<string, string>>(
                                    (obj, [key, value]) => {
                                        obj[key] = `DynamicSecurityAnalysisProvider${value}`;
                                        return obj;
                                    },
                                    {}
                                )}
                                callback={handleUpdateProvider}
                            />
                        )}
                    </Grid>

                    <Grid container paddingTop={1} xl={6}>
                        <LineSeparator />
                    </Grid>

                    <Grid item width="100%">
                        <Tabs value={tabIndex} variant="scrollable" onChange={handleTabChange} aria-label="parameters">
                            <Tab
                                label={<FormattedMessage id="DynamicSecurityAnalysisScenario" />}
                                value={TAB_VALUES.SCENARIO}
                                sx={getTabStyle(tabIndexesWithError, TAB_VALUES.SCENARIO)}
                            />
                            <Tab
                                label={<FormattedMessage id="DynamicSecurityAnalysisContingency" />}
                                value={TAB_VALUES.CONTINGENCY}
                            />
                        </Tabs>
                        <TabPanel value={tabIndex} index={TAB_VALUES.SCENARIO}>
                            <ScenarioParameters path={TAB_VALUES.SCENARIO} />
                        </TabPanel>
                        <TabPanel value={tabIndex} index={TAB_VALUES.CONTINGENCY}>
                            <ContingencyParameters path={TAB_VALUES.CONTINGENCY} />
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

export default DynamicSecurityAnalysisParameters;
