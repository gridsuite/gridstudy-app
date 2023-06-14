/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSnackMessage } from '@gridsuite/commons-ui';
import { Tabs, Tab, Grid, Button, DialogActions } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import {
    getVoltageInitParameters,
    updateVoltageInitParameters,
} from 'utils/rest-api';
import { useStyles, TabPanel, CloseButton } from '../parameters';
import VoltageLimitsParameters from './voltage-limits-parameters';
import EquipmentSelectionParameters from './equipment-selection-parameters';
import SubmitButton from '../../commons/submitButton';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import {
    EQUIPMENT_SELECTION,
    FILTER_ID,
    FILTER_NAME,
    FILTERS,
    FIXED_GENERATORS,
    HIGH_VOLTAGE_LIMIT,
    ID,
    LOW_VOLTAGE_LIMIT,
    NAME,
    PRIORITY,
    VARIABLE_SHUNT_COMPENSATORS,
    VARIABLE_TRANSFORMERS,
    VOLTAGE_LIMITS,
} from '../../../utils/field-constants';
import yup from '../../../utils/yup-config';

export const useGetVoltageInitParameters = () => {
    const studyUuid = useSelector((state) => state.studyUuid);
    const { snackError } = useSnackMessage();
    const [voltageInitParams, setVoltageInitParams] = useState(null);

    useEffect(() => {
        if (studyUuid) {
            getVoltageInitParameters(studyUuid)
                .then((params) => setVoltageInitParams(params))
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'paramsRetrievingError',
                    });
                });
        }
    }, [studyUuid, snackError]);

    return [voltageInitParams, setVoltageInitParams];
};

const TAB_VALUES = {
    voltageLimitsParamsTabValue: 'VoltageLimits',
    equipmentSelectionParamsTabValue: 'EquipmentSelection',
};

const formSchema = yup.object().shape({
    [VOLTAGE_LIMITS]: yup.array().of(
        yup.object().shape({
            [FILTERS]: yup
                .array()
                .of(
                    yup.object().shape({
                        [ID]: yup.string().required(),
                        [NAME]: yup.string().required(),
                    })
                )
                .min(1, 'FilterInputMinError'),
            [LOW_VOLTAGE_LIMIT]: yup.number().nullable(),
            [HIGH_VOLTAGE_LIMIT]: yup.number().nullable(),
        })
    ),
    [EQUIPMENT_SELECTION]: yup.object().shape({
        [FIXED_GENERATORS]: yup.array().of(
            yup.object().shape({
                [ID]: yup.string().required(),
                [NAME]: yup.string().required(),
            })
        ),
        [VARIABLE_TRANSFORMERS]: yup.array().of(
            yup.object().shape({
                [ID]: yup.string().required(),
                [NAME]: yup.string().required(),
            })
        ),
        [VARIABLE_SHUNT_COMPENSATORS]: yup.array().of(
            yup.object().shape({
                [ID]: yup.string().required(),
                [NAME]: yup.string().required(),
            })
        ),
    }),
});

export const VoltageInitParameters = ({
    hideParameters,
    useVoltageInitParameters,
}) => {
    const classes = useStyles();
    const { snackError } = useSnackMessage();

    const [tabValue, setTabValue] = useState(
        TAB_VALUES.voltageLimitsParamsTabValue
    );

    const emptyFormData = useMemo(() => {
        return {
            [VOLTAGE_LIMITS]: [],
            [EQUIPMENT_SELECTION]: {
                [FIXED_GENERATORS]: [],
                [VARIABLE_TRANSFORMERS]: [],
                [VARIABLE_SHUNT_COMPENSATORS]: [],
            },
        };
    }, []);

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });
    const { reset, control, handleSubmit } = formMethods;

    const studyUuid = useSelector((state) => state.studyUuid);

    const [voltageInitParams, setVoltageInitParams] = useVoltageInitParameters;

    const handleTabChange = useCallback((event, newValue) => {
        setTabValue(newValue);
    }, []);

    const resetVoltageInitParameters = useCallback(() => {
        updateVoltageInitParameters(studyUuid, emptyFormData)
            .then(() => {
                return getVoltageInitParameters(studyUuid)
                    .then((params) => setVoltageInitParams(params))
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
    }, [studyUuid, emptyFormData, setVoltageInitParams, snackError]);

    const formatNewParams = useCallback((newParams) => {
        console.info('newParams1111', newParams);
        return {
            [VOLTAGE_LIMITS]: newParams.voltageLimits.map((voltageLimit) => {
                return {
                    [PRIORITY]: newParams.voltageLimits.indexOf(voltageLimit),
                    [LOW_VOLTAGE_LIMIT]: voltageLimit[LOW_VOLTAGE_LIMIT] ?? 0,
                    [HIGH_VOLTAGE_LIMIT]: voltageLimit[HIGH_VOLTAGE_LIMIT] ?? 0,
                    [FILTERS]: voltageLimit[FILTERS].map((filter) => {
                        return {
                            [FILTER_ID]: filter[ID],
                            [FILTER_NAME]: filter[NAME],
                        };
                    }),
                };
            }),
            [EQUIPMENT_SELECTION]: {
                [FIXED_GENERATORS]: newParams.equipmentSelection[
                    FIXED_GENERATORS
                ]?.map((filter) => {
                    return {
                        [FILTER_ID]: filter[ID],
                        [FILTER_NAME]: filter[NAME],
                    };
                }),
                [VARIABLE_TRANSFORMERS]: newParams.equipmentSelection[
                    VARIABLE_TRANSFORMERS
                ]?.map((filter) => {
                    return {
                        [FILTER_ID]: filter[ID],
                        [FILTER_NAME]: filter[NAME],
                    };
                }),
                [VARIABLE_SHUNT_COMPENSATORS]: newParams.equipmentSelection[
                    VARIABLE_SHUNT_COMPENSATORS
                ]?.map((filter) => {
                    return {
                        [FILTER_ID]: filter[ID],
                        [FILTER_NAME]: filter[NAME],
                    };
                }),
            },
        };
    }, []);

    const onSubmit = useCallback(
        (newParams) => {
            console.info('newParams2222', newParams);
            updateVoltageInitParameters(studyUuid, formatNewParams(newParams))
                .then(() => {
                    setVoltageInitParams(formatNewParams(newParams));
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'VoltageInitParametersError',
                    });
                });
        },
        [setVoltageInitParams, snackError, studyUuid, formatNewParams]
    );

    const fromVoltageInitParamsDataToFormValues = useCallback(
        (parameters) => {
            console.info('parameters', parameters);
            reset({
                [VOLTAGE_LIMITS]: parameters.voltageLimits.map(
                    (voltageLimit) => {
                        return {
                            [FILTERS]: voltageLimit[FILTERS].map((filter) => {
                                return {
                                    [ID]: filter[FILTER_ID],
                                    [NAME]: filter[FILTER_NAME],
                                };
                            }),
                            [LOW_VOLTAGE_LIMIT]:
                                voltageLimit[LOW_VOLTAGE_LIMIT],
                            [HIGH_VOLTAGE_LIMIT]:
                                voltageLimit[HIGH_VOLTAGE_LIMIT],
                        };
                    }
                ),
                [EQUIPMENT_SELECTION]: !parameters.equipmentSelection
                    ? {}
                    : {
                          [FIXED_GENERATORS]: parameters.equipmentSelection[
                              FIXED_GENERATORS
                          ]?.map((filter) => {
                              return {
                                  [ID]: filter[FILTER_ID],
                                  [NAME]: filter[FILTER_NAME],
                              };
                          }),
                          [VARIABLE_TRANSFORMERS]:
                              parameters.equipmentSelection[
                                  VARIABLE_TRANSFORMERS
                              ]?.map((filter) => {
                                  return {
                                      [ID]: filter[FILTER_ID],
                                      [NAME]: filter[FILTER_NAME],
                                  };
                              }),
                          [VARIABLE_SHUNT_COMPENSATORS]:
                              parameters.equipmentSelection[
                                  VARIABLE_SHUNT_COMPENSATORS
                              ]?.map((filter) => {
                                  return {
                                      [ID]: filter[FILTER_ID],
                                      [NAME]: filter[FILTER_NAME],
                                  };
                              }),
                      },
            });
        },
        [reset]
    );

    useEffect(() => {
        if (voltageInitParams) {
            fromVoltageInitParamsDataToFormValues(voltageInitParams);
        }
    }, [fromVoltageInitParamsDataToFormValues, voltageInitParams]);

    const clear = useCallback(() => {
        //TODO reset all or only one tab ?
        // if (tabValue === TAB_VALUES.voltageLimitsParamsTabValue) {
        //     reset(emptyFormData[VOLTAGE_LIMITS]);
        // } else if (tabValue === TAB_VALUES.equipmentSelectionParamsTabValue) {
        //     reset(emptyFormData[EQUIPMENT_SELECTION]);
        // }
        reset(emptyFormData);
        resetVoltageInitParameters();
    }, [emptyFormData, reset, resetVoltageInitParameters]);

    return (
        <FormProvider validationSchema={formSchema} {...formMethods}>
            <Grid
                container
                key="voltageInitParameters"
                className={classes.scrollableGrid}
            >
                <Grid item maxWidth="md" width="100%">
                    <Tabs
                        value={tabValue}
                        variant="scrollable"
                        onChange={handleTabChange}
                    >
                        <Tab
                            label={<FormattedMessage id="VoltageLimits" />}
                            value={TAB_VALUES.voltageLimitsParamsTabValue}
                        />
                        <Tab
                            label={<FormattedMessage id="EquipmentSelection" />}
                            value={TAB_VALUES.equipmentSelectionParamsTabValue}
                        />
                    </Tabs>
                    <Grid container>
                        <TabPanel
                            value={tabValue}
                            index={TAB_VALUES.voltageLimitsParamsTabValue}
                        >
                            <VoltageLimitsParameters
                                control={control}
                                reset={reset}
                                useVoltageInitParameters={
                                    useVoltageInitParameters
                                }
                            />
                        </TabPanel>
                        <TabPanel
                            value={tabValue}
                            index={TAB_VALUES.equipmentSelectionParamsTabValue}
                        >
                            <EquipmentSelectionParameters
                                reset={reset}
                                useVoltageInitParameters={
                                    useVoltageInitParameters
                                }
                            />
                        </TabPanel>
                    </Grid>
                    <DialogActions>
                        <Button onClick={clear}>
                            <FormattedMessage id="resetToDefault" />
                        </Button>
                        <SubmitButton onClick={handleSubmit(onSubmit)} />
                        <CloseButton
                            hideParameters={hideParameters}
                            className={classes.button}
                        />
                    </DialogActions>
                </Grid>
            </Grid>
        </FormProvider>
    );
};
