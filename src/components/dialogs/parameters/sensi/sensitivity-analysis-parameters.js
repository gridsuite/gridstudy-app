/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    SelectInput,
    SubmitButton,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { Grid, Button, DialogActions } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { styles } from '../parameters';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import {
    ANGLE_FLOW_SENSITIVITY_VALUE_THRESHOLD,
    CONTINGENCIES,
    EQUIPMENTS_IN_VOLTAGE_REGULATION,
    CONTAINER_ID,
    CONTAINER_NAME,
    FLOW_FLOW_SENSITIVITY_VALUE_THRESHOLD,
    FLOW_VOLTAGE_SENSITIVITY_VALUE_THRESHOLD,
    HVDC_LINES,
    ID,
    DISTRIBUTION_TYPE,
    INJECTIONS,
    MONITORED_BRANCHES,
    NAME,
    PARAMETER_SENSI_HVDC,
    PARAMETER_SENSI_INJECTION,
    PARAMETER_SENSI_INJECTIONS_SET,
    PARAMETER_SENSI_NODES,
    PARAMETER_SENSI_PST,
    PSTS,
    SENSITIVITY_TYPE,
    SUPERVISED_VOLTAGE_LEVELS,
    ACTIVATED,
    PROVIDER,
    SENSI_INJECTIONS_SET,
    COUNT,
} from '../../../utils/field-constants';
import yup from '../../../utils/yup-config';
import {
    getSensitivityAnalysisParameters,
    setSensitivityAnalysisParameters,
    getSensitivityAnalysisFactorsCount,
} from '../../../../services/study/sensitivity-analysis';
import SensitivityAnalysisFields from './sensitivity-Flow-parameters';
import SensitivityParametersSelector from './sensitivity-parameters-selector';
import { LineSeparator, parseIntData } from '../../dialogUtils';
import {
    getGenericRowNewParams,
    getSensiHvdcformatNewParams,
    getSensiHVDCsFormSchema,
    getSensiInjectionsformatNewParams,
    getSensiInjectionsFormSchema,
    getSensiInjectionsSetformatNewParams,
    getSensiInjectionsSetFormSchema,
    getSensiNodesformatNewParams,
    getSensiNodesFormSchema,
    getSensiPstformatNewParams,
    getSensiPSTsFormSchema,
} from './utils';
import Alert from '@mui/material/Alert';
import { mergeSx } from 'components/utils/functions';

export const useGetSensitivityAnalysisParameters = () => {
    const studyUuid = useSelector((state) => state.studyUuid);
    const { snackError } = useSnackMessage();
    const [sensitivityAnalysisParams, setSensitivityAnalysisParams] =
        useState(null);

    useEffect(() => {
        if (studyUuid) {
            getSensitivityAnalysisParameters(studyUuid)
                .then((params) => setSensitivityAnalysisParams(params))
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'paramsRetrievingError',
                    });
                });
        }
    }, [studyUuid, snackError]);

    return [sensitivityAnalysisParams, setSensitivityAnalysisParams];
};

const formSchema = yup
    .object()
    .shape({
        [PROVIDER]: yup.string().required(),
        [FLOW_FLOW_SENSITIVITY_VALUE_THRESHOLD]: yup.number().required(),
        [ANGLE_FLOW_SENSITIVITY_VALUE_THRESHOLD]: yup.number().required(),
        [FLOW_VOLTAGE_SENSITIVITY_VALUE_THRESHOLD]: yup.number().required(),
        ...getSensiInjectionsSetFormSchema(),
        ...getSensiInjectionsFormSchema(),
        ...getSensiHVDCsFormSchema(),
        ...getSensiPSTsFormSchema(),
        ...getSensiNodesFormSchema(),
    })
    .required();

const numberMax = 500000;
export const SensitivityAnalysisParameters = ({
    parametersBackend,
    useSensitivityAnalysisParameters,
    setHaveDirtyFields,
}) => {
    const { snackError } = useSnackMessage();

    const [launchLoader, setLaunchLoader] = useState(false);
    const [isSubmitAction, setIsSubmitAction] = useState(false);
    const [analysisComputeComplexity, setAnalysisComputeComplexity] =
        useState(0);
    const [providers, provider, updateProvider, resetProvider] =
        parametersBackend;
    const formattedProviders = Object.keys(providers).map((key) => ({
        id: key,
        label: providers[key],
    }));

    const resetSensitivityParametersAndProvider = useCallback(() => {
        resetProvider();
    }, [resetProvider]);

    const emptyFormData = useMemo(() => {
        return {
            [PROVIDER]: provider,
            [FLOW_FLOW_SENSITIVITY_VALUE_THRESHOLD]: 0,
            [ANGLE_FLOW_SENSITIVITY_VALUE_THRESHOLD]: 0,
            [FLOW_VOLTAGE_SENSITIVITY_VALUE_THRESHOLD]: 0,
            [PARAMETER_SENSI_INJECTIONS_SET]: [],
            [PARAMETER_SENSI_INJECTION]: [],
            [PARAMETER_SENSI_HVDC]: [],
            [PARAMETER_SENSI_PST]: [],
            [PARAMETER_SENSI_NODES]: [],
        };
    }, [provider]);
    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, handleSubmit, formState, getValues, setValue } = formMethods;
    const studyUuid = useSelector((state) => state.studyUuid);

    const [sensitivityAnalysisParams, setSensitivityAnalysisParams] =
        useSensitivityAnalysisParameters;

    const resetSensitivityAnalysisParameters = useCallback(() => {
        setSensitivityAnalysisParameters(studyUuid, emptyFormData)
            .then(() => {
                return getSensitivityAnalysisParameters(studyUuid)
                    .then((params) => setSensitivityAnalysisParams(params))
                    .catch((error) => {
                        snackError({
                            messageTxt: error.message,
                            headerId: 'paramsRetrievingError',
                        });
                    });
            })
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'paramsChangingError',
                });
            });
    }, [studyUuid, emptyFormData, setSensitivityAnalysisParams, snackError]);

    const formatNewParams = useCallback((newParams, withProvider = true) => {
        let params = {
            [FLOW_FLOW_SENSITIVITY_VALUE_THRESHOLD]:
                newParams[FLOW_FLOW_SENSITIVITY_VALUE_THRESHOLD],
            [ANGLE_FLOW_SENSITIVITY_VALUE_THRESHOLD]:
                newParams[ANGLE_FLOW_SENSITIVITY_VALUE_THRESHOLD],
            [FLOW_VOLTAGE_SENSITIVITY_VALUE_THRESHOLD]:
                newParams[FLOW_VOLTAGE_SENSITIVITY_VALUE_THRESHOLD],
            ...getSensiInjectionsSetformatNewParams(newParams),
            ...getSensiInjectionsformatNewParams(newParams),
            ...getSensiHvdcformatNewParams(newParams),
            ...getSensiPstformatNewParams(newParams),
            ...getSensiNodesformatNewParams(newParams),
        };
        return withProvider
            ? params
            : {
                  [PROVIDER]: newParams[PROVIDER],
                  ...params,
              };
    }, []);

    const formatFilteredParams = useCallback((row) => {
        return getGenericRowNewParams(row);
    }, []);

    const onSubmit = useCallback(
        (newParams) => {
            setIsSubmitAction(true);
            setSensitivityAnalysisParameters(
                studyUuid,
                formatNewParams(newParams)
            )
                .then(() => {
                    setSensitivityAnalysisParams(
                        formatNewParams(newParams, false)
                    );
                    updateProvider(newParams[PROVIDER]);
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'SensitivityAnalysisParametersError',
                    });
                });
        },
        [
            setSensitivityAnalysisParams,
            snackError,
            studyUuid,
            formatNewParams,
            updateProvider,
        ]
    );

    const getResultCount = useCallback(() => {
        const values = getValues();
        let totalResultCount = 0;
        const tabsToCheck = [
            'sensitivityInjectionsSet',
            'sensitivityInjection',
            'sensitivityHVDC',
            'sensitivityPST',
        ];
        tabsToCheck.forEach((tab) => {
            const count = values[tab]
                .filter((entry) => entry[ACTIVATED])
                .filter((entry) => entry[MONITORED_BRANCHES].length > 0)
                .filter(
                    (entry) =>
                        entry[INJECTIONS]?.length > 0 ||
                        entry[PSTS]?.length > 0 ||
                        entry[HVDC_LINES]?.length > 0
                )
                .map((entry) => entry[COUNT])
                .reduce((a, b) => a + b, 0);

            totalResultCount += count;
        });
        return totalResultCount;
    }, [getValues]);

    const onFormChanged = useCallback(
        (onFormChanged) => {
            if (onFormChanged) {
                setLaunchLoader(true);
                setAnalysisComputeComplexity(getResultCount());
                setTimeout(() => {
                    setLaunchLoader(false);
                }, 500);
            }
        },
        [getResultCount]
    );

    const onChangeParams = useCallback(
        (row, arrayFormName, index) => {
            setLaunchLoader(true);
            getSensitivityAnalysisFactorsCount(
                studyUuid,
                arrayFormName === SENSI_INJECTIONS_SET,
                formatFilteredParams(row)
            )
                .then((response) => {
                    response.text().then((value) => {
                        setValue(
                            `${arrayFormName}[${index}].[${COUNT}]`,
                            parseIntData(value, 0)
                        );
                        setAnalysisComputeComplexity(getResultCount());
                        setTimeout(() => {
                            setLaunchLoader(false);
                        }, 500);
                    });
                })
                .catch((error) => {
                    setLaunchLoader(false);
                    snackError({
                        messageTxt: error.message,
                        headerId:
                            'SensitivityAnalysisFilteredActiveParametersError',
                    });
                });
        },
        [snackError, studyUuid, formatFilteredParams, setValue, getResultCount]
    );

    const initRowsCount = useCallback(() => {
        const handleEntries = (entries, parameter) => {
            entries
                .filter((entry) => entry[ACTIVATED] && !entry[COUNT])
                .forEach((entry, index) =>
                    onChangeParams(entry, parameter, index)
                );
        };

        const values = getValues();
        handleEntries(
            values[PARAMETER_SENSI_INJECTIONS_SET],
            PARAMETER_SENSI_INJECTIONS_SET
        );
        handleEntries(
            values[PARAMETER_SENSI_INJECTION],
            PARAMETER_SENSI_INJECTION
        );
        handleEntries(values[PARAMETER_SENSI_HVDC], PARAMETER_SENSI_HVDC);
        handleEntries(values[PARAMETER_SENSI_PST], PARAMETER_SENSI_PST);
    }, [onChangeParams, getValues]);

    const fromSensitivityAnalysisParamsDataToFormValues = useCallback(
        (parameters) => {
            const values = {
                [PROVIDER]: parameters[PROVIDER],
                [FLOW_FLOW_SENSITIVITY_VALUE_THRESHOLD]:
                    parameters.flowFlowSensitivityValueThreshold,
                [ANGLE_FLOW_SENSITIVITY_VALUE_THRESHOLD]:
                    parameters.angleFlowSensitivityValueThreshold,
                [FLOW_VOLTAGE_SENSITIVITY_VALUE_THRESHOLD]:
                    parameters.flowVoltageSensitivityValueThreshold,
                [PARAMETER_SENSI_INJECTIONS_SET]:
                    parameters.sensitivityInjectionsSet?.map(
                        (sensiInjectionsSet) => {
                            return {
                                [MONITORED_BRANCHES]: sensiInjectionsSet[
                                    MONITORED_BRANCHES
                                ].map((sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[CONTAINER_ID],
                                        [NAME]: sensiInjection[CONTAINER_NAME],
                                    };
                                }),
                                [INJECTIONS]: sensiInjectionsSet[
                                    INJECTIONS
                                ].map((sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[CONTAINER_ID],
                                        [NAME]: sensiInjection[CONTAINER_NAME],
                                    };
                                }),
                                [DISTRIBUTION_TYPE]:
                                    sensiInjectionsSet[DISTRIBUTION_TYPE],
                                [CONTINGENCIES]: sensiInjectionsSet[
                                    CONTINGENCIES
                                ].map((sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[CONTAINER_ID],
                                        [NAME]: sensiInjection[CONTAINER_NAME],
                                    };
                                }),
                                [ACTIVATED]: sensiInjectionsSet[ACTIVATED],
                                [COUNT]: 0,
                            };
                        }
                    ) ?? [],

                [PARAMETER_SENSI_INJECTION]:
                    parameters.sensitivityInjection?.map((sensiInjections) => {
                        return {
                            [MONITORED_BRANCHES]: sensiInjections[
                                MONITORED_BRANCHES
                            ].map((sensiInjection) => {
                                return {
                                    [ID]: sensiInjection[CONTAINER_ID],
                                    [NAME]: sensiInjection[CONTAINER_NAME],
                                };
                            }),
                            [INJECTIONS]: sensiInjections[INJECTIONS].map(
                                (sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[CONTAINER_ID],
                                        [NAME]: sensiInjection[CONTAINER_NAME],
                                    };
                                }
                            ),
                            [DISTRIBUTION_TYPE]:
                                sensiInjections[DISTRIBUTION_TYPE],
                            [CONTINGENCIES]: sensiInjections[CONTINGENCIES].map(
                                (sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[CONTAINER_ID],
                                        [NAME]: sensiInjection[CONTAINER_NAME],
                                    };
                                }
                            ),
                            [ACTIVATED]: sensiInjections[ACTIVATED],
                            [COUNT]: 0,
                        };
                    }) ?? [],
                [PARAMETER_SENSI_HVDC]:
                    parameters.sensitivityHVDC?.map((sensiInjectionsSet) => {
                        return {
                            [MONITORED_BRANCHES]: sensiInjectionsSet[
                                MONITORED_BRANCHES
                            ].map((sensiInjection) => {
                                return {
                                    [ID]: sensiInjection[CONTAINER_ID],
                                    [NAME]: sensiInjection[CONTAINER_NAME],
                                };
                            }),
                            [HVDC_LINES]: sensiInjectionsSet[HVDC_LINES].map(
                                (sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[CONTAINER_ID],
                                        [NAME]: sensiInjection[CONTAINER_NAME],
                                    };
                                }
                            ),
                            [SENSITIVITY_TYPE]:
                                sensiInjectionsSet[SENSITIVITY_TYPE],
                            [CONTINGENCIES]: sensiInjectionsSet[
                                CONTINGENCIES
                            ].map((sensiInjection) => {
                                return {
                                    [ID]: sensiInjection[CONTAINER_ID],
                                    [NAME]: sensiInjection[CONTAINER_NAME],
                                };
                            }),
                            [ACTIVATED]: sensiInjectionsSet[ACTIVATED],
                            [COUNT]: 0,
                        };
                    }) ?? [],
                [PARAMETER_SENSI_PST]:
                    parameters.sensitivityPST?.map((sensiInjectionsSet) => {
                        return {
                            [MONITORED_BRANCHES]: sensiInjectionsSet[
                                MONITORED_BRANCHES
                            ].map((sensiInjection) => {
                                return {
                                    [ID]: sensiInjection[CONTAINER_ID],
                                    [NAME]: sensiInjection[CONTAINER_NAME],
                                };
                            }),
                            [PSTS]: sensiInjectionsSet[PSTS].map(
                                (sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[CONTAINER_ID],
                                        [NAME]: sensiInjection[CONTAINER_NAME],
                                    };
                                }
                            ),
                            [SENSITIVITY_TYPE]:
                                sensiInjectionsSet[SENSITIVITY_TYPE],
                            [CONTINGENCIES]: sensiInjectionsSet[
                                CONTINGENCIES
                            ].map((sensiInjection) => {
                                return {
                                    [ID]: sensiInjection[CONTAINER_ID],
                                    [NAME]: sensiInjection[CONTAINER_NAME],
                                };
                            }),
                            [ACTIVATED]: sensiInjectionsSet[ACTIVATED],
                            [COUNT]: 0,
                        };
                    }) ?? [],
                [PARAMETER_SENSI_NODES]:
                    parameters.sensitivityNodes?.map((sensiInjectionsSet) => {
                        return {
                            [SUPERVISED_VOLTAGE_LEVELS]: sensiInjectionsSet[
                                SUPERVISED_VOLTAGE_LEVELS
                            ].map((sensiInjection) => {
                                return {
                                    [ID]: sensiInjection[CONTAINER_ID],
                                    [NAME]: sensiInjection[CONTAINER_NAME],
                                };
                            }),
                            [EQUIPMENTS_IN_VOLTAGE_REGULATION]:
                                sensiInjectionsSet[
                                    EQUIPMENTS_IN_VOLTAGE_REGULATION
                                ].map((sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[CONTAINER_ID],
                                        [NAME]: sensiInjection[CONTAINER_NAME],
                                    };
                                }),
                            [CONTINGENCIES]: sensiInjectionsSet[
                                CONTINGENCIES
                            ].map((sensiInjection) => {
                                return {
                                    [ID]: sensiInjection[CONTAINER_ID],
                                    [NAME]: sensiInjection[CONTAINER_NAME],
                                };
                            }),
                            [ACTIVATED]: sensiInjectionsSet[ACTIVATED],
                            [COUNT]: 0,
                        };
                    }) ?? [],
            };
            reset(values);
        },
        [reset]
    );

    useEffect(() => {
        if (sensitivityAnalysisParams) {
            fromSensitivityAnalysisParamsDataToFormValues(
                sensitivityAnalysisParams
            );
            !isSubmitAction && initRowsCount();
        }
    }, [
        fromSensitivityAnalysisParamsDataToFormValues,
        sensitivityAnalysisParams,
        initRowsCount,
        isSubmitAction,
    ]);

    const clear = useCallback(() => {
        reset(emptyFormData);
        resetSensitivityParametersAndProvider();
        resetSensitivityAnalysisParameters();
        setAnalysisComputeComplexity(0);
    }, [
        emptyFormData,
        reset,
        resetSensitivityAnalysisParameters,
        resetSensitivityParametersAndProvider,
    ]);

    const renderComputingEventLoading = () => {
        return (
            <Alert severity={'info'} sx={{ justifyContent: 'center' }}>
                <FormattedMessage id={'loadingComputing'} />
            </Alert>
        );
    };

    const renderComputingEvent = () => {
        return (
            <Alert
                severity={isMaxReached ? 'error' : 'info'}
                sx={{ justifyContent: 'center' }}
            >
                {analysisComputeComplexity > 999999 ? (
                    <FormattedMessage id="SimulatedCalculationExceedsLimit" />
                ) : (
                    <>
                        {analysisComputeComplexity
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}{' '}
                        <FormattedMessage id="SimulatedCalculation" />
                    </>
                )}
            </Alert>
        );
    };

    const isMaxReached = useMemo(
        () => analysisComputeComplexity > numberMax,
        [analysisComputeComplexity]
    );

    useEffect(() => {
        setHaveDirtyFields(!!Object.keys(formState.dirtyFields).length);
    }, [formState, setHaveDirtyFields]);

    return (
        <>
            <FormProvider validationSchema={formSchema} {...formMethods}>
                <Grid
                    container
                    sx={{ height: '100%' }}
                    justifyContent="space-between"
                >
                    <Grid item container>
                        <Grid item xs={8} xl={4} sx={styles.parameterName}>
                            <FormattedMessage id="Provider" />
                        </Grid>
                        <Grid item xs={4} xl={2} sx={styles.controlItem}>
                            <SelectInput
                                name={PROVIDER}
                                disableClearable
                                size="small"
                                options={Object.values(formattedProviders)}
                            />
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
                            <SensitivityAnalysisFields
                                reset={reset}
                                useSensitivityAnalysisParameters={
                                    useSensitivityAnalysisParameters
                                }
                            />
                        </Grid>
                        <Grid container paddingTop={4} paddingBottom={2}>
                            <LineSeparator />
                        </Grid>
                        <Grid container justifyContent={'right'}>
                            <Grid item marginBottom={-9} width={'300px'}>
                                {launchLoader
                                    ? renderComputingEventLoading()
                                    : renderComputingEvent()}
                                <FormattedMessage id="SimulatedCalculationMax" />
                            </Grid>
                        </Grid>
                        <SensitivityParametersSelector
                            reset={reset}
                            useSensitivityAnalysisParameters={
                                useSensitivityAnalysisParameters
                            }
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
            </FormProvider>
        </>
    );
};
