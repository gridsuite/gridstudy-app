/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import yup from '../../../utils/yup-config';
import { Grid, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';

import { FunctionComponent, SyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';
import ScenarioParameters, { SCENARIO_DURATION } from './scenario-parameters';
import {
    fetchDefaultDynamicSecurityAnalysisProvider,
    fetchDynamicSecurityAnalysisParameters,
    fetchDynamicSecurityAnalysisProviders,
    updateDynamicSecurityAnalysisParameters,
    updateDynamicSecurityAnalysisProvider,
} from '../../../../services/study/dynamic-security-analysis';
import { OptionalServicesNames } from '../../../utils/optional-services';
import { useOptionalServiceStatus } from '../../../../hooks/use-optional-service-status';
import { CustomFormProvider, isObjectEmpty, mergeSx, SubmitButton } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { FieldErrors, useForm } from 'react-hook-form';
import { getTabStyle } from '../../../utils/tab-utils';
import ComputingType from '../../../computing-status/computing-type';
import { User } from 'oidc-client';

import { LabelledButton, TabPanel } from '../parameters';
import ContingencyParameters, { CONTINGENCIES_LIST_INFOS, CONTINGENCIES_START_TIME } from './contingency-parameters';
import { ID, NAME, PROVIDER } from '../../../utils/field-constants';
import ProviderParam from '../common/ProviderParam';
import { styles } from '../parameters-style';
import { useParametersBackend } from '../use-parameters-backend';

const scenarioFormSchema = yup
    .object()
    .shape({
        [SCENARIO_DURATION]: yup.number().required(),
    })
    .required();

const scenarioEmptyFormData = {
    [SCENARIO_DURATION]: 0,
};

const contingencyFormSchema = yup.object().shape({
    [CONTINGENCIES_START_TIME]: yup.number().required(),
    [CONTINGENCIES_LIST_INFOS]: yup
        .array()
        .of(
            yup.object().shape({
                [ID]: yup.string().required(),
                [NAME]: yup.string().required(),
            })
        )
        .required(),
});

const contingencyEmptyFormData = {
    [CONTINGENCIES_START_TIME]: 0,
    [CONTINGENCIES_LIST_INFOS]: [],
};

enum TAB_VALUES {
    SCENARIO = 'scenario',
    CONTINGENCY = 'contingency',
}

interface DynamicSecurityAnalysisParametersProps {
    user: User | null;
    setHaveDirtyFields: (haveDirtyFields: boolean) => void;
}

const formSchema = yup.object().shape({
    [PROVIDER]: yup.string().required(),
    [TAB_VALUES.SCENARIO]: scenarioFormSchema,
    [TAB_VALUES.CONTINGENCY]: contingencyFormSchema,
});

const emptyFormData = {
    [PROVIDER]: '',
    [TAB_VALUES.SCENARIO]: { ...scenarioEmptyFormData },
    [TAB_VALUES.CONTINGENCY]: { ...contingencyEmptyFormData },
};

export type DynamicSecurityAnalysisParametersForm = yup.InferType<typeof formSchema>;

const DynamicSecurityAnalysisParameters: FunctionComponent<DynamicSecurityAnalysisParametersProps> = ({
    user,
    setHaveDirtyFields,
}) => {
    const dynamicSecurityAnalysisAvailability = useOptionalServiceStatus(OptionalServicesNames.DynamicSecurityAnalysis);

    const [providers, provider, , resetProvider, parameters, updateParameters, resetParameters] = useParametersBackend(
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

    const formattedProviders = useMemo(
        () =>
            Object.entries(providers).map(([key, value]) => ({
                id: key,
                label: value,
            })),
        [providers]
    );

    const [tabIndex, setTabIndex] = useState(TAB_VALUES.SCENARIO);
    const [tabIndexesWithError, setTabIndexesWithError] = useState<TAB_VALUES[]>([]);

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
            if (!errors || isObjectEmpty(errors)) {
                return;
            }

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
                [PROVIDER]: newParams.provider,
                ...newParams.scenario,
                [CONTINGENCIES_START_TIME]: newParams.contingency.contingenciesStartTime,
                [CONTINGENCIES_LIST_INFOS]: newParams.contingency.contingencyListInfos,
            });
        },
        [updateParameters]
    );

    useEffect(() => {
        if (parameters && provider) {
            reset({
                [PROVIDER]: parameters.provider ?? provider,
                [TAB_VALUES.SCENARIO]: {
                    [SCENARIO_DURATION]: parameters.scenarioDuration,
                },
                [TAB_VALUES.CONTINGENCY]: {
                    [CONTINGENCIES_START_TIME]: parameters.contingenciesStartTime,
                    [CONTINGENCIES_LIST_INFOS]: parameters.contingencyListInfos,
                },
            });
        }
    }, [reset, parameters, provider]);

    const handleTabChange = useCallback((event: SyntheticEvent<Element, Event>, newValue: TAB_VALUES) => {
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
                    key="dsaParameters"
                    sx={mergeSx(styles.scrollableGrid, {
                        height: '100%',
                        paddingTop: 0,
                    })}
                >
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
