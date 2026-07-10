/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { yupResolver } from '@hookform/resolvers/yup';
import {
    CustomFormProvider,
    DeepNullable,
    equipmentDeletionEmptyFormData,
    EquipmentDeletionDto,
    EquipmentType,
    snackWithFallback,
    useSnackMessage,
    equipmentDeletionFormSchema,
    EquipmentDeletionFormData,
    EquipmentDeletionForm,
    equipmentDeletionDtoToForm,
    equipmentDeletionFormToDto,
} from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { useCallback, useEffect, useMemo } from 'react';
import { ModificationDialog } from '../../commons/modificationDialog';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { deleteEquipment } from '../../../../services/study/network-modifications';
import { UUID } from 'node:crypto';
import { FetchStatus } from 'services/utils.type';
import { NetworkModificationDialogProps } from '../../../graph/menus/network-modifications/network-modification-menu.type';
import { WithModificationId } from 'services/network-modification-types';
import { fetchEquipmentsIds, fetchHvdcLineWithShuntCompensators } from 'services/study/network-map';

export interface EquipmentDeletionDtoWithId extends EquipmentDeletionDto, WithModificationId {}

type EquipmentDeletionDialogProps = NetworkModificationDialogProps & {
    editData?: EquipmentDeletionDtoWithId;
    defaultIdValue?: UUID;
    equipmentType?: EquipmentType;
};

/**
 * Dialog to delete equipment from its type and ID.
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param currentRootNetworkUuid
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param defaultIdValue in creation mode, we can specify the equipment ID we want to delete
 * @param equipmentType in creation mode, we can specify the equipment type we want to delete
 * @param editDataFetchStatus indicates the status of fetching EditData
 * @param onClose a callback when dialog has been closed
 * @param onValidated a callback when dialog has been validated
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const EquipmentDeletionDialog = ({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    editData,
    isUpdate,
    defaultIdValue, // Used to pre-select an equipmentId when calling this dialog from the SLD/map
    equipmentType,
    editDataFetchStatus,
    onClose,
    onValidated,
    ...dialogProps
}: EquipmentDeletionDialogProps) => {
    const currentNodeUuid = currentNode?.id;

    const { snackError } = useSnackMessage();

    const formMethods = useForm<DeepNullable<EquipmentDeletionFormData>>({
        defaultValues: equipmentDeletionEmptyFormData,
        resolver: yupResolver<DeepNullable<EquipmentDeletionFormData>>(equipmentDeletionFormSchema),
    });

    const { reset } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (editData: EquipmentDeletionDto) => {
            const formData = equipmentDeletionDtoToForm(editData);
            reset({
                ...formData,
                equipmentInfos: null, // this prop will be computed (cf LCC specific part)
            });
        },
        [reset]
    );

    const presetTypeAndId = useCallback(
        (equipmentType: EquipmentType, equipmentId: UUID) => {
            reset({
                equipmentID: equipmentId,
                type: equipmentType,
                equipmentInfos: null,
            });
        },
        [reset]
    );

    const presetType = useCallback(
        (equipmentType: EquipmentType) => {
            reset({
                type: equipmentType,
            });
        },
        [reset]
    );

    useEffect(() => {
        if (editData) {
            // edition mode
            fromEditDataToFormValues(editData);
        } else if (equipmentType && defaultIdValue) {
            // creation mode with both Id and Type (ex: from diagram)
            presetTypeAndId(equipmentType, defaultIdValue);
        } else if (equipmentType) {
            // creation mode with only Type (ex: from node modifications menu)
            presetType(equipmentType);
        }
    }, [defaultIdValue, editData, equipmentType, fromEditDataToFormValues, presetType, presetTypeAndId]);

    const onSubmit = useCallback(
        (formData: EquipmentDeletionFormData) => {
            const dto = equipmentDeletionFormToDto(formData);
            deleteEquipment(studyUuid, currentNodeUuid, editData?.uuid, dto).catch((error: unknown) => {
                snackWithFallback(snackError, error, { headerId: 'UnableToDeleteEquipment' });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
    );

    const clear = useCallback(() => {
        reset(equipmentDeletionEmptyFormData);
    }, [reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const waitingForData = useMemo(
        () => isUpdate && editDataFetchStatus === FetchStatus.RUNNING,
        [editDataFetchStatus, isUpdate]
    );

    const fetchEquipmentIds = useCallback(
        (equipmentType: EquipmentType) =>
            fetchEquipmentsIds(studyUuid, currentNodeUuid, currentRootNetworkUuid, undefined, equipmentType, true),
        [studyUuid, currentNodeUuid, currentRootNetworkUuid]
    );

    const fetchHvdcWithShuntCompensators = useCallback(
        (hvdcLineId: UUID) =>
            fetchHvdcLineWithShuntCompensators(studyUuid, currentNodeUuid, currentRootNetworkUuid, hvdcLineId),
        [studyUuid, currentNodeUuid, currentRootNetworkUuid]
    );

    return (
        <CustomFormProvider validationSchema={equipmentDeletionFormSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onClose={onClose}
                onValidated={onValidated}
                onSave={onSubmit}
                titleId="DeleteEquipment"
                open={open}
                isDataFetching={waitingForData}
                {...dialogProps}
            >
                <EquipmentDeletionForm
                    editData={editData}
                    fetchEquipmentIds={fetchEquipmentIds}
                    fetchHvdcWithShuntCompensators={fetchHvdcWithShuntCompensators}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default EquipmentDeletionDialog;
