/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { elementType, useSnackMessage } from '@gridsuite/commons-ui';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    LinearProgress,
    MenuItem,
    Select,
    Tooltip,
    Typography,
} from '@mui/material';
import SubmitButton from 'components/dialogs/commons/submitButton';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import {
    FILTERS,
    FILTER_ID,
    FILTER_NAME,
    ID,
    NAME,
    EQUIPMENTS_SELECTION,
    FIXED_GENERATORS,
    VARIABLE_SHUNT_COMPENSATORS,
    VARIABLE_TRANSFORMERS,
} from 'components/utils/field-constants';
import React, { useCallback, useEffect, useMemo } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import {
    getVoltageInitParameters,
    updateVoltageInitParameters,
} from 'utils/rest-api';
import yup from 'components/utils/yup-config';
import { yupResolver } from '@hookform/resolvers/yup';
import { CloseButton, useStyles } from '../parameters';
import DirectoryItemsInput from '../../../utils/rhf-inputs/directory-items-input';

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENTS_SELECTION]: yup
            .array()
            .of(
                yup.object().shape({
                    [FIXED_GENERATORS]: yup
                        .array()
                        .of(
                            yup.object().shape({
                                [ID]: yup.string().required(),
                                [NAME]: yup.string().required(),
                            })
                        )
                        .min(1, 'FilterInputMinError'),
                    [VARIABLE_TRANSFORMERS]: yup
                        .array()
                        .of(
                            yup.object().shape({
                                [ID]: yup.string().required(),
                                [NAME]: yup.string().required(),
                            })
                        )
                        .min(1, 'FilterInputMinError'),
                    [VARIABLE_SHUNT_COMPENSATORS]: yup
                        .array()
                        .of(
                            yup.object().shape({
                                [ID]: yup.string().required(),
                                [NAME]: yup.string().required(),
                            })
                        )
                        .min(1, 'FilterInputMinError'),
                })
            )
            .required(),
    })
    .required();

const EquipmentsSelectionParameters = ({
    hideParameters,
    useVoltageInitParameters,
}) => {
    const classes = useStyles();

    const emptyFormData = useMemo(() => {
        return {
            [FIXED_GENERATORS]: [],
            [VARIABLE_TRANSFORMERS]: [],
            [VARIABLE_SHUNT_COMPENSATORS]: [],
        };
    }, []);
    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });
    const { reset, handleSubmit } = formMethods;

    const [voltageInitParams, setVoltageInitParams] = useVoltageInitParameters;

    const { snackError } = useSnackMessage();

    const studyUuid = useSelector((state) => state.studyUuid);

    const onSubmit = useCallback(
        (newParams) => {
            console.info('newParams', newParams)
            updateVoltageInitParameters(
                studyUuid,
                formatNewParams(newParams)
            )
                .then(() => {
                    setVoltageInitParams(
                        formatNewParams(newParams)
                    );
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'VoltageInitParametersError',
                    });
                });
        },
        [setVoltageInitParams, snackError, studyUuid]
    );

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

    const fromEquipmentsSelectionDataToFormValues = useCallback(
        (equipmentsSelection) => {
            reset({
                [EQUIPMENTS_SELECTION]: equipmentsSelection.map((filters) => {
                    return {
                        [FIXED_GENERATORS]: filters[FIXED_GENERATORS].map(
                            (filter) => {
                                return {
                                    [ID]: filter[FILTER_ID],
                                    [NAME]: filter[FILTER_NAME],
                                };
                            }
                        ),
                        [VARIABLE_TRANSFORMERS]: filters[
                            VARIABLE_TRANSFORMERS
                        ].map((filter) => {
                            return {
                                [ID]: filter[FILTER_ID],
                                [NAME]: filter[FILTER_NAME],
                            };
                        }),
                        [VARIABLE_SHUNT_COMPENSATORS]: filters[
                            VARIABLE_SHUNT_COMPENSATORS
                        ].map((filter) => {
                            return {
                                [ID]: filter[FILTER_ID],
                                [NAME]: filter[FILTER_NAME],
                            };
                        }),
                    };
                }),
            });
        },
        [reset]
    );

    const formatNewParams = useCallback((equipmentsSelection) => {
        console.info('equipmentsSelection', equipmentsSelection)
        const elem = {
            [EQUIPMENTS_SELECTION]: equipmentsSelection.map((filters) => {
                return {
                    [FIXED_GENERATORS]: filters[FILTERS].map((filter) => {
                        return {
                            [FILTER_ID]: filter[ID],
                            [FILTER_NAME]: filter[NAME],
                        };
                    }),
                    [VARIABLE_TRANSFORMERS]: filters[FILTERS].map((filter) => {
                        return {
                            [FILTER_ID]: filter[ID],
                            [FILTER_NAME]: filter[NAME],
                        };
                    }),
                    [VARIABLE_SHUNT_COMPENSATORS]: filters[FILTERS].map(
                        (filter) => {
                            return {
                                [FILTER_ID]: filter[ID],
                                [FILTER_NAME]: filter[NAME],
                            };
                        }
                    ),
                };
        console.info('elem', elem)
        return elem;
            }),
        };
    }, []);

    useEffect(() => {
        if (voltageInitParams?.equipmentsSelection) {
            fromEquipmentsSelectionDataToFormValues(
                voltageInitParams.equipmentsSelection
            );
        }
    }, [fromEquipmentsSelectionDataToFormValues, voltageInitParams]);

    const clear = useCallback(() => {
        reset(emptyFormData);
        resetVoltageInitParameters();
    }, [emptyFormData, reset, resetVoltageInitParameters]);

    return (
        <FormProvider validationSchema={formSchema} {...formMethods}>
            <DialogContent>
                <Grid item container>
                    <Grid item xs={4}>
                        <Typography component="span" variant="body1">
                            <Box fontWeight="fontWeightBold" m={1}>
                                <FormattedMessage id={'FixedGenerators'} />
                            </Box>
                        </Typography>
                    </Grid>
                    <Grid item xs={4} className={classes.controlItem}>
                        <DirectoryItemsInput
                            name={'FixedGenerators'}
                            equipmentTypes={[EQUIPMENT_TYPES.GENERATOR.type]}
                            elementType={elementType.FILTER}
                            titleId={'FixedGenerators'}
                            hideErrorMessage={true}
                        />
                    </Grid>
                </Grid>
                <Grid item container>
                    <Grid item xs={4}>
                        <Typography component="span" variant="body1">
                            <Box fontWeight="fontWeightBold" m={1}>
                                <FormattedMessage id={'VariableTransformers'} />
                            </Box>
                        </Typography>
                    </Grid>
                    <Grid item xs={4} className={classes.controlItem}>
                        <DirectoryItemsInput
                            name={'VariableTransformers'}
                            equipmentTypes={[
                                EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER.type,
                                EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER.type,
                            ]}
                            elementType={elementType.FILTER}
                            titleId={'VariableTransformers'}
                            hideErrorMessage={true}
                        />
                    </Grid>
                </Grid>
                <Grid item container>
                    <Grid item xs={4}>
                        <Typography component="span" variant="body1">
                            <Box fontWeight="fontWeightBold" m={1}>
                                <FormattedMessage
                                    id={'VariableShuntCompensators'}
                                />
                            </Box>
                        </Typography>
                    </Grid>
                    <Grid item xs={4} className={classes.controlItem}>
                        <DirectoryItemsInput
                            name={'VariableShuntCompensators'}
                            equipmentTypes={[
                                EQUIPMENT_TYPES.SHUNT_COMPENSATOR.type,
                            ]}
                            elementType={elementType.FILTER}
                            titleId={'VariableShuntCompensators'}
                            hideErrorMessage={true}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
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
        </FormProvider>
    );
};

export default EquipmentsSelectionParameters;
