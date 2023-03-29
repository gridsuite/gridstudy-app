/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormProvider, useForm } from 'react-hook-form';
import ModificationDialog from '../../commons/modificationDialog';
import { useCallback, useEffect, useMemo } from 'react';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from '../../../utils/yup-config';
import {
    ACTIVE_POWER_CONTROL_ON,
    ACTIVE_POWER_SET_POINT,
    DROOP,
    ENERGY_SOURCE,
    EQUIPMENT,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    FORCED_OUTAGE_RATE,
    FREQUENCY_REGULATION,
    MARGINAL_COST,
    MAXIMUM_ACTIVE_POWER,
    MAXIMUM_REACTIVE_POWER,
    MINIMUM_ACTIVE_POWER,
    MINIMUM_REACTIVE_POWER,
    P,
    PLANNED_ACTIVE_POWER_SET_POINT,
    PLANNED_OUTAGE_RATE,
    Q_MAX_P,
    Q_MIN_P,
    Q_PERCENT,
    RATED_NOMINAL_POWER,
    REACTIVE_CAPABILITY_CURVE_CHOICE,
    REACTIVE_CAPABILITY_CURVE_TABLE,
    REACTIVE_POWER_SET_POINT,
    STARTUP_COST,
    TRANSFORMER_REACTANCE,
    TRANSIENT_REACTANCE,
    VOLTAGE_LEVEL,
    VOLTAGE_REGULATION,
    VOLTAGE_REGULATION_ON,
    VOLTAGE_REGULATION_TYPE,
    VOLTAGE_SET_POINT,
} from '../../../utils/field-constants';

import {
    fetchEquipmentInfos,
    modifyGenerator,
} from '../../../../../utils/rest-api';
import { sanitizeString } from '../../../../dialogs/dialogUtils';
import { REGULATION_TYPES } from '../../../../network/constants';
import GeneratorModificationForm from './generator-modification-form';
import {
    getSetPointsEmptyFormData,
    getSetPointsSchema,
} from '../set-points/set-points-utils';
import {
    getReactiveLimitsEmptyFormData,
    getReactiveLimitsSchema,
} from '../reactive-limits/reactive-limits-utils';
import {
    assignPreviousValuesToForm,
    assignValuesToForm,
    getPreviousValuesEmptyForm,
    PREVIOUS_P,
    PREVIOUS_Q_MAX_P,
    PREVIOUS_Q_MIN_P,
    PREVIOUS_VOLTAGE_REGULATION,
} from './generator-modification-utils';
import { useIntl } from 'react-intl';

const schema = yup
    .object()
    .shape(
        {
            [EQUIPMENT_ID]: yup.string().nullable().required(),
            [EQUIPMENT_NAME]: yup.string(),
            [ENERGY_SOURCE]: yup.string().nullable(),
            [MAXIMUM_ACTIVE_POWER]: yup.number().nullable(),
            [MINIMUM_ACTIVE_POWER]: yup.number().nullable(),
            [RATED_NOMINAL_POWER]: yup.number().nullable(),
            [TRANSIENT_REACTANCE]: yup.number().nullable(),
            [TRANSFORMER_REACTANCE]: yup.number().nullable(),
            [PLANNED_ACTIVE_POWER_SET_POINT]: yup.number().nullable(),
            [STARTUP_COST]: yup.number().nullable(),
            [MARGINAL_COST]: yup.number().nullable(),
            [PLANNED_OUTAGE_RATE]: yup
                .number()
                .nullable()
                .min(0, 'RealPercentage')
                .max(1, 'RealPercentage'),
            [FORCED_OUTAGE_RATE]: yup
                .number()
                .nullable()
                .min(0, 'RealPercentage')
                .max(1, 'RealPercentage'),
            ...getSetPointsSchema(true),
            ...getReactiveLimitsSchema(true),
        },
        [MAXIMUM_REACTIVE_POWER, MINIMUM_REACTIVE_POWER]
    )
    .required();

const GeneratorModificationDialog = ({
    editData,
    defaultIdValue,
    currentNode,
    studyUuid,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();
    const intl = useIntl();

    //in order to work properly, react hook form needs all fields to be set at least to null
    const emptyFormData = useMemo(
        () => ({
            [EQUIPMENT_ID]: defaultIdValue ?? null,
            [EQUIPMENT_NAME]: '',
            [ENERGY_SOURCE]: null,
            [MAXIMUM_ACTIVE_POWER]: null,
            [MINIMUM_ACTIVE_POWER]: null,
            [RATED_NOMINAL_POWER]: null,
            [TRANSIENT_REACTANCE]: null,
            [TRANSFORMER_REACTANCE]: null,
            [PLANNED_ACTIVE_POWER_SET_POINT]: null,
            [STARTUP_COST]: null,
            [MARGINAL_COST]: null,
            [PLANNED_OUTAGE_RATE]: null,
            [FORCED_OUTAGE_RATE]: null,
            ...getSetPointsEmptyFormData(null, null, null),
            ...getReactiveLimitsEmptyFormData(true),
            ...getPreviousValuesEmptyForm(),
        }),
        [defaultIdValue]
    );

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const { reset, getValues, clearErrors } = methods;

    //this method empties the form, and let us pass custom data that we want to set
    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset, emptyFormData]);


    //this useCallback fetches previous equipment properties values, resets form values
    //then create empty reactive limits table depending on fetched equipment data
    const onEquipmentIdChange = useCallback(
        (equipmentId) => {
            clearErrors();
            if (equipmentId) {
                fetchEquipmentInfos(
                    studyUuid,
                    currentNodeUuid,
                    'generators',
                    equipmentId,
                    true
                )
                    .then((value) => {
                        if (value) {
                            if (
                                editData &&
                                equipmentId === editData.equipmentId
                            ) {
                                const generator = assignPreviousValuesToForm(
                                    value,
                                    equipmentId,
                                    intl,
                                    getValues(REACTIVE_CAPABILITY_CURVE_TABLE)
                                );
                                reset(generator, { keepDirtyValues: true });
                            } else {
                                const generatorWithReactiveCapabilityCurve =
                                    value?.reactiveCapabilityCurvePoints
                                        ?.length > 0;
                                const reactiveCapabilityCurvePoints =
                                    generatorWithReactiveCapabilityCurve
                                        ? value?.reactiveCapabilityCurvePoints?.map(
                                              (element) => {
                                                  return {
                                                      [P]: null,
                                                      [Q_MIN_P]: null,
                                                      [Q_MAX_P]: null,
                                                      [PREVIOUS_P]:
                                                          element.p ?? null,
                                                      [PREVIOUS_Q_MIN_P]:
                                                          element.qminP ?? null,
                                                      [PREVIOUS_Q_MAX_P]:
                                                          element.qmaxP ?? null,
                                                  };
                                              }
                                          )
                                        : [{}, {}];
                                const generator = assignPreviousValuesToForm(
                                    value,
                                    equipmentId,
                                    intl,
                                    reactiveCapabilityCurvePoints
                                );
                                reset({ ...emptyFormData, ...generator });
                            }
                        }
                    })
                    .catch(() => clear());
            } else {
                clear();
            }
        },
        [
            clearErrors,
            studyUuid,
            currentNodeUuid,
            editData,
            intl,
            getValues,
            reset,
            emptyFormData,
            clear,
        ]
    );

    useEffect(() => {
        if (editData) {
            reset({
                ...assignValuesToForm(editData),
            });
        }
    }, [editData, reset]);

    const calculateCurvePointsToStore = useCallback(() => {
        const reactiveCapabilityCurve = getValues(
            REACTIVE_CAPABILITY_CURVE_TABLE
        );
        if (
            reactiveCapabilityCurve.filter(
                (point) =>
                    point.p == null &&
                    point.qminP == null &&
                    point.qmaxP == null
            ).length === reactiveCapabilityCurve?.length
        ) {
            return null;
        }
        const pointsToStore = [];
        reactiveCapabilityCurve.forEach((point, index) => {
            const reactiveCapabilityCurvePoint = reactiveCapabilityCurve[index];
            if (point) {
                let pointToStore = {
                    p: point?.p,
                    oldP:
                        reactiveCapabilityCurve !== undefined
                            ? reactiveCapabilityCurvePoint[PREVIOUS_P]
                            : null,
                    qminP: point?.qminP,
                    oldQminP:
                        reactiveCapabilityCurve !== undefined
                            ? reactiveCapabilityCurvePoint[PREVIOUS_Q_MIN_P]
                            : null,
                    qmaxP: point?.qmaxP,
                    oldQmaxP:
                        reactiveCapabilityCurve !== undefined
                            ? reactiveCapabilityCurvePoint[PREVIOUS_Q_MAX_P]
                            : null,
                };
                pointsToStore.push(pointToStore);
            }
        });
        return pointsToStore;
    }, [getValues]);

    const onSubmit = useCallback(
        (generator) => {
            const buildCurvePointsToStore = calculateCurvePointsToStore();

            const isFrequencyRegulationOn =
                generator[FREQUENCY_REGULATION] === true ||
                (generator[FREQUENCY_REGULATION] === null &&
                    generator[ACTIVE_POWER_CONTROL_ON] === true);

            const isVoltageRegulationOn =
                generator[VOLTAGE_REGULATION] === true ||
                ((generator[VOLTAGE_REGULATION] === null ||
                    generator[VOLTAGE_REGULATION] === undefined) &&
                    (generator[VOLTAGE_REGULATION_ON] === true ||
                        generator[VOLTAGE_REGULATION_ON] === undefined));

            const isReactiveCapabilityCurveOn =
                generator[REACTIVE_CAPABILITY_CURVE_CHOICE] === 'CURVE';

            const isDistantRegulation =
                (!generator[VOLTAGE_REGULATION] &&
                    generator[PREVIOUS_VOLTAGE_REGULATION]) ||
                (generator[VOLTAGE_REGULATION] &&
                    generator[VOLTAGE_REGULATION_TYPE] ===
                        REGULATION_TYPES.DISTANT.id);

            modifyGenerator(
                studyUuid,
                currentNodeUuid,
                generator[EQUIPMENT_ID],
                sanitizeString(generator[EQUIPMENT_NAME]),
                generator[ENERGY_SOURCE],
                generator[MINIMUM_ACTIVE_POWER],
                generator[MAXIMUM_ACTIVE_POWER],
                generator[RATED_NOMINAL_POWER],
                generator[ACTIVE_POWER_SET_POINT],
                !isVoltageRegulationOn
                    ? generator[REACTIVE_POWER_SET_POINT]
                    : null,
                generator[VOLTAGE_REGULATION],

                isVoltageRegulationOn ? generator[VOLTAGE_SET_POINT] : null,
                undefined,
                undefined,
                editData?.uuid,
                isVoltageRegulationOn && isDistantRegulation
                    ? generator[Q_PERCENT]
                    : null,
                generator[PLANNED_ACTIVE_POWER_SET_POINT],
                generator[STARTUP_COST],
                generator[MARGINAL_COST],
                generator[PLANNED_OUTAGE_RATE],
                generator[FORCED_OUTAGE_RATE],
                generator[TRANSIENT_REACTANCE],
                generator[TRANSFORMER_REACTANCE],
                generator[VOLTAGE_REGULATION_TYPE],
                isVoltageRegulationOn && isDistantRegulation
                    ? generator[EQUIPMENT]?.id
                    : null,
                isVoltageRegulationOn && isDistantRegulation
                    ? generator[EQUIPMENT]?.type
                    : null,
                isVoltageRegulationOn && isDistantRegulation
                    ? generator[VOLTAGE_LEVEL]?.id
                    : null,
                isReactiveCapabilityCurveOn,
                generator[FREQUENCY_REGULATION],
                isFrequencyRegulationOn ? generator[DROOP] : null,
                isReactiveCapabilityCurveOn
                    ? null
                    : generator[MAXIMUM_REACTIVE_POWER],
                isReactiveCapabilityCurveOn
                    ? null
                    : generator[MINIMUM_REACTIVE_POWER],
                isReactiveCapabilityCurveOn ? buildCurvePointsToStore : null
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'GeneratorModificationError',
                });
            });
        },
        [
            calculateCurvePointsToStore,
            studyUuid,
            currentNodeUuid,
            editData?.uuid,
            snackError,
        ]
    );

    return (
        <FormProvider
            validationSchema={schema}
            {...methods}
            isEdit={editData ? true : false}
        >
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-modification-generator"
                maxWidth={'md'}
                titleId="ModifyGenerator"
                {...dialogProps}
            >
                <GeneratorModificationForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    onEquipmentIdChange={onEquipmentIdChange}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

export default GeneratorModificationDialog;
