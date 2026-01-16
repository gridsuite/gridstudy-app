/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { DELETION_SPECIFIC_DATA, EQUIPMENT_ID, TYPE } from '../../../utils/field-constants';
import { CustomFormProvider, EquipmentType, snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { useCallback, useEffect } from 'react';
import { ModificationDialog } from '../../commons/modificationDialog';
import DeleteEquipmentForm from './equipment-deletion-form';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { deleteEquipment } from '../../../../services/study/network-modifications';
import { UUID } from 'node:crypto';
import { CurrentTreeNode } from 'components/graph/tree-node.type';
import { FetchStatus } from 'services/utils.type';
import { DeepNullable } from 'components/utils/ts-utils';
import { EquipmentDeletionInfos } from './equipement-deletion-dialog.type';

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().nullable().required(),
        [TYPE]: yup.mixed<EquipmentType>().oneOf(Object.values(EquipmentType)).nullable().required(),
        [DELETION_SPECIFIC_DATA]: yup.string().nullable(),
    })
    .required();

export type EquipmentDeletionFormInfos = yup.InferType<typeof formSchema>;

const emptyFormData: EquipmentDeletionFormInfos = {
    [EQUIPMENT_ID]: '',
    [TYPE]: EquipmentType.SUBSTATION,
    [DELETION_SPECIFIC_DATA]: null,
};

interface EquipmentDeletionDialogProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    editData?: EquipmentDeletionInfos;
    isUpdate: boolean;
    defaultIdValue?: UUID;
    equipmentType: EquipmentType;
    editDataFetchStatus?: FetchStatus;
    onClose?: () => void;
}

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
 * @param onClose a callback when dialog has closed
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
            if (formData[EQUIPMENT_ID]) {
                deleteEquipment({
                    studyUuid,
                    nodeUuid: currentNodeUuid,
                    uuid: editData?.uuid,
                    equipmentId: formData[EQUIPMENT_ID] as UUID,
                    equipmentType: formData[TYPE],
                    equipmentSpecificInfos: formData[DELETION_SPECIFIC_DATA],
                }).catch((error) => {
                    snackWithFallback(snackError, error, { headerId: 'UnableToDeleteEquipment' });
                });
            }
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

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onClose={onClose}
                onSave={onSubmit}
                titleId="DeleteEquipment"
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
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
