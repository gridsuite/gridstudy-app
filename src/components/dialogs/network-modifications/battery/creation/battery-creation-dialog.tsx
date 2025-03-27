/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useForm } from 'react-hook-form';
import EquipmentSearchDialog from '../../../equipment-search-dialog';
import { useCallback, useEffect } from 'react';
import { useFormSearchCopy } from '../../../commons/use-form-search-copy';
import { CustomFormProvider, EquipmentType, MODIFICATION_TYPES, useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import {
    ACTIVE_POWER_SET_POINT,
    BUS_OR_BUSBAR_SECTION,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    DROOP,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    FREQUENCY_REGULATION,
    ID,
    MAXIMUM_ACTIVE_POWER,
    MAXIMUM_REACTIVE_POWER,
    MINIMUM_ACTIVE_POWER,
    MINIMUM_REACTIVE_POWER,
    REACTIVE_CAPABILITY_CURVE_CHOICE,
    REACTIVE_CAPABILITY_CURVE_TABLE,
    REACTIVE_LIMITS,
    REACTIVE_POWER_SET_POINT,
    VOLTAGE_LEVEL,
} from 'components/utils/field-constants';
import {
    getConnectivityFormData,
    getConnectivityWithPositionEmptyFormData,
    getConnectivityWithPositionSchema,
} from '../../../connectivity/connectivity-form-utils';
import { sanitizeString } from '../../../dialog-utils';
import { FORM_LOADING_DELAY, UNDEFINED_CONNECTION_DIRECTION } from 'components/network/constants';
import {
    getReactiveLimitsEmptyFormData,
    getReactiveLimitsFormData,
    getReactiveLimitsValidationSchema,
} from '../../../reactive-limits/reactive-limits-utils';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { createBattery } from '../../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../../services/utils.type';
import {
    copyEquipmentPropertiesForCreation,
    creationPropertiesSchema,
    emptyProperties,
    getPropertiesFromModification,
    toModificationProperties,
} from '../../common/properties/property-utils';
import { DialogProps } from '@mui/material/Dialog/Dialog';
import { CurrentTreeNode } from '../../../../../redux/reducer';
import { UUID } from 'crypto';
import { BatteryCreationDialogSchemaForm, BatteryFormInfos } from '../battery-dialog.type';
import { DeepNullable } from '../../../../utils/ts-utils';
import {
    getActivePowerControlEmptyFormData,
    getActivePowerControlSchema,
} from '../../../active-power-control/active-power-control-utils';
import { BatteryCreationInfos } from '../../../../../services/network-modification-types';
import BatteryCreationForm from './battery-creation-form';
import ModificationDialog from '../../../commons/modificationDialog';
import { getSetPointsEmptyFormData, getSetPointsSchema } from '../../../set-points/set-points-utils';

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [MAXIMUM_ACTIVE_POWER]: null,
    [MINIMUM_ACTIVE_POWER]: null,
    ...getSetPointsEmptyFormData(),
    ...getConnectivityWithPositionEmptyFormData(),
    ...getReactiveLimitsEmptyFormData(),
    ...getActivePowerControlEmptyFormData(),
    ...emptyProperties,
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string(),
        [MAXIMUM_ACTIVE_POWER]: yup.number().nullable().required(),
        [MINIMUM_ACTIVE_POWER]: yup.number().nullable().required(),
        [CONNECTIVITY]: getConnectivityWithPositionSchema(),
        [REACTIVE_LIMITS]: getReactiveLimitsValidationSchema(),
        ...getSetPointsSchema(),
        ...getActivePowerControlSchema(),
    })
    .concat(creationPropertiesSchema)
    .required();

export interface BatteryCreationDialogProps extends Partial<DialogProps> {
    editData: BatteryCreationInfos;
    currentNode: CurrentTreeNode;
    studyUuid: UUID;
    currentRootNetworkUuid: UUID;
    isUpdate: boolean;
    editDataFetchStatus: FetchStatus;
}

export default function BatteryCreationDialog({
    editData,
    currentNode,
    studyUuid,
    currentRootNetworkUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<BatteryCreationDialogProps>) {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();

    const formMethods = useForm<DeepNullable<BatteryCreationDialogSchemaForm>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<BatteryCreationDialogSchemaForm>>(formSchema),
    });

    const { reset } = formMethods;
    const fromSearchCopyToFormValues = (battery: BatteryFormInfos) => {
        reset(
            {
                [EQUIPMENT_ID]: battery.id + '(1)',
                [EQUIPMENT_NAME]: battery.name ?? '',
                [MAXIMUM_ACTIVE_POWER]: battery.maxP,
                [MINIMUM_ACTIVE_POWER]: battery.minP,
                [ACTIVE_POWER_SET_POINT]: battery.targetP,
                [REACTIVE_POWER_SET_POINT]: battery.targetQ,
                [FREQUENCY_REGULATION]: battery.activePowerControl?.participate,
                [DROOP]: battery.activePowerControl?.droop,
                ...getConnectivityFormData({
                    voltageLevelId: battery.voltageLevelId,
                    busbarSectionId: battery.busOrBusbarSectionId,
                    connectionDirection: battery.connectablePosition.connectionDirection,
                    connectionName: battery.connectablePosition.connectionName,
                    // connected is not copied on purpose: we use the default value (true) in all cases
                }),
                ...getReactiveLimitsFormData({
                    id: REACTIVE_LIMITS,
                    reactiveCapabilityCurveChoice: battery?.minMaxReactiveLimits ? 'MINMAX' : 'CURVE',
                    minimumReactivePower: battery?.minMaxReactiveLimits?.minQ ?? null,
                    maximumReactivePower: battery?.minMaxReactiveLimits?.maxQ ?? null,
                    reactiveCapabilityCurvePoints: battery?.reactiveCapabilityCurvePoints ?? [{}, {}],
                }),
                ...copyEquipmentPropertiesForCreation(battery),
            },
            { keepDefaultValues: true }
        );
    };
    const searchCopy = useFormSearchCopy(fromSearchCopyToFormValues, EquipmentType.BATTERY);

    useEffect(() => {
        if (editData) {
            reset({
                [EQUIPMENT_ID]: editData.equipmentId,
                [EQUIPMENT_NAME]: editData.equipmentName ?? '',
                [MAXIMUM_ACTIVE_POWER]: editData.maxP,
                [MINIMUM_ACTIVE_POWER]: editData.minP,
                [ACTIVE_POWER_SET_POINT]: editData.targetP,
                [REACTIVE_POWER_SET_POINT]: editData.targetQ,
                [FREQUENCY_REGULATION]: editData.participate,
                [DROOP]: editData.droop,
                ...getConnectivityFormData({
                    voltageLevelId: editData.voltageLevelId,
                    busbarSectionId: editData.busOrBusbarSectionId,
                    connectionDirection: editData.connectionDirection,
                    connectionName: editData.connectionName,
                    connectionPosition: editData.connectionPosition,
                    terminalConnected: editData.terminalConnected,
                }),
                ...getReactiveLimitsFormData({
                    id: REACTIVE_LIMITS,
                    reactiveCapabilityCurveChoice: editData?.reactiveCapabilityCurve ? 'CURVE' : 'MINMAX',
                    minimumReactivePower: editData?.minQ,
                    maximumReactivePower: editData?.maxQ,
                    reactiveCapabilityCurvePoints: editData?.reactiveCapabilityCurve
                        ? editData?.reactiveCapabilityCurvePoints
                        : [{}, {}],
                }),
                ...getPropertiesFromModification(editData?.properties ?? undefined),
            });
        }
    }, [editData, reset]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onSubmit = useCallback(
        (battery: BatteryCreationDialogSchemaForm) => {
            const reactiveLimits = battery[REACTIVE_LIMITS];
            const isReactiveCapabilityCurveOn = reactiveLimits[REACTIVE_CAPABILITY_CURVE_CHOICE] === 'CURVE';
            const batteryCreationInfos = {
                type: MODIFICATION_TYPES.BATTERY_CREATION.type,
                uuid: editData?.uuid,
                equipmentId: battery[EQUIPMENT_ID],
                equipmentName: sanitizeString(battery[EQUIPMENT_NAME]) ?? null,
                voltageLevelId: battery[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID] ?? null,
                busOrBusbarSectionId: battery[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID] ?? null,
                connectionName: sanitizeString(battery[CONNECTIVITY]?.[CONNECTION_NAME]),
                connectionDirection: battery[CONNECTIVITY]?.[CONNECTION_DIRECTION] ?? UNDEFINED_CONNECTION_DIRECTION,
                connectionPosition: battery[CONNECTIVITY]?.[CONNECTION_POSITION],
                terminalConnected: battery[CONNECTIVITY]?.[CONNECTED],
                minP: battery[MINIMUM_ACTIVE_POWER],
                maxP: battery[MAXIMUM_ACTIVE_POWER],
                reactiveCapabilityCurve: isReactiveCapabilityCurveOn,
                minQ: isReactiveCapabilityCurveOn ? null : reactiveLimits[MINIMUM_REACTIVE_POWER] ?? null,
                maxQ: isReactiveCapabilityCurveOn ? null : reactiveLimits[MAXIMUM_REACTIVE_POWER] ?? null,
                reactiveCapabilityCurvePoints: isReactiveCapabilityCurveOn
                    ? reactiveLimits[REACTIVE_CAPABILITY_CURVE_TABLE] ?? null
                    : null,
                targetP: battery[ACTIVE_POWER_SET_POINT] ?? null,
                targetQ: battery[REACTIVE_POWER_SET_POINT] ?? null,
                participate: battery[FREQUENCY_REGULATION] ?? null,
                droop: battery[DROOP] ?? null,
                properties: toModificationProperties(battery) ?? null,
            } satisfies BatteryCreationInfos;
            createBattery({
                batteryCreationInfos: batteryCreationInfos,
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid,
                isUpdate: !!editData,
            }).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'BatteryCreationError',
                });
            });
        },
        [studyUuid, currentNodeUuid, editData, snackError]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });
    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClose={clear}
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-create-battery"
                maxWidth={'md'}
                titleId="CreateBattery"
                searchCopy={searchCopy}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <BatteryCreationForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />

                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={EquipmentType.BATTERY}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
}
