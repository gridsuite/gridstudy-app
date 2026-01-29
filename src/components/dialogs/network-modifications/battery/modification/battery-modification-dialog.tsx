/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import {
    CustomFormProvider,
    EquipmentInfosTypes,
    EquipmentType,
    fetchNetworkElementInfos,
    FetchStatus,
    MODIFICATION_TYPES,
    ModificationDialog,
    snackWithFallback,
    useOpenShortWaitFetching,
    useSnackMessage,
} from '@gridsuite/commons-ui';
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
    TRANSFORMER_REACTANCE,
    TRANSIENT_REACTANCE,
    VOLTAGE_LEVEL,
} from 'components/utils/field-constants';
import { sanitizeString } from '../../../dialog-utils';
import {
    getReactiveLimitsEmptyFormData,
    getReactiveLimitsFormData,
    getReactiveLimitsValidationSchema,
} from '../../../reactive-limits/reactive-limits-utils';
import { REMOVE } from '../../../reactive-limits/reactive-capability-curve/reactive-capability-utils';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { modifyBattery } from '../../../../../services/study/network-modifications';
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
    getConnectivityWithPositionSchema,
} from '../../../connectivity/connectivity-form-utils';
import { isNodeBuilt } from '../../../../graph/util/model-functions';
import { BatteryFormInfos, BatteryModificationDialogSchemaForm } from '../battery-dialog.type';
import { DeepNullable } from '../../../../utils/ts-utils';
import { toModificationOperation } from '../../../../utils/utils';
import {
    getActivePowerControlEmptyFormData,
    getActivePowerControlSchema,
} from '../../../active-power-control/active-power-control-utils';
import { BatteryModificationInfos } from '../../../../../services/network-modification-types';
import BatteryModificationForm from './battery-modification-form';
import { getSetPointsEmptyFormData, getSetPointsSchema } from '../../../set-points/set-points-utils';
import { EquipmentModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import { useFormWithDirtyTracking } from 'components/dialogs/commons/use-form-with-dirty-tracking';
import {
    getShortCircuitEmptyFormData,
    getShortCircuitFormData,
    getShortCircuitFormSchema,
} from '../../../short-circuit/short-circuit-utils';
import { UUID } from 'node:crypto';

const emptyFormData = {
    [EQUIPMENT_NAME]: '',
    [MAXIMUM_ACTIVE_POWER]: null,
    [MINIMUM_ACTIVE_POWER]: null,
    ...getConnectivityWithPositionEmptyFormData(true),
    ...getReactiveLimitsEmptyFormData(),
    ...getSetPointsEmptyFormData(true),
    ...getActivePowerControlEmptyFormData(true),
    ...emptyProperties,
    ...getShortCircuitEmptyFormData(),
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_NAME]: yup.string().nullable(),
        [MAXIMUM_ACTIVE_POWER]: yup.number().nullable(),
        [MINIMUM_ACTIVE_POWER]: yup
            .number()
            .nullable()
            .when([MAXIMUM_ACTIVE_POWER], {
                is: (maximumActivePower: number) => maximumActivePower != null,
                then: (schema) =>
                    schema.max(yup.ref(MAXIMUM_ACTIVE_POWER), 'MinActivePowerMustBeLessOrEqualToMaxActivePower'),
            }),
        [CONNECTIVITY]: getConnectivityWithPositionSchema(true),
        [REACTIVE_LIMITS]: getReactiveLimitsValidationSchema(true),
        ...getSetPointsSchema(true),
        ...getActivePowerControlSchema(true),
        ...getShortCircuitFormSchema(true),
    })
    .concat(modificationPropertiesSchema)
    .required();

export type BatteryModificationDialogProps = EquipmentModificationDialogProps & {
    editData?: BatteryModificationInfos;
};

export default function BatteryModificationDialog({
    editData,
    defaultIdValue,
    currentNode,
    currentRootNetworkUuid,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<BatteryModificationDialogProps>) {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();
    const [selectedId, setSelectedId] = useState<string>(defaultIdValue ?? null);
    const [batteryToModify, setBatteryToModify] = useState<BatteryFormInfos | null>(null);
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);
    const formMethods = useFormWithDirtyTracking<DeepNullable<BatteryModificationDialogSchemaForm>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<BatteryModificationDialogSchemaForm>>(formSchema),
    });

    const { reset, getValues, setValue } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (editData: BatteryModificationInfos) => {
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
                    connectionDirection: editData?.connectionDirection?.value ?? null,
                    connectionName: editData?.connectionName?.value ?? '',
                    connectionPosition: editData?.connectionPosition?.value ?? null,
                    terminalConnected: editData?.terminalConnected?.value ?? null,
                }),
                ...getReactiveLimitsFormData({
                    id: REACTIVE_LIMITS,
                    reactiveCapabilityCurveChoice: editData?.reactiveCapabilityCurve?.value ? 'CURVE' : 'MINMAX',
                    maximumReactivePower: editData?.maxQ?.value ?? null,
                    minimumReactivePower: editData?.minQ?.value ?? null,
                    reactiveCapabilityCurvePoints: editData?.reactiveCapabilityCurvePoints ?? null,
                }),
                ...getPropertiesFromModification(editData?.properties ?? undefined),
                ...getShortCircuitFormData({
                    directTransX: editData?.directTransX?.value ?? null,
                    stepUpTransformerX: editData?.stepUpTransformerX?.value ?? null,
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
            reset({ ...emptyFormData, ...customData }, { keepDefaultValues: keepDefaultValues });
        },
        [reset]
    );

    const updatePreviousReactiveCapabilityCurveTable = (action: string, index: number) => {
        setBatteryToModify((previousValue) => {
            if (!previousValue) {
                return null;
            }
            const newRccValues = previousValue?.reactiveCapabilityCurvePoints ?? [];
            if (action === REMOVE) {
                newRccValues.splice(index, 1);
            } else {
                newRccValues.splice(index, 0, {
                    [P]: null,
                    [MIN_Q]: null,
                    [MAX_Q]: null,
                });
            }
            return {
                ...previousValue,
                reactiveCapabilityCurvePoints: newRccValues,
            };
        });
    };

    const onEquipmentIdChange = useCallback(
        (equipmentId: string) => {
            if (equipmentId) {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNode.id,
                    currentRootNetworkUuid,
                    EquipmentType.BATTERY,
                    EquipmentInfosTypes.FORM.type,
                    equipmentId as UUID,
                    true
                )
                    .then((value: BatteryFormInfos) => {
                        if (value) {
                            const previousReactiveCapabilityCurveTable = value?.reactiveCapabilityCurvePoints;
                            if (previousReactiveCapabilityCurveTable) {
                                setValue(
                                    `${REACTIVE_LIMITS}.${REACTIVE_CAPABILITY_CURVE_TABLE}`,
                                    previousReactiveCapabilityCurveTable
                                );
                            }
                            setValue(
                                `${REACTIVE_LIMITS}.${REACTIVE_CAPABILITY_CURVE_CHOICE}`,
                                value?.minMaxReactiveLimits ? 'MINMAX' : 'CURVE'
                            );
                            setBatteryToModify({
                                ...value,
                                reactiveCapabilityCurvePoints: previousReactiveCapabilityCurveTable,
                            });
                            reset(
                                (formValues) => ({
                                    ...formValues,
                                    [ADDITIONAL_PROPERTIES]: getConcatenatedProperties(value, getValues),
                                }),
                                { keepDirty: true }
                            );
                        }
                        setDataFetchStatus(FetchStatus.SUCCEED);
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        if (editData?.equipmentId !== equipmentId) {
                            setBatteryToModify(null);
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
        (battery: BatteryModificationDialogSchemaForm) => {
            const reactiveLimits = battery[REACTIVE_LIMITS];
            const isReactiveCapabilityCurveOn = reactiveLimits?.[REACTIVE_CAPABILITY_CURVE_CHOICE] === 'CURVE';
            const batteryModificationInfos = {
                type: MODIFICATION_TYPES.BATTERY_MODIFICATION.type,
                uuid: editData?.uuid ?? null,
                equipmentId: selectedId,
                equipmentName: toModificationOperation(sanitizeString(battery[EQUIPMENT_NAME])),
                minP: toModificationOperation(battery[MINIMUM_ACTIVE_POWER]),
                maxP: toModificationOperation(battery[MAXIMUM_ACTIVE_POWER]),
                targetP: toModificationOperation(battery[ACTIVE_POWER_SET_POINT]),
                targetQ: toModificationOperation(battery[REACTIVE_POWER_SET_POINT]),
                voltageLevelId: toModificationOperation(battery[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID]),
                busOrBusbarSectionId: toModificationOperation(battery[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID]),
                connectionName: toModificationOperation(sanitizeString(battery[CONNECTIVITY]?.[CONNECTION_NAME])),
                connectionDirection: toModificationOperation(battery[CONNECTIVITY]?.[CONNECTION_DIRECTION]),
                connectionPosition: toModificationOperation(battery[CONNECTIVITY]?.[CONNECTION_POSITION]),
                terminalConnected: toModificationOperation(battery[CONNECTIVITY]?.[CONNECTED]),
                reactiveCapabilityCurve: toModificationOperation(isReactiveCapabilityCurveOn),
                participate: toModificationOperation(battery[FREQUENCY_REGULATION]),
                droop: toModificationOperation(battery[DROOP]) ?? null,
                maxQ: toModificationOperation(
                    isReactiveCapabilityCurveOn ? null : reactiveLimits?.[MAXIMUM_REACTIVE_POWER]
                ),
                minQ: toModificationOperation(
                    isReactiveCapabilityCurveOn ? null : reactiveLimits?.[MINIMUM_REACTIVE_POWER]
                ),
                reactiveCapabilityCurvePoints: isReactiveCapabilityCurveOn
                    ? (reactiveLimits[REACTIVE_CAPABILITY_CURVE_TABLE] ?? null)
                    : null,
                properties: toModificationProperties(battery) ?? null,
                directTransX: toModificationOperation(battery[TRANSIENT_REACTANCE]),
                stepUpTransformerX: toModificationOperation(battery[TRANSFORMER_REACTANCE]),
            } satisfies BatteryModificationInfos;
            modifyBattery({
                batteryModificationInfos: batteryModificationInfos,
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid ?? null,
                isUpdate: !!editData,
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'BatteryModificationError' });
            });
        },
        [selectedId, studyUuid, currentNodeUuid, editData, snackError]
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
                maxWidth={'md'}
                titleId="ModifyBattery"
                open={open}
                keepMounted={true}
                isDataFetching={
                    isUpdate && (editDataFetchStatus === FetchStatus.RUNNING || dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                {selectedId == null && (
                    <EquipmentIdSelector
                        defaultValue={selectedId}
                        setSelectedId={setSelectedId}
                        equipmentType={EquipmentType.BATTERY}
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
}
