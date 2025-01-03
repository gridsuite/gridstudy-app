/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Dispatch, FunctionComponent, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Grid, SelectChangeEvent } from '@mui/material';
import { DropDown, LabelledButton, styles } from '../parameters';
import { FormattedMessage, useIntl } from 'react-intl';
import { mergeSx } from '../../../utils/functions';
import {
    CustomFormProvider,
    DirectoryItemSelector,
    ElementType,
    SubmitButton,
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
} from 'utils/config-params';
import { toFormValueSaParameters } from '../common/limitreductions/limit-reductions-form-util';
import LineSeparator from '../../commons/line-separator';
import { UseParametersBackendReturnProps } from '../parameters.type';
import ComputingType from 'components/computing-status/computing-type';
export const SecurityAnalysisParameters: FunctionComponent<{
    parametersBackend: UseParametersBackendReturnProps<ComputingType.SECURITY_ANALYSIS>;
    setHaveDirtyFields: Dispatch<SetStateAction<boolean>>;
}> = ({ parametersBackend, setHaveDirtyFields }) => {
    const [providers, provider, updateProvider, resetProvider, params, updateParameters, resetParameters] =
        parametersBackend;

    const handleUpdateProvider = (evt: SelectChangeEvent<string>) => updateProvider(evt.target.value);

    const updateProviderCallback = useCallback(handleUpdateProvider, [updateProvider]);
    const intl = useIntl();
    const [openCreateParameterDialog, setOpenCreateParameterDialog] = useState(false);
    const [openSelectParameterDialog, setOpenSelectParameterDialog] = useState(false);
    const { snackError } = useSnackMessage();

    // TODO: remove this when DynaFlow is supported
    // DynaFlow is not supported at the moment for security analysis
    const securityAnalysisProvider = Object.fromEntries(
        Object.entries(providers).filter(([key]) => !key.includes('DynaFlow'))
    );

    const resetSAParametersAndProvider = useCallback(() => {
        resetParameters();
        resetProvider();
    }, [resetParameters, resetProvider]);

    const resetSAParameters = useCallback(() => {
        resetParameters();
    }, [resetParameters]);

    const handleLoadParameter = useCallback(
        (newParams: Record<string, any>) => {
            if (newParams && newParams.length > 0) {
                setOpenSelectParameterDialog(false);
                fetchSecurityAnalysisParameters(newParams[0].id)
                    .then((parameters) => {
                        console.info('loading the following security analysis parameters : ' + parameters.uuid);
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
    const formSchema = useMemo(() => {
        return getSAParametersFromSchema(params?.limitReductions);
    }, [params?.limitReductions]);

    const formMethods = useForm({
        defaultValues: {
            [LIMIT_REDUCTIONS_FORM]: [],
            [PARAM_SA_FLOW_PROPORTIONAL_THRESHOLD]: null,
            [PARAM_SA_LOW_VOLTAGE_PROPORTIONAL_THRESHOLD]: null,
            [PARAM_SA_LOW_VOLTAGE_ABSOLUTE_THRESHOLD]: null,
            [PARAM_SA_HIGH_VOLTAGE_PROPORTIONAL_THRESHOLD]: null,
            [PARAM_SA_HIGH_VOLTAGE_ABSOLUTE_THRESHOLD]: null,
        },
        resolver: yupResolver(formSchema),
    });

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

    const { handleSubmit, formState, reset } = formMethods;

    const updateSAParameters = useCallback(
        //remove any type since we now know what to expect according to yup schema
        (formLimits: Record<string, any>) => {
            updateParameters({
                ...params,
                [PARAM_SA_FLOW_PROPORTIONAL_THRESHOLD]: formLimits[PARAM_SA_FLOW_PROPORTIONAL_THRESHOLD] / 100,
                [PARAM_SA_LOW_VOLTAGE_PROPORTIONAL_THRESHOLD]:
                    formLimits[PARAM_SA_LOW_VOLTAGE_PROPORTIONAL_THRESHOLD] / 100,
                [PARAM_SA_LOW_VOLTAGE_ABSOLUTE_THRESHOLD]: formLimits[PARAM_SA_LOW_VOLTAGE_ABSOLUTE_THRESHOLD],
                [PARAM_SA_HIGH_VOLTAGE_PROPORTIONAL_THRESHOLD]:
                    formLimits[PARAM_SA_HIGH_VOLTAGE_PROPORTIONAL_THRESHOLD] / 100,
                [PARAM_SA_HIGH_VOLTAGE_ABSOLUTE_THRESHOLD]: formLimits[PARAM_SA_HIGH_VOLTAGE_ABSOLUTE_THRESHOLD],
                limitReductions: toLimitReductions(formLimits[LIMIT_REDUCTIONS_FORM]),
            });
        },
        [params, updateParameters, toLimitReductions]
    );

    useEffect(() => {
        setHaveDirtyFields(!!Object.keys(formState.dirtyFields).length);
    }, [formState, setHaveDirtyFields]);

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
                            <DropDown
                                value={provider ?? ''}
                                label="Provider"
                                values={securityAnalysisProvider}
                                callback={updateProviderCallback}
                            />
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
                            <SecurityAnalysisParametersSelector params={params} />
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
                    parameterValues={() => {
                        return { ...params };
                    }}
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
                    multiselect={false}
                    validationButtonText={intl.formatMessage({
                        id: 'validate',
                    })}
                />
            )}
        </CustomFormProvider>
    );
};
