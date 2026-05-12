/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useForm } from 'react-hook-form';
import { ModificationDialog } from '../../../commons/modificationDialog';
import EquipmentSearchDialog from '../../../equipment-search-dialog';
import { useCallback, useEffect } from 'react';
import { useFormSearchCopy } from '../../../commons/use-form-search-copy';
import {
    copyEquipmentPropertiesForCreation,
    CustomFormProvider,
    EquipmentType,
    snackWithFallback,
    useSnackMessage,
    DeepNullable,
    getConnectivityFormData,
    FieldConstants,
    getShortCircuitFormData,
    getReactiveLimitsFormData,
    BatteryCreationFormData,
    batteryCreationFormSchema,
    batteryCreationEmptyFormData,
    BatteryCreationDto,
    batteryCreationDtoToForm,
    BatteryCreationForm,
    batteryCreationFormToDto,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { createBattery } from '../../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../../services/utils.type';
import { WithModificationId } from '../../../../../services/network-modification-types';
import { isNodeBuilt } from 'components/graph/util/model-functions';
import { NetworkModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';
import { BatteryFormInfos } from '../battery-dialog.type';
import PositionDiagramPane from '../../../../grid-layout/cards/diagrams/singleLineDiagram/positionDiagram/position-diagram-pane';
import useVoltageLevelsListInfos from '../../../../../hooks/use-voltage-levels-list-infos';
import { fetchBusesOrBusbarSectionsForVoltageLevel } from '../../../../../services/study/network';

interface BatteryCreationDtoWithId extends BatteryCreationDto, WithModificationId {}

export type BatteryCreationDialogProps = NetworkModificationDialogProps & {
    editData: BatteryCreationDtoWithId;
};

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
    const voltageLevelOptions = useVoltageLevelsListInfos(studyUuid, currentNode?.id, currentRootNetworkUuid);

    const formMethods = useForm<DeepNullable<BatteryCreationFormData>>({
        defaultValues: batteryCreationEmptyFormData,
        resolver: yupResolver<DeepNullable<BatteryCreationFormData>>(batteryCreationFormSchema),
    });

    const { reset } = formMethods;
    const fromSearchCopyToFormValues = (battery: BatteryFormInfos) => {
        reset(
            {
                [FieldConstants.EQUIPMENT_ID]: battery.id + '(1)',
                [FieldConstants.EQUIPMENT_NAME]: battery.name ?? '',
                [FieldConstants.MAXIMUM_ACTIVE_POWER]: battery.maxP,
                [FieldConstants.MINIMUM_ACTIVE_POWER]: battery.minP,
                [FieldConstants.ACTIVE_POWER_SET_POINT]: battery.targetP,
                [FieldConstants.REACTIVE_POWER_SET_POINT]: battery.targetQ,
                [FieldConstants.FREQUENCY_REGULATION]: battery.activePowerControl?.participate,
                [FieldConstants.DROOP]: battery.activePowerControl?.droop,
                ...getConnectivityFormData({
                    voltageLevelId: battery.voltageLevelId,
                    busbarSectionId: battery.busOrBusbarSectionId,
                    connectionDirection: battery.connectablePosition.connectionDirection,
                    connectionName: battery.connectablePosition.connectionName,
                    // connected is not copied on purpose: we use the default value (true) in all cases
                }),
                ...getReactiveLimitsFormData({
                    id: FieldConstants.REACTIVE_LIMITS,
                    reactiveCapabilityCurveChoice: battery?.minMaxReactiveLimits ? 'MINMAX' : 'CURVE',
                    minimumReactivePower: battery?.minMaxReactiveLimits?.minQ ?? null,
                    maximumReactivePower: battery?.minMaxReactiveLimits?.maxQ ?? null,
                    reactiveCapabilityCurvePoints: battery?.reactiveCapabilityCurvePoints ?? [{}, {}],
                }),
                ...copyEquipmentPropertiesForCreation(battery),
                ...getShortCircuitFormData({
                    directTransX: battery.batteryShortCircuit?.directTransX,
                    stepUpTransformerX: battery.batteryShortCircuit?.stepUpTransformerX,
                }),
            },
            { keepDefaultValues: true }
        );
    };
    const searchCopy = useFormSearchCopy(fromSearchCopyToFormValues, EquipmentType.BATTERY);

    const fetchBusesOrBusbarSections = useCallback(
        (voltageLevelId: string) =>
            fetchBusesOrBusbarSectionsForVoltageLevel(
                studyUuid,
                currentNodeUuid,
                currentRootNetworkUuid,
                voltageLevelId
            ),
        [studyUuid, currentNodeUuid, currentRootNetworkUuid]
    );

    useEffect(() => {
        if (editData) {
            reset(batteryCreationDtoToForm(editData));
        }
    }, [editData, reset]);

    const clear = useCallback(() => {
        reset(batteryCreationEmptyFormData);
    }, [reset]);

    const onSubmit = useCallback(
        (batteryForm: BatteryCreationFormData) => {
            const dto = batteryCreationFormToDto(batteryForm);
            createBattery(studyUuid, currentNodeUuid, editData?.uuid, dto).catch((error: Error) => {
                snackWithFallback(snackError, error, {
                    headerId: 'BatteryCreationError',
                });
            });
        },
        [studyUuid, currentNodeUuid, editData?.uuid, snackError]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });
    return (
        <CustomFormProvider
            isNodeBuilt={isNodeBuilt(currentNode)}
            validationSchema={batteryCreationFormSchema}
            {...formMethods}
        >
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                maxWidth={'md'}
                titleId="CreateBattery"
                searchCopy={searchCopy}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <BatteryCreationForm
                    voltageLevelOptions={voltageLevelOptions}
                    PositionDiagramPane={PositionDiagramPane}
                    fetchBusesOrBusbarSections={fetchBusesOrBusbarSections}
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
