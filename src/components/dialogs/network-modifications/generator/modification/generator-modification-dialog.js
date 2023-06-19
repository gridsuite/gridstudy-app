/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormProvider, useForm } from 'react-hook-form';
import ModificationDialog from '../../../commons/modificationDialog';
import React, { useCallback, useEffect, useState } from 'react';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import {
    ACTIVE_POWER_SET_POINT,
    DROOP,
    ENERGY_SOURCE,
    EQUIPMENT,
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
} from 'components/utils/field-constants';
import { fetchNetworkElementInfos, modifyGenerator } from 'utils/rest-api';
import { sanitizeString } from '../../../dialogUtils';
import { REGULATION_TYPES } from 'components/network/constants';
import GeneratorModificationForm from './generator-modification-form';
import {
    getSetPointsEmptyFormData,
    getSetPointsSchema,
} from '../set-points/set-points-utils';
import {
    getReactiveLimitsEmptyFormData,
    getReactiveLimitsSchema,
} from '../reactive-limits/reactive-limits-utils';
import { getRegulatingTerminalFormData } from '../../../regulating-terminal/regulating-terminal-form-utils';
import {
    getRowEmptyFormData,
    REMOVE,
} from '../reactive-limits/reactive-capability-curve/reactive-capability-utils';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { FetchStatus } from 'utils/rest-api';
import {
    EQUIPMENT_INFOS_TYPES,
    EQUIPMENT_TYPES,
} from '../../../../utils/equipment-types';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';

const emptyFormData = {
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
};

const formSchema = yup
    .object()
    .shape(
        {
            [EQUIPMENT_NAME]: yup.string(),
            [ENERGY_SOURCE]: yup.string().nullable(),
            [MAXIMUM_ACTIVE_POWER]: yup.number().nullable(),
            [MINIMUM_ACTIVE_POWER]: yup
                .number()
                .nullable()
                .when([MAXIMUM_ACTIVE_POWER], {
                    is: (maximumActivePower) => maximumActivePower != null,
                    then: (schema) =>
                        schema.max(
                            yup.ref(MAXIMUM_ACTIVE_POWER),
                            'MinActivePowerLessThanMaxActivePower'
                        ),
                }),
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
    editData, // contains data when we try to edit an existing hypothesis from the current node's list
    defaultIdValue, // Used to pre-select an equipmentId when calling this dialog from the SLD
    currentNode,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();
    const [selectedId, setSelectedId] = useState(defaultIdValue ?? null);
    const [generatorToModify, setGeneratorToModify] = useState();
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);

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

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, getValues, setValue } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (generator) => {
            if (generator?.equipmentId) {
                setSelectedId(generator.equipmentId);
            }
            reset({
                [EQUIPMENT_NAME]: generator?.equipmentName?.value ?? '',
                [ENERGY_SOURCE]: generator?.energySource?.value ?? null,
                [MAXIMUM_ACTIVE_POWER]:
                    generator?.maxActivePower?.value ?? null,
                [MINIMUM_ACTIVE_POWER]:
                    generator?.minActivePower?.value ?? null,
                [RATED_NOMINAL_POWER]:
                    generator?.ratedNominalPower?.value ?? null,
                [ACTIVE_POWER_SET_POINT]:
                    generator?.activePowerSetpoint?.value ?? null,
                [VOLTAGE_REGULATION]:
                    generator?.voltageRegulationOn?.value ?? null,
                [VOLTAGE_SET_POINT]: generator?.voltageSetpoint?.value ?? null,
                [REACTIVE_POWER_SET_POINT]:
                    generator?.reactivePowerSetpoint?.value ?? null,
                [PLANNED_ACTIVE_POWER_SET_POINT]:
                    generator?.plannedActivePowerSetPoint?.value ?? null,
                [STARTUP_COST]: generator?.startupCost?.value ?? null,
                [MARGINAL_COST]: generator?.marginalCost?.value ?? null,
                [PLANNED_OUTAGE_RATE]:
                    generator?.plannedOutageRate?.value ?? null,
                [FORCED_OUTAGE_RATE]:
                    generator?.forcedOutageRate?.value ?? null,
                [FREQUENCY_REGULATION]: generator?.participate?.value ?? null,
                [DROOP]: generator?.droop?.value ?? null,
                [TRANSIENT_REACTANCE]:
                    generator?.transientReactance?.value ?? null,
                [TRANSFORMER_REACTANCE]:
                    generator?.stepUpTransformerReactance?.value ?? null,
                [VOLTAGE_REGULATION_TYPE]:
                    generator?.voltageRegulationType?.value ?? null,
                [MINIMUM_REACTIVE_POWER]:
                    generator?.minimumReactivePower?.value ?? null,
                [MAXIMUM_REACTIVE_POWER]:
                    generator?.maximumReactivePower?.value ?? null,
                [Q_PERCENT]: generator?.qPercent?.value ?? null,
                [REACTIVE_CAPABILITY_CURVE_CHOICE]: generator
                    ?.reactiveCapabilityCurve?.value
                    ? 'CURVE'
                    : 'MINMAX',
                [REACTIVE_CAPABILITY_CURVE_TABLE]:
                    generator?.reactiveCapabilityCurvePoints.length > 0
                        ? completeReactiveCapabilityCurvePointsData(
                              generator?.reactiveCapabilityCurvePoints
                          )
                        : [getRowEmptyFormData(), getRowEmptyFormData()],
                ...getRegulatingTerminalFormData({
                    equipmentId: generator?.regulatingTerminalId?.value,
                    equipmentType: generator?.regulatingTerminalType?.value,
                    voltageLevelId: generator?.regulatingTerminalVlId?.value,
                }),
            });
        },
        [reset]
    );

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    //this method empties the form, and let us pass custom data that we want to set
    const setValuesAndEmptyOthers = useCallback(
        (customData = {}, keepDefaultValues = false) => {
            reset(
                { ...emptyFormData, ...customData },
                { keepDefaultValues: keepDefaultValues }
            );
        },
        [reset]
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
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNodeUuid,
                    EQUIPMENT_TYPES.GENERATOR.type,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true
                )
                    .then((value) => {
                        if (value) {
                            // when editing modification form, first render should not trigger this reset
                            // which would empty the form instead of displaying data of existing form
                            const previousReactiveCapabilityCurveTable =
                                value.reactiveCapabilityCurvePoints;
                            // on first render, we need to adjust the UI for the reactive capability curve table
                            // we need to check if the generator we fetch has reactive capability curve table
                            if (previousReactiveCapabilityCurveTable) {
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
                            setGeneratorToModify({
                                ...value,
                                reactiveCapabilityCurveTable:
                                    previousReactiveCapabilityCurveTable,
                            });
                        }
                        setDataFetchStatus(FetchStatus.SUCCEED);
                    })
                    .catch(() => {
                        setGeneratorToModify(null);
                        setDataFetchStatus(FetchStatus.FAILED);
                    });
            } else {
                setValuesAndEmptyOthers();
                setGeneratorToModify(null);
            }
        },
        [
            studyUuid,
            currentNodeUuid,
            getValues,
            setValue,
            setValuesAndEmptyOthers,
        ]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

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
                selectedId,
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
            selectedId,
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
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED ||
                editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED ||
                    dataFetchStatus === FetchStatus.FAILED)),
        delay: 2000, // Change to 200 ms when fetchEquipmentInfos occurs in GeneratorModificationForm and right after receiving the editData without waiting
    });

    return (
        <FormProvider
            validationSchema={formSchema}
            removeOptional={true}
            {...formMethods}
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
                isDataFetching={
                    isUpdate &&
                    (editDataFetchStatus === FetchStatus.RUNNING ||
                        dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                {selectedId == null && (
                    <EquipmentIdSelector
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        defaultValue={selectedId}
                        setSelectedId={setSelectedId}
                        equipmentType={EQUIPMENT_TYPES.GENERATOR.type}
                        fillerHeight={17}
                    />
                )}
                {selectedId != null && (
                    <GeneratorModificationForm
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        equipmentId={selectedId}
                        generatorToModify={generatorToModify}
                        updatePreviousReactiveCapabilityCurveTable={
                            updatePreviousReactiveCapabilityCurveTable
                        }
                    />
                )}
            </ModificationDialog>
        </FormProvider>
    );
};

export default GeneratorModificationDialog;
