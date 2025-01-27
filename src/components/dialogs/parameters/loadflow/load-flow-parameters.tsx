/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    Dispatch,
    FunctionComponent,
    SetStateAction,
    SyntheticEvent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { Box, Grid } from '@mui/material';
import { LabelledButton, styles, useParameterState } from '../parameters';
import { FormattedMessage, useIntl } from 'react-intl';
import { mergeSx } from '../../../utils/functions';
import {
    CustomFormProvider,
    DirectoryItemSelector,
    ElementType,
    SubmitButton,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import CreateParameterDialog from '../common/parameters-creation-dialog';
import { FieldErrors, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    getLimitReductionsFormSchema,
    ILimitReductionsByVoltageLevel,
    IST_FORM,
    LIMIT_DURATION_FORM,
    LIMIT_REDUCTIONS_FORM,
} from '../common/limitreductions/columns-definitions';
import LineSeparator from '../../commons/line-separator';
import { UseParametersBackendReturnProps } from '../parameters.type';
import ComputingType from 'components/computing-status/computing-type';
import { fetchLoadFlowParameters } from 'services/loadflow';
import { toFormValuesLimitReductions } from '../common/limitreductions/limit-reductions-form-util';
import yup from 'components/utils/yup-config';
import { PROVIDER } from 'components/utils/field-constants';
import {
    getCommonLoadFlowParametersFormSchema,
    getDefaultSpecificParamsValues,
    getSpecificLoadFlowParametersFormSchema,
    ParameterDescription,
    TAB_VALUES,
} from './load-flow-parameters-utils';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import RunningStatus from 'components/utils/running-status';
import { PARAM_DEVELOPER_MODE } from 'utils/config-params';
import { LoadFlowProvider } from './load-flow-parameters-context';
import { COMMON_PARAMETERS, SPECIFIC_PARAMETERS, TYPES } from './constants';
import LoadFlowParametersHeader from './load-flow-parameters-header';
import LoadFlowParametersContent from './load-flow-parameters-content';
const LoadFlowParameters: FunctionComponent<{
    parametersBackend: UseParametersBackendReturnProps<ComputingType.LOAD_FLOW>;
    setHaveDirtyFields: Dispatch<SetStateAction<boolean>>;
}> = ({ parametersBackend, setHaveDirtyFields }) => {
    const [
        providers,
        provider,
        ,
        resetProvider,
        params,
        updateParameters,
        resetParameters,
        specificParamsDescriptions,
        defaultLimitReductions,
    ] = parametersBackend;

    const intl = useIntl();
    const [openCreateParameterDialog, setOpenCreateParameterDialog] = useState(false);
    const [openSelectParameterDialog, setOpenSelectParameterDialog] = useState(false);
    const [currentProvider, setCurrentProvider] = useState(params?.provider);
    const [tabIndexesWithError, setTabIndexesWithError] = useState<TAB_VALUES[]>([]);
    const { snackError } = useSnackMessage();
    const loadFlowStatus = useSelector((state: AppState) => state.computingStatus[ComputingType.LOAD_FLOW]);

    const [enableDeveloperMode] = useParameterState(PARAM_DEVELOPER_MODE);

    // TODO: remove this when DynaFlow will be available not only in developer mode
    useEffect(() => {
        if (provider === 'DynaFlow' && !enableDeveloperMode) {
            resetProvider();
        }
    }, [provider, resetProvider, enableDeveloperMode]);

    // TODO: remove this when DynaFlow will be available not only in developer mode
    const formattedProviders = useMemo(() => {
        return Object.entries(providers)
            .filter(([key]) => !key.includes('DynaFlow') || enableDeveloperMode)
            .map(([key, value]) => ({
                id: key,
                label: value,
            }));
    }, [providers, enableDeveloperMode]);

    const resetLFParametersAndProvider = useCallback(() => {
        resetParameters();
        resetProvider();
    }, [resetParameters, resetProvider]);

    const resetLFParameters = useCallback(() => {
        resetParameters();
    }, [resetParameters]);

    const handleLoadParameter = useCallback(
        (newParams: Record<string, any>) => {
            if (newParams && newParams.length > 0) {
                setOpenSelectParameterDialog(false);
                fetchLoadFlowParameters(newParams[0].id)
                    .then((parameters) => {
                        console.info('loading the following loadflow parameters : ' + parameters.uuid);
                        updateParameters({ ...parameters });
                    })
                    .catch((error) => {
                        console.error(error);
                        snackError({
                            messageTxt: error.message,
                            headerId: 'paramsRetrievingError',
                        });
                    });
            }
            setOpenSelectParameterDialog(false);
        },
        [snackError, updateParameters]
    );

    const specificParameters = useMemo(() => {
        const specificParams = currentProvider ? specificParamsDescriptions?.[currentProvider] : undefined;
        return specificParams?.map((param: ParameterDescription) => ({
            name: param.name,
            type: param.type,
            label: param.label,
            description: param.description,
            possibleValues: param.possibleValues,
            defaultValue: param.defaultValue,
        }));
    }, [currentProvider, specificParamsDescriptions]);

    const specificParametersValues = useMemo(() => {
        const specificParams = currentProvider ? specificParamsDescriptions?.[currentProvider] : undefined;
        return getDefaultSpecificParamsValues(specificParams);
    }, [currentProvider, specificParamsDescriptions]);

    const formSchema = useMemo(() => {
        return yup.object({
            [PROVIDER]: yup.string().required(),
            ...getCommonLoadFlowParametersFormSchema().fields,
            ...getLimitReductionsFormSchema(
                params?.limitReductions ? params.limitReductions[0]?.temporaryLimitReductions.length : 0
            ).fields,
            ...getSpecificLoadFlowParametersFormSchema(specificParameters).fields,
        });
    }, [params?.limitReductions, specificParameters]);

    const formMethods = useForm({
        defaultValues: {
            [PROVIDER]: provider,
            [COMMON_PARAMETERS]: {
                ...params?.commonParameters,
            },
            [SPECIFIC_PARAMETERS]: {
                ...specificParametersValues,
            },
            [LIMIT_REDUCTIONS_FORM]: [],
        },
        resolver: yupResolver(formSchema as unknown as yup.ObjectSchema<any>),
    });

    const toLimitReductions = useCallback(
        (formLimits: Record<string, any>[]) => {
            if (formLimits?.length === 0) {
                return [];
            }
            if (!params?.limitReductions) {
                return [];
            }
            return params.limitReductions.map((vlLimits: ILimitReductionsByVoltageLevel, indexVl: number) => {
                let vlLNewLimits: ILimitReductionsByVoltageLevel = {
                    ...vlLimits,
                    permanentLimitReduction: formLimits[indexVl][IST_FORM],
                };
                vlLimits.temporaryLimitReductions.forEach((temporaryLimit, index) => {
                    vlLNewLimits.temporaryLimitReductions[index] = {
                        ...temporaryLimit,
                        reduction: formLimits[indexVl][LIMIT_DURATION_FORM + index],
                    };
                });
                return vlLNewLimits;
            });
        },
        [params?.limitReductions]
    );

    const { handleSubmit, formState, reset } = formMethods;

    const updateLFParameters = useCallback(
        (formData: Record<string, any>) => {
            if (params) {
                setTabIndexesWithError([]);
                updateParameters({
                    ...params,
                    provider: formData[PROVIDER],
                    commonParameters: {
                        ...params.commonParameters,
                        ...formData[COMMON_PARAMETERS],
                    },
                    specificParametersPerProvider: {
                        [formData.provider]: Object.keys(formData[SPECIFIC_PARAMETERS]).reduce(
                            (acc: Record<string, any>, key: string) => {
                                if (
                                    specificParametersValues[key].toString() !==
                                    formData[SPECIFIC_PARAMETERS][key].toString()
                                ) {
                                    acc[key] = formData[SPECIFIC_PARAMETERS][key].toString();
                                }
                                return acc;
                            },
                            {} as Record<string, any>
                        ),
                    },
                    limitReductions: toLimitReductions(formData[LIMIT_REDUCTIONS_FORM]),
                });
            }
        },
        [params, updateParameters, toLimitReductions, specificParametersValues]
    );

    useEffect(() => {
        setHaveDirtyFields(!!Object.keys(formState.dirtyFields).length);
    }, [formState, setHaveDirtyFields]);

    useEffect(() => {
        if (!params) {
            return;
        }
        const specificParams = params.provider ? specificParamsDescriptions?.[params.provider] : undefined;
        const specificParamsPerProvider = params.specificParametersPerProvider[params.provider];

        const formatted = specificParams?.reduce((acc: Record<string, unknown>, param: ParameterDescription) => {
            if (specificParamsPerProvider?.hasOwnProperty(param.name)) {
                if (param.type === TYPES.BOOLEAN) {
                    acc[param.name] = specificParamsPerProvider[param.name] === 'true';
                } else if (param.type === TYPES.STRING_LIST) {
                    acc[param.name] =
                        specificParamsPerProvider[param.name] !== ''
                            ? specificParamsPerProvider[param.name].split(',')
                            : [];
                } else {
                    acc[param.name] = specificParamsPerProvider[param.name];
                }
            } else {
                acc[param.name] = getDefaultSpecificParamsValues([param])[param.name];
            }
            return acc;
        }, {});

        reset({
            [PROVIDER]: params.provider,
            [COMMON_PARAMETERS]: {
                ...params.commonParameters,
            },
            [SPECIFIC_PARAMETERS]: {
                ...formatted,
            },
            ...toFormValuesLimitReductions(params.limitReductions),
        });
    }, [params, reset, specificParamsDescriptions]);

    const [selectedTab, setSelectedTab] = useState(TAB_VALUES.GENERAL);
    const handleTabChange = useCallback((event: SyntheticEvent, newValue: TAB_VALUES) => {
        setSelectedTab(newValue);
    }, []);

    const onValidationError = useCallback(
        (errors: FieldErrors) => {
            const tabsInError = [];
            if (errors?.[LIMIT_REDUCTIONS_FORM] && TAB_VALUES.LIMIT_REDUCTIONS !== selectedTab) {
                tabsInError.push(TAB_VALUES.LIMIT_REDUCTIONS);
            }
            if (
                (errors?.[SPECIFIC_PARAMETERS] || errors?.[COMMON_PARAMETERS] || errors?.[PROVIDER]) &&
                TAB_VALUES.GENERAL !== selectedTab
            ) {
                tabsInError.push(TAB_VALUES.GENERAL);
            }
            setTabIndexesWithError(tabsInError);
        },
        [selectedTab]
    );

    const watchProvider = formMethods.watch('provider');

    useEffect(() => {
        if (watchProvider !== currentProvider) {
            setCurrentProvider(watchProvider);
            const specificParams = watchProvider ? specificParamsDescriptions?.[watchProvider] : undefined;
            const specificParamsValues = getDefaultSpecificParamsValues(specificParams);
            formMethods.setValue(SPECIFIC_PARAMETERS, specificParamsValues);
            formMethods.setValue(
                LIMIT_REDUCTIONS_FORM,
                toFormValuesLimitReductions(defaultLimitReductions)[LIMIT_REDUCTIONS_FORM]
            );
        }
    }, [currentProvider, defaultLimitReductions, formMethods, specificParamsDescriptions, watchProvider]);

    return (
        <LoadFlowProvider>
            <CustomFormProvider validationSchema={formSchema} {...formMethods} removeOptional>
                <Grid item sx={{ height: '100%' }} xl={9} lg={11} md={12}>
                    <Box
                        sx={{
                            height: '100%',
                            display: 'flex',
                            position: 'relative',
                            flexDirection: 'column',
                        }}
                    >
                        <LoadFlowParametersHeader
                            selectedTab={selectedTab}
                            handleTabChange={handleTabChange}
                            tabIndexesWithError={tabIndexesWithError}
                            enableDeveloperMode={enableDeveloperMode}
                            formattedProviders={formattedProviders}
                        />
                        <LoadFlowParametersContent
                            selectedTab={selectedTab}
                            currentProvider={currentProvider ?? ''}
                            specificParameters={specificParameters}
                            params={params}
                            enableDeveloperMode={enableDeveloperMode}
                            defaultLimitReductions={defaultLimitReductions}
                        />
                        <Box sx={{ flexGrow: 0 }}>
                            <LineSeparator />
                            <Grid
                                container
                                item
                                sx={mergeSx(styles.controlParametersItem, styles.marginTopButton, { paddingBottom: 0 })}
                            >
                                <LabelledButton
                                    callback={() => setOpenSelectParameterDialog(true)}
                                    label="settings.button.chooseSettings"
                                />
                                <LabelledButton callback={() => setOpenCreateParameterDialog(true)} label="save" />
                                <LabelledButton callback={resetLFParametersAndProvider} label="resetToDefault" />
                                <LabelledButton label="resetProviderValuesToDefault" callback={resetLFParameters} />
                                <SubmitButton
                                    onClick={handleSubmit(updateLFParameters, onValidationError)}
                                    variant="outlined"
                                    disabled={loadFlowStatus === RunningStatus.RUNNING}
                                >
                                    <FormattedMessage id="validate" />
                                </SubmitButton>
                            </Grid>
                        </Box>
                    </Box>
                </Grid>
                {openCreateParameterDialog && (
                    <CreateParameterDialog
                        open={openCreateParameterDialog}
                        onClose={() => setOpenCreateParameterDialog(false)}
                        parameterValues={() => {
                            return { ...params };
                        }}
                        parameterFormatter={(newParams) => newParams}
                        parameterType={ElementType.LOADFLOW_PARAMETERS}
                    />
                )}

                {openSelectParameterDialog && (
                    <DirectoryItemSelector
                        open={openSelectParameterDialog}
                        onClose={handleLoadParameter}
                        types={[ElementType.LOADFLOW_PARAMETERS]}
                        title={intl.formatMessage({
                            id: 'showSelectParameterDialog',
                        })}
                        onlyLeaves={true}
                        multiSelect={false}
                        validationButtonText={intl.formatMessage({
                            id: 'validate',
                        })}
                    />
                )}
            </CustomFormProvider>
        </LoadFlowProvider>
    );
};

export default LoadFlowParameters;
