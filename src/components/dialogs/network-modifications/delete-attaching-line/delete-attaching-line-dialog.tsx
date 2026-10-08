/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CustomFormProvider,
    DeleteAttachingLineDto,
    deleteAttachingLineDtoToForm,
    deleteAttachingLineEmptyFormData,
    DeleteAttachingLineForm,
    deleteAttachingLineFormSchema,
    DeleteAttachingLineFormData,
    deleteAttachingLineFormToDto,
    DeleteAttachingLineIllustration,
    EquipmentType,
    Option,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ModificationDialog } from '../../commons/modificationDialog';
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form';
import { deleteAttachingLine } from '../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../services/utils';
import { fetchEquipmentsIds } from '../../../../services/study/network-map';
import { CurrentTreeNode } from 'components/graph/tree-node.type';
import { UUID } from 'node:crypto';

interface DeleteAttachingLineDialogProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    editData?: DeleteAttachingLineDto;
    isUpdate: boolean;
    editDataFetchStatus: string;
    onClose: () => void;
    onValidated?: () => void;
}

/**
 * Dialog to delete attaching line.
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param currentRootNetworkUuid The root network uuid we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const DeleteAttachingLineDialog = ({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    editData,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: DeleteAttachingLineDialogProps) => {
    const currentNodeUuid = currentNode?.id;

    const { snackError } = useSnackMessage();

    const [linesOptions, setLinesOptions] = useState<Option[]>([]);

    const formMethods = useForm<DeleteAttachingLineFormData>({
        defaultValues: deleteAttachingLineEmptyFormData,
        resolver: yupResolver(deleteAttachingLineFormSchema),
    });

    const { reset } = formMethods;

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    useEffect(() => {
        if (editData) {
            reset(deleteAttachingLineDtoToForm(editData));
        }
    }, [editData, reset]);

    useEffect(() => {
        fetchEquipmentsIds(studyUuid, currentNode.id, currentRootNetworkUuid, [], EquipmentType.LINE, true)
            .then((values: string[]) => setLinesOptions(values.toSorted((a, b) => a.localeCompare(b))))
            .catch((error: unknown) => {
                snackWithFallback(snackError, error, { headerId: 'DeleteAttachingLineError' });
                setLinesOptions([]);
            });
    }, [studyUuid, currentNode.id, currentRootNetworkUuid, snackError]);

    const onSubmit = useCallback(
        (formData: DeleteAttachingLineFormData) => {
            const dto = deleteAttachingLineFormToDto(formData);
            deleteAttachingLine(studyUuid, currentNodeUuid, editData?.uuid, dto).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'DeleteAttachingLineError' });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
    );

    const clear = useCallback(() => {
        reset(deleteAttachingLineEmptyFormData);
    }, [reset]);

    return (
        <CustomFormProvider validationSchema={deleteAttachingLineFormSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                subtitle={<DeleteAttachingLineIllustration />}
                onClear={clear}
                onSave={onSubmit}
                titleId="DeleteAttachingLine"
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <DeleteAttachingLineForm lineOptions={linesOptions} />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default DeleteAttachingLineDialog;
