/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useForm } from 'react-hook-form';
import ModificationDialog from '../../../commons/modificationDialog';
import { useCallback, useEffect, useState } from 'react';
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
import { sanitizeString } from '../../../dialog-utils';
import BatteryModificationForm from './battery-modification-form';
import {
    getReactiveLimitsEmptyFormData,
    getReactiveLimitsFormData,
    getReactiveLimitsSchema,
} from '../../../reactive-limits/reactive-limits-utils';
import {
    REMOVE,
    setCurrentReactiveCapabilityCurveTable,
} from '../../../reactive-limits/reactive-capability-curve/reactive-capability-utils';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { EQUIPMENT_INFOS_TYPES, EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
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
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import {
    getActivePowerControlEmptyFormData,
    getActivePowerControlSchema,
} from '../../../active-power-control/active-power-control-utils';

const emptyFormData = {
    [EQUIPMENT_NAME]: '',
    [MAXIMUM_ACTIVE_POWER]: null,
    [MINIMUM_ACTIVE_POWER]: null,
    [ACTIVE_POWER_SET_POINT]: null,
    [REACTIVE_POWER_SET_POINT]: null,
    ...getConnectivityWithPositionEmptyFormData(true),
    ...getReactiveLimitsEmptyFormData(),
    ...getActivePowerControlEmptyFormData(true),
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
        ...getActivePowerControlSchema(true),
    })
    .concat(modificationPropertiesSchema)
    .required();

const BatteryModificationDialog = ({
    editData,
    defaultIdValue,
    currentNode,
    currentRootNetworkUuid,
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
                    voltageLevelId: editData?.voltageLevelId?.value ?? null,
                    busbarSectionId: editData?.busOrBusbarSectionId?.value ?? null,
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
                    reactiveCapabilityCurveTable: editData?.reactiveCapabilityCurvePoints ?? null,
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
                    currentNode.id,
                    currentRootNetworkUuid,
                    EQUIPMENT_TYPES.BATTERY,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true
                )
                    .then((value) => {
                        if (value) {
                            const previousReactiveCapabilityCurveTable = value?.reactiveCapabilityCurvePoints;
                            if (previousReactiveCapabilityCurveTable) {
                                setCurrentReactiveCapabilityCurveTable(
                                    previousReactiveCapabilityCurveTable,
                                    `${REACTIVE_LIMITS}.${REACTIVE_CAPABILITY_CURVE_TABLE}`,
                                    getValues,
                                    setValue,
                                    isNodeBuilt(currentNode)
                                );
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
        [studyUuid, currentNode, currentRootNetworkUuid, getValues, setValue, setValuesAndEmptyOthers, reset, editData]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const onSubmit = useCallback(
        (battery) => {
            const reactiveLimits = battery[REACTIVE_LIMITS];
            const isReactiveCapabilityCurveOn = reactiveLimits[REACTIVE_CAPABILITY_CURVE_CHOICE] === 'CURVE';

            modifyBattery({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid,
                batteryId: selectedId,
                name: sanitizeString(battery[EQUIPMENT_NAME]),
                minP: battery[MINIMUM_ACTIVE_POWER],
                maxP: battery[MAXIMUM_ACTIVE_POWER],
                targetP: battery[ACTIVE_POWER_SET_POINT],
                targetQ: battery[REACTIVE_POWER_SET_POINT],
                voltageLevelId: battery[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID],
                busOrBusbarSectionId: battery[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID],
                connectionName: sanitizeString(battery[CONNECTIVITY]?.[CONNECTION_NAME]),
                connectionDirection: battery[CONNECTIVITY]?.[CONNECTION_DIRECTION],
                connectionPosition: battery[CONNECTIVITY]?.[CONNECTION_POSITION],
                terminalConnected: battery[CONNECTIVITY]?.[CONNECTED],
                participate: battery[FREQUENCY_REGULATION],
                droop: battery[DROOP],
                isReactiveCapabilityCurveOn: isReactiveCapabilityCurveOn,
                maxQ: isReactiveCapabilityCurveOn ? null : reactiveLimits[MAXIMUM_REACTIVE_POWER],
                minQ: isReactiveCapabilityCurveOn ? null : reactiveLimits[MINIMUM_REACTIVE_POWER],
                reactiveCapabilityCurve: isReactiveCapabilityCurveOn
                    ? reactiveLimits[REACTIVE_CAPABILITY_CURVE_TABLE]
                    : null,
                properties: toModificationProperties(battery),
            }).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'BatteryModificationError',
                });
            });
        },
        [selectedId, studyUuid, currentNodeUuid, editData?.uuid, snackError]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED || dataFetchStatus === FetchStatus.FAILED)),
        delay: 2000, // Change to 200 ms when fetchEquipmentInfos occurs in BatteryModificationForm and right after receiving the editData without waiting
    });

    return (
        <CustomFormProvider
            validationSchema={formSchema}
            removeOptional={true}
            {...formMethods}
            isNodeBuilt={isNodeBuilt(currentNode)}
            isUpdate={isUpdate}
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
                    isUpdate && (editDataFetchStatus === FetchStatus.RUNNING || dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                {selectedId == null && (
                    <EquipmentIdSelector
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
                        currentRootNetworkUuid={currentRootNetworkUuid}
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
