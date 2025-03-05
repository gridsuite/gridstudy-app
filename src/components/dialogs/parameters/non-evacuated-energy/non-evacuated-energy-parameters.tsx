/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomFormProvider, mergeSx, MuiSelectInput, SubmitButton, useSnackMessage } from '@gridsuite/commons-ui';
import { Button, DialogActions, Grid } from '@mui/material';
import { FunctionComponent, useCallback, useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import {
    ACTIVATED,
    BRANCHES,
    CONTAINER_ID,
    CONTAINER_NAME,
    CONTINGENCIES,
    GENERATION_STAGES_KIND,
    GENERATION_STAGES_PERCENT_MAXP_1,
    GENERATION_STAGES_PERCENT_MAXP_2,
    GENERATION_STAGES_PERCENT_MAXP_3,
    GENERATORS_CAPPINGS,
    GENERATORS_CAPPINGS_FILTER,
    GENERATORS_CAPPINGS_KIND,
    GENERATORS_LIMIT,
    ID,
    MONITORED_BRANCHES,
    MONITORED_BRANCHES_COEFF_N,
    MONITORED_BRANCHES_COEFF_N_1,
    MONITORED_BRANCHES_IST_N,
    MONITORED_BRANCHES_IST_N_1,
    MONITORED_BRANCHES_LIMIT_NAME_N,
    MONITORED_BRANCHES_LIMIT_NAME_N_1,
    NAME,
    PMAX_PERCENTS,
    PMAX_PERCENTS_INDEX,
    PROVIDER,
    SENSITIVITY_THRESHOLD,
    STAGES_DEFINITION,
    STAGES_DEFINITION_GENERATORS,
    STAGES_DEFINITION_INDEX,
    STAGES_SELECTION,
} from '../../../utils/field-constants';
import { setNonEvacuatedEnergyParameters } from '../../../../services/study/non-evacuated-energy';
import NonEvacuatedEnergyParametersSelector from './non-evacuated-energy-parameters-selector';
import {
    formSchema,
    getContingenciesParams,
    getGenerationStagesDefinitionParams,
    getGenerationStagesSelectionParams,
    getGeneratorsCappingsParams,
    getMonitoredBranchesParams,
    NonEvacuatedEnergyParametersForm,
    UseGetNonEvacuatedEnergyParametersReturnProps,
} from './utils';
import ComputingType from '../../../computing-status/computing-type';
import { AppState } from 'redux/reducer';
import LineSeparator from '../../commons/line-separator';
import { UseParametersBackendReturnProps } from '../parameters.type';
import { EnergySource, NonEvacuatedEnergyParametersInfos } from 'services/study/non-evacuated-energy.type';
import { styles } from '../parameters-style';

interface NonEvacuatedEnergyParametersProps {
    parametersBackend: UseParametersBackendReturnProps<ComputingType.NON_EVACUATED_ENERGY_ANALYSIS>;
    useNonEvacuatedEnergyParameters: UseGetNonEvacuatedEnergyParametersReturnProps;
}

export const NonEvacuatedEnergyParameters: FunctionComponent<NonEvacuatedEnergyParametersProps> = ({
    parametersBackend,
    useNonEvacuatedEnergyParameters,
}) => {
    const { snackError } = useSnackMessage();

    const [providers, provider, updateProvider, resetProvider] = parametersBackend;

    const emptyFormData = useMemo(() => {
        return {
            [PROVIDER]: provider,
            [STAGES_DEFINITION]: [
                {
                    [GENERATION_STAGES_KIND]: EnergySource.WIND,
                    [STAGES_DEFINITION_GENERATORS]: [],
                    [PMAX_PERCENTS]: [100, 100, 100],
                },
                {
                    [GENERATION_STAGES_KIND]: EnergySource.SOLAR,
                    [STAGES_DEFINITION_GENERATORS]: [],
                    [PMAX_PERCENTS]: [100, 100, 100],
                },
                {
                    [GENERATION_STAGES_KIND]: EnergySource.HYDRO,
                    [STAGES_DEFINITION_GENERATORS]: [],
                    [PMAX_PERCENTS]: [100, 100, 100],
                },
            ],
            [STAGES_SELECTION]: [
                { [NAME]: 'WIND_100-SOLAR_100-HYDRO_100', [ACTIVATED]: true },
                { [NAME]: 'WIND_100-SOLAR_100-HYDRO_100', [ACTIVATED]: true },
                { [NAME]: 'WIND_100-SOLAR_100-HYDRO_100', [ACTIVATED]: true },
                { [NAME]: 'WIND_100-SOLAR_100-HYDRO_100', [ACTIVATED]: true },
                { [NAME]: 'WIND_100-SOLAR_100-HYDRO_100', [ACTIVATED]: true },
                { [NAME]: 'WIND_100-SOLAR_100-HYDRO_100', [ACTIVATED]: true },
                { [NAME]: 'WIND_100-SOLAR_100-HYDRO_100', [ACTIVATED]: true },
                { [NAME]: 'WIND_100-SOLAR_100-HYDRO_100', [ACTIVATED]: true },
                { [NAME]: 'WIND_100-SOLAR_100-HYDRO_100', [ACTIVATED]: true },
                { [NAME]: 'WIND_100-SOLAR_100-HYDRO_100', [ACTIVATED]: true },
                { [NAME]: 'WIND_100-SOLAR_100-HYDRO_100', [ACTIVATED]: true },
                { [NAME]: 'WIND_100-SOLAR_100-HYDRO_100', [ACTIVATED]: true },
                { [NAME]: 'WIND_100-SOLAR_100-HYDRO_100', [ACTIVATED]: true },
                { [NAME]: 'WIND_100-SOLAR_100-HYDRO_100', [ACTIVATED]: true },
                { [NAME]: 'WIND_100-SOLAR_100-HYDRO_100', [ACTIVATED]: true },
                { [NAME]: 'WIND_100-SOLAR_100-HYDRO_100', [ACTIVATED]: true },
                { [NAME]: 'WIND_100-SOLAR_100-HYDRO_100', [ACTIVATED]: true },
                { [NAME]: 'WIND_100-SOLAR_100-HYDRO_100', [ACTIVATED]: true },
                { [NAME]: 'WIND_100-SOLAR_100-HYDRO_100', [ACTIVATED]: true },
                { [NAME]: 'WIND_100-SOLAR_100-HYDRO_100', [ACTIVATED]: true },
                { [NAME]: 'WIND_100-SOLAR_100-HYDRO_100', [ACTIVATED]: true },
                { [NAME]: 'WIND_100-SOLAR_100-HYDRO_100', [ACTIVATED]: true },
                { [NAME]: 'WIND_100-SOLAR_100-HYDRO_100', [ACTIVATED]: true },
                { [NAME]: 'WIND_100-SOLAR_100-HYDRO_100', [ACTIVATED]: true },
                { [NAME]: 'WIND_100-SOLAR_100-HYDRO_100', [ACTIVATED]: true },
                { [NAME]: 'WIND_100-SOLAR_100-HYDRO_100', [ACTIVATED]: true },
                { [NAME]: 'WIND_100-SOLAR_100-HYDRO_100', [ACTIVATED]: true },
            ],
            [GENERATORS_CAPPINGS]: {
                [SENSITIVITY_THRESHOLD]: 0.01,
                [GENERATORS_CAPPINGS]: [],
            },
            [MONITORED_BRANCHES]: [],
            [CONTINGENCIES]: [],
        };
    }, [provider]);
    const formMethods = useForm<NonEvacuatedEnergyParametersForm>({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, handleSubmit, setValue, getValues, watch } = formMethods;
    const studyUuid = useSelector((state: AppState) => state.studyUuid);

    const [nonEvacuatedEnergyParams, setNonEvacuatedEnergyParams] = useNonEvacuatedEnergyParameters;

    const resetNonEvacuatedEnergyParameters = useCallback(() => {
        setNonEvacuatedEnergyParameters(studyUuid, emptyFormData).catch((error) => {
            snackError({
                messageTxt: error.message,
                headerId: 'paramsChangingError',
            });
        });
    }, [studyUuid, emptyFormData, snackError]);

    const formatNewParams = useCallback((newParams: NonEvacuatedEnergyParametersForm, withProvider = true) => {
        let params: NonEvacuatedEnergyParametersInfos = {
            ...getGenerationStagesDefinitionParams(newParams),
            ...getGenerationStagesSelectionParams(newParams),
            [GENERATORS_LIMIT]: getGeneratorsCappingsParams(
                newParams[GENERATORS_CAPPINGS][SENSITIVITY_THRESHOLD],
                newParams[GENERATORS_CAPPINGS]
            ),
            ...getMonitoredBranchesParams(newParams),
            ...getContingenciesParams(newParams),
        };
        return withProvider
            ? params
            : {
                  [PROVIDER]: newParams[PROVIDER],
                  ...params,
              };
    }, []);

    const onSubmit = useCallback(
        (newParams: NonEvacuatedEnergyParametersForm) => {
            setNonEvacuatedEnergyParameters(studyUuid, formatNewParams(newParams, true))
                .then(() => {
                    setNonEvacuatedEnergyParams(formatNewParams(newParams, false));
                    updateProvider(newParams[PROVIDER]);
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'updateNonEvacuatedEnergyParametersError',
                    });
                });
        },
        [setNonEvacuatedEnergyParams, snackError, studyUuid, formatNewParams, updateProvider]
    );

    const fromNonEvacuatedEnergyParamsDataToFormValues = useCallback(
        (parameters: any) => {
            // left to any because there is probably a confusion here...
            // parameters can be "nonEvacuatedEnergyParams" or "emptyFormData", they don't have the same structure
            // for instance, "nonEvacuatedEnergyParams" does not have "provider" field
            reset({
                [PROVIDER]: parameters[PROVIDER],
                [STAGES_DEFINITION]:
                    parameters[STAGES_DEFINITION]?.map((stageDefinition: any) => {
                        return {
                            [GENERATION_STAGES_KIND]: stageDefinition[GENERATION_STAGES_KIND],
                            [STAGES_DEFINITION_GENERATORS]: stageDefinition[STAGES_DEFINITION_GENERATORS]?.map(
                                (generationStageFilter: any) => {
                                    return {
                                        [ID]: generationStageFilter[CONTAINER_ID],
                                        [NAME]: generationStageFilter[CONTAINER_NAME],
                                    };
                                }
                            ),
                            [GENERATION_STAGES_PERCENT_MAXP_1]: stageDefinition[PMAX_PERCENTS]?.[0],
                            [GENERATION_STAGES_PERCENT_MAXP_2]: stageDefinition[PMAX_PERCENTS]?.[1],
                            [GENERATION_STAGES_PERCENT_MAXP_3]: stageDefinition[PMAX_PERCENTS]?.[2],
                        };
                    }) ?? [],

                [STAGES_SELECTION]:
                    parameters[STAGES_SELECTION]?.map((stageSelection: any) => {
                        return {
                            [ACTIVATED]: stageSelection[ACTIVATED],
                            [NAME]: stageSelection[NAME],
                            [STAGES_DEFINITION_INDEX]: stageSelection[STAGES_DEFINITION_INDEX],
                            [PMAX_PERCENTS_INDEX]: stageSelection[PMAX_PERCENTS_INDEX],
                        };
                    }) ?? [],
                [GENERATORS_CAPPINGS]: {
                    [SENSITIVITY_THRESHOLD]: parameters[GENERATORS_LIMIT][SENSITIVITY_THRESHOLD],
                    [GENERATORS_CAPPINGS]:
                        parameters[GENERATORS_LIMIT][GENERATORS_CAPPINGS_FILTER]?.map((generatorCappings: any) => {
                            return {
                                [GENERATORS_CAPPINGS_KIND]: generatorCappings[GENERATORS_CAPPINGS_KIND],
                                [GENERATORS_CAPPINGS_FILTER]: generatorCappings[GENERATORS_CAPPINGS_FILTER].map(
                                    (generatorFilter: any) => {
                                        return {
                                            [ID]: generatorFilter[CONTAINER_ID],
                                            [NAME]: generatorFilter[CONTAINER_NAME],
                                        };
                                    }
                                ),
                                [ACTIVATED]: generatorCappings[ACTIVATED],
                            };
                        }) ?? [],
                },
                [MONITORED_BRANCHES]:
                    parameters[MONITORED_BRANCHES]?.map((monitoredBranches: any) => {
                        return {
                            [BRANCHES]: monitoredBranches[BRANCHES].map((monitoredBranchFilter: any) => {
                                return {
                                    [ID]: monitoredBranchFilter[CONTAINER_ID],
                                    [NAME]: monitoredBranchFilter[CONTAINER_NAME],
                                };
                            }),

                            [MONITORED_BRANCHES_IST_N]: monitoredBranches[MONITORED_BRANCHES_IST_N],
                            [MONITORED_BRANCHES_LIMIT_NAME_N]: monitoredBranches[MONITORED_BRANCHES_LIMIT_NAME_N],
                            [MONITORED_BRANCHES_COEFF_N]: monitoredBranches[MONITORED_BRANCHES_COEFF_N],
                            [MONITORED_BRANCHES_IST_N_1]: monitoredBranches[MONITORED_BRANCHES_IST_N_1],
                            [MONITORED_BRANCHES_LIMIT_NAME_N_1]: monitoredBranches[MONITORED_BRANCHES_LIMIT_NAME_N_1],
                            [MONITORED_BRANCHES_COEFF_N_1]: monitoredBranches[MONITORED_BRANCHES_COEFF_N_1],
                            [ACTIVATED]: monitoredBranches[ACTIVATED],
                        };
                    }) ?? [],

                [CONTINGENCIES]:
                    parameters[CONTINGENCIES]?.map((contingencies: any) => {
                        return {
                            [CONTINGENCIES]: contingencies[CONTINGENCIES].map((contingency: any) => {
                                return {
                                    [ID]: contingency[CONTAINER_ID],
                                    [NAME]: contingency[CONTAINER_NAME],
                                };
                            }),
                            [ACTIVATED]: contingencies[ACTIVATED],
                        };
                    }) ?? [],
            });
        },
        [reset]
    );

    const combineStagesDefinition = useCallback(
        (stagesDefinition: NonEvacuatedEnergyParametersForm['stagesDefinition']) => {
            if (!stagesDefinition) {
                return [];
            }
            const stagesDefinitionsCount = 3; // only 3 stage definitions
            const stagesPmaxPercentsCount = 3; // only 3 pmax percents
            const stagesSelectionsCount = Math.pow(stagesPmaxPercentsCount, stagesDefinitionsCount);
            let res = [];
            for (let i = 0; i < stagesSelectionsCount; ++i) {
                const indexPmax1 = Math.trunc(i / (stagesPmaxPercentsCount * stagesPmaxPercentsCount));
                const indexPmax2 = Math.trunc(i / stagesPmaxPercentsCount) % stagesPmaxPercentsCount;
                const indexPmax3 = i % stagesPmaxPercentsCount;
                const valPmax1 =
                    indexPmax1 === 0
                        ? stagesDefinition[0][GENERATION_STAGES_PERCENT_MAXP_1]
                        : indexPmax1 === 1
                        ? stagesDefinition[0][GENERATION_STAGES_PERCENT_MAXP_2]
                        : stagesDefinition[0][GENERATION_STAGES_PERCENT_MAXP_3];
                const valPmax2 =
                    indexPmax2 === 0
                        ? stagesDefinition[1][GENERATION_STAGES_PERCENT_MAXP_1]
                        : indexPmax2 === 1
                        ? stagesDefinition[1][GENERATION_STAGES_PERCENT_MAXP_2]
                        : stagesDefinition[1][GENERATION_STAGES_PERCENT_MAXP_3];
                const valPmax3 =
                    indexPmax3 === 0
                        ? stagesDefinition[2][GENERATION_STAGES_PERCENT_MAXP_1]
                        : indexPmax3 === 1
                        ? stagesDefinition[2][GENERATION_STAGES_PERCENT_MAXP_2]
                        : stagesDefinition[2][GENERATION_STAGES_PERCENT_MAXP_3];
                let stageSelection = {
                    [ACTIVATED]: true,
                    [NAME]:
                        stagesDefinition[0][GENERATION_STAGES_KIND] +
                        '_' +
                        valPmax1 +
                        '-' +
                        stagesDefinition[1][GENERATION_STAGES_KIND] +
                        '_' +
                        valPmax2 +
                        '-' +
                        stagesDefinition[2][GENERATION_STAGES_KIND] +
                        '_' +
                        valPmax3,
                    [STAGES_DEFINITION_INDEX]: Array.from(Array(stagesDefinitionsCount).keys()),
                    [PMAX_PERCENTS_INDEX]: [indexPmax1, indexPmax2, indexPmax3],
                };
                res.push(stageSelection);
            }
            return res;
        },
        []
    );

    const generateStagesSelection = useCallback(() => {
        setValue(STAGES_SELECTION, combineStagesDefinition(getValues()[STAGES_DEFINITION]), { shouldDirty: true });
    }, [setValue, getValues, combineStagesDefinition]);

    useEffect(() => {
        if (!nonEvacuatedEnergyParams) {
            return;
        }
        let params =
            nonEvacuatedEnergyParams[STAGES_DEFINITION] && nonEvacuatedEnergyParams[STAGES_DEFINITION].length > 0
                ? nonEvacuatedEnergyParams
                : emptyFormData;
        fromNonEvacuatedEnergyParamsDataToFormValues(params);
    }, [fromNonEvacuatedEnergyParamsDataToFormValues, nonEvacuatedEnergyParams, parametersBackend, emptyFormData]);

    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            if (type === 'change' && name?.trim().startsWith(STAGES_DEFINITION)) {
                // a change has been made in the stages definition :
                // ==> regeneration of the stages selection
                generateStagesSelection();
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, generateStagesSelection]);

    const clear = useCallback(() => {
        reset(emptyFormData);
        resetProvider();
        resetNonEvacuatedEnergyParameters();
    }, [emptyFormData, reset, resetProvider, resetNonEvacuatedEnergyParameters]);

    const onFormChanged = () => {};
    const onChangeParams = () => {};

    return (
        <>
            <CustomFormProvider validationSchema={formSchema} {...formMethods}>
                <Grid container spacing={1} paddingTop={1}>
                    <Grid item xs={8} sx={styles.parameterName}>
                        <FormattedMessage id="Provider" />
                    </Grid>
                    <Grid item xs={4} sx={styles.controlItem}>
                        <MuiSelectInput
                            fullWidth
                            name={PROVIDER}
                            size="small"
                            options={Object.values(providers).map((provider) => {
                                return { id: provider, label: provider };
                            })}
                        />
                    </Grid>
                </Grid>
                <Grid container sx={styles.scrollableGrid} key="nonEvacuatedEnergyParameters">
                    <Grid container paddingTop={1} paddingBottom={1}>
                        <LineSeparator />
                    </Grid>
                    <NonEvacuatedEnergyParametersSelector
                        onFormChanged={onFormChanged}
                        onChangeParams={onChangeParams}
                    />
                </Grid>

                <Grid item container>
                    <DialogActions
                        sx={mergeSx(styles.controlParametersItem, {
                            paddingLeft: 0,
                            paddingBottom: 2,
                        })}
                    >
                        <Button onClick={clear}>
                            <FormattedMessage id="resetToDefault" />
                        </Button>
                        <SubmitButton onClick={handleSubmit(onSubmit)} variant="outlined">
                            <FormattedMessage id="validate" />
                        </SubmitButton>
                    </DialogActions>
                </Grid>
            </CustomFormProvider>
        </>
    );
};
