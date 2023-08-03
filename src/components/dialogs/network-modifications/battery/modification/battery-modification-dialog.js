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
    EQUIPMENT_NAME,
    FREQUENCY_REGULATION,
    MAXIMUM_ACTIVE_POWER,
    MAXIMUM_REACTIVE_POWER,
    MINIMUM_ACTIVE_POWER,
    MINIMUM_REACTIVE_POWER,
    P,
    Q_MAX_P,
    Q_MIN_P,
    REACTIVE_CAPABILITY_CURVE_CHOICE,
    REACTIVE_CAPABILITY_CURVE_TABLE,
    REACTIVE_POWER_SET_POINT,
} from 'components/utils/field-constants';
import { fetchNetworkElementInfos } from 'utils/rest-api';
import { sanitizeString } from '../../../dialogUtils';
import BatteryModificationForm from './battery-modification-form';
import {
    getReactiveLimitsEmptyFormData,
    getReactiveLimitsSchema,
} from '../../../reactive-limits/reactive-limits-utils';
import {
    calculateCurvePointsToStore,
    completeReactiveCapabilityCurvePointsData,
    getRowEmptyFormData,
    insertEmptyRowAtSecondToLastIndex,
    REMOVE,
} from '../../../reactive-limits/reactive-capability-curve/reactive-capability-utils';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { FetchStatus } from 'utils/rest-api';
import {
    EQUIPMENT_INFOS_TYPES,
    EQUIPMENT_TYPES,
} from 'components/utils/equipment-types';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import {
    getFrequencyRegulationSchema,
    getFrequencyRegulationEmptyFormData,
} from '../../../set-points/set-points-utils';
import { modifyBattery } from '../../../../../services/study/network-modifications';

const emptyFormData = {
    [EQUIPMENT_NAME]: '',
    [MAXIMUM_ACTIVE_POWER]: null,
    [MINIMUM_ACTIVE_POWER]: null,
    [ACTIVE_POWER_SET_POINT]: null,
    [REACTIVE_POWER_SET_POINT]: null,
    ...getReactiveLimitsEmptyFormData(true),
    ...getFrequencyRegulationEmptyFormData(true),
};

const formSchema = yup
    .object()
    .shape(
        {
            [EQUIPMENT_NAME]: yup.string(),
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
            [ACTIVE_POWER_SET_POINT]: yup.number().nullable(),
            [REACTIVE_POWER_SET_POINT]: yup.number().nullable(),
            ...getReactiveLimitsSchema(true),
            ...getFrequencyRegulationSchema(true),
        },
        [MAXIMUM_REACTIVE_POWER, MINIMUM_REACTIVE_POWER]
    )
    .required();

const BatteryModificationDialog = ({
    editData,
    defaultIdValue,
    currentNode,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();
    const [selectedId, setSelectedId] = useState(defaultIdValue ?? null);
    const [batteryToModify, setBatteryToModify] = useState();
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, getValues, setValue } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (editData) => {
            if (editData?.equipmentId) {
                setSelectedId(editData.equipmentId);
            }
            reset({
                [EQUIPMENT_NAME]: editData?.equipmentName?.value ?? '',
                [MAXIMUM_ACTIVE_POWER]: editData?.maxActivePower?.value ?? null,
                [MINIMUM_ACTIVE_POWER]: editData?.minActivePower?.value ?? null,
                [ACTIVE_POWER_SET_POINT]:
                    editData?.activePowerSetpoint?.value ?? null,
                [REACTIVE_POWER_SET_POINT]:
                    editData?.reactivePowerSetpoint?.value ?? null,
                [FREQUENCY_REGULATION]: editData?.participate?.value ?? null,
                [DROOP]: editData?.droop?.value ?? null,
                [MINIMUM_REACTIVE_POWER]:
                    editData?.minimumReactivePower?.value ?? null,
                [MAXIMUM_REACTIVE_POWER]:
                    editData?.maximumReactivePower?.value ?? null,
                [REACTIVE_CAPABILITY_CURVE_CHOICE]: editData
                    ?.reactiveCapabilityCurve?.value
                    ? 'CURVE'
                    : 'MINMAX',
                [REACTIVE_CAPABILITY_CURVE_TABLE]:
                    editData?.reactiveCapabilityCurvePoints.length > 0
                        ? completeReactiveCapabilityCurvePointsData(
                              editData?.reactiveCapabilityCurvePoints
                          )
                        : [getRowEmptyFormData(), getRowEmptyFormData()],
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
        setBatteryToModify((previousValue) => {
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

    const onEquipmentIdChange = useCallback(
        (equipmentId) => {
            if (equipmentId) {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNodeUuid,
                    EQUIPMENT_TYPES.BATTERY.type,
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
                            // we need to check if the battery we fetch has reactive capability curve table
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
                            setValue(
                                REACTIVE_CAPABILITY_CURVE_CHOICE,
                                value?.minMaxReactiveLimits ? 'MINMAX' : 'CURVE'
                            );
                            setBatteryToModify({
                                ...value,
                                reactiveCapabilityCurveTable:
                                    previousReactiveCapabilityCurveTable,
                            });
                        }
                        setDataFetchStatus(FetchStatus.SUCCEED);
                    })
                    .catch(() => {
                        setBatteryToModify(null);
                        setDataFetchStatus(FetchStatus.FAILED);
                    });
            } else {
                setValuesAndEmptyOthers();
                setBatteryToModify(null);
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

    const onSubmit = useCallback(
        (battery) => {
            const buildCurvePointsToStore = calculateCurvePointsToStore(
                battery[REACTIVE_CAPABILITY_CURVE_TABLE],
                batteryToModify
            );

            const isFrequencyRegulationOn =
                battery[FREQUENCY_REGULATION] === true ||
                (battery[FREQUENCY_REGULATION] === null &&
                    batteryToModify.activePowerControlOn === true);

            const isReactiveCapabilityCurveOn =
                battery[REACTIVE_CAPABILITY_CURVE_CHOICE] === 'CURVE';

            modifyBattery(
                studyUuid,
                currentNodeUuid,
                selectedId,
                sanitizeString(battery[EQUIPMENT_NAME]),
                battery[MINIMUM_ACTIVE_POWER],
                battery[MAXIMUM_ACTIVE_POWER],
                battery[ACTIVE_POWER_SET_POINT],
                battery[REACTIVE_POWER_SET_POINT],
                undefined,
                undefined,
                editData?.uuid,
                battery[FREQUENCY_REGULATION],
                isFrequencyRegulationOn ? battery[DROOP] : null,
                isReactiveCapabilityCurveOn,
                isReactiveCapabilityCurveOn
                    ? null
                    : battery[MAXIMUM_REACTIVE_POWER],
                isReactiveCapabilityCurveOn
                    ? null
                    : battery[MINIMUM_REACTIVE_POWER],
                isReactiveCapabilityCurveOn ? buildCurvePointsToStore : null
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'BatteryModificationError',
                });
            });
        },
        [
            selectedId,
            batteryToModify,
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
        delay: 2000, // Change to 200 ms when fetchEquipmentInfos occurs in BatteryModificationForm and right after receiving the editData without waiting
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
                aria-labelledby="dialog-modification-battery"
                maxWidth={'md'}
                titleId="ModifyBattery"
                open={open}
                keepMounted={true}
                showNodeNotBuiltWarning={selectedId != null}
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
                        equipmentType={EQUIPMENT_TYPES.BATTERY.type}
                        fillerHeight={17}
                    />
                )}
                {selectedId != null && (
                    <BatteryModificationForm
                        equipmentId={selectedId}
                        batteryToModify={batteryToModify}
                        updatePreviousReactiveCapabilityCurveTable={
                            updatePreviousReactiveCapabilityCurveTable
                        }
                    />
                )}
            </ModificationDialog>
        </FormProvider>
    );
};

export default BatteryModificationDialog;
