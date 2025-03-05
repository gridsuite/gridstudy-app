/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { Dispatch, FunctionComponent, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Grid } from '@mui/material';
import { LabelledButton } from '../parameters';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    CustomFormProvider,
    DirectoryItemSelector,
    ElementType,
    mergeSx,
    MuiSelectInput,
    SubmitButton,
    TreeViewFinderNodeProps,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { fetchSecurityAnalysisParameters } from '../../../../services/security-analysis';
import SecurityAnalysisParametersSelector from './security-analysis-parameters-selector';
import CreateParameterDialog from '../common/parameters-creation-dialog';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    getSAParametersFromSchema,
    ILimitReductionsByVoltageLevel,
    ISAParameters,
    IST_FORM,
    LIMIT_DURATION_FORM,
    LIMIT_REDUCTIONS_FORM,
} from '../common/limitreductions/columns-definitions';
import {
    PARAM_SA_LOW_VOLTAGE_ABSOLUTE_THRESHOLD,
    PARAM_SA_HIGH_VOLTAGE_PROPORTIONAL_THRESHOLD,
    PARAM_SA_FLOW_PROPORTIONAL_THRESHOLD,
    PARAM_SA_HIGH_VOLTAGE_ABSOLUTE_THRESHOLD,
    PARAM_SA_LOW_VOLTAGE_PROPORTIONAL_THRESHOLD,
    PARAM_SA_PROVIDER,
} from 'utils/config-params';
import {
    toFormValueSaParameters,
    toFormValuesLimitReductions,
} from '../common/limitreductions/limit-reductions-form-util';
import LineSeparator from '../../commons/line-separator';
import { UseParametersBackendReturnProps } from '../parameters.type';
import ComputingType from 'components/computing-status/computing-type';
import { styles } from '../parameters-style';
export const SecurityAnalysisParameters: FunctionComponent<{
    parametersBackend: UseParametersBackendReturnProps<ComputingType.SECURITY_ANALYSIS>;
    setHaveDirtyFields: Dispatch<SetStateAction<boolean>>;
}> = ({ parametersBackend, setHaveDirtyFields }) => {
    const [providers, provider, , resetProvider, params, updateParameters, resetParameters, , defaultLimitReductions] =
        parametersBackend;

    const intl = useIntl();
    const [openCreateParameterDialog, setOpenCreateParameterDialog] = useState(false);
    const [openSelectParameterDialog, setOpenSelectParameterDialog] = useState(false);
    const [currentProvider, setCurrentProvider] = useState<string | undefined>(params?.provider);

    const { snackError } = useSnackMessage();

    // TODO: remove this when DynaFlow is supported
    // DynaFlow is not supported at the moment for security analysis
    const securityAnalysisFormattedProviders = useMemo(() => {
        return Object.entries(providers)
            .filter(([key]) => !key.includes('DynaFlow'))
            .map(([key, value]) => ({
                id: key,
                label: value,
            }));
    }, [providers]);

    const formSchema = useMemo(() => {
        return getSAParametersFromSchema(params?.limitReductions);
    }, [params?.limitReductions]);

    const formMethods = useForm({
        defaultValues: {
            [PARAM_SA_PROVIDER]: provider,
            [LIMIT_REDUCTIONS_FORM]: [],
            [PARAM_SA_FLOW_PROPORTIONAL_THRESHOLD]: null,
            [PARAM_SA_LOW_VOLTAGE_PROPORTIONAL_THRESHOLD]: null,
            [PARAM_SA_LOW_VOLTAGE_ABSOLUTE_THRESHOLD]: null,
            [PARAM_SA_HIGH_VOLTAGE_PROPORTIONAL_THRESHOLD]: null,
            [PARAM_SA_HIGH_VOLTAGE_ABSOLUTE_THRESHOLD]: null,
        },
        resolver: yupResolver(formSchema),
    });

    const { handleSubmit, formState, reset, getValues, watch } = formMethods;

    const watchProvider = watch('provider');

    const resetSAParametersAndProvider = useCallback(() => {
        resetParameters();
        resetProvider();
    }, [resetParameters, resetProvider]);

    const resetSAParameters = useCallback(() => {
        resetParameters();
    }, [resetParameters]);

    const handleLoadParameter = useCallback(
        (newParams: TreeViewFinderNodeProps[]) => {
            if (newParams && newParams.length > 0) {
                setOpenSelectParameterDialog(false);
                fetchSecurityAnalysisParameters(newParams[0].id)
                    .then((parameters: ISAParameters) => {
                        console.info('loading the following security analysis parameters : ' + parameters.uuid);
                        reset(toFormValueSaParameters(parameters), {
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
        [reset, snackError]
    );

    const toLimitReductions = useCallback(
        (formLimits: Record<string, any>[]) => {
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

    const formatNewParams = useCallback(
        (formData: Record<string, any>) => {
            return {
                [PARAM_SA_PROVIDER]: formData[PARAM_SA_PROVIDER],
                [PARAM_SA_FLOW_PROPORTIONAL_THRESHOLD]: formData[PARAM_SA_FLOW_PROPORTIONAL_THRESHOLD] / 100,
                [PARAM_SA_LOW_VOLTAGE_PROPORTIONAL_THRESHOLD]:
                    formData[PARAM_SA_LOW_VOLTAGE_PROPORTIONAL_THRESHOLD] / 100,
                [PARAM_SA_LOW_VOLTAGE_ABSOLUTE_THRESHOLD]: formData[PARAM_SA_LOW_VOLTAGE_ABSOLUTE_THRESHOLD],
                [PARAM_SA_HIGH_VOLTAGE_PROPORTIONAL_THRESHOLD]:
                    formData[PARAM_SA_HIGH_VOLTAGE_PROPORTIONAL_THRESHOLD] / 100,
                [PARAM_SA_HIGH_VOLTAGE_ABSOLUTE_THRESHOLD]: formData[PARAM_SA_HIGH_VOLTAGE_ABSOLUTE_THRESHOLD],
                limitReductions: toLimitReductions(formData[LIMIT_REDUCTIONS_FORM]),
            };
        },
        [toLimitReductions]
    );

    const updateSAParameters = useCallback(
        (formData: Record<string, any>) => {
            updateParameters(formatNewParams(formData));
        },
        [updateParameters, formatNewParams]
    );

    useEffect(() => {
        setHaveDirtyFields(!!Object.keys(formState.dirtyFields).length);
    }, [formState, setHaveDirtyFields]);

    useEffect(() => {
        const newProvider = formMethods.getValues(PARAM_SA_PROVIDER) as string;
        if (newProvider !== currentProvider) {
            setCurrentProvider(newProvider);
            if (params !== null) {
                params.limitReductions = defaultLimitReductions;
            }
            formMethods.setValue(
                LIMIT_REDUCTIONS_FORM,
                toFormValuesLimitReductions(defaultLimitReductions)[LIMIT_REDUCTIONS_FORM]
            );
        }
    }, [watchProvider, currentProvider, formMethods, setCurrentProvider, defaultLimitReductions, params]);

    useEffect(() => {
        if (!params) {
            return;
        }
        reset(toFormValueSaParameters(params));
    }, [params, reset]);

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <Grid item sx={{ height: '100%' }} xl={9} lg={11} md={12}>
                <Box
                    sx={{
                        height: '100%',
                        display: 'flex',
                        position: 'relative',
                        flexDirection: 'column',
                    }}
                >
                    <Box sx={{ flexGrow: 0, paddingLeft: 1, paddingTop: 1 }}>
                        <Grid
                            container
                            spacing={1}
                            sx={{
                                padding: 0,
                                paddingBottom: 2,
                                height: 'fit-content',
                            }}
                            justifyContent={'space-between'}
                        >
                            <Grid item xs={'auto'} sx={styles.parameterName}>
                                <FormattedMessage id="Provider" />
                            </Grid>
                            <Grid item xs={'auto'} sx={styles.controlItem}>
                                <MuiSelectInput
                                    name={PARAM_SA_PROVIDER}
                                    size="small"
                                    options={Object.values(securityAnalysisFormattedProviders)}
                                />
                            </Grid>
                            <LineSeparator />
                        </Grid>
                    </Box>
                    <Box
                        sx={{
                            flexGrow: 1,
                            overflow: 'auto',
                            paddingLeft: 1,
                        }}
                    >
                        <Grid
                            container
                            sx={mergeSx(styles.scrollableGrid, {
                                maxHeight: '100%',
                            })}
                        >
                            <SecurityAnalysisParametersSelector
                                params={params}
                                currentProvider={currentProvider?.trim()}
                            />
                        </Grid>
                    </Box>
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
                            <LabelledButton callback={resetSAParametersAndProvider} label="resetToDefault" />
                            <LabelledButton label="resetProviderValuesToDefault" callback={resetSAParameters} />
                            <SubmitButton onClick={handleSubmit(updateSAParameters)} variant="outlined">
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
                    parameterType={ElementType.SECURITY_ANALYSIS_PARAMETERS}
                />
            )}

            {openSelectParameterDialog && (
                <DirectoryItemSelector
                    open={openSelectParameterDialog}
                    onClose={handleLoadParameter}
                    types={[ElementType.SECURITY_ANALYSIS_PARAMETERS]}
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
    );
};
