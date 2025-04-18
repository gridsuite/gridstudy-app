/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Button, Grid } from '@mui/material';
import {
    CustomFormProvider,
    DirectoryItemSelector,
    ElementType,
    mergeSx,
    SubmitButton,
    TreeViewFinderNodeProps,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useSelector } from 'react-redux';
import {
    invalidateShortCircuitStatus,
    setShortCircuitParameters,
} from '../../../services/study/short-circuit-analysis';
import { fetchShortCircuitParameters } from '../../../services/short-circuit-analysis';
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
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import ShortCircuitFields from './shortcircuit/short-circuit-parameters';
import { INITIAL_VOLTAGE, PREDEFINED_PARAMETERS } from '../../utils/constants';
import CreateParameterDialog from './common/parameters-creation-dialog';

import { formatShortCircuitParameters } from './shortcircuit/short-circuit-parameters-utils';
import { AppState } from 'redux/reducer';
import LineSeparator from '../commons/line-separator';
import { ShortCircuitParametersInfos } from 'services/study/short-circuit-analysis.type';
import { styles } from './parameters-style';
import { UseGetShortCircuitParametersProps } from './use-get-short-circuit-parameters';

const formSchema = yup
    .object()
    .shape({
        [SHORT_CIRCUIT_WITH_FEEDER_RESULT]: yup.boolean().required(),
        [SHORT_CIRCUIT_PREDEFINED_PARAMS]: yup
            .mixed<PREDEFINED_PARAMETERS>()
            .oneOf(Object.values(PREDEFINED_PARAMETERS))
            .required(),
        [SHORT_CIRCUIT_WITH_LOADS]: yup.boolean().required(),
        [SHORT_CIRCUIT_WITH_VSC_CONVERTER_STATIONS]: yup.boolean().required(),
        [SHORT_CIRCUIT_WITH_SHUNT_COMPENSATORS]: yup.boolean().required(),
        [SHORT_CIRCUIT_WITH_NEUTRAL_POSITION]: yup.boolean().required(),
        [SHORT_CIRCUIT_INITIAL_VOLTAGE_PROFILE_MODE]: yup
            .mixed<INITIAL_VOLTAGE>()
            .oneOf(Object.values(INITIAL_VOLTAGE))
            .required(),
    })
    .required();

const prepareDataToSend = (
    shortCircuitParams: ShortCircuitParametersInfos | null,
    newParameters: ShortCircuitParametersFormProps
) => {
    const oldParameters = { ...shortCircuitParams?.parameters };
    const { predefinedParameters: omit, ...newParametersWithoutPredefinedParameters } = newParameters;
    let parameters = {
        ...oldParameters,
        ...newParametersWithoutPredefinedParameters,
        // we need to add voltageRanges to the parameters only when initialVoltageProfileMode is equals to CEI909
        voltageRanges: undefined,
        withNeutralPosition: !newParameters.withNeutralPosition,
    };
    if (newParameters.initialVoltageProfileMode === INITIAL_VOLTAGE.CEI909) {
        parameters = {
            ...parameters,
            voltageRanges: shortCircuitParams?.cei909VoltageRanges,
            initialVoltageProfileMode: INITIAL_VOLTAGE.CONFIGURED,
        };
    }

    return {
        predefinedParameters: newParameters.predefinedParameters,
        parameters: parameters,
    };
};

type ShortCircuitParametersFormProps = yup.InferType<typeof formSchema>;

interface ShortCircuitParametersProps {
    useShortCircuitParameters: UseGetShortCircuitParametersProps;
    setHaveDirtyFields: (hasDirtyField: boolean) => void;
}

export const ShortCircuitParameters: FunctionComponent<ShortCircuitParametersProps> = ({
    useShortCircuitParameters,
    setHaveDirtyFields,
}) => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const intl = useIntl();
    const [openSelectParameterDialog, setOpenSelectParameterDialog] = useState(false);
    const [openCreateParameterDialog, setOpenCreateParameterDialog] = useState(false);

    const [shortCircuitParams, setShortCircuitParams] = useShortCircuitParameters;

    const { snackError } = useSnackMessage();
    // get default values based on shortCircuitParams
    const emptyFormData = useMemo(() => {
        const { parameters, predefinedParameters } = shortCircuitParams || {};
        return {
            [SHORT_CIRCUIT_WITH_FEEDER_RESULT]: parameters?.withFeederResult,
            [SHORT_CIRCUIT_PREDEFINED_PARAMS]: predefinedParameters,
            [SHORT_CIRCUIT_WITH_LOADS]: parameters?.withLoads,
            [SHORT_CIRCUIT_WITH_VSC_CONVERTER_STATIONS]: parameters?.withVSCConverterStations,
            [SHORT_CIRCUIT_WITH_SHUNT_COMPENSATORS]: parameters?.withShuntCompensators,
            [SHORT_CIRCUIT_WITH_NEUTRAL_POSITION]: !parameters?.withNeutralPosition,
            [SHORT_CIRCUIT_INITIAL_VOLTAGE_PROFILE_MODE]:
                parameters?.initialVoltageProfileMode === INITIAL_VOLTAGE.CONFIGURED
                    ? INITIAL_VOLTAGE.CEI909
                    : parameters?.initialVoltageProfileMode,
        };
    }, [shortCircuitParams]);

    const formMethods = useForm<ShortCircuitParametersFormProps>({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, setValue, handleSubmit, formState, getValues } = formMethods;

    // submit the new parameters
    const onSubmit = useCallback(
        (newParams: ShortCircuitParametersFormProps) => {
            const oldParams = shortCircuitParams;
            setShortCircuitParameters(studyUuid, {
                ...prepareDataToSend(shortCircuitParams, newParams),
            })
                .then(() => {
                    // invalidate the short circuit status

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
        [setShortCircuitParams, shortCircuitParams, snackError, studyUuid, reset]
    );

    // when ever the predefined parameter is manually changed, we need to reset all parameters
    const resetAll = useCallback(
        (predefinedParameter: PREDEFINED_PARAMETERS) => {
            const dirty = { shouldDirty: true };
            setValue(SHORT_CIRCUIT_WITH_FEEDER_RESULT, true, dirty);
            setValue(SHORT_CIRCUIT_WITH_LOADS, false, dirty);
            setValue(
                SHORT_CIRCUIT_WITH_VSC_CONVERTER_STATIONS,
                predefinedParameter !== PREDEFINED_PARAMETERS.ICC_MIN_WITH_NOMINAL_VOLTAGE_MAP,
                dirty
            );
            setValue(SHORT_CIRCUIT_WITH_SHUNT_COMPENSATORS, false, dirty);
            setValue(SHORT_CIRCUIT_WITH_NEUTRAL_POSITION, false, dirty);
            const initialVoltageProfileMode =
                predefinedParameter === PREDEFINED_PARAMETERS.ICC_MAX_WITH_CEI909
                    ? INITIAL_VOLTAGE.CEI909
                    : INITIAL_VOLTAGE.NOMINAL;

            setValue(SHORT_CIRCUIT_INITIAL_VOLTAGE_PROFILE_MODE, initialVoltageProfileMode, dirty);
            setValue(SHORT_CIRCUIT_PREDEFINED_PARAMS, predefinedParameter, dirty);
        },
        [setValue]
    );

    useEffect(() => {
        setHaveDirtyFields(!!Object.keys(formState.dirtyFields).length);
    }, [formState, setHaveDirtyFields]);

    const replaceFormValues = useCallback(
        (param: ShortCircuitParametersInfos) => {
            const dirty = { shouldDirty: true };
            setValue(SHORT_CIRCUIT_WITH_FEEDER_RESULT, param.parameters.withFeederResult, dirty);
            setValue(SHORT_CIRCUIT_PREDEFINED_PARAMS, param.predefinedParameters, dirty);
            setValue(SHORT_CIRCUIT_WITH_LOADS, param.parameters.withLoads, dirty);
            setValue(SHORT_CIRCUIT_WITH_VSC_CONVERTER_STATIONS, param.parameters.withVSCConverterStations, dirty);
            setValue(SHORT_CIRCUIT_WITH_SHUNT_COMPENSATORS, param.parameters.withShuntCompensators, dirty);
            setValue(SHORT_CIRCUIT_WITH_NEUTRAL_POSITION, !param.parameters.withNeutralPosition, dirty);
            setValue(
                SHORT_CIRCUIT_INITIAL_VOLTAGE_PROFILE_MODE,
                param.parameters.initialVoltageProfileMode === INITIAL_VOLTAGE.CONFIGURED
                    ? INITIAL_VOLTAGE.CEI909
                    : param.parameters.initialVoltageProfileMode,
                dirty
            );
        },
        [setValue]
    );

    const loadParameters = useCallback(
        (newParams: TreeViewFinderNodeProps[]) => {
            if (newParams && newParams.length > 0) {
                setOpenSelectParameterDialog(false);
                const paramUuid = newParams[0].id;
                fetchShortCircuitParameters(paramUuid)
                    .then((parameters: ShortCircuitParametersInfos) => {
                        console.info('loading the following shortcircuit parameters : ' + paramUuid);
                        // Replace form data with fetched data
                        replaceFormValues(parameters);
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
        [snackError, replaceFormValues]
    );
    useEffect(() => {
        if (shortCircuitParams) {
            const { parameters, predefinedParameters } = shortCircuitParams;

            reset(formatShortCircuitParameters(parameters, predefinedParameters));
        }
    }, [reset, shortCircuitParams]);

    const getCurrentValues = useCallback(() => {
        const currentValues = getValues();
        return { ...prepareDataToSend(shortCircuitParams, currentValues) };
    }, [shortCircuitParams, getValues]);

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <Grid sx={{ height: '100%' }}>
                <Grid container paddingTop={1} paddingBottom={1}>
                    <LineSeparator />
                </Grid>

                <Grid sx={styles.scrollableGrid}>
                    <ShortCircuitFields resetAll={resetAll} />
                </Grid>
            </Grid>
            <Grid container sx={mergeSx(styles.controlParametersItem, styles.marginTopButton)}>
                <Button onClick={() => setOpenSelectParameterDialog(true)}>
                    <FormattedMessage id="settings.button.chooseSettings" />
                </Button>
                <Button onClick={() => setOpenCreateParameterDialog(true)}>
                    <FormattedMessage id="save" />
                </Button>
                <SubmitButton
                    variant="outlined"
                    onClick={handleSubmit(onSubmit)}
                    disabled={!formState.isValid || formState.isSubmitting}
                >
                    <FormattedMessage id="validate" />
                </SubmitButton>
                {openCreateParameterDialog && (
                    <CreateParameterDialog
                        open={openCreateParameterDialog}
                        onClose={() => setOpenCreateParameterDialog(false)}
                        parameterValues={() => getCurrentValues()}
                        parameterFormatter={(newParams) => newParams}
                        parameterType={ElementType.SHORT_CIRCUIT_PARAMETERS}
                    />
                )}
                {openSelectParameterDialog && (
                    <DirectoryItemSelector
                        open={openSelectParameterDialog}
                        onClose={loadParameters}
                        types={[ElementType.SHORT_CIRCUIT_PARAMETERS]}
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
            </Grid>
        </CustomFormProvider>
    );
};
