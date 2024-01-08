/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid } from '@mui/material';
import { styles } from './parameters';
import { SubmitButton, useSnackMessage } from '@gridsuite/commons-ui';
import { useSelector } from 'react-redux';
import { LineSeparator } from '../dialogUtils';
import {
    getShortCircuitParameters,
    invalidateShortCircuitStatus,
    setShortCircuitParameters,
} from '../../../services/study/short-circuit-analysis';
import {
    OptionalServicesNames,
    OptionalServicesStatus,
} from '../../utils/optional-services';
import { useOptionalServiceStatus } from '../../../hooks/use-optional-service-status';
import { mergeSx } from '../../utils/functions';
import yup from '../../utils/yup-config';
import {
    SHORT_CIRCUIT_INITIAL_VOLTAGE_PROFILE_MODE,
    SHORT_CIRCUIT_PREDEFINED_PARAMS,
    SHORT_CIRCUIT_WITH_FEEDER_RESULT,
    SHORT_CIRCUIT_WITH_LOADS,
    SHORT_CIRCUIT_WITH_NEUTRAL_POSITION,
    SHORT_CIRCUIT_WITH_SHUNT_COMPENSATORS,
    SHORT_CIRCUIT_WITH_VSC_CONVERTER_STATIONS,
} from '../../utils/field-constants';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import ShortCircuitFields from './shortcircuit/short-circuit-parameters';
import { INITIAL_VOLTAGE, PREDEFINED_PARAMETERS } from '../../utils/constants';

export const useGetShortCircuitParameters = () => {
    const studyUuid = useSelector((state) => state.studyUuid);
    const { snackError } = useSnackMessage();
    const [shortCircuitParams, setShortCircuitParams] = useState(null);

    const shortCircuitAvailability = useOptionalServiceStatus(
        OptionalServicesNames.ShortCircuit
    );

    useEffect(() => {
        if (
            studyUuid &&
            shortCircuitAvailability === OptionalServicesStatus.Up
        ) {
            getShortCircuitParameters(studyUuid)
                .then((params) => setShortCircuitParams(params))
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'paramsRetrievingError',
                    });
                });
        }
    }, [shortCircuitAvailability, studyUuid, snackError]);

    return [shortCircuitParams, setShortCircuitParams];
};

const formSchema = yup
    .object()
    .shape({
        [SHORT_CIRCUIT_WITH_FEEDER_RESULT]: yup.boolean(),
        [SHORT_CIRCUIT_PREDEFINED_PARAMS]: yup.string().required(),
        [SHORT_CIRCUIT_WITH_LOADS]: yup.boolean(),
        [SHORT_CIRCUIT_WITH_VSC_CONVERTER_STATIONS]: yup.boolean(),
        [SHORT_CIRCUIT_WITH_SHUNT_COMPENSATORS]: yup.boolean(),
        [SHORT_CIRCUIT_WITH_NEUTRAL_POSITION]: yup.boolean(),
        [SHORT_CIRCUIT_INITIAL_VOLTAGE_PROFILE_MODE]: yup.string().required(),
    })
    .required();

const prepareDataToSend = (shortCircuitParams, newParameters) => {
    const oldParameters = { ...shortCircuitParams.parameters };
    let parameters = {
        ...oldParameters,
        ...newParameters,
        // we need to add voltageRanges to the parameters only when initialVoltageProfileMode is equals to CEI909
        voltageRanges: undefined,
        predefinedParameters: undefined, // because this field is not part of the powsybl parameters
        withNeutralPosition: !newParameters.withNeutralPosition,
    };
    if (newParameters.initialVoltageProfileMode === INITIAL_VOLTAGE.CEI909) {
        parameters = {
            ...parameters,
            voltageRanges: shortCircuitParams.cei909VoltageRanges,
            initialVoltageProfileMode: INITIAL_VOLTAGE.CONFIGURED,
        };
    }

    return {
        predefinedParameters: newParameters.predefinedParameters,
        parameters: parameters,
    };
};
export const ShortCircuitParameters = ({
    useShortCircuitParameters,
    setHaveDirtyFields,
}) => {
    const studyUuid = useSelector((state) => state.studyUuid);

    const [shortCircuitParams, setShortCircuitParams] =
        useShortCircuitParameters;

    const { snackError } = useSnackMessage();

    // get default values based on shortCircuitParams
    const emptyFormData = useMemo(() => {
        const { parameters, predefinedParameters } = shortCircuitParams;
        return {
            [SHORT_CIRCUIT_WITH_FEEDER_RESULT]: parameters.withFeederResult,
            [SHORT_CIRCUIT_PREDEFINED_PARAMS]: predefinedParameters,
            [SHORT_CIRCUIT_WITH_LOADS]: parameters.withLoads,
            [SHORT_CIRCUIT_WITH_VSC_CONVERTER_STATIONS]:
                parameters.withVSCConverterStations,
            [SHORT_CIRCUIT_WITH_SHUNT_COMPENSATORS]:
                parameters.withShuntCompensators,
            [SHORT_CIRCUIT_WITH_NEUTRAL_POSITION]:
                !parameters.withNeutralPosition,
            [SHORT_CIRCUIT_INITIAL_VOLTAGE_PROFILE_MODE]:
                parameters.initialVoltageProfileMode ===
                INITIAL_VOLTAGE.CONFIGURED
                    ? INITIAL_VOLTAGE.CEI909
                    : parameters.initialVoltageProfileMode,
        };
    }, [shortCircuitParams]);

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, setValue, handleSubmit, formState } = formMethods;

    // submit the new parameters
    const onSubmit = useCallback(
        (newParams) => {
            const oldParams = { ...shortCircuitParams };
            setShortCircuitParameters(studyUuid, {
                ...prepareDataToSend(shortCircuitParams, newParams),
            })
                .then(() => {
                    // fetch parameters and invalide the short circuit status
                    getShortCircuitParameters(studyUuid)
                        .then((params) => {
                            setShortCircuitParams(params);
                        })
                        .catch((error) => {
                            snackError({
                                messageTxt: error.message,
                                headerId: 'paramsRetrievingError',
                            });
                        });

                    invalidateShortCircuitStatus(studyUuid).catch((error) => {
                        snackError({
                            messageTxt: error.message,
                            headerId: 'invalidateShortCircuitStatusError',
                        });
                    });
                    //used to update isDirty after submit
                    reset({}, { keepValues: true });
                })
                .catch((error) => {
                    setShortCircuitParams(oldParams);
                    snackError({
                        messageTxt: error.message,
                        headerId: 'paramsChangingError',
                    });
                });
        },
        [
            setShortCircuitParams,
            shortCircuitParams,
            snackError,
            studyUuid,
            reset,
        ]
    );

    // when ever the predefined parameter changes we need to reset all parameters
    const resetAll = useCallback(
        (predefinedParameter) => {
            setValue(SHORT_CIRCUIT_WITH_FEEDER_RESULT, true, {
                shouldDirty: true,
            });
            setValue(SHORT_CIRCUIT_WITH_LOADS, false, { shouldDirty: true });
            setValue(SHORT_CIRCUIT_WITH_VSC_CONVERTER_STATIONS, true, {
                shouldDirty: true,
            });
            setValue(SHORT_CIRCUIT_WITH_SHUNT_COMPENSATORS, false, {
                shouldDirty: true,
            });
            setValue(SHORT_CIRCUIT_WITH_NEUTRAL_POSITION, false, {
                shouldDirty: true,
            });
            const initalVoltageProfileMode =
                predefinedParameter ===
                PREDEFINED_PARAMETERS.ICC_MAX_WITH_NOMINAL_VOLTAGE_MAP
                    ? INITIAL_VOLTAGE.NOMINAL
                    : INITIAL_VOLTAGE.CEI909;

            setValue(
                SHORT_CIRCUIT_INITIAL_VOLTAGE_PROFILE_MODE,
                initalVoltageProfileMode,
                {
                    shouldDirty: true,
                }
            );
            setValue(SHORT_CIRCUIT_PREDEFINED_PARAMS, predefinedParameter, {
                shouldDirty: true,
            });
        },
        [setValue]
    );

    useEffect(() => {
        setHaveDirtyFields(!!Object.keys(formState.dirtyFields).length);
    }, [formState, setHaveDirtyFields]);

    return (
        <FormProvider validationSchema={formSchema} {...formMethods}>
            <Grid sx={{ height: '100%' }}>
                <Grid container paddingTop={1} paddingBottom={1}>
                    <LineSeparator />
                </Grid>

                <Grid sx={styles.scrollableGrid}>
                    <ShortCircuitFields resetAll={resetAll} />
                </Grid>
            </Grid>
            <Grid
                container
                sx={mergeSx(
                    styles.controlParametersItem,
                    styles.marginTopButton
                )}
            >
                <SubmitButton
                    variant="outlined"
                    onClick={handleSubmit(onSubmit)}
                >
                    <FormattedMessage id="validate" />
                </SubmitButton>
            </Grid>
        </FormProvider>
    );
};
