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
import { LabelledButton } from '../parameters';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    CustomFormProvider,
    DirectoryItemSelector,
    ElementType,
    mergeSx,
    SubmitButton,
    TreeViewFinderNodeProps,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import CreateParameterDialog from '../common/parameters-creation-dialog';
import { FieldErrors, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { getLimitReductionsFormSchema, LIMIT_REDUCTIONS_FORM } from '../common/limitreductions/columns-definitions';
import LineSeparator from '../../commons/line-separator';
import { ParameterType, SpecificParameterInfos, UseParametersBackendReturnProps } from '../parameters.type';
import ComputingType from 'components/computing-status/computing-type';
import { fetchLoadFlowParameters } from 'services/loadflow';
import { toFormValuesLimitReductions } from '../common/limitreductions/limit-reductions-form-util';
import yup from 'components/utils/yup-config';
import { PROVIDER } from 'components/utils/field-constants';
import {
    getCommonLoadFlowParametersFormSchema,
    getDefaultSpecificParamsValues,
    getSpecificLoadFlowParametersFormSchema,
    mapLimitReductions,
    setLimitReductions,
    setSpecificParameters,
    TAB_VALUES,
} from './load-flow-parameters-utils';
import { PARAM_DEVELOPER_MODE, PARAM_LIMIT_REDUCTION, PARAM_PROVIDER_OPENLOADFLOW } from 'utils/config-params';
import { COMMON_PARAMETERS, SPECIFIC_PARAMETERS } from './constants';
import LoadFlowParametersHeader from './load-flow-parameters-header';
import LoadFlowParametersContent from './load-flow-parameters-content';
import { LoadFlowParametersInfos, SpecificParametersPerProvider } from 'services/study/loadflow.type';
import { LoadFlowProvider } from './load-flow-parameters-provider';
import { useParameterState } from '../use-parameters-state';
import { styles } from '../parameters-style';

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

    const specificParameters = useMemo(() => {
        const specificParams = currentProvider ? specificParamsDescriptions?.[currentProvider] : undefined;
        return specificParams?.map((param: SpecificParameterInfos) => ({
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
            [PARAM_LIMIT_REDUCTION]: yup.number().nullable(),
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
            [PARAM_LIMIT_REDUCTION]: null,
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

    const { handleSubmit, formState, reset, getValues, watch } = formMethods;

    const watchProvider = watch('provider');

    const toLoadFlowFormValues = useCallback(
        (params: LoadFlowParametersInfos) => {
            const specificParams = params.provider ? specificParamsDescriptions?.[params.provider] : undefined;
            const specificParamsPerProvider = params.specificParametersPerProvider[params.provider];

            const formatted = specificParams?.reduce((acc: Record<string, unknown>, param: SpecificParameterInfos) => {
                if (specificParamsPerProvider?.hasOwnProperty(param.name)) {
                    if (param.type === ParameterType.BOOLEAN) {
                        acc[param.name] = specificParamsPerProvider[param.name] === 'true';
                    } else if (param.type === ParameterType.STRING_LIST) {
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

            return {
                [PROVIDER]: params.provider,
                [PARAM_LIMIT_REDUCTION]: params.limitReduction,
                [COMMON_PARAMETERS]: {
                    ...params.commonParameters,
                },
                [SPECIFIC_PARAMETERS]: {
                    ...formatted,
                },
                ...toFormValuesLimitReductions(params.limitReductions),
            };
        },
        [specificParamsDescriptions]
    );

    const handleLoadParameter = useCallback(
        (newParams: TreeViewFinderNodeProps[]) => {
            if (newParams && newParams.length > 0) {
                setOpenSelectParameterDialog(false);
                fetchLoadFlowParameters(newParams[0].id)
                    .then((parameters) => {
                        setCurrentProvider(parameters.provider);
                        console.info('loading the following loadflow parameters : ' + parameters.uuid);
                        reset(toLoadFlowFormValues(parameters), {
                            keepDefaultValues: true,
                        });
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
        [reset, snackError, toLoadFlowFormValues]
    );

    const toLimitReductions = useCallback(
        (formLimits: Record<string, any>[]) => {
            if (formLimits?.length === 0) {
                return [];
            }
            if (watchProvider === PARAM_PROVIDER_OPENLOADFLOW) {
                if (!params?.limitReductions) {
                    return defaultLimitReductions.map((vlLimits, indexVl) =>
                        mapLimitReductions(vlLimits, formLimits, indexVl)
                    );
                }
                return params?.limitReductions.map((vlLimits, indexVl) =>
                    mapLimitReductions(vlLimits, formLimits, indexVl)
                );
            }
            return [];
        },
        [defaultLimitReductions, params?.limitReductions, watchProvider]
    );

    const getSpecificParametersPerProvider = (
        formData: Record<string, any>,
        specificParametersValues: SpecificParametersPerProvider
    ) => {
        return Object.keys(formData[SPECIFIC_PARAMETERS]).reduce((acc: Record<string, any>, key: string) => {
            if (specificParametersValues[key].toString() !== formData[SPECIFIC_PARAMETERS][key].toString()) {
                acc[key] = formData[SPECIFIC_PARAMETERS][key].toString();
            }
            return acc;
        }, {} as Record<string, any>);
    };

    const formatNewParams = useCallback(
        (formData: Record<string, any>): LoadFlowParametersInfos => {
            return {
                provider: formData[PROVIDER],
                limitReduction: formData[PARAM_LIMIT_REDUCTION],
                commonParameters: {
                    ...formData[COMMON_PARAMETERS],
                },
                specificParametersPerProvider: {
                    [formData.provider]: getSpecificParametersPerProvider(formData, specificParametersValues),
                },
                limitReductions: toLimitReductions(formData[LIMIT_REDUCTIONS_FORM]),
            };
        },
        [specificParametersValues, toLimitReductions]
    );

    const updateLFParameters = useCallback(
        (formData: Record<string, any>) => {
            setTabIndexesWithError([]);
            updateParameters(formatNewParams(formData));
        },
        [updateParameters, formatNewParams]
    );

    useEffect(() => {
        setHaveDirtyFields(!!Object.keys(formState.dirtyFields).length);
    }, [formState, setHaveDirtyFields]);

    useEffect(() => {
        if (!params) {
            return;
        }
        reset(toLoadFlowFormValues(params));
    }, [params, reset, specificParamsDescriptions, toLoadFlowFormValues]);

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

    useEffect(() => {
        if (watchProvider !== currentProvider) {
            setCurrentProvider(watchProvider);
            setSpecificParameters(watchProvider, specificParamsDescriptions, formMethods);
            setLimitReductions(watchProvider, defaultLimitReductions, formMethods);
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
                            formattedProviders={formattedProviders}
                        />
                        <LoadFlowParametersContent
                            selectedTab={selectedTab}
                            currentProvider={currentProvider ?? ''}
                            specificParameters={specificParameters}
                            params={params}
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
                        parameterValues={() => formatNewParams(getValues())}
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
