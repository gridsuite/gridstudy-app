/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid, MenuItem, Select } from '@mui/material';
import { CloseButton, SwitchWithLabel, styles } from './parameters';
import { SubmitButton, useSnackMessage } from '@gridsuite/commons-ui';
import { useSelector } from 'react-redux';
import { LabelledSlider, LineSeparator } from '../dialogUtils';
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

function getValue(param, key) {
    if (!param || param[key] === undefined) {
        return null;
    }
    return param[key];
}

const DropDown = ({ value, label, values, callback }) => {
    return (
        <>
            <Grid item xs={8} sx={styles.parameterName}>
                <FormattedMessage id={label} />
            </Grid>
            <Grid item container xs={4} sx={styles.controlItem}>
                <Select
                    labelId={label}
                    value={value}
                    onChange={callback}
                    size="small"
                >
                    {Object.keys(values).map((key) => (
                        <MenuItem key={key} value={key}>
                            <FormattedMessage id={values[key]} />
                        </MenuItem>
                    ))}
                </Select>
            </Grid>
        </>
    );
};

function makeComponentFor(defParam, key, scParams, setter) {
    const value = getValue(scParams, key);
    if (value != null) {
        if (defParam.type === TYPES.bool) {
            return (
                <SwitchWithLabel
                    value={value}
                    label={defParam.description}
                    callback={(ev) =>
                        setter({ ...scParams, [key]: ev.target.checked })
                    }
                />
            );
        } else if (defParam.type === TYPES.enum) {
            return (
                <DropDown
                    value={value}
                    label={defParam.description}
                    values={defParam.values}
                    callback={(ev) =>
                        setter({ ...scParams, [key]: ev.target.value })
                    }
                />
            );
        } else if (defParam.type === TYPES.slider) {
            return (
                <LabelledSlider // TODO We should use the ParameterLine.tsx one instead of this obsolete one. And remove/clean it.
                    value={Number(value)}
                    label={defParam.description}
                    onCommitCallback={(event, currentValue) => {
                        setter({ ...scParams, [key]: currentValue });
                    }}
                    marks={[
                        { value: Number(0), label: '0' },
                        { value: Number(100), label: '100' },
                    ]}
                />
            );
        }
    }
}

function makeComponentsFor(defParams, params, setter) {
    return Object.keys(defParams).map((key) => (
        <Grid container spacing={1} paddingTop={1} key={key}>
            {makeComponentFor(defParams[key], key, params, setter)}
            <LineSeparator />
        </Grid>
    ));
}

const TYPES = {
    enum: 'Enum',
    bool: 'Bool',
    slider: 'Slider',
};

const BasicShortCircuitParameters = ({
    shortCircuitParams,
    commitShortCircuitParams,
}) => {
    const paramsDef = {
        withFeederResult: {
            type: TYPES.bool,
            description: 'descWithFeederResult',
        },
    };

    return makeComponentsFor(
        paramsDef,
        shortCircuitParams,
        commitShortCircuitParams
    );
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
    const { snackError } = useSnackMessage();

    const studyUuid = useSelector((state) => state.studyUuid);

    const [shortCircuitParams, setShortCircuitParams] =
        useShortCircuitParameters;

    const commitShortCircuitParameter = useCallback(
        (newParams) => {
            let oldParams = { ...shortCircuitParams };
            setShortCircuitParams(newParams);
            setShortCircuitParameters(studyUuid, newParams).catch((error) => {
                setShortCircuitParams(oldParams);
                snackError({
                    messageTxt: error.message,
                    headerId: 'paramsChangingError',
                });
            });
        },
        [snackError, studyUuid, shortCircuitParams, setShortCircuitParams]
    );

    const resetShortCircuitParameters = useCallback(() => {
        setShortCircuitParameters(studyUuid, null)
            .then(() => {
                return getShortCircuitParameters(studyUuid)
                    .then((params) => setShortCircuitParams(params))
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
    }, [studyUuid, snackError, setShortCircuitParams]);

    const emptyFormData = useMemo(() => {
        return {
            [SHORT_CIRCUIT_WITH_FEEDER_RESULT]:
                shortCircuitParams.withFeederResult,
            //todo: to change
            [SHORT_CIRCUIT_PREDEFINED_PARAMS]:
                shortCircuitParams.initialVoltageProfileMode,
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
    }, []);
    const formMethods = useForm({
        //todo : use api to get the default values from back
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, handleSubmit } = formMethods;
    const onSubmit = useCallback((newParams) => {
        console.log(' new params : ', newParams);
        const oldParams = { ...shortCircuitParams };
        console.log(' oldParams params : ', oldParams);

        setShortCircuitParams(newParams);
        console.log(' before  call : ');
        setShortCircuitParameters(studyUuid, newParams).catch((error) => {
            console.log(' error : ');

            setShortCircuitParams(oldParams);
            snackError({
                messageTxt: error.message,
                headerId: 'paramsChangingError',
            });
        });
    }, []);
    const resetAll = useCallback(
        (initialVoltageProfileMode) => {
            let dataToReset = { ...emptyFormData };
            if (initialVoltageProfileMode === INITIAL_TENSION.NOMINAL) {
                dataToReset = {
                    ...dataToReset,
                    [SHORT_CIRCUIT_INITIAL_VOLTAGE_PROFILE_MODE]: 'NOMINAL',
                };
            }
            if (initialVoltageProfileMode === INITIAL_TENSION.CONFIGURED) {
                dataToReset = {
                    ...dataToReset,
                    [SHORT_CIRCUIT_INITIAL_VOLTAGE_PROFILE_MODE]: 'CONFIGURED',
                    [SHORT_CIRCUIT_PREDEFINED_PARAMS]: 'CONFIGURED',
                };
            }
            reset(dataToReset);
        },
        [reset, emptyFormData]
    );
    return (
        <FormProvider validationSchema={formSchema} {...formMethods}>
            <Grid container paddingTop={1} paddingBottom={1}>
                <LineSeparator />
            </Grid>

            <Grid>
                <ShortCircuitFields resetAll={resetAll} />
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
