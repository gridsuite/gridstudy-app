/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSnackMessage } from '@gridsuite/commons-ui';
import { Tabs, Tab, Grid, Button, DialogActions } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { styles, TabPanel, CloseButton } from '../parameters';
import VoltageLimitsParameters from './voltage-limits-parameters';
import EquipmentSelectionParameters from './equipment-selection-parameters';
import { SubmitButton } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import {
    FILTER_ID,
    FILTER_NAME,
    FILTERS,
    FIXED_GENERATORS,
    HIGH_VOLTAGE_LIMIT,
    ID,
    LOW_VOLTAGE_LIMIT,
    NAME,
    VARIABLE_SHUNT_COMPENSATORS,
    VARIABLE_TRANSFORMERS,
    VOLTAGE_LIMITS,
} from '../../../utils/field-constants';
import yup from '../../../utils/yup-config';
import {
    getVoltageInitStudyParameters,
    updateVoltageInitParameters,
} from '../../../../services/study/voltage-init';
import {
    OptionalServicesNames,
    OptionalServicesStatus,
} from '../../../utils/optional-services';
import { useOptionalServiceStatus } from '../../../../hooks/use-optional-service-status';
import { getTabIndicatorStyle, getTabStyle } from '../../../utils/tab-utils';
import CreateParameterDialog from '../common/parameters-creation-dialog';
import { formatNewParams } from './voltage-init-utils';
import DirectoryItemSelector from 'components/directory-item-selector';
import { getVoltageInitParameters } from 'services/voltage-init';

export const useGetVoltageInitParameters = () => {
    const studyUuid = useSelector((state) => state.studyUuid);
    const { snackError } = useSnackMessage();
    const [voltageInitParams, setVoltageInitParams] = useState(null);

    const voltageInitAvailability = useOptionalServiceStatus(
        OptionalServicesNames.VoltageInit
    );

    useEffect(() => {
        if (
            studyUuid &&
            voltageInitAvailability === OptionalServicesStatus.Up
        ) {
            getVoltageInitStudyParameters(studyUuid)
                .then((params) => setVoltageInitParams(params))
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'paramsRetrievingError',
                    });
                });
        }
    }, [voltageInitAvailability, studyUuid, snackError]);

    return [voltageInitParams, setVoltageInitParams];
};

const TAB_VALUES = {
    voltageLimitsParamsTabValue: 'voltageLimits',
    equipmentSelectionParamsTabValue: 'equipmentSelection',
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
});

export const VoltageInitParameters = ({
    hideParameters,
    useVoltageInitParameters,
}) => {
    const [openCreateParameterDialog, setOpenCreateParameterDialog] =
        useState(false);
    const [openSelectParameterDialog, setOpenSelectParameterDialog] =
        useState(false);
    const { snackError } = useSnackMessage();
    const intl = useIntl();

    const [tabValue, setTabValue] = useState(
        TAB_VALUES.voltageLimitsParamsTabValue
    );

    const emptyFormData = useMemo(() => {
        return {
            [VOLTAGE_LIMITS]: [],
            [FIXED_GENERATORS]: [],
            [VARIABLE_TRANSFORMERS]: [],
            [VARIABLE_SHUNT_COMPENSATORS]: [],
        };
    }, []);

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });
    const { reset, handleSubmit, getValues } = formMethods;

    const studyUuid = useSelector((state) => state.studyUuid);

    const [voltageInitParams, setVoltageInitParams] = useVoltageInitParameters;

    const handleTabChange = useCallback((event, newValue) => {
        setTabValue(newValue);
    }, []);

    const resetVoltageInitParameters = useCallback(() => {
        updateVoltageInitParameters(studyUuid, emptyFormData)
            .then(() => {
                return getVoltageInitStudyParameters(studyUuid)
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

    const onSubmit = useCallback(
        (newParams) => {
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
            onValidationError();
        },
        [setVoltageInitParams, snackError, studyUuid]
    );

    const fromVoltageInitParamsDataToFormValues = useCallback(
        (parameters, resetParam) => {
            reset(
                {
                    [VOLTAGE_LIMITS]:
                        parameters.voltageLimits?.map((voltageLimit) => {
                            return {
                                [FILTERS]: voltageLimit[FILTERS]?.map(
                                    (filter) => {
                                        return {
                                            [ID]: filter[FILTER_ID],
                                            [NAME]: filter[FILTER_NAME],
                                        };
                                    }
                                ),
                                [LOW_VOLTAGE_LIMIT]:
                                    voltageLimit[LOW_VOLTAGE_LIMIT],
                                [HIGH_VOLTAGE_LIMIT]:
                                    voltageLimit[HIGH_VOLTAGE_LIMIT],
                            };
                        }) ?? [],
                    [FIXED_GENERATORS]: parameters[FIXED_GENERATORS]?.map(
                        (filter) => {
                            return {
                                [ID]: filter[FILTER_ID],
                                [NAME]: filter[FILTER_NAME],
                            };
                        }
                    ),
                    [VARIABLE_TRANSFORMERS]: parameters[
                        VARIABLE_TRANSFORMERS
                    ]?.map((filter) => {
                        return {
                            [ID]: filter[FILTER_ID],
                            [NAME]: filter[FILTER_NAME],
                        };
                    }),
                    [VARIABLE_SHUNT_COMPENSATORS]: parameters[
                        VARIABLE_SHUNT_COMPENSATORS
                    ]?.map((filter) => {
                        return {
                            [ID]: filter[FILTER_ID],
                            [NAME]: filter[FILTER_NAME],
                        };
                    }),
                },
                { ...resetParam }
            );
        },
        [reset]
    );

    useEffect(() => {
        if (voltageInitParams) {
            fromVoltageInitParamsDataToFormValues(voltageInitParams);
        }
    }, [fromVoltageInitParamsDataToFormValues, voltageInitParams]);

    const [tabIndexesWithError, setTabIndexesWithError] = useState([]);
    const onValidationError = (errors) => {
        let tabsInError = [];
        if (errors?.[TAB_VALUES.voltageLimitsParamsTabValue] !== undefined) {
            tabsInError.push(TAB_VALUES.voltageLimitsParamsTabValue);
        }
        if (errors?.[TAB_VALUES.equipmentSelectionParamsTabValue]) {
            tabsInError.push(TAB_VALUES.equipmentSelectionParamsTabValue);
        }
        setTabIndexesWithError(tabsInError);
    };

    const clear = useCallback(() => {
        reset(emptyFormData);
        resetVoltageInitParameters();
        onValidationError();
    }, [emptyFormData, reset, resetVoltageInitParameters]);

    const handleLoadParameter = useCallback(
        (newParams) => {
            if (newParams && newParams.length > 0) {
                setOpenSelectParameterDialog(false);
                getVoltageInitParameters(newParams[0].id)
                    .then((parameters) => {
                        console.log(parameters);
                        console.info(
                            'loading the following voltage init parameters : ' +
                                parameters.uuid
                        );
                        fromVoltageInitParamsDataToFormValues(parameters, {
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
        [fromVoltageInitParamsDataToFormValues, snackError]
    );

    return (
        <>
            <FormProvider validationSchema={formSchema} {...formMethods}>
                <Grid
                    container
                    key="voltageInitParameters"
                    sx={styles.scrollableGrid}
                >
                    <Grid item maxWidth="md" width="100%">
                        <Tabs
                            value={tabValue}
                            variant="scrollable"
                            onChange={handleTabChange}
                            TabIndicatorProps={{
                                sx: getTabIndicatorStyle(
                                    tabIndexesWithError,
                                    tabValue
                                ),
                            }}
                        >
                            <Tab
                                label={<FormattedMessage id="VoltageLimits" />}
                                value={TAB_VALUES.voltageLimitsParamsTabValue}
                                sx={getTabStyle(
                                    tabIndexesWithError,
                                    TAB_VALUES.voltageLimitsParamsTabValue
                                )}
                            />
                            <Tab
                                label={
                                    <FormattedMessage id="EquipmentSelection" />
                                }
                                value={
                                    TAB_VALUES.equipmentSelectionParamsTabValue
                                }
                                sx={getTabStyle(
                                    tabIndexesWithError,
                                    TAB_VALUES.equipmentSelectionParamsTabValue
                                )}
                            />
                        </Tabs>
                        <Grid container>
                            <TabPanel
                                value={tabValue}
                                index={TAB_VALUES.voltageLimitsParamsTabValue}
                            >
                                <VoltageLimitsParameters
                                    reset={reset}
                                    useVoltageInitParameters={
                                        useVoltageInitParameters
                                    }
                                />
                            </TabPanel>
                            <TabPanel
                                value={tabValue}
                                index={
                                    TAB_VALUES.equipmentSelectionParamsTabValue
                                }
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
                            <Button
                                onClick={() =>
                                    setOpenSelectParameterDialog(true)
                                }
                            >
                                <FormattedMessage id="loadParameters" />
                            </Button>
                            <Button
                                onClick={() =>
                                    setOpenCreateParameterDialog(true)
                                }
                            >
                                <FormattedMessage id="save" />
                            </Button>
                            <Button onClick={clear}>
                                <FormattedMessage id="resetToDefault" />
                            </Button>
                            <SubmitButton
                                onClick={handleSubmit(
                                    onSubmit,
                                    onValidationError
                                )}
                            />
                            <CloseButton hideParameters={hideParameters} />
                        </DialogActions>
                    </Grid>
                </Grid>
            </FormProvider>

            {openCreateParameterDialog && (
                <CreateParameterDialog
                    open={openCreateParameterDialog}
                    onClose={() => setOpenCreateParameterDialog(false)}
                    parameterValues={getValues}
                />
            )}

            {openSelectParameterDialog && (
                <DirectoryItemSelector
                    open={openSelectParameterDialog}
                    onClose={handleLoadParameter}
                    types={['VOLTAGE_INIT_PARAMETERS']}
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
        </>
    );
};
