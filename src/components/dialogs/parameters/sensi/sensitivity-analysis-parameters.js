/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSnackMessage } from '@gridsuite/commons-ui';
import { Grid, Button, DialogActions } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { useStyles, CloseButton, DropDown } from '../parameters';

import SubmitButton from '../../commons/submitButton';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import {
    ANGLE_FLOW_SENSITIVITY_VALUE_THRESHOLD,
    CONTINGENCIES,
    EQUIPMENTS_IN_VOLTAGE_REGULATION,
    FILTER_ID,
    FILTER_NAME,
    FLOW_FLOW_SENSITIVITY_VALUE_THRESHOLD,
    FLOW_VOLTAGE_SENSITIVITY_VALUE_THRESHOLD,
    HVDC_LINES,
    ID,
    INJECTION_DISTRIBUTION,
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
} from '../../../utils/field-constants';
import yup from '../../../utils/yup-config';
import {
    getSensitivityAnalysisParameters,
    setSensitivityAnalysisParameters,
} from '../../../../services/study/sensitivity-analysis';
import SensitivityAnalysisFields from './sensitivity-Flow-parameters';
import {
    getSensiInjectionsSetEmptyFormData,
    getSensiInjectionsSetformatNewParams,
    getSensiInjectionsSetFormSchema,
} from './sensi-injections-set';
import {
    getSensiInjectionsEmptyFormData,
    getSensiInjectionsformatNewParams,
    getSensiInjectionsFormSchema,
} from './sensi-injections';
import {
    getSensiHvdcformatNewParams,
    getSensiHVDCsEmptyFormData,
    getSensiHVDCsFormSchema,
} from './sensi-hvdcs';
import {
    getSensiPstformatNewParams,
    getSensiPSTsEmptyFormData,
    getSensiPSTsFormSchema,
} from './sensi-psts';
import {
    getSensiNodesEmptyFormData,
    getSensiNodesformatNewParams,
    getSensiNodesFormSchema,
} from './sensi-nodes';
import SensiParametersSelector, {
    INJECTION_DISTRIBUTION_TYPES,
} from './sensi-parameters-selector';
import { LineSeparator } from '../../dialogUtils';

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

export const SensitivityAnalysisParameters = ({
    hideParameters,
    parametersBackend,
    useSensitivityAnalysisParameters,
}) => {
    const classes = useStyles();
    const { snackError } = useSnackMessage();

    const [providers, provider, updateProvider, resetProvider] =
        parametersBackend;

    const handleUpdateProvider = (evt) => updateProvider(evt.target.value);
    const updateProviderCallback = useCallback(handleUpdateProvider, [
        updateProvider,
    ]);

    const resetSensitivityParametersAndProvider = useCallback(() => {
        resetProvider();
    }, [resetProvider]);

    const emptyFormData = useMemo(() => {
        return {
            [FLOW_FLOW_SENSITIVITY_VALUE_THRESHOLD]: 0,
            [ANGLE_FLOW_SENSITIVITY_VALUE_THRESHOLD]: 0,
            [FLOW_VOLTAGE_SENSITIVITY_VALUE_THRESHOLD]: 0,
            [FLOW_VOLTAGE_SENSITIVITY_VALUE_THRESHOLD]: 0,
            [PARAMETER_SENSI_INJECTIONS_SET]: [],
            [PARAMETER_SENSI_INJECTION]: [],
            [PARAMETER_SENSI_HVDC]: [],
            [PARAMETER_SENSI_PST]: [],
            [PARAMETER_SENSI_NODES]: [],
            /*            ...getSensiInjectionsEmptyFormData(),
            ...getSensiHVDCsEmptyFormData(),
            ...getSensiPSTsEmptyFormData(),
            ...getSensiNodesEmptyFormData(),*/
        };
    }, []);
    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, handleSubmit } = formMethods;
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

    const formatNewParams = useCallback((newParams) => {
        return {
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
    }, []);

    const onSubmit = useCallback(
        (newParams) => {
            setSensitivityAnalysisParameters(
                studyUuid,
                formatNewParams(newParams)
            )
                .then(() => {
                    setSensitivityAnalysisParams(formatNewParams(newParams));
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'SensitivityAnalysisParametersError',
                    });
                });
        },
        [setSensitivityAnalysisParams, snackError, studyUuid, formatNewParams]
    );

    const fromSensitivityAnalysisParamsDataToFormValues = useCallback(
        (parameters) => {
            reset({
                [FLOW_FLOW_SENSITIVITY_VALUE_THRESHOLD]:
                    parameters.flowFlowSensitivityValueThreshold,
                [ANGLE_FLOW_SENSITIVITY_VALUE_THRESHOLD]:
                    parameters.angleFlowSensitivityValueThreshold,
                [FLOW_VOLTAGE_SENSITIVITY_VALUE_THRESHOLD]:
                    parameters.flowVoltageSensitivityValueThreshold,
                [PARAMETER_SENSI_INJECTIONS_SET]:
                    parameters.sensitivityInjectionsSet.map(
                        (sensiInjectionsSet) => {
                            return {
                                [MONITORED_BRANCHES]: sensiInjectionsSet[
                                    MONITORED_BRANCHES
                                ].map((sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[FILTER_ID],
                                        [NAME]: sensiInjection[FILTER_NAME],
                                    };
                                }),
                                [INJECTIONS]: sensiInjectionsSet[
                                    INJECTIONS
                                ].map((sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[FILTER_ID],
                                        [NAME]: sensiInjection[FILTER_NAME],
                                    };
                                }),
                                [INJECTION_DISTRIBUTION]:
                                    sensiInjectionsSet[INJECTION_DISTRIBUTION],
                                [CONTINGENCIES]: sensiInjectionsSet[
                                    CONTINGENCIES
                                ].map((sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[FILTER_ID],
                                        [NAME]: sensiInjection[FILTER_NAME],
                                    };
                                }),
                            };
                        }
                    ),

                [PARAMETER_SENSI_INJECTION]:
                    parameters.sensitivityInjection.map((sensiInjections) => {
                        return {
                            [MONITORED_BRANCHES]: sensiInjections[
                                MONITORED_BRANCHES
                            ].map((sensiInjection) => {
                                return {
                                    [ID]: sensiInjection[FILTER_ID],
                                    [NAME]: sensiInjection[FILTER_NAME],
                                };
                            }),
                            [INJECTIONS]: sensiInjections[INJECTIONS].map(
                                (sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[FILTER_ID],
                                        [NAME]: sensiInjection[FILTER_NAME],
                                    };
                                }
                            ),
                            [INJECTION_DISTRIBUTION]:
                                sensiInjections[INJECTION_DISTRIBUTION],
                            [CONTINGENCIES]: sensiInjections[CONTINGENCIES].map(
                                (sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[FILTER_ID],
                                        [NAME]: sensiInjection[FILTER_NAME],
                                    };
                                }
                            ),
                        };
                    }),
                [PARAMETER_SENSI_HVDC]: parameters.sensitivityHVDC.map(
                    (sensiInjectionsSet) => {
                        return {
                            [MONITORED_BRANCHES]: sensiInjectionsSet[
                                MONITORED_BRANCHES
                            ].map((sensiInjection) => {
                                return {
                                    [ID]: sensiInjection[FILTER_ID],
                                    [NAME]: sensiInjection[FILTER_NAME],
                                };
                            }),
                            [HVDC_LINES]: sensiInjectionsSet[HVDC_LINES].map(
                                (sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[FILTER_ID],
                                        [NAME]: sensiInjection[FILTER_NAME],
                                    };
                                }
                            ),
                            [SENSITIVITY_TYPE]:
                                sensiInjectionsSet[SENSITIVITY_TYPE],
                            [CONTINGENCIES]: sensiInjectionsSet[
                                CONTINGENCIES
                            ].map((sensiInjection) => {
                                return {
                                    [ID]: sensiInjection[FILTER_ID],
                                    [NAME]: sensiInjection[FILTER_NAME],
                                };
                            }),
                        };
                    }
                ),
                [PARAMETER_SENSI_PST]: parameters.sensitivityPST.map(
                    (sensiInjectionsSet) => {
                        return {
                            [MONITORED_BRANCHES]: sensiInjectionsSet[
                                MONITORED_BRANCHES
                            ].map((sensiInjection) => {
                                return {
                                    [ID]: sensiInjection[FILTER_ID],
                                    [NAME]: sensiInjection[FILTER_NAME],
                                };
                            }),
                            [PSTS]: sensiInjectionsSet[PSTS].map(
                                (sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[FILTER_ID],
                                        [NAME]: sensiInjection[FILTER_NAME],
                                    };
                                }
                            ),
                            [SENSITIVITY_TYPE]:
                                sensiInjectionsSet[SENSITIVITY_TYPE],
                            [CONTINGENCIES]: sensiInjectionsSet[
                                CONTINGENCIES
                            ].map((sensiInjection) => {
                                return {
                                    [ID]: sensiInjection[FILTER_ID],
                                    [NAME]: sensiInjection[FILTER_NAME],
                                };
                            }),
                        };
                    }
                ),
                [PARAMETER_SENSI_NODES]: parameters.sensitivityNodes.map(
                    (sensiInjectionsSet) => {
                        return {
                            [SUPERVISED_VOLTAGE_LEVELS]: sensiInjectionsSet[
                                SUPERVISED_VOLTAGE_LEVELS
                            ].map((sensiInjection) => {
                                return {
                                    [ID]: sensiInjection[FILTER_ID],
                                    [NAME]: sensiInjection[FILTER_NAME],
                                };
                            }),
                            [EQUIPMENTS_IN_VOLTAGE_REGULATION]:
                                sensiInjectionsSet[
                                    EQUIPMENTS_IN_VOLTAGE_REGULATION
                                ].map((sensiInjection) => {
                                    return {
                                        [ID]: sensiInjection[FILTER_ID],
                                        [NAME]: sensiInjection[FILTER_NAME],
                                    };
                                }),
                            [CONTINGENCIES]: sensiInjectionsSet[
                                CONTINGENCIES
                            ].map((sensiInjection) => {
                                return {
                                    [ID]: sensiInjection[FILTER_ID],
                                    [NAME]: sensiInjection[FILTER_NAME],
                                };
                            }),
                        };
                    }
                ),
            });
        },
        [reset]
    );

    useEffect(() => {
        if (sensitivityAnalysisParams) {
            fromSensitivityAnalysisParamsDataToFormValues(
                sensitivityAnalysisParams
            );
        }
    }, [
        fromSensitivityAnalysisParamsDataToFormValues,
        sensitivityAnalysisParams,
    ]);

    const clear = useCallback(() => {
        reset(emptyFormData);
        resetSensitivityParametersAndProvider();
        resetSensitivityAnalysisParameters();
    }, [
        emptyFormData,
        reset,
        resetSensitivityAnalysisParameters,
        resetSensitivityParametersAndProvider,
    ]);

    return (
        <FormProvider validationSchema={formSchema} {...formMethods}>
            <Grid
                container
                spacing={1}
                padding={1}
                key="sensitivityAnalysisParameters"
                className={classes.scrollableGrid}
            >
                <DropDown
                    value={provider}
                    label="Provider"
                    values={providers}
                    callback={updateProviderCallback}
                />
                <LineSeparator />
                <SensitivityAnalysisFields
                    reset={reset}
                    useSensitivityAnalysisParameters={
                        useSensitivityAnalysisParameters
                    }
                />
                <LineSeparator />
                <SensiParametersSelector
                    reset={reset}
                    useSensitivityAnalysisParameters={
                        useSensitivityAnalysisParameters
                    }
                />

                <DialogActions>
                    <Button onClick={clear}>
                        <FormattedMessage id="resetToDefault" />
                    </Button>
                    <SubmitButton onClick={handleSubmit(onSubmit)}>
                        <FormattedMessage id="validate" />
                    </SubmitButton>
                    <CloseButton
                        hideParameters={hideParameters}
                        className={classes.button}
                    />
                </DialogActions>
            </Grid>
        </FormProvider>
    );
};
