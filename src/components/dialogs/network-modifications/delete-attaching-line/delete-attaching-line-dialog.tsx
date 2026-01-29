/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CustomFormProvider,
    FetchStatus,
    FORM_LOADING_DELAY,
    ModificationDialog,
    NetworkModificationData,
    snackWithFallback,
    useOpenShortWaitFetching,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    ATTACHED_LINE_ID,
    LINE_TO_ATTACH_TO_1_ID,
    LINE_TO_ATTACH_TO_2_ID,
    REPLACING_LINE_1_ID,
    REPLACING_LINE_1_NAME,
} from 'components/utils/field-constants';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { sanitizeString } from '../../dialog-utils';
import yup from 'components/utils/yup-config';
import DeleteAttachingLineForm from './delete-attaching-line-form';
import { deleteAttachingLine } from '../../../../services/study/network-modifications';
import DeleteAttachingLineIllustration from './delete-attaching-line-illustration';
import { CurrentTreeNode } from 'components/graph/tree-node.type';
import { UUID } from 'node:crypto';

interface DeleteAttachingLineFormData {
    [ATTACHED_LINE_ID]: string;
    [LINE_TO_ATTACH_TO_1_ID]: string;
    [LINE_TO_ATTACH_TO_2_ID]: string;
    [REPLACING_LINE_1_ID]: string;
    [REPLACING_LINE_1_NAME]?: string;
}

interface DeleteAttachingLineDialogProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    editData?: NetworkModificationData;
    isUpdate: boolean;
    editDataFetchStatus: string;
    onClose: () => void;
    onValidated?: () => void;
}

const emptyFormData: DeleteAttachingLineFormData = {
    [ATTACHED_LINE_ID]: '',
    [LINE_TO_ATTACH_TO_1_ID]: '',
    [LINE_TO_ATTACH_TO_2_ID]: '',
    [REPLACING_LINE_1_ID]: '',
    [REPLACING_LINE_1_NAME]: '',
};

const formSchema = yup
    .object()
    .shape({
        [ATTACHED_LINE_ID]: yup.string().nullable().required(),
        [LINE_TO_ATTACH_TO_1_ID]: yup.string().nullable().required(),
        [LINE_TO_ATTACH_TO_2_ID]: yup.string().nullable().required(),
        [REPLACING_LINE_1_ID]: yup.string().required(),
        [REPLACING_LINE_1_NAME]: yup.string(),
    })
    .required();

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

    const formMethods = useForm<DeleteAttachingLineFormData>({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset } = formMethods;

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const fromEditDataToFormValues = useCallback(
        (editData: NetworkModificationData) => {
            reset({
                [ATTACHED_LINE_ID]: editData.attachedLineId,
                [LINE_TO_ATTACH_TO_1_ID]: editData.lineToAttachTo1Id,
                [LINE_TO_ATTACH_TO_2_ID]: editData.lineToAttachTo2Id,
                [REPLACING_LINE_1_ID]: editData.replacingLine1Id,
                [REPLACING_LINE_1_NAME]: editData.replacingLine1Name ?? '',
            });
        },
        [reset]
    );

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const onSubmit = useCallback(
        (formData: DeleteAttachingLineFormData) => {
            deleteAttachingLine({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData ? editData.uuid : undefined,
                lineToAttachTo1Id: formData[LINE_TO_ATTACH_TO_1_ID],
                lineToAttachTo2Id: formData[LINE_TO_ATTACH_TO_2_ID],
                attachedLineId: formData[ATTACHED_LINE_ID],
                replacingLine1Id: formData[REPLACING_LINE_1_ID],
                replacingLine1Name: sanitizeString(formData[REPLACING_LINE_1_NAME] ?? ''),
            }).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'DeleteAttachingLineError' });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
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
                <DeleteAttachingLineForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default DeleteAttachingLineDialog;
