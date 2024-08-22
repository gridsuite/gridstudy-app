/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useForm } from 'react-hook-form';
import ModificationDialog from '../../../commons/modificationDialog';
import React, { useCallback, useEffect, useState } from 'react';
import { CustomFormProvider, useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import {
    ACTIVE_POWER_SET_POINT,
    ADDITIONAL_PROPERTIES,
    BUS_OR_BUSBAR_SECTION,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    DROOP,
    EQUIPMENT_NAME,
    FREQUENCY_REGULATION,
    ID,
    MAX_Q,
    MAXIMUM_ACTIVE_POWER,
    MAXIMUM_REACTIVE_POWER,
    MIN_Q,
    MINIMUM_ACTIVE_POWER,
    MINIMUM_REACTIVE_POWER,
    P,
    REACTIVE_CAPABILITY_CURVE_CHOICE,
    REACTIVE_CAPABILITY_CURVE_TABLE,
    REACTIVE_LIMITS,
    REACTIVE_POWER_SET_POINT,
    VOLTAGE_LEVEL,
} from 'components/utils/field-constants';
import { sanitizeString } from '../../../dialogUtils';
import BatteryModificationForm from './battery-modification-form';
import {
    getReactiveLimitsEmptyFormData,
    getReactiveLimitsFormData,
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
import { EQUIPMENT_INFOS_TYPES, EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import {
    getFrequencyRegulationEmptyFormData,
    getFrequencyRegulationSchema,
} from '../../../set-points/set-points-utils';
import { modifyBattery } from '../../../../../services/study/network-modifications';
import { fetchNetworkElementInfos } from '../../../../../services/study/network';
import { FetchStatus } from '../../../../../services/utils';
import {
    emptyProperties,
    getConcatenatedProperties,
    getPropertiesFromModification,
    modificationPropertiesSchema,
    toModificationProperties,
} from '../../common/properties/property-utils';
import {
    getConnectivityFormData,
    getConnectivityWithPositionEmptyFormData,
    getConnectivityWithPositionValidationSchema,
} from '../../../connectivity/connectivity-form-utils';

const emptyFormData = {
    [EQUIPMENT_NAME]: '',
    [MAXIMUM_ACTIVE_POWER]: null,
    [MINIMUM_ACTIVE_POWER]: null,
    [ACTIVE_POWER_SET_POINT]: null,
    [REACTIVE_POWER_SET_POINT]: null,
    ...getConnectivityWithPositionEmptyFormData(true),
    ...getReactiveLimitsEmptyFormData(),
    ...getFrequencyRegulationEmptyFormData(true),
    ...emptyProperties,
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_NAME]: yup.string(),
        [MAXIMUM_ACTIVE_POWER]: yup.number().nullable(),
        [MINIMUM_ACTIVE_POWER]: yup
            .number()
            .nullable()
            .when([MAXIMUM_ACTIVE_POWER], {
                is: (maximumActivePower) => maximumActivePower != null,
                then: (schema) =>
                    schema.max(yup.ref(MAXIMUM_ACTIVE_POWER), 'MinActivePowerMustBeLessOrEqualToMaxActivePower'),
            }),
        [ACTIVE_POWER_SET_POINT]: yup.number().nullable(),
        [REACTIVE_POWER_SET_POINT]: yup.number().nullable(),
        ...getConnectivityWithPositionValidationSchema(true),
        ...getReactiveLimitsSchema(true),
        ...getFrequencyRegulationSchema(true),
    })
    .concat(modificationPropertiesSchema)
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
                [MAXIMUM_ACTIVE_POWER]: editData?.maxP?.value ?? null,
                [MINIMUM_ACTIVE_POWER]: editData?.minP?.value ?? null,
                [ACTIVE_POWER_SET_POINT]: editData?.targetP?.value ?? null,
                [REACTIVE_POWER_SET_POINT]: editData?.targetQ?.value ?? null,
                [FREQUENCY_REGULATION]: editData?.participate?.value ?? null,
                [DROOP]: editData?.droop?.value ?? null,
                ...getConnectivityFormData({
                    voltageLevelId: editData?.voltageLevelId.value ?? null,
                    busbarSectionId: editData?.busOrBusbarSectionId.value ?? null,
                    connectionName: editData?.connectionName?.value ?? '',
                    connectionDirection: editData?.connectionDirection?.value ?? null,
                    connectionPosition: editData?.connectionPosition?.value ?? null,
                    [CONNECTED]: editData?.terminalConnected?.value ?? null,
                    isEquipmentModification: true,
                }),
                ...getReactiveLimitsFormData({
                    reactiveCapabilityCurveChoice: editData?.reactiveCapabilityCurve?.value ? 'CURVE' : 'MINMAX',
                    maximumReactivePower: editData?.maxQ?.value ?? null,
                    minimumReactivePower: editData?.minQ?.value ?? null,
                    reactiveCapabilityCurveTable:
                        editData?.reactiveCapabilityCurvePoints?.length > 0
                            ? completeReactiveCapabilityCurvePointsData(editData?.reactiveCapabilityCurvePoints)
                            : [getRowEmptyFormData(), getRowEmptyFormData()],
                }),
                ...getPropertiesFromModification(editData.properties),
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
            reset({ ...emptyFormData, ...customData }, { keepDefaultValues: keepDefaultValues });
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
                      [MIN_Q]: null,
                      [MAX_Q]: null,
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
                    EQUIPMENT_TYPES.BATTERY,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true
                )
                    .then((value) => {
                        if (value) {
                            // when editing modification form, first render should not trigger this reset
                            // which would empty the form instead of displaying data of existing form
                            const previousReactiveCapabilityCurveTable = value.reactiveCapabilityCurvePoints;
                            // on first render, we need to adjust the UI for the reactive capability curve table
                            // we need to check if the battery we fetch has reactive capability curve table
                            if (previousReactiveCapabilityCurveTable) {
                                const currentReactiveCapabilityCurveTable = getValues(
                                    `${REACTIVE_LIMITS}.${REACTIVE_CAPABILITY_CURVE_TABLE}`
                                );

                                const sizeDiff =
                                    previousReactiveCapabilityCurveTable.length -
                                    currentReactiveCapabilityCurveTable.length;

                                // if there are more values in previousValues table, we need to insert rows to current tables to match the number of previousValues table rows
                                if (sizeDiff > 0) {
                                    for (let i = 0; i < sizeDiff; i++) {
                                        insertEmptyRowAtSecondToLastIndex(currentReactiveCapabilityCurveTable);
                                    }
                                    setValue(
                                        `${REACTIVE_LIMITS}.${REACTIVE_CAPABILITY_CURVE_TABLE}`,
                                        currentReactiveCapabilityCurveTable
                                    );
                                } else if (sizeDiff < 0) {
                                    // if there are more values in current table, we need to add rows to previousValues tables to match the number of current table rows
                                    for (let i = 0; i > sizeDiff; i--) {
                                        insertEmptyRowAtSecondToLastIndex(previousReactiveCapabilityCurveTable);
                                    }
                                }
                            }
                            setValue(
                                `${REACTIVE_LIMITS}.${REACTIVE_CAPABILITY_CURVE_CHOICE}`,
                                value?.minMaxReactiveLimits ? 'MINMAX' : 'CURVE'
                            );
                            setValue(`${CONNECTIVITY}.${VOLTAGE_LEVEL}.${ID}`, value?.voltageLevelId);
                            setValue(`${CONNECTIVITY}.${BUS_OR_BUSBAR_SECTION}.${ID}`, value?.busOrBusbarSectionId);
                            setBatteryToModify({
                                ...value,
                                reactiveCapabilityCurveTable: previousReactiveCapabilityCurveTable,
                            });
                            reset((formValues) => ({
                                ...formValues,
                                [ADDITIONAL_PROPERTIES]: getConcatenatedProperties(value, getValues),
                            }));
                        }
                        setDataFetchStatus(FetchStatus.SUCCEED);
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        if (editData?.equipmentId !== equipmentId) {
                            setBatteryToModify(null);
                            reset(emptyFormData);
                        }
                    });
            } else {
                setValuesAndEmptyOthers();
                setBatteryToModify(null);
            }
        },
        [studyUuid, currentNodeUuid, getValues, setValue, setValuesAndEmptyOthers, reset, editData]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const onSubmit = useCallback(
        (battery) => {
            const reactiveLimits = battery[REACTIVE_LIMITS];
            const buildCurvePointsToStore = calculateCurvePointsToStore(
                reactiveLimits[REACTIVE_CAPABILITY_CURVE_TABLE],
                batteryToModify
            );

            const isReactiveCapabilityCurveOn = reactiveLimits[REACTIVE_CAPABILITY_CURVE_CHOICE] === 'CURVE';

            modifyBattery(
                studyUuid,
                currentNodeUuid,
                selectedId,
                sanitizeString(battery[EQUIPMENT_NAME]),
                battery[MINIMUM_ACTIVE_POWER],
                battery[MAXIMUM_ACTIVE_POWER],
                battery[ACTIVE_POWER_SET_POINT],
                battery[REACTIVE_POWER_SET_POINT],
                battery[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID],
                battery[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID],
                sanitizeString(battery[CONNECTIVITY]?.[CONNECTION_NAME]),
                battery[CONNECTIVITY]?.[CONNECTION_DIRECTION],
                battery[CONNECTIVITY]?.[CONNECTION_POSITION],
                battery[CONNECTIVITY]?.[CONNECTED],
                editData?.uuid,
                battery[FREQUENCY_REGULATION],
                battery[DROOP],
                isReactiveCapabilityCurveOn,
                isReactiveCapabilityCurveOn ? null : reactiveLimits[MAXIMUM_REACTIVE_POWER],
                isReactiveCapabilityCurveOn ? null : reactiveLimits[MINIMUM_REACTIVE_POWER],
                isReactiveCapabilityCurveOn ? buildCurvePointsToStore : null,
                toModificationProperties(battery)
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'BatteryModificationError',
                });
            });
        },
        [selectedId, batteryToModify, studyUuid, currentNodeUuid, editData?.uuid, snackError]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED || dataFetchStatus === FetchStatus.FAILED)),
        delay: 2000, // Change to 200 ms when fetchEquipmentInfos occurs in BatteryModificationForm and right after receiving the editData without waiting
    });

    return (
        <CustomFormProvider validationSchema={formSchema} removeOptional={true} {...formMethods}>
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
                    isUpdate && (editDataFetchStatus === FetchStatus.RUNNING || dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                {selectedId == null && (
                    <EquipmentIdSelector
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        defaultValue={selectedId}
                        setSelectedId={setSelectedId}
                        equipmentType={EQUIPMENT_TYPES.BATTERY}
                        fillerHeight={17}
                    />
                )}
                {selectedId != null && (
                    <BatteryModificationForm
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        equipmentId={selectedId}
                        batteryToModify={batteryToModify}
                        updatePreviousReactiveCapabilityCurveTable={updatePreviousReactiveCapabilityCurveTable}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default BatteryModificationDialog;
