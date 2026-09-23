/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    CustomFormProvider,
    DeleteVoltageLevelOnLineForm,
    DeleteVoltageLevelOnLineFormData,
    DeleteVoltageLevelOnLineIllustration,
    deleteVoltageLevelOnLineEmptyFormData,
    deleteVoltageLevelOnLineFormSchema,
    EquipmentType,
    Option,
    sanitizeString,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import {
    LINE_TO_ATTACH_TO_1_ID,
    LINE_TO_ATTACH_TO_2_ID,
    REPLACING_LINE_1_ID,
    REPLACING_LINE_1_NAME,
} from 'components/utils/field-constants';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ModificationDialog } from '../../commons/modificationDialog';
import { deleteVoltageLevelOnLine } from '../../../../services/study/network-modifications';
import { fetchEquipmentsIds } from '../../../../services/study/network-map';
import { FetchStatus } from '../../../../services/utils';
import { UUID } from 'node:crypto';
import { CurrentTreeNode } from '../../../graph/tree-node.type';

interface DeleteVoltageLevelOnLineDialogProps {
    studyUuid: UUID;
    currentNode: CurrentTreeNode;
    currentRootNetworkUuid: UUID;
    editData?: {
        uuid: UUID;
        [LINE_TO_ATTACH_TO_1_ID]: string | null;
        [LINE_TO_ATTACH_TO_2_ID]: string | null;
        [REPLACING_LINE_1_ID]: string;
        [REPLACING_LINE_1_NAME]: string;
    };
    isUpdate: boolean;
    editDataFetchStatus?: string;
}

/**
 * Dialog to delete a voltage level on a line
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param currentRootNetworkUuid The root network uuid we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const DeleteVoltageLevelOnLineDialog = ({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    editData,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: DeleteVoltageLevelOnLineDialogProps) => {
    const currentNodeUuid = currentNode?.id;

    const { snackError } = useSnackMessage();

    const [linesOptions, setLinesOptions] = useState<Option[]>([]);

    const formMethods = useForm({
        defaultValues: deleteVoltageLevelOnLineEmptyFormData,
        resolver: yupResolver(deleteVoltageLevelOnLineFormSchema),
    });

    const { reset } = formMethods;

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    useEffect(() => {
        fetchEquipmentsIds(studyUuid, currentNodeUuid, currentRootNetworkUuid, [], EquipmentType.LINE, true).then(
            (values) => {
                setLinesOptions(
                    values
                        .sort((a: string, b: string) => a.localeCompare(b))
                        .map((value: string) => {
                            return { id: value };
                        })
                );
            }
        );
    }, [studyUuid, currentNodeUuid, currentRootNetworkUuid]);

    const fromEditDataToFormValues = useCallback(
        (editData: DeleteVoltageLevelOnLineFormData) => {
            reset({
                [LINE_TO_ATTACH_TO_1_ID]: editData.lineToAttachTo1Id,
                [LINE_TO_ATTACH_TO_2_ID]: editData.lineToAttachTo2Id,
                [REPLACING_LINE_1_ID]: editData.replacingLine1Id,
                [REPLACING_LINE_1_NAME]: editData.replacingLine1Name,
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
        (formData: DeleteVoltageLevelOnLineFormData) => {
            if (formData[LINE_TO_ATTACH_TO_1_ID] && formData[LINE_TO_ATTACH_TO_2_ID]) {
                deleteVoltageLevelOnLine(
                    studyUuid,
                    currentNodeUuid,
                    editData ? editData.uuid : undefined,
                    formData[LINE_TO_ATTACH_TO_1_ID],
                    formData[LINE_TO_ATTACH_TO_2_ID],
                    formData[REPLACING_LINE_1_ID],
                    sanitizeString(formData[REPLACING_LINE_1_NAME])
                ).catch((error) => {
                    snackWithFallback(snackError, error, { headerId: 'DeleteVoltageLevelOnLineError' });
                });
            }
        },
        [currentNodeUuid, editData, snackError, studyUuid]
    );

    const clear = useCallback(() => {
        reset(deleteVoltageLevelOnLineEmptyFormData);
    }, [reset]);

    return (
        <CustomFormProvider validationSchema={deleteVoltageLevelOnLineFormSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onSave={onSubmit}
                titleId="DeleteVoltageLevelOnLine"
                subtitle={<DeleteVoltageLevelOnLineIllustration />}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <DeleteVoltageLevelOnLineForm lineOptions={linesOptions} />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default DeleteVoltageLevelOnLineDialog;
