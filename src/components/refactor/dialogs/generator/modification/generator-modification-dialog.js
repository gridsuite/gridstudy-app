/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormProvider, useForm } from 'react-hook-form';
import ModificationDialog from '../../commons/modificationDialog';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from '../../../utils/yup-config';
import {
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
    VOLTAGE_REGULATION_TYPE,
    VOLTAGE_SET_POINT,
} from '../../../utils/field-constants';

import {
    fetchEquipmentInfos,
    modifyGenerator,
} from '../../../../../utils/rest-api';
import { sanitizeString } from '../../../../dialogs/dialogUtils';
import {
    FORM_LOADING_DELAY,
    REGULATION_TYPES,
} from '../../../../network/constants';
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
import {
    getRowEmptyFormData,
    REMOVE,
} from '../reactive-limits/reactive-capability-curve/reactive-capability-utils';
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form';

const GeneratorModificationDialog = ({
    editData,
    defaultIdValue,
    currentNode,
    studyUuid,
    isUpdate,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();
    const [generatorToModify, setGeneratorToModify] = useState();
    const shouldEmptyFormOnGeneratorIdChangeRef = useRef(!editData);
    const [isDataFetched, setIsDataFetched] = useState(false);

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
                      [VOLTAGE_REGULATION_TYPE]:
                          editData?.voltageRegulationType?.value ?? null,
                      [MINIMUM_REACTIVE_POWER]:
                          editData?.minimumReactivePower?.value ?? null,
                      [MAXIMUM_REACTIVE_POWER]:
                          editData?.maximumReactivePower?.value ?? null,
                      [Q_PERCENT]: editData?.qPercent?.value ?? null,
                      [REACTIVE_CAPABILITY_CURVE_CHOICE]:
                          !editData?.reactiveCapabilityCurve?.value &&
                          (editData?.minimumReactivePower ||
                              editData?.maximumReactivePower)
                              ? 'MINMAX'
                              : 'CURVE',
                      [REACTIVE_CAPABILITY_CURVE_TABLE]:
                          editData?.reactiveCapabilityCurvePoints.length > 0
                              ? completeReactiveCapabilityCurvePointsData(
                                    editData?.reactiveCapabilityCurvePoints
                                )
                              : [getRowEmptyFormData(), getRowEmptyFormData()],
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
                        [MAXIMUM_ACTIVE_POWER]: yup.number().nullable(),
                        [MINIMUM_ACTIVE_POWER]: yup
                            .number()
                            .nullable()
                            .when(
                                MAXIMUM_ACTIVE_POWER,
                                (maximumActivePower, schema) =>
                                    maximumActivePower != null
                                        ? schema.max(
                                              maximumActivePower,
                                              'MinActivePowerLessThanMaxActivePower'
                                          )
                                        : schema
                            ),
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
        []
    );

    const methods = useForm({
        defaultValues: defaultFormData,
        resolver: yupResolver(schema),
    });

    const { reset, getValues, setValue } = methods;

    useEffect(() => {
        if (editData) {
            setValue(EQUIPMENT_ID, editData?.equipmentId);
        }
    }, [editData, setValue]);

    //this method empties the form, and let us pass custom data that we want to set
    const setValuesAndEmptyOthers = useCallback(
        (customData = {}, keepDefaultValues = false) => {
            reset(
                { ...emptyFormData, ...customData },
                { keepDefaultValues: keepDefaultValues }
            );
        },
        [emptyFormData, reset]
    );

    const updatePreviousReactiveCapabilityCurveTable = (action, index) => {
        setGeneratorToModify((previousValue) => {
            const newRccValues = previousValue?.reactiveCapabilityCurvePoints;
            action === REMOVE
                ? newRccValues.splice(index, 1)
                : newRccValues.splice(index, 0, {
                      [P]: null,
                      [Q_MIN_P]: null,
                      [Q_MAX_P]: null,
                  });
            return {
                ...previousValue,
                reactiveCapabilityCurvePoints: newRccValues,
            };
        });
    };

    const emptyFormAndFormatReactiveCapabilityCurveTable = useCallback(
        (value, equipmentId) => {
            //creating empty table depending on existing generator
            const reactiveCapabilityCurvePoints =
                value?.reactiveCapabilityCurvePoints
                    ? value?.reactiveCapabilityCurvePoints.map((val) => ({
                          [P]: null,
                          [Q_MIN_P]: null,
                          [Q_MAX_P]: null,
                      }))
                    : [getRowEmptyFormData(), getRowEmptyFormData()];
            // resets all fields except EQUIPMENT_ID and REACTIVE_CAPABILITY_CURVE_TABLE
            setValuesAndEmptyOthers(
                {
                    [EQUIPMENT_ID]: equipmentId,
                    [REACTIVE_CAPABILITY_CURVE_TABLE]:
                        reactiveCapabilityCurvePoints,
                    [REACTIVE_CAPABILITY_CURVE_CHOICE]:
                        value?.minMaxReactiveLimits != null
                            ? 'MINMAX'
                            : 'CURVE',
                },
                true
            );
        },
        [setValuesAndEmptyOthers]
    );

    const insertEmptyRowAtSecondToLastIndex = (table) => {
        table.splice(table.length - 1, 0, {
            [P]: null,
            [Q_MAX_P]: null,
            [Q_MIN_P]: null,
        });
    };

    const onEquipmentIdChange = useCallback(
        (equipmentId) => {
            if (equipmentId) {
                setIsDataFetched(false);
                fetchEquipmentInfos(
                    studyUuid,
                    currentNodeUuid,
                    'generators',
                    equipmentId,
                    true
                )
                    .then((value) => {
                        if (value) {
                            // when editing modification form, first render should not trigger this reset
                            // which would empty the form instead of displaying data of existing form
                            const previousReactiveCapabilityCurveTable =
                                value.reactiveCapabilityCurvePoints;
                            if (
                                shouldEmptyFormOnGeneratorIdChangeRef?.current
                            ) {
                                emptyFormAndFormatReactiveCapabilityCurveTable(
                                    value,
                                    equipmentId
                                );
                            } else {
                                // on first render, we need to adjust the UI for the reactive capability curve table
                                const currentReactiveCapabilityCurveTable =
                                    getValues(REACTIVE_CAPABILITY_CURVE_TABLE);
                                const sizeDiff =
                                    previousReactiveCapabilityCurveTable.length -
                                    currentReactiveCapabilityCurveTable.length;

                                // if there are more values in previousValues table, we need to insert rows to current tables to match the number of previousValues table rows
                                if (sizeDiff > 0) {
                                    for (let i = 0; i < sizeDiff; i++) {
                                        insertEmptyRowAtSecondToLastIndex(
                                            currentReactiveCapabilityCurveTable
                                        );
                                    }
                                    setValue(
                                        REACTIVE_CAPABILITY_CURVE_TABLE,
                                        currentReactiveCapabilityCurveTable
                                    );
                                } else if (sizeDiff < 0) {
                                    // if there are more values in current table, we need to add rows to previousValues tables to match the number of current table rows
                                    for (let i = 0; i > sizeDiff; i--) {
                                        insertEmptyRowAtSecondToLastIndex(
                                            previousReactiveCapabilityCurveTable
                                        );
                                    }
                                }
                            }
                            shouldEmptyFormOnGeneratorIdChangeRef.current = true;
                            setGeneratorToModify({
                                ...value,
                                reactiveCapabilityCurveTable:
                                    previousReactiveCapabilityCurveTable,
                            });
                            setIsDataFetched(true);
                        }
                    })
                    .catch(() => setGeneratorToModify(null));
            } else {
                setValuesAndEmptyOthers();
                setGeneratorToModify(null);
            }
        },
        [
            emptyFormAndFormatReactiveCapabilityCurveTable,
            setValue,
            getValues,
            setValuesAndEmptyOthers,
            currentNodeUuid,
            studyUuid,
        ]
    );

    const calculateCurvePointsToStore = useCallback(
        (reactiveCapabilityCurve) => {
            if (
                reactiveCapabilityCurve.every(
                    (point) =>
                        point.p == null &&
                        point.qminP == null &&
                        point.qmaxP == null
                )
            ) {
                return null;
            } else {
                const pointsToStore = [];
                reactiveCapabilityCurve.forEach((point, index) => {
                    if (point) {
                        let pointToStore = {
                            p: point?.[P],
                            oldP:
                                generatorToModify
                                    .reactiveCapabilityCurveTable?.[index]?.p ??
                                null,
                            qminP: point?.qminP,
                            oldQminP:
                                generatorToModify
                                    .reactiveCapabilityCurveTable?.[index]
                                    ?.qminP ?? null,
                            qmaxP: point?.qmaxP,
                            oldQmaxP:
                                generatorToModify
                                    .reactiveCapabilityCurveTable?.[index]
                                    ?.qmaxP ?? null,
                        };
                        pointsToStore.push(pointToStore);
                    }
                });
                return pointsToStore.filter(
                    (point) =>
                        point.p != null ||
                        point.oldP != null ||
                        point.qmaxP != null ||
                        point.oldQmaxP != null ||
                        point.qminP != null ||
                        point.oldQminP != null
                );
            }
        },
        [generatorToModify]
    );

    const getPreviousRegulationType = useCallback(() => {
        if (generatorToModify?.voltageRegulationOn) {
            return generatorToModify?.regulatingTerminalVlId ||
                generatorToModify?.regulatingTerminalConnectableId
                ? REGULATION_TYPES.DISTANT.id
                : REGULATION_TYPES.LOCAL.id;
        } else {
            return null;
        }
    }, [generatorToModify]);

    const onSubmit = useCallback(
        (generator) => {
            const buildCurvePointsToStore = calculateCurvePointsToStore(
                generator[REACTIVE_CAPABILITY_CURVE_TABLE]
            );

            const isFrequencyRegulationOn =
                generator[FREQUENCY_REGULATION] === true ||
                (generator[FREQUENCY_REGULATION] === null &&
                    generatorToModify.activePowerControlOn === true);

            const isVoltageRegulationOn =
                generator[VOLTAGE_REGULATION] === true ||
                (generator[VOLTAGE_REGULATION] === null &&
                    generatorToModify.voltageRegulatorOn);

            const isReactiveCapabilityCurveOn =
                generator[REACTIVE_CAPABILITY_CURVE_CHOICE] === 'CURVE';

            const isDistantRegulation =
                generator?.[VOLTAGE_REGULATION_TYPE] ===
                    REGULATION_TYPES.DISTANT.id ||
                (generator[VOLTAGE_REGULATION_TYPE] === null &&
                    getPreviousRegulationType() ===
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
            generatorToModify,
            getPreviousRegulationType,
            calculateCurvePointsToStore,
            studyUuid,
            currentNodeUuid,
            editData?.uuid,
            snackError,
        ]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched: !isUpdate || (editData && isDataFetched),
        delay: FORM_LOADING_DELAY,
    });

    return (
        <FormProvider
            validationSchema={schema}
            removeOptional={true}
            {...methods}
        >
            <ModificationDialog
                fullWidth
                onClear={setValuesAndEmptyOthers}
                onSave={onSubmit}
                aria-labelledby="dialog-modification-generator"
                maxWidth={'md'}
                titleId="ModifyGenerator"
                open={open}
                keepMounted={true}
                isDataFetching={isUpdate && (!editData || !isDataFetched)}
                {...dialogProps}
            >
                <GeneratorModificationForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    onEquipmentIdChange={onEquipmentIdChange}
                    generatorToModify={generatorToModify}
                    updatePreviousReactiveCapabilityCurveTable={
                        updatePreviousReactiveCapabilityCurveTable
                    }
                />
            </ModificationDialog>
        </FormProvider>
    );
};

export default GeneratorModificationDialog;
