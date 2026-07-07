/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { SyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';

import {
    CustomFormProvider,
    snackWithFallback,
    useSnackMessage,
    ParameterLayout,
    ElementType,
} from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer.type';
import {
    fromStateEstimationParametersFormToParamValues,
    fromStateEstimationParametersParamToFormValues,
    StateEstimationParametersForm as StateEstimationFormType,
    stateEstimationParametersFormSchema,
    TabValue,
} from './state-estimation-parameters-utils';
import { StateEstimationParametersForm } from './state-estimation-parameters-form';
import { updateStateEstimationParameters } from '../../../../services/study/state-estimation';
import { UseGetStateEstimationParametersProps } from './use-get-state-estimation-parameters';

export const StateEstimationParameters = ({
    useStateEstimationParameters,
    setHaveDirtyFields,
}: {
    useStateEstimationParameters: UseGetStateEstimationParametersProps;
    setHaveDirtyFields: (isDirty: boolean) => void;
}) => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const [stateEstimationParams, setStateEstimationParams] = useStateEstimationParameters;

    const initialFormValues = useMemo(
        () =>
            stateEstimationParams
                ? fromStateEstimationParametersParamToFormValues(stateEstimationParams?.estimParameters)
                : {},
        [stateEstimationParams]
    );

    const formMethods = useForm<StateEstimationFormType>({
        defaultValues: initialFormValues,
        resolver: yupResolver(stateEstimationParametersFormSchema),
    });
    const { reset, handleSubmit, formState } = formMethods;
    const { snackError } = useSnackMessage();

    const handleTabChange = useCallback((_: SyntheticEvent, newValue: TabValue) => {
        setTabValue(newValue);
    }, []);

    const [tabValue, setTabValue] = useState(TabValue.GENERAL);
    const [tabIndexesWithError, setTabIndexesWithError] = useState<TabValue[]>([]);

    const onValidationError = useCallback(
        (errors?: any) => {
            let tabsInError = [];
            if (errors?.[TabValue.GENERAL] !== undefined) {
                tabsInError.push(TabValue.GENERAL);
            }
            if (errors?.[TabValue.WEIGHTS] !== undefined) {
                tabsInError.push(TabValue.WEIGHTS);
            }
            if (errors?.[TabValue.QUALITY]) {
                tabsInError.push(TabValue.QUALITY);
            }
            if (errors?.[TabValue.LOADBOUNDS]) {
                tabsInError.push(TabValue.LOADBOUNDS);
            }
            setTabIndexesWithError(tabsInError);
        },
        [setTabIndexesWithError]
    );

    const resetStateEstimationParameters = useCallback(() => {
        updateStateEstimationParameters(studyUuid, null).catch((error) => {
            snackWithFallback(snackError, error, { headerId: 'paramsChangingError' });
        });
    }, [studyUuid, snackError]);

    const clear = useCallback(() => {
        resetStateEstimationParameters();
        onValidationError();
    }, [resetStateEstimationParameters, onValidationError]);

    const onSubmit = useCallback(
        (newParams: StateEstimationFormType) => {
            updateStateEstimationParameters(studyUuid, fromStateEstimationParametersFormToParamValues(newParams))
                .then(() => {
                    setStateEstimationParams(fromStateEstimationParametersFormToParamValues(newParams));
                })
                .catch((error) => {
                    snackWithFallback(snackError, error, { headerId: 'updateStateEstimationParametersError' });
                });
            onValidationError();
        },
        [onValidationError, setStateEstimationParams, snackError, studyUuid]
    );

    useEffect(() => {
        if (stateEstimationParams) {
            reset(fromStateEstimationParametersParamToFormValues(stateEstimationParams.estimParameters));
        }
    }, [reset, stateEstimationParams]);

    useEffect(() => {
        setHaveDirtyFields(formState.isDirty);
    }, [formState, setHaveDirtyFields]);

    return (
        <CustomFormProvider validationSchema={stateEstimationParametersFormSchema} {...formMethods}>
            <ParameterLayout
                title="StateEstimation"
                parameterType={ElementType.STATE_ESTIMATION_PARAMETERS}
                isLoading={stateEstimationParams !== null}
                resetHandler={clear}
                validateHandler={handleSubmit(onSubmit, onValidationError)}
            >
                <StateEstimationParametersForm
                    tabValue={tabValue}
                    handleTabChange={handleTabChange}
                    tabIndexesWithError={tabIndexesWithError}
                />
            </ParameterLayout>
        </CustomFormProvider>
    );
};
