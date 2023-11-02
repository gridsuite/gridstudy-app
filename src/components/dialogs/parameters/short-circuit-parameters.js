/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid } from '@mui/material';
import { CloseButton, styles } from './parameters';
import { SubmitButton, useSnackMessage } from '@gridsuite/commons-ui';
import { useSelector } from 'react-redux';
import { LineSeparator } from '../dialogUtils';
import {
    getShortCircuitParameters,
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
import { INITIAL_TENSION } from '../../utils/constants';

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

export const ShortCircuitParameters = ({
    hideParameters,
    useShortCircuitParameters,
}) => {
    const studyUuid = useSelector((state) => state.studyUuid);

    const [shortCircuitParams, setShortCircuitParams] =
        useShortCircuitParameters;

    const { snackError } = useSnackMessage();

    const emptyFormData = useMemo(() => {
        return {
            [SHORT_CIRCUIT_WITH_FEEDER_RESULT]:
                shortCircuitParams.withFeederResult,
            [SHORT_CIRCUIT_PREDEFINED_PARAMS]:
                shortCircuitParams.predefinedParameters,
            [SHORT_CIRCUIT_WITH_LOADS]: shortCircuitParams.withLoads,
            [SHORT_CIRCUIT_WITH_VSC_CONVERTER_STATIONS]:
                shortCircuitParams.withVSCConverterStations,
            [SHORT_CIRCUIT_WITH_SHUNT_COMPENSATORS]:
                shortCircuitParams.withShuntCompensators,
            [SHORT_CIRCUIT_WITH_NEUTRAL_POSITION]:
                shortCircuitParams.withNeutralPosition,
            [SHORT_CIRCUIT_INITIAL_VOLTAGE_PROFILE_MODE]:
                shortCircuitParams.initialVoltageProfileMode,
        };
    }, [shortCircuitParams]);

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const {
        reset,
        handleSubmit,
        formState: { isDirty },
    } = formMethods;

    // submit parameters
    const onSubmit = useCallback(
        (newParams) => {
            const oldParams = { ...shortCircuitParams };
            setShortCircuitParams(newParams);
            setShortCircuitParameters(studyUuid, {
                ...oldParams,
                ...newParams,
            })
                .then(() => {
                    return getShortCircuitParameters(studyUuid)
                        .then((params) => {
                            setShortCircuitParams(params);
                        })
                        .catch((error) => {
                            snackError({
                                messageTxt: error.message,
                                headerId: 'paramsRetrievingError',
                            });
                        });
                })
                .catch((error) => {
                    setShortCircuitParams(oldParams);
                    snackError({
                        messageTxt: error.message,
                        headerId: 'paramsChangingError',
                    });
                });
        },
        [setShortCircuitParams, shortCircuitParams, snackError, studyUuid]
    );

    // when ever voltage profile mode change we need to reset all parameters
    const resetAll = useCallback(
        (initialVoltageProfileMode) => {
            let dataToReset = {
                ...emptyFormData,
            };
            if (initialVoltageProfileMode === INITIAL_TENSION.NOMINAL) {
                dataToReset = {
                    ...dataToReset,
                    [SHORT_CIRCUIT_INITIAL_VOLTAGE_PROFILE_MODE]:
                        INITIAL_TENSION.NOMINAL,
                    [SHORT_CIRCUIT_PREDEFINED_PARAMS]: INITIAL_TENSION.NOMINAL,
                };
            }
            if (initialVoltageProfileMode === INITIAL_TENSION.CONFIGURED) {
                dataToReset = {
                    ...dataToReset,
                    [SHORT_CIRCUIT_INITIAL_VOLTAGE_PROFILE_MODE]:
                        INITIAL_TENSION.CONFIGURED,
                    [SHORT_CIRCUIT_PREDEFINED_PARAMS]:
                        INITIAL_TENSION.CONFIGURED,
                };
            }

            // when keepDirty is true isDirty will temporarily remain as the current state until further user's action
            //todo: fix reset because rerendering twice
            reset(dataToReset, { keepDirty: true });
        },
        [reset, emptyFormData]
    );
    return (
        <FormProvider validationSchema={formSchema} {...formMethods}>
            <Grid container paddingTop={1} paddingBottom={1}>
                <LineSeparator />
            </Grid>

            <Grid>
                <ShortCircuitFields
                    resetAll={resetAll}
                    studyUuid={studyUuid}
                    isDirty={isDirty}
                />
            </Grid>
            <Grid
                container
                sx={mergeSx(styles.controlItem, styles.marginTopButton)}
                maxWidth="md"
            >
                <SubmitButton onClick={handleSubmit(onSubmit)}>
                    <FormattedMessage id="validate" />
                </SubmitButton>
                <CloseButton hideParameters={hideParameters} />
            </Grid>
        </FormProvider>
    );
};
