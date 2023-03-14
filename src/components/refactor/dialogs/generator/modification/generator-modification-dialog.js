/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormProvider, useForm } from 'react-hook-form';
import ModificationDialog from '../../commons/modificationDialog';
import { useCallback, useMemo, useState } from 'react';
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
    OLD_P,
    OLD_Q_MAX_P,
    OLD_Q_MIN_P,
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

import { modifyGenerator } from '../../../../../utils/rest-api';
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
import { getRegulatingTerminalFormData } from '../../regulating-terminal/regulating-terminal-form-utils';
import { REMOVE } from '../reactive-limits/reactive-capability-curve/reactive-capability-utils';

const GeneratorModificationDialog = ({
    editData,
    defaultIdValue,
    currentNode,
    studyUuid,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();
    const [generatorToModify, setGeneratorToModify] = useState();

    const isSelectedGeneratorUndefined = generatorToModify === undefined;
    const isEditDataUndefined = editData === undefined;

    const [
        shouldEmptyFormOnGeneratorIdChange,
        setShouldEmptyFormOnGeneratorIdChange,
    ] = useState(!editData);

    //in order to work properly, react hook form needs all fields to be set at least to null
    const completeReactiveCapabilityCurvePointsData = (
        reactiveCapabilityCurvePoints
    ) => {
        reactiveCapabilityCurvePoints.map((rcc) => {
            if (!(P in rcc)) {
                rcc[P] = null;
            }
            if (!(Q_MAX_P in rcc)) {
                rcc[Q_MAX_P] = null;
            }
            if (!(Q_MIN_P in rcc)) {
                rcc[Q_MIN_P] = null;
            }
            return rcc;
        });
        return reactiveCapabilityCurvePoints;
    };

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
            ...getSetPointsEmptyFormData(true),
            ...getReactiveLimitsEmptyFormData(true),
        }),
        [defaultIdValue]
    );

    const formDataFromEditData = useMemo(
        () =>
            editData
                ? {
                      [EQUIPMENT_ID]: editData?.equipmentId,
                      [EQUIPMENT_NAME]: editData?.equipmentName?.value ?? '',
                      [ENERGY_SOURCE]: editData?.energySource?.value ?? null,
                      [MAXIMUM_ACTIVE_POWER]:
                          editData?.maxActivePower?.value ?? null,
                      [MINIMUM_ACTIVE_POWER]:
                          editData?.minActivePower?.value ?? null,
                      [RATED_NOMINAL_POWER]:
                          editData?.ratedNominalPower?.value ?? null,
                      [ACTIVE_POWER_SET_POINT]:
                          editData?.activePowerSetpoint?.value ?? null,
                      [VOLTAGE_REGULATION]:
                          editData?.voltageRegulationOn?.value ?? null,
                      [VOLTAGE_SET_POINT]:
                          editData?.voltageSetpoint?.value ?? null,
                      [REACTIVE_POWER_SET_POINT]:
                          editData?.reactivePowerSetpoint?.value ?? null,
                      [PLANNED_ACTIVE_POWER_SET_POINT]:
                          editData?.plannedActivePowerSetPoint?.value ?? null,
                      [STARTUP_COST]: editData?.startupCost?.value ?? null,
                      [MARGINAL_COST]: editData?.marginalCost?.value ?? null,
                      [PLANNED_OUTAGE_RATE]:
                          editData?.plannedOutageRate?.value ?? null,
                      [FORCED_OUTAGE_RATE]:
                          editData?.forcedOutageRate?.value ?? null,
                      [FREQUENCY_REGULATION]:
                          editData?.participate?.value ?? null,
                      [DROOP]: editData?.droop?.value ?? null,
                      [TRANSIENT_REACTANCE]:
                          editData?.transientReactance?.value ?? null,
                      [TRANSFORMER_REACTANCE]:
                          editData?.stepUpTransformerReactance?.value ?? null,
                      [VOLTAGE_REGULATION_TYPE]: editData?.regulatingTerminalId
                          ? REGULATION_TYPES.DISTANT.id
                          : REGULATION_TYPES.LOCAL.id,
                      [MINIMUM_REACTIVE_POWER]:
                          editData?.minimumReactivePower?.value ?? null,
                      [MAXIMUM_REACTIVE_POWER]:
                          editData?.maximumReactivePower?.value ?? null,
                      [Q_PERCENT]: editData?.qPercent?.value ?? null,
                      [REACTIVE_CAPABILITY_CURVE_CHOICE]:
                          editData?.minimumReactivePower ||
                          editData?.maximumReactivePower
                              ? 'MINMAX'
                              : 'CURVE',
                      [REACTIVE_CAPABILITY_CURVE_TABLE]:
                          completeReactiveCapabilityCurvePointsData(
                              editData?.reactiveCapabilityCurvePoints
                          ) ?? [{}, {}],
                      ...getRegulatingTerminalFormData({
                          equipmentId: editData?.regulatingTerminalId?.value,
                          equipmentType:
                              editData?.regulatingTerminalType?.value,
                          voltageLevelId:
                              editData?.regulatingTerminalVlId?.value,
                      }),
                  }
                : null,
        [editData]
    );

    const defaultFormData = useMemo(() => {
        if (!editData) {
            return emptyFormData;
        } else {
            return formDataFromEditData;
        }
    }, [editData, emptyFormData, formDataFromEditData]);

    const schema = useMemo(
        () =>
            yup
                .object()
                .shape(
                    {
                        [EQUIPMENT_ID]: yup.string().nullable().required(),
                        [EQUIPMENT_NAME]: yup.string(),
                        [ENERGY_SOURCE]: yup.string().nullable(),
                        [MAXIMUM_ACTIVE_POWER]: yup
                            .number()
                            .nullable()
                            .when([], {
                                is: () =>
                                    isSelectedGeneratorUndefined &&
                                    isEditDataUndefined,
                                then: (schema) => schema.required(),
                            }),
                        [MINIMUM_ACTIVE_POWER]: yup
                            .number()
                            .nullable()
                            .when([], {
                                is: () =>
                                    isSelectedGeneratorUndefined &&
                                    isEditDataUndefined,
                                then: (schema) => schema.required(),
                            }),
                        [RATED_NOMINAL_POWER]: yup.number().nullable(),
                        [TRANSIENT_REACTANCE]: yup.number().nullable(),
                        [TRANSFORMER_REACTANCE]: yup.number().nullable(),
                        [PLANNED_ACTIVE_POWER_SET_POINT]: yup
                            .number()
                            .nullable(),
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
                .required(),
        [isSelectedGeneratorUndefined, isEditDataUndefined]
    );
    const methods = useForm({
        defaultValues: defaultFormData,
        resolver: yupResolver(schema),
    });

    const { reset, getValues } = methods;

    //this method empties the form, and let us pass custom data that we want to set
    const clear = useCallback(
        (customData = {}, keepDefaultValues = false) => {
            reset(
                { ...emptyFormData, ...customData },
                { keepDefaultValues: keepDefaultValues }
            );
        },
        [emptyFormData, reset]
    );

    const updateReactiveCapabilityCurveTableRow = (action, index) => {
        setGeneratorToModify((previousValue) => {
            const newRccValues = previousValue?.reactiveCapabilityCurvePoints;
            action === REMOVE
                ? newRccValues.splice(index, 1)
                : newRccValues.splice(index, 0, {
                      [P]: null,
                      [Q_MIN_P]: null,
                      [Q_MAX_P]: null,
                      [OLD_P]: null,
                      [OLD_Q_MIN_P]: null,
                      [OLD_Q_MAX_P]: null,
                  });
            return {
                ...previousValue,
                reactiveCapabilityCurvePoints: newRccValues,
            };
        });
    };

    const calculateCurvePointsToStore = useCallback(() => {
        const reactiveCapabilityCurve = getValues(
            REACTIVE_CAPABILITY_CURVE_TABLE
        );
        const displayedPreviousValues =
            generatorToModify?.reactiveCapabilityCurvePoints;

        if (
            displayedPreviousValues &&
            reactiveCapabilityCurve?.length ===
                displayedPreviousValues.length &&
            reactiveCapabilityCurve.filter(
                (point) =>
                    point.p !== '' || point.qminP !== '' || point.qmaxP !== ''
            ).length === 0
        ) {
            return null;
        } else {
            const pointsToStore = [];
            reactiveCapabilityCurve.forEach((point, index) => {
                if (point) {
                    let pointToStore = {
                        p: point?.p,
                        oldP:
                            displayedPreviousValues !== undefined
                                ? displayedPreviousValues[index]?.p
                                : null,
                        qminP: point?.qminP,
                        oldQminP:
                            displayedPreviousValues !== undefined
                                ? displayedPreviousValues[index]?.qminP
                                : null,
                        qmaxP: point?.qmaxP,
                        oldQmaxP:
                            displayedPreviousValues !== undefined
                                ? displayedPreviousValues[index]?.qmaxP
                                : null,
                    };

                    pointsToStore.push(pointToStore);
                }
            });
            return pointsToStore;
        }
    }, [getValues, generatorToModify]);

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
                (generator[VOLTAGE_REGULATION] === null ||
                    generator[VOLTAGE_REGULATION] === undefined) &&
                generator[VOLTAGE_REGULATION_TYPE] ===
                    REGULATION_TYPES.DISTANT.id;

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
                generator[PLANNED_ACTIVE_POWER_SET_POINT] ?? null,
                generator[STARTUP_COST] ?? null,
                generator[MARGINAL_COST] ?? null,
                generator[PLANNED_OUTAGE_RATE] ?? null,
                generator[FORCED_OUTAGE_RATE] ?? null,
                generator[TRANSIENT_REACTANCE] ?? null,
                generator[TRANSFORMER_REACTANCE] ?? null,
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
        <FormProvider validationSchema={schema} {...methods}>
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
                    resetForm={clear}
                    generatorToModify={generatorToModify}
                    setGeneratorToModify={setGeneratorToModify}
                    updateReactiveCapabilityCurveTableRow={
                        updateReactiveCapabilityCurveTableRow
                    }
                    shouldEmptyFormOnGeneratorIdChange={
                        shouldEmptyFormOnGeneratorIdChange
                    }
                    setShouldEmptyFormOnGeneratorIdChange={
                        setShouldEmptyFormOnGeneratorIdChange
                    }
                />
            </ModificationDialog>
        </FormProvider>
    );
};

export default GeneratorModificationDialog;
