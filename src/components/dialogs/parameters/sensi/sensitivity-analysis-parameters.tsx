/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
import { Button, DialogActions, Grid } from '@mui/material';
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import {
    ACTIVATED,
    ANGLE_FLOW_SENSITIVITY_VALUE_THRESHOLD,
    CONTAINER_ID,
    CONTAINER_NAME,
    CONTINGENCIES,
    COUNT,
    DISTRIBUTION_TYPE,
    EQUIPMENTS_IN_VOLTAGE_REGULATION,
    FLOW_FLOW_SENSITIVITY_VALUE_THRESHOLD,
    FLOW_VOLTAGE_SENSITIVITY_VALUE_THRESHOLD,
    HVDC_LINES,
    ID,
    INJECTIONS,
    MONITORED_BRANCHES,
    NAME,
    PARAMETER_SENSI_HVDC,
    PARAMETER_SENSI_INJECTION,
    PARAMETER_SENSI_INJECTIONS_SET,
    PARAMETER_SENSI_NODES,
    PARAMETER_SENSI_PST,
    PROVIDER,
    PSTS,
    SENSI_INJECTIONS_SET,
    SENSITIVITY_TYPE,
    SUPERVISED_VOLTAGE_LEVELS,
} from '../../../utils/field-constants';
import {
    fetchSensitivityAnalysisParameters,
    getSensitivityAnalysisFactorsCount,
    setSensitivityAnalysisParameters,
} from '../../../../services/study/sensitivity-analysis';
import SensitivityAnalysisFields from './sensitivity-Flow-parameters';
import SensitivityParametersSelector from './sensitivity-parameters-selector';
import {
    formSchema,
    getGenericRowNewParams,
    getSensiHvdcformatNewParams,
    getSensiInjectionsformatNewParams,
    getSensiInjectionsSetformatNewParams,
    getSensiNodesformatNewParams,
    getSensiPstformatNewParams,
    IRowNewParams,
    SensitivityAnalysisParametersFormSchema,
} from './utils';
import CreateParameterDialog from '../common/parameters-creation-dialog';
import LineSeparator from '../../commons/line-separator';
import { AppState } from 'redux/reducer';
import { SensitivityAnalysisParametersInfos } from 'services/study/sensitivity-analysis.type';
import ComputingType from 'components/computing-status/computing-type';
import { UseParametersBackendReturnProps } from '../parameters.type';
import { styles } from '../parameters-style';

interface SensitivityAnalysisParametersProps {
    parametersBackend: UseParametersBackendReturnProps<ComputingType.SENSITIVITY_ANALYSIS>;
    setHaveDirtyFields: any;
}

const numberMax = 500000;

export const SensitivityAnalysisParameters: FunctionComponent<SensitivityAnalysisParametersProps> = ({
    parametersBackend,
    setHaveDirtyFields,
}) => {
    const intl = useIntl();
    const { snackError } = useSnackMessage();

    const [launchLoader, setLaunchLoader] = useState(false);
    const [isSubmitAction, setIsSubmitAction] = useState(false);
    const [analysisComputeComplexity, setAnalysisComputeComplexity] = useState(0);
    const [providers, , , , params, updateParameters] = parametersBackend;
    const [openCreateParameterDialog, setOpenCreateParameterDialog] = useState(false);
    const [openSelectParameterDialog, setOpenSelectParameterDialog] = useState(false);

    const formattedProviders = Object.keys(providers).map((key) => ({
        id: key,
        label: providers[key],
    }));

    const emptyFormData = useMemo(() => {
        return {
            [PROVIDER]: '',
            [FLOW_FLOW_SENSITIVITY_VALUE_THRESHOLD]: 0,
            [ANGLE_FLOW_SENSITIVITY_VALUE_THRESHOLD]: 0,
            [FLOW_VOLTAGE_SENSITIVITY_VALUE_THRESHOLD]: 0,
            [PARAMETER_SENSI_INJECTIONS_SET]: [],
            [PARAMETER_SENSI_INJECTION]: [],
            [PARAMETER_SENSI_HVDC]: [],
            [PARAMETER_SENSI_PST]: [],
            [PARAMETER_SENSI_NODES]: [],
        };
    }, []);

    const formMethods = useForm<SensitivityAnalysisParametersFormSchema>({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, handleSubmit, formState, getValues, setValue } = formMethods;
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const [sensitivityAnalysisParams, setSensitivityAnalysisParams] = useState(params);

    const resetSensitivityAnalysisParameters = useCallback(() => {
        setSensitivityAnalysisParameters(studyUuid, null).catch((error) => {
            snackError({
                messageTxt: error.message,
                headerId: 'paramsChangingError',
            });
        });
    }, [studyUuid, snackError]);

    const formatNewParams = useCallback(
        (newParams: SensitivityAnalysisParametersFormSchema): SensitivityAnalysisParametersInfos => {
            return {
                [PROVIDER]: newParams[PROVIDER],
                [FLOW_FLOW_SENSITIVITY_VALUE_THRESHOLD]: newParams[FLOW_FLOW_SENSITIVITY_VALUE_THRESHOLD],
                [ANGLE_FLOW_SENSITIVITY_VALUE_THRESHOLD]: newParams[ANGLE_FLOW_SENSITIVITY_VALUE_THRESHOLD],
                [FLOW_VOLTAGE_SENSITIVITY_VALUE_THRESHOLD]: newParams[FLOW_VOLTAGE_SENSITIVITY_VALUE_THRESHOLD],
                ...getSensiInjectionsSetformatNewParams(newParams),
                ...getSensiInjectionsformatNewParams(newParams),
                ...getSensiHvdcformatNewParams(newParams),
                ...getSensiPstformatNewParams(newParams),
                ...getSensiNodesformatNewParams(newParams),
            };
        },
        []
    );

    const formatFilteredParams = useCallback((row: IRowNewParams) => {
        return getGenericRowNewParams(row);
    }, []);

    type SubTabsValues = 'sensitivityInjectionsSet' | 'sensitivityInjection' | 'sensitivityHVDC' | 'sensitivityPST';
    const getResultCount = useCallback(() => {
        const values = getValues();
        let totalResultCount = 0;
        const tabsToCheck: SubTabsValues[] = [
            'sensitivityInjectionsSet',
            'sensitivityInjection',
            'sensitivityHVDC',
            'sensitivityPST',
        ];
        tabsToCheck.forEach((tab) => {
            const tabToCheck = values[tab] as any[] | undefined;
            // TODO: not easy to fix any here since values[SubTabsValues] have each time different type which causes problems with "filter"
            // "none of those signatures are compatible with each other
            if (tabToCheck) {
                const count = tabToCheck
                    .filter((entry) => entry[ACTIVATED])
                    .filter((entry) => entry[MONITORED_BRANCHES].length > 0)
                    .filter(
                        (entry) =>
                            entry[INJECTIONS]?.length > 0 || entry[PSTS]?.length > 0 || entry[HVDC_LINES]?.length > 0
                    )
                    .map((entry) => entry[COUNT])
                    .reduce((a, b) => a + b, 0);

                totalResultCount += count;
            }
        });
        setAnalysisComputeComplexity(totalResultCount);
        const timeoutId = setTimeout(() => {
            setLaunchLoader(false);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [getValues]);

    const onFormChanged = useCallback(
        (onFormChanged: boolean) => {
            if (onFormChanged) {
                setLaunchLoader(true);
                getResultCount();
            }
        },
        [getResultCount]
    );

    const onChangeParams = useCallback(
        (row: any, arrayFormName: SubTabsValues, index: number) => {
            // TODO: not easy to fix any here since values[SubTabsValues] have each time different type which causes problems with "filter"
            // "none of those signatures are compatible with each other
            if (!currentNode || !currentRootNetworkUuid) {
                return;
            }
            setLaunchLoader(true);
            getSensitivityAnalysisFactorsCount(
                studyUuid,
                currentNode.id,
                currentRootNetworkUuid,
                arrayFormName === SENSI_INJECTIONS_SET,
                formatFilteredParams(row)
            )
                .then((response) => {
                    response.text().then((value: string) => {
                        setValue(`${arrayFormName}.${index}.${COUNT}`, !isNaN(Number(value)) ? parseInt(value) : 0);
                        getResultCount();
                    });
                })
                .catch((error) => {
                    setLaunchLoader(false);
                    snackError({
                        messageTxt: error.message,
                        headerId: 'getSensitivityAnalysisFactorsCountError',
                    });
                });
        },
        [snackError, studyUuid, currentRootNetworkUuid, formatFilteredParams, setValue, getResultCount, currentNode]
    );

    const fromSensitivityAnalysisParamsDataToFormValues = useCallback(
        (parameters: SensitivityAnalysisParametersInfos): SensitivityAnalysisParametersFormSchema => {
            const values = {
                [PROVIDER]: parameters[PROVIDER],
                [FLOW_FLOW_SENSITIVITY_VALUE_THRESHOLD]: parameters.flowFlowSensitivityValueThreshold,
                [ANGLE_FLOW_SENSITIVITY_VALUE_THRESHOLD]: parameters.angleFlowSensitivityValueThreshold,
                [FLOW_VOLTAGE_SENSITIVITY_VALUE_THRESHOLD]: parameters.flowVoltageSensitivityValueThreshold,
                [PARAMETER_SENSI_INJECTIONS_SET]:
                    parameters.sensitivityInjectionsSet?.map((sensiInjectionsSet) => {
                        return {
                            [MONITORED_BRANCHES]:
                                sensiInjectionsSet[MONITORED_BRANCHES]?.map((sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[CONTAINER_ID],
                                        [NAME]: sensiInjection[CONTAINER_NAME],
                                    };
                                }) ?? [],
                            [INJECTIONS]:
                                sensiInjectionsSet[INJECTIONS]?.map((sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[CONTAINER_ID],
                                        [NAME]: sensiInjection[CONTAINER_NAME],
                                    };
                                }) ?? [],
                            [DISTRIBUTION_TYPE]: sensiInjectionsSet[DISTRIBUTION_TYPE],
                            [CONTINGENCIES]:
                                sensiInjectionsSet[CONTINGENCIES]?.map((sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[CONTAINER_ID],
                                        [NAME]: sensiInjection[CONTAINER_NAME],
                                    };
                                }) ?? [],
                            [ACTIVATED]: sensiInjectionsSet[ACTIVATED] ?? false,
                            [COUNT]: 0,
                        };
                    }) ?? [],

                [PARAMETER_SENSI_INJECTION]:
                    parameters.sensitivityInjection?.map((sensiInjections) => {
                        return {
                            [MONITORED_BRANCHES]:
                                sensiInjections[MONITORED_BRANCHES]?.map((sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[CONTAINER_ID],
                                        [NAME]: sensiInjection[CONTAINER_NAME],
                                    };
                                }) ?? [],
                            [INJECTIONS]:
                                sensiInjections[INJECTIONS]?.map((sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[CONTAINER_ID],
                                        [NAME]: sensiInjection[CONTAINER_NAME],
                                    };
                                }) ?? [],
                            [CONTINGENCIES]:
                                sensiInjections[CONTINGENCIES]?.map((sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[CONTAINER_ID],
                                        [NAME]: sensiInjection[CONTAINER_NAME],
                                    };
                                }) ?? [],
                            [ACTIVATED]: sensiInjections[ACTIVATED] ?? false,
                            [COUNT]: 0,
                        };
                    }) ?? [],
                [PARAMETER_SENSI_HVDC]:
                    parameters.sensitivityHVDC?.map((sensiInjectionsSet) => {
                        return {
                            [MONITORED_BRANCHES]:
                                sensiInjectionsSet[MONITORED_BRANCHES]?.map((sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[CONTAINER_ID],
                                        [NAME]: sensiInjection[CONTAINER_NAME],
                                    };
                                }) ?? [],
                            [HVDC_LINES]:
                                sensiInjectionsSet[HVDC_LINES]?.map((sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[CONTAINER_ID],
                                        [NAME]: sensiInjection[CONTAINER_NAME],
                                    };
                                }) ?? [],
                            [SENSITIVITY_TYPE]: sensiInjectionsSet[SENSITIVITY_TYPE],
                            [CONTINGENCIES]:
                                sensiInjectionsSet[CONTINGENCIES]?.map((sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[CONTAINER_ID],
                                        [NAME]: sensiInjection[CONTAINER_NAME],
                                    };
                                }) ?? [],
                            [ACTIVATED]: sensiInjectionsSet[ACTIVATED] ?? false,
                            [COUNT]: 0,
                        };
                    }) ?? [],
                [PARAMETER_SENSI_PST]:
                    parameters.sensitivityPST?.map((sensiInjectionsSet) => {
                        return {
                            [MONITORED_BRANCHES]:
                                sensiInjectionsSet[MONITORED_BRANCHES]?.map((sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[CONTAINER_ID],
                                        [NAME]: sensiInjection[CONTAINER_NAME],
                                    };
                                }) ?? [],
                            [PSTS]:
                                sensiInjectionsSet[PSTS]?.map((sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[CONTAINER_ID],
                                        [NAME]: sensiInjection[CONTAINER_NAME],
                                    };
                                }) ?? [],
                            [SENSITIVITY_TYPE]: sensiInjectionsSet[SENSITIVITY_TYPE],
                            [CONTINGENCIES]:
                                sensiInjectionsSet[CONTINGENCIES]?.map((sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[CONTAINER_ID],
                                        [NAME]: sensiInjection[CONTAINER_NAME],
                                    };
                                }) ?? [],
                            [ACTIVATED]: sensiInjectionsSet[ACTIVATED] ?? false,
                            [COUNT]: 0,
                        };
                    }) ?? [],
                [PARAMETER_SENSI_NODES]:
                    parameters.sensitivityNodes?.map((sensiInjectionsSet) => {
                        return {
                            [SUPERVISED_VOLTAGE_LEVELS]:
                                sensiInjectionsSet[SUPERVISED_VOLTAGE_LEVELS]?.map((sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[CONTAINER_ID],
                                        [NAME]: sensiInjection[CONTAINER_NAME],
                                    };
                                }) ?? [],
                            [EQUIPMENTS_IN_VOLTAGE_REGULATION]:
                                sensiInjectionsSet[EQUIPMENTS_IN_VOLTAGE_REGULATION]?.map((sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[CONTAINER_ID],
                                        [NAME]: sensiInjection[CONTAINER_NAME],
                                    };
                                }) ?? [],
                            [CONTINGENCIES]:
                                sensiInjectionsSet[CONTINGENCIES]?.map((sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[CONTAINER_ID],
                                        [NAME]: sensiInjection[CONTAINER_NAME],
                                    };
                                }) ?? [],
                            [ACTIVATED]: sensiInjectionsSet[ACTIVATED] ?? false,
                            [COUNT]: 0,
                        };
                    }) ?? [],
            };
            return values;
        },
        []
    );

    const initRowsCount = useCallback(() => {
        const handleEntries = (entries: any[] | undefined, parameter: SubTabsValues) => {
            // TODO: not easy to fix any here since values[SubTabsValues] have each time different type which causes problems with "filter"
            // "none of those signatures are compatible with each other
            if (!entries) {
                return;
            }

            const entriesWithIndices = entries.map((entry, index) => ({
                entry,
                index,
            }));
            const filteredInitEntries = entries.filter(
                (entry) =>
                    entry[ACTIVATED] &&
                    entry[MONITORED_BRANCHES].length > 0 &&
                    (entry[INJECTIONS]?.length > 0 || entry[PSTS]?.length > 0 || entry[HVDC_LINES]?.length > 0)
            );
            filteredInitEntries.forEach((entry) => {
                const originalIndex = entriesWithIndices.findIndex((obj) => obj.entry === entry);
                onChangeParams(entry, parameter, originalIndex);
            });
        };

        const values = getValues();
        handleEntries(values[PARAMETER_SENSI_INJECTIONS_SET], PARAMETER_SENSI_INJECTIONS_SET);
        handleEntries(values[PARAMETER_SENSI_INJECTION], PARAMETER_SENSI_INJECTION);
        handleEntries(values[PARAMETER_SENSI_HVDC], PARAMETER_SENSI_HVDC);
        handleEntries(values[PARAMETER_SENSI_PST], PARAMETER_SENSI_PST);
    }, [onChangeParams, getValues]);
    const onSubmit = useCallback(
        (newParams: SensitivityAnalysisParametersFormSchema) => {
            setIsSubmitAction(true);
            setSensitivityAnalysisParameters(studyUuid, formatNewParams(newParams))
                .then(() => {
                    let formattedParams = formatNewParams(newParams);
                    setSensitivityAnalysisParams(formattedParams);
                    updateParameters(formattedParams);
                    initRowsCount();
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'updateSensitivityAnalysisParametersError',
                    });
                });
        },
        [setSensitivityAnalysisParams, snackError, studyUuid, formatNewParams, initRowsCount, updateParameters]
    );

    const handleSensibilityParameter = useCallback(
        (newParams: TreeViewFinderNodeProps[]) => {
            if (newParams && newParams.length > 0) {
                setOpenSelectParameterDialog(false);
                fetchSensitivityAnalysisParameters(newParams[0].id)
                    .then((parameters: SensitivityAnalysisParametersInfos) => {
                        console.info('loading the following sensi parameters : ' + parameters.uuid);
                        reset(fromSensitivityAnalysisParamsDataToFormValues(parameters), {
                            keepDefaultValues: true,
                        });
                        initRowsCount();
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
        [snackError, fromSensitivityAnalysisParamsDataToFormValues, reset, initRowsCount]
    );

    useEffect(() => {
        if (sensitivityAnalysisParams) {
            reset(fromSensitivityAnalysisParamsDataToFormValues(sensitivityAnalysisParams));
            !isSubmitAction && initRowsCount();
        }
    }, [
        fromSensitivityAnalysisParamsDataToFormValues,
        sensitivityAnalysisParams,
        initRowsCount,
        isSubmitAction,
        reset,
    ]);
    useEffect(() => {
        if (params) {
            reset(fromSensitivityAnalysisParamsDataToFormValues(params));
        }
    }, [params, reset, fromSensitivityAnalysisParamsDataToFormValues]);

    const clear = useCallback(() => {
        reset(emptyFormData);
        resetSensitivityAnalysisParameters();
        setAnalysisComputeComplexity(0);
    }, [emptyFormData, reset, resetSensitivityAnalysisParameters]);

    const isMaxReached = useMemo(() => analysisComputeComplexity > numberMax, [analysisComputeComplexity]);

    useEffect(() => {
        setHaveDirtyFields(!!Object.keys(formState.dirtyFields).length);
    }, [formState, setHaveDirtyFields]);

    return (
        <>
            <CustomFormProvider validationSchema={formSchema} {...formMethods}>
                <Grid container sx={{ height: '100%' }} justifyContent="space-between">
                    <Grid item container>
                        <Grid item xs={8} xl={4} sx={styles.parameterName}>
                            <FormattedMessage id="Provider" />
                        </Grid>
                        <Grid item xs={4} xl={2} sx={styles.controlItem}>
                            <MuiSelectInput name={PROVIDER} size="small" options={Object.values(formattedProviders)} />
                        </Grid>
                    </Grid>
                    <Grid
                        xs
                        item
                        container
                        sx={mergeSx(styles.scrollableGrid, {
                            paddingTop: 0,
                            display: 'unset',
                        })}
                        key="sensitivityAnalysisParameters"
                    >
                        <Grid xl={6}>
                            <Grid container paddingTop={1} paddingBottom={1}>
                                <LineSeparator />
                            </Grid>
                            <SensitivityAnalysisFields />
                        </Grid>
                        <Grid container paddingTop={4} paddingBottom={2}>
                            <LineSeparator />
                        </Grid>
                        <SensitivityParametersSelector
                            onFormChanged={onFormChanged}
                            onChangeParams={onChangeParams}
                            launchLoader={launchLoader}
                            analysisComputeComplexity={analysisComputeComplexity}
                        />
                    </Grid>

                    <Grid item container>
                        <DialogActions
                            sx={mergeSx(styles.controlParametersItem, {
                                paddingLeft: 0,
                                paddingBottom: 2,
                            })}
                        >
                            <Button onClick={() => setOpenSelectParameterDialog(true)}>
                                <FormattedMessage id="settings.button.chooseSettings" />
                            </Button>
                            <Button onClick={() => setOpenCreateParameterDialog(true)}>
                                <FormattedMessage id="save" />
                            </Button>
                            <Button onClick={clear}>
                                <FormattedMessage id="resetToDefault" />
                            </Button>
                            <SubmitButton
                                onClick={handleSubmit(onSubmit)}
                                variant="outlined"
                                disabled={launchLoader || isMaxReached}
                            >
                                <FormattedMessage id="validate" />
                            </SubmitButton>
                        </DialogActions>
                    </Grid>
                </Grid>
            </CustomFormProvider>
            {openCreateParameterDialog && (
                <CreateParameterDialog
                    open={openCreateParameterDialog}
                    onClose={() => setOpenCreateParameterDialog(false)}
                    parameterValues={() => formatNewParams(getValues())}
                    parameterFormatter={(newParams) => newParams}
                    parameterType={ElementType.SENSITIVITY_PARAMETERS}
                />
            )}
            {openSelectParameterDialog && (
                <DirectoryItemSelector
                    open={openSelectParameterDialog}
                    onClose={handleSensibilityParameter}
                    types={[ElementType.SENSITIVITY_PARAMETERS]}
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
        </>
    );
};
