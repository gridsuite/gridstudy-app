/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { DELETION_SPECIFIC_DATA, EQUIPMENT_ID, TYPE } from '../../../utils/field-constants';
import {
    CustomFormProvider,
    DeepNullable,
    EquipmentType,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { useCallback, useEffect, useMemo } from 'react';
import { ModificationDialog } from '../../commons/modificationDialog';
import DeleteEquipmentForm from './equipment-deletion-form';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { deleteEquipment } from '../../../../services/study/network-modifications';
import { UUID } from 'node:crypto';
import { FetchStatus } from 'services/utils.type';
import { EquipmentDeletionInfos } from './equipement-deletion-dialog.type';
import { NetworkModificationDialogProps } from '../../../graph/menus/network-modifications/network-modification-menu.type';
import { getHvdcLccDeletionSchema } from './hvdc-lcc-deletion/hvdc-lcc-deletion-utils';

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().nullable().required(),
        [TYPE]: yup.mixed<EquipmentType>().oneOf(Object.values(EquipmentType)).nullable().required(),
        [DELETION_SPECIFIC_DATA]: getHvdcLccDeletionSchema(),
    })
    .required();

export type EquipmentDeletionFormInfos = yup.InferType<typeof formSchema>;

const emptyFormData: DeepNullable<EquipmentDeletionFormInfos> = {
    [EQUIPMENT_ID]: '',
    [TYPE]: null,
    [DELETION_SPECIFIC_DATA]: null,
};

type EquipmentDeletionDialogProps = NetworkModificationDialogProps & {
    editData?: EquipmentDeletionInfos;
    defaultIdValue?: UUID;
    equipmentType: EquipmentType;
    editDataFetchStatus?: FetchStatus;
};

/**
 * Dialog to delete equipment from its type and ID.
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param currentRootNetworkUuid
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param defaultIdValue the default equipment id
 * @param equipmentType
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

    const formMethods = useForm<DeepNullable<EquipmentDeletionFormInfos>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<EquipmentDeletionFormInfos>>(formSchema),
    });

    const { reset } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (editData: EquipmentDeletionInfos) => {
            reset({
                [TYPE]: editData.equipmentType,
                [EQUIPMENT_ID]: editData.equipmentId,
                [DELETION_SPECIFIC_DATA]: null,
            });
        },
        [reset]
    );

    const fromMenuDataValues = useCallback(
        (menuSelectId: UUID) => {
            reset({
                [TYPE]: EquipmentType.HVDC_LINE,
                [EQUIPMENT_ID]: menuSelectId,
                [DELETION_SPECIFIC_DATA]: null,
            });
        },
        [reset]
    );

    const resetFormWithEquipmentType = useCallback(
        (equipmentType: EquipmentType) => {
            reset({
                [TYPE]: equipmentType,
            });
        },
        [reset]
    );

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        } else if (defaultIdValue) {
            fromMenuDataValues(defaultIdValue);
        } else if (equipmentType) {
            resetFormWithEquipmentType(equipmentType);
        }
    }, [
        fromEditDataToFormValues,
        editData,
        fromMenuDataValues,
        defaultIdValue,
        equipmentType,
        resetFormWithEquipmentType,
    ]);

    const onSubmit = useCallback(
        (formData: EquipmentDeletionFormInfos) => {
            deleteEquipment({
                studyUuid,
                nodeUuid: currentNodeUuid,
                uuid: editData?.uuid,
                equipmentId: formData[EQUIPMENT_ID] as UUID,
                equipmentType: formData[TYPE],
                equipmentSpecificInfos: formData[DELETION_SPECIFIC_DATA] ?? undefined,
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'UnableToDeleteEquipment' });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
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

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
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
                <DeleteEquipmentForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    editData={editData}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default EquipmentDeletionDialog;
