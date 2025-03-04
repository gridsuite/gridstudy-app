/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Dispatch, SetStateAction, SyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { CustomFormProvider, mergeSx, SubmitButton, useSnackMessage } from '@gridsuite/commons-ui';
import { GENERAL } from '../voltageinit/voltage-init-parameters-form';
import { Button, DialogActions, Grid, Tab, Tabs } from '@mui/material';
import { styles } from '../parameters-style';
import { TabPanel } from '../parameters';
import { getTabIndicatorStyle, getTabStyle } from '../../../utils/tab-utils';
import { FormattedMessage } from 'react-intl';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';
import {
    fromStateEstimationParametersFormToParamValues,
    fromStateEstimationParametersParamToFormValues,
    StateEstimationParametersForm,
    stateEstimationParametersFormSchema,
    TabValue,
} from './state-estimation-parameters-utils';
import { StateEstimationGeneralParameters } from './state-estimation-general-parameters';
import { StateEstimationWeightsParameters } from './state-estimation-weights-parameters';
import { StateEstimationQualityParameters } from './state-estimation-quality-parameters';
import { StateEstimationLoadboundsParameters } from './state-estimation-loadbounds-parameters';
import { updateStateEstimationParameters } from '../../../../services/study/state-estimation';
import { UseGetStateEstimationParametersProps } from './use-get-state-estimation-parameters';

export const StateEstimationParameters = ({
    useStateEstimationParameters,
    setHaveDirtyFields,
}: {
    useStateEstimationParameters: UseGetStateEstimationParametersProps;
    setHaveDirtyFields: Dispatch<SetStateAction<boolean>>;
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

    const formMethods = useForm<StateEstimationParametersForm>({
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
            if (errors?.[GENERAL] !== undefined) {
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
            snackError({
                messageTxt: error.message,
                headerId: 'paramsChangingError',
            });
        });
    }, [studyUuid, snackError]);

    const clear = useCallback(() => {
        resetStateEstimationParameters();
        onValidationError();
    }, [resetStateEstimationParameters, onValidationError]);

    const onSubmit = useCallback(
        (newParams: StateEstimationParametersForm) => {
            updateStateEstimationParameters(studyUuid, fromStateEstimationParametersFormToParamValues(newParams))
                .then(() => {
                    setStateEstimationParams(fromStateEstimationParametersFormToParamValues(newParams));
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error,
                        headerId: 'updateStateEstimationParametersError',
                    });
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
        setHaveDirtyFields(!!Object.keys(formState.dirtyFields).length);
    }, [formState, setHaveDirtyFields]);

    return (
        <CustomFormProvider validationSchema={stateEstimationParametersFormSchema} {...formMethods}>
            <Grid
                xl={[TabValue.GENERAL, TabValue.LOADBOUNDS].includes(tabValue) ? 6 : 12}
                container
                sx={{ height: '100%' }}
                direction="column"
                justifyContent="space-between"
            >
                <Grid
                    xs
                    item
                    container
                    key="stateEstimationParameters"
                    sx={mergeSx(styles.scrollableGrid, {
                        paddingTop: 0,
                        width: '100%',
                        display: 'unset',
                    })}
                >
                    <Tabs
                        value={tabValue}
                        variant="scrollable"
                        onChange={handleTabChange}
                        TabIndicatorProps={{
                            sx: getTabIndicatorStyle(tabIndexesWithError, tabValue),
                        }}
                    >
                        <Tab
                            label={<FormattedMessage id="StateEstimationParametersGeneralTabLabel" />}
                            value={TabValue.GENERAL}
                            sx={getTabStyle(tabIndexesWithError, TabValue.GENERAL)}
                        />
                        <Tab
                            label={<FormattedMessage id="StateEstimationParametersWeightsTabLabel" />}
                            value={TabValue.WEIGHTS}
                            sx={getTabStyle(tabIndexesWithError, TabValue.WEIGHTS)}
                        />
                        <Tab
                            label={<FormattedMessage id="StateEstimationParametersQualityTabLabel" />}
                            value={TabValue.QUALITY}
                            sx={getTabStyle(tabIndexesWithError, TabValue.QUALITY)}
                        />
                        <Tab
                            label={<FormattedMessage id="StateEstimationParametersLoadboundsTabLabel" />}
                            value={TabValue.LOADBOUNDS}
                            sx={getTabStyle(tabIndexesWithError, TabValue.LOADBOUNDS)}
                        />
                    </Tabs>
                    <Grid container>
                        <TabPanel value={tabValue} index={TabValue.GENERAL}>
                            <StateEstimationGeneralParameters />
                        </TabPanel>
                        <TabPanel value={tabValue} index={TabValue.WEIGHTS}>
                            <StateEstimationWeightsParameters />
                        </TabPanel>
                        <TabPanel value={tabValue} index={TabValue.QUALITY}>
                            <StateEstimationQualityParameters />
                        </TabPanel>
                        <TabPanel value={tabValue} index={TabValue.LOADBOUNDS}>
                            <StateEstimationLoadboundsParameters />
                        </TabPanel>
                    </Grid>
                </Grid>

                <Grid item container>
                    <DialogActions
                        sx={mergeSx(styles.controlParametersItem, {
                            paddingTop: 4,
                            paddingBottom: 2,
                            paddingLeft: 0,
                        })}
                    >
                        <Button onClick={clear}>
                            <FormattedMessage id="resetToDefault" />
                        </Button>
                        <SubmitButton variant="outlined" onClick={handleSubmit(onSubmit, onValidationError)} />
                    </DialogActions>
                </Grid>
            </Grid>
        </CustomFormProvider>
    );
};
