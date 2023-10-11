/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SubmitButton, useSnackMessage } from '@gridsuite/commons-ui';
import { Grid, Button, DialogActions } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { CloseButtonWithConfirm, DropDown, styles } from '../parameters';
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
} from '../../../utils/field-constants';
import yup from '../../../utils/yup-config';
import {
    getSensitivityAnalysisParameters,
    setSensitivityAnalysisParameters,
} from '../../../../services/study/sensitivity-analysis';
import SensitivityAnalysisFields from './sensitivity-Flow-parameters';
import SensitivityParametersSelector from './sensitivity-parameters-selector';
import { LineSeparator } from '../../dialogUtils';
import {
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
import { SelectOptionsDialog } from '../../../../utils/dialogs';
import DialogContentText from '@mui/material/DialogContentText';

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
    const { snackError } = useSnackMessage();

    const [popupConfirm, setPopupConfirm] = useState(false);

    const [providers, provider, updateProvider, resetProvider] =
        parametersBackend;

    const handlePopupConfirm = useCallback(() => {
        hideParameters();
        setPopupConfirm(false);
    }, []);

    const handleClosePopupConfirm = useCallback(() => {
        setPopupConfirm(false);
    }, []);

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
        };
    }, []);
    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, handleSubmit, formState, register } = formMethods;
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
                        };
                    }) ?? [],
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
        <>
            <FormProvider validationSchema={formSchema} {...formMethods}>
                <Grid container spacing={1} paddingTop={1}>
                    <DropDown
                        value={provider}
                        label="Provider"
                        values={providers}
                        callback={updateProviderCallback}
                    />
                </Grid>
                <Grid
                    container
                    sx={styles.scrollableGrid}
                    key="sensitivityAnalysisParameters"
                >
                    <Grid container paddingTop={1} paddingBottom={1}>
                        <LineSeparator />
                    </Grid>
                    <SensitivityAnalysisFields
                        reset={reset}
                        useSensitivityAnalysisParameters={
                            useSensitivityAnalysisParameters
                        }
                    />
                    <Grid container paddingTop={1} paddingBottom={2}>
                        <LineSeparator />
                    </Grid>
                    <SensitivityParametersSelector
                        reset={reset}
                        useSensitivityAnalysisParameters={
                            useSensitivityAnalysisParameters
                        }
                    />
                </Grid>
                <DialogActions>
                    <Button onClick={clear}>
                        <FormattedMessage id="resetToDefault" />
                    </Button>

                    <Button variant="outlined">
                        <SubmitButton onClick={handleSubmit(onSubmit)}>
                            <FormattedMessage id="validate" />
                        </SubmitButton>
                    </Button>
                    <CloseButtonWithConfirm
                        callback={() => {
                            if (
                                formState.dirtyFields &&
                                Object.keys(formState.dirtyFields).length === 0
                            ) {
                                hideParameters();
                            } else {
                                setPopupConfirm(true);
                            }
                        }}
                        label={'Annuler'}
                    />
                </DialogActions>
            </FormProvider>

            <SelectOptionsDialog
                open={popupConfirm}
                onClose={handleClosePopupConfirm}
                onClick={handlePopupConfirm}
                child={
                    <DialogContentText>
                        <FormattedMessage
                            id={'Are you sur that you want to abord ?'}
                        />
                    </DialogContentText>
                }
                style={{
                    '& .MuiPaper-root': {
                        overflowY: 'visible',
                    },
                }}
            />
        </>
    );
};
